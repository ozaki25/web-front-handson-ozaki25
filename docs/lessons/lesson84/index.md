# lesson84: Route Handlers の入力検証と受信検証

## ゴール

- `await request.json()` を `unknown` で受けて型ガードで絞り込む理由を説明できる
- サーバー側の入力検証とクライアント側の受信検証の役割分担を理解する
- Route Handler がデフォルトで別オリジンから叩けないことと、許可する場合の CORS ヘッダの書き方を知っている

## 解説

### はじめに

lesson83 で作った `/api/todos` に検証を追加します。GET / POST の基本は動いている前提で進めます。

### なぜ `unknown` で受けるのか

`request.json()` の戻り値は TypeScript 的には `any` です。`any` は「どんな操作をしても型エラーにならない」型で、`body.text` に直接アクセスしてもコンパイルは通ります。しかし実行時には、送られてきた JSON に `text` がなければ `undefined` になり、後続の処理が壊れます。

`unknown` で受けると TypeScript は「型を確認してから使え」と強制します。`body.text` に直接アクセスしようとすると型エラーになるため、型ガードを書かざるを得なくなります。これは意図的な設計です。

```ts
// any で受けた場合: コンパイルは通るが実行時に壊れうる
const body = await request.json();
console.log(body.text.trim()); // text が存在しない場合に TypeError

// unknown で受けた場合: 型ガードを書かないと型エラーになる
const body: unknown = await request.json();
console.log(body.text.trim()); // 型エラー: body は unknown
```

### 型ガードの書き方

3 章の「型ガード」で学んだ `isTodo` の発想をそのまま使います。POST の入力（`{ text: string }`）を検証するガードは次のように書きます。

```ts
// app/types.ts に追加
export function isTodoInput(value: unknown): value is { text: string } {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.text === "string" && obj.text.trim().length > 0;
}
```

`value is { text: string }` という戻り値の型が **型述語**（type predicate）です。この関数が `true` を返したブロック内では TypeScript が `value` を `{ text: string }` として扱います。

GET のレスポンスを受け取る側（クライアント）では、配列全体を検証するガードが必要です。

```ts
// app/types.ts に追加
export function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.id === "string" && typeof obj.text === "string";
}

export function isTodoArray(value: unknown): value is Todo[] {
  return Array.isArray(value) && value.every(isTodo);
}
```

### サーバー側検証とクライアント側受信検証の役割分担

同じ型ガードを使いますが、目的が異なります。

| 種別 | 場所 | 目的 | 失敗時の動作 |
|---|---|---|---|
| サーバー側入力検証 | Route Handler（POST など） | 不正なリクエストを弾く | 400 を返す |
| クライアント側受信検証 | fetch の呼び出し元 | サーバーが想定外の形を返したときに壊れないようにする | エラー state にする |

両方を書く理由は「信頼の境界」です。サーバーはクライアントを信用せず、クライアントもサーバーを盲目的に信用しない、という原則です。

### CORS の仕組み

Route Handler は Server Actions と違い、**別オリジンから直接 `fetch` できる形態**です。ただし、ブラウザには同一オリジンポリシー（Same-Origin Policy）があり、別オリジンへのリクエストはデフォルトで制限されます。

ブラウザは POST など「単純でないリクエスト」を送る前に、**OPTIONS（プリフライト）リクエスト**を自動で送信します。サーバーがそれに対して許可ヘッダ（`Access-Control-Allow-Origin` など）を返した場合に限り、ブラウザは本来のリクエストを送ります。プリフライトを受け取って何も返さないか、許可のないヘッダを返すと、ブラウザは本リクエストをブロックします。

Route Handler でプリフライトに応答するには `OPTIONS` ハンドラを用意します。

```ts
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

- `Access-Control-Allow-Origin: *` はすべてのオリジンを許可します。Cookie を送りたい場合は `*` が使えず、特定のオリジンの明示が必要です
- `Access-Control-Max-Age` はプリフライトのキャッシュ秒数です

### ランタイムの選択

Route Handler はデフォルトで Node.js ランタイムで動きます。ファイルに `export const runtime = "edge"` を追加すると Edge ランタイムに切り替わります。

```ts
export const runtime = "edge";
```

Edge ランタイムは起動が速く、世界中のエッジで分散実行されます。ただし `fs` や Node.js 固有の API は使えません。`crypto.randomUUID()` は Edge でも使えるため、今回の TODO 追加には問題ありません。特別な理由がなければ Node.js（デフォルト）のままで構いません。

## 演習

### ゴール

- `/api/todos` の POST に `isTodoInput` 型ガードを追加して不正リクエストを弾く
- OPTIONS ハンドラを追加して別オリジンからのアクセスを許可する
- DevTools Console から動作を確認する

### 手順

#### 手順 1: `app/types.ts` に型ガードを追加する

lesson83 で作った `app/types.ts` を次の内容に書き換えます。

```ts
export type Todo = {
  id: string;
  text: string;
};

// unknown から Todo に絞り込む
export function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.id === "string" && typeof obj.text === "string";
}

// 配列全体を検証する
export function isTodoArray(value: unknown): value is Todo[] {
  return Array.isArray(value) && value.every(isTodo);
}

// POST の入力（text のみ）を検証する
export function isTodoInput(value: unknown): value is { text: string } {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.text === "string" && obj.text.trim().length > 0;
}
```

#### 手順 2: `app/api/todos/route.ts` を更新する

```ts
import { NextResponse } from "next/server";
import type { Todo } from "../../types";
import { isTodoInput } from "../../types";

const todos: Todo[] = [];

export async function GET() {
  return NextResponse.json({ todos });
}

export async function POST(request: Request) {
  const body: unknown = await request.json();

  // サーバー側の入力検証: isTodoInput が false なら 400 を返す
  if (!isTodoInput(body)) {
    return NextResponse.json(
      { message: "text が必要です" },
      { status: 400 },
    );
  }

  const newTodo: Todo = { id: crypto.randomUUID(), text: body.text.trim() };
  todos.push(newTodo);
  return NextResponse.json({ message: "ok", todo: newTodo }, { status: 201 });
}

// プリフライト（OPTIONS）に応答する
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

### DevTools Console からの動作確認

```js
// 正常な POST
const res = await fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: '本を返す' }),
});
console.log(res.status);        // 201
console.log(await res.json());  // { message: "ok", todo: { id: "...", text: "本を返す" } }

// 不正な POST（text なし）
const res2 = await fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ foo: 'bar' }),
});
console.log(res2.status);       // 400
console.log(await res2.json()); // { message: "text が必要です" }
```

### 期待出力

- 不正な JSON（`{ foo: "bar" }` のような `text` がない形）を送ると 400 が返る
- 正しい JSON（`{ text: "..." }`）を送ると 201 で追加される
- GET のレスポンスは変わらず `{ todos: [...] }` の形

### 変える

- `OPTIONS` ハンドラの `Access-Control-Allow-Origin` を `http://localhost:3001` だけに絞る
- `isTodoInput` に「text が 100 文字以上なら弾く」を追加してみる（`obj.text.length <= 100` の条件を足す）

### 自分で書く

- `isTodoArray` 型ガードを使った受信検証を `app/todos/TodoFetcher.tsx` に書く

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

        // 受信検証: サーバーが想定と違う形を返した場合にエラーにする
        if (
          typeof data !== "object" ||
          data === null ||
          !("todos" in data)
        ) {
          setError("レスポンスの形式が不正です");
          return;
        }
        const maybeTodos = (data as { todos: unknown }).todos;
        if (!isTodoArray(maybeTodos)) {
          setError("todos が Todo 配列ではありません");
          return;
        }

        setTodos(maybeTodos);
      } catch {
        setError("通信に失敗しました");
      }
    })();
  }, []);

  if (error) return <p>{error}</p>;
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  );
}
```

このコンポーネントを `app/todos/page.tsx` から使うと、サーバーが壊れた JSON を返したときにエラーメッセージが表示されるようになります。

### 実務では

本コースでは型ガードを手書きしましたが、実務では **Zod** のようなスキーマバリデーションライブラリがよく使われます。`z.object({ text: z.string().min(1) }).parse(body)` の 1 行で同じ検証が書けるため、プロジェクトが育ったら Zod の導入を検討する価値があります。

## まとめ

- `await request.json()` は `unknown` で受けることで TypeScript が型確認を強制する（`any` との違い）
- 型ガード（`isTodoInput` / `isTodoArray`）でサーバー側入力検証とクライアント側受信検証の両方を書く
- サーバー側は不正リクエストを弾く、クライアント側は想定外のレスポンスで壊れないようにする、という役割分担
- 別オリジンからアクセスを許可するには `OPTIONS` ハンドラで CORS ヘッダを返す
- Edge ランタイムに切り替えるには `export const runtime = "edge"` を書く（Node.js 固有 API は使えなくなる）
