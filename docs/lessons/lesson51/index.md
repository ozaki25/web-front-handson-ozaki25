# lesson51: tsconfig.json を読む

## ゴール

- `strict` の各オプションが何を厳しくしているか分かる
- `target` / `module` / `moduleResolution` の 3 つの関係を説明できる
- `paths` でパスエイリアス（`@/*`）を設定できる
- `jsx` / `lib` / `types` の役割を理解する
- Vite / Next.js / Node 用の tsconfig.json の差を読める

## 解説

TypeScript プロジェクトのルートに置く `tsconfig.json` は、**型チェックとコンパイル** の挙動を決める設定ファイルです。フレームワークが自動生成してくれるので普段は触らないかもしれませんが、新しいツールを入れる時 / 「なぜか型エラー」を解決する時に **読めると話が早い** です。

このレッスンでは「現場で出てくる項目」だけを取り上げます。すべてを覚える必要はありません。

### 全体構造

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

中心になるのは `compilerOptions`。それ以外に「どのファイルを対象にするか」を `include` / `exclude` で指定します。

### `strict` ファミリー

`"strict": true` は **複数の strict オプションを一気に ON** にする「バンドル」です。ON にすると以下が同時に効きます。

| オプション | 何を禁じるか |
|---|---|
| `noImplicitAny` | 暗黙の `any`（型注釈なしの引数など） |
| `strictNullChecks` | `null` / `undefined` を別型として扱う |
| `strictFunctionTypes` | 関数の引数の型を厳密にチェック |
| `strictBindCallApply` | bind / call / apply の引数チェック |
| `strictPropertyInitialization` | クラスのプロパティが初期化されているか |
| `noImplicitThis` | `this` が `any` になる場面を禁じる |
| `alwaysStrict` | 出力に `"use strict"` を付ける |
| `useUnknownInCatchVariables` | `catch (e)` の `e` を `unknown` 型に |

**新規プロジェクトでは必ず `"strict": true`** を付けます。後から戻す方が大変です。

#### さらに厳しくしたい時

```json
{
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitOverride": true
}
```

特に `noUncheckedIndexedAccess` は `arr[0]` の型を `T | undefined` にします。バグを防げる一方、書き味が硬くなるので **新規プロジェクトでは入れて、既存に追加するなら計画的** に。

### `target` / `module` / `moduleResolution` の関係

3 つはセットで覚えます。

#### `target`

「**出力する JavaScript の構文バージョン**」。

- `ES2015` / `ES2020` / `ES2022` / `ES2023` / `ESNext`
- 例: `target: "ES5"` だと `class` が `function` のプロトタイプ書き換えに変換される
- **2026 年は `ES2022` 以上が無難**。古いブラウザ対応は Vite / Next.js のビルドが別途やる

#### `module`

「**出力するモジュール形式**」。

- `CommonJS`: `require` / `module.exports`
- `ESNext` / `ES2020`: `import` / `export`
- `NodeNext`: Node.js の最新 ESM/CJS 共存ルールに合わせる

最近のフロント / バンドラ前提なら `"module": "ESNext"`、Node.js 単体なら `"module": "NodeNext"` を選びます。

#### `moduleResolution`

「**`import` を書いた時にどうやってファイルを探すか**」。

| 値 | 用途 |
|---|---|
| `bundler` | Vite / webpack / Bun などバンドラを使う場合の **推奨**（TypeScript 5.0+） |
| `nodenext` | Node.js（ESM / CJS 切替を解釈） |
| `node10` | 古い Node 互換（旧称 `node`、メンテナンスのみ） |
| `classic` | 非常に古い。使わない |

`bundler` は **TypeScript 5.0 で追加** された値です。「拡張子を書かなくていい」「`package.json` の `exports` を解釈する」などモダンバンドラの挙動に合わせてあります。新規 Vite / Next.js では原則 `bundler` を選びます。

### `paths` でパスエイリアス

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

これで:

```ts
import Button from "../../../components/Button"; // 深い相対パス
import Button from "@/components/Button";          // 短い別名
```

注意点:

- TypeScript は **型チェックのためだけ** に解釈する。**実行時の解決は別**
- バンドラ（Vite / webpack / esbuild）にも **同じエイリアスを教える** 必要がある
- Vite なら `vite.config.ts` の `resolve.alias`、Next.js は **tsconfig.json から自動で読む**
- `paths` に書く値は **ベースとなる位置からの相対パス**。`create-next-app` は `"@/*": ["./src/*"]` ではなく `"@/*": ["./*"]` を出力するなど、**プロジェクトに `src/` があるかどうか** で値が変わるので、自動生成された値をそのまま使うのが安全

### `jsx`

JSX をどう変換するか。

| 値 | 説明 |
|---|---|
| `preserve` | JSX を変換せず、そのまま出力（バンドラに任せる） |
| `react` | `React.createElement(...)` に変換（古い形） |
| `react-jsx` | 新しい変換（`react/jsx-runtime` を自動 import）。**2026 年の標準** |
| `react-jsxdev` | 開発時の `react-jsx`。デバッグ情報付き |

新規 React / Next.js プロジェクトでは `"jsx": "react-jsx"`（または Next.js が自動指定する `"preserve"`）です。

### `lib`

「**型定義としてどこまで使えるか**」。

```json
{ "lib": ["ES2023", "DOM", "DOM.Iterable"] }
```

- `DOM`: ブラウザ API（`document` / `window` / `fetch` など）の型を有効化
- `ES2023`: `Array.prototype.toSorted` などの型を有効化
- `DOM.Iterable`: `for (const el of nodeList)` を許可
- Node.js 用なら `DOM` を入れない

### `types`

「**自動で読み込む型パッケージ** を制限する」。

```json
{ "types": ["vite/client", "node"] }
```

`@types/*` が `node_modules` に入っていると **デフォルトで全部読み込まれる**ので、テスト用と実装用の型がぶつかる事故が起きます。`types` を指定すると **明示したものだけ** に絞れます。

### `include` / `exclude`

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

`include` がディレクトリを指す場合、`*.ts` / `*.tsx` / `*.d.ts` などの拡張子だけを拾います。**テストファイルだけ別の tsconfig** を使うことがよくあります。

### `noEmit`

```json
{ "noEmit": true }
```

「**型チェックだけして JS を出力しない**」設定。バンドラが TS → JS の変換を担当する場合は `noEmit: true` にします。Vite / Next.js は `tsc` を使わず esbuild / SWC で変換するので、ほぼ常に `noEmit: true`。

`tsc` を **型チェック専用ツール** として使う、というのが現代の TS の主な役割です。

### `tsconfig.json` のバリエーション

#### Vite + React（`npm create vite -- --template react-ts` の生成例）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

特徴:

- `moduleResolution: "bundler"` + `allowImportingTsExtensions: true` でバンドラ前提
- `isolatedModules` は **ファイル単位で型情報なく変換** されることを保証する。Vite / esbuild の前提
- `noEmit: true` で型チェック専用

#### Next.js（自動生成）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

特徴:

- `jsx: "preserve"`（Next.js 内部で React Compiler / SWC が JSX を変換）
- `plugins: [{ name: "next" }]` で Next.js 用の補完が効く
- `next-env.d.ts` を `include` に入れて、Next.js が用意するグローバル型を読む

#### Node.js（CLI ツールなど）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

特徴:

- `tsc` で実際に **JS を出力する** ので `noEmit` を外し、`outDir` を指定
- `module: "NodeNext"` + `moduleResolution: "NodeNext"` で Node の ESM / CJS ルールに従う

### よくある落とし穴

#### `paths` を設定したのにビルドで失敗

→ TypeScript の `paths` は **型情報専用**。実行時は **バンドラ側にも** 同じエイリアスを教える必要があります。

#### `strict` を ON にしたら大量のエラー

→ 一度に全部直すのが大変なら、ファイル単位で `// @ts-nocheck` を一時的に置く / `noImplicitAny` だけ先に ON にする / 古い箇所だけ別の `tsconfig` で扱う、と段階的に進めます。

#### `skipLibCheck: false` にしたら謎のエラー

→ 依存パッケージの型が壊れていると `node_modules` の中まで型チェックして失敗します。**実用上 `true` がほぼ常識**。

#### Next.js で `jsx: "react-jsx"` を上書きしたい

→ 上書きせずに **Next.js の生成値（`"preserve"`）に従う**。`react-jsx` への変換は Next.js のビルドが内部で行います。

### tsconfig は **継承** できる

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

```json
// tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}
```

モノレポでは **共通設定を 1 つの base** に書き、各パッケージで `extends` するのが定番です。

`@tsconfig/strictest` / `@tsconfig/node20` のような **公式バンドル** も npm にあり、`extends: "@tsconfig/strictest/tsconfig"` と書くだけで強い設定一式が読み込めます。

## 演習

### ゴール

- 既存の Vite + React + TS プロジェクトの `tsconfig.json` を読み解く
- いくつかのオプションを変えて型チェックの挙動を変化させる

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest tsconfig-sample -- --template react-ts
cd tsconfig-sample
npm install
```

### 手順 2: tsconfig.json を眺める

`tsconfig.json`（または `tsconfig.app.json`）を開いて、解説で出てきた項目がどう書かれているか確認します。

### 手順 3: わざと「ゆるい」コードを書く

`src/App.tsx` に追加:

```tsx
function add(a, b) {  // 引数の型がない
  return a + b;
}

const value = null as null | string;
console.log(value.length);  // null チェックなし
```

このまま `npx tsc --noEmit` を実行すると、`strict: true` のせいでエラーが出ます。

```
src/App.tsx(2,13): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/App.tsx(7,13): error TS18047: 'value' is possibly 'null'.
```

### 手順 4: strict を変えて挙動を見る

`tsconfig.json` の `compilerOptions` に追加:

```json
"strict": false,
"noImplicitAny": true
```

これで:

- `noImplicitAny` は ON のまま、引数の型なしエラーは出続ける
- `strictNullChecks` は OFF になり、`value.length` のエラーは消える

`strict` は便利な「親スイッチ」ですが、個別の項目を明示することで「**何を厳しくしているか**」が読みやすくなります。

### 手順 5: paths を設定する

`tsconfig.json`:

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

`src/main.tsx` で:

```tsx
import App from "@/App";
```

`@/App` が解決できるはずです。

### 期待出力

- `npx tsc --noEmit` で型エラーが出る → strict を緩めると消える
- `@/...` の import が IDE / ビルドの両方で動く

### 変える

- `noUncheckedIndexedAccess: true` を追加して `const arr = [1, 2, 3]; arr[10].toString()` がエラーになることを確認
- `target: "ES2022"` を `target: "ES5"` に変えて、`tsc` の出力（`outDir` を一時的に指定）が ES5 構文になることを観察
- `jsx: "react-jsx"` を `jsx: "preserve"` に変えてビルドの出力差を見る

### 自分で書く（任意）

- `tsconfig.base.json` を作って `extends` する形にリファクタする
- モノレポ風に `apps/web/tsconfig.json` と `packages/ui/tsconfig.json` を作って共通設定を共有する
- `@tsconfig/strictest` を入れて、最強の strict を踏んだ時に出るエラーを 1 つずつ潰す

## まとめ

- `tsconfig.json` の中心は `compilerOptions`。`include` / `exclude` で対象ファイルを絞る
- `strict` は複数の strict オプションをまとめる **親スイッチ**。新規プロジェクトでは必須
- `target` / `module` / `moduleResolution` の 3 点セットで「出力 JS / モジュール形式 / 探索方法」が決まる
- `moduleResolution: "bundler"` が **2026 年のフロント標準**
- `paths` でパスエイリアスを定義。**実行時はバンドラにも教える**
- `jsx: "react-jsx"` が React 17 以降のデファクト
- `lib` で使える型、`types` で読み込む型パッケージを制御
- `noEmit: true` にして **型チェック専用** にし、変換はバンドラに任せるのが現代流
- `extends` でベース設定を継承できる。`@tsconfig/strictest` などの公式バンドルもある
