# lesson66: 動的ルート

## ゴール

- `[id]` のようなディレクトリ名で、URL の一部をパラメータとして受け取れます。
- Next.js 15 で `params` が `Promise<...>` 型になったこと、`await params` で取り出すことを理解できます。
- 2 章 で学んだ `find` を再利用して、配列から 1 件だけ取り出せます。

## 解説

### 動的ルートとは

「記事 ID ごとに違うページを作りたい」「ユーザーごとのページを作りたい」といった場合、URL ごとにファイルを作るのは現実的ではありません。

App Router では **ディレクトリ名をブラケット `[ ]` で囲む** と、その部分が URL のパラメータになります。

```
app/
└── posts/
    ├── page.tsx            → /posts（一覧）
    └── [id]/
        └── page.tsx        → /posts/1, /posts/2, /posts/42, ...
```

`[id]` はディレクトリ名なので、そのまま書きます。`[slug]` のように別名でも構いません。URL の該当部分が `id` という名前で渡ってきます。

### `params` は Promise になった

Next.js 15 から、`page.tsx` に渡される `params` は **Promise 型** になりました。

> 重要: これは Next.js 15 での仕様変更。`params` は即値ではなく `await` で取り出す必要がある。

型は次のように書きます。

```tsx
type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  // id を使って処理
}
```

- `params` の中身のキーは **ディレクトリ名** と同じです（`[id]` なら `id`）。
- 値は常に `string` です（URL の一部なので文字列です）。数値として使いたいなら `Number(id)` に変換します。
- 関数を `async` にして、`const { id } = await params;` で取り出すのが定番です。

### `find` で 1 件だけ取り出す

2 章 の配列メソッド回の末尾で「`find` は5 章 で再登場する」と予告したのがここです。配列の中から条件に合う 1 件を取り出すメソッドです。

```ts
const target = posts.find((p) => p.id === id);
```

- 見つかったとき: その要素を返します。
- 見つからないとき: `undefined` を返します。

なので、詳細ページでは次のような流れになります。

1. 一覧を `fetch` で全部取ってくる（Server Component）。
2. `await params` で URL の `id` を取り出す。
3. `posts.find((p) => p.id === id)` で 1 件だけ探す。
4. 見つからないときは後述の「存在しない ID」の処理に渡す（次のレッスン）。

この段階ではシンプルに「一覧から `find` で取り出して表示」までを作り、「見つからなかったときの 404 表示」は次のレッスンで扱います。

### searchParams は今回扱わない

URL の **後ろ** に付く `?highlight=42` のようなクエリ文字列は **`searchParams`** で受け取ります。これも Next.js 15 で Promise 化されていますが、**このレッスンでは扱いません**。「小さなアプリを仕上げる」の中で「指定された ID にハイライトを付ける」演習で初めて使います。

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。このレッスンは「Server Component でデータを取得する」の記事一覧を前提にしています。

<details>
<summary>出発点のファイル（`/posts` 部分）</summary>

**`app/posts/page.tsx`**

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

**`app/posts/loading.tsx`**

```tsx
export default function Loading() {
  return <p>読み込み中...</p>;
}
```

</details>

### 前回のプロジェクトを開く

「Server Component でデータを取得する」で作ったプロジェクトを開き直しましょう。

### 手順 1: 一覧ページを詳細リンク付きに更新

`app/posts/page.tsx` を書き換えます。各項目を `<Link>` にして `/posts/[id]` に飛べるようにします。

```tsx
import Link from "next/link";

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
            <Link href={`/posts/${post.id}`}>
              <strong>#{post.id}</strong> {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

### 手順 2: 動的ルートのファイルを作る

`app/posts/[id]/page.tsx` を新規作成します（`[id]` はディレクトリ名として `[` と `]` をそのまま使います）。

```tsx
type Post = {
  id: number;
  title: string;
  body: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await res.json();

  // URL の id は string、API の id は number なので揃える
  const post = posts.find((p) => String(p.id) === id);

  if (!post) {
    return (
      <>
        <h1>見つかりません</h1>
        <p>ID: {id} の記事は存在しない。</p>
      </>
    );
  }

  return (
    <>
      <h1>#{post.id} {post.title}</h1>
      <p>{post.body}</p>
    </>
  );
}
```

ポイント:

- `type Props = { params: Promise<{ id: string }> }` の形で型を書きます。
- `await params` してから `id` を取り出します。
- `find` で 1 件検索します。URL の `id` は `string`、API の `id` は `number` なので、`String(p.id) === id` で揃えます。
- 見つからなかった場合は、とりあえずその場で「見つからない」メッセージを返します。正式な 404 ページは次のレッスンで扱います。

### 期待出力

1. `/posts` にアクセスすると、一覧の各項目がリンクになっています。
2. 「#1 sunt aut facere ...」のような最初の記事をクリック → `/posts/1` に遷移して詳細が表示されます。
3. URL バーで `/posts/999` と打ち込むと「見つかりません」と出ます（999 番の記事は 100 件の中にないためです）。
4. `/posts/1` でページソースを表示すると、タイトルと本文がすでに HTML に焼き込まれています（Server Component で fetch → 描画しているためです）。

### 変えてみる

1. 詳細ページに「一覧に戻る」`<Link href="/posts">` を追加しましょう。
2. `post.body` を `<p>` ではなく `<article>` で囲んでみましょう。
3. URL のパラメータ名を変えてみます: `[id]` → `[postId]` に変更し、`type Props = { params: Promise<{ postId: string }> }` に合わせて書き直します。ディレクトリ名とキー名が対応することを確認しましょう（確認したら元に戻してください）。

### 自分で書く

`/users/[id]/page.tsx` を自力で作ってみましょう。「Server Component でデータを取得する」の「自分で書く」で作った `/users` の一覧があるなら、そこからリンクして詳細ページに飛ぶ流れを組み立てます。

- URL: `/users/1`
- API: `https://jsonplaceholder.typicode.com/users`
- 表示: `name` と `email`、`phone`

`type Props = { params: Promise<{ id: string }> }` の型定義、`await params`、`find` の 3 点が書ければ合格です。

## まとめ

- `app/<path>/[id]/page.tsx` でディレクトリ名をブラケットにすると動的ルートになります。
- Next.js 15 では `params: Promise<{ id: string }>` の形です。`await params` で取り出します。
- 配列から 1 件取り出すのは2 章 で学んだ `find` です。URL の `string` と API 側の型（`number` など）を揃えることに注意しましょう。
- 見つからない場合の「正しい 404 ページ」は次のレッスンで扱います。
- クエリ文字列（`?key=value`）を受け取る `searchParams` は「小さなアプリを仕上げる」で初登場します。
