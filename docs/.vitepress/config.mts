import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { withPwa } from '@vite-pwa/vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

export default withPwa(withMermaid(
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
    // PWA 設定。@vite-pwa/vitepress でデスクトップ / モバイルに
    // インストール可能にする（manifest + Service Worker + アイコン）。
    // アイコンは `pwa-assets.config.ts` で docs/public/logo.svg から生成。
    pwa: {
      registerType: 'autoUpdate',
      manifest: {
        name: 'Web フロントエンド入門',
        short_name: 'Web 入門',
        description: 'Web フロントエンドをこれから学ぶ人向けの学習コンテンツ',
        theme_color: '#1e40af',
        background_color: '#faf5e9',
        lang: 'ja',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // VitePress のビルド成果物は総量が大きいのでファイルサイズ上限を上げる。
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,webp,json}'],
      },
    },
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
      ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
      ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' }],
      // theme-color はモバイルブラウザの URL バー / タスクスイッチャー背景に反映される。
      // custom.css の --vp-c-bg と一致させ、ライト = クリーム、ダーク = ウォームチャコール。
      ['meta', { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#faf5e9' }],
      ['meta', { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#26201a' }],
    ],
    themeConfig: {
      nav: [{ text: 'ホーム', link: '/' }],
      sidebar: [
        { text: 'トップ', link: '/' },
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
            { text: 'lesson11: Flexbox とレスポンシブ', link: '/lessons/lesson11/' },
            { text: 'lesson12: CSS Grid で二次元レイアウト', link: '/lessons/lesson12/' },
            { text: 'lesson13: Position と z-index', link: '/lessons/lesson13/' },
            { text: 'lesson14: Transition と hover アニメーション', link: '/lessons/lesson14/' },
          ],
        },
        {
          text: '2. JavaScript',
          collapsed: true,
          items: [
            { text: 'lesson15: 最初の JavaScript', link: '/lessons/lesson15/' },
            { text: 'lesson16: 値の種類', link: '/lessons/lesson16/' },
            { text: 'lesson17: 条件で分岐する', link: '/lessons/lesson17/' },
            { text: 'lesson18: 配列を扱う', link: '/lessons/lesson18/' },
            { text: 'lesson19: 繰り返し処理', link: '/lessons/lesson19/' },
            { text: 'lesson20: 関数', link: '/lessons/lesson20/' },
            { text: 'lesson21: スコープとクロージャ', link: '/lessons/lesson21/' },
            { text: 'lesson22: オブジェクト', link: '/lessons/lesson22/' },
            { text: 'lesson23: 分割代入とスプレッド', link: '/lessons/lesson23/' },
            { text: 'lesson24: 配列の変換', link: '/lessons/lesson24/' },
            { text: 'lesson25: import / export でモジュール化', link: '/lessons/lesson25/' },
            { text: 'lesson26: 非同期処理の基本', link: '/lessons/lesson26/' },
            { text: 'lesson27: fetch で API から取得する', link: '/lessons/lesson27/' },
            { text: 'lesson28: DOM を操作する', link: '/lessons/lesson28/' },
            { text: 'lesson29: イベントで画面を動かす', link: '/lessons/lesson29/' },
            { text: 'lesson30: TODO アプリを作る', link: '/lessons/lesson30/' },
            { text: 'lesson76: try / catch でエラー処理', link: '/lessons/lesson76/' },
            { text: 'lesson77: JSON を読み書きする', link: '/lessons/lesson77/' },
            { text: 'lesson81: Web Storage で値をブラウザに保存する', link: '/lessons/lesson81/' },
            { text: 'lesson82: URL と History API でページ遷移なしに URL を操作する', link: '/lessons/lesson82/' },
            { text: 'lesson83: デバッグに効く Console API', link: '/lessons/lesson83/' },
          ],
        },
        {
          text: '3. TypeScript',
          collapsed: true,
          items: [
            { text: 'lesson31: TypeScript ってなに？', link: '/lessons/lesson31/' },
            { text: 'lesson32: 関数の型', link: '/lessons/lesson32/' },
            { text: 'lesson33: オブジェクトの型と type エイリアス', link: '/lessons/lesson33/' },
            { text: 'lesson34: interface と type の使い分け', link: '/lessons/lesson34/' },
            { text: 'lesson35: 配列・ユニオン・リテラル型・オプショナル', link: '/lessons/lesson35/' },
            { text: 'lesson36: unknown と never', link: '/lessons/lesson36/' },
            { text: 'lesson37: 型ガード', link: '/lessons/lesson37/' },
            { text: 'lesson38: 判別共用体', link: '/lessons/lesson38/' },
            { text: 'lesson39: ジェネリクス入門', link: '/lessons/lesson39/' },
            { text: 'lesson40: Utility Types で仕上げる', link: '/lessons/lesson40/' },
          ],
        },
        {
          text: '4. React',
          collapsed: true,
          items: [
            { text: 'lesson41: React ってなに？', link: '/lessons/lesson41/' },
            { text: 'lesson42: JSX を書く', link: '/lessons/lesson42/' },
            { text: 'lesson43: コンポーネントと props', link: '/lessons/lesson43/' },
            { text: 'lesson44: 配列を描画する', link: '/lessons/lesson44/' },
            { text: 'lesson45: state で状態を持つ', link: '/lessons/lesson45/' },
            { text: 'lesson46: イベントと配列のイミュータブル更新', link: '/lessons/lesson46/' },
            { text: 'lesson47: useReducer で複雑な state', link: '/lessons/lesson47/' },
            { text: 'lesson48: フォームと制御コンポーネント', link: '/lessons/lesson48/' },
            { text: 'lesson49: 条件で出し分ける', link: '/lessons/lesson49/' },
            { text: 'lesson50: 親子コンポーネントの連携', link: '/lessons/lesson50/' },
            { text: 'lesson51: Context API で多層バケツリレー回避', link: '/lessons/lesson51/' },
            { text: 'lesson52: useRef', link: '/lessons/lesson52/' },
            { text: 'lesson53: useEffect の基本', link: '/lessons/lesson53/' },
            { text: 'lesson54: useMemo で計算のメモ化', link: '/lessons/lesson54/' },
            { text: 'lesson55: カスタムフック', link: '/lessons/lesson55/' },
            { text: 'lesson56: React DevTools', link: '/lessons/lesson56/' },
            { text: 'lesson57: TODO アプリを React で作る', link: '/lessons/lesson57/' },
            { text: 'lesson78: Error Boundary と Suspense', link: '/lessons/lesson78/' },
          ],
        },
        {
          text: '5. Next.js',
          collapsed: true,
          items: [
            { text: 'lesson58: Next.js ってなに？', link: '/lessons/lesson58/' },
            { text: 'lesson59: ページを増やしてリンクで移動する', link: '/lessons/lesson59/' },
            { text: 'lesson60: 共通レイアウトを作る', link: '/lessons/lesson60/' },
            { text: 'lesson61: Route Groups で整理する', link: '/lessons/lesson61/' },
            { text: 'lesson62: Server Component と Client Component', link: '/lessons/lesson62/' },
            { text: 'lesson63: Server Component でデータを取得する', link: '/lessons/lesson63/' },
            { text: 'lesson64: next/image で画像最適化', link: '/lessons/lesson64/' },
            { text: 'lesson65: next/font でフォント', link: '/lessons/lesson65/' },
            { text: 'lesson66: 動的ルート', link: '/lessons/lesson66/' },
            { text: 'lesson67: エラーと見つからないページ', link: '/lessons/lesson67/' },
            { text: 'lesson68: Server Actions の最小形', link: '/lessons/lesson68/' },
            { text: 'lesson69: 送信状態とエラー表示', link: '/lessons/lesson69/' },
            { text: 'lesson70: Route Handlers', link: '/lessons/lesson70/' },
            { text: 'lesson71: Proxy で認証前処理', link: '/lessons/lesson71/' },
            { text: 'lesson72: 環境変数の基本', link: '/lessons/lesson72/' },
            { text: 'lesson73: 小さなアプリを仕上げる', link: '/lessons/lesson73/' },
            { text: 'lesson74: Tailwind CSS の紹介', link: '/lessons/lesson74/' },
            { text: 'lesson79: Metadata API で SEO を整える', link: '/lessons/lesson79/' },
            { text: 'lesson80: Loading UI と Streaming', link: '/lessons/lesson80/' },
            { text: 'lesson75: Vercel にデプロイする', link: '/lessons/lesson75/' },
          ],
        },
        {
          text: '6. ブラウザの仕組み',
          collapsed: true,
          items: [
            { text: 'lesson84: ブラウザと HTTP の基本', link: '/lessons/lesson84/' },
            { text: 'lesson85: DevTools の読み方', link: '/lessons/lesson85/' },
            { text: 'lesson86: HTTP キャッシュ', link: '/lessons/lesson86/' },
            { text: 'lesson87: 同時接続数と HTTP/2 / HTTP/3', link: '/lessons/lesson87/' },
            { text: 'lesson88: Cookie と Web セキュリティ', link: '/lessons/lesson88/' },
          ],
        },
        {
          text: '7. 実務で使う周辺知識',
          collapsed: true,
          items: [
            { text: 'lesson89: セマンティック HTML とアクセシビリティの基礎', link: '/lessons/lesson89/' },
            { text: 'lesson90: ARIA 属性とキーボード操作', link: '/lessons/lesson90/' },
            { text: 'lesson91: アクセシビリティの自動チェック（axe / Lighthouse / スクリーンリーダー）', link: '/lessons/lesson91/' },
            { text: 'lesson92: テスト入門 — Vitest でユニットテスト', link: '/lessons/lesson92/' },
            { text: 'lesson93: コンポーネントテスト — React Testing Library', link: '/lessons/lesson93/' },
            { text: 'lesson94: API モック — MSW（Mock Service Worker）', link: '/lessons/lesson94/' },
            { text: 'lesson95: E2E テスト — Playwright', link: '/lessons/lesson95/' },
            { text: 'lesson96: Core Web Vitals の 3 つの指標と Lighthouse', link: '/lessons/lesson96/' },
            { text: 'lesson97: バンドルサイズの最適化とコード分割', link: '/lessons/lesson97/' },
            { text: 'lesson98: 画像とフォントの最適化', link: '/lessons/lesson98/' },
            { text: 'lesson99: Git の基本操作', link: '/lessons/lesson99/' },
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
))
