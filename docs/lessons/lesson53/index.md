# lesson53: JSX を書く

<script setup>
const demoHtml = '<div id="root"></div>'

const demoJs = `
// 本来 JSX で書く <h1 className="title">Hello, React</h1> は
// ビルド時に React.createElement(...) に変換されます。
// このデモは esm.sh から React 19 を動的 import で読み込み、変換後の形を直接書いています。
Promise.all([
  import('https://esm.sh/react@19.2.0'),
  import('https://esm.sh/react-dom@19.2.0/client'),
]).then(([{ default: React }, { createRoot }]) => {
  const h = React.createElement;

  function App() {
    const name = 'Alice';
    return h(
      'div',
      null,
      h('h1', { className: 'title' }, 'Hello, React'),
      h('p', null, 'こんにちは、' + name + ' さん')
    );
  }

  createRoot(document.getElementById('root')).render(h(App));
});
`
</script>

## ゴール

- JSX の基本ルールを理解し、HTML との違いを説明できる
- JSX の中に `{式}` で JS の値を埋め込める
- `className` / キャメルケースの属性 / フラグメントを使い分けられる

## 解説

### JSX は「JS の中に書く HTML 風の文法」

「React ってなに？」で、コンポーネントは JSX を返す関数だと紹介しました。

```tsx
function Hello() {
  return <h1>Hello, React</h1>;
}
```

この `<h1>Hello, React</h1>` の部分が **JSX** です。見た目は HTML ですが、JS の中に直接書いています。Vite（内部で TypeScript / Babel）が、裏で JS に変換してから動かしています。

HTML とは次の点で違います。本コースでは、よくぶつかる 3 点をまず覚えます。

1. 属性名がキャメルケース（`onclick` → `onClick`、`tabindex` → `tabIndex`）
2. `class` 属性は `className` に変わる
3. 自己閉じタグにスラッシュが必要（`<img src="..." />`、`<br />`）

「`for`（`<label for="...">`）→ `htmlFor`」も同じ仲間ですが、実用頻度が上がるのは 5 章（フォーム）なので、ここでは頭の片隅に置いておけば十分です。

### `{式}` で JS の値を埋め込む

JSX の中で `{ ... }` と書くと、中の JS の**式**が評価されます。

```tsx
const name = "Alice";
const age = 20;

function Profile() {
  return (
    <div>
      <p>名前: {name}</p>
      <p>来年は {age + 1} 歳</p>
      <p>今: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
```

- 変数（`name`、`age`）を埋め込める
- 式（`age + 1`、関数呼び出し）を埋め込める
- `if` 文や `for` 文のような**文**は書けない。あくまで**式**だけ

`if` で分岐したいときは三項演算子や `&&` を使います。

### `className`（`class` との違い）

HTML では `<div class="card">` でしたが、JSX では **`className`** を使います。

```tsx
function Card() {
  return <div className="card">カードの中身</div>;
}
```

なぜかというと、JSX は JS に変換されるので、`class` が JS の予約語（クラス構文に使う）と衝突するためです。本コースではクラス構文自体は扱いませんが、**JSX では必ず `className`** と覚えておきます。

CSS 側の書き方は変わりません。これまで通り `.card { ... }` と書いて読み込めば効きます。

### 属性はキャメルケース

HTML の属性名は全て小文字でしたが、JSX では複数単語の属性名をキャメルケース（途中で大文字）にします。

| HTML | JSX |
| --- | --- |
| `onclick` | `onClick` |
| `onchange` | `onChange` |
| `tabindex` | `tabIndex` |
| `maxlength` | `maxLength` |
| `aria-label` | `aria-label`（`aria-*` と `data-*` はそのまま） |

数は多いですが、書いて間違えたらエディタが赤線で教えてくれるので、書きながら少しずつ覚えていけば十分です。

### 要素は 1 つしか返せない → フラグメント

JSX のルールとして、コンポーネントは **1 つの要素** しか `return` できません。次のコードは動きません。

```tsx
// NG: 複数の要素を並べて返している
function Broken() {
  return (
    <h1>タイトル</h1>
    <p>本文</p>
  );
}
```

解決策は 2 つあります。

#### (a) `<div>` で囲む

```tsx
function Ok1() {
  return (
    <div>
      <h1>タイトル</h1>
      <p>本文</p>
    </div>
  );
}
```

単純ですが、意味のない `<div>` が DOM に増えてしまいます。

#### (b) フラグメント `<>...</>`

```tsx
function Ok2() {
  return (
    <>
      <h1>タイトル</h1>
      <p>本文</p>
    </>
  );
}
```

`<>` と `</>` はフラグメントと呼ばれる特殊なタグで、**DOM に何も出さずに** 中身だけを並べてくれます。余計な `<div>` を増やしたくないときに使います。

本コースでは原則フラグメントを使います。

### 複数行の JSX は `( ... )` で囲む

`return` の後で改行したい場合は、全体を丸括弧で囲みます。

```tsx
function Multi() {
  return (
    <div>
      <h1>タイトル</h1>
      <p>本文</p>
    </div>
  );
}
```

囲まないと「`return` の直後で改行」した時点で `undefined` が返ると解釈されて、JSX が実行されません。本コースの例はほぼ複数行なので、常に `(` で開く癖を付けておきます。

### コメントの書き方

JSX の中では、`{/* ... */}` のように書きます。

```tsx
function WithComment() {
  return (
    <div>
      {/* ここはタイトル */}
      <h1>タイトル</h1>
    </div>
  );
}
```

JS のコメント `// ...` をそのまま書くと JSX として解釈されてしまうので、必ず `{/* ... */}` にします。

### JSX は `React.createElement` に変換されている

JSX はブラウザが直接理解できる文法ではありません。ビルド時に `React.createElement(...)` という関数呼び出しに変換されてから動きます。

#### `React.createElement` の引数

`React.createElement` は次の 3 種類の引数をとります。

```
React.createElement(タグ名, props, ...children)
```

- 第 1 引数: タグ名。HTML タグなら文字列（`'h1'`、`'div'`）、自作コンポーネントなら関数そのもの
- 第 2 引数: props。属性をまとめたオブジェクト。属性が 1 つもなければ `null`
- 第 3 引数以降: 子要素。テキスト（文字列）や、別の `React.createElement(...)` の呼び出しを並べる

#### `<h1 className="title">Hello, React</h1>` の例

JSX のどの部分が `createElement` のどの引数になるかを 1 行ずつ対応させます。

```tsx
<h1 className="title">Hello, React</h1>
```

これは次のように変換されます。

```js
React.createElement(
  "h1",                    // ① タグ名（文字列）
  { className: "title" },  // ② props（属性のオブジェクト）
  "Hello, React"           // ③ 子要素（テキスト）
);
```

対応関係を整理するとこうなります。

| JSX の部分 | `createElement` の引数 |
|---|---|
| `<h1 ...>` の `h1` | 第 1 引数 `"h1"` |
| `className="title"` | 第 2 引数 `{ className: "title" }` |
| `>Hello, React<` の中身 | 第 3 引数 `"Hello, React"` |

属性が複数あると、第 2 引数の props オブジェクトに並んで入ります。

```tsx
<input type="text" name="user" defaultValue="Alice" />
```

```js
React.createElement("input", {
  type: "text",
  name: "user",
  defaultValue: "Alice",
});
```

属性がないときは第 2 引数を `null` にします。

```tsx
<p>本文</p>
```

```js
React.createElement("p", null, "本文");
```

#### 入れ子になった JSX

子要素にさらに JSX が入ると、`createElement` の中に `createElement` がネストします。

```tsx
<div>
  <h1 className="title">Hello, React</h1>
  <p>本文</p>
</div>
```

```js
React.createElement(
  "div",
  null,
  React.createElement("h1", { className: "title" }, "Hello, React"),
  React.createElement("p", null, "本文")
);
```

「タグ → カンマで props → カンマで子要素を並べる」と読むと、JSX の見た目と関数呼び出しの構造の対応がつかめます。下のデモは CDN から React を読み込み、**変換後の `React.createElement` を直接書いて** 同じ結果を出しています。タグみたいに見える JSX が実体としてはこの関数呼び出しに変換されているイメージを掴んでください。

::: tip 補足
実際のバンドラ（Vite / Next.js）では、`React.createElement` ではなく `react/jsx-runtime` の `jsx` 関数に変換されます（より最適化された形）。ただし「タグ名・props・子要素」を渡すという基本構造は同じなので、本コースでは仕組みがつかみやすい `createElement` で説明します。
:::

<LiveDemo
  height="240px"
  :html="demoHtml"
  :js="demoJs"
/>

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- 自分の名前と現在時刻を JSX で埋め込んで表示する
- `className` で CSS を当てる
- フラグメントで複数の要素を並べて返す

### 手順

1. これまでの StackBlitz をそのまま使う（別プロジェクトを新規作成しても OK）
2. `src/App.tsx` を書き換える
3. `src/App.css` を書き換える（テンプレートに既にあるはず。なければ作る）
4. 保存して画面を確認する

### `src/App.tsx`

```tsx
import "./App.css";

function App() {
  const name = "Alice";
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  return (
    <>
      <h1 className="title">プロフィール</h1>
      <p className="greeting">
        こんにちは、{name} さん（{hour}:{minute}）
      </p>
      <p>来年は {20 + 1} 歳</p>
      {/* フラグメントで複数要素を並べている */}
    </>
  );
}

export default App;
```

### `src/App.css`

```css
.title {
  color: #2b7a78;
}

.greeting {
  color: #333;
  background-color: #f0f8f7;
  padding: 8px 12px;
  border-radius: 4px;
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  .title {
    color: #7ec8c4;
  }
  .greeting {
    color: #eee;
    background-color: #1f2a2a;
  }
}
```

### 期待出力

- 画面上部に `プロフィール` という見出し（緑寄りの色）
- その下に `こんにちは、Alice さん（14:35）`（数字は現在の時分。薄い背景が付く）
- さらに下に `来年は 21 歳`

時刻は開いた時刻によって変わります。

### 変える

- `const name = "Alice";` をあなたの名前に変える
- `className="greeting"` を `className="title"` に差し替えると、見出しのスタイルが段落にも当たる
- フラグメントの `<>` を `<div>` に、`</>` を `</div>` に差し替えて、DevTools で違いを見る（`<div>` だと DOM に `div` が増える）

### 自分で書く

- 変数 `hobby` を追加して「趣味は ○○ です」という `<p>` を増やす
- `<p>` のどれかに `className="greeting"` を付けて色を変える
- `{/* ここにコメント */}` を 1 行加えて、レンダリング結果に出ないことを確認する

## まとめ

- JSX は「JS の中に書く HTML 風の文法」。裏で JS に変換される
- `{式}` で JS の値を埋め込める。文（`if`、`for`）は書けない
- `class` → **`className`**、属性はキャメルケース、自己閉じタグは `/`
- コンポーネントは 1 つの要素しか返せない。並べたいときは **フラグメント `<>...</>`**
- 複数行は `( ... )` で囲む。コメントは `{/* ... */}`
