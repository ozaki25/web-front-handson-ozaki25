# lesson16: モダン CSS（:has / @layer / @scope / Container Queries / View Transitions）

## ゴール

- `:has()` で **親セレクタ**（子の状態に応じて親を装飾）を書ける。
- `@container`（Container Queries）で **親要素の幅** に応じたレイアウトを書ける。
- `:is()` / `:where()` / `@layer` / `@scope` / View Transitions API などモダン CSS の主要機能を「読める状態」にできる。

## 解説

ここまでのレッスンで扱ってきた CSS は、**2010 年代に固まった基本** が中心でした。一方、2022〜2025 年にかけて CSS は急速に進化しています。`:has()` で親セレクタが書けるようになり、`@container` でメディアクエリの限界が解消され、`@layer` で優先度の暴走を防げるようになりました。

「いま新しく CSS を書くなら最初から使ってよいもの」だけを集めたのがこのレッスンです。

### :has() — 親セレクタ

長年「CSS には親セレクタがない」と言われてきました。子の状態を見て親を装飾するには、JavaScript を使うしかありませんでした。それが `:has()` で書けるようになりました。

#### 例 1: 画像を含む段落だけ余白を広げる

```css
p:has(img) {
  margin-block: 2rem;
}
```

#### 例 2: フォーカス中の入力を持つフォームに枠を出す

```css
form:has(input:focus) {
  outline: 2px solid #2563eb;
}
```

#### 例 3: チェック済みの input を持つ label を強調

```css
label:has(input:checked) {
  background: #dbeafe;
  font-weight: bold;
}
```

<LiveDemo
  height="220px"
  :html="`
<form>
  <label><input type='checkbox'> 利用規約に同意する</label>
  <label><input type='checkbox'> ニュースレターを受け取る</label>
  <input type='text' placeholder='フォーカスしてみて'>
</form>
  `"
  :css="`
form { display: grid; gap: 12px; padding: 16px; border: 1px solid #ccc; border-radius: 8px; }
form:has(input:focus) { outline: 2px solid #2563eb; outline-offset: 2px; }
label { padding: 8px; border-radius: 4px; }
label:has(input:checked) { background: #dbeafe; font-weight: bold; }
input[type=text] { padding: 8px; }
  `"
  :js="``"
/>

これまで JS で「チェックボックスの変化を監視して、親の `<label>` にクラスを付ける」と書いていた処理が、CSS 1 行に置き換わります。

`:has()` は **2023 年末に全主要ブラウザで対応**し、2026 年の現在は安心して使えます。

### :is() / :where() — セレクタの共通化

複数のセレクタに同じスタイルを当てたい時、これまで `,` で並べて書いていました。

```css
h1 a, h2 a, h3 a {
  color: #2563eb;
}
```

`:is()` でまとめられます。

```css
:is(h1, h2, h3) a {
  color: #2563eb;
}
```

`:where()` は **書き方が同じで詳細度だけ 0** になる版です。リセット CSS など「他の指定に絶対勝たないでほしい」場面で使います。

```css
:where(button, input, select) {
  all: unset;
}
/* 詳細度 0 なので、後から書くどんなスタイルにも負ける */
```

詳細度の暴走を意図的に避けられるのがポイントです。

### @layer — カスケードを意図的に積む

CSS の優先度（カスケード）は「詳細度」「宣言順」「`!important`」で決まりますが、規模が大きくなると **どのスタイルが勝つか読めなくなる** 問題が起きます。

`@layer` は「優先度の階層」を **明示的に** 書く仕組みです。

```css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}

@layer base {
  body { font-family: sans-serif; line-height: 1.6; }
}

@layer components {
  .button {
    background: #2563eb;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
  }
}

@layer utilities {
  .mt-4 { margin-top: 1rem; }
}
```

ルール:

- **宣言順が優先度**。後ろの layer が勝つ
- layer 内の詳細度は **layer 間の優先度に勝てない**
- 「layer なし」の宣言は **すべての layer より強い**

これで「なぜか utilities が効かない」事故が消えます。Tailwind CSS v4 もこの `@layer` を全面採用しています。

### @scope — コンポーネント単位のスコープ

「このカードの中の `a` だけスタイルを当てたい」を、深いネストや BEM クラス名なしで書けます。

```html
<article class="card">
  <h2>タイトル</h2>
  <a href="#">続きを読む</a>
</article>

<a href="#">外側のリンク</a>
```

```css
@scope (.card) {
  a {
    color: #dc2626;
    text-decoration: none;
  }
}
```

`.card` 内の `a` だけ赤くなり、外側の `a` には影響しません。

範囲を **下限指定** で「ここから先は適用外」にもできます。

```css
@scope (.card) to (.card-actions) {
  /* .card の中だが .card-actions より上の階層だけが対象 */
}
```

`@scope` は Chrome・Safari が 2023〜2024 年、Firefox は 2026 年（バージョン 146）で対応しました。現在は主要ブラウザで使え、CSS Modules や CSS-in-JS なしで「スコープ付き CSS」が書けます。

### @container — Container Queries

これまでのメディアクエリは **画面幅** にしか反応できませんでした。

```css
@media (min-width: 768px) {
  /* 画面幅 768px 以上 */
}
```

画面幅は同じでも、要素が **置かれている場所の幅** はバラバラです。たとえば同じ Card コンポーネントを次の 2 箇所で使い回したいとします。

- メイン領域（800px）に置いた Card → 画像とテキストを横並びにしたい
- サイドバー（200px）に置いた Card → 縦に積んで 1 列にしたい

メディアクエリは「画面全体の幅」しか見ないので、この 2 つを **同じ画面幅で** 使い分けることができません。`@container` は「**親要素の幅** で分岐できる」仕組みです。

```css
.card-list {
  container-type: inline-size;
}

.card {
  display: block;
}

@container (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 16px;
  }
}
```

`.card-list` が 600px 以上の場所に置かれた時だけ、子の `.card` が横並びになります。画面幅の値とは無関係に動作します。

これで、置かれた場所の幅に合わせて自分で形を変える部品が書けます。

### View Transitions API — 滑らかな遷移

表示の切り替えやページ遷移を、フェードやスライドで自然に見せる演出が、CSS と数行の JS だけで書けます。

#### 同一ページ内で（`document.startViewTransition`）

```js
const box = document.getElementById("box");
const button = document.getElementById("toggle");

button.addEventListener("click", () => {
  // 対応していないブラウザは普通に変更だけする
  if (!document.startViewTransition) {
    box.classList.toggle("big");
    return;
  }
  document.startViewTransition(() => {
    box.classList.toggle("big");
  });
});
```

`startViewTransition` のコールバック内で DOM を変えると、変更前後の **スナップショットを自動で撮ってクロスフェード** してくれます。

<LiveDemo
  height="320px"
  :html="`
<button id='toggle'>切り替え</button>
<div id='box'></div>
  `"
  :css="`
button { padding: 8px 16px; margin-bottom: 16px; }
#box { width: 100px; height: 100px; background: #2563eb; border-radius: 8px; }
#box.big { width: 280px; height: 200px; background: #dc2626; }
::view-transition-old(root), ::view-transition-new(root) { animation-duration: 0.5s; }
  `"
  :js="`
const box = document.getElementById('box');
const button = document.getElementById('toggle');
button.addEventListener('click', () => {
  if (!document.startViewTransition) {
    box.classList.toggle('big');
    return;
  }
  document.startViewTransition(() => {
    box.classList.toggle('big');
  });
});
  `"
/>

#### ページ間（cross-document, MPA）

2024〜2025 年に対応が進み、**異なるページ間** でも View Transition が使えるようになりました。

```css
@view-transition {
  navigation: auto;
}
```

これを CSS に書くと、同一オリジン内のページ遷移が **自動でフェード** します。さらに「両ページに共通する要素」に名前を付けると、ページをまたいで **同じ要素が動く** 演出ができます。

```css
.hero-image {
  view-transition-name: hero-image;
}
```

ページ A の `.hero-image` から ページ B の `.hero-image` へ、自然にモーフィングします。Next.js（App Router）でも、実験的機能の `experimental.viewTransition` を有効にすると `next/link` でのルート遷移にこの効果を使えます。

#### Safari / Firefox の状況

- 同一ページ内: Chrome / Safari / Firefox で対応
- ページ間: Chrome は 126、Safari は 18.2 で対応。Firefox は未対応（2026 年現在）

未対応ブラウザでは **遷移なしで普通に動く** だけなので、Progressive Enhancement として安心して書けます。

#### `prefers-reduced-motion` への配慮

View Transition は画面が大きく動くため、**前庭機能障害** や **乗り物酔い** の傾向がある人には不快に感じられます。OS で「動きを減らす」設定をしているユーザーには、遷移を抑える指定を必ず入れます。

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms;
  }
}
```

これで「動きを減らす」設定の環境では、遷移演出が事実上スキップされます（完全に削除すると一部の擬似要素で副作用が出るため、極短時間にする慣習）。

### おまけ — 知っておくと得する 2026 のモダン CSS

- **`@starting-style`**: 要素が表示される瞬間のスタイル。`display: none` から表示への transition が書ける
- **Anchor Positioning**（`anchor()`）: ある要素を **別の要素** に紐付けて配置。tooltip / popover が JS なしで書ける
- **`color-mix()`**: `color-mix(in oklch, blue 70%, white)` のような色合成
- **CSS Nesting**: Sass のように `&` で入れ子。2023 年末に全ブラウザ対応

これらも現場で増えていく機能です。

## 演習

### ゴール

- `:has()` / `@container` / View Transitions API を **同じページに同居** させて動作を確認する

### 手順 1: 新規プロジェクト（StackBlitz の Vanilla テンプレート）

これまでの 1 章 と同じく **StackBlitz の Vanilla（HTML + CSS + JS）テンプレート** で進めます。<https://stackblitz.com/fork/js> を開いて新しいプロジェクトを始めるか、これまで作ってきた自己紹介ページの隣に `modern-css.html` のような別ファイルとして追加してもかまいません。

### 手順 2: index.html

`index.html` を以下に置き換えます。

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Modern CSS Demo</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main>
      <h1>モダン CSS のショーケース</h1>

      <section class="container">
        <div class="card-list">
          <article class="card"><h2>カード A</h2><p>説明文 A</p></article>
          <article class="card"><h2>カード B</h2><p>説明文 B</p></article>
        </div>
      </section>

      <section>
        <button id="toggle">切り替え</button>
        <div id="box"></div>
      </section>

      <section>
        <form>
          <label><input type="checkbox" /> 同意する</label>
          <input type="text" placeholder="フォーカスしてみる" />
        </form>
      </section>
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

### 手順 3: style.css

```css
@layer reset, base, components;

@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}

@layer base {
  body { font-family: sans-serif; padding: 24px; line-height: 1.6; color: #1a1a1a; background: #fafafa; }
  main { display: grid; gap: 32px; max-width: 800px; }
  section { padding: 16px; border: 1px solid #ccc; border-radius: 8px; background: #fff; }
}

@layer components {
  /* Container Queries */
  .card-list {
    container-type: inline-size;
    display: grid;
    gap: 16px;
  }
  .card { padding: 16px; background: #f3f4f6; border-radius: 8px; }
  @container (min-width: 600px) {
    .card-list { grid-template-columns: 1fr 1fr; }
  }

  /* :has() */
  form:has(input:focus) { outline: 2px solid #2563eb; outline-offset: 2px; }
  label:has(input:checked) { background: #dbeafe; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
  form { display: grid; gap: 12px; }

  /* View Transitions */
  #box { width: 100px; height: 100px; background: #2563eb; border-radius: 8px; margin-top: 12px; }
  #box.big { width: 100%; height: 200px; background: #dc2626; }
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.5s;
  }
}
```

### 手順 4: script.js

```js
const box = document.getElementById("box");
const toggle = document.getElementById("toggle");

toggle.addEventListener("click", () => {
  if (!document.startViewTransition) {
    box.classList.toggle("big");
    return;
  }
  document.startViewTransition(() => {
    box.classList.toggle("big");
  });
});
```

### 手順 5: ブラウザで確認

StackBlitz は保存と同時にプレビューが更新されます。以下を確認します。

1. **`:has()`**: form 内の `input` をフォーカスすると form 全体に枠が出る。checkbox を ON にすると label の背景が変わる
2. **`@container`**: ブラウザの `<section>` の幅を狭めるとカードが縦並びに、広げると横並びになる（**画面幅ではなく親要素の幅** で動くことを確認）
3. **View Transitions**: 「切り替え」を押すと box の大きさと色がフェードしながら変化する

### 期待出力

- フォームの input にフォーカスすると **青い枠** が出る
- checkbox ON で label の背景が **薄い青** になる
- ブラウザの幅を狭めるとカードが **縦並び**、広げると **2 列**
- 「切り替え」ボタンで box が **フェードしながら** 拡大 / 縮小

### 変える

- `@container (min-width: 600px)` を `(min-width: 400px)` に変えて分岐点を確認
- `card-list` の `container-type` を消すと `@container` が効かなくなることを確認
- `::view-transition-old/new` の `animation-duration` を `1.5s` にすると遷移がゆっくりになる
- `@layer components` を `@layer reset` の前に動かすと優先度が変わる（`reset` が勝って `card` の余白が消える）

### 自分で書く

- `:has(input[type="email"]:invalid)` で「メール形式が不正な input を含む form」に赤枠を出す
- 2 ページ作って `@view-transition { navigation: auto; }` を CSS に追加し、ページ間遷移にフェードがかかることを確認
- `view-transition-name: hero;` を付けた要素を 2 ページに置き、ページをまたいだ要素が **モーフィング** することを確認（Chrome 系推奨）

## まとめ

- `:has()` で **親セレクタ** が書ける。子の状態に応じた装飾を CSS だけで実現できる
- `:is()` でセレクタを共通化、`:where()` は詳細度 0 で「弱い指定」を作る
- `@layer` で **カスケードを意図的に積む**。Tailwind CSS v4 も採用
- `@scope` で **コンポーネント単位のスコープ**。BEM や CSS Modules がなくても局所化できる
- `@container` は **親要素の幅** で分岐。コンポーネント単位のレスポンシブが書ける
- View Transitions API は `startViewTransition()` 1 つで状態遷移を滑らかにし、`@view-transition` でページ間にも拡張できる
