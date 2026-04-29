# lesson78: `next/font` でフォント

## ゴール

- Web フォントを `next/font/google` と `next/font/local` で読み込めます。
- `font.className` をルートレイアウトの `<html>` や `<body>` に付けて、全ページに適用できます。
- `display` のデフォルトが `"swap"` であること（システムフォント → Web フォントへ差し替わる）を理解できます。
- 適用前と適用後の見た目の違いを目で確認できます。

## 解説

### `<link href="...">` でフォント読み込みの何が辛いか

素の HTML では、Google Fonts の使い方として次のように書くのが定番でした。

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">
```

これだと次の問題があります。

- **外部ホストに毎回アクセス**: ユーザーのブラウザが `fonts.googleapis.com` と `fonts.gstatic.com` の 2 つに追加接続する。
- **プライバシー**: Google にユーザーの IP が送られる（国・地域によっては規制対象）。
- **フォントファイルが重い**: 全グリフが送られてしまう可能性がある。

`next/font` はこれらを解決します。

- **ビルド時に自サーバーへフォントファイルをコピー**（自ホスト化）。ユーザーは Google に直接アクセスしません。
- 使っている文字だけを含む **サブセット** を自動生成します。
- フォントの CSS 変数やクラス名を React 側から参照できるようにします。

### `next/font/google` の使い方

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

- `next/font/google` から **使いたいフォント名を名前付き import** します（`Inter`、`Roboto`、`Noto_Sans_JP` など）。
- 関数として呼び出し、`subsets` を指定します（`["latin"]` / `["japanese"]` など）。
- 戻り値の `inter` は `{ className, style, variable }` を持つオブジェクトです。
- `className` を `<html>` か `<body>` に付けると、そのフォントが配下全体に適用されます。

### `display` のデフォルトは `"swap"`

`next/font` の `display` オプションのデフォルトは **`"swap"`** です。**フォント読込中はシステムフォント（ゴシックなど）で表示し、Web フォントが届いたら差し替わる** 動きになります。

- 初期表示が速い（FOIT = Flash of Invisible Text が起きにくい）
- 代わりに、読み込み完了の瞬間にフォントが切り替わる FOUT（Flash of Unstyled Text）が起きる可能性がある

本レッスンではこのデフォルトをそのまま使います。`display` を明示する必要はありません。

### フォント差し替え時の CLS と `next/font` の自動対策

「読込中はシステムフォント → 届いたら Web フォント」と差し替わるとき、文字幅の差で **要素の高さや改行位置がずれて画面がガタッと動く** ことがあります。これは Core Web Vitals の **CLS**（Cumulative Layout Shift）として計測される、SEO 上もマイナスの現象です。

`next/font` はこの対策を **自動で** 入れています。

- フォントメトリクス（`ascent-override` / `descent-override` / `size-adjust` 等）を **ビルド時に計測** し、フォールバックフォントの寸法を Web フォントに近づけて `@font-face` に書き出す
- 結果として「フォントが入れ替わってもレイアウトが大きく動かない」状態を作ってくれる

学習者は何も書かなくて構いませんが、「実務で他のフォント読み込み手段（`<link>` 直書きなど）を使うときは CLS 対策を自分でやる必要がある」「`next/font` を使えばこの最適化が自動で付く」が `next/font` を使う一番の理由です。

複数フォントを使う場合は、メインに使う 1 つだけ `preload: true`（既定）にし、残りは `preload: false` にするとリクエスト数を減らせます。

### `next/font/local` の使い方

ローカルの `.woff2` ファイルを使う場合は次のように書きます。

```tsx
import localFont from "next/font/local";

const myFont = localFont({
  src: "./MyFont.woff2",
});
```

本コースでは Google Fonts のみを扱うので `next/font/google` に集中します。`next/font/local` は存在だけ知っておきましょう。

### 日本語フォントの注意

日本語の Google Font（`Noto Sans JP` など）は、ラテン文字より **グリフ数が遥かに多い** ため、サブセットを指定しないと重くなりがちです。本演習では `Noto_Sans_JP` を使いつつ、全体には `Inter` を、見出しにだけ日本語フォントを当てる形を試します。

### `font.className` の正体

`next/font` の `className` は、**ビルド時に生成される固有のクラス名** です（見た目は `__className_abc123` のような自動生成の文字列になります）。中身は `font-family`、`font-weight`、`font-display: swap` などの CSS 宣言が自動的に書き込まれています。

学習者が自分で `@font-face { ... }` を書く必要はありません。`className` を付けるだけで完結します。

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。`app/layout.tsx` に `next/font/google` の import と `className` を足すだけなので、このレッスンより前のプロジェクトが無くても動きます。

### 前回のプロジェクトを開く

これまでのプロジェクトを開き直しましょう。

### 手順 1: 適用前の見た目を記録する

まず、`/about` を開いてスクショを 1 枚撮っておきます（または目で覚えておきます）。これが「システムフォント」の状態です。

ASCII 図で表すと次のような雰囲気です（ブラウザやフォント設定で変わります）。

```
+---------------------------------------+
| Home | About | Todos                  |
+---------------------------------------+
|  自己紹介                             |  ← システムゴシック
|  Web フロントエンドを学び中です。    |     角ばった一般的な表示
|                                       |
|  好きなもの                           |
|  [画像] コーヒー                      |
|  [画像] 本                            |
|  [画像] 散歩                          |
+---------------------------------------+
```

日本語は OS のシステムフォント（macOS なら Hiragino、Windows なら Yu Gothic、など）で表示されています。

### 手順 2: `Inter` をルートレイアウトに適用

`app/layout.tsx` を次のように書き換えます。

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Next App",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body>
        <header className="site-header">
          <nav>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/todos">Todos</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>&copy; 2026 My Next App</p>
        </footer>
      </body>
    </html>
  );
}
```

ポイント:

- `import { Inter } from "next/font/google";` を追加。
- `const inter = Inter({ subsets: ["latin"] });` をモジュール先頭に。
- `<html>` の `className={inter.className}` を付与。

保存すると、StackBlitz のビルドが走り、プレビューが更新されます。

### 期待出力: 適用後の見た目

もう一度 `/about` を開きます。今度は **欧文部分が Inter** で表示されます。日本語はまだシステムフォントのままです。

ASCII 図で表すとこう変わります。

```
+---------------------------------------+
| Home | About | Todos   ← Inter に変化 |
+---------------------------------------+
|  自己紹介                             |  ← 日本語はシステムフォント
|  Web フロントエンドを学び中です。    |     Web → Web は Inter で表示
|                                       |
|  Cards                                |  ← ラテン文字は丸みのある Inter
+---------------------------------------+
```

英字の「Home / About / Todos」、本文中の「Web」などの **ラテン文字が Inter に変わっている** ことを、適用前スクショと見比べて確認します。

どこが違って見えるかのヒント:

- Inter は可読性重視の現代的なサンセリフ。特に数字とアルファベットの字形（例: `a`、`g`、`1`、`4`）が、システムゴシックと見分けやすいです。
- 字間（トラッキング）も少し広くなります。

### 手順 3: 日本語は `Noto_Sans_JP` を見出しに当てる

日本語の本文も Web フォントにしたい場合は、`Noto_Sans_JP` を併用します。ここでは「見出しだけ `Noto_Sans_JP`、本文は Inter + システム日本語フォント」の使い分けをやってみます。

`app/layout.tsx` を次のように拡張します。

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata = {
  title: "My Next App",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body>
        <header className={`site-header ${notoJp.className}`}>
          <nav>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/todos">Todos</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>&copy; 2026 My Next App</p>
        </footer>
      </body>
    </html>
  );
}
```

ポイント:

- 2 つのフォントを同時に呼べます。
- `Noto_Sans_JP` は **アンダースコア区切り** のインポート名です（ハイフン付きのフォント名はアンダースコアに置き換わります）。
- `weight` を `["500", "700"]` に絞って、不要なウェイトをダウンロードさせません。
- `className` は **テンプレートリテラルで複数合成** できます（`${notoJp.className}` をヘッダーだけに付与）。

> `subsets` に `"japanese"` を指定すると日本語グリフも含まれますが、**ファイルが大きくなる** ので本演習では `"latin"` のみにし、日本語はシステムフォントに任せる割り切りにします。必要な読者は `subsets: ["latin", "japanese"]` を試してみてください。

### 期待出力（再度の対比）

ブラウザで `/about` を開いて手順 2 との違いを見ます。

```
+---------------------------------------+
| Home | About | Todos   ← Noto Sans JP |
+---------------------------------------+
|  自己紹介   ← 本文は Inter + システム  |
|  ...                                  |
+---------------------------------------+
```

ヘッダーの文字が Noto Sans JP の統一感ある字形になり、本文と少し印象が変わります。ヘッダーの日本語は現時点では入っていないので、差分は欧文（Home / About / Todos）の字形で見ることになります。

### 変えてみる

1. `<html lang="ja" className={inter.className}>` を `<html lang="ja" className={notoJp.className}>` に変えて、全体が Noto Sans JP になった見た目を確認しましょう（字面が丸くなる）。
2. `Inter` の呼び出しに `{ subsets: ["latin"], weight: ["400", "700"] }` を渡してみましょう。weight の指定で読み込まれるファイル数が変わります（DevTools → Network で確認）。
3. いったん `className={inter.className}` を外して保存し、システムフォントに戻った見た目をもう一度目に焼き付けてから、付け直しましょう。切り替わりの一瞬（FOUT）が体感できることがあります。

### スコープ外

- `variable` font の詳細、CSS 変数 (`--font-inter`) 連携は扱いません。
- `display` の他の値（`"block"`、`"fallback"`、`"optional"`）は扱いません。デフォルト `"swap"` のみ。
- 有料フォントサービス（Adobe Fonts など）との連携は扱いません。

### 自分で書く

`Roboto` や `Lato` など別の Google Font を 1 つ選び、`<html>` に適用してみましょう。`import { Roboto } from "next/font/google"` のようにインポートし、`subsets: ["latin"]` を指定するだけです。字形の違いを `/about` の見出しや本文で観察します。

## まとめ

- `next/font/google` から使いたいフォントを import し、`subsets` を指定して呼び出すだけでフォントの自動最適化が有効になります。
- 戻り値の `className` を `<html>` や `<body>` に付けると、配下全体に適用されます。
- `display` のデフォルトは **`"swap"`**（先にシステムフォントで描画し、読み込みが済んだら差し替わる FOUT 挙動）です。
