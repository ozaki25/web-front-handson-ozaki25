# lesson72: 共通レイアウトを作る

## ゴール

- `app/layout.tsx` の役割を理解し、全ページで共通のヘッダー・フッターを 1 箇所にまとめられる
- `children` という props を受け取って、各ページの中身を差し込む仕組みを把握できる
- ルートレイアウトが既定で Server Component であることを理解する

## 解説

### 同じ見た目を毎ページ書くのは大変

「ページを増やしてリンクで移動する」で 3 つのページ（`/` `/about` `/todos`）を作りました。それぞれに同じナビを貼ろうとすると、ナビのコードを全ページにコピペすることになります。リンクが 1 つ増えるたびに 3 ファイルを直す必要があり、ページが増えるほど辛くなります。

この **「全ページで共通の外側」** を 1 箇所にまとめるのが **レイアウト** の役割で、App Router では `layout.tsx` というファイル名で書きます。

### `app/layout.tsx` の最小形

StackBlitz の Next.js テンプレートには、最初から `app/layout.tsx` が入っています。中身はおおよそ次の形です。

```tsx
export const metadata = {
  title: "My App",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

このファイルは **ルートレイアウト**（root layout）と呼ばれ、Next.js プロジェクトに **必須** です。削除するとビルドエラーになります。

押さえるべきポイントは 3 つです。

- **`<html>` と `<body>` を書くのはこのファイルだけ**: 各 `page.tsx` には書きません。「ページを増やしてリンクで移動する」で `<!DOCTYPE>` などをコピーしなかったのはこのためです
- **`children` に各ページの中身が自動で入る**: `/about` を開けば `app/about/page.tsx` の JSX が、`/todos` なら `app/todos/page.tsx` が、それぞれ `children` に差し込まれます
- **`metadata` でタブのタイトルや OG 画像を設定できる**: `<head>` 内の `<title>` などに反映されます（詳細は「Metadata API で SEO を整える」）

::: tip `LayoutProps<"/">` の型はどこから来た？
`LayoutProps<"/">` は Next.js 16 が **自動生成するグローバル型** です。`import` 不要で、`next dev` / `next build` のたびに `.next/types/` に各ルート用の型が用意されます。第 1 引数の `"/"` はこのレイアウトが覆うルートのパスを表します。本コースではルートレイアウト 1 枚しか使わないので、常に `"/"` のままで構いません。
:::

### `children` の流れを追う

`children` の動きをもう少し具体的に追ってみます。例えばユーザーが `/about` にアクセスした場合、Next.js は内部的に次のような JSX を組み立てます。

```tsx
<RootLayout>
  <AboutPage />
</RootLayout>
```

つまり `<AboutPage />` が `RootLayout` の `children` に入る形です。`/todos` なら `<TodosPage />`、`/` なら `<Page />` が入ります。`<RootLayout>` を書いた人（あなた）が手動で呼ぶことはなく、**Next.js がルーティングに応じて勝手に差し替えて** くれます。

### ルートレイアウトは Server Component

`app/layout.tsx` の先頭に `"use client"` が付いていないので、ルートレイアウトは既定で **Server Component** として動きます（「Next.js ってなに？」で触れた通り、何もしなければサーバー側で実行されます）。

ナビの `<Link>` を並べるだけ・著作権表示を出すだけなら `useState` も `onClick` も不要なので、Server Component のままで問題ありません。これにより、ナビ部分の JS はブラウザに送られず、表示が軽くなります。

ハンバーガーメニューのトグルなど **クリックで開閉する仕掛け** が要るときは、その部分だけを別の Client Component に切り出して呼び出します（詳しくは「Server Component と Client Component」で扱います）。

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。

<details>
<summary>出発点のファイル</summary>

**`app/page.tsx`**

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

**`app/about/page.tsx`**

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

**`app/about/about.css`**: 「ページを増やしてリンクで移動する」の手順 3 で作成したファイルをそのまま使います。

**`app/todos/page.tsx`**

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

</details>

### 前回のプロジェクトを開く

これまでのレッスンで作った StackBlitz プロジェクトを開き直しましょう。

### 手順 1: ヘッダーとフッターをルートレイアウトに集める

`app/layout.tsx` を以下に書き換えます（StackBlitz テンプレートに既にあるファイルを上書き）。

```tsx
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "My Next App",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
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
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>&copy; 2026 My Next App</p>
        </footer>
      </body>
    </html>
  );
}
```

これで全ページに共通のヘッダー（ナビ）とフッターが付きます。`{children}` の位置に各ページの `page.tsx` の中身が差し込まれます。

### 手順 2: 共通 CSS

`app/globals.css` を開きます（StackBlitz テンプレートに最初から入っています）。中身は触らずに、末尾に以下を **追加** してください。

```css
.site-header ul {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 1rem;
  background: #f5f5f5;
}

.site-header a {
  text-decoration: none;
  color: #0070f3;
}

.site-footer {
  padding: 1rem;
  border-top: 1px solid #ddd;
  color: #555;
}

@media (prefers-color-scheme: dark) {
  .site-header ul {
    background: #1f1f1f;
  }
  .site-header a {
    color: #4ea2ff;
  }
  .site-footer {
    border-top-color: #333;
    color: #bbb;
  }
}
```

`globals.css` は `app/layout.tsx` の `import "./globals.css"` で読み込まれているので、書いたスタイルは全ページで効きます。

### 手順 3: 各ページからヘッダー・フッターを消す

`layout.tsx` でヘッダー・フッターを出すようになったので、各 `page.tsx` から重複しているナビ・ヘッダー・フッターを削除します。

`app/page.tsx`: `<nav>` のブロックを削除し、ページ固有の中身だけにします。

```tsx
export default function Page() {
  return (
    <>
      <h1>ようこそ</h1>
      <p>このアプリについてはヘッダーのリンクから。</p>
    </>
  );
}
```

`app/about/page.tsx`: `<header className="site-header">` ブロックと `<footer className="site-footer">` ブロック、外側の `<main>` を削除し、`<section>` 3 つだけ残します（外側の `<main>` は `layout.tsx` 側にあるためです）。

```tsx
import "./about.css";

export default function AboutPage() {
  return (
    <>
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
    </>
  );
}
```

`app/about/about.css`: layout で `.site-header` / `.site-footer` のスタイルを担当するようになったので、`about.css` 内の **`.site-header`、`.site-nav`、`.site-footer` セレクタは削除** します。`.cards` / `.card` などページ固有のスタイルだけ残します。

`app/todos/page.tsx`: 同様に外側の `<main>` を外します。

```tsx
export default function TodosPage() {
  return (
    <>
      <h1>TODO 一覧</h1>
      <p>TODO 一覧はここに実装する。</p>
    </>
  );
}
```

### 期待出力

- どのページにアクセスしても、画面上部に「Home / About / Todos」のナビ、下部に「&copy; 2026 My Next App」のフッターが表示される
- 各リンクをクリックすると、ヘッダーとフッターはそのまま残り、中央のページ本体だけが切り替わる
- ブラウザタブのタイトルが「My Next App」になっている（`export const metadata` が効いている合図）

### 変えてみる

1. `metadata.title` を自分のアプリ名に変えて、ブラウザのタブ名が変わるのを確認する
2. フッターの著作権表示を自分の名前に変えてみる

### 自分で書く

`app/layout.tsx` を何も見ずに、`<html>` `<body>` `{children}` の最小構成から書き直してみましょう。書けたらヘッダーとフッターを再度足して、見た目が崩れないことを確認します。

## まとめ

- `app/layout.tsx` は全ページ共通の外側の枠。`<html>` / `<body>` はここだけに書く
- `children` には現在の URL に対応する `page.tsx` の中身が、Next.js によって自動で差し込まれる
- ルートレイアウトは何もしなければ Server Component として動く。ナビや文字を並べるだけなら `"use client"` は不要
- 共通部分を 1 箇所にまとめたので、ページが増えても繰り返しコードが増えない
