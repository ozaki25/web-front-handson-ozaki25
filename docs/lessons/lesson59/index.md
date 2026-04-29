# lesson59: フォームと制御コンポーネント

## ゴール

- `value` と `onChange` を使って、入力値を state と同期できる（制御コンポーネント）
- HTML フォーム（`name` 属性で値を集める形）と React の書き方との違いを説明できる

## 解説

### 1 章 の「フォームを作る」の HTML フォームとの対比

1 章 の「フォームを作る」の自己紹介フォームを思い出してください。次のような形でした。

```html
<form action="/contact" method="POST">
  <label for="email">メール</label>
  <input id="email" name="email" type="email" required />
  <button type="submit">送信</button>
</form>
```

- `name="email"` が「この入力欄はメールです」という目印
- 送信ボタンを押すと、ブラウザが `name` 属性をキーにして値を集め、`action` に指定された URL に送る
- 値の持ち主は **ブラウザ**

React の**制御コンポーネント**はこの形と少し違います。

- 値の持ち主は **React の state**
- `<input>` には「今の state の値」を `value` として渡す
- 入力するたびに `onChange` で state を更新する
- `<input>` は常に state と同期している

どちらも「フォームを作る」ことには違いありません。使い分けの現場感としては、HTML ネイティブで十分なら前者、入力値を**その場で JS から使いたい**（リアルタイムプレビュー、バリデーション、条件付き無効化など）なら後者です。React では制御コンポーネントが基本です。

### 制御コンポーネントの最小形

```tsx
import { useState } from "react";

function NameInput() {
  const [name, setName] = useState("");

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前"
      />
      <p>こんにちは、{name} さん</p>
    </div>
  );
}
```

- `value={name}` で「いま表示する値」を指定
- `onChange={(e) => setName(e.target.value)}` で「入力されたら state を更新」
- これで `<input>` と `name` state がつねに一致する

ブラウザの DevTools で `<input>` の value 属性を手で書き換えても、画面の表示は `name` の値で上書きされます。つまり、**見た目の真実は state 側にある**。

### `e.target.value`

`onChange` が受け取る `e`（イベント）の中に、変化があった要素（`target`）が入っています。`<input>` の value は常に文字列型です。

```tsx
<input
  type="number"
  value={age}
  onChange={(e) => setAge(Number(e.target.value))}
/>
```

数値で扱いたいときは、`Number()` で変換する必要があります。HTML 的には `type="number"` でも、JS から見えるのは文字列です。

### textarea と select も同じ形

HTML では `<textarea>入る文字</textarea>` のように子要素として書いていましたが、React では `<input>` と同じく `value` と `onChange` を使います。

```tsx
<textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="home">家事</option>
  <option value="work">仕事</option>
</select>
```

### `<form>` の送信

送信ボタンを押したときの動作は 2 通り書き方があります。

#### (a) `onSubmit` で書く（本コースの4 章 はこれ）

```tsx
<form
  onSubmit={(e) => {
    e.preventDefault();
    // state をもとに処理する
  }}
>
  {/* ... */}
</form>
```

- `e.preventDefault()` で、ブラウザ既定の送信（ページ遷移）を止める
- その後は自分で `fetch` なり state 更新なりをする
- 「親子コンポーネントの連携」で使う形

#### (b) `<form action={fn}>`（紹介のみ、5 章 で本格使用）

React 19 では、`<form>` の `action` 属性に **関数** も渡せるようになりました。

```tsx
<form action={submitTodo}>
  <input name="text" />
  <button type="submit">送信</button>
</form>
```

- `action` が関数なら、React は **既定の送信動作（ページ遷移）を抑止し、`FormData` を引数に関数を呼ぶ**
- 結果として、自分で `e.preventDefault()` を書かなくて済む
- 従来どおり `action="/contact"` のように **URL 文字列** を渡すこともできる（普通の HTML 送信）

本コースでは4 章 の段階では **紹介のみ**です。5 章 の「Server Actions の最小形」の Server Actions でこの形を使うときに「関数を渡すパターン」を詳しく学びます。「4 章 は `onSubmit` 形、5 章 で `action={fn}` 形に乗り換える」という流れを予告として覚えておいてください。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- 名前とメモの入力欄を作り、入力内容がリアルタイムに下に表示されるプレビュー画面を作る
- 送信ボタンを押したら（`onSubmit` で）入力内容をまとめて表示する

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/App.tsx` を書き換える
3. `src/App.css` を書き換える

### `src/App.tsx`

```tsx
import { useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [submitted, setSubmitted] = useState<{ name: string; memo: string } | null>(
    null
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted({ name, memo });
  }

  return (
    <>
      <h1>入力プレビュー</h1>

      <form onSubmit={handleSubmit} className="box">
        <div className="row">
          <label htmlFor="name">名前</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="row">
          <label htmlFor="memo">メモ</label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <button type="submit">送信</button>
      </form>

      <section className="box">
        <h2>リアルタイムプレビュー</h2>
        <p>名前: {name}</p>
        <p>メモ: {memo}</p>
      </section>

      {submitted !== null && (
        <section className="box">
          <h2>送信結果</h2>
          <p>名前: {submitted.name}</p>
          <p>メモ: {submitted.memo}</p>
        </section>
      )}
    </>
  );
}

export default App;
```

### `src/App.css`

```css
.box {
  border: 1px solid #ccc;
  padding: 12px;
  margin: 12px 0;
  border-radius: 4px;
  color: #222;
  background-color: #fff;
}

.row {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
}

.row label {
  margin-bottom: 4px;
  font-weight: bold;
}

.row input,
.row textarea {
  padding: 6px;
  border: 1px solid #999;
  border-radius: 4px;
}

button {
  padding: 6px 12px;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .box {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
  .row input,
  .row textarea {
    color: #eee;
    background-color: #2a2a2a;
    border-color: #666;
  }
}
```

### 期待出力

- 画面に「名前」入力欄と「メモ」テキストエリア、「送信」ボタン
- 「リアルタイムプレビュー」セクションに、入力内容が**打つたびに**反映される
- 「送信」を押すと、「送信結果」セクションが現れて、押した時点の入力内容が固定表示される
- その後もリアルタイムプレビューは入力に追従するが、「送信結果」は次に押すまで変わらない

### 変える

- `onChange` を消して `value={name}` だけ残すと、**入力できなくなる**（読み取り専用扱い）。確認したら戻す
- `<input>` のラベル `<label htmlFor="name">` の `htmlFor` を `for` に書き換えると、ブラウザのコンソールに警告が出る（JSX では `htmlFor`）
- `handleSubmit` から `e.preventDefault()` を消すと、送信時にページがリロードされてプレビューが消える。**なぜリロードされるのか** を自分の言葉で説明してみる

### 自分で書く

- カテゴリ選択用の `<select>` を追加し、`state.category` と同期させる
- 選択肢: `"家事"` / `"仕事"` / `"趣味"`
- プレビューと送信結果にカテゴリも表示する

ヒント:

```tsx
const [category, setCategory] = useState("家事");
// ...
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="家事">家事</option>
  <option value="仕事">仕事</option>
  <option value="趣味">趣味</option>
</select>;
```

### 末尾予告

- 4 章 内では `<form onSubmit={(e) => { e.preventDefault(); ... }}>` の形を「親子コンポーネントの連携」で使い続ける
- `<form action={fn}>` 形は5 章 の「Server Actions の最小形」の Server Actions で登場する。そこで `preventDefault` が不要になる理由とあわせて扱う

## まとめ

- 制御コンポーネントは `value={state}` + `onChange` の組み合わせ。値の持ち主は state
- `e.target.value` は常に文字列。数値で扱いたいなら `Number()` で変換
- `<label>` の `for` は JSX では **`htmlFor`**
- フォーム送信は当面 `onSubmit` + `e.preventDefault()`。`<form action={fn}>` は5 章 でフル活用
