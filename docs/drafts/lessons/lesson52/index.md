# lesson52: 小さなアプリを仕上げる（統合）

## ゴール

- ここまでの知識を統合して「投稿できる TODO アプリ」を完成させる。
- `/todos`（一覧 + 追加フォーム）、`/todos/[id]`（詳細）、`/about` の 3 ページが繋がった状態で動く。
- `export const metadata` でサイト共通タイトル、`generateMetadata` で詳細ページの動的タイトルを設定できる。
- `searchParams`（Next.js 15 で Promise 化されている）から `?highlight=<id>` を受け取り、対象 TODO を黄色背景で目立たせられる。

## 解説

### 今まで作ってきたものを並べる

章 2 lesson25 で素の JS で作った TODO、章 4 lesson42 で React + localStorage に移植した TODO、そして lesson50 / 51 で Server Actions 化した TODO。

ここまでで以下が揃っている:

- `app/layout.tsx`（lesson45）: ナビとフッターを含む共通レイアウト
- `app/page.tsx`（lesson43-46）: トップページ
- `app/about/page.tsx`（lesson44）: 章 1 の自己紹介ページを移植
- `app/posts/page.tsx` / `app/posts/[id]/page.tsx`（lesson47-49）: 練習用の記事一覧
- `app/todos/page.tsx` + `app/todos/TodoForm.tsx`（lesson50-51）: 追加フォーム付き一覧
- `app/actions.ts`（lesson50-51）: Server Actions

このレッスンで足すもの:

1. TODO の **詳細ページ** `/todos/[id]`
2. 一覧からの削除ボタン
3. ルートレイアウトの `metadata`（サイト共通）
4. 詳細ページの `generateMetadata`（動的タイトル）
5. `/todos?highlight=<id>` のハイライト表示（`searchParams` の初登場）

### `export const metadata`（静的）

ルートレイアウトや静的なページでは、`metadata` という名前の定数を `export` するとタイトル等が設定できる。

```tsx
// app/layout.tsx
export const metadata = {
  title: "TODO アプリ",
  description: "Next.js App Router の学習用アプリ",
};
```

`title` `description` 以外にも OG 画像などを指定できるが、本コースでは 2 つに留める。

### `generateMetadata`（動的）

URL ごとにタイトルを変えたいときは、静的な定数では足りない。その場合は **`generateMetadata` 関数** を `export` する。

```tsx
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Todo #${id}` };
}
```

- 関数名は `generateMetadata` 固定。
- 引数は `page.tsx` と同じ形。`params` は Promise なので `await` する。
- 戻り値は `export const metadata` と同じ形のオブジェクト。

### `searchParams` も Promise

クエリ文字列（`?highlight=abc`）を受け取るのが `searchParams`。Next.js 15 では `params` と同様に **Promise** になっている。

```tsx
type Props = {
  searchParams: Promise<{ highlight?: string }>;
};

export default async function TodosPage({ searchParams }: Props) {
  const { highlight } = await searchParams;
  // highlight は string | undefined
}
```

- キーは省略可能（クエリがないこともある）なので `?` を付けた型にする。
- `?highlight=abc&foo=bar` のように複数指定されていれば、それぞれのキーが文字列として届く。
- 同じキーが複数個（`?foo=1&foo=2`）あると配列になるが、本レッスンでは扱わない。

## 演習

### 前回のプロジェクトを開く

lesson51 で作ったプロジェクトを開き直す。

### 手順 1: 削除アクションを追加する

`app/actions.ts` に `deleteTodo` を追加。

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

- `getTodo(id)` は詳細ページで使う。
- `deleteTodo` は `FormData` から `id` を取り出し、`splice` で削除。同じく Server Action。
- 削除用フォームは `useActionState` を使わない（戻り値不要）ので `(formData) => void` のシンプルな形。

### 手順 2: 一覧ページで削除ボタンを出す + ハイライト対応

`app/todos/page.tsx` を書き換える。`searchParams` を受け取って、ハイライトする行に `className` を付ける。

```tsx
import { listTodos, deleteTodo } from "../actions";
import { TodoForm } from "./TodoForm";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ highlight?: string }>;
};

export default async function TodosPage({ searchParams }: Props) {
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

- `searchParams: Promise<{ highlight?: string }>` と型を書いて `await` で取り出す。
- `todo.id === highlight` のときだけ `todo-item--highlight` クラスを足す。
- 削除ボタンは `<form action={deleteTodo}>` の中に `<input type="hidden" name="id" value={todo.id} />` を仕込む。ボタンを押すと `deleteTodo(formData)` が呼ばれる。
- 詳細ページへのリンクも `<Link href={`/todos/${todo.id}`}>` で追加。

### 手順 3: CSS でハイライト

`app/globals.css` に以下を追加。

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

- 黄色背景 `#fff3a3` がハイライト（ダーク時は濃い黄土色 `#665c1e` + 白文字で視認性確保）。

### 手順 4: 詳細ページ `/todos/[id]` を作る

`app/todos/[id]/page.tsx` を新規作成。

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTodo } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const todo = await getTodo(id);
  return {
    title: todo ? `Todo: ${todo.text}` : "Todo not found",
  };
}

export default async function TodoDetailPage({ params }: Props) {
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

- `generateMetadata` で動的タイトルを返す。`await params` と `getTodo(id)` を呼ぶ。
- 見つからないときは `notFound()`（lesson49 と同じ）。
- `<Link href={`/todos?highlight=${todo.id}`}>` で、一覧のハイライト付き URL に飛べる。

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

`app/layout.tsx` の `metadata` を書き換える。

```tsx
export const metadata = {
  title: {
    default: "TODO アプリ",
    template: "%s | TODO アプリ",
  },
  description: "Next.js App Router の学習用 TODO アプリ",
};
```

- `title.default`: 子ページで `title` を設定しない場合のデフォルト。
- `title.template`: 子ページが自分のタイトルを持つ場合、`%s` の部分に埋め込む。例えば詳細ページの `generateMetadata` が `{ title: "Todo: 買い物" }` を返すと、実際のタブには **「Todo: 買い物 | TODO アプリ」** と表示される。

### 期待出力

1. `/todos` を開く → TODO 一覧。0 件なら「まだ 1 件もない」のメッセージ。
2. 「買い物」「課題」「運動」を順に追加 → 3 件の一覧が出る。各項目は詳細リンクと削除ボタン付き。
3. タブのタイトル: 「TODO アプリ」。
4. 「買い物」をクリック → `/todos/<id>` に遷移。タブのタイトルが「Todo: 買い物 | TODO アプリ」に変わる。
5. 「一覧でハイライトして見る」をクリック → `/todos?highlight=<id>` に飛び、その行だけ **黄色背景** になる。
6. 一覧で「削除」ボタンを押す → その 1 件が消える。タブのタイトルは「TODO アプリ」のまま。
7. 削除した ID で直接 `/todos/<削除済み id>` にアクセス → `not-found.tsx` の「Todo が見つからない」が表示される。タブのタイトルは「Todo not found | TODO アプリ」。
8. `/about` は章 1 の自己紹介ページ。タブのタイトルは「TODO アプリ」（ルートの `default` が適用される）。
9. ナビから 3 ページを行き来できる。

### 動作確認チェックリスト

- [ ] 空入力で追加ボタン → 「空のまま追加はできない」が表示される（lesson51 の成果）。
- [ ] 送信中はボタンが disabled になる（lesson51 の成果）。
- [ ] 追加 → 一覧が自動で更新される（`revalidatePath` の成果）。
- [ ] 削除 → 該当 1 件だけが消える。
- [ ] `/todos?highlight=<id>` でその行だけ黄色背景。
- [ ] `/todos/<id>` の詳細ページのタブタイトルが動的に変わる。
- [ ] `/todos/not-a-real-id` で `not-found.tsx` が出る。
- [ ] `/about` が章 1 の自己紹介と同じ見た目で出る。

### 変えてみる

1. `<input type="hidden" name="id">` の値を書き換えて送信してみる（DevTools で編集）→ 存在しない ID になっても `deleteTodo` 側で `findIndex` が `-1` を返すので何も起きないことを確認。
2. `generateMetadata` で `description` も返してみる: `return { title: ..., description: `ID ${id} の TODO` };`
3. ハイライトを `?highlight=<id>&mode=loud` のように 2 つ目のクエリで太字にする演習。`searchParams` の型に `mode?: string` を追加し、`mode === "loud"` なら `<strong>` で囲む。

### 自分で書く（応用）

TODO に「完了」のフラグを追加する演習。

- `types.ts` の `Todo` 型に `done: boolean` を追加。
- `actions.ts` に `toggleDone(formData: FormData)` を追加し、`id` を受け取って該当 Todo の `done` を反転させる。
- 一覧の各項目に「完了」ボタンを足し、`<form action={toggleDone}>` で呼び出す。
- 完了済みの項目はテキストに `text-decoration: line-through` を当てる（CSS に `.todo-item--done` を追加）。

実装の流れは「hidden input で id を渡す → サーバー側で配列を書き換える → `revalidatePath` で再描画」が共通パターン。lesson50-51 でやったことの応用。

## まとめ

- `/todos` 一覧、`/todos/[id]` 詳細、`/about` 自己紹介、の 3 本柱が繋がった。
- `metadata`（静的）と `generateMetadata`（動的）でタブタイトルを制御できる。`template` を使うと子ページのタイトルを共通で包める。
- `searchParams: Promise<{ highlight?: string }>` で URL クエリを受け取り、条件付きスタイルに反映できる。
- 章 2 lesson25（素の JS）→ 章 4 lesson42（React + localStorage）→ 本レッスン（Next.js + Server Actions）と、**同じ TODO アプリが 3 回進化** した。
- 次の lesson53 では、今作ったアプリを **Vercel で公開** する。StackBlitz → GitHub → Vercel の流れを踏む。

### 補足: レイアウトのおさらい

このレッスンまでの `app/` 以下は、おおよそ次の形になっているはず。

```
app/
├── layout.tsx                # 共通レイアウト (Server)
├── page.tsx                  # トップ (Server)
├── globals.css
├── actions.ts                # Server Actions
├── types.ts                  # Todo 型
├── components/               # 共通部品
│   ├── Counter.tsx           # lesson46 で作った Client コンポーネント
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
└── posts/                    # lesson47-49 の練習用
    ├── page.tsx
    ├── loading.tsx
    └── [id]/
        ├── page.tsx
        ├── error.tsx
        └── not-found.tsx
```

不要になった練習用ページは消しても、残しても構わない。残すと Vercel 公開後も色々見られて面白い。
