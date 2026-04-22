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

章 1 lesson11 で作った自己紹介ページの HTML をもう一度開く。保存してない場合は、以下のようなシンプルな HTML を使ってよい。

元の HTML（例）:

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>自己紹介</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header>
      <h1>自己紹介</h1>
    </header>
    <main>
      <section>
        <h2>プロフィール</h2>
        <img src="/avatar.png" alt="アイコン" class="avatar">
        <p class="lead">こんにちは、フロント学習中です。</p>
      </section>
      <section>
        <h2>問い合わせ</h2>
        <form>
          <label for="name">名前</label>
          <input id="name" name="name" type="text" required>
          <br>
          <button type="submit">送信</button>
        </form>
      </section>
    </main>
    <footer>
      <p>&copy; 2026</p>
    </footer>
  </body>
</html>
```

これを `app/about/page.tsx` に、**3 点の違い** だけ差し替えてコピーする。`<!DOCTYPE html>` / `<html>` / `<head>` / `<body>` は `app/layout.tsx`（lesson45 で扱う）が担当するので **コピーしない**。`<main>` 以下のコンテンツだけ移す。

`app/about/page.tsx`:

```tsx
export default function AboutPage() {
  return (
    <main>
      <header>
        <h1>自己紹介</h1>
      </header>
      <section>
        <h2>プロフィール</h2>
        <img src="/avatar.png" alt="アイコン" className="avatar" />
        <p className="lead">こんにちは、フロント学習中です。</p>
      </section>
      <section>
        <h2>問い合わせ</h2>
        <form>
          <label htmlFor="name">名前</label>
          <input id="name" name="name" type="text" required />
          <br />
          <button type="submit">送信</button>
        </form>
      </section>
      <footer>
        <p>&copy; 2026</p>
      </footer>
    </main>
  );
}
```

書き換えたのは次の 4 箇所（3 点ルールに従って）:

- `class="avatar"` → `className="avatar"`
- `class="lead"` → `className="lead"`
- `for="name"` → `htmlFor="name"`
- `<input ... required>` → `<input ... required />`、`<br>` → `<br />`

### 手順 3: CSS を当てる

章 1 の `style.css` の中身は、`app/about/about.css` のようなファイル名で `app/about/` に置き、`page.tsx` の先頭で `import` する。

`app/about/about.css`（章 1 の CSS をそのまま貼る）:

```css
.avatar {
  width: 120px;
  border-radius: 50%;
}

.lead {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
}

/* ダークモード対応: ブラウザやシステムがダーク指定のときに色を上書き */
@media (prefers-color-scheme: dark) {
  .lead {
    color: #eaeaea;
  }
}
```

`app/about/page.tsx` の先頭に以下を追加する。

```tsx
import "./about.css";

export default function AboutPage() {
  // 上と同じ
}
```

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
