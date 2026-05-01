# lesson79: 動的ルート

## ゴール

- `[id]` のようなディレクトリ名で、URL の一部をパラメータとして受け取れる
- Next.js 15 以降 `params` が `Promise<...>` 型になったこと、`await params` で取り出すことを理解する
- `find` で配列から 1 件だけ取り出せる
- `searchParams` でクエリ文字列も同様に受け取れる

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

### `params` は Promise として渡ってくる

Next.js 15 から、`page.tsx` に渡される `params` は **Promise 型** になりました。即値ではなく `await` で取り出す必要があります。

型は **Next.js 16 で導入された `PageProps` のグローバル型** を使うのが最短です。`import` は不要で、`next dev` / `next build` のたびに `.next/types/` 配下にルート別の型定義が生成されます。

```tsx
export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  // id を使って処理
}
```

`PageProps<"/posts/[id]">` の文字列は、**この `page.tsx` があるルート** を書きます。`[id]` の部分がそのまま `params.id` の型に反映されます（`string` 型）。

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
4. 見つからないときは 404 を返す。

この段階ではシンプルに「一覧から `find` で取り出して表示」までを作ります。

### 実務では「単件 fetch」が原則

学習用の演習では `posts` 一覧をまるごと fetch して `find` で 1 件選び出していますが、**実務ではこの書き方を本番に持ち込みません**。一覧が 1 万件あれば「1 件のページを表示するために 1 万件をネットワーク越しに取ってくる」ことになり、転送量・実行時間ともに無駄が大きく、外部 API への過剰呼び出しにもなります。

JSONPlaceholder の場合は **`/posts/${id}` で単件取得できる** ので、実務寄りに書くなら次のようにします。

```ts
const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
if (!res.ok) {
  // 見つからなかったときの処理（notFound() など）
}
const post: Post = await res.json();
```

加えて、変更頻度の低いデータなら `{ next: { revalidate: 60 } }` のような **時間ベースの再検証** を付けたり、ビルド時に静的生成する `generateStaticParams` で **既知の `id` 一覧を SSG する** 戦略もあります。本コースでは概念に集中するため `find` のままにしますが、本番に持ち込む前に「単件 API があれば単件 fetch、なければキャッシュ戦略を考える」を頭に入れておきます。

### `searchParams` でクエリ文字列を受け取る

URL の後ろに付く `?highlight=42` のようなクエリ文字列は **`searchParams`** で受け取ります。`params`（動的ルート）と書き方が似ているので、ここで一緒に押さえます。

```tsx
export default async function PostsPage({
  searchParams,
}: PageProps<"/posts">) {
  const { highlight } = await searchParams;
  // highlight は string | string[] | undefined
}
```

- `searchParams` も `params` と同じく **Promise** で渡ってくるので `await` する
- 値の型は `string | string[] | undefined`。`?foo=1&foo=2` のように同じキーが 2 つ来ると配列になる
- `PageProps<"/posts">` のグローバル型がこれらの型を自動で持つ

::: warning `searchParams` は外部入力として扱う
URL のクエリ文字列はユーザーが自由に書き換えられる **外部入力** です。次の 3 点を守ります。

- JSX に埋めるだけなら React が自動でエスケープするので XSS は出ない
- 別の URL に組み込むときは `encodeURIComponent(value)` でエンコードしてから連結する
- `dangerouslySetInnerHTML` には **絶対に渡さない**（XSS が成立する）

入力検証の堅い書き方は「Zod でスキーマバリデーション」で扱います。
:::

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。このレッスンは「Server Component でデータを取得する」の記事一覧を前提にしています。

<details>
<summary>出発点のファイル（<code>/posts</code> 部分）</summary>

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

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
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

- `PageProps<"/posts/[id]">` でグローバル型を受けます。`import` は不要で、Next.js が `.next/types/` に自動生成します。
- `await params` してから `id` を取り出します。
- `find` で 1 件検索します。URL の `id` は `string`、API の `id` は `number` なので、`String(p.id) === id` で揃えます。
- 見つからなかった場合は、とりあえずその場で「見つからない」メッセージを返します。

### 期待出力

1. `/posts` にアクセスすると、一覧の各項目がリンクになっています。
2. 「#1 sunt aut facere ...」のような最初の記事をクリック → `/posts/1` に遷移して詳細が表示されます。
3. URL バーで `/posts/999` と打ち込むと「見つかりません」と出ます（999 番の記事は 100 件の中にないためです）。
4. `/posts/1` でページソースを表示すると、タイトルと本文がすでに HTML に焼き込まれています（Server Component で fetch → 描画しているためです）。

### 変えてみる

1. 詳細ページに「一覧に戻る」`<Link href="/posts">` を追加しましょう。
2. `post.body` を `<p>` ではなく `<article>` で囲んでみましょう。
3. URL のパラメータ名を変えてみます: `[id]` → `[postId]` に変更し、`PageProps<"/posts/[postId]">` に合わせて書き直します（グローバル型なので再ビルドすると自動で型が切り替わります）。ディレクトリ名とキー名が対応することを確認しましょう（確認したら元に戻してください）。

### 自分で書く

`/users/[id]/page.tsx` を自力で作ってみましょう。「Server Component でデータを取得する」の「自分で書く」で作った `/users` の一覧があるなら、そこからリンクして詳細ページに飛ぶ流れを組み立てます。

- URL: `/users/1`
- API: `https://jsonplaceholder.typicode.com/users`
- 表示: `name` と `email`、`phone`

`PageProps<"/users/[id]">` の型定義、`await params`、`find` の 3 点が書ければ合格です。

## まとめ

- `app/<path>/[id]/page.tsx` でディレクトリ名をブラケットにすると動的ルートになる
- Next.js 15 以降 `params` は Promise 型。`PageProps<"/posts/[id]">` で受けて `await params` で取り出す
- 配列から 1 件取り出すのは 2 章 で学んだ `find`。URL の `string` と API 側の型（`number` など）を揃えることに注意
- クエリ文字列は `searchParams` で受け取る。これも Promise なので `await` する。値は外部入力なので扱いに注意
