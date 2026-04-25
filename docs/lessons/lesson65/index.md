# lesson65: カスタムフック（`useTodos` に抽出）

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

カスタムフックも発想は同じです。`useTodos()` を呼び出した **コンポーネントごとに、独立した `todos` state が用意される**。クロージャで変数を閉じ込める代わりに、React の state が閉じ込められる、という違いだけです。

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

本レッスン冒頭で `types.ts` の `Todo` 型に `done: boolean` を追加し、`TodoList` の props を `onToggle` も受け取る形に拡張します。演習本体のコードがそのまま上書きになります。

</details>

### ゴール

- ここまでの React レッスンで作った TODO のロジックを `useTodos()` カスタムフックに **抽出** する
- 戻り値は `{ todos, addTodo, deleteTodo, toggleTodo }` の 4 つ
- `App` から `useTodos()` を呼び出して使う
- **localStorage 連携は今回は扱わない**（次の「TODO アプリを React で作る」で畳み込む）

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
- `addTodo` の中で `trim` して空文字を弾く（2 章 の「TODO アプリを作る」で覚えたロジック）

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
- 機能は以前と変わらない。**コード構造が整理された** ことが今回のポイント

### 変える

- `useTodos()` を **2 回呼び出す** とどうなるか試す:
  ```tsx
  const { todos } = useTodos();
  const { todos: todos2 } = useTodos();
  ```
  それぞれ独立した state になる。2 章 の「スコープとクロージャ」の `counterA` / `counterB` と同じ形
- `useTodos` の戻り値にカスタムな派生値を加える: `const doneCount = todos.filter((t) => t.done).length;` を計算して返す

### 自分で書く

- `useCounter(initial: number)` カスタムフックを作る
- 戻り値は `{ count, increment, decrement, reset }`
- ヒント: `const [count, setCount] = useState(initial);` と、`useState` の更新関数を使った 3 つの操作関数

### 「TODO アプリを React で作る」への前振り

- 今の `useTodos` は state をメモリに持つだけで、リロードすると消える
- 次の「TODO アプリを React で作る」で `useTodos` に **localStorage 連携** を内蔵させ、「TODO アプリを React で作る」の「バグあり版 → 修正版」構造でバグを体験しながら整える

## まとめ

- カスタムフックは `use` で始まる関数。内部で他のフックを呼べる
- state のロジックだけを切り出して、UI 側を身軽にできる
- 2 章 の「スコープとクロージャ」のクロージャと同じ「関数が state を閉じ込める」発想。React で同じパターンを見つけられる
- フックのルールは 2 つ: トップレベルで呼ぶ / React 関数（コンポーネントまたはフック）の中でだけ呼ぶ
- localStorage 連携は次の「TODO アプリを React で作る」で扱う
