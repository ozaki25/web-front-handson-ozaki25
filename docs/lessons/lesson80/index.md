# lesson80: Loading UI と Streaming

## ゴール

- `loading.tsx` がどのルートを覆うかを説明でき、配置するだけでローディング UI を挟める
- 部分的に遅いコンポーネントを `<Suspense fallback={...}>` で囲み、残りを先に表示する Streaming を書ける
- `loading.tsx` と `error.tsx` の棲み分け（待ち vs 失敗）を区別できる
- React 19 + Next.js 15 の Server Component でどう動くかを、1 つの演習を通して体感する

## 解説

### `loading.tsx` の役割

Server Component でデータ取得を行うと、`await fetch(...)` が終わるまでブラウザには前の画面が残ったり、空白の時間が発生したりします。**`loading.tsx`** を同じディレクトリに置くと、その間に自動で差し込まれるローディング UI になります。

```
app/
└── posts/
    ├── page.tsx       ← データ取得込みのページ
    └── loading.tsx    ← 取得中に表示される
```

- `loading.tsx` は **ルート全体** のローディングです。`page.tsx` が準備できるまで表示されます
- Next.js が裏で `<Suspense>` をラップしてくれているので、自分で書く必要はありません

これは「Error Boundary と Suspense」で見た React の `<Suspense>` を、Next.js がルート単位で自動配線したものだと考えると理解しやすいです。

### ルート単位のローディングだけだと粗い

`loading.tsx` はルート全体に効きます。ページの中に **速く出せる部分** と **遅い部分** が混ざっている場合、全体を待つことになってしまいます。

例: 記事ページに

- 記事本文（速い、キャッシュ済み）
- 関連記事（遅い、外部 API から取得）

があったとして、`loading.tsx` 方式だと両方揃うまで画面が出ません。これは体験として勿体ないです。

### 部分的 Streaming: `<Suspense>` で囲む

遅い部分だけ `<Suspense>` で個別に囲むと、Next.js は **先に出せるものから順に送信** してくれます。これが Streaming です。

```tsx
// app/posts/[id]/page.tsx
import { Suspense } from "react";
import RelatedPosts from "./RelatedPosts";

export default async function PostPage() {
  return (
    <>
      <h1>記事本文（すぐ出る）</h1>
      <p>...本文...</p>

      <Suspense fallback={<p>関連記事を読み込み中...</p>}>
        <RelatedPosts />
      </Suspense>
    </>
  );
}
```

- `<h1>` と `<p>` は先にブラウザに届く
- `<RelatedPosts />` はサーバー側で待ちが残っているので、その場所には `fallback` が入る
- 待ちが終わった瞬間、`<RelatedPosts />` の結果が追加で送信され、`fallback` が置き換わる

これによって「先に出せるもの」はすぐ見られるようになり、体感速度が上がります。React 19 と Next.js 15 ではこの Streaming が標準の挙動です。

### `loading.tsx` と `<Suspense>` の棲み分け

ルートの切り替わり全体のローディングは `loading.tsx`、ページ内部で部分的に遅い部分は `<Suspense>`、と使い分けます。

- **`loading.tsx`（ルート単位）**: ページ遷移直後、`page.tsx` 全体が描き終わるまでの表示
- **`<Suspense>`（コンポーネント単位）**: ページの中で遅い領域だけを個別に待たせる

両方を組み合わせると、「遷移した瞬間に `loading.tsx` → 骨格が出た後、遅い部分だけ `<Suspense>` の fallback」という自然な流れになります。

### `error.tsx` との関係

「エラーと見つからないページ」で触れた `error.tsx` は **例外の受け皿** です。待ちの受け皿である `loading.tsx` とは担当が違います。

| 何が起きた？ | 担当ファイル |
|---|---|
| データ取得中（まだ待ち） | `loading.tsx` / `<Suspense>` |
| 取得に失敗・例外が飛んだ | `error.tsx` |

両方置いておくのが実用的な構成です。

```
app/
└── posts/
    ├── page.tsx
    ├── loading.tsx
    └── error.tsx
```

### スケルトン UI を返すコツ

`loading.tsx` や `<Suspense fallback={...}>` に返す UI は、「読み込み中...」というテキストでも動きますが、**実際のレイアウトに近い骨組み** を返すと体感がぐっと上がります。

- 見出しの位置にグレーのバー
- 本文の位置に複数の細いバー
- 画像の位置に正方形のプレースホルダ

これを **スケルトン UI** と呼びます。本レッスンでは CSS で簡単な灰色ブロックを置きます。

### 実行順のイメージ

`<Suspense>` を使った Streaming を 1 度追ってみましょう。

1. ブラウザが `/posts/1` にアクセス
2. Server が `page.tsx` を評価し始める
3. `<h1>` と `<p>` の部分は即座に生成される
4. `<RelatedPosts />` の中で `await fetch(...)` に入る → Next.js は「待ちが発生した」と判断
5. ここまでの HTML を送信。`<Suspense>` の位置には `fallback` が入っている
6. Server 側で fetch が終わると、`<RelatedPosts />` の中身を追加で送信
7. ブラウザが追加分を受け取り、`fallback` を置き換える

「HTML を 1 回で返す」のではなく、「**少しずつ流す**」動きです。これが Streaming です。

## 演習

### 途中から始める場合

前のレッスンまでで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。本レッスンでは `app/streaming/` という新しいルートを切って、そこで `loading.tsx` + `<Suspense>` を両方試します。

<details>
<summary>出発点のファイル</summary>

**`app/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <nav>
          <Link href="/">Home</Link>
          {" | "}
          <Link href="/streaming">Streaming</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

**`app/page.tsx`**

```tsx
export default function Home() {
  return <h1>Home</h1>;
}
```

</details>

### ゴール

- `/streaming` を開いた直後に `loading.tsx` のローディング UI が出る
- 本文は先に描画され、遅い「関連記事」セクションだけが `<Suspense>` の fallback で待たされる
- fetch が終わると fallback が実データに置き換わる

### 手順

1. `app/streaming/page.tsx` を作り、`<Suspense>` で遅いコンポーネントを囲む
2. `app/streaming/loading.tsx` を置く
3. 遅いコンポーネント `app/streaming/RelatedPosts.tsx` を作り、わざと 2 秒遅延を入れる
4. `app/streaming/skeleton.tsx` に灰色のスケルトン UI を用意して fallback に渡す
5. ブラウザで `/streaming` を開いてナビゲーションから遷移、挙動を観察する

### 主要ファイルの完成形

**`app/streaming/page.tsx`**

```tsx
import { Suspense } from "react";
import RelatedPosts from "./RelatedPosts";
import { PostsSkeleton } from "./skeleton";

export default function StreamingPage() {
  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>Streaming デモ</h1>
      <p>
        このテキストと見出しは <strong>すぐに</strong> 表示されます。
        下の関連記事は 2 秒遅れで取得するので、先にスケルトンが出ます。
      </p>

      <h2>関連記事</h2>
      <Suspense fallback={<PostsSkeleton />}>
        <RelatedPosts />
      </Suspense>

      <p>フッター（これも先に出ます）</p>
    </div>
  );
}
```

**`app/streaming/RelatedPosts.tsx`**

```tsx
type Post = {
  id: number;
  title: string;
};

export default async function RelatedPosts() {
  // わざと 2 秒待つ
  await new Promise((r) => setTimeout(r, 2000));

  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=3",
    { cache: "no-store" }
  );
  const posts: Post[] = await res.json();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**`app/streaming/skeleton.tsx`**

```tsx
export function PostsSkeleton() {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          style={{
            height: 16,
            margin: "8px 0",
            background: "#e5e5e5",
            borderRadius: 4,
          }}
        />
      ))}
    </ul>
  );
}
```

**`app/streaming/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ opacity: 0.3 }}>読み込み中...</h1>
    </div>
  );
}
```

### 期待出力

1. ナビゲーションから `/streaming` に移動すると、**最初の一瞬** `loading.tsx` の「読み込み中...」が見える（ルート単位のローディング）
2. 続いて `page.tsx` の見出しと本文が描画され、関連記事の位置には **灰色のスケルトン** が 3 本並ぶ
3. 2 秒経つと、スケルトンが実際の関連記事リストに置き換わる
4. フッターの `<p>フッター...</p>` は関連記事を待たずに表示されている（= Streaming で先に送信されている）

DevTools の Network タブで `/streaming` のレスポンスを見ると、最初の HTML 応答と、後追いで送信される Streaming チャンクの 2 段階が確認できます。

### 変える

- `RelatedPosts.tsx` の `setTimeout` を `5000` にして遅延を長くする → スケルトン表示が長く見える
- `RelatedPosts.tsx` の `setTimeout` を消す → `<Suspense>` の fallback はほぼ一瞬で置き換わる（= 待ちがなければそもそも fallback が出ない）
- `<Suspense>` を取り除いて、`<RelatedPosts />` をそのまま書く → 関連記事が揃うまでページ全体が見えなくなる（= Streaming が効かなくなる）

### 自分で書く

- `app/streaming/error.tsx` を追加し、`RelatedPosts` の中で `throw new Error("取得失敗")` を返すようにして、エラー時の挙動を観察する
- スケルトン UI をもう少し作り込む（タイトル用の太いバー + 本文用の細いバー 2 本の組み合わせ）
- `app/streaming/` の中に **2 つの遅いコンポーネント** を並べて、それぞれ別の `<Suspense>` で囲む → 片方が終わったらそこだけ先に描画されることを確認する

## まとめ

- `loading.tsx` はルート全体のローディング UI。ファイルを置くだけで `<Suspense>` が自動でラップされる
- 部分的に遅いところは、ページ内で個別に `<Suspense fallback={...}>` で囲む。先に出せるものから送信される（Streaming）
- `loading.tsx` / `<Suspense>` は「待ち」、`error.tsx` は「失敗」。担当が違う
- fallback には「読み込み中...」のテキストより、**スケルトン UI** を返すと体感が良くなる
- React 19 + Next.js 15 ではこの仕組みが標準化され、Server Component と組み合わせて自然に書ける
- これでコースのコア内容は揃いました。あとはサイトを仕上げて Vercel にデプロイすれば、他の人に見せられるアプリになります
