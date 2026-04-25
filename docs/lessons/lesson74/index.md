# lesson74: Server Component でデータを取得する

## ゴール

- `async` な Server Component を書けるようになります。
- 外部 API から `fetch` でデータを取ってきて、結果を JSX で表示できます。
- `loading.tsx` でローディング UI を挟めるようになります。
- Next.js 16 の Server Component での fetch は **既定でキャッシュしない** ことを知り、キャッシュしたいときの書き方（`"use cache"` ディレクティブ / `fetch` オプション）を見分けられます。

## 解説

### Server Component は `async` にできる

4 章 までの React コンポーネントは同期関数でした。App Router の Server Component は **`async` 関数にできる** のが大きな違いです。

```tsx
export default async function Page() {
  const data = await fetch("https://...").then((r) => r.json());
  return <div>{data.title}</div>;
}
```

- 関数の頭に `async` を付けられるのは Server Component のみです。Client Component では使えません（`"use client"` のファイルに `async` を付けるとエラーになります）。
- `await` で取得が終わるまで待てます。ブラウザ側の `useState` + `useEffect` で組む必要が一切ありません。

ブラウザ側 `fetch` + `useEffect` で起きていた典型的な問題（4 章 の「useEffect の基本」末尾で予告した「競合状態 / ローディング / エラー管理の罠」）が、サーバー側に寄せることでそもそも発生しなくなります。

### `loading.tsx` でローディング UI

`fetch` が終わるまでの間、ユーザーには空白のページが見えます。これを防ぐには `loading.tsx` を同じディレクトリに置きます。

```
app/
└── posts/
    ├── page.tsx       ← データ取得込みのページ
    └── loading.tsx    ← 取得中に表示される
```

`loading.tsx` は `page.tsx` が準備できるまで自動で差し込まれます。学習者側は特別な接続コードを書きません。

### Next.js 16 のキャッシュは「明示的に opt-in」

Next.js 14 までは、Server Component の `fetch` はデフォルトで **結果をキャッシュ** していました。便利な反面、「キャッシュされていると気付かずに古いデータを見る」事故が多かったため、Next.js 15 以降は **fetch のデフォルトがキャッシュしない** 動作に切り替わっています。毎リクエストで取り直します。

キャッシュしたい場合は明示的に指定します。書き方は 2 系統あります。

#### 従来の方法: `fetch` のオプション

第 2 引数で挙動を切り替える、以前から使える書き方です。

```tsx
// (1) 強くキャッシュ: 一度取ったらずっと使い回す
await fetch(url, { cache: "force-cache" });

// (2) 一定時間ごとに再取得: 60 秒間はキャッシュ、60 秒経ったら次のアクセスで新しく取る
await fetch(url, { next: { revalidate: 60 } });

// (3) タグ単位で無効化: Server Actions から revalidateTag('posts') を呼ぶとこのキャッシュが切れる
await fetch(url, { next: { tags: ["posts"] } });
```

#### 新しい方法: `"use cache"` ディレクティブ（Cache Components）

Next.js 16 で導入された **Cache Components** のパターンです。コンポーネントや関数の先頭に `"use cache"` と書くと、その結果全体をキャッシュ対象にします。`next.config.ts` で `cacheComponents: true` を有効にしたときに使えます。

```tsx
// next.config.ts
const nextConfig = {
  cacheComponents: true, // Cache Components を有効化
};
export default nextConfig;
```

```tsx
// 関数単位: fetch をまとめてキャッシュ
import { cacheLife, cacheTag } from "next/cache";

async function getPosts() {
  "use cache";
  cacheLife("hours"); // 1 時間単位でキャッシュ
  cacheTag("posts");  // 'posts' タグで無効化対象にする
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json();
}
```

```tsx
// コンポーネント単位: 描画結果ごとキャッシュ
async function PostList() {
  "use cache";
  const posts = await fetch("https://jsonplaceholder.typicode.com/posts").then((r) => r.json());
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

- **`"use cache"` を書いた関数 / コンポーネント全体** がキャッシュされる
- `cacheLife("minutes" | "hours" | "days" | "weeks" | ...)` でキャッシュ寿命を設定
- `cacheTag("...")` で `revalidateTag` から無効化できるタグを付ける
- 書く場所はファイル先頭（ファイル全体）/ 関数先頭 / コンポーネント先頭のいずれか

> **補足: `cacheComponents` を有効にしていない状態で `"use cache"` を書くとビルドエラー**: `next.config.ts` で `cacheComponents: true` を入れていないファイルに `"use cache"` を書くと、`Error: "use cache" requires the cacheComponents experimental flag to be enabled` のようなエラーで **ビルドが落ちます**。本レッスンの演習では `cacheComponents` を有効にしないので、キャッシュしたい場合は `fetch` オプション（`force-cache` / `next.revalidate` / `next.tags`）の方を使います。

本レッスンの演習ではキャッシュ指定なしの素の `fetch(url)` を使います。「キャッシュしたいときに 2 系統の選択肢がある」ことだけ頭に入れておけば十分です。本格的に使うのは実務に入ってからで構いません。

ここで話しているキャッシュは **Server Component のデータ取得** の話です。App Router にはこれ以外にも Router Cache 等がありますが、本コースでは踏み込みません。

## 演習

### 途中から始める場合

このレッスンの記事一覧演習は比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します（`app/posts/page.tsx` と `app/posts/loading.tsx` の新規作成が中心です。手順 3 のヘッダーリンク追加は `app/layout.tsx` にナビがあれば足せますが、無ければスキップして構いません）。

### 前回のプロジェクトを開く

これまでのレッスンで作ったプロジェクトを開き直しましょう。

### 手順 1: `/posts` ページを作る

`app/posts/page.tsx` を新規作成します。

```tsx
type Post = {
  id: number;
  title: string;
  body: string;
};

export default async function PostsPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await res.json();

  return (
    <>
      <h1>記事一覧</h1>
      <ul>
        {posts.slice(0, 10).map((post) => (
          <li key={post.id}>
            <strong>#{post.id}</strong> {post.title}
          </li>
        ))}
      </ul>
    </>
  );
}
```

- `async function` で書いています（Server Component だから許されます）。
- `fetch` も `response.json()` も `await` が必要です（2 章 で学んだ fetch と同じです）。
- `Post` 型を自前で `type` で定義しています。3 章 で学んだ `type` エイリアスそのままです。
- `slice(0, 10)` で先頭 10 件だけにします。JSONPlaceholder は 100 件返すので絞ります。

> **補足: `Post[]` への型キャストは「信頼している」だけ**: `await res.json()` の戻り値は実際は `unknown` で、上のコードは「外部 API は約束通りの形を返してくる」と **信じている** 状態です。本番では API が想定外のレスポンスを返すこともあるため、実務では **Zod** などのスキーマライブラリで `PostSchema.parse(json)` のように **実行時に形をチェック** します。Zod は別のレッスン「Zod でスキーマバリデーション」で扱います。

### 手順 2: `loading.tsx` を置く

`app/posts/loading.tsx` を新規作成します。

```tsx
export default function Loading() {
  return <p>読み込み中...</p>;
}
```

- 名前は `Loading` でなくても構いません（`export default` の関数名は自由です）。
- ファイル名は `loading.tsx` 固定です。

### 手順 3: ヘッダーにリンクを追加

`app/layout.tsx` のナビに `/posts` のリンクを 1 つ足します。

```tsx
<li>
  <Link href="/posts">Posts</Link>
</li>
```

### 期待出力

1. ブラウザで `/posts` を開きます。
2. 一瞬だけ「読み込み中...」が出て、その後に記事 10 件が並びます。
3. ネットワークが速すぎて「読み込み中...」が見えないときは、Chrome DevTools の Network タブで Throttling を「Slow 3G」にして再読み込みします。今度ははっきり見えます。
4. StackBlitz ターミナル側に fetch のログは出ませんが、サーバー側で HTTP 通信が走っています。ブラウザ Console には fetch の形跡は出ません（サーバーで取ってきたからです）。

### 変えてみる

1. `slice(0, 10)` を `slice(0, 3)` にして 3 件だけにしましょう。
2. `<li>` の中に `<p>{post.body}</p>` を追加して本文も表示しましょう。
3. URL を `https://jsonplaceholder.typicode.com/users` に変え、`Post` の代わりに `{ id: number; name: string; email: string }` 型の `User` 型を定義して表示しましょう（型を書き直す練習です）。

### キャッシュ指定を試す（任意）

`fetch` の第 2 引数に以下を指定して挙動の違いを見てみましょう。すぐに分かる変化ではないので、「エラーにならない」ことを確認するだけで良いです。

```tsx
const res = await fetch(
  "https://jsonplaceholder.typicode.com/posts",
  { next: { revalidate: 60 } },
);
```

### 自分で書く

`app/users/page.tsx` を新規で作り、`https://jsonplaceholder.typicode.com/users` を fetch して、`<ul>` に `name` と `email` を並べるページを自力で組んでみましょう。型は `type User = { id: number; name: string; email: string }` で構いません。完了したらヘッダーに `/users` のリンクも足しましょう。

## まとめ

- Server Component は `async` にできます。`await fetch(...)` でデータを直接取得できます。
- `loading.tsx` を同ディレクトリに置くだけで、準備中の表示を自動で挟めます。
- Next.js 15 以降、Server Component での **fetch の既定はキャッシュしません**。キャッシュしたいときは `fetch` オプション（`force-cache` / `revalidate` / `tags`）か、Next.js 16 で導入された **`"use cache"` ディレクティブ**（Cache Components） を使います。
- ブラウザ側 fetch + `useEffect` で起きていた罠を回避できるのが Server Component の強みです。
- このあとの「動的ルート」では URL の一部をパラメータとして受け取る動的ルート `[id]` を作ります。2 章 で学んだ `find` が再登場します。

### コラム: `loading.tsx` の裏で動く Suspense

`loading.tsx` の仕組みは、React の **`<Suspense>`** によるストリーミング描画で動いています。ページの非同期な部分が準備できるまでの間、`<Suspense fallback={...}>` で指定されたフォールバック UI を表示する機能があります。Next.js はこれを `loading.tsx` というファイル規約に包んで、学習者が `<Suspense>` を直接書かなくても済むようにしています。

本コースでは `<Suspense>` を単独で使う場面は出てきませんが、「`loading.tsx` の裏では Suspense が動いている」と頭の片隅に入れておくと、後で React の別コースや公式ドキュメントを読むときに繋がります。
