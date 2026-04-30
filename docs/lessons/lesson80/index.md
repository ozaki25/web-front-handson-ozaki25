# lesson80: Server Actions の最小形

## ゴール

- `<form action={fn}>` に **関数** を渡してサーバー側で処理できる
- `"use server"` の配置ルール（ファイル先頭 or 関数先頭、async 必須、Client 内には書けない）を理解する
- `FormData.get("...")` で送信値を取り出し、サーバー側の配列に追加できる
- `revalidatePath` の仕組みを図で把握し、送信後に一覧が自動更新される流れを追える

## 解説

### `preventDefault` が要らなくなる

2 章 では、素の JS で `<form>` の送信を止めるために `event.preventDefault()` を書きました。React（4 章）でも `onSubmit` の中で同じことをしていました。

React 19 + Next.js の `<form action={fn}>` に **関数** を渡すと、React が送信イベントを **自動で止めて** その関数を呼んでくれます。結果として、以下の対比になります。

| 書き方 | 送信のデフォルトを止める |
|---|---|
| 2 章 の素の JS | `event.preventDefault()` を手書き |
| 4 章 の「フォームと制御コンポーネント」の React `onSubmit` | `e.preventDefault()` を手書き |
| **本レッスンの `<form action={fn}>`** | **React が自動で止める** |

`preventDefault` という呼び出しが消えることに注目しておきましょう。

### Server Actions とは

`<form action={fn}>` の `fn` に、**サーバー側で実行される関数** を渡せるのが **Server Actions** です。ブラウザ側のフォーム送信が自動で HTTP リクエストに包まれ、サーバーに届き、指定した関数が走ります。

- クライアント JS を書かなくても、サーバー側で値を受け取って処理できます。
- 戻り値はありません（あっても無視されます。戻り値を使いたいときは `useActionState` を使います）。
- 関数は **必ず `async`** です。

### `"use server"` の配置ルール

Server Action であることを示すには、次のどちらかの場所に `"use server"` と書きます。

1. **ファイル先頭に書く**: そのファイル内で `export` されている **async 関数すべて** が Server Action になります。最もよく使う形です。
   ```ts
   // app/actions.ts
   "use server";

   export async function addTodo(formData: FormData) {
     // サーバー側で動く
   }

   export async function deleteTodo(id: string) {
     // これも Server Action
   }
   ```

2. **関数の先頭行に書く**: その関数だけが Server Action になります。Server Component の中にインラインで定義する場合に使います。
   ```tsx
   export default async function Page() {
     async function addTodo(formData: FormData) {
       "use server";
       // この関数だけ Server Action
     }
     return <form action={addTodo}>...</form>;
   }
   ```

ルール:

- **必ず async 関数** です。同期関数に `"use server"` は書けません。
- **Client Component の中（`"use client"` のファイル内）には書けません**。Client から使いたいときは、別ファイルで `"use server"` を書いて `import` します。
- `"use server"` を書いたファイルからの **`export` は async 関数だけ** にするのが安全です。値（普通の `const`）や非 async 関数を `export` するとビルド時に警告やエラーが出ることがあります。
- 例外として **型の `export type`** は問題ありません（TypeScript の型情報はビルド後の JS には残らないためです）。

本コースでは **(1) のファイル先頭パターン** を使います（分離が分かりやすいためです）。

### データの保存先（本コースでの割り切り）

本コースではデータベースは使いません。代わりに、`app/actions.ts` のモジュールトップレベルに **ただの配列** を置いて、擬似的な永続化とします。

**開発時（dev）の注意**: StackBlitz や `next dev` では、`app/actions.ts` を編集するたびにモジュールが再評価され、`const todos: Todo[] = []` が初期化し直されて中身が消えます。動作確認のコツは「**追加したら actions.ts を編集しない**」です。本物の永続化が必要な場合は DB を使うのが正攻法です。

```ts
// app/actions.ts
"use server";
import type { Todo } from "./types";

const todos: Todo[] = [];
```

> **補足: HMR でも消したくないときは `globalThis` に退避**: `next dev` の HMR は **モジュールごと** に再評価するため、`const todos = []` は再評価で空に戻ります。学習中に「保存しただけで TODO が消える」が気になるなら、グローバルオブジェクト（プロセス内で 1 つ）に退避する次の書き方を使えます。
>
> ```ts
> "use server";
> import type { Todo } from "./types";
>
> const g = globalThis as unknown as { __todos?: Todo[] };
> g.__todos ??= [];
> const todos: Todo[] = g.__todos;
> ```
>
> `globalThis` はモジュール再評価をまたいでも値を持ち続けるため、HMR で配列が初期化されません。**本番では別インスタンスで動くため依然消える** ので、これはあくまで「学習中の dev で消えにくくする」だけのトリックです。本番は DB / KV を使います。

- サーバーのプロセスが生きている間は `todos` が残ります（同じプロセス内の呼び出しは同じ配列を共有します）。
- **StackBlitz や Vercel でサーバーが再起動すると消えます**。本物の永続化には DB が必要ですが本コースでは扱いません（「Vercel にデプロイする」末尾でも再度注意を書きます）。

### `revalidatePath` の仕組み

ユーザーが `/todos` を開くと、ブラウザ側の **Router Cache**（lesson75 で扱ったページキャッシュ）に描画結果が保存されます。Server Action で `todos` 配列を変えただけでは、このキャッシュが残っているため画面が更新されません。

`revalidatePath('/todos')` を呼ぶと、そのパスの Router Cache が **破棄** されます。フォームを送信した直後に Next.js が自動で `/todos` を再取得し直し、最新の `todos` が画面に反映されます。

<img src="/diagrams/server-action-flow.svg" alt="ブラウザ → /todos page.tsx(Server) → todos 配列 へアクセスし最初は空配列が返る。次にブラウザが Server Action (addTodo) に送信、Action は配列に push し revalidatePath('/todos') でキャッシュ無効化、ブラウザが自動再レンダリングされて更新後の一覧が返るシーケンス図" class="diagram" />

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。TODO 機能はこのレッスンから新規に作り始めるので、`app/todos/page.tsx` が存在する必要はありません（下の出発点の最小形で十分です）。

<details>
<summary>出発点のファイル（TODO の最小出発点）</summary>

**`app/todos/page.tsx`**（空でもよい。本文の手順 3 で全量置き換えます）

```tsx
export default function TodosPage() {
  return (
    <>
      <h1>TODO 一覧</h1>
      <p>TODO 一覧はここに実装する。</p>
    </>
  );
}
```

`app/types.ts` と `app/actions.ts` は、本文の手順 1・手順 2 で新規作成するので事前準備は不要です。

</details>

### 開発時の注意: 保存すると TODO が消える

`app/actions.ts` を編集・保存するたびに Next.js の HMR がモジュールを再評価するため、`const todos: Todo[] = []` が初期化されて中身が消えます。動作確認中は **`actions.ts` を編集しない** のが最も簡単な対策です。

消えにくくしたい場合は `globalThis` に退避する方法があります（本文の補足を参照）。

### 前回のプロジェクトを開く

これまでのレッスンで作ったプロジェクトを開き直しましょう。

### 手順 1: `Todo` 型を用意

3 章 で決めた `Todo` 型を、Next.js プロジェクトでも再利用します。`app/types.ts` を作ります。

```ts
export type Todo = {
  id: string;
  text: string;
};
```

### 手順 2: `app/actions.ts` を作る

先頭に `"use server"` を書きます。モジュールトップレベルに配列とアクションを書きます。

```ts
"use server";

import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

const todos: Todo[] = [];

export async function listTodos(): Promise<Todo[]> {
  return todos;
}

// 戻り値の型（3 章「判別共用体」そのもの）
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

ポイント:

- `"use server"` はファイルの **1 行目** に書きます。
- `const todos: Todo[] = []` が「永続化の代わり」です。サーバーが生きている間だけ保持されます。
- `addTodo` は `async` です。`FormData` から `formData.get("text")` で取り出します。
- `revalidatePath("/todos")` で `/todos` のキャッシュを無効化します。
- `crypto.randomUUID()` は Node.js 19+ / 最近のブラウザで使える ID 生成関数です。
- **戻り値の型 `AddTodoResult`** は、3 章 で学んだ **判別共用体**（discriminated union） そのものです。`ok: true` と `ok: false` を `ok` というタグで識別します。

### 手順 3: `/todos` を本物のページにする

`app/todos/page.tsx` を書き換えます。

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

ポイント:

- このファイルは Server Component です（`"use client"` を書きません）。
- `<form action={addTodo}>` に関数を直接渡しています。
- `event.preventDefault()` も `onSubmit` も書いていません。React が自動で止めます。
- `<input name="text">` の `name` 属性が `FormData.get("text")` のキーと一致しています（1 章 で学んだ `name` 属性がここで効いています）。

### 期待出力

1. `/todos` を開くと、入力欄・追加ボタン・空の `<ul>` が見えます。
2. 「買い物」と入力して「追加」を押す → `<ul>` に「買い物」が 1 件追加されます。
3. 「課題」を入力して追加 → 2 件目として「課題」が追加されます。
4. ブラウザの DevTools → Network タブを見ると、送信時に POST が飛び、200 で返ってきています。
5. **リロードしても消えません**（サーバープロセスが生きているためです）。ただし StackBlitz を開き直したり、プロジェクトを再起動すると配列がリセットされ、すべて消えます。

### 変えてみる

1. `addTodo` の中で `console.log("addTodo", text)` を追加しましょう。StackBlitz のターミナル側にログが出ることを確認します（Server Actions はサーバーで動く証拠です）。
2. `revalidatePath("/todos")` をコメントアウトして、追加ボタンを押すとどうなるか試しましょう。一覧が更新されなくなります（手動で再読み込みすると更新されます）。確認したら戻します。
3. `<input>` の `placeholder` を自分の好きなテキストに変えましょう。

### スコープ外

- 送信中のボタン無効化と空入力エラー表示は本レッスンでは扱いません。「送信状態とエラー表示」で `useActionState` を使って実装します
- `Todo` ごとの削除ボタンは本レッスンでは扱いません

### 自分で書く

`/memo` という別ページを作り、`addMemo`（サーバー側に `const memos: string[] = []` を持つ）で「メモを追加して下に並べる」だけの最小アプリを作ってみましょう。`types.ts` や `actions.ts` は新しく別ファイルで作っても、既存の `actions.ts` に追記しても構いません。

## まとめ

- `<form action={fn}>` に関数を渡すと、React が自動で送信を止めて `fn` を呼ぶ。`preventDefault` は不要
- Server Actions の関数は **必ず async**。`"use server"` はファイル先頭または関数先頭に書く。Client Component 内には書けない
- データは `app/actions.ts` のモジュールトップレベルの配列で保持する（StackBlitz / Vercel で再起動すると消える）
- `revalidatePath(path)` でその URL のキャッシュを無効化 → 次の描画で Server Component が再実行される

### コラム: `revalidateTag`

`revalidatePath` はパス単位で無効化します。もっと細かく、「`fetch` にタグを付けておき、その **タグ** だけ無効化する」方法もあります。

```ts
// 読み込み側: タグを付ける
await fetch(url, { next: { tags: ["todos"] } });

// Server Action 側: タグで無効化
import { revalidateTag } from "next/cache";
revalidateTag("todos");
```

同じデータを複数のページで使っているとき、パスを 1 つずつ書かずにタグで一括で無効化できるのが利点です。

`fetch` にタグを付けて **ユーザーが操作した直後に即反映** させたい場合は、`revalidateTag` の代わりに `updateTag` を使うと、stale-while-revalidate（一瞬古いデータが返る）を避けられます。詳細は lesson75 で扱っています。

### コラム: Server Actions の CSRF 自動保護

`<form action={fn}>` でサーバーに POST が飛びますが、**これは Next.js の Server Actions が内部で CSRF を防いでいる** からこそ安全に使えます。具体的には:

- アクションごとに **暗号化された ID** が割り当てられ、フォーム送信時に確認される
- リクエストの **Origin ヘッダ** と Host ヘッダの一致がチェックされる（`next.config.ts` の `serverActions.allowedOrigins` で許可リスト追加可能）

このため、別オリジンのサイトから埋め込んだフォームでは Server Actions を呼べません。**自前で CSRF トークンを発行する必要はありません**。一方、`<form action="/api/...">` のように Route Handler を直接叩く場合はこの保護が効かないため、別途 Origin 検証 / トークンが必要です。
