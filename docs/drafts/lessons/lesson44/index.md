# lesson44: ページを増やしてリンクで移動する

## ゴール

- `app/` の下にディレクトリと `page.tsx` を追加して、新しい URL のページを作れる。
- `next/link` の `<Link>` を使って、ページ遷移を SPA 風に高速化できる。
- 章 1 lesson11 で作った自己紹介ページの HTML を JSX に書き換え、`/about` として復活させられる。
- HTML と JSX の主な違い 3 点（`class`、`for`、自己閉じタグ）を意識して書ける。

## 解説

### 前回のプロジェクトを開く

前の lesson43 で作った StackBlitz の Next.js プロジェクトを開き直す。左上のメニューに戻るか、保存済みなら `https://stackblitz.com/` の「Your projects」から開ける。

### 新しいページを作る手順

App Router では、ディレクトリ名がそのまま URL になります。`/about` というページを作るには次の 2 ステップだけ。

1. `app/` の下に `about/` ディレクトリを作る。
2. その中に `page.tsx` を作り、コンポーネントを `export default` する。

```
app/
├── page.tsx           → /
├── about/
│   └── page.tsx       → /about
└── todos/
    └── page.tsx       → /todos
```

`/todos` も同じ要領。`app/todos/page.tsx` を作るだけで `/todos` でアクセスできる。

### HTML → JSX の違い 3 点

章 1 で書いた HTML を Next.js に持ち込むと、そのままでは動かない。JSX は JavaScript の中で書く拡張記法なので、JS 予約語との衝突や XML の厳密さから **3 点だけ** 書き換えが必要。

1. `class` → `className`
   - JS の `class` 構文（クラス構文）と衝突するため、JSX では `className` を使う。
   - 例: `<p class="lead">` → `<p className="lead">`
2. `for`（`<label for="...">`）→ `htmlFor`
   - `for` も JS の `for` 文と衝突するため、`htmlFor` に変える。
   - 例: `<label for="name">` → `<label htmlFor="name">`
3. 自己閉じタグに `/` が必要
   - HTML では `<img>` や `<br>` は終了タグなしで書けるが、JSX では必ず `/` で閉じる。
   - 例: `<img src="..." alt="">` → `<img src="..." alt="" />`
   - 例: `<br>` → `<br />`

他にも細かい違いはあるが、当面はこの 3 点を意識すれば章 1 の HTML を移植できる。

### `<Link>` でページ遷移する

ブラウザの `<a href="...">` でもページは切り替わるが、その都度ページ全体を再読み込みする重い動きになる。Next.js では `next/link` の `<Link>` を使うことで、必要な部分だけを差し替える軽い遷移ができる。

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

- `import` は **`next/link`** から（`next/router` ではない。`next/router` は古い Pages Router 用）。
- `href` の値は `/about` のように **URL のパス**。
- `<Link>` は内部的には `<a>` タグを生成するので、見た目は普通のリンクと同じ。

## 演習

### 手順 1: `/todos` の空ページを作る

StackBlitz のファイルツリーで、`app/` を右クリックして「New Folder」→ `todos` を作る。その中に「New File」で `page.tsx` を作り、以下を貼る。

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

ブラウザのプレビュー URL に `/todos` を付けてアクセスし、この文言が出ることを確認する。

### 手順 2: 章 1 の自己紹介ページを `/about` に移植

章 1 lesson11 で作った自己紹介ページの HTML と CSS をもう一度開く。このレッスンでは **lesson11 の最終成果物（`.site-header` / `.cards` / 3 枚のカード / 問い合わせフォーム）をそのまま移植** する想定で進める。手元に無ければ、lesson11 を開いて HTML / CSS をコピーしてから戻ってくる。

元の HTML（lesson11 の完成形の抜粋）:

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>私の自己紹介</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="site-header">
      <h1>私の名前</h1>
      <nav class="site-nav">
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
        <div class="cards">
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="コーヒーのプレースホルダ画像">
            <h3>コーヒー</h3>
            <p>朝の 1 杯が欠かせない。</p>
          </article>
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="本のプレースホルダ画像">
            <h3>本</h3>
            <p>技術書からエッセイまで。</p>
          </article>
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="散歩のプレースホルダ画像">
            <h3>散歩</h3>
            <p>行き先を決めずに歩く。</p>
          </article>
        </div>
      </section>

      <section id="contact">
        <h2>問い合わせ</h2>
        <form>
          <div>
            <label for="name">お名前</label>
            <input id="name" name="name" type="text" required>
          </div>
          <div>
            <label for="email">メール</label>
            <input id="email" name="email" type="email" required>
          </div>
          <div>
            <label for="message">メッセージ</label>
            <textarea id="message" name="message" rows="4" required></textarea>
          </div>
          <button type="submit">送信</button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <p>&copy; 私の名前</p>
    </footer>
  </body>
</html>
```

これを `app/about/page.tsx` に、**3 点の違い** だけ差し替えてコピーする。`<!DOCTYPE html>` / `<html>` / `<head>` / `<body>` は `app/layout.tsx`（lesson45 で扱う）が担当するので **コピーしない**。`<header>` 〜 `<footer>` の中身だけ移す。

`app/about/page.tsx`:

```tsx
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

書き換えたのは **HTML → JSX の 3 点の違い** にほぼ収まる:

- `class="..."` → `className="..."`（`.site-header` / `.site-nav` / `.cards` / `.card` / `.site-footer` すべて）
- `<label for="...">` → `<label htmlFor="...">`（3 箇所）
- `<input ...>` → `<input ... />`、`<img ...>` → `<img ... />` の自己閉じ
- 追加で `<textarea rows="4">` の属性は **数値中括弧 `rows={4}`** に（JSX では数値属性は中括弧が慣例）

ほぼ機械的な置換で済むのが JSX の嬉しいところ。章 1 で作った見た目・レイアウトがそのまま Next.js で動く。

### 手順 3: CSS を当てる

章 1 lesson11 の `style.css` の中身は、`app/about/about.css` のようなファイル名で `app/about/` に置き、`page.tsx` の先頭で `import` する。中身はそのまま流用できる（セレクタは HTML 要素名やクラス名を見ているので、JSX でも同じセレクタが効く）。

`app/about/about.css`（lesson11 の CSS をそのまま貼る、抜粋）:

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

（フォームや hover など、lesson11 で書いた他のスタイルも一緒にコピーしてよい。）

`app/about/page.tsx` の **1 行目に CSS の import を追加する**。ファイル全体は次のような形になる（関数本体は先ほど書いたものをそのまま維持する）。

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

**期待出力**: `/about` を開くと、章 1 lesson11 で作ったページと **ほぼ同じ見た目** になる。ヘッダーの `<h1>` と `<nav>` が横並び、カードが 3 枚横並び、スマホ幅（600px 以下）で縦並びに切り替わる、というレスポンシブ挙動もそのまま生きる。

### 手順 4: ナビを `/` に置く

`app/page.tsx` を以下に書き換える。これでトップページから 3 つのページに飛べるナビが完成する。

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

- `/` にアクセスすると「ようこそ」の見出しと 3 つのリンクが出る。
- 「About」をクリックすると章 1 と同じ見た目の自己紹介ページが表示される（CSS が当たっている）。
- 「Todos」をクリックすると「TODO 一覧はここに実装する。」が表示される。
- ブラウザのネットワークタブを開きながら遷移すると、ページ全体ではなくデータだけが追加で読み込まれる（フル再読み込みにはならない）。
- `class` や `for` をそのまま残すと、StackBlitz のターミナルやブラウザ Console に「Invalid DOM property `class`. Did you mean `className`?」のような警告が出る。

### 変えてみる

1. 自己紹介ページに好きな見出しを 1 つ追加する。
2. `/about` のナビ内に「Top に戻る」`<Link>` を追加する。

### 自分で書く

`/contact` という 3 つ目のページを、ディレクトリ作成 → `page.tsx` → ナビへの `<Link>` 追加、の手順だけを見ないで試してみる。中身は「Contact ページです」の 1 行で十分。

## まとめ

- `app/<path>/page.tsx` を作ると、そのディレクトリ名がそのまま URL のパスになる。
- ページ遷移は `next/link` の `<Link>` で。`<a>` より軽い遷移になる。
- HTML を JSX にするときは **3 点だけ** 書き換える: `class` → `className`、`for` → `htmlFor`、自己閉じタグに `/`。
- 章 1 の自己紹介ページを `/about` として復活させた。`/todos` は次以降で中身を作っていく。
- 次の lesson45 では、ヘッダーやフッターの繰り返しを `layout.tsx` にまとめる。
