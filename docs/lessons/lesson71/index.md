# lesson71: ページを増やしてリンクで移動する

## ゴール

- `app/` の下にディレクトリと `page.tsx` を追加して、新しい URL のページを作れる
- `next/link` の `<Link>` を使ってページ間を遷移できる
- `<Link>` が普通の `<a>` より速い理由（プリフェッチと部分更新）を説明できる
- 1 章 で書いた HTML を、4 章 で学んだ JSX のルールに従って Next.js に移植できる

## 解説

### 前回のプロジェクトを開く

「Next.js ってなに？」で作った StackBlitz の Next.js プロジェクトを開き直しましょう。GitHub ログインしている場合は <https://stackblitz.com/dashboard> から保存済みのプロジェクトを開けます。

### 新しいページを作る手順

App Router では、ディレクトリ名がそのまま URL になります。`/about` というページを作るには次の 2 ステップだけです。

1. `app/` の下に `about/` ディレクトリを作る
2. その中に `page.tsx` を作り、コンポーネントを `export default` する

```
app/
├── page.tsx           → /
├── about/
│   └── page.tsx       → /about
└── todos/
    └── page.tsx       → /todos
```

`/todos` も同じ要領です。`app/todos/page.tsx` を作るだけで `/todos` でアクセスできます。

### `<html>` / `<body>` は誰が出している？

`app/page.tsx` には `<h1>` や `<main>` しか書きませんでした。にも関わらずブラウザに完全な HTML が届いていたのは、**`app/layout.tsx`** が裏で `<html>` / `<body>` を出してくれているからです。

```tsx
// app/layout.tsx（テンプレートに最初から入っている）
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`children` の位置に各ページの `page.tsx` の中身が差し込まれます。そのため `page.tsx` 側では `<!DOCTYPE>` も `<html>` も `<body>` も書きません。`layout.tsx` の使い方は「共通レイアウトを作る」のレッスンで詳しく扱います。

### `<Link>` でページ遷移する

ページ間を移動するには、`next/link` から `<Link>` を import して使います。

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/todos">Todos</Link>
    </nav>
  );
}
```

- import は **`next/link`** から（`next/router` は古い Pages Router 用なので使わない）
- `href` には `/about` のように **URL のパス** を渡す
- ブラウザに描画されるのは普通の `<a>` タグなので、見た目は通常のリンクと同じ

#### `<a>` ではなく `<Link>` を使う理由

普通の `<a href="...">` でクリックすると、ブラウザは **ページ全体を再読み込み** します。HTML / CSS / JS をもう一度ダウンロードし、画面が一瞬白くなり、スクロール位置もリセットされます。

`<Link>` は、URL バーは変わるが **画面全体の再読み込みはしない** 動きをします。Next.js が「変わった部分（`page.tsx` の中身）」だけを差し替えてくれるので、共通レイアウトや既に読み込んだ JS はそのまま再利用されます。これは **SPA（Single Page Application）** と呼ばれる方式で、ページ切り替えの体感速度が大きく変わります。

加えて `<Link>` は **プリフェッチ** という挙動を持ちます。リンクが画面に表示された時点で、Next.js が遷移先のページデータをバックグラウンドで先取りしておくため、クリックした瞬間に表示が間に合うという仕組みです。

### HTML を JSX に貼り換える時の注意

4 章 の「JSX を書く」で学んだ通り、HTML をそのまま JSX に貼ると 3 点の書き換えが必要です。

| HTML | JSX |
| --- | --- |
| `class="..."` | `className="..."` |
| `<label for="...">` | `<label htmlFor="...">` |
| `<img src="...">`（終了タグなし） | `<img src="..." />`（自己閉じが必須） |

加えて、JSX で **数値を属性に渡すときは中括弧** にする慣例があります（例: `<textarea rows={4}>`）。

このレッスンの後半で、1 章 の自己紹介ページを Next.js に移植します。書き換えはこの 3 点（＋数値中括弧）にほぼ収まります。

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。手順 2 で 1 章 の「Flexbox とレスポンシブ」で作った自己紹介ページの HTML / CSS を流用するので、手元になければ「Flexbox とレスポンシブ」を開いてコピーしておくとスムーズです。

### 手順 1: `/todos` の空ページを作る

StackBlitz のファイルツリーで `app/` を右クリック → 「New Folder」で `todos` を作ります。その中に「New File」で `page.tsx` を作り、以下を貼ります。

```tsx
export default function TodosPage() {
  return (
    <main>
      <h1>TODO 一覧</h1>
      <p>TODO 一覧はここに実装する。</p>
    </main>
  );
}
```

ブラウザのプレビュー URL に `/todos` を付けてアクセスし、この文言が表示されることを確認します。

### 手順 2: 1 章 の自己紹介ページを `/about` に移植

1 章 の「Flexbox とレスポンシブ」で作った自己紹介ページの HTML と CSS をもう一度開きます。**「Flexbox とレスポンシブ」の最終成果物**（`.site-header` / `.cards` / 3 枚のカード / 問い合わせフォーム）をそのまま移植する想定です。手元に無ければ、「Flexbox とレスポンシブ」を開いて HTML / CSS をコピーしてから戻ってきてください。

`app/about/` ディレクトリを作り、その中に `page.tsx` を作ります。1 章 の HTML のうち `<header>` 〜 `<footer>` の中身だけを移します（`<!DOCTYPE>` / `<html>` / `<head>` / `<body>` は `app/layout.tsx` が担当するので **コピーしません**）。

`app/about/page.tsx`:

```tsx
import "./about.css";

export default function AboutPage() {
  return (
    <>
      <header className="site-header">
        <h1>私の名前</h1>
        <nav className="site-nav">
          <a href="#about">自己紹介</a>
          <a href="#likes">好きなもの</a>
          <a href="#contact">問い合わせ</a>
        </nav>
      </header>

      <main>
        <section id="about">
          <h2>自己紹介</h2>
          <p>Web フロントエンドを学び中です。HTML / CSS / JavaScript から順に手を動かして進めています。</p>
        </section>

        <section id="likes">
          <h2>好きなもの</h2>
          <div className="cards">
            <article className="card">
              <img src="https://placehold.co/300x200.png" alt="コーヒーのプレースホルダ画像" />
              <h3>コーヒー</h3>
              <p>朝の 1 杯が欠かせない。</p>
            </article>
            <article className="card">
              <img src="https://placehold.co/300x200.png" alt="本のプレースホルダ画像" />
              <h3>本</h3>
              <p>技術書からエッセイまで。</p>
            </article>
            <article className="card">
              <img src="https://placehold.co/300x200.png" alt="散歩のプレースホルダ画像" />
              <h3>散歩</h3>
              <p>行き先を決めずに歩く。</p>
            </article>
          </div>
        </section>

        <section id="contact">
          <h2>問い合わせ</h2>
          <form>
            <div>
              <label htmlFor="name">お名前</label>
              <input id="name" name="name" type="text" required />
            </div>
            <div>
              <label htmlFor="email">メール</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="message">メッセージ</label>
              <textarea id="message" name="message" rows={4} required></textarea>
            </div>
            <button type="submit">送信</button>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <p>&copy; 私の名前</p>
      </footer>
    </>
  );
}
```

書き換えポイントは **HTML → JSX の 3 点** だけです。

- `class="..."` → `className="..."`（`.site-header` / `.site-nav` / `.cards` / `.card` / `.site-footer` すべて）
- `<label for="...">` → `<label htmlFor="...">`（3 箇所）
- `<input ...>` → `<input ... />`、`<img ...>` → `<img ... />` の自己閉じ
- `<textarea rows="4">` の `rows` を **数値中括弧 `rows={4}`** に

複数要素を返すために全体を `<>...</>`（フラグメント）で包んでいます。これは 4 章 の「JSX を書く」で扱った「コンポーネントは 1 つの要素しか return できない」というルールへの対処です。

### 手順 3: CSS を当てる

1 章 の「Flexbox とレスポンシブ」の `style.css` の中身を、`app/about/about.css` というファイル名で `app/about/` 直下に置きます。中身はそのまま貼って構いません（セレクタは HTML 要素名やクラス名を見るので、JSX の `className` で付けたクラスにもそのまま効きます）。

`app/about/about.css`（「Flexbox とレスポンシブ」の CSS の主要部分を抜粋）:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #f9fafb;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #e5e7eb;
    background-color: #0b1220;
  }
}

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.site-header {
  padding: 16px 24px;
  background-color: #1e3a8a;
  color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-nav a {
  color: #f9fafb;
  margin-right: 16px;
}

.cards {
  display: flex;
  gap: 16px;
}

.cards .card {
  flex: 1;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
}

@media (prefers-color-scheme: dark) {
  .cards .card {
    background-color: #111827;
    border-color: #374151;
  }
}

.card img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.site-footer {
  padding: 16px 24px;
  background-color: #1e3a8a;
  color: #f9fafb;
  text-align: center;
}

@media (max-width: 600px) {
  .site-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .cards {
    flex-direction: column;
  }
}
```

フォームの装飾や hover の色など、「Flexbox とレスポンシブ」で書いた他のスタイルも一緒にコピーして構いません。

`app/about/page.tsx` の **1 行目に `import "./about.css";`** を書いておきます（手順 2 のコードで既に書いてあります）。これだけで `/about` を開いた時にこの CSS が適用されます。

### 手順 4: トップページにナビを置く

`app/page.tsx` を以下に書き換えます。これでトップページから 3 つのページに飛べるナビが完成します。

```tsx
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>ようこそ</h1>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/todos">Todos</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
```

### 期待出力

- `/` にアクセスすると「ようこそ」の見出しと 3 つのリンクが表示される
- 「About」をクリックすると 1 章 と同じ見た目の自己紹介ページが表示される（CSS が当たっている）
- 「Todos」をクリックすると「TODO 一覧はここに実装する。」が表示される
- リンクをクリックしてもブラウザのリロードアイコンが回らず、画面全体が一瞬白くなることもない（SPA 遷移の合図）
- DevTools の Network タブを開いて遷移すると、HTML / CSS / JS の再ダウンロードは発生せず、Next.js のデータのみが取得されている

#### よくあるエラー

- `class` のまま放置すると、StackBlitz のターミナルやブラウザ Console に `Invalid DOM property `class`. Did you mean `className`?` という警告が出ます。`className` に直してください
- `<img>` を自己閉じにし忘れると `Expected corresponding JSX closing tag for <img>` のエラーが出ます

### 変えてみる

1. 自己紹介ページに好きな見出しを 1 つ追加してみる
2. `/about` のナビ内に `<Link href="/">Top に戻る</Link>` を追加してみる

### 自分で書く

`/contact` という 3 つ目のページを、ディレクトリ作成 → `page.tsx` 追加 → ナビへの `<Link>` 追加、の手順だけを見ないで試してみましょう。中身は「Contact ページです」の 1 行で十分です。

## まとめ

- `app/<path>/page.tsx` を作ると、そのディレクトリ名がそのまま URL のパスになる
- `<html>` / `<body>` は `app/layout.tsx` が担当するので、`page.tsx` には書かない
- ページ遷移は `next/link` の `<Link>` で行う。`<a>` と違って画面全体を再読み込みしない（SPA 遷移）
- `<Link>` は表示された時点で遷移先データを **プリフェッチ** するため、クリック後の表示が速い
- HTML を JSX にするときは `class` → `className`、`for` → `htmlFor`、自己閉じタグに `/`（4 章 の「JSX を書く」で学んだ通り）
