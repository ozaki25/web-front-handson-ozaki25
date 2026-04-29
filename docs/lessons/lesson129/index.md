# lesson129: OGP と SEO 実践

## ゴール

- OGP（Open Graph）タグと Twitter Card で **シェアされた時の見栄え** を制御できる
- Next.js の Metadata API（**Metadata API のレッスン**の発展）で OGP を動的に生成できる
- `sitemap.xml` と `robots.txt` の役割と Next.js での生成方法を知る
- JSON-LD（構造化データ）でリッチリザルトを狙える
- Google Search Console の使い方が分かる

## 解説

### OGP（Open Graph Protocol）

Twitter（X）/ Facebook / LINE / Slack / Discord などで URL を共有した時、**タイトル + 説明 + 画像** がカード形式で表示されます。これを制御するのが OGP です。

```html
<head>
  <title>記事のタイトル</title>
  <meta property="og:title" content="記事のタイトル" />
  <meta property="og:description" content="この記事は OGP の使い方について書きます" />
  <meta property="og:image" content="https://example.com/og.png" />
  <meta property="og:url" content="https://example.com/post/1" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="My Blog" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@my_handle" />
</head>
```

ポイント:

- `og:image` は **絶対 URL** を渡す（相対パスは効かない）
- 画像サイズは **1200 x 630px** が推奨（Twitter / Facebook 共通）
- `og:type` は `website` / `article` / `book` / `profile` などから選ぶ
- Twitter Card は OGP を補完する。`summary_large_image` で大きく表示

### Next.js の Metadata API（おさらい + 発展）

**Metadata API のレッスン** で `metadata` を export する書き方を扱いました。OGP も同じ仕組みで書けます。

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${slug}`,
      siteName: "My Blog",
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      creator: "@my_handle",
    },
  };
}
```

### `metadataBase` を必ず指定

OGP の画像 URL を相対パスで書きたい時は、**ルートで `metadataBase`** を指定します。

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
};
```

これがないと相対パスが効かず、開発時のローカル URL（`http://localhost:3000`）が混入する事故が起きます。

### 動的 OGP 画像（`opengraph-image.tsx`）

Next.js 13.3+ から、**ファイルベースで OGP 画像を生成** できます。

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 60,
          background: "linear-gradient(135deg, #1e3a8a, #06b6d4)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>{post.title}</div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.85 }}>
          {post.excerpt}
        </div>
      </div>
    ),
    { ...size },
  );
}
```

これで **記事ごとに違う OGP 画像** が自動生成されます。Vercel 上では Edge Runtime で動き、軽量。

### `sitemap.xml`

検索エンジンに「**このサイトにこういう URL があるよ**」と教えるファイル。Google は基本クロールで見つけてくれますが、**サイトが大きい / 内部リンクが少ない** 場合は sitemap が大事です。

#### Next.js の `app/sitemap.ts`

```ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    {
      url: "https://example.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://example.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...posts.map((p) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
```

ビルド時に `/sitemap.xml` が自動生成されます。

#### 巨大サイトでは分割

URL が 50,000 件 / 50MB を超える場合は **sitemap index** に分割します。Next.js では `app/sitemap.ts` を `[id]/sitemap.ts` 配列で複数 export することで対応できます。

### `robots.txt`

クローラーへの指示。`/admin` などをクロールから除外します。

#### Next.js の `app/robots.ts`

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

ビルドで `/robots.txt` が自動生成されます。

::: warning robots.txt は「お願い」
robots.txt は **善意のクローラーが従う** だけで、強制力はありません。本当に隠したい URL は **認証で守る** / **`X-Robots-Tag: noindex` ヘッダ** / **`<meta name="robots" content="noindex">`** を使います。
:::

### 構造化データ（JSON-LD）

検索結果に **リッチリザルト**（評価星 / レシピ写真 / FAQ アコーディオンなど）を出すための仕組み。Schema.org のスキーマを **JSON-LD** で埋め込みます。

#### 記事（Article）

```tsx
// app/blog/[slug]/page.tsx
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{post.title}</h1>
      {/* ... */}
    </article>
  );
}
```

#### よく使うスキーマ

| `@type` | 用途 |
|---|---|
| `Article` / `BlogPosting` / `NewsArticle` | 記事 |
| `Product` | EC 商品（価格 / 在庫） |
| `Recipe` | レシピ |
| `FAQPage` | よくある質問（手風琴 UI で出る） |
| `Organization` | 会社情報 |
| `BreadcrumbList` | パンくず |

#### 検証

[Google リッチリザルトテスト](https://search.google.com/test/rich-results) で URL を入れると、認識される構造化データが見られます。

### Google Search Console

「Google の目線で自分のサイトがどう見えているか」を見るツール。

#### できること

- どの検索クエリで何位に出ているか
- どのページがインデックスされているか / エラーがあるか
- Core Web Vitals の実フィールドデータ
- `sitemap.xml` の登録 / クロール状況確認
- モバイルユーザビリティの問題検出

#### 設定

1. Search Console にプロパティを追加（ドメインまたは URL プレフィックス）
2. 所有権の確認（DNS TXT レコード / HTML タグ / Google Analytics アカウント連携）
3. **`sitemap.xml` を登録**
4. 数日待つとデータが集まり始める

### canonical URL

「同じ内容のページが複数 URL で見える」場合、検索エンジンに **正規 URL** を伝えるのが `<link rel="canonical">`。

```ts
export const metadata: Metadata = {
  alternates: {
    canonical: "https://example.com/blog/post-1",
  },
};
```

クエリパラメータ違い / 大文字小文字違いで重複インデックスされないように。

### hreflang（多言語サイト）

同じコンテンツを複数言語で出す場合の指定。

```ts
export const metadata: Metadata = {
  alternates: {
    canonical: "https://example.com/en/about",
    languages: {
      "en": "https://example.com/en/about",
      "ja": "https://example.com/ja/about",
      "x-default": "https://example.com/en/about",
    },
  },
};
```

これがあると Google が「英語ユーザーには英語版、日本語ユーザーには日本語版」を出してくれます。

### Core Web Vitals と SEO

Google は **Core Web Vitals**（**パフォーマンス計測のレッスン**で扱う指標）を **ランキング要因** に組み込んでいます。LCP / INP / CLS が悪いと検索順位が下がる可能性があるので、**SEO は速度と切り離せない**。

### よくある事故

- `og:image` が **相対パス** で実体が読めない → `metadataBase` を設定する
- `noindex` を本番に持ち込んでしまう → 環境変数で制御する習慣を
- `sitemap.xml` に **404 の URL** が残る → 動的生成にする
- 構造化データにスキーマと合わない値を入れる → リッチリザルトテストで検証
- `canonical` が **自分自身を指していない** → 正しい URL に揃える

## 演習

### ゴール

- Next.js プロジェクトに OGP / sitemap / robots / JSON-LD を一通り入れる
- リッチリザルトテストで構造化データが認識されるところまで持っていく

### 手順 1: 新規プロジェクト

```bash
npx create-next-app@latest seo-sample --ts --app
cd seo-sample
```

### 手順 2: ルートに metadataBase と OGP

`app/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: { default: "Demo Blog", template: "%s | Demo Blog" },
  description: "Next.js Metadata API の演習",
  openGraph: {
    type: "website",
    siteName: "Demo Blog",
    locale: "ja_JP",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
```

### 手順 3: 動的 OGP 画像

`app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "linear-gradient(135deg,#1e3a8a,#06b6d4)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Demo Blog
      </div>
    ),
    { ...size },
  );
}
```

### 手順 4: sitemap と robots

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://example.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://example.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin/" }],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 手順 5: JSON-LD

`app/page.tsx`:

```tsx
export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Demo Blog",
    url: "https://example.com",
  };

  return (
    <main style={{ padding: 24 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>Demo Blog</h1>
      <p>SEO 演習</p>
    </main>
  );
}
```

### 手順 6: 確認

```bash
npm run dev
```

ブラウザで以下にアクセス:

- `http://localhost:3000/sitemap.xml` → XML が出る
- `http://localhost:3000/robots.txt` → robots テキストが出る
- `http://localhost:3000/opengraph-image` → 画像が出る
- ページのソースを表示すると `<meta property="og:image" content="..." />` や `<script type="application/ld+json">` が含まれている

### 期待出力

| パス | 内容 |
|---|---|
| `/sitemap.xml` | 2 URL を含む sitemap |
| `/robots.txt` | `Disallow: /admin/` を含む |
| `/opengraph-image` | 1200x630 の PNG |
| ページソース | OGP / Twitter Card / JSON-LD のタグが入る |

### 変える

- `app/blog/[slug]/page.tsx` を作って `generateMetadata` で記事ごとに OGP を変える
- 動的 OGP 画像で記事タイトルを反映する
- JSON-LD を `Article` に変えて、リッチリザルトテストで認識されるか試す

### 自分で書く（任意）

- `BreadcrumbList` の JSON-LD を作って、検索結果のパンくずを狙う
- `FAQPage` を作って、よくある質問アコーディオンの表示を狙う
- 多言語サイトを `hreflang` で構成し、Search Console で確認する

## まとめ

- **OGP / Twitter Card** で SNS シェア時の見栄えを制御。`og:image` は **絶対 URL / 1200x630**
- Next.js は **Metadata API** に OGP / Twitter Card / canonical / hreflang が揃っている
- **`metadataBase`** を必ず設定する（相対パス事故防止）
- `app/opengraph-image.tsx` で **動的 OGP 画像** を JSX で生成
- `app/sitemap.ts` / `app/robots.ts` でファイルベースに `sitemap.xml` / `robots.txt` を生成
- **JSON-LD**（構造化データ） でリッチリザルトを狙う。Article / Product / FAQPage / BreadcrumbList が定番
- **Google Search Console** で順位 / インデックス状況 / Core Web Vitals を確認
- Core Web Vitals は **SEO のランキング要因**。速度と SEO は切り離せない
