// レッスン進捗の localStorage キーに使う「トピック ID」を取り出すユーティリティ。
//
// 保存キーを「/lessons/lessonXX/」のようなパスにすると、レッスンの追加や移動で
// 番号がずれたときに過去の完了情報が別のレッスンに誤って紐づいてしまう。
// 代わりに、見出し `# lessonXX: タイトル` の **タイトル部分** を ID として使う。
// 番号が変わってもトピック名が同じなら完了情報が保たれる。
//
// 例:
//   "lesson12: CSS Grid で 2 次元レイアウト" → "CSS Grid で 2 次元レイアウト"
//   "lesson37: 型ガード（`typeof` / `in` / カスタム）" → "型ガード"
//
// 全角・半角コロンの両方と、lesson 番号と : の間の空白にも対応。

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
