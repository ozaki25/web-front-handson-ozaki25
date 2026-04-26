# lesson69: Next.js ってなに？

## ゴール

- Next.js が何を担うフレームワークなのか、React との関係を自分の言葉で説明できます。
- App Router のファイルベースルーティングの基本ルール（`app/page.tsx` がトップページ）を理解します。
- 画面に出る部品がデフォルトで **Server Component** として動くことを知ります。
- StackBlitz の Next.js テンプレートから最小のプロジェクトを立ち上げてトップページを表示できます。

## 解説

### React と Next.js の関係

4 章 までで学んだ React は、**UI を組み立てるためのライブラリ** でした。画面の見た目とその更新の仕組み（state / props / 再レンダリング）は React が担当します。

一方で、実際に Web アプリを作ろうとすると、React 単体では足りないものが出てきます。

- URL に応じてページを切り替える仕組み（ルーティング）
- SEO やシェア用にページごとのタイトルや OG 画像を設定する仕組み
- 一部の処理をサーバーで先に走らせ、初期表示を速くする仕組み
- データ取得やフォーム送信をサーバーに任せる仕組み

こうした「React の周りに必要な土台」を一式まとめて提供するのが **Next.js** です。Next.js は React を内部で使っているので、React のコンポーネントの書き方はそのまま使えます。React の上に乗る大きめの枠組み、と考えてください。

このコースで使うバージョンは **Next.js 16** / **React 19.2** です。

### App Router とは

Next.js には現在 2 つのルーター（URL の担当部分）があります。

- 古い方: `pages/` ディレクトリを使う Pages Router
- 新しい方: `app/` ディレクトリを使う **App Router**

本コースでは新しい **App Router** のみを扱います。古い `pages/` ルーターは使いません。

App Router は **ファイルベースルーティング** です。つまり、`app/` 以下のディレクトリ構造がそのまま URL になります。

```
app/
├── page.tsx           → /
├── about/
│   └── page.tsx       → /about
└── todos/
    └── page.tsx       → /todos
```

`page.tsx` という名前のファイルが、その URL で表示される中身を書く場所です。ディレクトリ名がそのまま URL のパスになります。

### Server Component がデフォルト

App Router のもう 1 つの大きな特徴は、**コンポーネントが既定でサーバー側で実行される** ことです。これを **Server Component** と呼びます。

今までの React（4 章）は、すべてブラウザ（クライアント）で動いていました。App Router ではまずサーバーで React を動かし、その結果をブラウザに届けます。

- Server Component: サーバーで動きます。データベース接続やファイル読み込みなど、秘密情報を扱えます。`useState` や `onClick` は使えません。
- Client Component: ブラウザで動きます。`useState` / イベント / ブラウザ API が使えます。先頭に `"use client"` と書いて明示します（詳しくは「Server Component と Client Component」で扱います）。

最初は「書いたコンポーネントは何もしなければサーバー側で動く」とだけ覚えておけば十分です。

### `app/page.tsx` の最小形

App Router で最初に書くトップページは、こんな形です。

```tsx
export default function Page() {
  return (
    <main>
      <h1>Hello, Next.js</h1>
      <p>最初のページ。</p>
    </main>
  );
}
```

- ファイル名は `page.tsx` 固定です。
- `export default` で関数コンポーネントを 1 つ返します。
- 関数名は何でも構いません（慣例で `Page` とすることが多いです）。

これだけで、`/`（トップページ）にアクセスしたときにこの JSX が表示されます。

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。

### 使う環境

本コース5 章 ではすべて StackBlitz の **Next.js**（TypeScript）テンプレートを使います。4 章 の React + Vite テンプレートとは別物なので、新しく作り直してください。

### 手順

1. 直リンク <https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world> を開きます（Next.js の hello-world テンプレートが Node を内部で動かす WebContainers 上で立ち上がります。初回は依存インストールに数十秒〜 1 分ほどかかります）。
2. プロジェクトが起動したら、左側のファイルツリーから `app/page.tsx` を開きます。
3. 中身をすべて消し、次のコードに置き換えます。

```tsx
export default function Page() {
  return (
    <main>
      <h1>Hello, Next.js</h1>
      <p>最初のページ。</p>
    </main>
  );
}
```

保存すると、右側のプレビューに **「Hello, Next.js」と「最初のページ。」** が表示されます。

### 期待出力

- プレビュー画面の一番上に大きな文字で「Hello, Next.js」、その下に「最初のページ。」が並びます。
- URL バーには `/` で始まるパス（StackBlitz のプレビュー URL）が表示されます。
- StackBlitz の下部ターミナルに `Ready` などのメッセージが出ています。

### 変えてみる

1. `<h1>` の文字を `自己紹介アプリの入り口` に変えて保存します。プレビューが更新されることを確認しましょう。
2. `<p>` を 2 行に増やします。

```tsx
export default function Page() {
  return (
    <main>
      <h1>自己紹介アプリの入り口</h1>
      <p>最初のページ。</p>
      <p>これから少しずつページを増やす。</p>
    </main>
  );
}
```

### ファイル構造を眺める

左側のツリーから以下を開いて中身を確認しましょう。書き換えは不要です。

- `app/layout.tsx`: 全ページ共通の外側の枠（`<html>` と `<body>` の中身）。「共通レイアウトを作る」で触ります。
- `app/page.tsx`: 今書き換えたトップページ。
- `package.json`: 依存パッケージと `scripts`。`"dev"`, `"build"`, `"start"` などが並んでいます。

`app/` 以下にディレクトリを作って `page.tsx` を置けば、それがそのまま URL になります。これを別のレッスンで実際にやります。

### 自分で書く

`app/page.tsx` を何も見ずに書き直してみましょう。`export default function ... { return (...) }` の形だけがポイントなので、ここが書ければ合格です。

## まとめ

- Next.js は React の上に「ルーティング」「サーバー実行」「メタデータ」などの土台を載せたフレームワークです。
- 本コースでは **App Router**（`app/` ディレクトリ）のみを扱います。`pages/` 形式は使いません。
- `app/page.tsx` がトップページ（`/`）の中身です。ディレクトリ名がそのまま URL になります。
- 書いたコンポーネントは何もしなければ **Server Component** としてサーバー側で動きます。
- 別のレッスンでページを増やして `<Link>` で行き来し、1 章 の自己紹介ページを `/about` として復活させます。

### コラム: RSC ペイロードって何？

Server Component の結果は、実は **HTML そのもの** としてブラウザに届くわけではありません。Next.js はサーバー側で React をレンダリングし、その結果を **React が読める特殊な形式**（RSC ペイロードと呼ばれる）に変換してブラウザに送ります。ブラウザ側の React はそれを受け取って、ページのツリーに差し込みます。

ブラウザの「ソースを表示」で見える HTML は、初回表示用に別で生成された HTML です。ページ遷移（「ページを増やしてリンクで移動する」の `<Link>`）では、RSC ペイロードだけが追加で送られてきて、必要な部分だけがツリーに差し替わります。

本コースでは RSC ペイロードの詳細までは踏み込みませんが、「Server Component は HTML を直接返すのとは違う仕組みで動いている」とだけ覚えておけば、後の章で困りません。
