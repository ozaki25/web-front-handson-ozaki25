# lesson83: Route Handlers の基本

## ゴール

- `app/api/todos/route.ts` に GET・POST を書いて、DevTools Console から fetch で叩けることを確認できる
- Server Actions との使い分けを説明できる（内部利用 vs 外部クライアントから叩く）
- `NextResponse.json()` の基本的な使い方を理解する

## 解説

### Server Actions と Route Handlers の違い

5 章の「Server Actions の最小形」と「送信状態とエラー表示」で **Server Actions** を使って TODO を追加しました。`<form action={fn}>` で呼び出す形で、同じ Next.js アプリ内のフォーム送信には最適です。

一方、もっと一般的な用途、例えば:

- モバイルアプリ・別サイトから API を叩きたい
- `fetch('/api/todos')` で JSON を取得・送信したい
- 認証ヘッダや CORS を扱いたい

といった場面では **Route Handlers** を使います。

使い分け:

| 用途 | Server Actions | Route Handlers |
|---|---|---|
| 同一 Next.js 内のフォーム送信 | こちらが基本 | 補助的 |
| 外部クライアント（モバイル・他サイト）が叩く | 不可 | こちらが基本 |
| 戻り値を UI に結合 | `useActionState` で楽 | 手動で `fetch` + state |
| 認証ヘッダや CORS が必要 | 向かない | 向く |

両方が使えるときは Server Actions を優先するのが楽です。**外部から叩く可能性があるなら Route Handlers** と覚えてください。

### Route Handlers の書き方

`app/api/xxx/route.ts` を作り、HTTP メソッド名の関数を `export` します。

```ts
// app/api/todos/route.ts
import { NextResponse } from "next/server";

const todos = [{ id: "1", text: "牛乳を買う" }];

export async function GET() {
  return NextResponse.json({ todos });
}

export async function POST(request: Request) {
  const body = await request.json();
  // body.text を todos に追加して返す
  return NextResponse.json({ message: "ok" });
}
```

- ファイル名は **`route.ts`** 固定（`page.tsx` とは別のファイル）
- URL は `app/api/todos/route.ts` → `/api/todos`
- `GET` / `POST` / `PUT` / `DELETE` / `PATCH` を同じファイルに並べられる
- 戻り値は **`NextResponse`（`next/server` から import）を基本に統一** します。素の `Response.json(...)` でも動きますが、Cookie 操作・リダイレクト・型補完が揃っているので `NextResponse` を推奨

### NextResponse.json の使い方

`NextResponse.json(data, options?)` の第 2 引数でステータスコードやヘッダを指定できます。

```ts
// 200（省略時のデフォルト）
return NextResponse.json({ todos });

// 201 Created
return NextResponse.json({ message: "ok", todo: newTodo }, { status: 201 });

// 400 Bad Request
return NextResponse.json({ message: "不正なリクエストです" }, { status: 400 });
```

入力検証・CORS ヘッダの付け方は「Route Handlers の入力検証と受信検証」のレッスンで扱います。

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。

### ゴール

- `/api/todos` に `GET` と `POST` を実装する
- DevTools Console から `fetch` を叩いて動作確認する

### 手順

1. これまでのプロジェクトを開く（もしくは新規に `create-next-app` で作る）
2. `app/types.ts` に `Todo` 型を置く（既にあるなら再利用）
3. `app/api/todos/route.ts` を新規作成する

### `app/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
};
```

### `app/api/todos/route.ts`

型ガードは 3 章の「型ガード」と同じ発想で書けますが、このレッスンでは基本の GET / POST に絞ります。

```ts
import { NextResponse } from "next/server";
import type { Todo } from "../../types";

// モジュールトップレベルでインメモリ保持（"Server Actions の最小形" と同じ割り切り）
const todos: Todo[] = [];

export async function GET() {
  return NextResponse.json({ todos });
}

export async function POST(request: Request) {
  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (text.length === 0) {
    return NextResponse.json(
      { message: "text が必要です" },
      { status: 400 },
    );
  }

  const newTodo: Todo = { id: crypto.randomUUID(), text };
  todos.push(newTodo);
  return NextResponse.json({ message: "ok", todo: newTodo }, { status: 201 });
}
```

ポイント:

- `await request.json()` でリクエストボディを受け取る
- text が空なら 400 を返す
- 成功時は `{ message: "ok", todo: newTodo }` を 201 で返す

### DevTools Console からの動作確認

プレビューを別タブで開き、Console で次を実行します。

```js
// GET（初期は空配列）
fetch('/api/todos').then(r => r.json()).then(console.log)
// { todos: [] }

// POST（正常）
const res = await fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: '本を返す' }),
});
console.log(await res.json());
// { message: "ok", todo: { id: "...", text: "本を返す" } }

// GET（追加後）
fetch('/api/todos').then(r => r.json()).then(console.log)
// { todos: [{ id: "...", text: "本を返す" }] }
```

### 期待出力

- `fetch('/api/todos').then(r=>r.json()).then(console.log)` を Console で実行すると `{ todos: [] }` が返る
- POST で TODO を追加すると `{ message: "ok", todo: { id: "...", text: "..." } }` が返る
- GET を再実行すると追加した TODO が含まれる配列が返る

### 変える

- レスポンスを `{ message: "ok", todo: newTodo }` から `{ message: "created", data: newTodo }` に変えてみる
- `GET` に `?limit=3` のようなクエリパラメータを受け取って件数を絞る処理を追加してみる（`new URL(request.url).searchParams.get("limit")` で取得できる）

### 自分で書く

- `/api/users` ルートを同様に作り、GET で適当なユーザー 3 件を返すようにする
- POST でユーザーを追加できるようにする

## まとめ

- Route Handlers は `app/api/.../route.ts` に HTTP メソッド名の関数を書くだけで動く
- 戻り値は `NextResponse.json(data, { status: ... })` に統一する
- Server Actions と Route Handlers の棲み分けは「同一アプリ内のフォーム操作か、外部から叩く API か」
- 入力検証・受信検証・CORS は「Route Handlers の入力検証と受信検証」のレッスンで扱います
