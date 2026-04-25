# lesson103: 画像とフォントの最適化

## ゴール

- 画像が **LCP の最重要要因** であることを理解する
- 画像最適化の 5 つの技（フォーマット / サイズ / 遅延読み込み / プレースホルダ / `<picture>`）を知る
- `next/image` がやってくれる自動最適化の中身を説明できる
- フォントが **CLS** と LCP にどう効くかを理解する
- `next/font` / `font-display: swap` / preload で FOIT / FOUT を抑える
- Self-hosted フォントと Google Fonts の使い分けを知る

## 解説

### 画像が LCP の最重要要因

ほとんどのページで **LCP（最大コンテンツ）はヒーロー画像** が選ばれます。だから「LCP を改善する」は事実上「画像を最適化する」とほぼ同義です。

### 画像最適化 5 つの技

#### 1. フォーマット: WebP / AVIF を使う

JPEG / PNG はもう古い選択肢です。現代は:

- **WebP**: ブラウザ対応率 95% 超。JPEG より 25-35% 軽い
- **AVIF**: 比較的新しい。WebP よりさらに 30% 軽い。ブラウザ対応率は約 95%

両者は **可逆 / 非可逆** 両方サポート。古いブラウザ用に JPEG をフォールバックで残すのが定番です。

#### 2. サイズ: 表示サイズに合わせる

3000×2000 の写真を `<img width="300" height="200">` で表示すると、**3000×2000 のファイルがそのまま転送** されます。これが LCP を遅らせる最大の原因です。

対策:

- **複数解像度** を用意して `srcset` で適切な一枚を選ばせる
- ビルド時に **自動リサイズ** するツール（`next/image`、`vite-plugin-image-optimizer` 等）を使う

```html
<img
  src="/photo-400.jpg"
  srcset="/photo-400.jpg 400w, /photo-800.jpg 800w, /photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="..."
/>
```

`sizes` は CSS のメディアクエリと同じ書き方で「表示サイズの目安」を伝えます。ブラウザがそれを見て `srcset` から最適な 1 枚を選びます。

#### 3. 遅延読み込み: `loading="lazy"`

画面外の画像は **読み込みを遅らせて** 後から取りに行きます。

```html
<!-- ページ最初に見える画像（first view）: eager -->
<img src="/hero.jpg" loading="eager" fetchpriority="high" alt="..." />

<!-- 画面外の画像: lazy -->
<img src="/below-fold.jpg" loading="lazy" alt="..." />
```

- **`loading="lazy"`**: ブラウザがスクロール位置に応じて読み込み開始
- **`loading="eager"`**: 即時読み込み（既定）
- **`fetchpriority="high"`**: ヒーロー画像で優先度を上げる（LCP の最強の武器）

`loading="lazy"` を **first view の画像に付けてはいけません**（LCP が悪化）。ページの最重要画像には `fetchpriority="high"` を付けるのが 2026 年の定番です。

#### 4. プレースホルダ: ぼかし画像の先出し

LQIP（Low Quality Image Placeholder）と呼ばれる手法です。本物が読み込まれるまで、極小サイズのぼかし画像を表示しておきます。

```html
<!-- placeholder-blur と 本物の差し替え -->
<img
  src="/placeholder-blur.jpg"  /* 数 KB の小さい画像 */
  data-src="/full.jpg"          /* 本物 */
  ...
/>
```

`next/image` の `placeholder="blur"` がこれを自動でやってくれます。

#### 5. `<picture>` でフォーマットを分岐

WebP / AVIF をサポートしていないブラウザに JPEG をフォールバックで返すには `<picture>` を使います。

```html
<picture>
  <source srcset="/photo.avif" type="image/avif" />
  <source srcset="/photo.webp" type="image/webp" />
  <img src="/photo.jpg" alt="..." width="800" height="600" />
</picture>
```

ブラウザは上から順に対応形式を探し、最初に対応している `<source>` を使います。すべて非対応なら最後の `<img>` を使います。

### `next/image` は全部やってくれる

5 章 で扱った `<Image>` コンポーネントは、上記 5 つの最適化を **設定なしで** 全部やります。

- フォーマット自動変換（WebP / AVIF）
- 表示サイズに応じた `srcset` 生成
- `loading="lazy"`（first view を除く自動判定は手動が確実）
- `placeholder="blur"` でぼかし
- `<picture>` 相当のフォールバック

Next.js 以外の環境では同等の自動化は手作業が必要なので、Next.js が選ばれる理由の 1 つになっています。

### フォントが CLS と LCP に効く

フォントの読み込み挙動が悪いと:

- **CLS 悪化**: フォントが切り替わった瞬間にテキスト幅が変わってレイアウトがズレる
- **LCP 悪化**: テキストが LCP 要素なら、フォント読み込み完了まで描画されない

主な現象:

- **FOIT**（Flash of Invisible Text）: フォント読み込み中、テキストが **見えない**
- **FOUT**（Flash of Unstyled Text）: フォント読み込み中、フォールバックフォントで一瞬表示 → 切り替わり

### `font-display: swap`

CSS の `@font-face` で `font-display: swap` を指定すると、**FOUT** モードになります。フォールバックフォントで先に表示し、本物のフォントが届いたら差し替えます。

```css
@font-face {
  font-family: "MyFont";
  src: url("/fonts/myfont.woff2") format("woff2");
  font-display: swap;
}
```

`swap` は LCP に有利（テキストが先に表示される）ですが、CLS は出やすくなります。トレードオフです。`optional` を選ぶと「100ms 以内に読み込めなければ諦める」という慎重派の挙動になります。

### `<link rel="preload">` で先読み

クリティカルなフォント（first view で使う）は **`<link rel="preload">`** でブラウザに「優先して読んでね」と伝えます。

```html
<link
  rel="preload"
  href="/fonts/myfont.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

これで HTML パース中に並行して読み込みが始まり、CSS で `@font-face` が見つかった時にはほぼ準備完了の状態になります。LCP / CLS 双方に効きます。

### `next/font` は全部やってくれる

Next.js では `next/font` が自動で:

- フォントをビルド時にダウンロード（self-host 化、Google Fonts への外部リクエスト削減）
- サブセット化（必要な文字だけ抽出）
- preload リンクを HTML に自動挿入
- `font-display: swap` を既定にする
- フォールバックフォントの幅メトリクスを近づけて CLS を抑制

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

`next/font/google` は Google Fonts を自動 self-host 化、`next/font/local` は手元の `.woff2` をビルドに組み込みます。

### Self-host vs Google Fonts CDN

| 方式 | 利点 | 欠点 |
|---|---|---|
| Google Fonts CDN（`<link href="fonts.googleapis.com">`） | セットアップ簡単 | 外部ドメインへの追加 DNS / 接続 / プライバシー懸念 |
| Self-host（自サーバーから配信） | 同一オリジンで速い、プライバシーに有利 | 自分でファイルを用意する必要 |
| `next/font/google` | Google Fonts を自動 self-host 化（両方の良いとこ取り） | Next.js 環境限定 |

2026 年の主流は **Self-host または `next/font`**。Google Fonts の `<link>` 直貼りはレガシー扱いです。

### サブセット化

日本語フォント（`Noto Sans JP` 等）はファイルが MB 単位で巨大です。**実際に使う文字だけを抽出した「サブセット」** を配信しないと一気に LCP / CLS が悪化します。

- ラテン文字だけのページなら `subsets: ["latin"]` で 30KB 程度
- 日本語ページは `Noto Sans JP` の **第一水準漢字 + 平仮名 + 片仮名 + 数字 + 記号** に絞ったサブセットを用意（数百 KB 程度）

ビルド時にサブセット化するツール（`subset-font` パッケージ等）や、`next/font/google` の `subsets` 指定で自動化できます。

## 演習

### ゴール

- 既存の Next.js プロジェクト（または新規）に `<Image>` を入れる前後で Lighthouse の LCP を比較する
- `next/font/google` で Google Fonts を self-host 化する
- DevTools Network タブで画像 / フォントの読み込み順序を観察する

### 手順 1: 画像最適化の前後比較（Next.js）

1. 5 章 で作った Next.js プロジェクト or 新規 `create-next-app` で:

   ```bash
   npx create-next-app@latest perf-image --typescript --tailwind=false --app
   cd perf-image
   ```

2. `app/page.tsx` に大きな画像を **素の `<img>` で** 配置（最初は最適化なし）:

   ```tsx
   export default function Page() {
     return (
       <main>
         <h1>画像比較</h1>
         <img
           src="https://picsum.photos/2400/1600"
           alt="サンプル"
           style={{ width: 600, height: 400 }}
         />
       </main>
     );
   }
   ```

3. `npm run build && npm run start` でビルド済みを起動し、Lighthouse を Mobile で計測。LCP / 全体スコアをメモ

4. `<img>` を `<Image>` に置き換え:

   ```tsx
   import Image from "next/image";

   export default function Page() {
     return (
       <main>
         <h1>画像比較</h1>
         <Image
           src="https://picsum.photos/2400/1600"
           alt="サンプル"
           width={600}
           height={400}
           priority
         />
       </main>
     );
   }
   ```

   `next.config.ts` に `picsum.photos` を許可:

   ```ts
   const nextConfig = {
     images: {
       remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
     },
   };
   export default nextConfig;
   ```

5. もう一度ビルド + Lighthouse。LCP が大幅に改善するはず（数秒 → 1 秒以下）

### 手順 2: `next/font` でフォント

`app/layout.tsx`:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

ビルドして Network タブで:

- 自分のドメイン（`localhost:3000`）から `.woff2` が配信される
- `fonts.googleapis.com` への外部リクエストが消える
- HTML の `<head>` に `<link rel="preload" as="font">` が自動挿入されている

### 手順 3: 画像のフォーマット確認

Network タブの **Type** 列で:

- `<img>` 直書き: `jpeg` / `png`
- `<Image>`: `webp` / `avif`（ブラウザ対応に応じて）

「Response Headers」の `content-type` も確認できます。

### 期待出力

- 同じ画像でもファイルサイズが半分以下に縮む
- LCP の数値が劇的に改善
- フォントの FOIT / FOUT がほぼ気にならないレベル

### 変える

- `<Image priority>` を外してみる。LCP がやや悪化する（`priority` は first view の画像に必須）
- `next/font/google` の `display: "swap"` を `display: "block"` に変えると、FOIT になることを確認
- `<Image>` の `placeholder="blur"` を試す（ローカル画像を使う場合のみ）。読み込み中にぼかしが見える

### 自分で書く

- 普段使う画像を `<picture>` でラップして、AVIF / WebP / JPEG のフォールバック構造を手書きで作る
- `<link rel="preload">` を `<head>` に追加して、特定の画像 / フォントを先読みさせる

## まとめ

- 画像が **LCP の最重要要因**。最適化が CWV を一気に改善する
- 5 つの技: **フォーマット / サイズ / 遅延読み込み / プレースホルダ / `<picture>`**
- **`next/image`** がこれら 5 つを自動でやる。Next.js 以外は手作業
- フォントは **CLS と LCP** に効く。FOIT / FOUT を理解する
- **`font-display: swap`** + **`<link rel="preload">`** が基本
- **`next/font`** は Google Fonts の self-host 化 + subset + preload を自動化
- これで章 7 の Core Web Vitals 3 連作が完了。次は **Git と GitHub ワークフロー** に進む
