# lesson130: GraphQL と tRPC の地図

## ゴール

- REST と **GraphQL** と **tRPC** の違いを 3 行で言える
- GraphQL のクエリ / ミューテーション / サブスクリプションの最小例を読める
- tRPC の「型安全な RPC」の考え方を理解する
- 自分のプロジェクトで **どれを選ぶか** の判断軸を持つ
- 関連エコシステム（Apollo Client / urql / Relay / GraphQL Yoga）の位置付けが分かる

## 解説

### 3 つの選択肢

API の設計には主に 3 つの流派があります。

| | スタイル | 特徴 |
|---|---|---|
| **REST** | リソース指向 + HTTP メソッド | 標準的、CDN キャッシュが効く |
| **GraphQL** | スキーマ + クエリ言語 | 必要なフィールドだけ取得、複数リソース 1 リクエスト |
| **tRPC** | 関数呼び出し + TypeScript | 型がそのまま伝わる、クライアント自動生成不要 |

「**どれが正解** 」ではなく、**プロジェクトとチームに合わせて** 選びます。

### REST のおさらいと弱み

```
GET    /users/123          ← 取得
POST   /users              ← 作成
PUT    /users/123          ← 更新（全部）
PATCH  /users/123          ← 更新（一部）
DELETE /users/123          ← 削除
```

長所:

- HTTP メソッドとパスで読みやすい
- **CDN / プロキシのキャッシュ** が効く
- 標準なのでツールが豊富（Postman / OpenAPI）

弱み:

- **取得しすぎ / 取得不足**（Over/Under fetching）。`GET /users/123` で名前しか要らないのにフルプロフィールが返る
- **複数リソースのために何回も呼ぶ**（N+1 問題）
- **バージョニングが面倒**（v1 / v2 / v3 を共存させる）

### GraphQL

「**1 つのエンドポイント**（POST /graphql）に **クエリ言語** を送って、必要なフィールドだけ取得する」考え方。Facebook が 2015 年に公開。

#### スキーマ

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
}

type Query {
  user(id: ID!): User
  posts(limit: Int = 10): [Post!]!
}

type Mutation {
  createPost(title: String!, body: String!): Post!
}

type Subscription {
  postAdded: Post!
}
```

#### クエリ

```graphql
query {
  user(id: "123") {
    name
    posts(limit: 5) {
      title
    }
  }
}
```

レスポンス:

```json
{
  "data": {
    "user": {
      "name": "山田",
      "posts": [{ "title": "Hello" }, { "title": "GraphQL 楽しい" }]
    }
  }
}
```

ポイント:

- **`name` と `posts.title` だけ** 要求 → サーバーはそれだけ返す（**Over fetch を防げる**）
- **複数リソース**（user + posts） を 1 リクエストで取れる（**N+1 を防げる**）

#### ミューテーション

```graphql
mutation {
  createPost(title: "新記事", body: "本文") {
    id
    title
  }
}
```

書き込みは `mutation` で書きます（query との明示的な区別）。

#### サブスクリプション

```graphql
subscription {
  postAdded {
    id
    title
  }
}
```

WebSocket / SSE 上で **リアルタイムに新着を受信** できます。

#### サーバー側の実装

人気の選択肢:

| ライブラリ | 特徴 |
|---|---|
| **Apollo Server** | フルスタック。エンタープライズ |
| **GraphQL Yoga** | 軽量で速い。Next.js / Bun と相性 |
| **Pothos / TypeGraphQL** | TypeScript 中心のスキーマ定義 |
| **Hasura / PostGraphile** | DB から自動生成 |

#### クライアント側の主な選択肢

| ライブラリ | 特徴 |
|---|---|
| **Apollo Client** | キャッシュ機能が強い。エコシステム最大 |
| **urql** | 軽量、設定がシンプル |
| **Relay** | Meta 製。ページネーション / フラグメントで強力 |
| **GraphQL Request** | 最小、シンプルな fetch ラッパー |
| **graphql-codegen** | スキーマ → 型 / Hooks 自動生成 |

#### 例: Apollo Client + Next.js

```bash
npm install @apollo/client graphql
```

```tsx
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

const data = await client.query({
  query: gql`
    query {
      user(id: "123") { name }
    }
  `,
});
```

#### GraphQL の弱み

- **CDN キャッシュが効きにくい**（POST 1 本のため）
- **学習コスト**（スキーマ言語、N+1 解決の DataLoader、フラグメント）
- **小規模では過剰**（モノリスな自社 API なら REST / tRPC で十分）
- **ファイルアップロード** は専用拡張が必要

### tRPC

「**TypeScript の関数を、そのままクライアントから呼ぶ**」発想。Next.js / TypeScript 専用と言って良い構造。

特徴:

- **API スキーマを書かない**（TypeScript の型がスキーマ）
- **クライアントが型を自動取得**（`import type` の延長）
- **コード生成が要らない**

#### サーバー側

```ts
// server/router.ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello, ${input.name}`),

  createPost: t.procedure
    .input(z.object({ title: z.string(), body: z.string() }))
    .mutation(async ({ input }) => {
      // DB に保存
      return { id: "p1", ...input };
    }),
});

export type AppRouter = typeof appRouter;
```

#### Next.js の Route Handler に乗せる

```ts
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
```

#### クライアント側

```ts
// utils/trpc.ts
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@/server/router";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
```

```tsx
const trpc = useTRPC();
const { data } = useQuery(trpc.hello.queryOptions({ name: "world" }));
//        ^? string  ← サーバーから自動推論
```

ポイント:

- 「**サーバーで関数を変えたら**、**クライアントの呼び出し側で即型エラー**」
- IDE で **オートコンプリート** がそのまま効く
- スキーマ言語を書かない / コード生成しない / **TypeScript ファースト**

### REST / GraphQL / tRPC の選び方

#### こういう時は **REST**

- 公開 API（外部の開発者向け / SDK 配布）
- CDN キャッシュを最大限活かしたい
- HTTP の知識だけで読める「**普通**」が欲しい
- 多言語クライアント（iOS / Android / Web）でも動く

#### こういう時は **GraphQL**

- フロントから **複数リソースを 1 回で** 取りたい
- フィールド過不足の最適化が大事
- 大規模 / 多チーム（バックエンドとフロントの **契約** をスキーマで明示）
- リアルタイム要件（Subscription）

#### こういう時は **tRPC**

- フロント / バックが **同じ TypeScript リポジトリ**
- 自社専用 API（外部公開しない）
- 型の一貫性を **何より優先** したい
- 小〜中規模で **手数を最小** にしたい（Next.js + tRPC が定番）

### 共存もアリ

「**REST + tRPC**」「**GraphQL + tRPC**」のような組合せもよく見ます:

- 公開 API は REST / GraphQL
- 自社の Next.js 内部は tRPC

「**外向き / 内向きで分ける**」のは現実的な解。

### Server Components 時代の API

Next.js の App Router では **Server Component が直接 DB を叩ける**（`async function` の中で `prisma.user.findFirst({...})`）ようになりました。これは **「Web フロントが API を呼ぶ」発想を崩します**。

- 初期表示は **Server Component が直接 DB / 外部 API**
- 動的なクライアント操作は **Server Actions** または **API**（tRPC / GraphQL / REST）

「Web 用なら **API ですらない**」が選択肢として加わったのが 2026 年の現代です。

### よくある質問

#### 「GraphQL は重い」は本当？

DataLoader を使った **N+1 対策** をやれば、REST の何倍も軽くなることもあります。逆に **無対策だと重い**。エコシステムの知識が要る。

#### 「tRPC は本番に強い？」

Vercel / T3 Stack（Next.js + tRPC + Prisma）は実本番で多数事例あり。エンタープライズの大規模では **tRPC v11 + Server Actions** で十分。

#### REST + Zod + OpenAPI で似たことができる？

できます。`tsoa` / `zod-openapi` / `Hono + zod-openapi` で **REST に型** を載せた構成は最近人気。**「tRPC 風 REST」** と呼ばれます。

## 演習

### ゴール

- 同じ「**ユーザー一覧 + 詳細**」を REST / GraphQL / tRPC の **3 通り** で書いて比較する
- それぞれの **コード量 / 型の通り方 / DX** を体感する

### 手順 1: ベースの Next.js

```bash
npx create-next-app@latest api-styles --ts --app
cd api-styles
```

### 手順 2: REST 版

`app/api/users/route.ts`:

```ts
const users = [
  { id: "1", name: "Alice", email: "a@example.com" },
  { id: "2", name: "Bob", email: "b@example.com" },
];

export async function GET() {
  return Response.json(users);
}
```

`app/users-rest/page.tsx`:

```tsx
type User = { id: string; name: string; email: string };

export default async function Page() {
  const res = await fetch("http://localhost:3000/api/users", { cache: "no-store" });
  const users: User[] = await res.json();
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

REST は **クライアント側で型** を別途定義するのがネック（ずれると壊れる）。

### 手順 3: tRPC 版

```bash
npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod superjson
```

> tRPC v11 では `@trpc/tanstack-react-query` 統合が推奨です（旧 `@trpc/react-query` も動きますが「Classic」扱い）。

`server/router.ts`:

```ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const users = [
  { id: "1", name: "Alice", email: "a@example.com" },
  { id: "2", name: "Bob", email: "b@example.com" },
];

export const appRouter = t.router({
  listUsers: t.procedure.query(() => users),
  getUser: t.procedure.input(z.object({ id: z.string() })).query(({ input }) =>
    users.find((u) => u.id === input.id),
  ),
});

export type AppRouter = typeof appRouter;
```

`app/api/trpc/[trpc]/route.ts`:

```ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
```

`utils/trpc.ts`:

```ts
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@/server/router";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
```

`app/providers.tsx`:

```tsx
"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, createTRPCClient } from "@trpc/client";
import { TRPCProvider } from "@/utils/trpc";
import type { AppRouter } from "@/server/router";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: "/api/trpc" })],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

`app/layout.tsx` で `<Providers>` でラップし、`app/users/page.tsx` では:

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

export default function UsersPage() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.listUsers.queryOptions());
  if (isLoading) return <p>読込中...</p>;
  return (
    <ul>
      {data?.map((u) => (
        <li key={u.id}>{u.name} — {u.email}</li>
      ))}
    </ul>
  );
}
```

`trpc.listUsers.queryOptions()` の戻り値は **完全に型付き**（サーバー側の型がそのまま伝わる）。

### 手順 4: GraphQL 版

```bash
npm install graphql graphql-yoga
```

`app/api/graphql/route.ts`:

```ts
import { createYoga, createSchema } from "graphql-yoga";

const users = [
  { id: "1", name: "Alice", email: "a@example.com" },
  { id: "2", name: "Bob", email: "b@example.com" },
];

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `
      type User { id: ID! name: String! email: String! }
      type Query { users: [User!]! user(id: ID!): User }
    `,
    resolvers: {
      Query: {
        users: () => users,
        user: (_: unknown, { id }: { id: string }) => users.find((u) => u.id === id),
      },
    },
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});

export const GET = yoga;
export const POST = yoga;
```

`http://localhost:3000/api/graphql` で GraphiQL が開いてクエリを試せます。

### 期待出力

- 3 通りで同じデータが取得できる
- tRPC 版は **クライアント側に型を一切書かない** のに型が通る
- GraphQL 版は **必要なフィールドだけ** 要求する記述ができる

### 変える

- tRPC で `getUser` を呼んでみる。`input` を間違えると **クライアントの型エラー** が出ることを確認
- GraphQL で **複数リソース** を 1 リクエストで取得する（user + その投稿）
- REST に Zod を入れて、レスポンスの型を保証する

### 自分で書く（任意）

- T3 Stack（Next.js + tRPC + Prisma + Tailwind）の最小例を作る
- 既存の REST API を GraphQL でラップする（Apollo / Yoga）
- 公開 API を REST、内部 API を tRPC、で分ける構成を作る

## まとめ

- **REST** は標準で **CDN キャッシュが効く**。公開 API / 多言語クライアントに強い
- **GraphQL** は **必要なフィールドだけ** / **複数リソース 1 回**。大規模・多チーム / リアルタイム
- **tRPC** は **型がそのまま伝わる**。Next.js + TypeScript モノレポで圧倒的 DX
- **どれが正解** ではなく、プロジェクトとチームに合わせて選ぶ
- 共存（外向き REST + 内向き tRPC）も実用解
- Next.js App Router の **Server Components / Server Actions** が「API すら不要」の選択肢として加わった
