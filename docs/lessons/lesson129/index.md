# lesson128: Server Components の設計論

## ゴール

- 「**どこまでサーバー、どこから Client**」の判断軸を持てる
- データ取得とインタラクションの **分離** が説明できる
- Server Actions と Client Component の **協調パターン** を書ける
- よくある設計ミス（巨大 Client Component / 不要なシリアライズ）を避けられる
- 自分の Next.js プロジェクトで Server / Client の境界設計を整理できる

::: tip 前提
このレッスンは「Server Component と Client Component」「Server Component でデータ取得」「Server Actions の最小形」の発展編です。基本概念はそれぞれのレッスンで確認してください。
:::

## 解説

### Server / Client の境界判断

Next.js App Router では **すべてのコンポーネントがデフォルトで Server Component**。Client Component にしたい時に **`"use client"`** を明示します。

判断の **基本原則**:

1. **デフォルトは Server**（バンドルから外せて速い）
2. **状態 / イベントが必要な葉だけ Client**（最小限）
3. **Client は子に Client / Server を持てるが、Server を import するなら children prop 経由**

### Client Component が必要な合図

次のいずれかが要るなら Client Component:

- `useState` / `useReducer` で **state を持つ**
- `useEffect` で **副作用** を行う
- `onClick` / `onChange` などの **イベントハンドラ**
- `useRef` / `useContext` などの Hook
- ブラウザ API（`window` / `localStorage` / `navigator`）

それ以外は **Server Component に置いた方が良い**:

- データ取得（DB / 外部 API）
- マークダウンや HTML のレンダリング
- 認証情報を使う処理（Cookie 読み取り）
- フォントやレイアウト

### 「Client Component が大きすぎる」アンチパターン

**よくある失敗**: ページ全体を Client Component にしてしまう。

```tsx
// app/page.tsx
"use client";  // 危険信号

export default function HomePage() {
  // すべての処理がブラウザに送られる
  return (
    <div>
      <Header />
      <Hero />
      <FeatureList />     {/* 静的でも Client */}
      <Counter />          {/* これだけ state が必要 */}
      <Footer />
    </div>
  );
}
```

**バンドルサイズが膨らむ**、**SEO に悪い**、**ハイドレーション** が遅い。

### 改善: Client は **葉に閉じ込める**

```tsx
// app/page.tsx（Server Component）
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureList from "@/components/FeatureList";
import Counter from "@/components/Counter";  // Client
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div>
      <Header />
      <Hero />
      <FeatureList />
      <Counter />
      <Footer />
    </div>
  );
}
```

```tsx
// components/Counter.tsx
"use client";
import { useState } from "react";

export default function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

**Counter だけ** がブラウザに送られ、他は Server で解決される。

### Server Component から Client Component に **データを渡す**

これは普通に **props で渡す** だけです。**渡せるのは serializable な値のみ**:

| 渡せる | 渡せない |
|---|---|
| 文字列 / 数値 / boolean / null / undefined | 関数 |
| 配列 / プレーンオブジェクト | クラスインスタンス |
| Date / Map / Set | Symbol（一部例外） |
| Promise（React 19 以降） | DOM ノード |

```tsx
// Server Component
export default async function Page() {
  const user = await db.user.findFirst();
  return <UserCard user={user} />; // user はプレーンオブジェクトなら OK
}
```

### Client Component から Server Component を **使う**

直接 import はできません。代わりに **`children` prop** で受け取ります。

```tsx
// app/layout.tsx（Server Component）
import Sidebar from "@/components/Sidebar";          // Client
import RecentPosts from "@/components/RecentPosts";  // Server

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>           {/* Client */}
      <RecentPosts />   {/* Sidebar は中身を知らずに描画 */}
      {children}
    </Sidebar>
  );
}
```

```tsx
// components/Sidebar.tsx
"use client";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside>
      <h2>サイドバー</h2>
      {children}
    </aside>
  );
}
```

「Client Component の中身に Server Component を **slot で挿入する**」発想。Sidebar は中身がServer か Client かを知らず、ただ描画する。

### Server Actions との協調

Server Actions（lesson80）は **「サーバー上で実行される関数を、クライアントのフォーム送信から直接呼ぶ」** 仕組み。

```tsx
// app/posts/page.tsx
import { createPost } from "./actions";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="body" />
      <button>投稿</button>
    </form>
  );
}
```

```ts
// app/posts/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  await db.post.create({ data: { title, body } });
  revalidatePath("/posts");
}
```

#### Client Component から呼ぶ

```tsx
"use client";
import { useTransition } from "react";
import { createPost } from "./actions";

export default function NewPostForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await createPost(formData);
        });
      }}
    >
      <input name="title" disabled={pending} />
      <button disabled={pending}>{pending ? "送信中..." : "投稿"}</button>
    </form>
  );
}
```

`useTransition` で **送信中** の UI を切り替え。Server Component に **戻り値** を返すこともできます。

### `useActionState`（旧 `useFormState`）

React 19 / Next.js 16 では `useActionState` で **action の結果を state として** 受け取れます。

```tsx
"use client";
import { useActionState } from "react";
import { createPost } from "./actions";

const initialState = { ok: false, error: "" };

export default function NewPostForm() {
  const [state, formAction, pending] = useActionState(createPost, initialState);

  return (
    <form action={formAction}>
      <input name="title" />
      <button disabled={pending}>投稿</button>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state.ok && <p>投稿しました</p>}
    </form>
  );
}
```

```ts
"use server";
export async function createPost(prev: any, formData: FormData) {
  try {
    await db.post.create({ data: {/* ... */} });
    return { ok: true, error: "" };
  } catch (e) {
    return { ok: false, error: "保存失敗" };
  }
}
```

「Server Action から **エラーメッセージを返す**」が型安全に書けます。

### よくある設計ミス

#### 1. データを Server Component で取って **JSON に詰めて Client Component に丸投げ**

```tsx
// NG パターン
export default async function Page() {
  const posts = await db.post.findMany();  // Server で取得
  return <PostListClient posts={posts} />; // 全部 Client にバンドル
}
```

→ 結局すべて JS にシリアライズされて送られる。**せっかくの Server Component の意味が薄れる**。

改善: **表示は Server で**、操作だけ Client に切り出す。

```tsx
// 改善
export default async function Page() {
  const posts = await db.post.findMany();
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <h2>{p.title}</h2>
          <p>{p.body}</p>
          <DeleteButton postId={p.id} />  {/* Client は削除ボタンだけ */}
        </li>
      ))}
    </ul>
  );
}
```

#### 2. Server Component の中で Client Component を再描画させたい

Server Component の **再実行はナビゲーション / 再検証** がトリガー。「state が変わったので再取得」したい時は:

- **Server Action + `revalidatePath()`**（推薦）
- **Client 側で fetch**（やむを得ない時）

```ts
"use server";
export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
  revalidatePath("/posts");  // Server Component を再実行
}
```

#### 3. Server / Client を混ぜてシリアライズ不能なものを渡す

```tsx
// NG: 関数を渡す
<ClientComponent onClick={() => doSomething()} />
```

→ Server Component から関数は **渡せない**。`onClick` を持つロジックは **Client Component の中** で完結させる。

#### 4. `"use client"` の場所を間違える

```tsx
// app/page.tsx（Server Component）
"use client";   // ファイルの先頭でないと無効
```

`"use client"` は **ファイルの先頭** に書く必要があります。途中に書いても効きません。

### `server-only` と `client-only`

「**意図しない場所で import される事故**」を防ぐ仕組み。

```ts
// db.ts
import "server-only";

export const db = /* DB クライアント */;
```

これを誤って Client Component から import するとビルド時にエラー。**シークレットの漏洩防止** に有効（lesson117）。

```ts
// browser-utils.ts
import "client-only";

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}
```

逆も同様。

### Suspense と Loading

データ取得中の UI を **Suspense + Loading UI** で書きます（lesson69 / lesson88 と関連）。

```tsx
// app/posts/page.tsx
import { Suspense } from "react";
import PostList from "./PostList";
import PostListSkeleton from "./PostListSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList />
    </Suspense>
  );
}
```

`PostList` が `await` を含む Server Component なら、待ち時間に **Skeleton が表示** される。**ストリーミング SSR** で各部分が **独立に到着** します。

### `cache()` / `cacheSignal()`

Next.js 16 / React 19 では **同一リクエスト内** のデータをメモ化する `cache()` が安定。`cacheSignal()` は React 19.2 時点で **experimental（実験的）** であり、安定 API になるまでは API が変わる可能性があります。

```ts
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
```

複数の Server Component が `getUser("1")` を呼んでも **DB は 1 回しかヒット** しない。リクエストスコープのメモ化。

### 「全体構造」のテンプレート

経験則で次のように分割します:

```
app/
├── layout.tsx                    ← Server（フォント / Provider 設置）
├── page.tsx                       ← Server
├── components/
│   ├── Header.tsx                 ← Server
│   ├── ThemeToggle.tsx            ← Client（state 必要）
│   ├── PostList.tsx               ← Server（DB 取得）
│   ├── PostCard.tsx               ← Server（表示のみ）
│   ├── DeleteButton.tsx           ← Client（onClick → Action）
│   └── CommentForm.tsx            ← Client（form + useActionState）
├── posts/
│   ├── actions.ts                 ← Server Actions
│   └── [id]/page.tsx              ← Server
└── api/
    └── webhook/route.ts           ← Route Handler
```

### よくある質問

#### Q: 全部 Client にしてもいいか？

→ **動くけど遅い**。バンドルが膨らみ、ハイドレーションも遅い。最低限「データ取得は Server」を守る。

#### Q: 古い React パターン（Pages Router / `getServerSideProps`）から移行するには？

→ Pages Router の `getServerSideProps` は App Router の **Server Component** に置き換わる。**そのまま Server で `await fetch()`** を書けば良い。

#### Q: Edge Runtime と Node.js Runtime の違いは？

→ **Edge** は軽量・高速だが利用できる API に制限がある、**Node.js** は Node API がまるごと使える。App Router は **Server Component / Route Handler とも Node.js Runtime がデフォルト** で、Edge を使いたいファイルだけ `export const runtime = "edge"` で opt-in する。Next.js 16 では **Middleware も Node.js Runtime を選べる** ようになり、Node API を必要とする処理を Middleware に書きやすくなった。

## 演習

### ゴール

- 「ブログ記事一覧 + 投稿フォーム + 削除」を Server / Client の境界を意識して設計する
- 既存の Client Component を **Server に格上げ** する練習

### 手順 1: 新規プロジェクト

```bash
npx create-next-app@latest rsc-design --ts --app
cd rsc-design
```

### 手順 2: Server Component で一覧

`app/page.tsx`:

```tsx
import DeleteButton from "./DeleteButton";
import { posts } from "@/data/posts";

export default async function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>記事一覧</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <h2>{p.title}</h2>
            <p>{p.body}</p>
            <DeleteButton id={p.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

`data/posts.ts`（仮データ）:

```ts
export const posts = [
  { id: "1", title: "Hello", body: "本文 1" },
  { id: "2", title: "World", body: "本文 2" },
];
```

### 手順 3: Server Action と Client Component

`app/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function deletePost(id: string) {
  // 実際には DB から削除
  console.log("Deleting:", id);
  revalidatePath("/");
}
```

`app/DeleteButton.tsx`:

```tsx
"use client";
import { useTransition } from "react";
import { deletePost } from "./actions";

export default function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => deletePost(id))}
    >
      {pending ? "..." : "削除"}
    </button>
  );
}
```

### 手順 4: 投稿フォーム（useActionState）

`app/PostForm.tsx`:

```tsx
"use client";
import { useActionState } from "react";
import { createPost } from "./actions";

export default function PostForm() {
  const [state, action, pending] = useActionState(createPost, { ok: false, error: "" });

  return (
    <form action={action}>
      <input name="title" placeholder="タイトル" required />
      <textarea name="body" placeholder="本文" />
      <button disabled={pending}>{pending ? "送信中" : "投稿"}</button>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state.ok && <p>投稿完了</p>}
    </form>
  );
}
```

`actions.ts` に `createPost` を追加:

```ts
export async function createPost(prev: any, formData: FormData) {
  const title = String(formData.get("title") ?? "");
  if (!title.trim()) return { ok: false, error: "タイトル必須" };
  console.log("Created:", title);
  revalidatePath("/");
  return { ok: true, error: "" };
}
```

### 手順 5: 動作確認

`npm run dev` で:

- 記事一覧は **Server で描画**（ソース表示で HTML に文字列が含まれる）
- 削除ボタンの onClick 部分だけ **Client にハイドレーション**
- 投稿フォームでバリデーションエラーをサーバーから返却

### 期待出力

- ページの初回 HTML には **記事タイトルと本文がそのまま** 含まれている（Server で描画）
- 削除 / 投稿のロジックはサーバーで実行
- バリデーションエラーが Client Component の state に反映

### 変える

- `Suspense` + `loading.tsx` でストリーミング表示にする
- `cache()` で同じデータの取得を 1 回に集約する
- `server-only` パッケージを入れて、誤って Client から import されないように守る

### 自分で書く（5 章 の synthesis 成果物に適用）

このコースの **5 章「小さなアプリを仕上げる」** で完成させた TODO アプリ（`/todos` / `/todos/[id]` / `/about`）を **境界の目で見直す** 演習です。

1. プロジェクトの全 `.tsx` を `grep "use client"` で抽出 → どれが Client Component か一覧化
2. 各 Client Component について、**本当に Client が必要か** を確認:
   - 状態 / イベント / ブラウザ API があるか?
   - 無いなら `"use client"` を外して Server Component に戻す
3. **`server-only` パッケージで「壊す」テスト**:
   - `app/actions.ts` の冒頭に `import "server-only";` を追加
   - 試しに Client Component から `import { addTodo } from "../actions"` してビルド → **エラーが出る**ことを確認
4. **データ取得の場所** をチェック: Client Component の `useEffect` 内で `fetch` していないか? あれば Server Component に **吸い上げて props で渡す**
5. 「`<DeleteButton>` だけが Client、リスト本体は Server」のように **葉に閉じ込める** 形になっているか確認

before / after で「Client にバンドルされる JS」が減っていれば成功です（Network タブで JS の合計サイズを見る）。

### 単独の任意課題

- DB（Prisma + SQLite / PlanetScale）と接続して、本物の永続化に置き換える
- React Compiler（lesson127）と組み合わせて、`useMemo` を消した状態で動かす

## まとめ

- **デフォルトは Server Component**、必要な葉だけ `"use client"`
- データ取得は Server、インタラクションは Client、書き込みは **Server Actions**
- Client から Server を使うには **children prop** で挿入
- props は **serializable な値だけ**（関数 / クラスは渡らない）
- `useActionState` で Server Action の結果を Client の state に
- 巨大 Client Component / 不要シリアライズ / 関数受け渡しは **アンチパターン**
- `server-only` / `client-only` で誤 import を防ぐ
- `Suspense` + Loading UI で **ストリーミング表示**、`cache()` で同一リクエストのメモ化
- 「全体構造」を Server / Client で **ファイル単位で分割** すると見通しが良い
