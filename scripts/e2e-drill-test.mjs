/**
 * Drill feature E2E test using Playwright
 * Tests: navigation, answering questions, score, restart, review page
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'

const BASE = 'http://localhost:5173'
let passed = 0
let failed = 0

function ok(label) {
  console.log(`  ✓ ${label}`)
  passed++
}

function fail(label, detail = '') {
  console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`)
  failed++
}

async function assert(label, fn) {
  try {
    await fn()
    ok(label)
  } catch (e) {
    fail(label, e.message)
  }
}

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()
page.on('pageerror', (err) => console.error('  [page error]', err.message))

// ── 1. トップページからドリルへのリンク ──────────────────────────────
console.log('\n[1] トップページ → ドリルリンク')
await page.goto(BASE + '/')
await assert('h1 が表示される', async () => {
  await page.waitForSelector('h1')
})
await assert('"ドリル" テキストがナビバーに存在する', async () => {
  const nav = await page.locator('.VPNavBarMenu').textContent()
  if (!nav.includes('ドリル')) throw new Error(`nav text: ${nav}`)
})
await assert('"ドリル一覧へ" リンクが存在する', async () => {
  await page.waitForSelector('a[href="/quiz/"]')
})

// ── 2. ドリルトップページ ──────────────────────────────────────────
console.log('\n[2] ドリルトップ (/quiz/)')
await page.goto(BASE + '/quiz/')
await page.waitForSelector('.quiz-top', { timeout: 8000 })
await assert('h1 が "ドリル" を含む', async () => {
  const h1 = await page.locator('h1').textContent()
  if (!h1.includes('ドリル')) throw new Error(h1)
})
await assert('章カードが 7 枚ある', async () => {
  const cards = await page.locator('.chapter-card').count()
  if (cards !== 7) throw new Error(`count=${cards}`)
})
await assert('"ランダム出題" ボタンがある', async () => {
  await page.waitForSelector('a[href="/quiz/random/"]')
})
await assert('"間違えた問題を復習" ボタンがある', async () => {
  await page.waitForSelector('a[href="/quiz/review/"]')
})

// ── 3. 1章ドリル: 正解フロー ──────────────────────────────────────
console.log('\n[3] 1章ドリル — 正解フロー')
await page.goto(BASE + '/quiz/chapter1/')
await page.waitForSelector('.quiz-card', { timeout: 8000 })

await assert('問題文が表示される', async () => {
  const q = await page.locator('.quiz-question').textContent()
  if (!q || q.trim().length === 0) throw new Error('empty question')
})
await assert('選択肢が 4 つある', async () => {
  const choices = await page.locator('.choice').count()
  if (choices !== 4) throw new Error(`count=${choices}`)
})
await assert('"次の問題" ボタンは回答前に非表示', async () => {
  const btn = await page.locator('.btn-next').count()
  if (btn !== 0) throw new Error('button visible before answering')
})

// 正解の選択肢を特定してクリック
const answerIndex = await page.evaluate(() => {
  // VitePress の __vue_app__ から現在の問題の answer を取得するのは難しいため、
  // 正解ボタンは data-correct="true" を発火後に持つことを前提に
  // まず最初の選択肢をクリック
  return 0
})
await page.locator('.choice').first().click()
await page.waitForSelector('.quiz-result', { timeout: 3000 })

await assert('回答後に解説が表示される', async () => {
  const expl = await page.locator('.quiz-explanation').textContent()
  if (!expl || expl.trim().length === 0) throw new Error('empty explanation')
})
await assert('正解/不正解バッジが表示される', async () => {
  const badge = await page.locator('.result-badge').textContent()
  if (!badge.includes('正解') && !badge.includes('不正解')) throw new Error(badge)
})
await assert('選択肢がすべて disabled になる', async () => {
  const choices = await page.locator('.choice')
  const count = await choices.count()
  for (let i = 0; i < count; i++) {
    const disabled = await choices.nth(i).isDisabled()
    if (!disabled) throw new Error(`choice ${i} is not disabled`)
  }
})
await assert('"次の問題" ボタンが出現する', async () => {
  await page.waitForSelector('.btn-next', { timeout: 2000 })
})

// ── 4. 次の問題への遷移: 状態リセット確認 ──────────────────────────
console.log('\n[4] 次の問題への遷移')
await page.locator('.btn-next').click()
await page.waitForFunction(() => !document.querySelector('.quiz-result'), { timeout: 3000 })

await assert('遷移後に .quiz-result が非表示（前の回答状態がリセットされる）', async () => {
  const result = await page.locator('.quiz-result').count()
  if (result !== 0) throw new Error('quiz-result still visible after next')
})
await assert('遷移後に選択肢がすべて enabled', async () => {
  const choices = await page.locator('.choice')
  const count = await choices.count()
  for (let i = 0; i < count; i++) {
    const disabled = await choices.nth(i).isDisabled()
    if (disabled) throw new Error(`choice ${i} still disabled`)
  }
})
await assert('プログレスバーのテキストが "1 / N 問回答済み" になっている', async () => {
  const text = await page.locator('.quiz-progress-text').textContent()
  if (!text.startsWith('1 /')) throw new Error(text)
})

// ── 5. 全問を回答して結果画面に到達 ──────────────────────────────────
console.log('\n[5] 最短ルートで全問回答 → 結果画面')
// chapter1 は 37 問。残り 36 問を高速回答（常に最初の選択肢）
let safetyCount = 0
while (safetyCount < 50) {
  const finishEl = await page.locator('.quiz-finish').count()
  if (finishEl > 0) break
  const cardEl = await page.locator('.quiz-card').count()
  if (cardEl === 0) break

  // 未回答なら回答する
  const resultEl = await page.locator('.quiz-result').count()
  if (resultEl === 0) {
    await page.locator('.choice').first().click()
    await page.waitForSelector('.quiz-result', { timeout: 3000 })
  }

  // 最後の問題なら「結果を見る」、それ以外は「次の問題」
  const btnText = await page.locator('.btn-next').textContent()
  await page.locator('.btn-next').click()
  if (btnText.includes('結果を見る')) break
  await page.waitForFunction(() => !document.querySelector('.quiz-result'), { timeout: 3000 })
  safetyCount++
}

await assert('結果画面が表示される', async () => {
  await page.waitForSelector('.quiz-finish', { timeout: 5000 })
})
await assert('スコア表示がある', async () => {
  const score = await page.locator('.finish-score').textContent()
  if (!score.includes('問正解')) throw new Error(score)
})
await assert('正答率表示がある', async () => {
  const rate = await page.locator('.finish-rate').textContent()
  if (!rate.includes('%')) throw new Error(rate)
})
await assert('問題リストが表示される（○/× が含まれる）', async () => {
  const marks = await page.locator('.finish-row-mark').allTextContents()
  const valid = marks.every((m) => m === '○' || m === '×')
  if (!valid) throw new Error(`marks: ${marks.join(', ')}`)
})
await assert('"もう一度挑戦" ボタンがある', async () => {
  await page.waitForSelector('.btn-restart')
})

// ── 6. もう一度挑戦 (restart) ──────────────────────────────────────
console.log('\n[6] もう一度挑戦')
await page.locator('.btn-restart').click()
await page.waitForSelector('.quiz-card', { timeout: 3000 })

await assert('restart 後に quiz-card が再表示される', async () => {
  const card = await page.locator('.quiz-card').count()
  if (card === 0) throw new Error('quiz-card not found after restart')
})
await assert('restart 後に選択肢がすべて enabled', async () => {
  const choices = await page.locator('.choice')
  const count = await choices.count()
  for (let i = 0; i < count; i++) {
    const disabled = await choices.nth(i).isDisabled()
    if (disabled) throw new Error(`choice ${i} disabled after restart`)
  }
})
await assert('restart 後にプログレスが 0 問回答済みに戻る', async () => {
  const text = await page.locator('.quiz-progress-text').textContent()
  if (!text.startsWith('0 /')) throw new Error(text)
})

// ── 7. ランダム出題ページ ──────────────────────────────────────────
console.log('\n[7] ランダム出題 (/quiz/random/)')
await page.goto(BASE + '/quiz/random/')
await page.waitForSelector('.quiz-card', { timeout: 8000 })
await assert('quiz-card が表示される', async () => {
  const card = await page.locator('.quiz-card').count()
  if (card === 0) throw new Error('no quiz-card')
})
await assert('合計 300 問のプログレステキストになっている', async () => {
  const text = await page.locator('.quiz-progress-text').textContent()
  if (!text.includes('300')) throw new Error(text)
})

// ── 8. 復習ページ (まだ間違いなし) ──────────────────────────────────
console.log('\n[8] 復習ページ — 初回（間違いなし想定）')
// chapter1 を正解した記録が localStorage にあるが間違いは 0 問以上ある想定
await page.goto(BASE + '/quiz/review/')
await page.waitForSelector('.review-empty, .quiz-card', { timeout: 8000 })
// どちらのケースでも正常とみなす
const hasEmpty = await page.locator('.review-empty').count()
const hasCard = await page.locator('.quiz-card').count()
await assert('review ページが表示される（空状態か問題表示のどちらか）', async () => {
  if (hasEmpty === 0 && hasCard === 0) throw new Error('neither empty nor card found')
})

// ── 9. サイドバーのドリルセクション ──────────────────────────────────
console.log('\n[9] ナビゲーション')
await page.goto(BASE + '/quiz/chapter1/')
await page.waitForSelector('.quiz-card', { timeout: 8000 })
await assert('ページタイトルが "ドリル" を含む', async () => {
  const title = await page.title()
  if (!title.includes('ドリル')) throw new Error(title)
})

// ── 10. 過去の結果セクション: 回答後に表示 ───────────────────────────
console.log('\n[10] 過去の結果セクション')
// chapter2 は未回答のはずなので previousResults = null → 非表示
await page.goto(BASE + '/quiz/chapter2/')
await page.waitForSelector('.quiz-card', { timeout: 8000 })
await assert('未回答チャプターでは "過去の結果" が非表示', async () => {
  // chapter2 は今回のセッションで回答していないのでストレージに入っていないはず
  // （chapter1 は上のテストで入れた）
  const prev = await page.locator('.quiz-prev-results').count()
  if (prev !== 0) throw new Error('"過去の結果" が表示されている')
})

// chapter1 に戻ると過去の結果が表示されるはず（上のテストで全問回答済み）
await page.goto(BASE + '/quiz/chapter1/')
await page.waitForSelector('.quiz-card', { timeout: 8000 })
await assert('回答済みチャプターでは "過去の結果" が表示される', async () => {
  await page.waitForSelector('.quiz-prev-results', { timeout: 3000 })
})

// ── 結果サマリー ─────────────────────────────────────────────────
await browser.close()
console.log(`\n${'─'.repeat(50)}`)
console.log(`結果: ${passed} 通過 / ${failed} 失敗`)
if (failed > 0) process.exit(1)
