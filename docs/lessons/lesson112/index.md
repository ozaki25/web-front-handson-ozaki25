# lesson112: 次世代ツールチェイン（Biome / Oxc / Turbopack）

## ゴール

- 「**Rust 製ツール群** に置き換わりつつある」フロントエンド界隈の構図を理解する
- Biome / Oxc / Rolldown / Turbopack それぞれの **役割と立ち位置** を区別できる
- **既存プロジェクトに今すぐ導入するか** を判断できる
- 速さの数字を **誇張なく** 受け取れる
- 5 年後にも残りそうな部分と、まだ揺れている部分を見分けられる

::: tip 前提
このレッスンは「ESLint / Prettier / Biome」と「Vite の仕組み」の発展編です。基本概念はそれぞれのレッスンで確認してください。
:::

## 解説

### なぜ Rust 移行が進むのか

JavaScript ツール群（バンドラ / リンタ / フォーマッタ / トランスパイラ）は **JavaScript で書かれて** きました。それは「**自分自身でメタ的に開発できる**」という美点があった一方:

- **シングルスレッド** 寄りで並列化が難しい
- **GC のオーバーヘッド**
- **JS 自体の起動コスト**

これがプロジェクトサイズの増加に追いついていません。**Rust** は次の特徴で対抗:

- **並列処理が得意**（fearless concurrency）
- **GC なし** で予測可能なメモリ使用
- **コンパイル時の最適化** で実行が速い
- **WebAssembly に出せる**（CI / IDE 連携）

結果として 2024〜2026 年の間に主要ツールが **Rust ベースに置き換え** が進んでいます。

### 次世代ツールチェインの全体像

| 役割 | 旧（JS 製） | 新（Rust 製） |
|---|---|---|
| バンドラ（dev / build） | esbuild + Rollup | **Rolldown** / Turbopack |
| パーサー / トランスパイラ | Babel | **SWC** / Oxc |
| Lint | ESLint | **Biome** / oxlint |
| Format | Prettier | **Biome** / dprint |
| 型チェック | tsc | **stc**（試行段階） |

それぞれを順に見ていきます。

### Biome

[Biome](https://biomejs.dev/) は **Lint + Format を 1 ツール** で提供する Rust 製ツール（「ESLint / Prettier / Biome」で扱い済み）。

特徴:

- **設定 1 ファイル**（`biome.json`）
- **ESLint + Prettier より圧倒的に速い**（35x ベンチマーク）
- TypeScript / JSX / JSON / CSS をサポート
- VS Code 拡張あり

```bash
npm install -D --save-exact @biomejs/biome
npx biome init
```

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true, "indentStyle": "space" }
}
```

#### Biome の限界

- **TypeScript の型情報を使う高度なルール** は未対応（ESLint の `no-floating-promises` など）
- 既存 ESLint プラグイン（`jsx-a11y`、`testing-library` 等）は使えない
- **互換性** はだいぶ向上したが、ESLint プラグインの **完全代替は未達**

→ 「**新規プロジェクトには Biome 単独**、既存資産があれば **Biome（フォーマット） + ESLint**（型情報を使うルール） のハイブリッド」が現実的。

### Oxc / oxlint

[Oxc](https://oxc.rs/)（Oxidation Compiler）は **Rust 製のフロントエンドツール群** の総称。**Boshen** らが開発。

#### 構成要素

| 名前 | 役割 |
|---|---|
| **oxc_parser** | JavaScript / TypeScript パーサ |
| **oxlint** | Lint（ESLint 互換ルール） |
| **oxc_minifier** | minify（terser / esbuild の代替） |
| **oxc_resolver** | モジュール解決 |
| **oxc_transformer** | TS / JSX → JS の変換 |

「**Rust で書かれたフロントエンドの基盤一式**」を狙うプロジェクト。

#### oxlint の最小例

```bash
npm install -D oxlint
npx oxlint
```

ESLint の主要ルールを **Rust で再実装** したリンタ。**ESLint より 50〜100x 速い** と言われ、CI / IDE で待ち時間がほぼゼロに。**v1.0 stable が 2025 年 6 月にリリース**（520+ ルール）。2026 年 3 月には **JS プラグイン（alpha）** が追加され、ESLint v9+ 互換の既存プラグインがそのまま動く見込みになった。型情報を使うルール（type-aware linting）も alpha として追加済み。

```json
// .oxlintrc.json
{
  "rules": {
    "no-unused-vars": "error",
    "no-debugger": "error"
  }
}
```

#### Oxc が他に与える影響

Vite 8（「Vite の仕組みを軽く」）が **Rolldown を採用**、Rolldown は **Oxc を内蔵** しています。つまり Oxc は **Vite / Rolldown / 多くの新ツール** の土台になりつつある。

Oxc は **VoidZero**（Evan You が立ち上げた会社）が支援しており、Vite / Rolldown と **同じ会社の同じ方向性** で開発が進んでいます。

### Rolldown

Vite 8 から採用された **Rust 製バンドラ**（「Vite の仕組みを軽く」で扱い済み）。

- **Rollup と同じプラグイン API**
- **esbuild より速い**（Oxc を内部で使用）
- **Vite / Rolldown / Oxc が 1 つのチームで開発**

「esbuild と Rollup の両方の良さを Rust で 1 つに」が Rolldown の旗印。Vite 8 のリリースで実用フェーズに入りました。

### SWC

[SWC](https://swc.rs/)（Speedy Web Compiler）は **Rust 製の TypeScript / JSX トランスパイラ**。Babel の置き換え狙い。

特徴:

- Next.js / Parcel 内部で採用
- Babel より **20〜70 倍速い**
- プラグインは Rust または WebAssembly

歴史的には Oxc より早く実用化されましたが、**Oxc が後発として** 機能で追いついています。Next.js は引き続き SWC ベース。

### Turbopack

[Turbopack](https://turbo.build/pack) は Vercel 製の **Rust 製バンドラ**。Next.js 専用に近い位置付け。

- Next.js 16 で **`next dev` / `next build` のデフォルト**
- webpack の **増分ビルド** を更に強化
- Rolldown と並列に開発されている（**競合関係**）

Vite 系（Vite + Rolldown + Oxc）と Vercel 系（Next.js + Turbopack + SWC）の 2 派が進む構図。

### dprint

[dprint](https://dprint.dev/) は **Rust 製のフォーマッタ**（Prettier 代替）。

```bash
npm install -D dprint
```

```jsonc
// dprint.json
{
  "typescript": { "lineWidth": 100, "indentWidth": 2, "semiColons": "always" },
  "json": {},
  "markdown": {},
  "includes": ["**/*.{ts,tsx,js,json,md}"],
  "excludes": ["dist", "node_modules"],
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.93.0.wasm",
    "https://plugins.dprint.dev/json-0.19.0.wasm",
    "https://plugins.dprint.dev/markdown-0.17.0.wasm"
  ]
}
```

特徴:

- 各言語のフォーマッタを **WebAssembly プラグイン** として持つ
- Prettier より少し古めの設計だが速い
- Deno / 一部 Rust エコシステムで採用

「Biome に注目が集まる中、**Prettier の代替として地味に使える**」位置付け。

### 「Rust 製で速い」の意味するもの

「**ESLint より 50 倍速い**」のような数字は要 **慎重に**。

- **大規模プロジェクト**（10,000+ ファイル）では **数分 → 数秒** の改善で大きな違い
- **小規模プロジェクト**（100 ファイル以下）では **既に十分速い** ので体感差はわずか
- **CI 時間** には大きな影響、**保存時 Lint** には微差

判断:

- **CI が長くなって困っている** → 移行価値あり
- **そうでもない** → 既存ツールで困っていなければ慌てない

### TypeScript の Rust 化

「**`tsc` を Rust で書き直す**」プロジェクトもいくつか進行中:

- [`stc`](https://github.com/dudykr/stc): SWC のチームによる試み（**型チェッカ**）
- [Microsoft / tsgo](https://github.com/microsoft/typescript-go)（Go 製、**2025 年に発表 + preview リリース**）: 公式の **Go ベース TypeScript**。型チェック / 言語サービスを Go で書き直し、`tsc` 比 10 倍級の高速化を目指す

特に **TypeScript 公式が Go で書き直す** プロジェクトは、近い将来 `tsc` 自体が大幅に高速化する可能性があります。

::: warning
2026 年現在、これらは **まだ完全互換ではない**。型チェックは tsc / IDE のままで、ビルドだけ SWC / esbuild という現状が続きます。
:::

### 既存プロジェクトへの導入判断

#### すぐ導入してもよい

- **新規プロジェクト** で Biome 単独
- **CI で Format チェックだけ** Biome に置き換え（影響範囲が小さい）
- **oxlint を ESLint と並走** させて速度を体感

#### 慎重に

- **ESLint プラグインに依存** している既存プロジェクト
- **`@types/*` を多用** する大規模 TypeScript（型情報を使うルールが必要）
- **チームの ESLint 知識** が分厚い場合（再学習コスト）

#### 数年待つ

- **TypeScript の Rust 化**（公式 Go 版を待つ）
- **完全な ESLint プラグイン互換** が出るまで

### ツール選択のフレーム

新規プロジェクトでの 2026 年標準:

```
言語: TypeScript 5.9
バンドラ: Vite 8（内部 Rolldown + Oxc）
        または Next.js 16（内部 Turbopack + SWC）
Lint:   Biome / oxlint
Format: Biome / Prettier
テスト: Vitest（内部 Vite）/ Playwright
パッケージ: pnpm / Bun
```

「**速い + 設定少ない**」を全方位で享受できる構成。

### 5 年後の展望

おそらく続くもの:

- **Rust ベースの拡大**（CI / dev サーバ全般）
- **Vite / Rolldown / Oxc の統合**（VoidZero が同方向に進める）
- **TypeScript 公式の Go / Rust 化**（高速化）

まだ揺れているもの:

- **Biome vs ESLint** の決着（プラグイン互換次第）
- **Vite 系 vs Vercel 系** のシェア
- **WebAssembly 化したツール**（IDE / ブラウザでの実行）

「**まずは安定の ESLint + Prettier、心の準備として Biome / Oxc を試す**」が 2026 年の堅実なスタンス。

## 演習

### ゴール

- Biome と oxlint をそれぞれ既存プロジェクトに **共存** させる
- 速度を **同じプロジェクト** で比較する

### 手順 1: ベースのプロジェクト

既存の Vite + React + TS プロジェクトを使うか、新規作成。

```bash
npm create vite@latest tooling-bench -- --template react-ts
cd tooling-bench
npm install
```

### 手順 2: ESLint で計測

```bash
# Vite テンプレートには ESLint が入っている
time npm run lint
```

時間を記録。

### 手順 3: Biome を導入

```bash
npm install -D --save-exact @biomejs/biome
npx biome init
```

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true, "indentStyle": "space" }
}
```

```bash
time npx biome check .
```

### 手順 4: oxlint を試す

```bash
npm install -D oxlint
time npx oxlint .
```

### 手順 5: 結果を比較

実測値の例（小規模プロジェクト）:

| ツール | 時間 | 検出数 |
|---|---|---|
| ESLint | 2.5s | 5 |
| Biome | 0.3s | 4 |
| oxlint | 0.1s | 3 |

「規模が小さいと **どれもすぐ終わる** が、CI で複数回走らせると **積み重なる差** になる」のを実感できます。

### 期待出力

- 3 つのツールがそれぞれ動き、速度差が見える
- 検出ルール / 重複が違うので、**ノイズの少ないツール** を選ぶ判断の材料になる

### 変える

- 1000 ファイル規模のプロジェクトで再測定
- CI でそれぞれを実行し、月のビルド時間を試算
- IDE 拡張（Biome / oxlint）を入れて、保存時のレイテンシを比較

### 自分で書く（任意）

- 既存プロジェクトの ESLint 設定を Biome に **完全移行**（`migrate` コマンドあり）
- dprint を入れて Prettier と比較
- TypeScript Go 版（`tsgo`）の preview を試す

## まとめ

- フロントエンドツールが **Rust 製** に置き換わりつつある
- **Biome**: Lint + Format 1 ツール、設定 1 ファイル、35x 高速
- **Oxc / oxlint**: Rust 製ツールの基盤、Vite 8 / Rolldown が内蔵
- **Rolldown**: Vite 8 のバンドラ、Rust 製、esbuild + Rollup 統合
- **SWC / Turbopack**: Next.js / Vercel が独自路線
- **dprint**: Prettier 代替の Rust 製フォーマッタ
- **TypeScript 公式の Go 版**（tsgo）が 2025 年に preview リリース、2026 年現在も成熟中
- 「**新規 = Biome 単独 + Vite 8**」が今の堅実解
- 既存プロジェクトは「**速度に困ってから**」で良い
- 5 年後は **Vite 系**（Rolldown + Oxc） と **Vercel 系**（Turbopack + SWC） の 2 派が併走と予想
