# lesson67: カスタムフック（`useTodos` に抽出）

2 章 の「スコープとクロージャ」で `makeCounter()` / `makeFilter(status)` という関数を書きました。「関数が state を閉じ込める（クロージャ）」という形です。React のカスタムフックは **同じ仕組みを React の文脈で使う** 形と思ってください。2 章 の「スコープとクロージャ」の延長線上にあります。

## ゴール

- 複数のフックを組み合わせたロジックを、再利用可能なカスタムフックに切り出せる
- `use` プレフィックスの命名規則を守れる
- フックのルール（トップレベルで呼ぶ、他のフックの中でだけ呼ぶ）を理解する

## 解説

### カスタムフックとは

カスタムフックは **「フックを使う関数」** を切り出したものです。`useState` / `useEffect` / 他のフックを組み合わせて、自前の「新しいフック」を作れます。

命名規則は 1 つだけ。**`use` で始まる関数名** にします。

```tsx
function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text, done: false }]);
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, addTodo, deleteTodo };
}
```

これを使う側は、単に呼ぶだけ。

```tsx
function App() {
  const { todos, addTodo, deleteTodo } = useTodos();
  // あとは好きに使う
}
```

使う側のコンポーネントからは **state の管理が見えなくなり**、`useTodos` の戻り値だけを触る形になります。似た処理を 2 つのコンポーネントで使いたいときも、フック 1 つ書けば共有できます。

### 2 章 の「スコープとクロージャ」との対応

2 章 の「スコープとクロージャ」で書いた `makeCounter()` を思い出してください。

```js
function makeCounter() {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
}

const counterA = makeCounter();
const counterB = makeCounter();
```

`counterA` と `counterB` はそれぞれ **独立した `count` を閉じ込めた関数** でした。

カスタムフックも発想は同じです。`useTodos()` を呼び出した **コンポーネントごとに、独立した `todos` state を持つ**。クロージャで変数を閉じ込める代わりに、React の state が閉じ込められる、という違いだけです。

### フックのルール

フックには **2 つのルール** があります。これは `useState` / `useEffect` / カスタムフック、すべてに共通です。

1. **コンポーネントや他のフックの「トップレベル」でのみ呼ぶ**
   - `if` の中、`for` の中、コールバックの中では呼ばない
   - 理由: React はフックを呼ぶ順番で state を識別している。順番が変わると壊れる
2. **React 関数（コンポーネントまたはカスタムフック）の中でだけ呼ぶ**
   - 普通の JS 関数の中では呼べない

カスタムフックは「フックを呼ぶ関数」なので、命名を `use` で始めると ESLint プラグインがこのルールを自動でチェックしてくれます。

### なぜフックを切り出すのか

単にコンポーネントを分けるのと違い、**state のロジックだけ** を切り出せます。UI は各コンポーネントが自由に書いて、state の振る舞いだけ共通化する、という分け方ができます。

- `useTodos` は state 管理だけ
- `TodoList` / `TodoInput` などの UI コンポーネントは表示だけ
- 「TODO の件数を表示するバッジ」など別の UI を追加したくなっても、`useTodos` をもう 1 回呼ぶだけで state が手に入る

### いつフックに切り出すか

「state ロジックは全部カスタムフックに切り出す」と覚えると、**1 箇所でしか使わないフック** が量産されてコード全体の見通しが落ちます。実務でフックに切り出すかどうかの判断は、ざっくり次のいずれかが当てはまるときに限るのが扱いやすいです。

- **2 箇所以上で同じロジックを書きたくなったとき**（重複の解消）
- **テストしたいロジックがある**（コンポーネントから切り離すとテストが書きやすい）
- **3 つ以上の `useState` / `useEffect` が絡み合ってきて、コンポーネントの本体が読みづらいとき**

逆に、

- 1 箇所でしか使わない
- 5 行未満の小さな state ロジック
- UI と密に連動していて切り出すと逆に読みづらくなる

このようなケースは **コンポーネントの中に置いたままで OK** です。「再利用できそうだから切り出す」より「**重複が起きてから切り出す**」方が結果として良い設計になります。

## 演習

### 途中から始める場合

「親子コンポーネントの連携」までで作ったプロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開き、下の「出発点のファイル」を貼って揃えてください。本レッスンでは `types.ts` に `done` を追加し、`src/useTodos.ts` を新規作成してロジックを抽出します。

<details>
<summary>出発点のファイル（本レッスンで <code>done</code> を追加）</summary>

**`src/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
};
```

**`src/TodoInput.tsx`**

```tsx
import { useState } from "react";
import type { FormEvent } from "react";

type TodoInputProps = {
  onAdd: (text: string) => void;
};

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="todo-input">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="やることを入力"
      />
      <button type="submit">追加</button>
    </form>
  );
}
```

**`src/TodoList.tsx`**

```tsx
import type { Todo } from "./types";

type TodoListProps = {
  todos: Todo[];
  onDelete: (id: string) => void;
};

export function TodoList({ todos, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty">まだタスクがありません</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => onDelete(todo.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
}
```

**`src/App.tsx`**

```tsx
import { useState } from "react";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";
import type { Todo } from "./types";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleAdd(text: string) {
    const newTodo: Todo = { id: crypto.randomUUID(), text };
    setTodos((prev) => [...prev, newTodo]);
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <h1>TODO（親子連携版）</h1>
      <TodoInput onAdd={handleAdd} />
      <TodoList todos={todos} onDelete={handleDelete} />
    </>
  );
}

export default App;
```

本レッスン冒頭で `types.ts` の `Todo` 型に `done: boolean` を追加し、`TodoList` の props に `onToggle` を追加します。演習本体のコードがそのまま上書きになります。

</details>

### ゴール

- ここまでの React レッスンで作った TODO のロジックを `useTodos()` カスタムフックに **抽出** する
- 戻り値は `{ todos, addTodo, deleteTodo, toggleTodo }` の 4 つ
- `App` から `useTodos()` を呼び出して使う
- **localStorage 連携は今回は扱わない**

### 手順

1. 「親子コンポーネントの連携」か「useEffect の基本」の React プロジェクトをコピーして新規に開く（別プロジェクトでも可）
2. `src/types.ts` は3 章 で作った `Todo` 型をそのまま使う
3. `src/useTodos.ts` を新規作成（カスタムフック）
4. `src/TodoInput.tsx`、`src/TodoList.tsx` は既存のままでよい
5. `src/App.tsx` で `useTodos()` を呼び出す形に書き換える

### `src/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
  done: boolean;
};
```

### `src/useTodos.ts`

```ts
import { useState } from "react";
import type { Todo } from "./types";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, done: false },
    ]);
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  return { todos, addTodo, deleteTodo, toggleTodo };
}
```

ポイント:

- ファイル名は `useTodos.ts`（拡張子は `.ts` で OK、JSX を書かないので `.tsx` 不要）
- `use` で始まる関数名
- 戻り値はオブジェクトで 4 要素を返す
- `addTodo` の中で `trim` して空文字を弾く

### `src/TodoInput.tsx`

```tsx
import { useState } from "react";
import type { FormEvent } from "react";

type TodoInputProps = {
  onAdd: (text: string) => void;
};

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onAdd(text);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="やることを入力"
      />
      <button type="submit">追加</button>
    </form>
  );
}
```

### `src/TodoList.tsx`

```tsx
import type { Todo } from "./types";

type TodoListProps = {
  todos: Todo[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
};

export function TodoList({ todos, onDelete, onToggle }: TodoListProps) {
  if (todos.length === 0) {
    return <p>TODO はまだありません。</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <label>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => onToggle(todo.id)}
            />
            <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
              {todo.text}
            </span>
          </label>
          <button type="button" onClick={() => onDelete(todo.id)}>
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### `src/App.tsx`

```tsx
import { useTodos } from "./useTodos";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";

export default function App() {
  const { todos, addTodo, deleteTodo, toggleTodo } = useTodos();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h1>私の TODO（useTodos 版）</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList todos={todos} onDelete={deleteTodo} onToggle={toggleTodo} />
    </main>
  );
}
```

- `App` は state を直接持っていません
- `useTodos()` を呼ぶだけで、state と操作関数が手に入る
- `App` は「UI を組み立てるだけ」に役割が絞られた

### 期待出力

- 画面に入力欄 + 追加ボタン + 一覧
- 追加すると一覧に増え、チェックボックスで完了状態切り替え、削除ボタンで消える
- 機能は以前と変わらないが、**コード構造が整理された** 点が今回の学習対象です

### 変える

- `useTodos()` を **2 回呼び出す** とどうなるか試す:
  ```tsx
  const { todos } = useTodos();
  const { todos: todos2 } = useTodos();
  ```
  それぞれ独立した state になる。2 章 の「スコープとクロージャ」の `counterA` / `counterB` と同じ形
- `useTodos` の戻り値にカスタムな派生値を加える: `const doneCount = todos.filter((t) => t.done).length;` を計算して返す

### 自分で書く

`useCounter(initial: number)` カスタムフックを作ります。戻り値は `{ count, increment, decrement, reset }` です。

まずは何も見ずに自分で書いてみてください。詰まったら段階的にヒントを開きます。

::: details ヒント A: 設計（最初に詰まったらここ）

- `useTodos` と同じ「**フックを使う関数 = カスタムフック**」のパターン
- フック内部で `useState` を 1 つ使い、戻り値のオブジェクトに 4 つのキーを並べる
- 4 つのキーのうち 1 つは `count`、残り 3 つは「カウントを変える関数」

:::

::: details ヒント B: シグネチャ（さらに詰まったら）

```ts
function useCounter(initial: number): {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
} {
  // ここに useState と 3 つの関数を書く
}
```

:::

::: details ヒント C: 実装イメージ（最終手段）

`const [count, setCount] = useState(initial)` を作り、`setCount((c) => c + 1)` のように **関数形式の setter** で 3 つの操作関数を書きます。`reset` は `setCount(initial)` です。

:::

## まとめ

- カスタムフックは `use` で始まる関数。内部で他のフックを呼べる
- state のロジックだけを切り出して、UI 側を身軽にできる
- 2 章 の「スコープとクロージャ」のクロージャと同じ「関数が state を閉じ込める」発想。React で同じパターンを見つけられる
- フックのルールは 2 つ: トップレベルで呼ぶ / React 関数（コンポーネントまたはフック）の中でだけ呼ぶ
