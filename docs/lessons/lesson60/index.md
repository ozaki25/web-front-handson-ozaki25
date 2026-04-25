# lesson60: 親子コンポーネントの連携

## ゴール

- 親から子へ、子から親へ値を受け渡す関係を整理できる
- コールバック props を使って、子で起きたイベントを親の state に反映できる
- 「state を親に持たせる（state lifting）」という考え方を説明できる

## 解説

### props は「親 → 子」の一方通行

props はコンポーネント間で値を渡す仕組みですが、**基本は上から下**に流れます。

```
親 (App)  --- todos ---> 子 (TodoList)
```

では、子から親に何かを伝えたいときはどうするか。例えば「子のフォームに文字を入力して追加ボタンを押したら、親が持っている配列に追加したい」場合です。

### コールバック props

答えは「親から子に **関数を渡し**、子はその関数を呼ぶ」です。親が渡した関数を子がコールバックする、という形で、**関数が値として props を流れる**点がポイントです。

```
親 (App)  --- onAdd (関数) ---> 子 (TodoInput)
            <-- 関数呼び出し ---
```

親側:

```tsx
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleAdd(text: string) {
    const newTodo: Todo = { id: crypto.randomUUID(), text };
    setTodos((prev) => [...prev, newTodo]);
  }

  return (
    <>
      <TodoInput onAdd={handleAdd} />
      <ul>{/* ... */}</ul>
    </>
  );
}
```

子側:

```tsx
import { useState } from "react";
import type { FormEvent } from "react";

type TodoInputProps = {
  onAdd: (text: string) => void;
};

function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed); // 親の関数を呼ぶ
    setText(""); // 入力欄をクリア
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">追加</button>
    </form>
  );
}
```

- 親は `onAdd` という関数を子に渡す
- 子は入力欄の state（`text`）を自分で持つ
- 送信時に `onAdd(text)` を呼ぶ → 親が state を更新 → 画面再レンダリング

「関数を props として渡す」という発想に慣れるのがこのレッスンのコアです。

### state lifting（状態の持ち上げ）

上の例で、なぜ `todos`（一覧）の state を **親**（App） に置いたのでしょうか。一覧を描画するのは `TodoList` コンポーネントです。一見 `TodoList` に state を置いてもよさそうです。

理由: **`todos` は「子の TodoInput」と「子の TodoList」の両方が関わる** からです。TodoInput は追加する側、TodoList は表示する側。2 つが同じ state を共有する必要があります。

兄弟どうしの子コンポーネントは、直接 props で値を送れません。`App → TodoInput → App → TodoList` のように、**共通の親** を経由する必要があります。そのため、共通の親（App）に state を持たせます。

これが「state lifting（共通の親に state を持ち上げる）」です。

```
        App (todos を持つ)
       /              \
  TodoInput        TodoList
  (追加用)        (表示用)
```

### props のおさらい

props を関数にすると、慣習的に名前は `onXxx` の形にします（HTML のイベントと同じ感覚）。

| 親が子に渡すもの | 命名例 |
| --- | --- |
| 値（state） | `todos`、`user`、`count` |
| 状態変更を依頼する関数 | `onAdd`、`onDelete`、`onToggle` |

この命名で統一すると、「この props は関数か値か」が読み解きやすくなります。

## 演習

### 途中から始める場合

このレッスンは独立した TODO 例として完結しています。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。過去のレッスンのファイルは不要で、下の手順に従って `src/types.ts` / `src/TodoInput.tsx` / `src/TodoList.tsx` / `src/App.tsx` を新しく作成していきます。

### ゴール

- `TodoInput`（子）と `TodoList`（子）を、`App`（親）が `todos` state を持って束ねる
- 入力 → 追加ボタンで一覧末尾に追加
- 各項目の削除ボタンで 1 件削除

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/types.ts` を作成
3. `src/TodoInput.tsx` を作成
4. `src/TodoList.tsx` を作成
5. `src/App.tsx` を書き換える

### `src/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
};
```

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

### `src/TodoList.tsx`

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

### `src/App.tsx`

```tsx
import { useState } from "react";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";
import type { Todo } from "./types";
import "./App.css";

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

### `src/App.css`

```css
.todo-input {
  margin: 12px 0;
}

.todo-input input {
  padding: 6px;
  margin-right: 8px;
}

.todo-input button,
.todo-list button {
  padding: 4px 10px;
  cursor: pointer;
}

.todo-list {
  list-style: disc;
  padding-left: 20px;
  color: #222;
}

.todo-list li {
  padding: 4px 0;
}

.todo-list li button {
  margin-left: 8px;
}

.empty {
  color: #666;
}

@media (prefers-color-scheme: dark) {
  .todo-list {
    color: #eee;
  }
  .empty {
    color: #aaa;
  }
}
```

### 期待出力

- 画面上部に入力欄と「追加」ボタン
- 最初は「まだタスクがありません」と薄い色で表示される
- 入力して「追加」を押すと一覧に行が増え、各行に「削除」ボタンが付く
- 「削除」ボタンを押すと、その行だけが消える
- すべて消すと再び「まだタスクがありません」が現れる
- 空欄のまま「追加」を押しても、一覧に何も増えない（`trim()` で空文字は弾いている）

### 変える

- `TodoList` の中で、一覧の上に「現在 N 件」という `<p>` を追加してみる（ヒント: `<p>現在 {todos.length} 件</p>`）
- `handleAdd` を `setTodos((prev) => [newTodo, ...prev])` に変えると、新規が **先頭** に入るようになる
- `TodoInput` 内の `if (trimmed.length === 0) return;` を消すと、空文字で追加されて一覧に空の行ができる。確認したら戻す

### 自分で書く

- `TodoItem` コンポーネントを新たに作り、`<li>{text}<button>削除</button></li>` の部分を切り出す
- `TodoList` は `TodoItem` を `map` で並べるだけにする
- `TodoItem` が受け取る props の型:
  ```ts
  type TodoItemProps = {
    todo: Todo;
    onDelete: (id: string) => void;
  };
  ```
- これは「TODO アプリを React で作る」でそのまま使う形です

## まとめ

- props は基本「親 → 子」の一方通行
- 子から親に伝えたいときは、親が渡した **関数を子が呼ぶ**（コールバック props）
- 複数の子が関わる state は、**共通の親** に持たせる（state lifting）
- 関数の props は `onXxx` という命名にするのが慣習
