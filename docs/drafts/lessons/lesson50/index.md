# lesson50: Server Actions の最小形

## ゴール

- `<form action={fn}>` に **関数** を渡してサーバー側で処理できることを理解する。
- `"use server"` の配置ルール（ファイル先頭 or 関数先頭、async 必須、Client 内には書けない）を覚える。
- `FormData.get("...")` で送信値を取り出し、サーバー側の配列に追加できる。
- `revalidatePath` の仕組みを図で把握し、送信後に一覧が自動更新される流れを追える。

## 解説

### `preventDefault` が要らなくなる

章 2 lesson24 では、素の JS で `<form>` の送信を止めるために `event.preventDefault()` を書いた。React（章 4）でも `onSubmit` の中で同じことをしていた。

React 19 + Next.js の `<form action={fn}>` に **関数** を渡すと、React が送信イベントを **自動で止めて** その関数を呼んでくれる。結果として、以下の対比になる。

| 書き方 | 送信のデフォルトを止める |
|---|---|
| lesson24 の素の JS | `event.preventDefault()` を手書き |
| lesson38 の React `onSubmit` | `e.preventDefault()` を手書き |
| **本レッスンの `<form action={fn}>`** | **React が自動で止める** |

`preventDefault` という呼び出しが消えることに注目しておく。

### Server Actions とは

`<form action={fn}>` の `fn` に、**サーバー側で実行される関数** を渡せるのが **Server Actions**。ブラウザ側のフォーム送信が自動で HTTP リクエストに包まれ、サーバーに届き、指定した関数が走る。

- クライアント JS を書かなくても、サーバー側で値を受け取って処理できる。
- 戻り値はない（あっても無視される。戻り値を使いたいときは lesson51 の `useActionState`）。
- 関数は **必ず `async`**。

### `"use server"` の配置ルール

Server Action であることを示すには、次のどちらかの場所に `"use server"` と書く。

1. **ファイル先頭に書く**: そのファイル内で `export` されている **async 関数すべて** が Server Action になる。最もよく使う形。
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

2. **関数の先頭行に書く**: その関数だけが Server Action になる。Server Component の中にインラインで定義する場合に使う。
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

- **必ず async 関数**。同期関数に `"use server"` は書けない。
- **Client Component の中（`"use client"` のファイル内）には書けない**。Client から使いたいときは、別ファイルで `"use server"` を書いて `import` する。

本コースでは **(1) のファイル先頭パターン** を使う（分離が分かりやすいため）。

### データの保存先（本コースでの割り切り）

本コースではデータベースは使わない。代わりに、`app/actions.ts` のモジュールトップレベルに **ただの配列** を置いて、擬似的な永続化とする。

```ts
// app/actions.ts
"use server";
import type { Todo } from "./types";

const todos: Todo[] = [];
```

- サーバーのプロセスが生きている間は `todos` が残る（同じプロセス内の呼び出しは同じ配列を共有）。
- **StackBlitz や Vercel でサーバーが再起動すると消える**。本物の永続化には DB が必要だが本コースでは扱わない（lesson53 末尾でも再度注意を書く）。

### `revalidatePath` の仕組み

Server Component（例: `/todos` の `page.tsx`）は、描画結果がキャッシュされる。Server Action が配列を変更しても、そのままではキャッシュされた古い画面が残る。

`revalidatePath('/todos')` を呼ぶと、そのパスのキャッシュが **無効化** される。次にそのページに入る（またはアクション直後の自動再描画）タイミングで Server Component が再実行され、最新の `todos` が描画される。

```mermaid
sequenceDiagram
  participant Browser as ブラウザ
  participant Page as /todos page.tsx (Server)
  participant Action as addTodo (Server Action)
  participant Store as todos 配列

  Browser->>Page: アクセス
  Page->>Store: 配列を読む
  Store-->>Page: [] (空)
  Page-->>Browser: 空の一覧

  Browser->>Action: <form action> で送信
  Action->>Store: push(new)
  Action->>Page: revalidatePath('/todos')
  Note right of Page: キャッシュ無効化
  Action-->>Browser: 完了
  Browser->>Page: 再描画(自動)
  Page->>Store: 配列を読む
  Store-->>Page: [new]
  Page-->>Browser: 更新された一覧
```

## 演習

### 前回のプロジェクトを開く

lesson49 で作ったプロジェクトを開き直す。

### 手順 1: `Todo` 型を用意

章 3 で決めた `Todo` 型を、Next.js プロジェクトでも再利用する。`app/types.ts` を作る。

```ts
export type Todo = {
  id: string;
  text: string;
};
```

### 手順 2: `app/actions.ts` を作る

先頭に `"use server"`。モジュールトップレベルに配列とアクションを書く。

```ts
"use server";

import { revalidatePath } from "next/cache";
import type { Todo } from "./types";

const todos: Todo[] = [];

export async function listTodos(): Promise<Todo[]> {
  return todos;
}

export async function addTodo(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) {
    return; // 空なら何もしない（エラー表示は lesson51 で追加）
  }
  todos.push({ id: crypto.randomUUID(), text });
  revalidatePath("/todos");
}
```

ポイント:

- `"use server"` はファイルの **1 行目**。
- `const todos: Todo[] = []` が「永続化の代わり」。サーバーが生きている間だけ保持される。
- `addTodo` は `async`。`FormData` から `formData.get("text")` で取り出す。
- `revalidatePath("/todos")` で `/todos` のキャッシュを無効化。
- `crypto.randomUUID()` は Node.js 19+ / 最近のブラウザで使える ID 生成関数。

### 手順 3: `/todos` を本物のページにする

`app/todos/page.tsx` を書き換える。

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

- このファイルは Server Component（`"use client"` を書かない）。
- `<form action={addTodo}>` に関数を直接渡している。
- `event.preventDefault()` も `onSubmit` も書いていない。React が自動で止める。
- `<input name="text">` の `name` 属性が `FormData.get("text")` のキーと一致している（章 1 lesson06 で学んだ `name` 属性がここで効いている）。

### 期待出力

1. `/todos` を開くと、入力欄・追加ボタン・空の `<ul>` が見える。
2. 「買い物」と入力して「追加」を押す → `<ul>` に「買い物」が 1 件追加される。
3. 「課題」を入力して追加 → 2 件目として「課題」が追加される。
4. ブラウザの DevTools → Network タブを見ると、送信時に POST が飛び、200 で返ってきている。
5. **リロードしても消えない**（サーバープロセスが生きているため）。ただし StackBlitz を開き直したり、プロジェクトを再起動すると配列がリセットされ、すべて消える。

### 変えてみる

1. `addTodo` の中で `console.log("addTodo", text)` を追加。StackBlitz のターミナル側にログが出ることを確認（Server Actions はサーバーで動く証拠）。
2. `revalidatePath("/todos")` をコメントアウトして、追加ボタンを押すとどうなるか試す。一覧が更新されなくなる（手動で再読み込みすると更新される）。確認したら戻す。
3. `<input>` の `placeholder` を自分の好きなテキストに変える。

### スコープ外

- 送信中のボタン無効化、空入力エラー表示は **lesson51** で追加する。本レッスンでは最小形に集中。
- `Todo` ごとの削除ボタンも本レッスンでは扱わない（lesson52 の統合で扱う）。

### 自分で書く

`/memo` という別ページを作り、`addMemo`（サーバー側に `const memos: string[] = []` を持つ）で「メモを追加して下に並べる」だけの最小アプリを作ってみる。`types.ts` や `actions.ts` は新しく別ファイルで作っても、既存の `actions.ts` に追記してもよい。

## まとめ

- `<form action={fn}>` に関数を渡すと、React が自動で送信を止めて `fn` を呼ぶ。`preventDefault` は要らない。
- Server Actions の関数は **必ず async**。`"use server"` はファイル先頭または関数先頭に書く。Client Component 内には書けない。
- データは `app/actions.ts` のモジュールトップレベルの配列で保持する（StackBlitz / Vercel で再起動すると消える）。
- `revalidatePath(path)` でその URL のキャッシュを無効化 → 次の描画で Server Component が再実行される。
- 次の lesson51 では、送信中の状態表示とエラー表示を `useActionState` / `useFormStatus` で追加する。`addTodo` のシグネチャもそこで少し変える。

### コラム: `revalidateTag`

`revalidatePath` はパス単位で無効化する。もっと細かく、「`fetch` にタグを付けておき、その **タグ** だけ無効化する」方法もある。

```ts
// 読み込み側: タグを付ける
await fetch(url, { next: { tags: ["todos"] } });

// Server Action 側: タグで無効化
import { revalidateTag } from "next/cache";
revalidateTag("todos");
```

複数ページで同じデータを使っているときに便利。本コースでは扱わないが、実務では頻出。
