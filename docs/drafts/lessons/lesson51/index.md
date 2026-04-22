# lesson51: 送信状態とエラー表示

## ゴール

- `useActionState` の正しいシグネチャ `[state, formAction, isPending] = useActionState(action, initialState)` を覚える。
- Server Action を `(prevState, formData) => newState` の形（reducer 風）に書き直せる。
- `useFormStatus` を `<form>` の **子コンポーネント** で呼んで、送信中のボタン無効化を書ける。
- 2 つのフックの **import 元の違い**（`react` と `react-dom`）を間違えずに使える。

## 解説

### なぜエラー用の別フックが必要か

lesson50 の `addTodo` は、空入力のとき「何もしない」で終わりだった。これではユーザーに「空だから弾いた」ことが伝わらない。

エラーを画面に出すには、**アクションの戻り値** を UI 側に伝える仕組みが必要。そのための React 19 のフックが **`useActionState`**。

### `useActionState` のシグネチャ（絶対に覚える）

```tsx
"use client";

import { useActionState } from "react";
import { addTodo } from "./actions";

type AddTodoState = { error?: string };

const initialState: AddTodoState = {};

const [state, formAction, isPending] = useActionState(addTodo, initialState);
```

- 第 1 引数: **action（Server Action の関数）**
- 第 2 引数: **初期状態**
- 戻り値: `[state, formAction, isPending]` の 3 要素タプル

引数の順に注意。**action が第 1 引数**、初期状態が第 2 引数。逆にしない。

戻り値の中身:

- `state`: 現在のアクション戻り値（`action` が最後に `return` したもの）。初回は `initialState`。
- `formAction`: **`<form action={formAction}>` に渡す**、ラップ済みの関数。元の action ではなくこちらを渡す。
- `isPending`: 送信中かどうかの真偽値。

### Server Action のシグネチャを変える

`useActionState` を使う場合、Server Action は **`(prevState, formData) => newState`** の形に変える必要がある。

```ts
"use server";

export async function addTodo(
  prevState: AddTodoState,
  formData: FormData,
): Promise<AddTodoState> {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) {
    return { error: "空のまま追加はできない" };
  }
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
  return {}; // 成功
}
```

- 第 1 引数が `prevState`（前回のアクションの戻り値）。使わなくても受け取る必要がある。
- 第 2 引数が `FormData`。
- 戻り値が新しい状態。成功時は `{}`、失敗時は `{ error: "..." }` のように分ける。

lesson50 の `addTodo` は `(formData) => void` の形だったので、ここで書き直す。

### `useFormStatus` は `<form>` の **子** で呼ぶ

`useFormStatus` は「そのフォームが送信中かどうか」を取るフック。重要な制約がある。

- **import 元は `react-dom`**（`react` ではない）。
- **`<form>` の子コンポーネント内で呼ぶ必要がある**。フォーム本体（`<form>` を return しているコンポーネント）の中では呼べない。

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "送信中..." : "追加"}
    </button>
  );
}
```

送信ボタンを別コンポーネントに切り出し、その中で `useFormStatus()` を呼ぶ。これが定番パターン。

### import 元の違い（詰まる人が多い）

両者は見た目が似ているが import 元が違う。**太字で強調**:

- **`useActionState` は `react` から**
- **`useFormStatus` は `react-dom` から**

間違えると「そんな export はない」というエラーが出る。最初のうちは毎回見比べながら書くとよい。

## 演習

### 前回のプロジェクトを開く

lesson50 で作ったプロジェクトを開き直す。

### 手順の進め方（重要）

本レッスンは **3 つのファイル**（`app/actions.ts` / `app/todos/TodoForm.tsx` / `app/todos/page.tsx`）を **同時に** 書き換える。片方だけ変えるとビルドエラーになるため、**手順 1 → 2 → 3 を一気に進め、3 が終わってからプレビューを確認する** のが安全。途中で保存されて HMR が走ってエラー画面が出ても慌てず、3 まで進める。

順番としては **「先にフォーム側（手順 2 の `TodoForm.tsx`）を作ってから、最後に `actions.ts` の `addTodo` シグネチャを変える」** ほうがエラー状態が短い。もっとも気持ちよく進めたい人は、次のようにファイルを開く順序で回すとよい:

1. 新しいファイル `app/todos/TodoForm.tsx` を先に **作るだけ作る**（import する `addTodo` の型不一致でエラーが出るが、そのまま進める）
2. `app/todos/page.tsx` で `<form>` ブロックを `<TodoForm />` に差し替え
3. 最後に `app/actions.ts` の `addTodo` を `(prevState, formData) => newState` 形に書き換える

このドキュメント上の掲載は **「どれを書けばいいか」を最初に見せる** ために 手順 1（actions.ts）から順に並べているが、手を動かす順番は上記の 1 → 2 → 3 でもよい。どちらでも最終的には同じ形になる。

### 手順 1: Server Action を `(prevState, formData)` 形に書き直す

`app/actions.ts` を書き換える。

```ts
"use server";

import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

const todos: Todo[] = [];

export type AddTodoState = { error?: string };

export async function listTodos(): Promise<Todo[]> {
  return todos;
}

export async function addTodo(
  prevState: AddTodoState,
  formData: FormData,
): Promise<AddTodoState> {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) {
    return { error: "空のまま追加はできない" };
  }
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
  return {};
}
```

- 戻り値を `AddTodoState` 型にし、成功時は `{}`、失敗時は `{ error: "..." }` を返す。
- `prevState` は受け取るが今回は使わない（それで OK）。

### 手順 2: フォームを Client Component に切り出す

`useActionState` は Client Component のフックなので、フォーム部分だけを別ファイルに分離する。

`app/todos/TodoForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addTodo, type AddTodoState } from "../actions";

const initialState: AddTodoState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "送信中..." : "追加"}
    </button>
  );
}

export function TodoForm() {
  const [state, formAction, isPending] = useActionState(addTodo, initialState);

  return (
    <form action={formAction}>
      <input type="text" name="text" placeholder="やることを入力" />
      <SubmitButton />
      {state.error && <p className="error">{state.error}</p>}
      {isPending && <p>通信中...</p>}
    </form>
  );
}
```

ポイント:

- 1 行目 `"use client"`。
- **`useActionState` は `react` から import**。
- **`useFormStatus` は `react-dom` から import**。
- `<form action={formAction}>` に渡すのは **`formAction`**（`addTodo` ではない）。
- `SubmitButton` を別コンポーネントに切り出して、その中で `useFormStatus()`。
- `state.error` があるときだけ `<p>` に赤文字で表示。
- `isPending` でも「通信中...」を出す（冗長だが違いを確認するため）。

### 手順 3: `/todos` ページで差し替える

`app/todos/page.tsx` の `<form>` を `<TodoForm />` に差し替える。

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

`page.tsx` は Server Component のまま。Client の `TodoForm` を呼ぶだけなので `"use client"` は不要。

### 手順 4: エラー用の CSS

`app/globals.css` にエラー表示のスタイルを追加。

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

1. `/todos` を開いて、何も入力せずに「追加」を押す → 下に赤文字で「空のまま追加はできない」が表示される（薄い赤背景）。
2. 「買い物」と入力して「追加」を押す → エラー表示が消え、一覧に「買い物」が追加される。
3. 何度か連打する → 送信中はボタンが disabled（グレー）になり「送信中...」と表示される。隣に「通信中...」も出る。
4. DevTools の Network タブを開いておくと、送信ごとに POST が飛んでいるのが見える。

### よくある間違い

- `useActionState` を `react-dom` から import しようとして「export がない」エラーになる → `react` から import する。
- `useFormStatus` を `<form>` を返しているコンポーネント自身で呼んでしまう → `pending` が常に `false` になる。子コンポーネントに切り出す。
- `useActionState(initialState, addTodo)` のように引数を逆にする → 型エラー。**action が第 1 引数**、初期状態が第 2 引数。
- `<form action={addTodo}>` と元の関数を渡す → エラー状態がうまく繋がらない。`<form action={formAction}>` と **ラップ済み** の関数を渡す。

### 変えてみる

1. `SubmitButton` の「送信中...」の文言を自分の好きな表現に変える（「追加中です」「お待ちを」など）。
2. エラーの種類を増やす: 先頭の空白文字だけで追加しようとしたときは「空白だけでは追加できない」、5 文字以下のみ許可して「5 文字以内にする」など、`addTodo` 側の判定を足してみる。
3. `useActionState` の初期状態を `{ error: "まずは何か入力" }` にして、初期表示でエラーが出る挙動を確認する（確認したら `{}` に戻す）。

### 自分で書く

lesson50 で自分で作った `/memo` ページを、同じ要領で「空入力エラー + 送信中無効化」に対応させる。`addMemo` の引数を `(prevState, formData)` に書き直し、`<MemoForm />` を Client Component として切り出し、`SubmitButton` で `useFormStatus` を使う。

## まとめ

- `useActionState(action, initialState)` の順番と戻り値 `[state, formAction, isPending]` を覚える。
- Server Action は `(prevState, formData) => newState` の形にすると `useActionState` と繋がる。
- `useFormStatus` は `react-dom` から import して、`<form>` の子コンポーネントで呼ぶ。
- **`useActionState` は `react`、`useFormStatus` は `react-dom`**。import 元が違う。
- 次の lesson52 では、ここまでの知識を統合して TODO アプリを仕上げる。詳細ページ・メタデータ・`searchParams` によるハイライト表示を足す。
