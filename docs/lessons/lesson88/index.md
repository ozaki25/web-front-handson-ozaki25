# lesson88: Tailwind CSS の紹介

## ゴール

- Tailwind CSS v4 の存在と基本的な使い方を知る
- 本コースの「素の CSS で書く」方式との違いを説明できる
- Next.js プロジェクトに Tailwind v4 を導入する手順を観察できる
- 本コースを終えた後の「次のステップ」として判断できる

## 解説

### 本コースのスタンス

ここまで 1 章 から 5 章 まで、**すべて素の CSS**（`.css` ファイルに `.card { padding: 16px; }` のように書く方式）で進めてきました。ボックスモデル、Flexbox、Grid、Position、Transition まで「CSS 自体の仕組み」を理解することを優先してきました。

一方、実務の現場では **Tailwind CSS** や **CSS Modules**、**CSS-in-JS** など、さまざまな書き方が選ばれます。本コースではその中から **Tailwind** を最後に紹介だけしておきます。

**本コースの結論**: 「Tailwind は **次のステップ** として学ぶ選択肢」。本コースの自己紹介 / TODO プロジェクトには **持ち込みません**。

### Tailwind CSS とは

Tailwind は **ユーティリティファースト** の CSS フレームワークです。`margin: 16px` のような個別のスタイルをコード上に書かず、`m-4` のような短いクラス名を HTML に重ねて見た目を作ります。

素の CSS で書いたコード:

```html
<div class="card">
  <h2 class="card-title">タイトル</h2>
  <p class="card-body">本文</p>
</div>
```

```css
.card {
  padding: 16px;
  background: white;
  border-radius: 8px;
}
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}
.card-body {
  color: #666;
}
```

Tailwind で書くと:

```html
<div class="p-4 bg-white rounded-lg">
  <h2 class="text-lg font-bold">タイトル</h2>
  <p class="text-gray-600">本文</p>
</div>
```

CSS ファイルを書かずに、HTML（JSX）側のクラス名だけで見た目を組み立てます。

長所:

- クラス名の衝突がない（`.card` の名前を考えなくてよい）
- 小さな変更が HTML 内で完結する
- VS Code 拡張で補完が強い

短所:

- クラス名が長くなる
- 「なぜこのプロパティなのか」が CSS の知識無しだと理解しづらい（だから本コースでは素の CSS から学んだ）

### Tailwind v4 の特徴（2025 年 GA）

本レッスンは **Tailwind v4** 準拠で紹介します。v3 から **設定方法が大きく変わった** ため、古い記事のコピペは通用しません。

主な変更点:

- **CSS ファイル 1 行で導入**:
  ```css
  @import "tailwindcss";
  ```
  v3 の `@tailwind base; @tailwind components; @tailwind utilities;` の 3 行は廃止
- **`init` コマンド廃止**: v3 の `npx tailwindcss init -p` で `tailwind.config.ts` を生成する手順は不要
- **PostCSS プラグイン名の変更**: `postcss.config.mjs` に `@tailwindcss/postcss` を指定する
- **Vite 用プラグイン**: Vite プロジェクトでは `@tailwindcss/vite`（PostCSS 経由ではない）
- **パフォーマンス大幅改善**: ビルドが高速、開発時のホットリロードも速い

`create-next-app --tailwind` で新規プロジェクトを作ると、デフォルトで Tailwind v4 の設定が入ります。古いチュートリアルを見る前に、まずは `create-next-app` 生成物を観察するのが確実です。

## 演習

### 途中から始める場合

このレッスンは別プロジェクトで Tailwind v4 を観察する独立した内容です。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。既存の 5 章 プロジェクトには持ち込まないため、ここまでのレッスンの進捗は不要です。

### ゴール

- `create-next-app --tailwind` で **別プロジェクト** を作り、Tailwind v4 がどう設定されているかを観察する
- 本コースのプロジェクトには **持ち込まない**（素の CSS 資産を壊さないため）。別プロジェクトで観察するだけで十分

### 手順

1. ローカルで `npx create-next-app@latest my-tailwind-sample --tailwind --typescript` を実行する（Tailwind v4 入りのプロジェクトが生成されます）
2. ローカル環境が使えない場合は、以降に載せる各ファイルのコードを読んで構成を把握するだけでも構いません（StackBlitz の Next.js テンプレートには Tailwind が入っていません）
3. プロジェクト内の以下のファイルを観察する
   - `app/globals.css`
   - `postcss.config.mjs`（または `.js`）
   - `package.json` の `devDependencies`
4. 任意で、`app/page.tsx` にユーティリティクラスを 1〜2 個書いてみる（`@theme` などカスタマイズは扱わない）

### `app/globals.css`（観察対象）

Tailwind v4 の導入は、CSS ファイル冒頭に **この 1 行だけ**:

```css
@import "tailwindcss";
```

v3 の時代は 3 行書いていました:

```css
/* v3（古い、書かない） */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

v4 では `@import "tailwindcss";` に統合されています。

### `postcss.config.mjs`（観察対象）

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

v3 で必要だった `autoprefixer` は **v4 ではプラグイン内に内蔵** されたため、別途書かなくて済むようになりました。

### `package.json` の `devDependencies`（観察対象）

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

`tailwind.config.ts` は **v4 では原則不要**（デフォルト設定で十分）。カスタマイズしたい場合は CSS 内で `@theme { ... }` を書く方式に変わりました。本レッスンでは `@theme` の深掘りはしません。

### 小さく試す（参考 — 任意）

本コースのプロジェクトには持ち込まないため、この演習は完全に任意です。

生成されたプロジェクトの `app/page.tsx` を次のように書き換えて、Tailwind v4 のデフォルトパレットを試せます。

```tsx
export default function Page() {
  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800">Tailwind v4 の練習</h1>
      <p className="mt-4 text-slate-600">
        素の CSS なしで、クラス名だけで見た目を組み立てている。
      </p>
      <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
        ボタン
      </button>
    </main>
  );
}
```

- `p-8`（padding 2rem）、`max-w-xl`（max-width）、`mx-auto`（水平中央寄せ）
- `text-3xl`（フォントサイズ）、`font-bold`（太字）
- `bg-blue-500`（背景色）、`hover:bg-blue-600`（hover 状態）、`transition`（遷移アニメ）

1 章で学んだ CSS の概念（margin、padding、font-size、color、transition）が、**Tailwind のクラス名に対応している** ことが分かります。本コースで CSS の仕組みを先に押さえたのが効いてきます。

### 期待出力

- 生成されたプロジェクトで、`@import "tailwindcss";` 1 行で Tailwind が動いていることを確認
- `app/page.tsx` にユーティリティクラスを書くと、即座にスタイルが適用される
- `tailwind.config.ts` が無いことを確認（デフォルトで動く）

### 本コースのプロジェクトに入れない理由

本コースの自己紹介 / TODO プロジェクトには **Tailwind を持ち込みません**。理由:

- これまで素の CSS で書いた資産（`.site-header`、`.cards`、`.card` など）が多い
- Tailwind に置き換えるには全 JSX を書き直す必要がある
- 「学ぶ手段」として Tailwind を見るだけなら、別プロジェクトで十分

本気で Tailwind に移行したい場合は、新しいプロジェクトを `create-next-app --tailwind` で作り、必要なページから少しずつ書き直していくのが現実的です。

### 変えてみる（任意）

任意。本コースのプロジェクトへの適用は不要です。

- 生成した Tailwind プロジェクトで `bg-blue-500` を `bg-green-500` / `bg-red-500` に変えて色の組を観察
- `hover:` や `md:` などのプレフィックス（状態・ブレークポイント）を使ってみる

### 自分で書く（挑戦）

任意。本コースのプロジェクトへの適用は不要です。

- Tailwind のドキュメントを少し読み、カードのレイアウトを Tailwind で書き直す
- 書き終えたら、1 章 の「Flexbox とレスポンシブ」で書いた素の CSS 版と見比べて **同じ見た目をどう表現しているか** 対比する

## まとめ

- Tailwind は「ユーティリティファースト」の CSS、クラス名だけで見た目を作る
- v4（2025 GA）は `@import "tailwindcss";` 1 行で導入、`init` コマンドや `tailwind.config.ts` は原則不要
- `create-next-app --tailwind` でデフォルトで v4 がセットアップされる
- 本コースの自己紹介 / TODO プロジェクトには持ち込まない（素の CSS 資産を壊さないため）
- 学ぶ意義を感じたら、本コース完走後に次のステップとして挑戦する
