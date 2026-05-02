# lesson109: フロントエンドツールの全体像と歴史

## ゴール

- フロントエンドのビルド系ツールを **5 つの役割** で分類できる
- なぜツールがこんなに多いのか、世代交代の流れを説明できる
- 2026 年時点のデファクトを役割ごとに 1 つずつ挙げられる
- なぜ Rust / Go 製のツールが増えているかを理解する

## 解説

### 道具が多すぎる問題

現代の `package.json` を開くと、`devDependencies` に 20〜30 個のパッケージが並びます。Vite / TypeScript / ESLint / Prettier / Vitest / Playwright / SWC / Babel / esbuild / ... と覚えきれない量です。

この章では次のレッスン以降で個別ツールを深掘りしますが、その前に「**何をするツールがあるか**」「**なぜこれだけ種類があるか**」の見取り図を共有します。

### 役割別: 5 つのカテゴリ

ほとんどのツールは次の 5 つのどれかに分類できます。

| 役割 | 何をする | 代表ツール |
|---|---|---|
| **モジュールバンドラ** | 多数の JS / CSS / 画像をブラウザが読める形にまとめる | webpack / Rollup / esbuild / Vite / Turbopack / Rspack / Rolldown |
| **トランスパイラ** | TS → JS、JSX → JS、新しい構文 → 古い構文 | Babel / TypeScript / SWC / Oxc |
| **リンター** | コードの「臭い」を検出（バグの種・アンチパターン） | ESLint / Biome / oxlint |
| **フォーマッタ** | コードのスタイルを揃える（インデント・改行など） | Prettier / Biome / dprint |
| **テストランナー** | テストを実行する | Jest / Vitest / Playwright |

これに加えて、**開発サーバー**（Vite dev server / webpack-dev-server）と **パッケージマネージャ**（npm / pnpm / yarn / Bun）も道具です。

ややこしいのは、1 つのツールが **複数の役割を兼ねる** ことです。Vite はバンドラだが内部で esbuild を使ってトランスパイルもする。Biome はリンタとフォーマッタを兼ねる。Oxc は将来的にバンドラ以外のすべてを統合する目標を持っています。

### 歴史: 4 つの世代

なぜこれだけ種類が増えたかは、**世代を追うと整理しやすい** です。

#### 第 0 世代: 〜2014 年「ツール以前」

JS は `<script>` タグで読み込み、CSS は `<link>` で読み込むだけ。複数ファイルを連結したければ `cat a.js b.js > bundle.js` のような手作業。

- **Grunt**（2012）/ **Gulp**（2013）: タスクランナー。「concat → minify → upload」の手順を自動化
- **Browserify**（2011）: Node.js の `require()` をブラウザでも動かす最初のバンドラ

#### 第 1 世代: 2015〜2019 年「webpack + Babel」

ES2015 の登場で言語が大きく変わり、ブラウザ対応がバラバラになり、トランスパイルが必須に。

- **webpack**（2014〜）: `import` を解決し、CSS / 画像も「モジュール」として扱う。コード分割もできる
- **Babel**（2014〜）: ES2015+ を ES5 に変換。JSX も Babel が変換
- **Rollup**（2015〜）: ライブラリ向けのバンドラ。tree-shaking の概念を広めた
- **Parcel**（2017〜）: 設定ゼロを売りに

webpack + Babel が圧倒的標準になった時代。代わりに `webpack.config.js` が数百行に膨らみ、ビルドが分単位で遅くなる問題が表面化しました。

#### 第 2 世代: 2020〜2022 年「ESM + ネイティブ速度」

ブラウザの ESM サポートが普及し、「開発時はバンドルしない」選択肢が現実的に。さらに JS 製ツールの遅さを Go / Rust で解決する流れが始まりました。

- **esbuild**（2020〜）: Go 製。webpack より 10〜100 倍速いトランスパイラ + バンドラ
- **Vite**（2020〜）: 開発時は ESM のまま配信、本番ビルドは Rollup。トランスパイルは esbuild で
- **SWC**（2020〜）: Rust 製のトランスパイラ。Babel の代替として Next.js が採用
- **Rome**（2020〜）→ **Biome**（2023〜）: ESLint + Prettier を 1 つに統合する試み

「ビルドツールを Rust / Go で書き直す」流れが本格化しました。

#### 第 3 世代: 2023 年〜現在「Rust 全盛 + 統合 + 競争」

- **Turbopack**（2022〜）: Vercel 製。Rust 製の webpack 後継、Next.js に組み込み
- **Rspack**（2023〜）: ByteDance 製。webpack 互換の Rust 実装
- **Oxc**（2023〜）: 高速 JS / TS パーサ + リンタ + フォーマッタ + リゾルバの統合プロジェクト。**oxlint** は ESLint より圧倒的に速く、Vue / Vite / Shopify などの主要 OSS が採用
- **Biome**（2023〜）: ESLint + Prettier 互換を 1 バイナリで提供。lint と format を統合する立ち位置
- **Rolldown**（2024〜）: Vite 公式の Rust 製 Rollup 互換バンドラ。Vite の本番ビルドを置き換える計画

JavaScript 製のツールから Rust / Go 製への移行と、複数ツールの「統合」が同時並行で進んでいます。**勝者がはっきり決まらず競合が並走する** のがこの世代の特徴です。

### 2026 年の標準セット

新規プロジェクトで「とりあえず始める」ならこの組み合わせがいちばん摩擦が少ない選択肢です。

| 役割 | 標準 |
|---|---|
| バンドラ | Vite（個人 / SPA）/ Next.js（フルスタック）|
| トランスパイラ | TypeScript + Vite 内蔵の esbuild |
| リンター | ESLint or oxlint or Biome（過渡期で 3 択） |
| フォーマッタ | Prettier or Biome |
| テストランナー | Vitest（単体）/ Playwright（E2E）|
| パッケージマネージャ | npm / pnpm |

「**Vite + TypeScript + ESLint + Prettier + Vitest**」が現時点の最大公約数で、リンタを oxlint や Biome に置き換える選択肢も実用域に入っています。

### なぜ Rust / Go 製が増えるのか

JavaScript 製のツールは、Node.js の起動時間 + V8 の最適化が追いつくまでの時間 + パース速度に律速されます。Rust / Go 製のツールは:

- **起動が速い**（数 ms〜数十 ms）
- **並列処理が JS より素直に書ける**（マルチコアを活かしやすい）
- **大規模プロジェクトで有意に速い**（webpack ビルド数分 → Turbopack 数秒）

ただし、JS 製ツールに比べて **エコシステム（プラグイン）が貧弱** な過渡期です。ESLint には何千ものプラグインがありますが、oxlint や Biome は組み込みルールが中心。完全な置き換えには数年かかると見るのが現実的です。

### 選び方の指針

新しいツールに飛びつくべきか、定番にとどまるべきか:

- **学習中・小規模**: 定番（Vite + ESLint + Prettier）で十分。情報量が圧倒的に多く、詰まったときの解決が速い
- **既存プロジェクト**: 動いているなら無理に置き換えない。フォーマッタや lint だけ部分的に置き換えるのは比較的安全
- **大規模 / モノレポ**: ビルド時間がボトルネックなら Turbopack / Rspack / Rolldown を検討
- **OSS ライブラリ**: Rollup or Vite の library mode

「**新しい = 良い**」ではなく「**自分のプロジェクトの何を解決したいか**」で選ぶのが基本です。新しいツールは半年で景色が変わります。

## 演習

### ゴール

- 自分のプロジェクト（または本コースのリポジトリ）の `devDependencies` を 5 つの役割に分類できる
- 各ツールが第何世代に登場したか答えられる

### 手順

1. ターミナルで `cat package.json` か任意のエディタで `package.json` を開きます
2. `devDependencies` を 1 つずつ眺めます
3. 5 つのカテゴリ（バンドラ / トランスパイラ / リンター / フォーマッタ / テストランナー）または「その他」に振り分けます
4. 不明なツールは `npm view <name> description` または npmjs.com で短い説明を読んで分類します

### 期待出力

- 例: 本コースのリポジトリだと VitePress（その他: 静的サイト生成器）/ TypeScript（トランスパイラ）/ vite-plugin-pwa（その他: プラグイン）のように分類できる
- 分類した各ツールが第何世代か答えられる（例: webpack なら第 1 世代、Vite なら第 2 世代）

### 変える

- `npm create vite@latest my-app -- --template react-ts` で新規プロジェクトを作り、生成された `devDependencies` を分類してみる
- 同じ手順を `npm create next-app@latest` で行い、Next.js が何を使っているかを見比べる

### 自分で書く

- 知っているフロントエンド OSS（React / Vue / Svelte 本体など）の GitHub リポジトリで `package.json` を開き、ビルド・テスト・lint 周りに何を使っているか観察する
- 「2 年後にこの組み合わせがどう変わっていそうか」を予想して 2〜3 行でメモする

## まとめ

- フロントエンドのツールは「バンドラ / トランスパイラ / リンター / フォーマッタ / テストランナー」の 5 役割で整理できる
- 第 0 世代（〜2014）: Grunt / Gulp / Browserify。手作業の自動化
- 第 1 世代（〜2019）: webpack + Babel が標準。設定肥大とビルド速度が課題に
- 第 2 世代（〜2022）: ESM + Go / Rust 製ツールで高速化（esbuild / Vite / SWC / Biome）
- 第 3 世代（2023〜）: Rust 全盛と統合競争（Turbopack / Rspack / oxlint / Rolldown）
- 2026 標準: Vite + TypeScript + ESLint + Prettier + Vitest が最大公約数。lint まわりは過渡期
- 「新しい = 良い」ではなく、自分の課題に合うかで選ぶ
