# lesson102: バンドルサイズの最適化とコード分割

## ゴール

- バンドルサイズが LCP や INP に効く理由を説明できる
- Vite のビルド出力を **Visualizer** で可視化できる
- `import("...")` の **動的インポート** でコードを分割できる
- `React.lazy` + `<Suspense>` でルート / コンポーネント単位の遅延読み込みができる
- 「最初の 1 画面で **必要なコードだけ** を送る」考え方を持てる
- Tree shaking が効く / 効かない書き方を区別できる

## 解説

### バンドルサイズと CWV の関係

ブラウザは JS を **ダウンロード → パース → 実行** してから初めて画面を描画できます。バンドルが大きいと:

- ダウンロードに時間がかかる → **LCP 悪化**
- パース・実行で **メインスレッドが詰まる** → **INP 悪化**
- 大きな `<script>` が `<body>` を遮る → **First Paint も遅延**

特にモバイル + 遅い回線では 100KB 違うだけで体感が劇的に変わります。**「送らないコードが最速」** が鉄則です。

### バンドル分析: rollup-plugin-visualizer

Vite は **Rollup** をベースにビルドします。`rollup-plugin-visualizer` を入れると、ビルド成果物の中身を **木構造の図** で見られます。

```bash
npm install -D rollup-plugin-visualizer
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,        // ビルド後に自動でブラウザで開く
      filename: "stats.html",
      gzipSize: true,    // gzip 圧縮後のサイズも表示
      brotliSize: true,  // brotli 圧縮後のサイズも表示
    }),
  ],
});
```

`npm run build` を実行すると `dist/` 出力後に `stats.html` がブラウザで開き、各依存パッケージのサイズが視覚的に分かります。意外なほど大きいライブラリ（例: `moment`、`lodash` 全部）が見つかることがあります。

### よくある肥大化パターン

| パターン | 解決策 |
|---|---|
| `lodash` を `import _ from "lodash"` で全部読み込み | `import debounce from "lodash/debounce"` で個別 import |
| `moment` を使っている | `date-fns` か `dayjs`（軽い）に置き換え |
| `framer-motion` 全部読み込み | `motion/react` の必要モジュールだけ |
| Tree shaking が効かない CommonJS パッケージ | ESM 版 / 軽量代替を探す |
| 画像を JS にバンドル | `public/` 配下の静的アセットに移す |
| アイコンライブラリ（fa-icons 等）の全アイコン | 個別アイコンを named import |

「困ったらまず Visualizer」を口癖にすると、肥大化の発見が早まります。

### コード分割（Code Splitting）

「最初の 1 画面で必要なコードだけ送る」を実現するのが **コード分割** です。アプリ全体を 1 つの大きなバンドルにせず、**画面 / 機能ごとに小さな chunk** に分けます。

#### 1. 動的インポート `import("...")`

JavaScript 標準の **動的 `import()`** を使うと、その行に到達するまでファイルを読み込みません。

```ts
// 静的 import: ビルド時に main bundle に含まれる
import { heavyFunction } from "./heavy";

// 動的 import: 実行時に必要になったら別 chunk として読み込む
button.addEventListener("click", async () => {
  const { heavyFunction } = await import("./heavy");
  heavyFunction();
});
```

ボタンを押すまで `heavy` モジュールは送られません。Vite は自動で別の chunk ファイルにし、必要なときだけ HTTP で取りに行きます。

### 2. React.lazy + `<Suspense>`

React コンポーネントを動的に読み込むには `React.lazy` を使います。

```tsx
import { lazy, Suspense } from "react";

// 通常の import
// import { HeavyChart } from "./HeavyChart";

// 動的 import + lazy
const HeavyChart = lazy(() => import("./HeavyChart"));

function App() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>グラフを表示</button>
      {showChart && (
        <Suspense fallback={<p>グラフ読み込み中...</p>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

`HeavyChart` のコードは **ボタンを押すまで送られません**。`<Suspense fallback={...}>` で、読み込み中の表示も指定できます。

#### 3. Next.js でのコード分割

Next.js の App Router は **デフォルトで自動コード分割** をします。`app/posts/page.tsx` の中身は `/posts` を訪れた時だけ送られ、トップ `/` には含まれません。

明示的に分割したい時は `next/dynamic` を使います:

```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./Chart"), {
  loading: () => <p>読み込み中...</p>,
  ssr: false,  // クライアント側でだけ実行
});

export default function Page() {
  return <Chart />;
}
```

`ssr: false` を付けると **サーバー側でのレンダリングをスキップ** します。クライアント専用ライブラリ（`window` を直接触る）でよく使います。

### Tree Shaking の落とし穴

**Tree Shaking** は「使っていないコードを最終バンドルから除外する」ビルダの最適化です。Vite / Rollup は強力に効きますが、**書き方によっては効かない** ことがあります。

#### 効く書き方（named import）

```ts
import { format } from "date-fns";
// 使うのは format だけ。他の関数はバンドルされない
```

#### 効きにくい書き方

```ts
import * as dateFns from "date-fns";
dateFns.format(...);
// すべての export を読み込む可能性が上がる
```

```ts
import _ from "lodash";
// CommonJS の lodash は tree shaking が効かない。lodash 全部が含まれる
```

代替策:

- `lodash` → `lodash-es`（ESM 版） or 個別関数 import（`import debounce from "lodash/debounce"`）
- `moment` → `dayjs` / `date-fns`
- 大きな UI ライブラリ → 個別パッケージ化されているものを選ぶ（Chakra UI v3、Radix UI のように）

### `package.json` の `sideEffects: false`

ライブラリ作者向けですが、自作のライブラリで Tree Shaking を効かせるには `package.json` に `sideEffects: false` を書きます。

```json
{
  "name": "my-lib",
  "sideEffects": false
}
```

「このパッケージのモジュールは import するだけでは何の副作用もない」とビルダに伝えるためのフラグです。CSS の import などサイドエフェクトがある場合は `["./style.css"]` のように個別に指定します。

## 演習

### ゴール

- 既存の Vite + React プロジェクトに `rollup-plugin-visualizer` を入れる
- `stats.html` を見てバンドル内容を可視化する
- `React.lazy` でページ単位のコード分割を体験する
- ビルド前後でサイズの違いを比較する

### 途中から始める場合

新規 Vite + React + TypeScript テンプレートを作ります（StackBlitz でも可）。

```bash
npm create vite@latest perf-sample -- --template react-ts
cd perf-sample
npm install
npm install -D rollup-plugin-visualizer
```

### 手順 1: Visualizer を有効化

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: "dist/stats.html",
      gzipSize: true,
    }),
  ],
});
```

### 手順 2: わざと大きなコンポーネントを作る

`src/HeavyChart.tsx`:

```tsx
export function HeavyChart() {
  // 実際のグラフライブラリの代わりに、大きな配列を生成
  const data = Array.from({ length: 1000 }, (_, i) => ({
    label: `点 ${i}`,
    value: Math.sin(i / 50) * 100 + 100,
  }));

  return (
    <div>
      <h2>グラフ（モック）</h2>
      <ul>
        {data.slice(0, 20).map((d) => (
          <li key={d.label}>
            {d.label}: {d.value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 手順 3: lazy で読み込む

`src/App.tsx`:

```tsx
import { lazy, Suspense, useState } from "react";

const HeavyChart = lazy(() =>
  import("./HeavyChart").then((m) => ({ default: m.HeavyChart }))
);

export default function App() {
  const [show, setShow] = useState(false);

  return (
    <main>
      <h1>パフォーマンス演習</h1>
      <button onClick={() => setShow(true)}>グラフを表示</button>

      {show && (
        <Suspense fallback={<p>読み込み中...</p>}>
          <HeavyChart />
        </Suspense>
      )}
    </main>
  );
}
```

`HeavyChart` は **named export** なので `lazy` の中で `default` に変換しています。`export default function HeavyChart() {...}` にすれば変換は不要です。

### 手順 4: ビルドして可視化

```bash
npm run build
```

ビルド完了後、自動で `stats.html` がブラウザで開きます。

- 中央の大きなブロックが React 本体
- 別の小さな chunk として `HeavyChart` のコードが分かれているはず
- **Initial bundle**（最初に送られる JS）から `HeavyChart` が外れている

### 期待出力

`dist/assets/` を見ると、複数の `.js` ファイルがあるはずです。

```
dist/
├── index.html
├── assets/
│   ├── index-XXXXX.js     ← Initial bundle (App.tsx + React)
│   └── HeavyChart-XXXXX.js ← lazy でロードされる別 chunk
└── stats.html
```

開発モードで `npm run preview` するとビルド済みを配信できるので、Network タブで:

- 最初に index-XXXXX.js が読み込まれる
- 「グラフを表示」ボタンを押すと、その瞬間に HeavyChart-XXXXX.js が追加で読み込まれる

の流れが見えます。

### 変える

- `lazy` の動的 import を **静的 import** に戻してみる（`import { HeavyChart } from "./HeavyChart"`）。再ビルドすると `HeavyChart` のコードが Initial bundle に統合され、`stats.html` 上で 1 つの大きな塊になることを確認
- `HeavyChart` の中身を増やしてみる（`Array.from({ length: 100000 }, ...)`）。バンドル内のサイズが目に見えて増える
- `import * as dateFns from "date-fns"` を入れて、tree shaking が効いていない場合に何が起きるか観察（事前に `npm install date-fns`）

### 自分で書く

- 別のページ（`<DashboardPage />` 等）を `lazy` で読み込み、ボタンクリックで切り替える SPA 風サンプル
- `npm run build` の結果を Vercel / Netlify にデプロイし、モバイルで Lighthouse を回して **コード分割前後の LCP の差** を測る

### Next.js での実例

教材サイトの5 章 で扱った Next.js の App Router は、各 `page.tsx` が **自動でコード分割される** 仕組みになっています。`/posts` のページに行くまで `/posts/page.tsx` の中身は送られません。これは Next.js が裏で `lazy` 相当のことをしているからです。

それに加えて `next/dynamic` を使うと、**コンポーネント単位** での明示的な分割もできます。

## まとめ

- バンドルサイズは LCP / INP に直結する。「送らないコードが最速」
- **rollup-plugin-visualizer** でバンドルの中身を木構造で可視化
- 肥大化の典型（lodash 全部 import / moment / framer-motion 全部 / 画像 JS バンドル）を覚える
- **動的 `import()`** + **`React.lazy`** + **`<Suspense>`** でコード分割
- Next.js は App Router の `page.tsx` 単位で **自動コード分割**、コンポーネント単位は `next/dynamic`
- Tree shaking が効くのは **named import + ESM**、CommonJS や `import *` は要注意
- 別のレッスンでは画像 / フォントの最適化に進む（**LCP の最重要要因**）
