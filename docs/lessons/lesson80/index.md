# lesson80: 送信状態とエラー表示

## ゴール

- `useActionState` の正しいシグネチャ `[state, formAction, isPending] = useActionState(action, initialState)` を覚えます。
- Server Action を `(prevState, formData) => newState` の形（reducer 風）に書き直せます。
- `useFormStatus` を `<form>` の **子コンポーネント** で呼んで、送信中のボタン無効化を書けます。
- 2 つのフックの **import 元の違い**（`react` と `react-dom`）を間違えずに使えます。

## 解説

### なぜエラー用の別フックが必要か

「Server Actions の最小形」の `addTodo` は、空入力のとき「何もしない」で終わりでした。これではユーザーに「空だから弾いた」ことが伝わりません。

エラーを画面に出すには、**アクションの戻り値** を UI 側に伝える仕組みが必要です。そのための React 19 のフックが **`useActionState`** です。

### `useActionState` のシグネチャ（絶対に覚える）

```tsx
"use client";

import { useActionState } from "react";
import { addTodo } from "./actions";

type AddTodoState = { error?: string };

const initialState: AddTodoState = {};

const [state, formAction, isPending] = useActionState(addTodo, initialState);
```

- 第 1 引数: **action**（Server Action の関数）
- 第 2 引数: **初期状態**
- 戻り値: `[state, formAction, isPending]` の 3 要素タプル

引数の順に注意してください。**action が第 1 引数**、初期状態が第 2 引数です。逆にしないでください。

戻り値の中身:

- `state`: 現在のアクション戻り値（`action` が最後に `return` したもの）。初回は `initialState` です。
- `formAction`: **`<form action={formAction}>` に渡す**、ラップ済みの関数です。元の action ではなくこちらを渡します。
- `isPending`: 送信中かどうかの真偽値です。

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
    return { error: "空のまま追加はできない" };
  }
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
  return {}; // 成功
}
```

- 第 1 引数が `prevState`（前回のアクションの戻り値）です。使わなくても受け取る必要があります。
- 第 2 引数が `FormData` です。
- 戻り値が新しい状態です。成功時は `{}`、失敗時は `{ error: "..." }` のように分けます。

「Server Actions の最小形」の `addTodo` は `(formData) => void` の形だったので、ここで書き直します。

### `useFormStatus` は `<form>` の **子** で呼ぶ

`useFormStatus` は「そのフォームが送信中かどうか」を取るフックです。重要な制約があります。

- **import 元は `react-dom`** です（`react` ではありません）。
- **`<form>` の子コンポーネント内で呼ぶ必要があります**。フォーム本体（`<form>` を return しているコンポーネント）の中では呼べません。

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

送信ボタンを別コンポーネントに切り出し、その中で `useFormStatus()` を呼びます。これが定番パターンです。

### import 元の違い（詰まる人が多い）

両者は見た目が似ていますが import 元が違います。**太字で強調**:

- **`useActionState` は `react` から**
- **`useFormStatus` は `react-dom` から**

間違えると「そんな export はない」というエラーが出ます。最初のうちは毎回見比べながら書くと良いです。

### 冪等性と二重送信への備え

`isPending` でボタンを `disabled` にすれば、ユーザーが送信中にもう一度ボタンを押すことは防げます。ただし、これはクライアント側の親切な UI でしかなく、本番では次のような事態に備えてサーバー側でも対策します。

- ユーザーが「送信」を押した直後に **ネットワーク切断** で結果が返ってこず、**手動でリロード後に再送信** する
- ブラウザの戻る/進む / フォームの再送信ダイアログで **同じリクエストが 2 回飛ぶ**

「同じ操作が 2 回届いても結果が変わらない」という性質を **冪等性** と呼びます。Server Action / API を冪等にする実務の定番パターンは次のとおりです。

- **クライアントが `requestId`（ランダム UUID）を生成して送る**: サーバーは `requestId` を DB のユニーク制約付きで保存し、2 回目は無視する
- **state machine**: TODO の `status` が `done` のときに再度 `done` 化する操作は no-op にする
- **upsert / `ON CONFLICT DO NOTHING`**: 同じ ID の挿入を 2 回受けてもエラーにせず無視

本コースでは扱いませんが、`useActionState` で `isPending` を見て disabled にする UI 側の対策と、Server 側の冪等性は **両方そろってはじめて安全** という前提を頭に入れておきます。

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。このレッスンは「Server Actions の最小形」の `addTodo` を前提にしています。

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

export type AddTodoResult = { ok: true } | { ok: false; error: string };

export async function addTodo(formData: FormData): Promise<AddTodoResult> {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) {
    return { ok: false, error: "空のままでは追加できません" };
  }
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
  return { ok: true };
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

### 前回のプロジェクトを開く

これまでのレッスンで作ったプロジェクトを開き直しましょう。

### 手順の進め方（重要）

本レッスンは **3 つのファイル**（`app/actions.ts` / `app/todos/TodoForm.tsx` / `app/todos/page.tsx`）を **同時に** 書き換えます。片方だけ変えるとビルドエラーになるため、**手順 1 → 2 → 3 を一気に進め、3 が終わってからプレビューを確認する** のが安全です。途中で保存されて HMR が走ってエラー画面が出ても慌てず、3 まで進めましょう。

順番としては **「先にフォーム側（手順 2 の `TodoForm.tsx`）を作ってから、最後に `actions.ts` の `addTodo` シグネチャを変える」** ほうがエラー状態が短いです。もっとも気持ちよく進めたい人は、次のようにファイルを開く順序で回すと良いです:

1. 新しいファイル `app/todos/TodoForm.tsx` を先に **作るだけ作る**（import する `addTodo` の型不一致でエラーが出るが、そのまま進めます）
2. `app/todos/page.tsx` で `<form>` ブロックを `<TodoForm />` に差し替え
3. 最後に `app/actions.ts` の `addTodo` を `(prevState, formData) => newState` 形に書き換え

このドキュメント上の掲載は **「どれを書けばいいか」を最初に見せる** ために 手順 1（actions.ts）から順に並べていますが、手を動かす順番は上記の 1 → 2 → 3 でも構いません。どちらでも最終的には同じ形になります。

### 手順 1: Server Action を `(prevState, formData)` 形に書き直す

`app/actions.ts` を書き換えます。

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

- 戻り値を `AddTodoState` 型にし、成功時は `{}`、失敗時は `{ error: "..." }` を返します。
- `prevState` は受け取りますが今回は使いません（それで OK です）。

### 手順 2: フォームを Client Component に切り出す

`useActionState` は Client Component のフックなので、フォーム部分だけを別ファイルに分離します。

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

- 1 行目 `"use client"` です。
- **`useActionState` は `react` から import** します。
- **`useFormStatus` は `react-dom` から import** します。
- `<form action={formAction}>` に渡すのは **`formAction`** です（`addTodo` ではありません）。
- `SubmitButton` を別コンポーネントに切り出して、その中で `useFormStatus()` を呼びます。
- `state.error` があるときだけ `<p>` に赤文字で表示します。
- `isPending` でも「通信中...」を出します（冗長ですが違いを確認するためです）。

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

1. `/todos` を開いて、何も入力せずに「追加」を押す → 下に赤文字で「空のまま追加はできない」が表示されます（薄い赤背景）。
2. 「買い物」と入力して「追加」を押す → エラー表示が消え、一覧に「買い物」が追加されます。
3. 何度か連打する → 送信中はボタンが disabled（グレー）になり「送信中...」と表示されます。隣に「通信中...」も出ます。
4. DevTools の Network タブを開いておくと、送信ごとに POST が飛んでいるのが見えます。

### よくある間違い

- `useActionState` を `react-dom` から import しようとして「export がない」エラーになる → `react` から import します。
- `useFormStatus` を `<form>` を返しているコンポーネント自身で呼んでしまう → `pending` が常に `false` になります。子コンポーネントに切り出しましょう。
- `useActionState(initialState, addTodo)` のように引数を逆にする → 型エラーです。**action が第 1 引数**、初期状態が第 2 引数です。
- `<form action={addTodo}>` と元の関数を渡す → エラー状態がうまく繋がりません。`<form action={formAction}>` と **ラップ済み** の関数を渡しましょう。

### 変えてみる

1. `SubmitButton` の「送信中...」の文言を自分の好きな表現に変えましょう（「追加中です」「お待ちを」など）。
2. エラーの種類を増やしましょう: 先頭の空白文字だけで追加しようとしたときは「空白だけでは追加できない」、5 文字以下のみ許可して「5 文字以内にする」など、`addTodo` 側の判定を足してみましょう。
3. `useActionState` の初期状態を `{ error: "まずは何か入力" }` にして、初期表示でエラーが出る挙動を確認しましょう（確認したら `{}` に戻します）。

### 自分で書く

「Server Actions の最小形」の「自分で書く」で作った `/memo` ページを、同じ要領で「空入力エラー + 送信中無効化」に対応させましょう。`addMemo` の引数を `(prevState, formData)` に書き直し、`<MemoForm />` を Client Component として切り出し、`SubmitButton` で `useFormStatus` を使います。

## まとめ

- `useActionState(action, initialState)` の順番と戻り値 `[state, formAction, isPending]` を覚えましょう。
- Server Action は `(prevState, formData) => newState` の形にすると `useActionState` と繋がります。
- `useFormStatus` は `react-dom` から import して、`<form>` の子コンポーネントで呼びます。
- **`useActionState` は `react`、`useFormStatus` は `react-dom`** です。import 元が違います。
- このあとの「小さなアプリを仕上げる」では、ここまでの知識を統合して TODO アプリを仕上げます。詳細ページ・メタデータ・`searchParams` によるハイライト表示を足します。
