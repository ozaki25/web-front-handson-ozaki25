# lesson82: useActionState でフォームエラーを返す

## ゴール

- `useActionState` のシグネチャ `[state, formAction] = useActionState(action, initialState)` を理解する
- `addTodo` の戻り値を判別共用体（`{ ok: true } | { ok: false; error: string }`）で返し、`state.error` を画面に表示できる
- `useActionState` は `react` から import することを理解する

## 解説

### なぜエラー用のフックが必要か

「Server Actions の最小形」の `addTodo` は、空入力のとき「何もしない」で終わりでした。これではユーザーに「空だから弾いた」ことが伝わりません。

エラーを画面に出すには、**アクションの戻り値** を UI 側に伝える仕組みが必要です。そのための React 19 のフックが **`useActionState`** です。

### `useActionState` のシグネチャを押さえる

**import 元に注意**: `useActionState` は **`react`** から import します。`react-dom` ではありません。逆にすると「そんな export はない」というエラーになります。

```tsx
"use client";

import { useActionState } from "react";
import { addTodo } from "./actions";

type AddTodoState = { error?: string };

const initialState: AddTodoState = {};

const [state, formAction] = useActionState(addTodo, initialState);
```

- 第 1 引数: **action**（Server Action の関数）
- 第 2 引数: **初期状態**
- 戻り値: `[state, formAction]` の 2 要素タプル（第 3 要素として `isPending` も返りますが、このレッスンでは使いません）

引数の順に注意してください。**action が第 1 引数**、初期状態が第 2 引数です。逆にしないでください。

戻り値の中身:

- `state`: 現在のアクション戻り値（`action` が最後に `return` したもの）。初回は `initialState` です。
- `formAction`: **`<form action={formAction}>` に渡す**、ラップ済みの関数です。元の action ではなくこちらを渡します。

### Server Action のシグネチャを変える

`useActionState` を使う場合、Server Action は **`(prevState, formData) => newState`** の形に変える必要があります。

```ts
"use server";

export async function addTodo(
  prevState: AddTodoState,
  formData: FormData,
): Promise<AddTodoState> {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) {
    return { error: "空のままでは追加できません" };
  }
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
  return {};
}
```

- 第 1 引数が `prevState`（前回のアクションの戻り値）です。使わなくても受け取る必要があります。
- 第 2 引数が `FormData` です。
- 戻り値が新しい状態です。成功時は `{}`、失敗時は `{ error: "..." }` のように分けます。

「Server Actions の最小形」の `addTodo` は `formData` だけを受け取る形だったので、ここで書き直します。

### 判別共用体で返す

戻り値を `{ ok: true } | { ok: false; error: string }` の型にすることで、成功・失敗を TypeScript が区別して扱えます。

```ts
export type AddTodoState =
  | { ok: true }
  | { ok: false; error: string };
```

この設計では `state.ok` で分岐し、`state.ok === false` のときだけ `state.error` にアクセスできます。TypeScript が型を絞り込んでくれるので、`state.error` の存在チェックが不要になります。

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。

<details>
<summary>出発点のファイル</summary>

**`app/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
};
```

**`app/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

const todos: Todo[] = [];

export async function listTodos(): Promise<Todo[]> {
  return todos;
}

export async function addTodo(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) return;
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
}
```

**`app/todos/page.tsx`**

```tsx
import { addTodo, listTodos } from "../actions";

export default async function TodosPage() {
  const todos = await listTodos();

  return (
    <>
      <h1>TODO 一覧</h1>
      <form action={addTodo}>
        <input type="text" name="text" placeholder="やることを入力" />
        <button type="submit">追加</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </>
  );
}
```

</details>

### 手順の進め方（重要）

本レッスンは **3 つのファイル**（`app/actions.ts`、`app/todos/TodoForm.tsx`、`app/todos/page.tsx`）を続けて書き換えます。一部だけ変えるとビルドエラーになるため、**手順 1 → 3 をすべて終わらせてから、はじめてプレビューを確認する** のが安全です。

途中で保存すると HMR が走り、エラー画面が出ることがあります。これは中間状態のため正常です。**エラーが出ても慌てず、手順 3 まで一気に進めてください**。

### 手順 1: Server Action を `(prevState, formData)` 形に書き直す

`app/actions.ts` を書き換えます。

```ts
"use server";

import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

const todos: Todo[] = [];

export async function listTodos(): Promise<Todo[]> {
  return todos;
}

export type AddTodoState =
  | { ok: true }
  | { ok: false; error: string };

export async function addTodo(
  prevState: AddTodoState | undefined,
  formData: FormData,
): Promise<AddTodoState> {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) {
    return { ok: false, error: "空のままでは追加できません" };
  }
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
  return { ok: true };
}
```

- 戻り値を `AddTodoState` 型にし、成功時は `{ ok: true }`、失敗時は `{ ok: false, error: "..." }` を返します。
- `prevState` は受け取りますが今回は使いません（それで OK です）。

### 手順 2: フォームを Client Component に切り出す

`useActionState` は Client Component のフックなので、フォーム部分だけを別ファイルに分離します。

`app/todos/TodoForm.tsx` を新規作成します。

```tsx
"use client";

import { useActionState } from "react";
import { addTodo, type AddTodoState } from "../actions";

const initialState: AddTodoState = { ok: true };

export function TodoForm() {
  const [state, formAction] = useActionState(addTodo, initialState);

  return (
    <form action={formAction}>
      <input type="text" name="text" placeholder="やることを入力" />
      <button type="submit">追加</button>
      {state.ok === false && <p className="error">{state.error}</p>}
    </form>
  );
}
```

ポイント:

- 1 行目 `"use client"` です。
- **`useActionState` は `react` から import** します（`react-dom` ではありません）。
- `<form action={formAction}>` に渡すのは **`formAction`** です（`addTodo` ではありません）。
- `state.ok === false` のときだけ `<p>` にエラーを表示します。判別共用体のおかげで TypeScript が `state.error` の存在を保証します。

### 手順 3: `/todos` ページで差し替える

`app/todos/page.tsx` の `<form>` を `<TodoForm />` に差し替えます。

```tsx
import { listTodos } from "../actions";
import { TodoForm } from "./TodoForm";

export default async function TodosPage() {
  const todos = await listTodos();

  return (
    <>
      <h1>TODO 一覧</h1>
      <TodoForm />
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </>
  );
}
```

`page.tsx` は Server Component のままです。Client の `TodoForm` を呼ぶだけなので `"use client"` は不要です。

### 手順 4: エラー用の CSS

`app/globals.css` にエラー表示のスタイルを追加します。

```css
.error {
  color: #c00;
  background: #ffe8e8;
  padding: 0.5rem;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .error {
    color: #ffb0b0;
    background: #4a1d1d;
  }
}
```

### 期待出力

- `/todos` を開いて、何も入力せずに「追加」を押す → 下に赤文字で「空のままでは追加できません」が表示されます（薄い赤背景）。
- 「買い物」と入力して「追加」を押す → エラー表示が消え、一覧に「買い物」が追加されます。

### よくある間違い

- `useActionState` を `react-dom` から import しようとして「export がない」エラーになる → `react` から import します。
- `useActionState(initialState, addTodo)` のように引数を逆にする → 型エラーです。**action が第 1 引数**、初期状態が第 2 引数です。
- `<form action={addTodo}>` と元の関数を渡す → エラー状態がうまく繋がりません。`<form action={formAction}>` と **ラップ済み** の関数を渡しましょう。

### 変えてみる

1. エラーの種類を増やしましょう: 10 文字以上は「長すぎます」のように、`addTodo` 側の判定を足してみましょう。
2. `useActionState` の初期状態を `{ ok: false, error: "まずは何か入力してください" }` にして、初期表示でエラーが出る挙動を確認しましょう（確認したら `{ ok: true }` に戻します）。
3. 成功時に「追加しました」のメッセージを一時的に表示するには、`state.ok === true` かつ 初期状態でない条件を追加してみましょう（ヒント: `AddTodoState` に `justAdded?: boolean` を足す）。

### 自分で書く

「Server Actions の最小形」の「自分で書く」で作った `/memo` ページがあれば、同じ要領で「空入力エラー」に対応させましょう。`addMemo` の引数を `(prevState, formData)` に書き直し、`<MemoForm />` を Client Component として切り出します。

## まとめ

- `useActionState(action, initialState)` の順番と戻り値 `[state, formAction]` を覚える
- Server Action は `(prevState, formData) => newState` の形にすると `useActionState` と繋がる
- 判別共用体（`{ ok: true } | { ok: false; error: string }`）を戻り値の型にすると TypeScript が `state.error` の存在を保証してくれる
- **`useActionState` は `react` から** import する（`react-dom` ではない）

送信中の UI 無効化は「useFormStatus で送信中を無効化する」で扱います。
