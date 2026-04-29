# lesson57: イベントと配列のイミュータブル更新

## ゴール

- `onClick` など代表的なイベントハンドラを書ける
- 配列の state を、新しい配列を作って更新する書き方（イミュータブル更新）ができる
- 「末尾に追加 / 先頭に追加 / id で削除」の 3 パターンを実装できる

## 解説

### 配列 state の注意点

「state で状態を持つ」でカウンター（数値）の state を扱いました。配列の state でも考え方は同じですが、**守らないといけないルール** が 1 つあります。

> **直接 `push` や `splice` で書き換えない**。必ず「新しい配列」を作って渡す。

```tsx
const [todos, setTodos] = useState<Todo[]>([]);

// NG: 元の配列を書き換えている
todos.push(newTodo);
setTodos(todos); // 同じ配列を渡しているので、React から見れば「変わっていない」

// OK: 新しい配列を作って渡す
setTodos((prev) => [...prev, newTodo]);
```

これを「イミュータブル（immutable、書き換えない）更新」と呼びます。

理由は、React が「state が変わったかどうか」を、**オブジェクトの参照が同じかどうか**で判断しているためです。中身が変わっていても、同じ配列オブジェクトを渡されると「変わっていない」と判断され、再レンダリングされません。

スプレッド構文 `...`（2 章 の「分割代入とスプレッド」）は、このイミュータブル更新で頻出します。

### よく使う 3 パターン

#### (1) 末尾に追加

```tsx
setTodos((prev) => [...prev, newTodo]);
```

`[...prev, newTodo]` は「`prev` を広げて、最後に `newTodo` を足した新しい配列」。

#### (2) 先頭に追加

```tsx
setTodos((prev) => [newTodo, ...prev]);
```

順番を入れ替えるだけ。最新のものを上に表示したいときはこちら。

#### (3) id で削除

```tsx
setTodos((prev) => prev.filter((t) => t.id !== id));
```

`filter`（2 章 の「配列の変換」）は**新しい配列**を返すので、そのまま渡してよいです。`prev` 自体は変更されません。

### イベントハンドラの型

JSX の中にインラインで書くアロー関数では、型推論が効くので型注釈は不要です。

```tsx
<button onClick={(e) => console.log(e)}>
  {/* e は MouseEvent<HTMLButtonElement> と自動推論される */}
</button>
```

一方、**ハンドラを JSX の外で別関数として定義する**場合は、引数 `e` の型を明示する必要があります。`react` から `import type` で取り込み、`イベント種類<HTML要素>` という形で書きます。

```tsx
import type { MouseEvent, ChangeEvent, FormEvent } from "react";

// ボタンのクリック
function handleClick(e: MouseEvent<HTMLButtonElement>) { /* ... */ }

// input の変化
function handleChange(e: ChangeEvent<HTMLInputElement>) { /* ... */ }

// フォームの送信
function handleSubmit(e: FormEvent<HTMLFormElement>) { /* ... */ }
```

パターンは「`XXXEvent<HTML要素>`」で一貫しているので、型が分からなくなったら IDE の補完か、インラインで書いてから推論された型を確認すると手早く調べられます。

### スコープ外: オブジェクトの state 更新

配列ではなく、**オブジェクト** を state に入れたときの更新（`setUser((prev) => ({ ...prev, age: 30 }))` など）も同じ発想でできます。このレッスンでは配列更新だけに集中します。

## 演習

### 途中から始める場合

これまでのレッスンで作ったプロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開き、下の「出発点のファイル」を貼って揃えてください。

<details>
<summary>出発点のファイル</summary>

**`src/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
};
```

本レッスンで `Todo` 型と配列 state を扱うので、このファイルを先に用意しておきます。

</details>

### ゴール

- カウンターに「+1」「-1」「リセット」の 3 ボタンを実装
- `Todo` の配列 state に対して「末尾に追加」「先頭に追加」「id で削除」の 3 パターンを実装
- いずれの操作も、イミュータブル更新で行う

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る（これまでのを使い回しても OK）
2. `src/types.ts` を作成
3. `src/App.tsx` を書き換える

### `src/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
};
```

### `src/App.tsx`

```tsx
import { useState } from "react";
import type { Todo } from "./types";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([
    { id: "a1", text: "牛乳を買う" },
    { id: "a2", text: "原稿を書く" },
  ]);

  // ---- カウンター ----
  function handlePlus() {
    setCount((c) => c + 1);
  }
  function handleMinus() {
    setCount((c) => c - 1);
  }
  function handleReset() {
    setCount(0);
  }

  // ---- TODO ----
  function addToEnd() {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: `末尾 ${todos.length + 1}`,
    };
    setTodos((prev) => [...prev, newTodo]);
  }

  function addToTop() {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: `先頭 ${todos.length + 1}`,
    };
    setTodos((prev) => [newTodo, ...prev]);
  }

  function removeById(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <section className="box">
        <h2>カウンター</h2>
        <p>現在: {count}</p>
        <button onClick={handlePlus}>+1</button>
        <button onClick={handleMinus}>-1</button>
        <button onClick={handleReset}>リセット</button>
      </section>

      <section className="box">
        <h2>TODO</h2>
        <div className="row">
          <button onClick={addToEnd}>末尾に追加</button>
          <button onClick={addToTop}>先頭に追加</button>
        </div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.text}
              <button onClick={() => removeById(todo.id)}>削除</button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default App;
```

`crypto.randomUUID()` は、ブラウザ組み込みの「ユニークな ID を作る」関数です。

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

.box button {
  margin-right: 8px;
  padding: 4px 10px;
  cursor: pointer;
}

.row {
  margin-bottom: 8px;
}

@media (prefers-color-scheme: dark) {
  .box {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
}
```

### 期待出力

- 画面上部に「カウンター」ボックス。`+1` を 3 回押すと 3、`-1` を 1 回押すと 2、`リセット` で 0 に戻る
- 下に「TODO」ボックス。
  - 初期状態で `牛乳を買う` と `原稿を書く` の 2 件が並ぶ
  - `末尾に追加` を 2 回押すと、`末尾 3` / `末尾 4` が一番下に追加される
  - `先頭に追加` を 1 回押すと、`先頭 5` が一番上に追加される
  - 各行の `削除` ボタンで、その行だけが消える

### 変える

- `removeById` を次のように書き換えると、**バグ** が起きる。試してから元に戻すこと
  ```tsx
  function removeById(id: string) {
    const index = todos.findIndex((t) => t.id === id);
    todos.splice(index, 1); // NG: 元の配列を破壊している
    setTodos(todos); // React から見ると変化していない
  }
  ```
  クリックしても削除されない（実際は配列が変わっているのに、React は「同じ配列」と見て再レンダリングしない）
- `addToEnd` の `setTodos((prev) => [...prev, newTodo])` を `setTodos((prev) => [newTodo, ...prev])` に書き換えると、動作が `addToTop` と同じになる

### 自分で書く

- 「逆順」ボタンを追加し、クリックで配列を逆順にする（**新しい配列を作る**）
  - ヒント: `setTodos((prev) => [...prev].reverse())`（`.reverse()` 単体は元の配列を書き換える破壊的メソッド。スプレッドでコピーしてから呼ぶ）
- 「全消し」ボタンを追加し、クリックで空配列にする
  - ヒント: `setTodos([])`

## まとめ

- 配列 state は `push` / `splice` で直接書き換えず、**新しい配列を作って `setX` に渡す**
- 末尾追加は `[...prev, x]`、先頭追加は `[x, ...prev]`、削除は `prev.filter(...)`
- イベントハンドラの型（`MouseEvent<...>` / `ChangeEvent<...>` / `FormEvent<...>` 等）は `react` から `import type` してコピペで OK。インラインなら書かなくても推論される
