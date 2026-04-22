# lesson79: Metadata API で SEO を整える

## ゴール

- ページの `<title>` や `<meta>` が検索結果・SNS シェア表示に直結することを理解する
- Next.js App Router の **Metadata API** を使い、静的 `metadata` export を書ける
- `generateMetadata` で動的にタイトルや説明文を組み立てられる
- `title.template` を使ってサイト全体の「タイトル装飾」を揃えられる
- favicon / apple-touch-icon を `app/` 配下のファイル配置だけで反映できる

## 解説

### 「SEO を整える」とは

SEO（Search Engine Optimization）は、検索エンジンに正しく理解されて、検索結果やシェア時の見栄えを良くする取り組みです。本コースで扱うのはその入り口、**HTML の `<head>` を適切に書く** ことです。

- `<title>`: ブラウザタブの文字、検索結果の見出し
- `<meta name="description">`: 検索結果の説明文
- `<meta property="og:..." />`（Open Graph）: Twitter / Facebook / Slack などでシェアしたときのカード表示
- `<link rel="icon">`: タブの左に出る favicon

これらを 1 ページずつ手書きするのはつらいので、Next.js は **Metadata API** という仕組みを用意しています。

### Metadata API の 2 系統

書き方は 2 つ。どちらを使うかは「ページの内容に応じて変わるか」で決めます。

1. **静的 metadata**: ページの内容が決まっている（ホーム / About / 利用規約）
2. **動的 `generateMetadata`**: ページの内容が URL パラメータや fetch で変わる（記事ページ / ユーザーページ）

### 静的 `metadata` export

`page.tsx` / `layout.tsx` の中で `metadata` という名前で export します。`Metadata` という型が `next` から import できます。

```tsx
// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "このサイトについて",
};

export default function AboutPage() {
  return <h1>About</h1>;
}
```

Next.js が自動で `<head>` に差し込んでくれます。ビルド時にチェックされるので、型が違えばすぐ気付けます。

### 動的 `generateMetadata`

URL から情報を取ってタイトルを作るときに使います。

```tsx
// app/posts/[id]/page.tsx
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const post = await res.json();
  return {
    title: post.title,
    description: post.body.slice(0, 120),
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  return <h1>記事 ID: {id}</h1>;
}
```

- `generateMetadata` は非同期関数にできます
- `params` は Next.js 15 以降 `Promise` なので `await` してから読む（「動的ルート」で扱った形と同じ）
- 戻り値は `Metadata` 型のオブジェクト

`page.tsx` の中で **`metadata` と `generateMetadata` の両方を書くことはできません**。どちらか一方を選びます。

### `title.template` でサイト全体を揃える

記事ごとのタイトルを「記事タイトル | サイト名」の形に揃えたい、というのはよくあります。これは `layout.tsx` で `title.template` を書くだけで実現できます。

```tsx
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "My Next Site",
    template: "%s | My Next Site",
  },
  description: "Next.js App Router の学習用サイト",
};
```

- `default`: ページ側でタイトルを書いていないときに使う既定値
- `template`: ページ側が `title: "記事タイトル"` を返したとき、`%s` に代入されて `記事タイトル | My Next Site` になる

ページ側で `title` を書かなかった場合は `default` がそのまま使われます。サイト全体のトーンを 1 箇所で管理できる仕組みです。

### Open Graph を足す

SNS でシェアしたときの見え方は `openGraph` プロパティで整えます。

```tsx
export const metadata: Metadata = {
  title: "My Next Site",
  description: "Next.js App Router の学習用サイト",
  openGraph: {
    title: "My Next Site",
    description: "Next.js App Router の学習用サイト",
    url: "https://example.com",
    siteName: "My Next Site",
    locale: "ja_JP",
    type: "website",
  },
};
```

最低限 `title` / `description` / `url` / `type` があれば見られる形になります。画像（`openGraph.images`）はあると嬉しいですが、本レッスンでは省きます。

### favicon / apple-touch-icon は **ファイル配置だけで OK**

Next.js App Router は、`app/` 直下に **特定のファイル名** で画像を置くだけで自動的に `<link>` タグを生成します。

- `app/favicon.ico` → `<link rel="icon">`
- `app/icon.png` / `app/icon.svg` → 同上
- `app/apple-icon.png` → `<link rel="apple-touch-icon">`

`<head>` を手で書く必要はありません。画像ファイルを置くだけです。

### Server Component の前提

`metadata` / `generateMetadata` は **Server Component 側** で書きます。`"use client"` を付けたファイルには書けません。動的にしたい値がクライアント state から来る、というケースはほぼ無いので、自然と Server Component 側にまとまります。

## 演習

### 途中から始める場合

前のレッスンまでで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。本レッスンは「ページを増やしてリンクで移動する」で作った `/` と `/about`、「動的ルート」で作った `/posts/[id]` を想定しています。無ければ新規に作ってから始めてください。

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
          <Link href="/about">About</Link>
          {" | "}
          <Link href="/posts/1">Post #1</Link>
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

**`app/about/page.tsx`**

```tsx
export default function About() {
  return <h1>About</h1>;
}
```

**`app/posts/[id]/page.tsx`**

```tsx
type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  return <h1>記事 ID: {id}</h1>;
}
```

</details>

### ゴール

- `app/layout.tsx` に `title.template` 付きの metadata を置いて、サイト全体のタイトル装飾を揃える
- `app/about/page.tsx` に静的 metadata を追加する
- `app/posts/[id]/page.tsx` に `generateMetadata` を追加し、記事タイトルを `<title>` に反映する
- ブラウザタブの文字が各ページで変わることを確認する

### 手順

1. `app/layout.tsx` に `metadata` export を追加（`title.template` + `description` + `openGraph`）
2. `app/about/page.tsx` に静的 `metadata` export を追加
3. `app/posts/[id]/page.tsx` に `generateMetadata` を追加（`jsonplaceholder.typicode.com` から記事を取得）
4. `app/icon.svg` を置いて favicon が反映されるか確認（任意）

### 主要ファイルの完成形

**`app/layout.tsx`**

```tsx
import type { Metadata, ReactNode } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "My Next Site",
    template: "%s | My Next Site",
  },
  description: "Next.js App Router の学習用サイト",
  openGraph: {
    title: "My Next Site",
    description: "Next.js App Router の学習用サイト",
    url: "https://example.com",
    siteName: "My Next Site",
    locale: "ja_JP",
    type: "website",
  },
};

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
          <Link href="/about">About</Link>
          {" | "}
          <Link href="/posts/1">Post #1</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

注: `ReactNode` は本来 `react` から import しますが、上の例ではシンプルさのため `next` からの型 import にまとめています。実案件では `import type { ReactNode } from "react";` に分けて書いても構いません。

**`app/page.tsx`**

```tsx
export default function Home() {
  return <h1>Home</h1>;
}
```

この `page.tsx` は `metadata` を書いていないので、`<title>` は layout の `default` である `My Next Site` がそのまま使われます。

**`app/about/page.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "このサイトについて",
};

export default function About() {
  return <h1>About</h1>;
}
```

**`app/posts/[id]/page.tsx`**

```tsx
import type { Metadata } from "next";

type Post = {
  id: number;
  title: string;
  body: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    { cache: "force-cache" }
  );
  if (!res.ok) {
    return {
      title: "記事が見つかりません",
    };
  }
  const post: Post = await res.json();
  return {
    title: post.title,
    description: post.body.slice(0, 120),
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    { cache: "force-cache" }
  );
  const post: Post = await res.json();

  return (
    <>
      <h1>#{post.id} {post.title}</h1>
      <p>{post.body}</p>
    </>
  );
}
```

### 期待出力

ブラウザで次のように動きます。

1. `/` を開く → タブのタイトルが `My Next Site`
2. `/about` を開く → タブのタイトルが `About | My Next Site`（template が効いている）
3. `/posts/1` を開く → タブのタイトルが `sunt aut facere ... | My Next Site` のように、記事タイトルが入る
4. DevTools の Elements タブで `<head>` を開くと、`<title>` / `<meta name="description">` / `<meta property="og:title">` などが入っていることが確認できる

### 変える

- `layout.tsx` の `title.template` を `"%s - My Next Site"` に変える → 区切り文字が `|` から `-` になる
- `about/page.tsx` の `description` を変える → `/about` を開いた状態で `<head>` の `<meta name="description">` が変わる
- `posts/[id]/page.tsx` の `generateMetadata` で `description` を `body.slice(0, 40)` に短く変えて、切り詰めを確かめる

### 自分で書く

- `/about` の metadata に `openGraph` を追加し、「About ページ」専用の OG タイトルと説明を書く
- `generateMetadata` を **try / catch で囲む**（fetch が失敗したときに `title: "エラー"` を返す）
- 新しいページ `app/privacy/page.tsx` を追加し、静的 metadata で `title: "プライバシーポリシー"` を設定する

## まとめ

- `<title>` / `<meta>` / Open Graph が SEO とシェア表示を左右する
- 静的には `export const metadata: Metadata = { ... }`、動的には `export async function generateMetadata(...)` を書く
- `layout.tsx` に `title.template` を置くと、サイト全体のタイトル装飾を 1 箇所で決められる
- favicon / apple-touch-icon は `app/` 配下に特定のファイル名で置くだけ
- `metadata` / `generateMetadata` は Server Component 側でだけ書く
- 次のレッスンでは、ページの待ち時間をより良く見せる **Loading UI と Streaming** を扱う
