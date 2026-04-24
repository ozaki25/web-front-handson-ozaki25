# lesson47: useReducer で複雑な state

## ゴール

- `useReducer` で複数の操作をまとめた state 管理が書ける
- reducer 関数の形 `(state, action) => newState` を理解する
- action の型を判別共用体で書ける
- reducer は純粋関数でなければならないことを理解する

## 解説

### 最初に: 再接続

この `Action` 型は3 章 の「判別共用体」で学んだ **判別共用体** そのものです。`type` プロパティで種類を見分ける形、`switch` での分岐、網羅性チェック、すべてそのまま使います。3 章 の「判別共用体」で書いた `TodoState` の代わりに、今回は「どういう更新をしたいか」を表すオブジェクトを同じ仕組みで表現します。

### なぜ useState だけだと辛くなるか

「イベントと配列のイミュータブル更新」で作った TODO は、`setTodos` を呼ぶパターンが 3 種類ありました。

```tsx
// 追加
setTodos((prev) => [...prev, newTodo]);

// 削除
setTodos((prev) => prev.filter((t) => t.id !== id));

// 完了切替（今回追加したい）
setTodos((prev) =>
  prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
);
```

今はまだ読めますが、操作が増えるにつれて「`setTodos` の書き方が画面のあちこちに散る」「同じ処理を別の場所でも書きたくなる」という問題が出てきます。

`useReducer` は、**state の更新ロジックを 1 箇所に集める** 仕組みです。画面側は「こういう操作をしたい」という **action** を投げるだけになります。

### useReducer の形

```tsx
import { useReducer } from "react";

const [state, dispatch] = useReducer(reducer, initialState);
```

- 第 1 引数: **reducer 関数** `(state, action) => newState`
- 第 2 引数: **初期 state**
- 戻り値: `[今の state, dispatch 関数]`

`dispatch(action)` を呼ぶと、React が内部で `reducer(現在の state, action)` を実行し、その戻り値を新しい state として保持します。

### reducer 関数の中身

reducer は「今の state」と「action」を受け取って「次の state」を返すだけの関数です。

```tsx
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
  }
}
```

ポイントは 3 つです。

1. **新しいオブジェクト / 配列を返す**（イミュータブル更新、これまでと同じ原則）
2. **副作用を起こさない**（ログ出力、`localStorage`、`fetch` などは書かない）
3. **同じ入力には同じ出力**（乱数や `Date.now()` も使わない）

これを **純粋関数** と呼びます。reducer は純粋関数でなければなりません。

### 純粋関数の原則と Strict Mode

React の Strict Mode は、開発時に reducer を **意図的に 2 回呼びます**。副作用を書いてしまうと 2 回走って気づけるようにする仕組みです。「reducer 内で `console.log` したら 2 回出た」ときは、Strict Mode が純粋関数違反を検出している合図です。

### action の型は判別共用体で

action は「操作の種類」を表すオブジェクトです。`type` というプロパティで種類を見分けます。3 章 の「判別共用体」で学んだ判別共用体が、そのまま action の型になります。

```ts
type Action =
  | { type: "add"; text: string }
  | { type: "delete"; id: string }
  | { type: "toggle"; id: string };
```

`switch (action.type)` で分岐すると、TypeScript は各ブランチで「この action にはどのプロパティがあるか」を正確に絞り込んでくれます。`case "add"` の中では `action.text` が見え、`case "delete"` の中では `action.id` が見える、という形です。

### dispatch を呼ぶ側

画面側（コンポーネントの JSX）からは `dispatch(action)` を呼ぶだけです。

```tsx
dispatch({ type: "add", text: "牛乳を買う" });
dispatch({ type: "delete", id: "abc" });
dispatch({ type: "toggle", id: "abc" });
```

「追加ロジック」「削除ロジック」は reducer 側に集まっているので、画面側は「何をしたいか」だけを伝えれば済みます。

### useState と useReducer の使い分け

| 状況 | おすすめ |
| --- | --- |
| 値が 1 つの単純な state | `useState` |
| 複数の関連する更新パターン | `useReducer` |
| 次の state が前の state に強く依存する | `useReducer` |

画面の中で「いくつも `setX` を並べる」のがしんどくなったら `useReducer` の出番です。

## 演習

### 途中から始める場合

これまでのレッスンで作ったプロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開き、下の「出発点のファイル」を貼って揃えてください。本レッスンでは `types.ts` を新しい形（`done` 付き + `Action` 型）に書き換えて進めます。

<details>
<summary>出発点のファイル</summary>

**`src/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
};
```

**`src/App.tsx`**

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

  function handlePlus() {
    setCount((c) => c + 1);
  }
  function handleMinus() {
    setCount((c) => c - 1);
  }
  function handleReset() {
    setCount(0);
  }

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

本レッスンでは `types.ts` を書き換え、`src/todosReducer.ts` を新規作成し、`App.tsx` を `useReducer` 版に入れ替えて進めます。

</details>

### ゴール

- これまでの TODO（`id` と `text` の配列）に `done` プロパティを足して、`useReducer` で管理する
- 3 種類の action `add` / `delete` / `toggle` を実装する
- 完了済みの TODO は見た目（取り消し線）で区別する

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/types.ts` を作成
3. `src/todosReducer.ts` を作成
4. `src/App.tsx` を書き換える
5. `src/App.css` を書き換える

### `src/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export type Action =
  | { type: "add"; text: string }
  | { type: "delete"; id: string }
  | { type: "toggle"; id: string };
```

`Todo` の `done` プロパティで「完了済みかどうか」を表します。`Action` は 3 種類の操作を判別共用体で列挙しています。

### `src/todosReducer.ts`

```ts
import type { Todo, Action } from "./types";

export function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add": {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: action.text,
        done: false,
      };
      return [...state, newTodo];
    }
    case "delete": {
      return state.filter((todo) => todo.id !== action.id);
    }
    case "toggle": {
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo,
      );
    }
  }
}
```

- `case` ごとに新しい配列を返しています（イミュータブル更新）
- `toggle` は該当 `id` の行だけ新しいオブジェクトで差し替え、それ以外はそのまま
- ブロック `{ ... }` で囲っているのは、`case` の中で `const` を宣言するためです（変数のスコープを閉じる慣習）

### `src/App.tsx`

```tsx
import { useReducer, useState } from "react";
import type { FormEvent } from "react";
import { todosReducer } from "./todosReducer";
import type { Todo } from "./types";
import "./App.css";

function App() {
  const [todos, dispatch] = useReducer(todosReducer, [] as Todo[]);
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    dispatch({ type: "add", text: trimmed });
    setText("");
  }

  return (
    <>
      <h1>useReducer 版 TODO</h1>

      <form onSubmit={handleSubmit} className="box">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="やることを入力"
        />
        <button type="submit">追加</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.done ? "done" : ""}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => dispatch({ type: "toggle", id: todo.id })}
              />
              {todo.text}
            </label>
            <button
              type="button"
              onClick={() => dispatch({ type: "delete", id: todo.id })}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
```

- `useReducer(todosReducer, [] as Todo[])` で、初期値は空配列
- `dispatch({ type: "add", text })` で追加
- `dispatch({ type: "toggle", id })` でチェックの切替
- `dispatch({ type: "delete", id })` で削除
- 画面側には更新ロジックが一切なく、「どういう操作をしたいか」だけを書いています

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

.box input {
  padding: 6px;
  margin-right: 8px;
}

.box button {
  padding: 4px 10px;
  cursor: pointer;
}

.todo-list {
  list-style: none;
  padding-left: 0;
  color: #222;
}

.todo-list li {
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-list li.done label {
  text-decoration: line-through;
  color: #888;
}

.todo-list li button {
  margin-left: auto;
  padding: 2px 8px;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .box {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
  .todo-list {
    color: #eee;
  }
  .todo-list li.done label {
    color: #888;
  }
}
```

### 期待出力

- 画面に入力欄と「追加」ボタン、その下に TODO 一覧
- 入力して「追加」を押すと、一覧末尾に行が追加される（`done: false` の状態）
- 各行のチェックボックスを押すと取り消し線が付き、もう一度押すと戻る
- 「削除」ボタンでその行だけが消える
- 空文字のまま「追加」を押しても何も起きない

### 変える

- `todosReducer` の `case "toggle"` を、意図的に壊してみます。次のように書き換えると、`toggle` を押しても画面が更新されません。
  ```ts
  case "toggle": {
    const todo = state.find((t) => t.id === action.id);
    if (todo) todo.done = !todo.done; // NG: 元のオブジェクトを書き換えている
    return state; // 同じ配列参照を返している
  }
  ```
  確認したら元に戻します。reducer も **新しい配列・新しいオブジェクトを返す** 原則は守ります。
- `case "add"` の中に `console.log("added")` を入れて、Strict Mode が有効なとき（`main.tsx` で `<StrictMode>` に包まれているとき）に 2 回出力されることを確認します。reducer は純粋関数として扱われるため、開発時に 2 回呼ばれても副作用は出ないはず、という検査です。

### 自分で書く

- 「全部完了にする」「全部未完了に戻す」を action として追加します。
  - `type: "completeAll"` と `type: "uncompleteAll"` を `Action` 型に足す
  - reducer にそれぞれの `case` を書く（`state.map((t) => ({ ...t, done: true }))` など）
  - 画面にボタンを 2 つ追加して `dispatch` する
- 「完了済みだけ一括削除」も追加してみてください（`type: "deleteCompleted"`）。

### 発展: 網羅性チェック（折りたたみ）

::: details never を使った網羅性チェック

3 章 の「unknown と never」で登場した `never` 型を使うと、**action の case を書き忘れたときにコンパイルエラーにできます**。

`todosReducer.ts` の `switch` に `default` を足します。

```ts
import type { Todo, Action } from "./types";

export function todosReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add": {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: action.text,
        done: false,
      };
      return [...state, newTodo];
    }
    case "delete": {
      return state.filter((todo) => todo.id !== action.id);
    }
    case "toggle": {
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo,
      );
    }
    default: {
      // すべての case を処理していれば、ここに来る action は never 型になる
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
```

試しに `Action` 型に新しいケース（例: `{ type: "clear" }`）を足してみてください。`default` の `_exhaustive: never = action` の行で「`action` が `{ type: "clear" }` 型で never に代入できない」というエラーが出ます。これを **網羅性チェック** と呼びます。

action の種類が増えたとき、対応を忘れた場所を TypeScript に教えてもらえるようになります。実務では必ず付けると言ってよい定型です。

:::

## まとめ

- `useReducer(reducer, initialState)` で state の更新ロジックを 1 箇所にまとめられる
- reducer は `(state, action) => newState` の形、**純粋関数**（副作用禁止、イミュータブル更新）
- action は判別共用体で型付け（`type` プロパティで見分ける、3 章 の「判別共用体」の形）
- 画面からは `dispatch(action)` を呼ぶだけ
- 複数の関連更新があるとき、`useState` より見通しが良くなる
- Strict Mode では reducer が 2 回呼ばれる。純粋関数なら結果は同じになる
- 次は「フォームと制御コンポーネント」のフォームに進み、その後「親子コンポーネントの連携」で親子連携、「Context API」で Context を学ぶ
