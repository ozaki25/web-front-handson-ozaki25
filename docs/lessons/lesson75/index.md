# lesson75: Server Component でデータを取得する

## ゴール

- `async` な Server Component を書ける
- 外部 API から `fetch` でデータを取って、結果を JSX で表示できる
- `loading.tsx` でローディング UI を挟める

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

`loading.tsx` は `page.tsx` が準備できるまで自動で差し込まれます。`<Suspense>` を自分で書く必要はありません。

::: tip fetch のキャッシュについて
lesson75 の演習では素の `fetch(url)` を使います。Next.js 15 以降のデフォルトはキャッシュしない動作です。キャッシュを使いたいときの書き方（`force-cache` / `revalidate` / `tags` など）は lesson76 で詳しく扱います。
:::

## 演習

### 途中から始める場合

このレッスンの記事一覧演習は比較的独立しています。新規 StackBlitz の Next.js テンプレート(<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>)を開けば、本文の手順だけで完結します。中心となるのは `app/posts/page.tsx` と `app/posts/loading.tsx` の新規作成です。手順 3 のヘッダーリンク追加は `app/layout.tsx` にナビがあれば足せますが、無ければスキップして構いません。

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

> **補足: `Post[]` の型注釈は実行時にチェックされない**: `await res.json()` の戻り値は実際には `unknown` で、`: Post[]` は TypeScript に「この形だと信じてください」と伝えているだけで実行時の検証はしません。本番では API が想定外のレスポンスを返すこともあるため、実務では **Zod** などのスキーマライブラリで `PostSchema.parse(json)` のように実行時に形をチェックします。

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

### 自分で書く

`app/users/page.tsx` を新規で作り、`https://jsonplaceholder.typicode.com/users` を fetch して、`<ul>` に `name` と `email` を並べるページを自力で組んでみましょう。型は `type User = { id: number; name: string; email: string }` で構いません。完了したらヘッダーに `/users` のリンクも足しましょう。

## まとめ

- Server Component は `async` にできる。`await fetch(...)` でデータを直接取得できる
- `loading.tsx` を同ディレクトリに置くだけで、準備中の表示を自動で挟める
- ブラウザ側 `fetch` + `useEffect` で起きていた競合・ローディング管理の罠が、サーバー側に寄せることで回避できる
- fetch のキャッシュ制御（`force-cache` / `revalidate` / `tags`）と `revalidatePath` / `revalidateTag` は lesson76 で詳しく扱う

### コラム: `loading.tsx` の裏で動く Suspense

`loading.tsx` の仕組みは React の **`<Suspense>`** によるストリーミング描画で動いています。`<Suspense fallback={...}>` で「非同期な部分が準備できるまでフォールバック UI を出す」ことができ、Next.js はこれを `loading.tsx` というファイル規約に包んで、自分で `<Suspense>` を書かなくても済むようにしています。

詳しい使い方は「Loading UI と Streaming」のレッスンで扱います。「`loading.tsx` の裏では Suspense が動いている」とだけ頭の片隅に入れておけば十分です。
