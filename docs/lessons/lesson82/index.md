# lesson82: Route Handlers（`app/api/.../route.ts`）

## ゴール

- Next.js で HTTP API エンドポイントを作れる（`GET` / `POST`）
- Server Actions との使い分けの指針を持つ
- 3 章 の「型ガード」の型ガードを **サーバー側の入力検証** と **クライアント側の受信検証** 両方に使える
- Proxy との **ランタイムと役割の違い**（どちらも Node.js 既定、Route Handlers はデータ / Proxy は前処理）を理解する

## 解説

### Server Actions と Route Handlers の違い

5 章 の「Server Actions の最小形」と「送信状態とエラー表示」で **Server Actions** を使って TODO を追加しました。`<form action={fn}>` で呼び出す形で、同じ Next.js アプリ内のフォーム送信には最適です。

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
  return NextResponse.json({ ok: true });
}
```

- ファイル名は **`route.ts`** 固定（`page.tsx` とは別のファイル）
- URL は `app/api/todos/route.ts` → `/api/todos`
- `GET` / `POST` / `PUT` / `DELETE` / `PATCH` を同じファイルに並べられる
- 戻り値は **`NextResponse`（`next/server` から import）を基本に統一** します。素の `Response.json(...)` でも動きますが、Cookie 操作・リダイレクト・型補完が揃っているので `NextResponse` を推奨

### 入力検証と受信検証

Route Handlers を作るときに **型ガード**（3 章 の「型ガード」） が活きます。

- **サーバー側**: `POST` の中で `await request.json()` した値は **型が `any`** になる（外部から何が来るか分からない）。そのまま `body.text` を使うと TS の型チェックは効くが、実行時は壊れうる
- **クライアント側**: `fetch('/api/todos')` で受け取った JSON も **何が返るか TS からは見えない**。同じく検証が必要

役割分離:

- サーバー側は **入力検証** → 不正なリクエストを弾く
- クライアント側は **受信検証** → サーバーが想定と違う JSON を返してきたときに壊れないようにする

両方で「型ガード」の `isTodo` のような型ガードを書きます。実務では Zod などのスキーマバリデーションライブラリが多く使われますが、本コースでは型ガードの基礎だけを押さえます。

### ランタイムの話

Next.js の「サーバー側で動くもの」には **2 つのランタイム** があります。

- **Node.js ランタイム**: `fs` など Node API が使える
- **Edge ランタイム**: `fs` などは使えない。起動が速く、世界中のエッジで動く

Next.js 16 では Route Handlers と Proxy の **どちらも既定が Node.js** になりました（以前の Middleware は Edge 既定でしたが、Proxy への改名にあわせて Node.js 既定に）。`export const runtime = "edge"` を明示すれば Edge で動かすこともできます。両者の違いは **役割** です。

- **Route Handlers**: データを返す / 受けるエンドポイント（REST / Webhook）
- **Proxy**: リクエスト前の軽量な分岐（認証ガード / リダイレクト）

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。`app/types.ts` の `isTodo` 型ガードは3 章 の「型ガード」と揃えた形なので、3 章 を先に終えていなくてもそのまま貼って使えます。既に「Server Actions の最小形」「送信状態とエラー表示」で `app/types.ts` を作っている場合は、下記の型ガードを追記する形で構いません。

### ゴール

- `/api/todos` に `GET` と `POST` を実装する
- サーバー側で `isTodoInput` 型ガードで入力検証
- クライアント側で `isTodoArray` 型ガードで受信検証
- DevTools Console から `fetch` を叩いて動作確認

### 手順

1. これまでのプロジェクトを開く（もしくは新規に `create-next-app` で作る）
2. `app/types.ts` に `Todo` 型を置く（既にあるなら再利用）
3. `app/api/todos/route.ts` を新規作成
4. `app/todos/page.tsx`（Client 検証用の画面）を更新

### `app/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
};

// 型ガード: unknown から Todo に絞り込む
export function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.id === "string" && typeof obj.text === "string";
}

// 配列全体を検証
export function isTodoArray(value: unknown): value is Todo[] {
  return Array.isArray(value) && value.every(isTodo);
}

// 「text だけの入力」を検証するガード（id はサーバー側で作る）
export function isTodoInput(value: unknown): value is { text: string } {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.text === "string" && obj.text.trim().length > 0;
}
```

3 章 の「型ガード」で `isTodo` の骨格を書きました。ここで配列用と入力用の派生を追加しています。

### `app/api/todos/route.ts`

```ts
import { NextResponse } from "next/server";
import type { Todo } from "../../types";
import { isTodoInput } from "../../types";

// モジュールトップレベルでインメモリ保持（「Server Actions の最小形」と同じ割り切り）
const todos: Todo[] = [];

export async function GET() {
  return NextResponse.json({ todos });
}

export async function POST(request: Request) {
  const body: unknown = await request.json();

  // サーバー側の入力検証
  if (!isTodoInput(body)) {
    return NextResponse.json(
      { ok: false, error: "text が必要です" },
      { status: 400 },
    );
  }

  const newTodo: Todo = { id: crypto.randomUUID(), text: body.text.trim() };
  todos.push(newTodo);
  return NextResponse.json({ ok: true, todo: newTodo });
}
```

ポイント:

- `await request.json()` の戻り値は `unknown`（実際は `any` だが、今回は意図的に `unknown` で受けて検証を強制）
- `isTodoInput` で検証し、失敗したら 400 を返す
- 成功時は `ok: true` と作成した Todo を返す

### DevTools Console からの動作確認

プレビューを別タブで開き、Console で次を実行します。

```js
// GET
const res = await fetch("/api/todos");
const data = await res.json();
console.log(data); // { todos: [] }

// POST（正常）
const res2 = await fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "本を返す" }),
});
console.log(await res2.json());
// { ok: true, todo: { id: "...", text: "本を返す" } }

// POST（異常: text 欠落）
const res3 = await fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ foo: "bar" }),
});
console.log(res3.status); // 400
console.log(await res3.json());
// { ok: false, error: "text が必要です" }
```

### Client 側の受信検証

`app/todos/page.tsx`（Server Component）に、受信した JSON を型ガードで検証する Client Component を組み合わせます。

`app/todos/TodoFetcher.tsx`（新規）:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { Todo } from "../types";
import { isTodoArray } from "../types";

export function TodoFetcher() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/todos");
        const data: unknown = await res.json();

        // 受信検証: サーバーが想定と違う形を返したら拒否する
        if (typeof data !== "object" || data === null || !("todos" in data)) {
          setError("レスポンスの形式が不正です");
          return;
        }
        const maybeTodos = (data as { todos: unknown }).todos;
        if (!isTodoArray(maybeTodos)) {
          setError("todos が Todo 配列ではありません");
          return;
        }

        setTodos(maybeTodos);
      } catch (e) {
        setError("通信に失敗しました");
      }
    })();
  }, []);

  if (error) return <p className="error">エラー: {error}</p>;
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  );
}
```

ポイント:

- `data: unknown` で受ける。これで TS は型ガードなしでは `data.todos` に触らせない
- `isTodoArray` で検証、失敗時はエラー state にする
- 3 章 の「型ガード」で学んだ `unknown` → `Todo` の絞り込みを **そのまま実務で使う** 形

### 期待出力

- `/api/todos` に GET → `{ todos: [...] }` JSON が返る
- POST で追加できる、正常時 200、text 欠落時 400
- `/todos` ページで一覧が表示される。サーバーが壊れた JSON を返すとエラーメッセージが出る

### 変える

- `app/api/todos/route.ts` に `DELETE` メソッドを追加してみる（`request.url` からクエリ `?id=xxx` を取って削除）
- `isTodoInput` で「text が 100 文字以上なら弾く」を足してみる
- サーバー側の `NextResponse.json({ ok: false, error: "..." }, { status: 400 })` の status を他の値（422 や 500）に変えて挙動を比べる

### 自分で書く

- `/api/posts/route.ts` に `GET` を実装し、適当な記事 3 件を JSON で返す
- `/posts` ページで Client 側から `fetch` して、`isPostArray` 型ガードで検証して表示する

### 実務では

本コースでは型ガードを手書きしましたが、実務では **Zod** のようなスキーマバリデーションライブラリがよく使われます。`z.object({ text: z.string().min(1) }).parse(body)` の 1 行で同じ検証が書けるため、プロジェクトが育ったら Zod の導入を検討する価値があります。

### 別オリジンから叩かれる場合（CORS の最小例）

Route Handlers は **Server Actions と違い、別オリジンから直接 fetch できる** 形態です。ブラウザは別オリジンへの POST など「単純でないリクエスト」を送る前に **OPTIONS（プリフライト）リクエスト** を自動で投げ、サーバーから許可ヘッダが返ったら本リクエストを送ります。

```ts
// app/api/todos/route.ts
export async function POST(request: Request) {
  // ... 通常の処理 ...
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Access-Control-Allow-Origin": "https://allowed.example.com",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}

// プリフライト用の OPTIONS ハンドラ
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://allowed.example.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
```

ポイント:

- **同一オリジン**（自分のサイト内）から叩く場合は CORS 設定は不要（`fetch("/api/todos")` で動く）
- **別オリジンから Cookie を送りたい** 場合は `Access-Control-Allow-Credentials: true` と、`Access-Control-Allow-Origin: *` ではなく **特定オリジンの明示** が必要

## まとめ

- Route Handlers は `app/api/.../route.ts` の HTTP API
- 戻り値は `NextResponse.json(...)` に統一
- Server Actions と Route Handlers は棲み分け（表を参照）
- サーバー側は **入力検証**、クライアント側は **受信検証** の両方で型ガードを使う
- 3 章 の「型ガード」の `isTodo` がそのまま実務で使える
- Proxy / Route Handlers はどちらも Next.js 16 から既定 Node.js。役割（Route Handlers = データのやり取り / Proxy = 軽量な前処理）で分担する
