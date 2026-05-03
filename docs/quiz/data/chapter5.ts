import type { Quiz } from "../types";

export const chapter5: Quiz[] = [
  // lesson70: Next.js ってなに？
  {
    id: "q152",
    lesson: "lesson70",
    difficulty: "easy",
    question: "Next.js が React の上に追加する主な機能として正しいものはどれですか？",
    choices: [
      "CSS フレームワーク（Tailwind CSS）のバンドル",
      "ファイルベースのルーティング・サーバーサイドレンダリング・ビルド最適化",
      "GraphQL クライアントの自動生成",
      "TypeScript から JavaScript への変換だけ",
    ],
    answer: 1,
    explanation:
      "Next.js は React に対し、ファイルベースルーティング・SSR / SSG・画像最適化・フォント最適化などを追加します。CSS フレームワークは含まれません。",
  },
  {
    id: "q153",
    lesson: "lesson70",
    difficulty: "easy",
    question: "Next.js App Router のエントリポイントとなるファイルはどれですか？",
    choices: ["index.tsx", "main.tsx", "app/page.tsx", "src/App.tsx"],
    answer: 2,
    explanation:
      "App Router では `app/page.tsx` が `/` に対応するルートページです。`index.tsx` は Pages Router 時代の慣習です。",
  },
  {
    id: "q154",
    lesson: "lesson70",
    difficulty: "normal",
    question: "Next.js がデフォルトでコンポーネントを Server Component として扱う理由として最も適切なのはどれですか？",
    choices: [
      "ブラウザ API にアクセスしやすくするため",
      "JavaScript バンドルをクライアントに送らずにすむためパフォーマンスが向上するから",
      "useState が使えるようになるから",
      "TypeScript の型チェックが高速になるから",
    ],
    answer: 1,
    explanation:
      "Server Component はサーバーで実行されるためクライアントバンドルに含まれません。これにより初期ロードが軽くなります。",
  },

  // lesson71: ページを増やしてリンクで移動する
  {
    id: "q155",
    lesson: "lesson71",
    difficulty: "easy",
    question: "App Router で `/about` という URL のページを作るには、どのファイルを作ればよいですか？",
    choices: [
      "app/about.tsx",
      "app/about/page.tsx",
      "pages/about.tsx",
      "app/routes/about.tsx",
    ],
    answer: 1,
    explanation:
      "App Router ではディレクトリ名が URL セグメントになり、`page.tsx` がそのルートのコンポーネントです。`app/about/page.tsx` で `/about` が作られます。",
  },
  {
    id: "q156",
    lesson: "lesson71",
    difficulty: "normal",
    question: "Next.js でページ遷移に `<a href>` の代わりに `<Link href>` を使う主な理由はどれですか？",
    choices: [
      "TypeScript の型チェックが強化されるから",
      "クライアントサイドナビゲーションで全ページリロードを避けられるから",
      "SEO のクローラーが読めないから",
      "CSS モジュールが適用されるから",
    ],
    answer: 1,
    explanation:
      "`next/link` の `<Link>` はクライアントサイドナビゲーションを行い、必要なコンポーネントのみ更新します。素の `<a>` だとフルページリロードになります。",
  },

  // lesson72: 共通レイアウトを作る
  {
    id: "q157",
    lesson: "lesson72",
    difficulty: "easy",
    question: "`app/layout.tsx` の主な役割はどれですか？",
    choices: [
      "エラーが発生したときのフォールバック UI を提供する",
      "全ページで共通するヘッダー・フッターなど外枠を 1 箇所で定義する",
      "動的ルートのパラメータを受け取る",
      "ローディング中の UI を表示する",
    ],
    answer: 1,
    explanation:
      "`layout.tsx` はそのルート以下のすべてのページを包む共通レイアウトです。ヘッダー・フッターなど繰り返す UI を一箇所にまとめられます。",
  },
  {
    id: "q158",
    lesson: "lesson72",
    difficulty: "normal",
    question: "`app/layout.tsx` の RootLayout コンポーネントが受け取る `children` prop は何を表しますか？",
    choices: [
      "現在アクセスされている `page.tsx` の内容",
      "サイドバーコンポーネント",
      "エラー画面のフォールバック",
      "HTTP レスポンスボディ",
    ],
    answer: 0,
    explanation:
      "`children` には現在のルートに対応する `page.tsx`（または入れ子のレイアウト）がレンダリングされて渡されます。",
  },

  // lesson73: Route Groups
  {
    id: "q159",
    lesson: "lesson73",
    difficulty: "normal",
    question: "App Router で `app/(marketing)/about/page.tsx` を作ったとき、対応する URL はどれですか？",
    choices: [
      "/marketing/about",
      "/(marketing)/about",
      "/about",
      "/marketing",
    ],
    answer: 2,
    explanation:
      "括弧 `()` で囲んだディレクトリ名は Route Group といい、URL には含まれません。`(marketing)` は URL に現れず `/about` になります。",
  },
  {
    id: "q160",
    lesson: "lesson73",
    difficulty: "hard",
    question: "Route Groups を使う主なユースケースとして最も適切なのはどれですか？",
    choices: [
      "URL のパスを短くするため",
      "異なるグループで別々の `layout.tsx` を適用しつつ URL 構造を変えないため",
      "動的ルートを静的にプリレンダリングするため",
      "Middleware をグループ単位で無効化するため",
    ],
    answer: 1,
    explanation:
      "Route Groups を使うと、URL を変えずに同じ階層のページを論理的にグループ化し、グループごとに異なるレイアウトを当てられます。",
  },

  // lesson74: Server Component と Client Component
  {
    id: "q161",
    lesson: "lesson74",
    difficulty: "easy",
    question: "Next.js でクライアントコンポーネントを宣言するために必要な記述はどれですか？",
    choices: [
      "export default function MyComponent() の上に `'use client'` と書く",
      "ファイル拡張子を `.client.tsx` にする",
      "import React from 'react' を書く",
      "コンポーネント名を大文字で始める",
    ],
    answer: 0,
    explanation:
      "ファイルの先頭に `'use client'` ディレクティブを書くことでクライアントコンポーネントになります。",
  },
  {
    id: "q162",
    lesson: "lesson74",
    difficulty: "normal",
    question: "Server Component で使えて Client Component では使えないものはどれですか？",
    choices: [
      "useState",
      "イベントハンドラ（onClick など）",
      "サーバー側の環境変数（NEXT_PUBLIC_ なし）",
      "useEffect",
    ],
    answer: 2,
    explanation:
      "Server Component はサーバーでのみ実行されるため、`NEXT_PUBLIC_` プレフィックスなしの環境変数にアクセスできます。useState / useEffect / イベントハンドラはクライアントコンポーネント専用です。",
  },
  {
    id: "q163",
    lesson: "lesson74",
    difficulty: "hard",
    question: "Server Component の中で Client Component を import した場合の動作として正しいのはどれですか？",
    choices: [
      "ビルドエラーになる",
      "Client Component はクライアントでのみ実行され、Server Component はサーバーで実行される（正しく動く）",
      "Server Component 全体がクライアントコンポーネントになる",
      "Client Component がサーバーでのみ実行される",
    ],
    answer: 1,
    explanation:
      "Server Component が Client Component を import することは可能です。Next.js が境界を管理し、それぞれ正しい環境で実行されます。",
  },

  // lesson75: Server Component でデータを取得する
  {
    id: "q164",
    lesson: "lesson75",
    difficulty: "easy",
    question: "Server Component でデータを取得する最もシンプルな方法はどれですか？",
    choices: [
      "useEffect の中で fetch する",
      "コンポーネント関数を async にして await fetch() を直接書く",
      "getServerSideProps を定義する",
      "useSWR を使う",
    ],
    answer: 1,
    explanation:
      "App Router の Server Component は `async` 関数として定義でき、コンポーネント内で直接 `await fetch()` を呼べます。",
  },
  {
    id: "q165",
    lesson: "lesson75",
    difficulty: "normal",
    question: "Next.js の `fetch` が標準の `fetch` と異なる点として正しいのはどれですか？",
    choices: [
      "JSON を自動でパースして返す",
      "キャッシュ制御オプション（`cache: 'force-cache'` など）が拡張されている",
      "POST リクエストが使えない",
      "サーバーでは使えない",
    ],
    answer: 1,
    explanation:
      "Next.js は組み込みの `fetch` を拡張し、`cache` や `next.revalidate` などのオプションでサーバーサイドのキャッシュを制御できます。",
  },

  // lesson76: Next.js のキャッシュと revalidate
  {
    id: "q166",
    lesson: "lesson76",
    difficulty: "normal",
    question: "Next.js の Data Cache で `fetch(url, { next: { revalidate: 60 } })` と書いた場合の意味はどれですか？",
    choices: [
      "60 ミリ秒ごとにキャッシュを更新する",
      "60 秒後にキャッシュを無効化し、次のリクエスト時に再取得する（ISR）",
      "60 回リクエストしたらキャッシュを更新する",
      "60 分間キャッシュを保持する",
    ],
    answer: 1,
    explanation:
      "`next: { revalidate: 60 }` は Incremental Static Regeneration（ISR）の設定で、60 秒後にキャッシュを stale とし次リクエスト時に再取得します。",
  },
  {
    id: "q167",
    lesson: "lesson76",
    difficulty: "hard",
    question: "`fetch(url, { cache: 'no-store' })` の効果はどれですか？",
    choices: [
      "毎回必ずサーバーからデータを取得し、キャッシュしない",
      "ビルド時に一度だけ取得してキャッシュする",
      "ブラウザのキャッシュを無効にする",
      "Router Cache を削除する",
    ],
    answer: 0,
    explanation:
      "`cache: 'no-store'` はリクエストのたびに毎回取得し、Data Cache に保存しません。常に最新データが必要な場面に使います。",
  },

  // lesson77: next/image
  {
    id: "q168",
    lesson: "lesson77",
    difficulty: "easy",
    question: "`next/image` の `<Image>` を使う利点として正しいのはどれですか？",
    choices: [
      "SVG アニメーションを自動生成する",
      "WebP / AVIF への自動変換・遅延読み込み・レイアウトシフト防止を提供する",
      "CSS Grid を自動で適用する",
      "画像の著作権チェックを行う",
    ],
    answer: 1,
    explanation:
      "`<Image>` は最適なフォーマット変換・遅延ロード（lazy loading）・`width`/`height` 指定による CLS（Cumulative Layout Shift）防止を自動で行います。",
  },
  {
    id: "q169",
    lesson: "lesson77",
    difficulty: "normal",
    question: "`<Image>` コンポーネントで外部 URL の画像を使う場合、`next.config` に必要な設定はどれですか？",
    choices: [
      "特に設定不要",
      "`images.remotePatterns` に使用するホストのパターンを追加する",
      "`images.domains` に全ドメインをワイルドカードで追加する",
      "`output: 'export'` に変更する",
    ],
    answer: 1,
    explanation:
      "外部画像を使うには `next.config` の `images.remotePatterns`（または旧 `images.domains`）に許可するホストを明示する必要があります。",
  },

  // lesson78: next/font
  {
    id: "q170",
    lesson: "lesson78",
    difficulty: "normal",
    question: "`next/font/google` を使う利点として最も正しいのはどれですか？",
    choices: [
      "フォントを Google Fonts CDN から毎回取得する",
      "ビルド時にフォントをダウンロードし自己ホスティングするため、Google への外部リクエストが不要になる",
      "任意のサードパーティフォントを使えるようになる",
      "フォントを Base64 に変換して CSS に埋め込む",
    ],
    answer: 1,
    explanation:
      "`next/font/google` はビルド時にフォントを取得し自己ホスティングします。ランタイムに Google へリクエストせず、プライバシーとパフォーマンスが向上します。",
  },

  // lesson79: 動的ルート
  {
    id: "q171",
    lesson: "lesson79",
    difficulty: "easy",
    question: "App Router で `/posts/123` のような URL のページを作るには、どのファイルを作ればよいですか？",
    choices: [
      "app/posts/:id/page.tsx",
      "app/posts/[id]/page.tsx",
      "app/posts/{id}/page.tsx",
      "app/posts/$id/page.tsx",
    ],
    answer: 1,
    explanation:
      "動的セグメントは `[id]` のように角括弧で囲んだディレクトリ名で表します。`app/posts/[id]/page.tsx` が `/posts/123` などにマッチします。",
  },
  {
    id: "q172",
    lesson: "lesson79",
    difficulty: "normal",
    question: "動的ルート `app/posts/[id]/page.tsx` でパラメータ `id` を取得するには？",
    choices: [
      "useRouter().query.id を使う",
      "props.params.id を使う（Server Component の場合）",
      "window.location.pathname を解析する",
      "getServerSideProps の context.params.id を使う",
    ],
    answer: 1,
    explanation:
      "App Router の Server Component では `props.params` にルートパラメータが入ります。`const { id } = await props.params` でアクセスできます。",
  },

  // lesson80: エラーと見つからないページ
  {
    id: "q173",
    lesson: "lesson80",
    difficulty: "easy",
    question: "App Router で `/products/[id]` ページ内でエラーが起きたときのフォールバック UI を定義するファイルはどれですか？",
    choices: [
      "app/products/[id]/loading.tsx",
      "app/products/[id]/error.tsx",
      "app/error-boundary.tsx",
      "app/products/[id]/fallback.tsx",
    ],
    answer: 1,
    explanation:
      "`error.tsx` をルートセグメント内に置くと、同階層の `page.tsx` で発生したエラーをキャッチして代替 UI を表示します。",
  },
  {
    id: "q174",
    lesson: "lesson80",
    difficulty: "normal",
    question: "`notFound()` を呼ぶと何が起きますか？",
    choices: [
      "アプリ全体がクラッシュする",
      "HTTP 404 ステータスで `not-found.tsx` の内容を表示する",
      "ホームページにリダイレクトする",
      "コンソールに警告が出るだけ",
    ],
    answer: 1,
    explanation:
      "`next/navigation` の `notFound()` を呼ぶと、そのルートセグメント内の `not-found.tsx`（またはデフォルト）が表示され HTTP 404 が返ります。",
  },

  // lesson81: Server Actions の最小形
  {
    id: "q175",
    lesson: "lesson81",
    difficulty: "easy",
    question: "Server Actions を定義するために必要なディレクティブはどれですか？",
    choices: [
      "関数の先頭に `'use client'` を書く",
      "関数の先頭（またはファイル先頭）に `'use server'` を書く",
      "ファイル名を `action.server.ts` にする",
      "async キーワードを付けない",
    ],
    answer: 1,
    explanation:
      "Server Actions は関数の先頭（インライン）またはファイル先頭に `'use server'` を書いて宣言します。",
  },
  {
    id: "q176",
    lesson: "lesson81",
    difficulty: "normal",
    question: "`<form action={serverAction}>` を使うとき、Server Action はどこで実行されますか？",
    choices: [
      "ブラウザの Web Worker",
      "サーバー（Node.js / Edge Runtime）",
      "Service Worker",
      "クライアントの React ランタイム",
    ],
    answer: 1,
    explanation:
      "Server Actions は名前の通りサーバーで実行されます。フォーム送信時に HTTP POST が発行され、サーバー側でアクション関数が呼ばれます。",
  },

  // lesson82: useActionState
  {
    id: "q177",
    lesson: "lesson82",
    difficulty: "normal",
    question: "`useActionState(action, initialState)` の戻り値として正しいものはどれですか？",
    choices: [
      "[state, formAction]",
      "[state, dispatch, isPending]",
      "[state, formAction, isPending]",
      "{ state, action, error }",
    ],
    answer: 2,
    explanation:
      "`useActionState` は `[state, formAction, isPending]` を返します。`state` が最新の状態、`formAction` を `<form action>` に渡し、`isPending` は送信中かどうかです。",
  },
  {
    id: "q178",
    lesson: "lesson82",
    difficulty: "hard",
    question: "`useActionState` に渡す `action` 関数の引数として正しいシグネチャはどれですか？",
    choices: [
      "(event: FormEvent) => Promise<State>",
      "(prevState: State, formData: FormData) => Promise<State>",
      "(formData: FormData) => Promise<State>",
      "(req: Request) => Promise<State>",
    ],
    answer: 1,
    explanation:
      "`useActionState` のアクション関数は `(prevState, formData)` の形をとります。前の状態と FormData を受け取り、新しい状態を返します。",
  },

  // lesson83: useFormStatus
  {
    id: "q179",
    lesson: "lesson83",
    difficulty: "normal",
    question: "`useFormStatus` を使って送信ボタンを無効化する目的として正しいのはどれですか？",
    choices: [
      "フォームのバリデーションエラーを表示するため",
      "送信中に二重送信を防ぐため",
      "ネットワークエラーを自動リトライするため",
      "CSRF トークンを付与するため",
    ],
    answer: 1,
    explanation:
      "`useFormStatus` の `pending` が `true` の間はボタンを `disabled` にすることで、ユーザーが二重にフォームを送信するのを防げます。",
  },
  {
    id: "q180",
    lesson: "lesson83",
    difficulty: "hard",
    question: "`useFormStatus` が動作するために必要な条件はどれですか？",
    choices: [
      "コンポーネントが `'use client'` でなければならない",
      "`useFormStatus` を使うコンポーネントが `<form>` の子孫でなければならない",
      "`useFormStatus` を `<form>` 内に直接書かなければならない",
      "Server Action を使わない `<form>` でも動作する",
    ],
    answer: 1,
    explanation:
      "`useFormStatus` は React の Context を通じて最も近い親 `<form>` の状態を読みます。そのため `<form>` の子（または孫）コンポーネント内で使う必要があります。",
  },

  // lesson84: Route Handlers の基本
  {
    id: "q181",
    lesson: "lesson84",
    difficulty: "easy",
    question: "App Router で GET `/api/todos` を実装するファイルパスはどれですか？",
    choices: [
      "pages/api/todos.ts",
      "app/api/todos/route.ts",
      "app/api/todos/handler.ts",
      "src/api/todos.ts",
    ],
    answer: 1,
    explanation:
      "App Router の Route Handlers は `route.ts`（または `route.js`）というファイル名が規約です。`app/api/todos/route.ts` に `GET` を export します。",
  },
  {
    id: "q182",
    lesson: "lesson84",
    difficulty: "normal",
    question: "Route Handler で JSON レスポンスを返すための正しい書き方はどれですか？",
    choices: [
      "return { json: data }",
      "res.json(data)",
      "return Response.json(data)",
      "return new JsonResponse(data)",
    ],
    answer: 2,
    explanation:
      "App Router の Route Handlers は Web 標準の `Response` を返します。`Response.json(data)` で JSON レスポンスを生成します。",
  },

  // lesson85: Route Handlers の入力検証と受信検証
  {
    id: "q183",
    lesson: "lesson85",
    difficulty: "normal",
    question: "Route Handler で `await request.json()` を `unknown` 型で受け取る理由はどれですか？",
    choices: [
      "TypeScript の制約で any が使えないから",
      "クライアントが送ってくる JSON の形は保証されないため、型ガードで安全に絞り込むべきだから",
      "パフォーマンスが向上するから",
      "JSON.parse の返り値が常に unknown だから",
    ],
    answer: 1,
    explanation:
      "HTTP 経由で受け取るデータはシステム境界を越えるため、形が保証されません。`unknown` で受けて型ガードで検証することが安全な実装です。",
  },

  // lesson86: Proxy で認証前処理
  {
    id: "q184",
    lesson: "lesson86",
    difficulty: "hard",
    question: "Next.js の Route Handler を外部 API へのプロキシとして使う主なメリットはどれですか？",
    choices: [
      "レスポンスが自動でキャッシュされるから",
      "API キーをクライアントに露出させずにサーバー側で認証ヘッダーを付与できるから",
      "外部 API より高速になるから",
      "TypeScript の型が自動生成されるから",
    ],
    answer: 1,
    explanation:
      "プロキシパターンでは API キーなどの秘密情報をサーバー側（Route Handler）で付与し、クライアントには渡しません。",
  },

  // lesson87: 環境変数の基本
  {
    id: "q185",
    lesson: "lesson87",
    difficulty: "easy",
    question: "クライアントサイドのコードから読める環境変数のプレフィックスはどれですか？",
    choices: ["CLIENT_", "PUBLIC_", "NEXT_PUBLIC_", "BROWSER_"],
    answer: 2,
    explanation:
      "`NEXT_PUBLIC_` で始まる環境変数のみクライアント（ブラウザ）バンドルに含まれます。それ以外はサーバー側専用です。",
  },
  {
    id: "q186",
    lesson: "lesson87",
    difficulty: "normal",
    question: "`.env.local` に書いた環境変数について正しい説明はどれですか？",
    choices: [
      "本番環境の Vercel にも自動デプロイされる",
      "git にコミットすべきでなく、ローカル開発用の秘密情報を置く場所",
      "`.env` より優先度が低い",
      "JSON 形式で記述する",
    ],
    answer: 1,
    explanation:
      "`.env.local` はローカル専用の上書きファイルで、`.gitignore` に含めて秘密情報を管理します。優先度は `.env.local` > `.env.development` / `.env.production` > `.env` の順です。",
  },

  // lesson88: Tailwind CSS
  {
    id: "q187",
    lesson: "lesson88",
    difficulty: "easy",
    question: "Tailwind CSS の基本的なアプローチとして正しいのはどれですか？",
    choices: [
      "コンポーネントごとに CSS ファイルを作る",
      "クラス名にユーティリティクラスを直接書いてスタイルを当てる",
      "CSS-in-JS で JavaScript オブジェクトを書く",
      "BEM 記法でクラス名を設計する",
    ],
    answer: 1,
    explanation:
      "Tailwind CSS はユーティリティファーストで、`flex`、`text-lg`、`bg-blue-500` のような単機能クラスを HTML に直接記述してスタイルを構築します。",
  },

  // lesson89: Metadata API
  {
    id: "q188",
    lesson: "lesson89",
    difficulty: "normal",
    question: "App Router で静的な `<title>` と `<meta description>` を設定するには何を export すればよいですか？",
    choices: [
      "export const head = { title: '...' }",
      "export const metadata: Metadata = { title: '...', description: '...' }",
      "export default function Head() { return <title>...</title> }",
      "export const getMetadata = () => ({ title: '...' })",
    ],
    answer: 1,
    explanation:
      "App Router では `page.tsx` または `layout.tsx` から `metadata` という名前の定数を export することで静的メタデータを設定します。",
  },
  {
    id: "q189",
    lesson: "lesson89",
    difficulty: "hard",
    question: "動的ルートでページごとに異なる `<title>` を設定するには何を export すればよいですか？",
    choices: [
      "export const metadata",
      "export async function generateMetadata({ params })",
      "export function Head({ params })",
      "export const dynamicMetadata = true",
    ],
    answer: 1,
    explanation:
      "`generateMetadata` 関数を export することで、ルートパラメータや fetch 結果を使って動的にメタデータを生成できます。",
  },

  // lesson90: Loading UI と Streaming
  {
    id: "q190",
    lesson: "lesson90",
    difficulty: "easy",
    question: "`app/dashboard/loading.tsx` を置くと何が起きますか？",
    choices: [
      "/dashboard のみローディング UI が表示される",
      "/dashboard およびその配下のすべてのルートでローディング中に loading.tsx の内容が表示される",
      "全ページでローディング UI が表示される",
      "スケルトン UI が自動生成される",
    ],
    answer: 1,
    explanation:
      "`loading.tsx` はそのセグメントとその子孫を Suspense でラップします。`/dashboard` 以下のページのデータ取得中に表示されます。",
  },
  {
    id: "q191",
    lesson: "lesson90",
    difficulty: "normal",
    question: "Next.js の Streaming（ストリーミング）を使うと何がメリットになりますか？",
    choices: [
      "CSS をインクリメンタルに読み込める",
      "遅いデータ取得をブロックせず、準備できた部分から順次ブラウザに送信できる",
      "画像のストリーミングダウンロードが高速になる",
      "WebSocket 通信が不要になる",
    ],
    answer: 1,
    explanation:
      "Streaming により、ページ全体のデータが揃うまで待たずに、準備できたセクションから順にブラウザへ HTML を送信できます。TTFB（Time to First Byte）改善につながります。",
  },

  // lesson91: Vercel にデプロイする
  {
    id: "q192",
    lesson: "lesson91",
    difficulty: "easy",
    question: "Vercel に Next.js プロジェクトをデプロイするための最も基本的な手順はどれですか？",
    choices: [
      "Dockerfile を書いてコンテナ化する",
      "GitHub リポジトリを Vercel に接続してインポートするだけでデプロイできる",
      "FTP でファイルをアップロードする",
      "nginx の設定ファイルを用意する",
    ],
    answer: 1,
    explanation:
      "Vercel は GitHub と連携しており、リポジトリをインポートするだけでビルド・デプロイが自動実行されます。Next.js はゼロコンフィグで対応しています。",
  },
  {
    id: "q193",
    lesson: "lesson91",
    difficulty: "normal",
    question: "Vercel にデプロイした Next.js アプリで環境変数を設定するにはどうすればよいですか？",
    choices: [
      "`.env.local` を git にコミットする",
      "Vercel ダッシュボードの「Environment Variables」に追加する",
      "`vercel.json` の env フィールドに直接書く",
      "Dockerfile の ENV 命令で設定する",
    ],
    answer: 1,
    explanation:
      "Vercel の Environment Variables は、ダッシュボードの Settings → Environment Variables から安全に設定します。`.env.local` はローカル専用でコミットしません。",
  },
  {
    id: "q194",
    lesson: "lesson91",
    difficulty: "hard",
    question: "Vercel が Next.js の SSR（Server-Side Rendering）をサポートする仕組みとして正しいのはどれですか？",
    choices: [
      "静的ファイルのみ配信するため SSR は動かない",
      "Serverless Functions / Edge Functions として動的ルートを実行する",
      "Node.js プロセスを常時起動する",
      "Lambda 関数として AWS に委譲する",
    ],
    answer: 1,
    explanation:
      "Vercel は Next.js の動的ルート（Server Components, Route Handlers など）を Serverless / Edge Functions として実行することで SSR をサポートします。",
  },
  {
    id: "q195",
    lesson: "lesson91",
    difficulty: "normal",
    question: "Vercel でプレビューデプロイ（Preview Deployment）が作成されるタイミングはいつですか？",
    choices: [
      "main ブランチに push したとき",
      "feature ブランチへの push や Pull Request 作成時",
      "ローカルで `vercel dev` を実行したとき",
      "手動でボタンを押したときのみ",
    ],
    answer: 1,
    explanation:
      "main 以外のブランチへの push や PR 作成時に自動でプレビューデプロイが行われ、一意の URL でレビューできます。main への push は本番デプロイになります。",
  },
  {
    id: "q196",
    lesson: "lesson91",
    difficulty: "normal",
    question: "Vercel で `next.config.ts` の設定変更がデプロイに反映されるのはいつですか？",
    choices: [
      "ダッシュボードを更新したとき",
      "次回 git push して新しいデプロイがビルドされたとき",
      "設定変更は Vercel では無視される",
      "Vercel サポートに依頼したとき",
    ],
    answer: 1,
    explanation:
      "`next.config.ts` の変更はコードの変更なので、git push → Vercel のビルドプロセスを経て新しいデプロイに反映されます。",
  },
  {
    id: "q197",
    lesson: "lesson91",
    difficulty: "easy",
    question: "Vercel にデプロイした後、アプリが正しく動作していることを確認するために最初に見るべきものはどれですか？",
    choices: [
      "ローカルの `npm run build` の出力",
      "Vercel ダッシュボードのデプロイログと発行された URL",
      "GitHub のコミット履歴",
      "`.env.local` の内容",
    ],
    answer: 1,
    explanation:
      "Vercel ダッシュボードでビルドログを確認し、エラーがなければ発行された URL にアクセスして動作確認します。",
  },
  {
    id: "q198",
    lesson: "lesson91",
    difficulty: "normal",
    question: "StackBlitz で開発した Next.js プロジェクトを Vercel にデプロイするための最初のステップはどれですか？",
    choices: [
      "StackBlitz から直接 Vercel に接続する",
      "GitHub にリポジトリを push し、そのリポジトリを Vercel でインポートする",
      "`.vercel` ディレクトリを手動で作成する",
      "Vercel CLI をインストールして `vercel deploy` を実行する",
    ],
    answer: 1,
    explanation:
      "StackBlitz → Vercel の基本フローは、StackBlitz プロジェクトを GitHub にエクスポート（push）してから Vercel でリポジトリをインポートするという手順です。",
  },
  {
    id: "q199",
    lesson: "lesson91",
    difficulty: "hard",
    question: "Next.js の `output: 'export'` を設定したときに Vercel で制限される機能はどれですか？",
    choices: [
      "静的ファイルの配信",
      "SSR や Server Actions など動的なサーバー機能が使えなくなる",
      "CSS Modules の使用",
      "TypeScript のコンパイル",
    ],
    answer: 1,
    explanation:
      "`output: 'export'` は完全な静的 HTML エクスポートです。Server Components のデータ取得・Server Actions・Route Handlers など、サーバー実行が必要な機能は使えません。",
  },
];
