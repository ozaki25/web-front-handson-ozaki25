/**
 * Drill feature E2E test using Playwright
 * Tests: navigation, answering questions, score, restart, review page,
 *        localStorage persistence, stats, shuffle, accessibility, keyboard, titles
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

// Helper: answer all questions in current chapter until result screen
async function answerAllQuestions(page, maxQuestions = 100) {
  let count = 0
  while (count < maxQuestions) {
    const finishEl = await page.locator('.quiz-finish').count()
    if (finishEl > 0) break
    const cardEl = await page.locator('.quiz-card').count()
    if (cardEl === 0) break

    const resultEl = await page.locator('.quiz-result').count()
    if (resultEl === 0) {
      await page.locator('.choice').first().click()
      await page.waitForSelector('.quiz-result', { timeout: 5000 })
    }

    const btnText = await page.locator('.btn-next').textContent()
    await page.locator('.btn-next').click()
    if (btnText.includes('結果を見る')) break
    await page.waitForFunction(() => !document.querySelector('.quiz-result'), { timeout: 5000 })
    count++
  }
}

const browser = await chromium.launch({ headless: true })

// ── 1. トップページからドリルへのリンク ──────────────────────────────
console.log('\n[1] トップページ → ドリルリンク')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
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
  await ctx.close()
}

// ── 2. ドリルトップページ ──────────────────────────────────────────
console.log('\n[2] ドリルトップ (/quiz/)')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
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
  await ctx.close()
}

// ── 3. 1章ドリル: 正解フロー ──────────────────────────────────────
console.log('\n[3] 1章ドリル — 正解フロー')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
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

  await page.locator('.choice').first().click()
  await page.waitForSelector('.quiz-result', { timeout: 5000 })

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
  await ctx.close()
}

// ── 4. 次の問題への遷移: 状態リセット確認 ──────────────────────────
console.log('\n[4] 次の問題への遷移')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await page.locator('.choice').first().click()
  await page.waitForSelector('.quiz-result', { timeout: 5000 })
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
  await ctx.close()
}

// ── 5. 全問を回答して結果画面に到達 ──────────────────────────────────
console.log('\n[5] 最短ルートで全問回答 → 結果画面')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await answerAllQuestions(page, 50)

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
  await ctx.close()
}

// ── 6. もう一度挑戦 (restart) ──────────────────────────────────────
console.log('\n[6] もう一度挑戦')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await answerAllQuestions(page, 50)
  await page.waitForSelector('.quiz-finish', { timeout: 5000 })
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
  await ctx.close()
}

// ── 7. ランダム出題ページ ──────────────────────────────────────────
console.log('\n[7] ランダム出題 (/quiz/random/)')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
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
  await ctx.close()
}

// ── 8. 復習ページ (まだ間違いなし) ──────────────────────────────────
console.log('\n[8] 復習ページ — 初回（間違いなし想定）')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(BASE + '/quiz/review/')
  await page.waitForSelector('.review-empty, .quiz-card', { timeout: 8000 })
  const hasEmpty = await page.locator('.review-empty').count()
  const hasCard = await page.locator('.quiz-card').count()
  await assert('review ページが表示される（空状態か問題表示のどちらか）', async () => {
    if (hasEmpty === 0 && hasCard === 0) throw new Error('neither empty nor card found')
  })
  await ctx.close()
}

// ── 9. サイドバーのドリルセクション ──────────────────────────────────
console.log('\n[9] ナビゲーション')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await assert('ページタイトルが "ドリル" を含む', async () => {
    const title = await page.title()
    if (!title.includes('ドリル')) throw new Error(title)
  })
  await ctx.close()
}

// ── 10. 過去の結果セクション: 回答後に表示 ───────────────────────────
console.log('\n[10] 過去の結果セクション')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))

  // chapter2 は未回答なので過去の結果が非表示
  await page.goto(BASE + '/quiz/chapter2/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await assert('未回答チャプターでは "過去の結果" が非表示', async () => {
    const prev = await page.locator('.quiz-prev-results').count()
    if (prev !== 0) throw new Error('"過去の結果" が表示されている')
  })

  // chapter1 を全問回答してから過去の結果を確認
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await answerAllQuestions(page, 50)
  await page.waitForSelector('.quiz-finish', { timeout: 5000 })

  // chapter1 に再度アクセス → quiz-finish 後は .quiz-prev-results が表示されない
  // (finished=true のとき非表示なので、restart してから確認)
  await page.locator('.btn-restart').click()
  await page.waitForSelector('.quiz-card', { timeout: 3000 })
  await assert('回答済みチャプターでは "過去の結果" が表示される', async () => {
    await page.waitForSelector('.quiz-prev-results', { timeout: 3000 })
  })
  await ctx.close()
}

// ── 11. localStorage の永続化 ─────────────────────────────────────
console.log('\n[11] localStorage の永続化')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))

  // chapter1 で 1 問回答して localStorage にデータを入れる
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await page.locator('.choice').first().click()
  await page.waitForSelector('.quiz-result', { timeout: 5000 })

  // localStorage に値が入ったことを確認
  const storedBeforeReload = await page.evaluate(() => localStorage.getItem('quiz-answers'))
  const parsedBefore = JSON.parse(storedBeforeReload || '{}')
  const keysBefore = Object.keys(parsedBefore)

  await assert('回答後 localStorage に記録が入る', async () => {
    if (keysBefore.length === 0) throw new Error('localStorage empty after answering')
  })

  // ページリロード
  await page.reload()
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  const storedAfterReload = await page.evaluate(() => localStorage.getItem('quiz-answers'))
  const parsedAfter = JSON.parse(storedAfterReload || '{}')
  const keysAfter = Object.keys(parsedAfter)

  await assert('リロード後も localStorage の記録が保持される', async () => {
    if (keysAfter.length !== keysBefore.length) {
      throw new Error(`before=${keysBefore.length}, after=${keysAfter.length}`)
    }
    for (const k of keysBefore) {
      if (parsedAfter[k] === undefined) throw new Error(`key ${k} lost after reload`)
    }
  })

  // 別の章に移動して戻っても保持
  await page.goto(BASE + '/quiz/chapter2/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  const storedAfterNav = await page.evaluate(() => localStorage.getItem('quiz-answers'))
  const parsedAfterNav = JSON.parse(storedAfterNav || '{}')

  await assert('別章へ移動して戻っても localStorage の記録が保持される', async () => {
    for (const k of keysBefore) {
      if (parsedAfterNav[k] === undefined) throw new Error(`key ${k} lost after navigation`)
    }
  })

  await ctx.close()
}

// ── 12. QuizTop の統計表示 ────────────────────────────────────────
console.log('\n[12] QuizTop 統計表示')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))

  // まず /quiz/ トップの初期状態を確認
  await page.goto(BASE + '/quiz/')
  await page.waitForSelector('.quiz-top', { timeout: 8000 })
  const initialAnsweredText = await page.locator('.summary-value').first().textContent()
  const initialAnswered = parseInt(initialAnsweredText?.split('/')[0]?.trim() || '0', 10)

  // chapter6 で 1 問だけ回答（localstorage 直接書き込みで確実に）
  // 正規のフローで chapter6 の 1 問目に回答
  await page.goto(BASE + '/quiz/chapter6/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await page.locator('.choice').first().click()
  await page.waitForSelector('.quiz-result', { timeout: 5000 })

  // /quiz/ トップに戻る
  await page.goto(BASE + '/quiz/')
  await page.waitForSelector('.quiz-top', { timeout: 8000 })

  const afterAnsweredText = await page.locator('.summary-value').first().textContent()
  const afterAnswered = parseInt(afterAnsweredText?.split('/')[0]?.trim() || '0', 10)

  await assert('回答後にトップの "回答済み" カウントが増える', async () => {
    if (afterAnswered <= initialAnswered) {
      throw new Error(`before=${initialAnswered}, after=${afterAnswered}`)
    }
  })

  // chapter6 カードの進捗バーが 0% でなくなること
  // chapter6 は7番目（index 5）のカード
  const cards = await page.locator('.chapter-card').all()
  let chapter6Bar = null
  for (const card of cards) {
    const text = await card.textContent()
    if (text.includes('ブラウザの仕組み')) {
      chapter6Bar = card.locator('.chapter-bar')
      break
    }
  }

  await assert('chapter6 カードの進捗バーが 0% でなくなる', async () => {
    if (!chapter6Bar) throw new Error('chapter6 card not found')
    const style = await chapter6Bar.getAttribute('style')
    if (!style || style.includes('width: 0%')) throw new Error(`bar style: ${style}`)
  })

  await ctx.close()
}

// ── 13. 復習ページ（review）に間違いが入るケース ─────────────────────
console.log('\n[13] 復習ページ — 間違い問題の表示')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))

  // chapter6 の全問題ID を取得してすべて不正解で localStorage に書き込む
  // chapter6 は q問題のIDを直接書き込む（q001などの形式は不明なので quiz page経由で取得）
  // まず chapter6 ページを開いて問題IDを取得
  await page.goto(BASE + '/quiz/chapter6/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  // Vue コンポーネントから問題数を確認（プログレステキストから）
  const progressText = await page.locator('.quiz-progress-text').textContent()
  const totalMatch = progressText.match(/\/\s*(\d+)/)
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 13

  // chapter6 の全問を localStorage に不正解として書き込む
  // QuizPage の quizzes から id を取得するには JS 実行
  await page.evaluate((total) => {
    const existing = JSON.parse(localStorage.getItem('quiz-answers') || '{}')
    // chapter6 の問題ID は連番。data から特定できないため
    // page の Vue インスタンスから取得を試みる
    // 代替: quiz-card の data 属性や DOM から取得するのが確実
    return total
  }, total)

  // 実際に全問回答（最初の選択肢を選んで間違えることを想定しないため、
  // localStorage へ直接書き込む）
  // QuizPage の orderedQuizzes を JavaScript 経由で取得
  // VitePress の SPA なので Vue app から取得できる場合がある
  // 確実な方法: 全問を最初の選択肢でクリックして答えてから、
  // 正解でないものを不正解として確認する

  // より確実な方法: localStorage を直接操作
  // chapter6 の問題は 13 問で ID は quiz data から来るので
  // まず全問に回答して、その後 localStorage を確認して不正解に書き換える
  await page.evaluate(() => localStorage.clear())

  // chapter6 全問を素早く回答
  await page.goto(BASE + '/quiz/chapter6/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await answerAllQuestions(page, 20)
  await page.waitForSelector('.quiz-finish', { timeout: 5000 })

  // 回答後の localStorage を取得して全問を不正解に書き換える
  const stored = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('quiz-answers') || '{}')
    return data
  })
  const keys = Object.keys(stored)

  await assert('chapter6 全 13 問が localStorage に記録される', async () => {
    if (keys.length !== 13) throw new Error(`recorded=${keys.length}, expected=13`)
  })

  // 全問を不正解に書き換える
  await page.evaluate((keys) => {
    const data = {}
    for (const k of keys) {
      data[k] = { correct: false, ts: Date.now() }
    }
    localStorage.setItem('quiz-answers', JSON.stringify(data))
  }, keys)

  // /quiz/review/ を開く
  await page.goto(BASE + '/quiz/review/')
  await page.waitForSelector('.review-empty, .quiz-card', { timeout: 8000 })

  await assert('/quiz/review/ で quiz-card が表示される（空でない）', async () => {
    const cardCount = await page.locator('.quiz-card').count()
    if (cardCount === 0) throw new Error('quiz-card not found — review is empty')
  })

  await assert('復習の問題数が 13 問である（プログレステキスト）', async () => {
    const text = await page.locator('.quiz-progress-text').textContent()
    if (!text.includes('13')) throw new Error(`progress text: ${text}`)
  })

  // 復習で全問回答して結果画面を確認
  await answerAllQuestions(page, 20)

  await assert('復習全問回答後に結果画面が表示される', async () => {
    await page.waitForSelector('.quiz-finish', { timeout: 5000 })
  })

  await ctx.close()
}

// ── 14. シャッフルの再実行 ────────────────────────────────────────
console.log('\n[14] シャッフルの再実行')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))

  // まずページを読み込んでから localStorage を操作する
  await page.goto(BASE + '/quiz/random/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  // 5回試みて1回でも異なる順序が出ればOK
  let shuffleTestPassed = false
  for (let attempt = 0; attempt < 5; attempt++) {
    // 最初の問題文を記録
    const firstQuestion1 = await page.locator('.quiz-question').textContent()

    // ページをリロードして再シャッフル
    await page.evaluate(() => localStorage.clear())
    await page.goto(BASE + '/quiz/random/')
    await page.waitForSelector('.quiz-card', { timeout: 8000 })

    const firstQuestion2 = await page.locator('.quiz-question').textContent()

    if (firstQuestion1 !== firstQuestion2) {
      shuffleTestPassed = true
      break
    }
  }

  await assert('5回中1回以上、シャッフル後の最初の問題が変わる', async () => {
    if (!shuffleTestPassed) throw new Error('全5回で最初の問題が同じだった（シャッフル未動作の疑い）')
  })

  await ctx.close()
}

// ── 15. 難易度バッジ ──────────────────────────────────────────────
console.log('\n[15] 難易度バッジ')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  await assert('難易度バッジ（易/普/難）が表示される', async () => {
    const badge = await page.locator('.quiz-difficulty').textContent()
    if (!['易', '普', '難'].includes(badge.trim())) throw new Error(`badge: "${badge}"`)
  })

  await assert('難易度バッジの data-level が easy/normal/hard のいずれか', async () => {
    const level = await page.locator('.quiz-difficulty').getAttribute('data-level')
    if (!['easy', 'normal', 'hard'].includes(level)) throw new Error(`data-level: "${level}"`)
  })

  await ctx.close()
}

// ── 16. 各章ページの問題数 ────────────────────────────────────────
console.log('\n[16] 各章ページの問題数')
{
  const chapterCounts = [
    { chapter: 1, count: 37 },
    { chapter: 2, count: 50 },
    { chapter: 3, count: 24 },
    { chapter: 4, count: 40 },
    { chapter: 5, count: 48 },
    { chapter: 6, count: 13 },
    { chapter: 7, count: 88 },
  ]

  for (const { chapter, count } of chapterCounts) {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    page.on('pageerror', (err) => console.error('  [page error]', err.message))
    await page.goto(BASE + `/quiz/chapter${chapter}/`)
    await page.waitForSelector('.quiz-card', { timeout: 8000 })

    await assert(`chapter${chapter} のプログレステキストに ${count} 問が表示される`, async () => {
      const text = await page.locator('.quiz-progress-text').textContent()
      if (!text.includes(`/ ${count}`)) throw new Error(`progress text: "${text}"`)
    })

    await ctx.close()
  }
}

// ── 17. アクセシビリティ属性 ─────────────────────────────────────
console.log('\n[17] アクセシビリティ属性')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  await assert('プログレスバーに role="progressbar" がある', async () => {
    const role = await page.locator('[role="progressbar"]').count()
    if (role === 0) throw new Error('role="progressbar" not found')
  })

  await assert('プログレスバーに aria-valuemin="0" がある', async () => {
    const el = page.locator('[role="progressbar"]')
    const val = await el.getAttribute('aria-valuemin')
    if (val !== '0') throw new Error(`aria-valuemin: "${val}"`)
  })

  await assert('プログレスバーに aria-valuenow がある', async () => {
    const el = page.locator('[role="progressbar"]')
    const val = await el.getAttribute('aria-valuenow')
    if (val === null) throw new Error('aria-valuenow not found')
  })

  await assert('プログレスバーに aria-valuemax がある', async () => {
    const el = page.locator('[role="progressbar"]')
    const val = await el.getAttribute('aria-valuemax')
    if (val === null) throw new Error('aria-valuemax not found')
  })

  await assert('選択肢リストに aria-label="選択肢" がある', async () => {
    const el = await page.locator('[aria-label="選択肢"]').count()
    if (el === 0) throw new Error('aria-label="選択肢" not found')
  })

  // 回答後の result area には role="status" と aria-live="polite"
  await page.locator('.choice').first().click()
  await page.waitForSelector('.quiz-result', { timeout: 5000 })

  await assert('回答後の結果エリアに role="status" がある', async () => {
    const el = await page.locator('[role="status"]').count()
    if (el === 0) throw new Error('role="status" not found')
  })

  await assert('回答後の結果エリアに aria-live="polite" がある', async () => {
    const el = await page.locator('[aria-live="polite"]').count()
    if (el === 0) throw new Error('aria-live="polite" not found')
  })

  await ctx.close()
}

// ── 18. キーボード操作（Tab フォーカス） ─────────────────────────
console.log('\n[18] キーボード操作（Tab フォーカス）')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const pageErrors = []
  page.on('pageerror', (err) => pageErrors.push(err.message))
  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  // Tab を 10 回押す
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab')
  }

  await assert('Tab を 10 回押しても JS エラーが起きない', async () => {
    if (pageErrors.length > 0) throw new Error(pageErrors.join('; '))
  })

  await assert('選択肢ボタンにフォーカスが当たる（focusable）', async () => {
    // フォーカスが当たった要素を確認（Tab を押してフォーカスが choice になるまで試みる）
    // VitePress のナビバーやサイドバーには多数のフォーカス可能要素があるため多めに試みる
    let focusedOnChoice = false
    for (let i = 0; i < 80; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement
        return el ? el.className : ''
      })
      if (focused.includes('choice')) {
        focusedOnChoice = true
        break
      }
      await page.keyboard.press('Tab')
    }
    if (!focusedOnChoice) throw new Error('choice ボタンにフォーカスが当たらなかった')
  })

  await ctx.close()
}

// ── 19. ページタイトル（title タグ） ─────────────────────────────
console.log('\n[19] ページタイトル')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))

  await page.goto(BASE + '/quiz/chapter1/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await assert('/quiz/chapter1/ のタイトルが "ドリル" を含む', async () => {
    const title = await page.title()
    if (!title.includes('ドリル')) throw new Error(`title: "${title}"`)
  })

  await page.goto(BASE + '/quiz/random/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })
  await assert('/quiz/random/ のタイトルが "ランダム出題" を含む', async () => {
    const title = await page.title()
    if (!title.includes('ランダム出題')) throw new Error(`title: "${title}"`)
  })

  await page.goto(BASE + '/quiz/review/')
  await page.waitForSelector('.review-empty, .quiz-card', { timeout: 8000 })
  await assert('/quiz/review/ のタイトルが "復習" を含む', async () => {
    const title = await page.title()
    if (!title.includes('復習')) throw new Error(`title: "${title}"`)
  })

  await ctx.close()
}

// ── 20. 途中再開 ─────────────────────────────────────────────────
console.log('\n[20] 途中再開（chapter6: 13問）')
{
  // chapter6 の最初の 5 問だけ回答して離脱し、戻ったときに続きから始まるか確認
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('  [page error]', err.message))

  await page.goto(BASE + '/quiz/chapter6/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  // 5 問回答して離脱
  for (let i = 0; i < 5; i++) {
    await page.locator('.choice').first().click()
    await page.waitForSelector('.quiz-result', { timeout: 5000 })
    await page.locator('.btn-next').click()
    await page.waitForFunction(() => !document.querySelector('.quiz-result'), { timeout: 5000 })
  }

  await assert('5問回答後にプログレスが "5 / 13" になっている', async () => {
    const text = await page.locator('.quiz-progress-text').textContent()
    if (!text.startsWith('5 /')) throw new Error(text)
  })

  // ページを再読み込みして再開確認
  await page.reload()
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  await assert('リロード後も "5 / 13 問回答済み" から再開される', async () => {
    const text = await page.locator('.quiz-progress-text').textContent()
    if (!text.startsWith('5 /')) throw new Error(`再開失敗: "${text}"`)
  })

  await assert('リロード後に 6 問目（index=5）から開始される', async () => {
    const numText = await page.locator('.quiz-num').textContent()
    // "6 / 13" のような表示になるはず
    if (!numText.trim().startsWith('6')) throw new Error(`quiz-num: "${numText}"`)
  })

  // 別ページへ移動してから戻っても再開されるか
  await page.goto(BASE + '/quiz/')
  await page.waitForSelector('.quiz-top', { timeout: 5000 })
  await page.goto(BASE + '/quiz/chapter6/')
  await page.waitForSelector('.quiz-card', { timeout: 8000 })

  await assert('別ページ経由で戻っても "5 / 13" から再開される', async () => {
    const text = await page.locator('.quiz-progress-text').textContent()
    if (!text.startsWith('5 /')) throw new Error(`再開失敗: "${text}"`)
  })

  // 残り 8 問を回答して全問完了
  await answerAllQuestions(page, 20)
  await page.waitForSelector('.quiz-finish', { timeout: 5000 })

  await assert('残り問題を回答後に結果画面が表示される', async () => {
    const score = await page.locator('.finish-score').textContent()
    if (!score.includes('問正解')) throw new Error(score)
  })

  await assert('結果リストが 13 行ある（全問分）', async () => {
    const rows = await page.locator('.finish-row').count()
    if (rows !== 13) throw new Error(`rows=${rows}`)
  })

  // 全問回答済みの状態でリロードすると即結果画面になるか
  await page.reload()
  await page.waitForSelector('.quiz-finish', { timeout: 8000 })

  await assert('全問回答済み状態でリロードすると即結果画面が表示される', async () => {
    const finish = await page.locator('.quiz-finish').count()
    if (finish === 0) throw new Error('result screen not shown')
  })

  // 「もう一度挑戦」で最初から
  await page.locator('.btn-restart').click()
  await page.waitForSelector('.quiz-card', { timeout: 3000 })

  await assert('"もう一度挑戦" 後は最初（1 / 13）から始まる', async () => {
    const numText = await page.locator('.quiz-num').textContent()
    if (!numText.trim().startsWith('1')) throw new Error(`quiz-num: "${numText}"`)
  })

  await assert('"もう一度挑戦" 後のプログレスは "0 / 13 問回答済み"', async () => {
    const text = await page.locator('.quiz-progress-text').textContent()
    if (!text.startsWith('0 /')) throw new Error(text)
  })

  await ctx.close()
}

// ── 結果サマリー ─────────────────────────────────────────────────
await browser.close()
console.log(`\n${'─'.repeat(50)}`)
console.log(`結果: ${passed} 通過 / ${failed} 失敗`)
if (failed > 0) process.exit(1)
