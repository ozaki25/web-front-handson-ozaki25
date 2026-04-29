# lesson90: Vercel にデプロイする

「小さなアプリを統合する」で組み上げた TODO アプリを、SNS で共有できる本番 URL として公開します。

## ゴール

- StackBlitz で作ったプロジェクトを GitHub リポジトリに保存できます。
- そのリポジトリを Vercel に接続して、数十秒でデプロイできます。
- 発行された `https://<project>.vercel.app` の URL をブラウザで開き、動作確認できます。
- 本番の永続化には DB が必要であることを理解し、本コース範囲の割り切りを押さえます。

## 解説

### 今までは「自分のブラウザでしか見えない」状態

StackBlitz のプレビュー URL は、自分が開いているブラウザ内で動いているものです。他の人に送っても見られません（厳密には StackBlitz の共有 URL で見せることもできますが、ログインやプロジェクトのセットアップが要ります）。

Web アプリを他人に見せるには、**サーバーに置いて公開する** 必要があります。このサーバーを用意するサービスとして、Next.js を最もスムーズに扱えるのが **Vercel** です。Next.js を作っている会社でもあるので、設定項目はほぼゼロで済みます。

### 3 ステップの全体像

以下の 3 つのサービスを繋ぎます。

1. **StackBlitz**: コードを書いている場所です。
2. **GitHub**: コードを保存する「倉庫」です。バージョン管理と共有のハブです。
3. **Vercel**: GitHub の倉庫を見張って、変更があると自動でビルド・公開してくれます。

流れはこうです。

```
StackBlitz → GitHub → Vercel → https://<project>.vercel.app
```

一度繋いでしまえば、以後はコードを更新するたびに自動で反映されます。

### アカウントが 2 つ必要

- **GitHub アカウント**: 無料です。既に持っていれば再利用します。
- **Vercel アカウント**: GitHub でログインできるので、実質 GitHub アカウントだけあれば OK です。

## 演習

### 途中から始める場合

「小さなアプリを仕上げる」で仕上げた Next.js プロジェクトを使います。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。このレッスンは完成品をそのまま Vercel に乗せるだけなので、TODO が動く状態であれば何でも構いません（素の hello-world テンプレートでも公開フローは体験できますが、画面の面白さのために「小さなアプリを仕上げる」の完成品を推奨します）。

<details>
<summary>出発点のファイル</summary>

**`app/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: {
    default: "TODO アプリ",
    template: "%s | TODO アプリ",
  },
  description: "Next.js App Router の学習用 TODO アプリ",
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
          <p>&copy; 2026 TODO アプリ</p>
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

**`app/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
};
```

**`app/actions.ts`**

> **`const todos: Todo[] = []` は学習用の擬似永続化**: 本物の DB を立てる手間を避けるため、ファイル先頭の配列に保存しています。Vercel のサーバーレス環境では **リクエストごとに別インスタンス** で動くことがあるため、追加した直後は見えても **しばらく経つと消えて見える** ことがあります。本番では DB / KV に置き換える前提で読んでください。

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

**`app/todos/[id]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTodo } from "../../actions";

export async function generateMetadata({
  params,
}: PageProps<"/todos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const todo = await getTodo(id);
  return {
    title: todo ? `Todo: ${todo.text}` : "Todo not found",
  };
}

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

**`app/todos/[id]/not-found.tsx`**

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

**`app/globals.css`**（共通 CSS + `.error` + `.todo-list` / `.todo-item--highlight`）

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
  .todo-item {
    border-bottom-color: #333;
  }
  .todo-item--highlight {
    background: #665c1e;
    color: #fff;
  }
}
```

</details>

なお、Vercel デプロイの手順自体（GitHub 連携・Import・Deploy ボタン）はプロジェクトの中身に依存しません。出発点の全量を貼らずに、素の hello-world テンプレートのまま手順 1〜5 を通して URL 発行まで体験するのも有効です。

### 前回のプロジェクトを開く

「小さなアプリを仕上げる」で仕上げた StackBlitz の Next.js プロジェクトを開きましょう。

### 手順 1: GitHub アカウントを用意

1. <https://github.com/> にアクセスします。
2. 既にアカウントがあればログインします。なければ右上「Sign up」から作成します。メール認証まで済ませましょう。

### 手順 2: StackBlitz から GitHub に保存

1. StackBlitz 画面の上部（プロジェクト名の右あたり）にある **「Connect Repository」** または **「Fork to GitHub」** というボタンを探します（UI は時期によって少し変わります）。見つからない場合は左サイドバーの「Share」や「...」メニュー内を確認しましょう。
2. 初回は GitHub との接続許可を求められます。「Authorize StackBlitz」で許可します。
3. 保存先のリポジトリ名を指定します。例: `my-next-todo`。
4. 「Create Repository」または「Push」で確定すると、GitHub に新しいリポジトリが作られ、現在のコードがコミット・プッシュされます。
5. <https://github.com/> の自分のダッシュボードに戻ると、`my-next-todo` が出ているはずです。

> うまく行かないとき: StackBlitz の Fork 機能が使えない場合は、ローカルにダウンロード（「Download」ボタン）→ ローカルで `git init` & `git push` する手動ルートもある。本コース想定は前者。

### 手順 3: Vercel アカウントを作る

1. <https://vercel.com/> にアクセスします。
2. 「Sign Up」→ **「Continue with GitHub」** を選びます。GitHub アカウントで Vercel にログインします。
3. 必要なら Vercel にメール認証を済ませましょう。

### 手順 4: Vercel で新しいプロジェクトを作る

1. Vercel のダッシュボードで **「Add New...」→「Project」** をクリックします。
2. GitHub リポジトリの一覧が出ます。手順 2 で作った `my-next-todo` を **「Import」** します。
   - 初回は Vercel が GitHub のどのリポジトリにアクセスして良いか聞いてきます。対象リポジトリだけを許可すれば十分です（「Only select repositories」で `my-next-todo` のみ選択）。
3. 設定画面が出ます。
   - **Framework Preset**: 自動で `Next.js` と判定されているはずです。そのままにします。
   - **Root Directory**: デフォルトのままにします。
   - **Build and Output Settings**: デフォルトのままにします（`next build` で動きます）。
   - **Environment Variables**: 本コースでは使いません。空で OK です。
4. 画面下の **「Deploy」** をクリックします。
5. 数十秒〜1 分ほど、ビルドログが流れます。成功すると「Congratulations!」画面が表示されます。

### 手順 5: 公開 URL を確認

1. Vercel の「Dashboard」→ プロジェクト名（`my-next-todo`）をクリックします。
2. 画面上部に **`https://my-next-todo-xxxx.vercel.app`** のような URL が出ています。
3. クリックして開きます。

### 期待出力

- `https://<project>.vercel.app` にアクセスすると、StackBlitz で見ていたのと同じ TODO アプリが表示されます。
- 「TODO 一覧」で追加・削除・詳細遷移が動きます。
- `/about` にアクセスすると自己紹介ページが出ます。
- ナビの `<Link>` でページ遷移ができます。
- URL を別のブラウザや友人に送っても、同じアプリが見えます。

### 更新を反映する

GitHub にプッシュするだけで、Vercel が自動で検知して再デプロイしてくれます。

1. StackBlitz でコードを少し変えます（例: トップページの `<h1>` の文言を変える）。
2. StackBlitz の「Commit & Push」または「Sync」ボタンで GitHub に反映します。
3. 数十秒待ちます。
4. Vercel のダッシュボードで「Deployments」タブを見ると、新しいビルドが走っています。
5. 完了するとブラウザで公開 URL を再読み込み → 変更が反映されています。

### よくある躓き

- ビルドが `Error: Module not found` で落ちる → StackBlitz 上で見えていないファイル（大文字小文字の違いなど）が原因のことが多いです。ローカルのファイル名と import 文の大文字小文字を揃えましょう。
- 「Authorization required」と出る → GitHub 連携で「Only select repositories」で該当リポジトリを許可します。
- デプロイは成功するがページが真っ白 → ブラウザの DevTools Console にエラーが出ていないか確認しましょう。本コース範囲なら `"use client"` の付け忘れが多いです。
- TODO を追加してもリロードすると消える → 次項の通り、サーバーレス環境ではインメモリ配列が保持されません。

### 注意: 本番ではデータが保持されない

本コースでは `app/actions.ts` の `const todos: Todo[] = []` という **メモリ上の配列** でデータを持っていました。

- **StackBlitz**: 開発サーバーがプロセスを継続するので、リロードしても保持されます。プロジェクトを閉じ直したら消えます。
- **Vercel**: Vercel の Next.js は **サーバーレス関数** として実行されます。リクエストが来るたびに別のプロセスで動く可能性があり、**配列の中身は呼び出しをまたいで保持されない** ことが多いです。結果として、追加した直後は見えてもしばらく経つと消えて見える、といった動きになります。

本物のアプリでは **データベース** を使って永続化します。例: Vercel Postgres、Supabase、PlanetScale、Neon など。本コースでは扱いませんが、次のステップとして「`actions.ts` の配列を DB 呼び出しに置き換えていけば本物のアプリになる」と覚えておきましょう。

### 自分で書く

1. トップページ `app/page.tsx` を、現在のアプリの簡単な説明ページに書き換えましょう。例: 「自己紹介 + TODO メモの練習アプリ」。
2. StackBlitz で変更 → GitHub へ Push → Vercel の自動デプロイ、の一連の流れをもう 1 回踏んで、URL 先の変化を確認しましょう。
3. 公開 URL を自分の別端末（スマホなど）で開いてみましょう。

## まとめ

- StackBlitz → GitHub → Vercel の 3 ステップで、作った Next.js アプリを世界に公開できます。
- 初回の接続だけ手数がかかりますが、以後は Git に push すれば自動デプロイです。
- 本コースの擬似永続化（インメモリ配列）は Vercel では保持されません。本番の永続化には DB が必要です（本コースでは扱いません）。
- これでコースの本編は終わりです。Next.js（App Router）で「フォーム + データ表示 + ルーティング」の小さなアプリを作り、公開するところまでが本コースの完走ゴールです。
- 次に進みたい学習者へのおすすめ:
  - データベース連携（Vercel Postgres、Supabase など）で永続化を本物にする
  - 認証（NextAuth、Clerk など）を足して「自分の TODO」を作る
  - スタイリングを Tailwind CSS や CSS Modules に寄せる
  - React の他のフック（`useReducer`、`useContext`、`useMemo`）を触る
