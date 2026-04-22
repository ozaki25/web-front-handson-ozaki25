# lesson57: TODO アプリを React で作る（ミニ統合）

章 4 の仕上げです。lesson30 で素の JS + DOM で作った TODO アプリを、章 4 で学んだ React + TS に全面移植します。さらに **localStorage で保存・復元する螺旋** を閉じます。章 4 で扱わなかった **オブジェクト state のイミュータブル更新** もここで扱います。

想定時間は **60〜120 分** です。焦らず段階的に組み立てましょう。

## ゴール

- lesson30 の TODO アプリを React + TS に移植し、3 つのコンポーネント（`TodoInput` / `TodoList` / `TodoItem`）に分割できます。
- 章 3 の `Todo` 型を `import type` して使えます。
- `useState` の **初期値関数** を使って localStorage から復元できます。
- `useEffect` で localStorage に保存できます。
- オブジェクト state のイミュータブル更新（`setX(prev => ({ ...prev, ... }))`）が書けます。
- 初期値関数を使わない **誤実装の書き戻しバグ** を体験してから、正しい形に直せます。

## 解説

### lesson30 で作ったものを思い出す

章 2 の lesson30 で、素の HTML + JS + localStorage で TODO アプリを作りました。構成は次のようなものでした。

- `<input>` と「追加」ボタン、`<ul>` の一覧、各 `<li>` に「削除」ボタン
- `todos` という配列を JS で持つ
- 追加: 配列に push → 画面を描き直す
- 削除: 配列から filter → 画面を描き直す
- localStorage に保存・復元

これを React で書き直すとどう変わるでしょうか。主な違いは次の 3 点です。

1. **配列を `useState` で持つ**: 自分で `render()` を呼ばなくても、`setTodos` を呼べば自動で描き直されます。
2. **コンポーネントに分割する**: 入力欄、一覧、1 件、の 3 つに分けて見通しを良くします。
3. **配列の更新はイミュータブル**: `push` / `splice` は使わず、新しい配列を作ります（lesson46 で学びました）。

### 使う型（章 3 の `Todo`）

章 3 lesson33 〜 31 で `types.ts` に次の型を育ててきました。

```ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};
```

今回は `status` と `memo` は使いません（統合ですが、必要最小限にとどめます）。実装中は `id` と `text` だけ参照します。

### コンポーネント分割の設計

今回は 3 つに分けます。

```
App
├── TodoInput   ← 入力欄 + 追加ボタン
└── TodoList    ← 一覧全体
    └── TodoItem (todos.length 個)   ← 1 行
```

各コンポーネントの props は次のとおりです。

```ts
// TodoInput の props
type TodoInputProps = {
  onAdd: (text: string) => void;
};

// TodoList の props
type TodoListProps = {
  todos: Todo[];
  onDelete: (id: string) => void;
};

// TodoItem の props
type TodoItemProps = {
  todo: Todo;
  onDelete: (id: string) => void;
};
```

**状態の持ち主** は一番上の `App` です。`TodoInput` は「追加しました」を `onAdd` で伝えるだけ。`TodoList` と `TodoItem` は描画と削除イベントの伝達だけを担います（lesson50 で学んだ state lifting の応用です）。

### localStorage と `useEffect` の組み合わせ（ここで注意が必要）

素直に書くと次のようにしたくなります。

```tsx
// NG: 誤った実装
const [todos, setTodos] = useState<Todo[]>([]);

useEffect(() => {
  const saved = localStorage.getItem("todos");
  if (saved) setTodos(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);
```

一見正しそうに見えます。でも **この書き方には落とし穴があります**。

初回レンダリング直後のタイミングを追うと、

1. `useState([])` で `todos = []`（空配列）で初期化されます
2. 初回レンダリング完了
3. 2 つ目の `useEffect`（保存用）が動く → `localStorage.setItem("todos", "[]")` で **localStorage を空配列で上書きしてしまう**
4. 1 つ目の `useEffect`（読み込み用）が動く → もう遅い

つまり **ページを開くたびに一度 `localStorage` が空になります**。以後のセッションで追加した内容は保存されますが、タブを開き直すと毎回 `todos` が空にリセットされる（ように見える）のです。

#### 解決策: `useState` の初期値関数

この問題を一番シンプルに避ける書き方が **`useState` の初期値関数** です。

```tsx
// OK: 正しい実装
const [todos, setTodos] = useState<Todo[]>(() => {
  try {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);
```

`useState(initialValue)` の `initialValue` に **関数を渡す** と、その関数は **コンポーネントの初回レンダリングのときだけ** 実行されます。ここで `localStorage` から読み込みます。

- 初回レンダリングで `todos` にはすでに復元済みの配列が入っています
- その後 `useEffect([todos])` が動きますが、そのときの `todos` は復元済みなので同じ内容を書き戻すだけです
- 空配列で上書きするバグは起きません

`try` / `catch` で囲んでいるのは、`localStorage` に不正な JSON が保存されていた場合（何かの事故で壊れた場合）に `JSON.parse` が例外を投げるためです。lesson27 で学んだ `try` / `catch` の復習になっています。

### オブジェクト state のイミュータブル更新

lesson46 では配列の state 更新（`[...prev, newItem]` など）を扱いました。オブジェクトを state にするときも同じ発想が必要になります。

```tsx
type Settings = { theme: "light" | "dark"; fontSize: number };
const [settings, setSettings] = useState<Settings>({ theme: "light", fontSize: 16 });

// NG: 直接書き換えは効かない
settings.theme = "dark";
setSettings(settings); // 同じオブジェクトなので React は変化を検知できない

// OK: 新しいオブジェクトを作って渡す
setSettings((prev) => ({ ...prev, theme: "dark" }));
```

`prev => ({ ...prev, ... })` のパターンは今後も頻出します。今回の TODO では直接使いませんが、演習の末尾でこの形に触れます。

## 演習

### 途中から始める場合

lesson55 までで作ったプロジェクト（`useTodos` カスタムフックを含む）があればそのまま使えます。手元に無ければ、新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開き、下の「出発点のファイル」を貼って揃えてください。本レッスンはステップ 1 から新規に組み直す前提でも進められるように書いていますが、`useTodos` を先に持っていると `App.tsx` をそのフックベースに差し替える形で学べます。

<details>
<summary>出発点のファイル（lesson55 完成時点の <code>useTodos</code> 版）</summary>

**`src/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
  done: boolean;
};
```

**`src/useTodos.ts`**

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

**`src/TodoList.tsx`**

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

**`src/App.tsx`**

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

本レッスンでは、ステップ 6 〜 8 で `App.tsx` を localStorage 連携版に書き換えます。`TodoItem` コンポーネント（本レッスンで切り出すもの）と `TodoList` を入れ替える部分は本文の手順どおりに進めてください。`useTodos` を使わず `App.tsx` で直接 state を持つ構成で進める場合は、本文ステップ 1 からの指示に従って新規に組めば OK です。

</details>

### 到達する完成形

```
私の TODO

┌──────────────────────────────┬────────────┐
│ 新しい TODO を入力            │ [追加]      │
└──────────────────────────────┴────────────┘

- 牛乳を買う              [削除]
- 引き継ぎドキュメントを書く  [削除]
- 本を返す                [削除]
```

- 入力して「追加」を押すと一覧末尾に追加されます
- 各項目の「削除」ボタンで、その 1 件だけが消えます
- ページをリロード（タブを閉じて開き直し）しても、追加した TODO は残っています
- 入力欄が空のまま「追加」を押してもエラーにはせず、単に追加しません（`.trim()` が空ならスキップ）

### ステップ 1: StackBlitz で React + Vite（TS）テンプレートを開く

StackBlitz のトップから「React + Vite + TypeScript」を選びます（もしくは lesson53 までで作ったプロジェクトをそのまま使っても構いません。本レッスンは新規プロジェクトの方が整理しやすいです）。`npm install` と `npm run dev` は自動で実行されます。

### ステップ 2: `types.ts` で `Todo` 型を用意する

`src/types.ts` を新規作成します。章 3 で育てた型の最小版を書きます。

```ts
export type Todo = {
  id: string;
  text: string;
};
```

lesson35 で追加した `status` と `memo` は今回は使わないので省略します。章 5 で Server Actions 版に移植するときに拡張します。

### ステップ 3: `TodoInput` コンポーネントを作る

`src/TodoInput.tsx` を新規作成します。

```tsx
import { useState } from "react";
import type { FormEvent } from "react";

type TodoInputProps = {
  onAdd: (text: string) => void;
};

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="新しい TODO を入力"
      />
      <button type="submit">追加</button>
    </form>
  );
}
```

lesson48 で扱った制御コンポーネントの形です。`onSubmit` で `preventDefault()` を呼んでいます（章 5 lesson68 の Server Actions ではこれが不要になります）。空文字列は追加しません。

### ステップ 4: `TodoItem` コンポーネントを作る

`src/TodoItem.tsx` を新規作成します。

```tsx
import type { Todo } from "./types";

type TodoItemProps = {
  todo: Todo;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onDelete }: TodoItemProps) {
  return (
    <li>
      <span>{todo.text}</span>
      <button type="button" onClick={() => onDelete(todo.id)}>
        削除
      </button>
    </li>
  );
}
```

`import type` で `Todo` 型を取り込んでいます（lesson33 の形）。`onDelete(todo.id)` で親に削除要求を渡します。

### ステップ 5: `TodoList` コンポーネントを作る

`src/TodoList.tsx` を新規作成します。

```tsx
import type { Todo } from "./types";
import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  onDelete: (id: string) => void;
};

export function TodoList({ todos, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p>TODO はまだありません。</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onDelete={onDelete} />
      ))}
    </ul>
  );
}
```

lesson44 の `.map` + `key` パターンです。`key={todo.id}` を忘れないでください。`todos.length === 0` のときの早期 return は lesson49 で学んだ条件表示の形です。

### ステップ 6: `App.tsx` で全体を組み立てる（最初はバグあり版）

`src/App.tsx` を次のように書きます。**意図的にバグのある版** から始めて、次のステップで直します。

```tsx
import { useState, useEffect } from "react";
import type { Todo } from "./types";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";

export default function App() {
  // NG: このバグあり版では useState([]) にして useEffect で後から読み込む
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function handleAdd(text: string) {
    const newTodo: Todo = { id: crypto.randomUUID(), text };
    setTodos((prev) => [...prev, newTodo]);
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h1>私の TODO</h1>
      <TodoInput onAdd={handleAdd} />
      <TodoList todos={todos} onDelete={handleDelete} />
    </main>
  );
}
```

`crypto.randomUUID()` はブラウザ組み込みで、衝突しない ID 文字列を返します（`"xxxxxxxx-xxxx-..."` 形式）。

**期待出力**（バグあり版）: TODO を何件か追加できます。削除もできます。ただし、ブラウザのタブを閉じて開き直す、または F5 でリロードすると、**前回追加した TODO が消えている** ことがあります。

### ステップ 7: バグを体験する

**実行前の準備**（重要）: このバグの再現には **StrictMode を一時的に外す** 必要があります。React の StrictMode は、開発時に `useEffect` を意図的に 2 回実行して副作用の問題を検出する仕組みで、オンのままだと「バグが出たり出なかったり」して観察しづらいためです。

`src/main.tsx` を開き、`<StrictMode>` で包んでいる行を一時的に外します。

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

学習目的で外しただけなので、ステップ 8 で正しい実装に直したら元に戻して構いません。もう 1 つの確認方法として、プレビュー右上の「Open in New Tab」でプレビューを別タブに開き、そのタブを閉じて再度開く、も安定した再現になります（StrictMode の開発時 2 重実行よりも、タブのライフサイクルに沿った再現の方が確実です）。

実際に以下を試しましょう。

1. 「牛乳を買う」を追加
2. DevTools（F12）→ Application タブ → Local Storage → プロジェクト URL → `todos` キーを確認。`["{\"id\":\"...\",\"text\":\"牛乳を買う\"}"]` のような文字列が入っています
3. プレビューを別タブで開き、そのタブを閉じて、もう一度開く（または StackBlitz プレビューの再読み込みボタンを押す）
4. **画面は空**。でも Local Storage をもう一度見ると、`todos` キーの値は `[]`（空配列）になっています

**何が起きたか**:

1. ページ読み込み → `useState<Todo[]>([])` で `todos` が空配列で初期化
2. 初回レンダリング完了
3. 保存用の `useEffect([todos])` が動く → 空配列を `localStorage` に書き込む（**ここで上書き!**）
4. 読み込み用の `useEffect([])` が動く → localStorage にはもう空配列しかない
5. `setTodos([])`（空配列をセット、もともと空だから何も変わらない）

つまり **起動のたびに空配列で上書きする** ので、永続化が機能していないのです。

### ステップ 8: `useState` の初期値関数で直す

`App.tsx` の先頭部分を次のように書き換えます。

```tsx
import { useState, useEffect } from "react";
import type { Todo } from "./types";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem("todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function handleAdd(text: string) {
    const newTodo: Todo = { id: crypto.randomUUID(), text };
    setTodos((prev) => [...prev, newTodo]);
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h1>私の TODO</h1>
      <TodoInput onAdd={handleAdd} />
      <TodoList todos={todos} onDelete={handleDelete} />
    </main>
  );
}
```

変更点:

- `useState([])` の `[]` の代わりに **関数** を渡しています（`() => { ... }`）。この関数は初回レンダリングのときだけ実行されます
- `try` / `catch` で `JSON.parse` の失敗（不正なデータが保存されていた場合）を拾います
- 読み込み用の `useEffect` を削除しました（初期値関数に吸収されました）

一度 DevTools で Local Storage の `todos` を削除してから試すと分かりやすいです。

**期待出力**（正しい版）:

1. 「牛乳を買う」「本を返す」を追加
2. タブを閉じる / F5 リロード
3. 一覧に 2 件残っている

### ステップ 9: オブジェクト state のイミュータブル更新（追加演習）

おまけ演習として、「画面の設定」を state で持つ例を作ります。`App.tsx` に次を足します。

```tsx
type Settings = { showCount: boolean };

// App コンポーネント内
const [settings, setSettings] = useState<Settings>({ showCount: true });

// 末尾の JSX 内、<h1> の横などに追加
<label>
  <input
    type="checkbox"
    checked={settings.showCount}
    onChange={(event) =>
      setSettings((prev) => ({ ...prev, showCount: event.target.checked }))
    }
  />
  件数を表示
</label>
{settings.showCount && <p>合計 {todos.length} 件</p>}
```

`setSettings((prev) => ({ ...prev, showCount: ... }))` で、新しいオブジェクトを作って渡しています。`prev` を直接書き換えません。これがオブジェクト state の基本形です。

**期待出力**: チェックボックスをオン / オフすると「合計 N 件」の表示が切り替わります。

### ステップ 10: 最低限のスタイルを当てる

好みで、`App.tsx` の `<main>` にインラインスタイルを入れていますが、これを `src/App.css` などに切り出しても構いません。Flexbox や `gap` を使って、入力欄と追加ボタンを横並びにすると見やすくなります。章 1 の知識で十分対応できる範囲なので、時間があれば見た目を整えてみましょう。

## まとめ

章 4 の統合ポイントです。

- 章 2 lesson30 の素の JS + DOM の TODO が、React + TS + コンポーネント分割 + localStorage + `useEffect` で書き直せました
- 章 3 の `Todo` 型を `import type` して、props にも state にも使っています
- `useState` の初期値関数で **localStorage 書き戻しバグ** を避けました
- オブジェクト state のイミュータブル更新（`prev => ({ ...prev, ... })`）を体験しました

次は章 5、**Next.js** です。TODO アプリはここからさらに進化します。

- lesson59 で章 1 の自己紹介ページを `/about` として復活させます
- lesson63 でデータ取得を Server Component に任せます（ブラウザ側 `fetch` + `useEffect` の罠を避けられます）
- lesson68 で **Server Actions** を使い、今回書いた `onSubmit` + `preventDefault()` の代わりに `<form action={serverAction}>` で送信をサーバーに届けます
- lesson73 で TODO アプリが一覧 + 詳細 + 追加フォームを備えた「実用っぽい」形になります

本レッスンの成果物（`App.tsx` / `TodoInput.tsx` / `TodoList.tsx` / `TodoItem.tsx` / `types.ts`）は、章 5 lesson68 で Server Actions 版に書き換えるときの **出発点** になります。StackBlitz のプロジェクトは残しておくか、ローカルにコピーしておきましょう。
