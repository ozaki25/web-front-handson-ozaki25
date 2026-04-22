# lesson60: 共通レイアウトを作る

## ゴール

- `app/layout.tsx` の役割を理解し、全ページで共通のヘッダー・フッターを持てます。
- `children` という props を受け取って、中に各ページの中身を差し込む仕組みを把握できます。
- ルートレイアウトがデフォルトで Server Component であることを確認できます。

## 解説

### 同じ見た目を毎ページ書くのは大変

前のレッスンでは 3 つのページ（`/` `/about` `/todos`）を作りました。それぞれに同じナビを貼ろうとすると、毎ページで `<Link>` を並べたコードをコピペすることになります。リンクが 1 つ増えるたびに全ページを修正するのは明らかに辛いです。

この「全ページで共通の外側」を 1 箇所に集めるのが **レイアウト** の役割で、App Router では `layout.tsx` というファイル名で書きます。

### `app/layout.tsx` の最小形

StackBlitz の Next.js テンプレートには最初から `app/layout.tsx` が用意されています。中身は概ね次の形になっています。

```tsx
import type { ReactNode } from "react";

export const metadata = {
  title: "My App",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

重要なのは次の点です。

- **ルートレイアウト**（`app/layout.tsx`）は **必須** です。なければページがエラーになります。
- `<html>` と `<body>` は **このファイルが唯一の書き場所** です。各 `page.tsx` には書きません（前のレッスンで「コピーしない」と言ったのはこのためです）。
- `children` には、現在の URL に対応する `page.tsx` の中身（または下のフォルダの `layout.tsx`）が差し込まれます。
- `children` の型は `ReactNode` です。「React が画面に出せるもの全部」くらいの意味で、コピペで使えば良いです。
- `export const metadata` で `<title>` や OG 画像をまとめて設定できます（詳細は「小さなアプリを仕上げる」）。

### `children` の正体

`children` はこれまで章 4 の「コンポーネントと props」で軽く触った props と同じものです。親コンポーネントが「中に入れるもの」を子に渡すための特別な名前です。

レイアウトの場合、Next.js が現在 URL に対応する `page.tsx` を自動で `children` に入れてくれます。学習者が直接 `<RootLayout>` を呼ぶことはありません。

- `/` にアクセス → `app/page.tsx` の JSX が `children` に入る
- `/about` にアクセス → `app/about/page.tsx` の JSX が `children` に入る
- `/todos` にアクセス → `app/todos/page.tsx` の JSX が `children` に入る

### ルートレイアウトは Server Component

`app/layout.tsx` の先頭に `"use client"` は付いていないので、これは **Server Component** として動きます。ヘッダーやフッターなど、クリックで動くような仕掛けがなければ Server Component のままで良いです。

今回のようにナビ内の `<Link>` を並べるだけならイベントハンドラを使わないので、`"use client"` は不要です。

### レイアウトは入れ子にできる（予告）

実は `app/<path>/layout.tsx` を置くと、その配下のページだけに適用される追加のレイアウトが作れます。本コースでは **ルートレイアウト 1 枚** のみ使います（入れ子レイアウトは扱いません）。

## 演習

### 途中から始める場合

前のレッスンまでで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。

<details>
<summary>出発点のファイル（lesson59 完成時点）</summary>

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
              <img src="https://placehold.jp/300x200.png" alt="コーヒーのプレースホルダ画像" />
              <h3>コーヒー</h3>
              <p>朝の 1 杯が欠かせない。</p>
            </article>
            <article className="card">
              <img src="https://placehold.jp/300x200.png" alt="本のプレースホルダ画像" />
              <h3>本</h3>
              <p>技術書からエッセイまで。</p>
            </article>
            <article className="card">
              <img src="https://placehold.jp/300x200.png" alt="散歩のプレースホルダ画像" />
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

**`app/about/about.css`**

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

前のレッスンで作った StackBlitz プロジェクトを開き直しましょう。

### 手順 1: ヘッダーとフッターをルートレイアウトに集める

`app/layout.tsx` を以下に書き換えます。

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "My Next App",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
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

### 手順 2: 共通 CSS

`app/globals.css` を開き（StackBlitz テンプレートに既にあります）、末尾に以下を追加します。存在しなければ新規作成してください。

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

/* ダークモード色指定: 白背景前提にすると文字が読めなくなるため必ず上書き */
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

### 手順 3: 各ページからナビを消す

`app/page.tsx` から `<nav>` のブロックを削除し、ページ固有の中身だけにします。

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

`app/about/page.tsx` は前のレッスンで書いたままだと **ヘッダー・フッター・メインが二重になります**（layout.tsx 側でも `<header>` / `<main>` / `<footer>` を書いたためです）。ルートレイアウトが担当する外側要素と、ページ固有の中身を分離します。

前のレッスン時点の `app/about/page.tsx` から **`<header className="site-header">` ブロックと `<footer className="site-footer">` ブロックを削除** し、中身の `<section>` 3 つだけにします（外側の `<main>` / `<>` も不要、layout.tsx の `<main>` に入るため直接 `<section>` から書き始めます）。

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
            <img src="https://placehold.jp/300x200.png" alt="コーヒーのプレースホルダ画像" />
            <h3>コーヒー</h3>
            <p>朝の 1 杯が欠かせない。</p>
          </article>
          <article className="card">
            <img src="https://placehold.jp/300x200.png" alt="本のプレースホルダ画像" />
            <h3>本</h3>
            <p>技術書からエッセイまで。</p>
          </article>
          <article className="card">
            <img src="https://placehold.jp/300x200.png" alt="散歩のプレースホルダ画像" />
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

これで `/about` を開いても、ヘッダーとフッターは layout.tsx の 1 つずつだけになります。`about.css` のうち `.site-header` や `.site-footer` のスタイルは layout 側に移し、`about` ページ固有の `.cards` / `.card` スタイルだけを `about.css` に残す運用に整えます。

`app/todos/page.tsx` も同様にページ固有の中身だけ残します。

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

- どのページにアクセスしても、画面上部に「Home / About / Todos」のナビ、下部に「&copy; 2026 My Next App」のフッターが表示されます。
- ナビをクリックするとページ本体だけが差し替わります（ヘッダー・フッターは再レンダリングされません）。
- ブラウザタブのタイトルが「My Next App」になっています（`export const metadata` によります）。

### 変えてみる

1. `metadata.title` を自分のアプリ名に変えて、タブ名が変わるのを確認しましょう。
2. フッターの著作権表示を自分の名前に変えましょう。
3. 試しに `app/about/layout.tsx` を作って、そこに `<h2>自己紹介セクション</h2>` を入れてみましょう。`/about` の中だけにそのタイトルが追加されることを確認したら、実験が終わったらそのファイルは削除します（本コースではルートレイアウト 1 枚運用）。

### 自分で書く

`app/layout.tsx` を何も見ずに、`<html>` `<body>` `{children}` の最小構成から書き直してみましょう。ヘッダーとフッターを再度足して、見た目が崩れないことを確認します。

## まとめ

- `app/layout.tsx` は全ページ共通の外側の枠です。`<html>` と `<body>` はここだけに書きます。
- `children` に現在のページ（`page.tsx`）の中身が自動で差し込まれます。
- ルートレイアウトは何もしなければ Server Component です。ナビや文字を並べるだけなら `"use client"` は不要です。
- 共通部分を 1 箇所に集めたので、ページを増やしても繰り返しコードが増えません。
- このあとの「Server Component と Client Component」で、2 つの違いに踏み込みます。`useState` が必要な部品だけを Client にする使い分けを覚えましょう。
