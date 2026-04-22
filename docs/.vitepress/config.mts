import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

export default withMermaid(
  defineConfig({
    lang: 'ja-JP',
    title: 'Web フロントエンド入門',
    description: 'Web フロントエンドをこれから学ぶ人向けの学習コンテンツ',
    markdown: {
      codeTransformers: [transformerTwoslash()],
      config(md) {
        md.use(tabsMarkdownPlugin)
      },
    },
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'selectedcontent',
        },
      },
    },
    themeConfig: {
      nav: [{ text: 'ホーム', link: '/' }],
      sidebar: [
        { text: 'はじめに', link: '/introduction/' },
        {
          text: '1. HTML / CSS',
          collapsed: true,
          items: [
            { text: 'lesson01: HTML ってなに？', link: '/lessons/lesson01/' },
            { text: 'lesson02: テキストを書く', link: '/lessons/lesson02/' },
            { text: 'lesson03: リストで並べる', link: '/lessons/lesson03/' },
            { text: 'lesson04: リンクと画像', link: '/lessons/lesson04/' },
            { text: 'lesson05: ページの骨格を組む', link: '/lessons/lesson05/' },
            { text: 'lesson06: フォームを作る', link: '/lessons/lesson06/' },
            { text: 'lesson07: CSS を当てる', link: '/lessons/lesson07/' },
            { text: 'lesson08: クラスと状態', link: '/lessons/lesson08/' },
            { text: 'lesson09: 色と文字を整える', link: '/lessons/lesson09/' },
            { text: 'lesson10: ボックスモデルで余白を作る', link: '/lessons/lesson10/' },
            { text: 'lesson11: Flexbox とレスポンシブ（ミニ統合）', link: '/lessons/lesson11/' },
          ],
        },
        {
          text: '2. JavaScript',
          collapsed: true,
          items: [
            { text: 'lesson12: 最初の JavaScript', link: '/lessons/lesson12/' },
            { text: 'lesson13: 値の種類', link: '/lessons/lesson13/' },
            { text: 'lesson14: 条件で分岐する', link: '/lessons/lesson14/' },
            { text: 'lesson15: 配列を扱う', link: '/lessons/lesson15/' },
            { text: 'lesson16: 繰り返し処理', link: '/lessons/lesson16/' },
            { text: 'lesson17: 関数', link: '/lessons/lesson17/' },
            { text: 'lesson18: オブジェクト', link: '/lessons/lesson18/' },
            { text: 'lesson19: 分割代入とスプレッド', link: '/lessons/lesson19/' },
            { text: 'lesson20: 配列の変換', link: '/lessons/lesson20/' },
            { text: 'lesson21: 非同期処理の基本', link: '/lessons/lesson21/' },
            { text: 'lesson22: fetch で API から取得する', link: '/lessons/lesson22/' },
            { text: 'lesson23: DOM を操作する', link: '/lessons/lesson23/' },
            { text: 'lesson24: イベントで画面を動かす', link: '/lessons/lesson24/' },
            { text: 'lesson25: TODO アプリを作る（ミニ統合）', link: '/lessons/lesson25/' },
          ],
        },
        {
          text: '3. TypeScript',
          collapsed: true,
          items: [
            { text: 'lesson26: TypeScript ってなに？', link: '/lessons/lesson26/' },
            { text: 'lesson27: 関数の型', link: '/lessons/lesson27/' },
            { text: 'lesson28: オブジェクトの型と type エイリアス', link: '/lessons/lesson28/' },
            { text: 'lesson29: 配列・ユニオン・リテラル型・オプショナル', link: '/lessons/lesson29/' },
            { text: 'lesson30: ジェネリクス入門', link: '/lessons/lesson30/' },
            { text: 'lesson31: Utility Types で仕上げる', link: '/lessons/lesson31/' },
          ],
        },
        {
          text: '4. React',
          collapsed: true,
          items: [
            { text: 'lesson32: React ってなに？', link: '/lessons/lesson32/' },
            { text: 'lesson33: JSX を書く', link: '/lessons/lesson33/' },
            { text: 'lesson34: コンポーネントと props', link: '/lessons/lesson34/' },
            { text: 'lesson35: 配列を描画する', link: '/lessons/lesson35/' },
            { text: 'lesson36: state で状態を持つ', link: '/lessons/lesson36/' },
            { text: 'lesson37: イベントと配列のイミュータブル更新', link: '/lessons/lesson37/' },
            { text: 'lesson38: フォームと制御コンポーネント', link: '/lessons/lesson38/' },
            { text: 'lesson39: 条件で出し分ける', link: '/lessons/lesson39/' },
            { text: 'lesson40: 親子コンポーネントの連携', link: '/lessons/lesson40/' },
            { text: 'lesson41: useEffect の基本', link: '/lessons/lesson41/' },
            { text: 'lesson42: TODO アプリを React で作る（ミニ統合）', link: '/lessons/lesson42/' },
          ],
        },
        {
          text: '5. Next.js',
          collapsed: true,
          items: [
            { text: 'lesson43: Next.js ってなに？', link: '/lessons/lesson43/' },
            { text: 'lesson44: ページを増やしてリンクで移動する', link: '/lessons/lesson44/' },
            { text: 'lesson45: 共通レイアウトを作る', link: '/lessons/lesson45/' },
            { text: 'lesson46: Server Component と Client Component', link: '/lessons/lesson46/' },
            { text: 'lesson47: Server Component でデータを取得する', link: '/lessons/lesson47/' },
            { text: 'lesson48: 動的ルート', link: '/lessons/lesson48/' },
            { text: 'lesson49: エラーと見つからないページ', link: '/lessons/lesson49/' },
            { text: 'lesson50: Server Actions の最小形', link: '/lessons/lesson50/' },
            { text: 'lesson51: 送信状態とエラー表示', link: '/lessons/lesson51/' },
            { text: 'lesson52: 小さなアプリを仕上げる（統合）', link: '/lessons/lesson52/' },
            { text: 'lesson53: Vercel にデプロイする', link: '/lessons/lesson53/' },
          ],
        },
      ],
      outline: {
        label: '目次',
      },
      docFooter: {
        prev: '前のレッスン',
        next: '次のレッスン',
      },
      search: {
        provider: 'local',
        options: {
          translations: {
            button: { buttonText: '検索' },
            modal: {
              noResultsText: '見つかりませんでした',
              resetButtonTitle: 'リセット',
            },
          },
        },
      },
    },
  })
)
