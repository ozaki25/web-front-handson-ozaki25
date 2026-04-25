# lesson84: 小さなアプリを仕上げる（統合）

## ゴール

- ここまでの知識を統合して「投稿できる TODO アプリ」を完成させます。
- `/todos`（一覧 + 追加フォーム）、`/todos/[id]`（詳細）、`/about` の 3 ページが繋がった状態で動きます。
- `export const metadata` でサイト共通タイトルを設定できます（**動的タイトル / OGP は「Metadata API で SEO を整える」のレッスンで詳しく扱います**）。
- `searchParams`（Next.js 15 以降 Promise 化されている）から `?highlight=<id>` を受け取り、対象 TODO を黄色背景で目立たせられます。

## 解説

### 今まで作ってきたものを並べる

2 章 で素の JS で作った TODO、4 章 の「TODO アプリを React で作る」で React + localStorage に移植した TODO、そして「Server Actions の最小形」「送信状態とエラー表示」で Server Actions 化した TODO。

ここまでで以下が揃っています:

- `app/layout.tsx`（「共通レイアウトを作る」）: ナビとフッターを含む共通レイアウト
- `app/page.tsx`（「Next.js ってなに？」で作った形）: トップページ
- `app/about/page.tsx`（「ページを増やしてリンクで移動する」）: 1 章 の自己紹介ページを移植
- `app/posts/page.tsx` / `app/posts/[id]/page.tsx`（「Server Component でデータを取得する」「動的ルート」）: 練習用の記事一覧
- `app/todos/page.tsx` + `app/todos/TodoForm.tsx`（「Server Actions の最小形」「送信状態とエラー表示」）: 追加フォーム付き一覧
- `app/actions.ts`（「Server Actions の最小形」「送信状態とエラー表示」）: Server Actions

このレッスンで足すものは次のとおりです:

1. TODO の **詳細ページ** `/todos/[id]`
2. 一覧からの削除ボタン
3. ルートレイアウトの `metadata`（サイト共通の静的タイトル）
4. `/todos?highlight=<id>` のハイライト表示（`searchParams` の初登場）

::: tip 動的タイトル（generateMetadata）と OGP は別レッスンで
詳細ページ用の **`generateMetadata`** や OGP（`openGraph`）の細かい指定は **「Metadata API で SEO を整える」** のレッスンで深掘りします。本レッスンでは synthesis の集中度を保つため、ルートレイアウトの **静的 `metadata`** のみ扱います。
:::

### `export const metadata`（静的）

ルートレイアウトや静的なページでは、`metadata` という名前の定数を `export` するとタイトル等が設定できます。

```tsx
// app/layout.tsx
export const metadata = {
  title: "TODO アプリ",
  description: "Next.js App Router の学習用アプリ",
};
```

`title` `description` 以外にも OG 画像などを指定できますが、本コースでは 2 つに留めます。

### `searchParams` も Promise

クエリ文字列（`?highlight=abc`）を受け取るのが `searchParams` です。Next.js 15 以降は `params` と同様に **Promise** になっています。

```tsx
export default async function TodosPage({
  searchParams,
}: PageProps<"/todos">) {
  const { highlight } = await searchParams;
  // highlight は string | undefined
}
```

- `PageProps<"/todos">` のグローバル型が `searchParams` を `Promise<{ [key: string]: string | string[] | undefined }>` として推論します。`?highlight=abc` のようなクエリを取り出すときは `await searchParams` してから `highlight` を読みます。
- `?highlight=abc&foo=bar` のように複数指定されていれば、それぞれのキーが文字列として届きます。
- 同じキーが複数個（`?foo=1&foo=2`）あると配列になりますが、本レッスンでは扱いません。

#### `PageProps<"/...">` グローバル型について

`PageProps<"/todos">` は **Next.js 16 が `.next/types/` 配下に自動生成するグローバル型** で、`import` 不要で使えます。これは `tsconfig.json` の `include` に `.next/types/**/*.ts` が入っている前提で動きます（StackBlitz の Next.js テンプレートはこの設定が入っているのでそのまま動きます）。

**初回 `npm run dev` を立ち上げる前にエディタが赤線を出すこと** がありますが、起動して `.next/types` が生成されれば消えます。

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。このレッスンは5 章 の総まとめなので、「共通レイアウトを作る」の共通レイアウト・「Server Actions の最小形」の Server Actions・「送信状態とエラー表示」の `useActionState` / `useFormStatus` が揃っている想定です。

<details>
<summary>出発点のファイル</summary>

**`app/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "My Next App",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <nav>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/todos">Todos</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>&copy; 2026 My Next App</p>
        </footer>
      </body>
    </html>
  );
}
```

**`app/page.tsx`**

```tsx
export default function Page() {
  return (
    <>
      <h1>ようこそ</h1>
      <p>このアプリについてはヘッダーのリンクから。</p>
    </>
  );
}
```

**`app/about/page.tsx`**（「ページを増やしてリンクで移動する」で作った自己紹介ページ。省略可）

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

**`app/todos/TodoForm.tsx`**

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

**`app/todos/page.tsx`**

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

**`app/globals.css`**（「共通レイアウトを作る」と「送信状態とエラー表示」で書いた共通 CSS + `.error` スタイル）

```css
.site-header ul {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 1rem;
  background: #f5f5f5;
}

.site-header a {
  text-decoration: none;
  color: #0070f3;
}

.site-footer {
  padding: 1rem;
  border-top: 1px solid #ddd;
  color: #555;
}

.error {
  color: #c00;
  background: #ffe8e8;
  padding: 0.5rem;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .site-header ul {
    background: #1f1f1f;
  }
  .site-header a {
    color: #4ea2ff;
  }
  .site-footer {
    border-top-color: #333;
    color: #bbb;
  }
  .error {
    color: #ffb0b0;
    background: #4a1d1d;
  }
}
```

</details>

### 前回のプロジェクトを開く

「送信状態とエラー表示」で作ったプロジェクトを開き直しましょう。

### 手順 1: 削除アクションを追加する

`app/actions.ts` に `deleteTodo` を追加します。

```ts
"use server";

import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

const todos: Todo[] = [];

export type AddTodoState = { error?: string };

export async function listTodos(): Promise<Todo[]> {
  return todos;
}

export async function getTodo(id: string): Promise<Todo | undefined> {
  return todos.find((t) => t.id === id);
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

export async function deleteTodo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const index = todos.findIndex((t) => t.id === id);
  if (index >= 0) {
    todos.splice(index, 1);
  }
  revalidatePath("/todos");
}
```

- `getTodo(id)` は詳細ページで使います。
- `deleteTodo` は `FormData` から `id` を取り出し、`splice` で削除します。同じく Server Action です。
- 削除用フォームは `useActionState` を使わない（戻り値不要）ので `(formData) => void` のシンプルな形です。

### 手順 2: 一覧ページで削除ボタンを出す + ハイライト対応

`app/todos/page.tsx` を書き換えます。`searchParams` を受け取って、ハイライトする行に `className` を付けます。

```tsx
import { listTodos, deleteTodo } from "../actions";
import { TodoForm } from "./TodoForm";
import Link from "next/link";

export default async function TodosPage({
  searchParams,
}: PageProps<"/todos">) {
  const { highlight } = await searchParams;
  const todos = await listTodos();

  return (
    <>
      <h1>TODO 一覧</h1>
      <TodoForm />
      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={todo.id === highlight ? "todo-item todo-item--highlight" : "todo-item"}
          >
            <Link href={`/todos/${todo.id}`}>{todo.text}</Link>
            <form action={deleteTodo} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={todo.id} />
              <button type="submit">削除</button>
            </form>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p>まだ 1 件もない。上のフォームから追加する。</p>}
    </>
  );
}
```

ポイント:

- `PageProps<"/todos">` のグローバル型が `searchParams` を Promise として推論するので、`await searchParams` で `highlight` を取り出します。
- `todo.id === highlight` のときだけ `todo-item--highlight` クラスを足します。
- 削除ボタンは `<form action={deleteTodo}>` の中に `<input type="hidden" name="id" value={todo.id} />` を仕込みます。ボタンを押すと `deleteTodo(formData)` が呼ばれます。
- 詳細ページへのリンクも `<Link href={`/todos/${todo.id}`}>` で追加します。

### 手順 3: CSS でハイライト

`app/globals.css` に以下を追加します。

```css
.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.todo-item--highlight {
  background: #fff3a3;
}

@media (prefers-color-scheme: dark) {
  .todo-item {
    border-bottom-color: #333;
  }
  .todo-item--highlight {
    background: #665c1e;
    color: #fff;
  }
}
```

- 黄色背景 `#fff3a3` がハイライトです（ダーク時は濃い黄土色 `#665c1e` + 白文字で視認性を確保します）。

### 手順 4: 詳細ページ `/todos/[id]` を作る

`app/todos/[id]/page.tsx` を新規作成します。

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTodo } from "../../actions";

export default async function TodoDetailPage({
  params,
}: PageProps<"/todos/[id]">) {
  const { id } = await params;
  const todo = await getTodo(id);

  if (!todo) {
    notFound();
  }

  return (
    <>
      <h1>Todo 詳細</h1>
      <p>ID: {todo.id}</p>
      <p>内容: {todo.text}</p>
      <p>
        <Link href={`/todos?highlight=${todo.id}`}>一覧でハイライトして見る</Link>
      </p>
      <p>
        <Link href="/todos">一覧に戻る</Link>
      </p>
    </>
  );
}
```

ポイント:

- 見つからないときは `notFound()` を呼びます（「エラーと見つからないページ」と同じです）。
- `<Link href={`/todos?highlight=${todo.id}`}>` で、一覧のハイライト付き URL に飛べます。
- 詳細ページの **動的タイトル**（`generateMetadata`）は「Metadata API で SEO を整える」のレッスンで扱います。ここではブラウザのタブが共通の「TODO アプリ」のままで OK です。

### 手順 5: 詳細ページの `not-found.tsx`

`app/todos/[id]/not-found.tsx`:

```tsx
import Link from "next/link";

export default function TodoNotFound() {
  return (
    <>
      <h1>Todo が見つからない</h1>
      <p>指定された ID の Todo は存在しない（または削除された）。</p>
      <Link href="/todos">一覧に戻る</Link>
    </>
  );
}
```

### 手順 6: ルートレイアウトの `metadata`

`app/layout.tsx` の `metadata` を書き換えます。

```tsx
export const metadata = {
  title: "TODO アプリ",
  description: "Next.js App Router の学習用 TODO アプリ",
};
```

これでブラウザのタブに「TODO アプリ」と表示されます。`title.template` を使うとページごとに `%s | TODO アプリ` のように共通サフィックスを付けられますが、これは「Metadata API で SEO を整える」で深掘りします。

### 期待出力

1. `/todos` を開く → TODO 一覧が表示されます。0 件なら「まだ 1 件もない」のメッセージが出ます。
2. 「買い物」「課題」「運動」を順に追加 → 3 件の一覧が出ます。各項目は詳細リンクと削除ボタン付きです。
3. タブのタイトルはどのページでも「TODO アプリ」です。
4. 「買い物」をクリック → `/todos/<id>` に遷移します。詳細が表示されます。
5. 「一覧でハイライトして見る」をクリック → `/todos?highlight=<id>` に飛び、その行だけ **黄色背景** になります。
6. 一覧で「削除」ボタンを押す → その 1 件が消えます。
7. 削除した ID で直接 `/todos/<削除済み id>` にアクセス → `not-found.tsx` の「Todo が見つからない」が表示されます。
8. `/about` は 1 章 の自己紹介ページです。
9. ナビから 3 ページを行き来できます。

### 動作確認チェックリスト

- [ ] 空入力で追加ボタン → 「空のまま追加はできない」が表示される（「送信状態とエラー表示」の成果）
- [ ] 送信中はボタンが disabled になる（「送信状態とエラー表示」の成果）
- [ ] 追加 → 一覧が自動で更新される（`revalidatePath` の成果）
- [ ] 削除 → 該当 1 件だけが消える
- [ ] `/todos?highlight=<id>` でその行だけ黄色背景
- [ ] `/todos/<id>` の詳細ページのタブタイトルが動的に変わる
- [ ] `/todos/not-a-real-id` で `not-found.tsx` が出る
- [ ] `/about` が1 章 の自己紹介と同じ見た目で出る

### 変えてみる

1. `<input type="hidden" name="id">` の値を書き換えて送信してみましょう（DevTools で編集）→ 存在しない ID になっても `deleteTodo` 側で `findIndex` が `-1` を返すので何も起きないことを確認します。
2. ルートレイアウトの `metadata.title` を `{ default: "TODO アプリ", template: "%s | TODO アプリ" }` に変えると、子ページで `metadata.title` を設定したときに自動でサフィックスが付きます。「Metadata API で SEO を整える」のレッスンで詳しく扱います。
3. ハイライトを `?highlight=<id>&mode=loud` のように 2 つ目のクエリで太字にする演習です。`searchParams` の型に `mode?: string` を追加し、`mode === "loud"` なら `<strong>` で囲みます。

### 自分で書く（応用）

TODO に「完了」のフラグを追加する演習です。

- `types.ts` の `Todo` 型に `done: boolean` を追加します。
- `actions.ts` に `toggleDone(formData: FormData)` を追加し、`id` を受け取って該当 Todo の `done` を反転させます。
- 一覧の各項目に「完了」ボタンを足し、`<form action={toggleDone}>` で呼び出します。
- 完了済みの項目はテキストに `text-decoration: line-through` を当てます（CSS に `.todo-item--done` を追加）。

実装の流れは「hidden input で id を渡す → サーバー側で配列を書き換える → `revalidatePath` で再レンダリング」が共通パターンです。「Server Actions の最小形」「送信状態とエラー表示」でやったことの応用です。

## まとめ

- `/todos` 一覧、`/todos/[id]` 詳細、`/about` 自己紹介、の 3 本柱が繋がりました。
- ルートレイアウトの `metadata` でサイト共通のタブタイトルを設定しました（動的タイトル / OGP は「Metadata API で SEO を整える」で扱います）。
- `PageProps<"/todos">` で URL クエリ（`searchParams`）を受け取り、`await` してから条件付きスタイルに反映できます。
- 2 章 の TODO（素の JS）→ 4 章 の「TODO アプリを React で作る」（React + localStorage）→ 本レッスン（Next.js + Server Actions）と、**同じ TODO アプリが 3 回進化** しました。
- 「Vercel にデプロイする」では、今作ったアプリを **Vercel で公開** します。StackBlitz → GitHub → Vercel の流れを踏みます。

### 補足: レイアウトのおさらい

このレッスンまでの `app/` 以下は、おおよそ次の形になっているはずです。

```
app/
├── layout.tsx                # 共通レイアウト (Server)
├── page.tsx                  # トップ (Server)
├── globals.css
├── actions.ts                # Server Actions
├── types.ts                  # Todo 型
├── components/               # 共通部品
│   ├── Counter.tsx           # 「Server Component と Client Component」で作った Client コンポーネント
│   ├── ClientBox.tsx
│   └── ServerInfo.tsx
├── about/
│   ├── page.tsx              # 自己紹介 (Server)
│   └── about.css
├── todos/
│   ├── page.tsx              # TODO 一覧 (Server)
│   ├── TodoForm.tsx          # 追加フォーム (Client)
│   └── [id]/
│       ├── page.tsx          # TODO 詳細 (Server)
│       └── not-found.tsx
└── posts/                    # 記事一覧ページの練習用
    ├── page.tsx
    ├── loading.tsx
    └── [id]/
        ├── page.tsx
        ├── error.tsx
        └── not-found.tsx
```

不要になった練習用ページは消しても、残しても構いません。残すと Vercel 公開後も色々見られて面白いです。
