# lesson42: TODO アプリを React で作る（ミニ統合）

章 4 の仕上げ。lesson25 で素の JS + DOM で作った TODO アプリを、章 4 で学んだ React + TS に全面移植する。さらに **localStorage で保存・復元する螺旋** を閉じる。章 4 で扱わなかった **オブジェクト state のイミュータブル更新** もここで扱う。

想定時間は **60〜120 分**。焦らず段階的に組み立てる。

## ゴール

- lesson25 の TODO アプリを React + TS に移植し、3 つのコンポーネント（`TodoInput` / `TodoList` / `TodoItem`）に分割できる。
- 章 3 の `Todo` 型を `import type` して使える。
- `useState` の **初期値関数** を使って localStorage から復元できる。
- `useEffect` で localStorage に保存できる。
- オブジェクト state のイミュータブル更新（`setX(prev => ({ ...prev, ... }))`）が書ける。
- 初期値関数を使わない **誤実装の書き戻しバグ** を体験してから、正しい形に直せる。

## 解説

### lesson25 で作ったものを思い出す

章 2 の lesson25 で、素の HTML + JS + localStorage で TODO アプリを作った。構成は次のようなものだった。

- `<input>` と「追加」ボタン、`<ul>` の一覧、各 `<li>` に「削除」ボタン
- `todos` という配列を JS で持つ
- 追加: 配列に push → 画面を描き直す
- 削除: 配列から filter → 画面を描き直す
- localStorage に保存・復元

これを React で書き直すとどう変わるか? 主な違いは次の 3 点。

1. **配列を `useState` で持つ**: 自分で `render()` を呼ばなくても、`setTodos` を呼べば自動で描き直される。
2. **コンポーネントに分割する**: 入力欄、一覧、1 件、の 3 つに分けて見通しを良くする。
3. **配列の更新はイミュータブル**: `push` / `splice` は使わず、新しい配列を作る（lesson37 でやった）。

### 使う型（章 3 の `Todo`）

章 3 lesson28 〜 31 で `types.ts` に次の型を育ててきた。

```ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};
```

今回は `status` と `memo` は使わない（統合だが、必要最小限にとどめる）。実装中は `id` と `text` だけ参照する。

### コンポーネント分割の設計

今回は 3 つに分ける。

```
App
├── TodoInput   ← 入力欄 + 追加ボタン
└── TodoList    ← 一覧全体
    └── TodoItem (todos.length 個)   ← 1 行
```

各コンポーネントの props は次のとおり。

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

**状態の持ち主** は一番上の `App`。`TodoInput` は「追加しました」を `onAdd` で伝えるだけ。`TodoList` と `TodoItem` は描画と削除イベントの伝達だけを担う（lesson40 で学んだ state lifting の応用）。

### localStorage と `useEffect` の組み合わせ（ここで注意が必要）

素直に書くと次のようにしたくなる。

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

一見正しそうに見える。でも **この書き方には落とし穴がある**。

初回レンダリング直後のタイミングを追うと、

1. `useState([])` で `todos = []`（空配列）で初期化される
2. 初回レンダリング完了
3. 2 つ目の `useEffect`（保存用）が動く → `localStorage.setItem("todos", "[]")` で **localStorage を空配列で上書きしてしまう**
4. 1 つ目の `useEffect`（読み込み用）が動く → もう遅い

つまり **ページを開くたびに一度 `localStorage` が空になる**。以後のセッションで追加した内容は保存されるが、タブを開き直すと毎回 `todos` が空にリセットされる（ように見える）。

#### 解決策: `useState` の初期値関数

この問題を一番シンプルに避ける書き方が **`useState` の初期値関数** だ。

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

`useState(initialValue)` の `initialValue` に **関数を渡す** と、その関数は **コンポーネントの初回レンダリングのときだけ** 実行される。ここで `localStorage` から読み込む。

- 初回レンダリングで `todos` にはすでに復元済みの配列が入っている
- その後 `useEffect([todos])` が動くが、そのときの `todos` は復元済みなので同じ内容を書き戻すだけ
- 空配列で上書きするバグは起きない

`try` / `catch` で囲んでいるのは、`localStorage` に不正な JSON が保存されていた場合（何かの事故で壊れた場合）に `JSON.parse` が例外を投げるため。lesson22 で学んだ `try` / `catch` の復習になっている。

### オブジェクト state のイミュータブル更新

lesson37 では配列の state 更新（`[...prev, newItem]` など）を扱った。オブジェクトを state にするときも同じ発想が必要になる。

```tsx
type Settings = { theme: "light" | "dark"; fontSize: number };
const [settings, setSettings] = useState<Settings>({ theme: "light", fontSize: 16 });

// NG: 直接書き換えは効かない
settings.theme = "dark";
setSettings(settings); // 同じオブジェクトなので React は変化を検知できない

// OK: 新しいオブジェクトを作って渡す
setSettings((prev) => ({ ...prev, theme: "dark" }));
```

`prev => ({ ...prev, ... })` のパターンは今後も頻出する。今回の TODO では直接使わないが、演習の末尾でこの形に触れる。

## 演習

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

- 入力して「追加」を押すと一覧末尾に追加される
- 各項目の「削除」ボタンで、その 1 件だけが消える
- ページをリロード（タブを閉じて開き直し）しても、追加した TODO は残っている
- 入力欄が空のまま「追加」を押してもエラーにはせず、単に追加しない（`.trim()` が空ならスキップ）

### ステップ 1: StackBlitz で React + Vite（TS）テンプレートを開く

StackBlitz のトップから「React + Vite + TypeScript」を選ぶ（もしくは lesson41 までで作ったプロジェクトをそのまま使ってもよい。本レッスンは新規プロジェクトの方が整理しやすい）。`npm install` と `npm run dev` は自動で実行される。

### ステップ 2: `types.ts` で `Todo` 型を用意する

`src/types.ts` を新規作成。章 3 で育てた型の最小版を書く。

```ts
export type Todo = {
  id: string;
  text: string;
};
```

lesson29 で追加した `status` と `memo` は今回は使わないので省略する。章 5 で Server Actions 版に移植するときに拡張する。

### ステップ 3: `TodoInput` コンポーネントを作る

`src/TodoInput.tsx` を新規作成。

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

lesson38 でやった制御コンポーネントの形。`onSubmit` で `preventDefault()` を呼んでいる（章 5 lesson50 の Server Actions ではこれが不要になる）。空文字列は追加しない。

### ステップ 4: `TodoItem` コンポーネントを作る

`src/TodoItem.tsx` を新規作成。

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

`import type` で `Todo` 型を取り込んでいる（lesson28 の形）。`onDelete(todo.id)` で親に削除要求を渡す。

### ステップ 5: `TodoList` コンポーネントを作る

`src/TodoList.tsx` を新規作成。

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

lesson35 の `.map` + `key` パターン。`key={todo.id}` を忘れない。`todos.length === 0` のときの早期 return は lesson39 で学んだ条件表示の形。

### ステップ 6: `App.tsx` で全体を組み立てる（最初はバグあり版）

`src/App.tsx` を次のように書く。**意図的にバグのある版** から始めて、次のステップで直す。

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

`crypto.randomUUID()` はブラウザ組み込みで、衝突しない ID 文字列を返す（`"xxxxxxxx-xxxx-..."` 形式）。

**期待出力（バグあり版）**: TODO を何件か追加できる。削除もできる。ただし、ブラウザのタブを閉じて開き直す、または F5 でリロードすると、**前回追加した TODO が消えている** ことがある。

### ステップ 7: バグを体験する

**実行前の準備（重要）**: このバグの再現には **StrictMode を一時的に外す** 必要がある。React の StrictMode は、開発時に `useEffect` を意図的に 2 回実行して副作用の問題を検出する仕組みで、オンのままだと「バグが出たり出なかったり」して観察しづらい。

`src/main.tsx` を開き、`<StrictMode>` で包んでいる行を一時的に外す。

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

学習目的で外しただけなので、ステップ 8 で正しい実装に直したら元に戻してよい。もう 1 つの確認方法として、プレビュー右上の「Open in New Tab」でプレビューを別タブに開き、そのタブを閉じて再度開く、も安定した再現になる（StrictMode の開発時 2 重実行よりも、タブのライフサイクルに沿った再現の方が確実）。

実際に以下を試す。

1. 「牛乳を買う」を追加
2. DevTools（F12）→ Application タブ → Local Storage → プロジェクト URL → `todos` キーを確認。`["{\"id\":\"...\",\"text\":\"牛乳を買う\"}"]` のような文字列が入っている
3. プレビューを別タブで開き、そのタブを閉じて、もう一度開く（または StackBlitz プレビューの再読み込みボタンを押す）
4. **画面は空**。でも Local Storage をもう一度見ると、`todos` キーの値は `[]`（空配列）になっている

**何が起きたか**:

1. ページ読み込み → `useState<Todo[]>([])` で `todos` が空配列で初期化
2. 初回レンダリング完了
3. 保存用の `useEffect([todos])` が動く → 空配列を `localStorage` に書き込む（**ここで上書き!**）
4. 読み込み用の `useEffect([])` が動く → localStorage にはもう空配列しかない
5. `setTodos([])`（空配列をセット、もともと空だから何も変わらない）

つまり **起動のたびに空配列で上書きする** ので、永続化が機能していない。

### ステップ 8: `useState` の初期値関数で直す

`App.tsx` の先頭部分を次のように書き換える。

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

- `useState([])` の `[]` の代わりに **関数** を渡している（`() => { ... }`）。この関数は初回レンダリングのときだけ実行される
- `try` / `catch` で `JSON.parse` の失敗（不正なデータが保存されていた場合）を拾う
- 読み込み用の `useEffect` を削除（初期値関数に吸収された）

一度 DevTools で Local Storage の `todos` を削除してから試すと分かりやすい。

**期待出力（正しい版）**:

1. 「牛乳を買う」「本を返す」を追加
2. タブを閉じる / F5 リロード
3. 一覧に 2 件残っている

### ステップ 9: オブジェクト state のイミュータブル更新（追加演習）

おまけ演習として、「画面の設定」を state で持つ例を作る。`App.tsx` に次を足す。

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

`setSettings((prev) => ({ ...prev, showCount: ... }))` で、新しいオブジェクトを作って渡している。`prev` を直接書き換えない。これがオブジェクト state の基本形。

**期待出力**: チェックボックスをオン / オフすると「合計 N 件」の表示が切り替わる。

### ステップ 10: 最低限のスタイルを当てる

好みで、`App.tsx` の `<main>` にインラインスタイルを入れているが、これを `src/App.css` などに切り出してもよい。Flexbox や `gap` を使って、入力欄と追加ボタンを横並びにすると見やすい。章 1 の知識で十分対応できる範囲なので、時間があれば見た目を整えてみる。

## まとめ

章 4 の統合ポイント。

- 章 2 lesson25 の素の JS + DOM の TODO が、React + TS + コンポーネント分割 + localStorage + `useEffect` で書き直せた
- 章 3 の `Todo` 型を `import type` して、props にも state にも使っている
- `useState` の初期値関数で **localStorage 書き戻しバグ** を避けた
- オブジェクト state のイミュータブル更新（`prev => ({ ...prev, ... })`）を体験した

次は章 5、**Next.js** だ。TODO アプリはここからさらに進化する。

- lesson44 で章 1 の自己紹介ページを `/about` として復活させる
- lesson47 でデータ取得を Server Component に任せる（ブラウザ側 `fetch` + `useEffect` の罠を避けられる）
- lesson50 で **Server Actions** を使い、今回書いた `onSubmit` + `preventDefault()` の代わりに `<form action={serverAction}>` で送信をサーバーに届ける
- lesson52 で TODO アプリが一覧 + 詳細 + 追加フォームを備えた「実用っぽい」形になる

本レッスンの成果物（`App.tsx` / `TodoInput.tsx` / `TodoList.tsx` / `TodoItem.tsx` / `types.ts`）は、章 5 lesson50 で Server Actions 版に書き換えるときの **出発点** になる。StackBlitz のプロジェクトは残しておくか、ローカルにコピーしておこう。
