// レッスン進捗の localStorage キーに使う「トピック ID」を取り出すユーティリティ。
//
// 保存キーを「/lessons/lessonXX/」のようなパスにすると、レッスンの追加や移動で
// 番号がずれたときに過去の完了情報が別のレッスンに誤って紐づいてしまう。
// 代わりに、見出し `# lessonXX: タイトル` の **タイトル部分** を ID として使う。
// 番号が変わってもトピック名が同じなら完了情報が保たれる。
//
// 例:
//   "lesson12: CSS Grid で二次元レイアウト" → "CSS Grid で二次元レイアウト"
//   "lesson37: 型ガード（`typeof` / `in` / カスタム）" → "型ガード"
//
// 全角・半角コロンの両方と、lesson 番号と : の間の空白にも対応。
//
// migrateCompletions() は、正規化ルールを追加したときに一度だけ呼ぶことで
// 旧フォーマットで保存済みの localStorage キーを新フォーマットに変換する。

const LESSON_PREFIX_RE = /^lesson\s*\d+\s*[:：]\s*/
const INLINE_CODE_RE = /`([^`]+)`/g
const TRAILING_PAREN_RE = /\s*[（(][^）)]*[）)]\s*$/

export function lessonIdFromTitle(title: string): string {
  return title
    .replace(LESSON_PREFIX_RE, '')
    .replace(INLINE_CODE_RE, '$1')
    .replace(TRAILING_PAREN_RE, '')
    .trim()
}

export function lessonIdFromH1(): string {
  if (typeof document === 'undefined') return ''
  const h1 = document.querySelector('main h1, .vp-doc h1, h1')
  if (!h1) return ''
  // VitePress は h1 内に <a class="header-anchor"> を挿入する。
  // そのテキストノード（ゼロ幅スペース等）が混入すると保存キーがずれるため、
  // クローンしてアンカー要素を除去してから textContent を使う。
  const clone = h1.cloneNode(true) as HTMLElement
  clone.querySelectorAll('a').forEach((el) => el.remove())
  return lessonIdFromTitle(clone.textContent || '')
}

/**
 * 旧フォーマット（バッククォート含む・末尾括弧含む）で保存された
 * localStorage キーを現在の正規化ルールに合わせて変換する。
 * 正規化ルールを追加したタイミングで一度だけ呼ぶことで既存データを維持できる。
 */
export function migrateCompletions(storageKey: string): void {
  if (typeof window === 'undefined') return
  let raw: Record<string, string>
  try {
    raw = JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return
  }
  const migrated: Record<string, string> = {}
  let changed = false
  for (const [key, value] of Object.entries(raw)) {
    const newKey = lessonIdFromTitle(key)
    if (newKey !== key) changed = true
    // 衝突時は古い値より新しい値を優先する
    if (!(newKey in migrated)) migrated[newKey] = value
  }
  if (changed) {
    localStorage.setItem(storageKey, JSON.stringify(migrated))
  }
}
