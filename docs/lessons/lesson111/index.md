# lesson111: ESLint / Prettier / Biome

## ゴール

- Lint と Format が **役割の異なる別物** であることを理解する
- ESLint の flat config（`eslint.config.js`）の最小形を読める
- Prettier との連携で衝突しない設定を書ける
- Biome / oxlint など **Rust 製新ツール** の位置付けと選び方を理解する
- 「2026 年に新規プロジェクトを始めるなら」の実用的な選択軸を持つ
- VS Code の保存時 autofix で「書きながら直る」体験を得る

## 解説

### Lint と Format は別物

混同しがちですが、役割が違います。

| ツール | 守備範囲 |
|---|---|
| **Lint**（ESLint） | コードの **品質** チェック。バグの種 / アンチパターン / a11y 違反 / 未使用変数を検知 |
| **Format**（Prettier） | コードの **見た目** を整える。インデント / クォート / 改行位置 |

ESLint は「未使用変数があるよ」「`any` 型は避けて」と教える。Prettier は「シングルクォートに統一して、80 文字で改行して」と整える。両方やると初めて綺麗で安全なコードベースになります。

歴史的には ESLint だけで両方やる時代もありましたが、**役割を分ける** のが現代の合意。さらに **Biome** という「両方を 1 ツールでやる」統合型の選択肢、ESLint より高速な **oxlint** という Rust 製の lint 単機能型の選択肢も増えており、2026 年は過渡期にあります。

### ESLint の flat config

ESLint v9（2024 年）で **flat config** が既定になり、**ESLint v10（2026 年 2 月）で `.eslintrc` 形式が完全廃止**されました。設定ファイルは **`eslint.config.js`**（ESM）に一本化されています。

#### 最小構成（TypeScript + React）

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
```

`eslint.config.js`:

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
];
```

`package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

`npm run lint` で全ファイルをチェック、`npm run lint:fix` で自動修正できる範囲は直してくれます。

#### よく使うプラグイン

- `typescript-eslint`: TypeScript の型情報を使った高度なチェック
- `eslint-plugin-react`: React のお作法
- `eslint-plugin-react-hooks`: フック規則の検証
- `eslint-plugin-jsx-a11y`: JSX のアクセシビリティ違反を検知（7 章「アクセシビリティ」と相性◎）
- `eslint-plugin-import`: import の順序とパス解決

### Prettier の最小設定

```bash
npm install -D prettier
```

`.prettierrc`（プロジェクトルート）:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 80,
  "tabWidth": 2
}
```

`package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

`.prettierignore` に除外を書きます:

```
dist/
node_modules/
*.min.js
```

### ESLint と Prettier の衝突を避ける

ESLint にも整形系のルール（インデント / セミコロン）が組み込まれていますが、これが Prettier と衝突します。**`eslint-config-prettier`** を使ってこれらのルールを無効化します。

```bash
npm install -D eslint-config-prettier
```

`eslint.config.js` の最後に追加:

```js
import prettierConfig from "eslint-config-prettier";

export default [
  // ...上記の設定
  prettierConfig,  // 最後に置いて整形系のルールを上書きで OFF
];
```

これで「ESLint は品質、Prettier は見た目」の役割分担が綺麗に成立します。

### VS Code の保存時 autofix

`.vscode/settings.json`（プロジェクトの設定）:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

これでファイル保存時に:

1. ESLint の自動修正可能な違反が直る
2. Prettier がコードを整形する

の 2 段階が走ります。「書きながら綺麗になる」体験になり、PR レビューで「インデントが…」と指摘するムダが消えます。

VS Code の拡張は `dbaeumer.vscode-eslint` と `esbenp.prettier-vscode` を入れます。

### Biome: 1 ツールで両方

**Biome** は Rust 製の Lint + Format ツールです。

```bash
npm install -D --save-exact @biomejs/biome
npx biome init
```

これだけで `biome.json` が生成され、すぐ使えます。

`package.json`:

```json
{
  "scripts": {
    "check": "biome check .",
    "check:fix": "biome check --write ."
  }
}
```

#### Biome の魅力

- **設定ファイルが 1 つだけ**（`biome.json`）
- **ESLint + Prettier より大幅に速い**（公式ベンチマークでは Lint がマルチスレッドで約 15x、Format がマルチスレッドで約 25x。条件次第ではさらに伸びる）
- **インストールするパッケージが 1 つだけ**（ESLint は最低 6 パッケージ）
- **Lint と Format の衝突がない**（同じツール内なので）
- **VS Code 拡張**（`biomejs.biome`）も公式

#### Biome の限界

- TypeScript の **型情報を使う高度なルール**（`no-floating-promises` 等）は ESLint だけが提供
- 既存 ESLint プラグイン（`jsx-a11y` 等）は使えない
- カスタムルールが書きづらい

### 2026 年の選び方

リンタ・フォーマッタの分野は 2024〜2026 年にかけて大きく動いています。**Biome が 2023〜2024 年に「ESLint + Prettier の代替」として注目されましたが、その後 Rust 系のもうひとつの潮流 oxlint（後述）が急速にシェアを奪い、Biome は「lint + format を 1 ツールで」という統合の利便性を売りに踏ん張る局面**です。「これさえ入れればよい」と言える勝者はまだいません。次の 3 通りから自分の事情に合うものを選ぶのが現実的です。

#### A. ESLint + Prettier（依然として最大派閥）

プラグイン資産が圧倒的で、TypeScript の型情報を使う高度なルール（`no-floating-promises` など）も使える。書きやすさより安全性を優先するならこれ。React Native / 大規模モノレポ / 複雑なルール要件があるプロジェクトはほぼこれ。

#### B. Biome（lint + format の統合）

設定 1 ファイル / 1 パッケージ / Rust 製で速い。**「lint と format を別ツールで管理する手間を省きたい」** が刺さる構成。新規の小〜中規模プロジェクトで割り切れる場合は今でも有力。

```bash
npm install -D --save-exact @biomejs/biome
npx biome init
```

#### C. oxlint + Prettier（伸び盛り）

oxlint は ESLint より **数十倍速い** Rust 製リンタで、ESLint のルール互換性を意識して開発されています。Vue / Vite / Shopify など主要 OSS が次々採用しており、2025 年以降に急伸した本命候補。フォーマットは Prettier に任せて、lint だけ高速化するハイブリッドが現実解になりつつあります。oxlint 自体は次のレッスン（次世代ツールチェイン）で扱います。

#### どれを選ぶか

- **学習中・小規模**: A か B のどちらでも。設定数を減らしたいなら B
- **既存プロジェクト**: 動いているなら A のまま。フォーマットだけ Biome に置き換える選択肢もあり
- **速度を最優先 + 既存ルール資産を活かしたい**: C
- **「正解は 1 つ」を期待しない**: 過渡期なので、半年後に景色が変わっている可能性は十分ある

#### Lighthouse / a11y 検査も Lint で

ESLint には `eslint-plugin-jsx-a11y` のような **a11y 検査プラグイン** があります。書く段階で違反を捕まえられるので、7 章「アクセシビリティ」と組み合わせると効果的です。

```js
// eslint.config.js
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // ...
  jsxA11y.configs.recommended,
];
```

これで `<img>` の alt 欠落 / `<button>` の `tabindex="-1"` などが Lint で警告されます。

### Husky + lint-staged で commit 時に自動チェック

「commit する時に Lint / Format を自動実行」して、CI で fail する前に直す仕組みです。

```bash
npm install -D husky lint-staged
npx husky init
```

`.husky/pre-commit`:

```sh
npx lint-staged
```

`package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["biome check --write"]
  }
}
```

`git commit` のたびに、ステージングされたファイルだけが対象に Lint + Format されます。**全プロジェクトを毎回チェックしないので速い** のが lint-staged の利点。

## 演習

> **このレッスンはローカル前提**: VS Code 拡張 + 保存時の自動整形を確認するため、**ローカル環境での Node.js 実行と VS Code 利用を前提** にしています。StackBlitz では VS Code 拡張が動かないので、Biome のコマンドライン実行までは追えますが、エディタ統合の体感はできません。

### ゴール

- Vite + React + TS プロジェクトに **Biome** を導入する
- VS Code で保存時に自動整形 / 自動修正が走るようにする
- わざとエラーを入れて、Biome が検知することを確認する

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest lint-sample -- --template react-ts
cd lint-sample
npm install
```

### 手順 2: Biome を導入

```bash
npm install -D --save-exact @biomejs/biome
npx biome init
```

`biome.json` が生成されます。中身は最小設定:

```json
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "files": {
    "ignoreUnknown": false,
    "includes": ["**", "!node_modules", "!dist"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

`indentStyle` を `space` に変えたい場合は `"indentStyle": "space", "indentWidth": 2` に。

### 手順 3: package.json scripts

```json
{
  "scripts": {
    "check": "biome check .",
    "check:fix": "biome check --write ."
  }
}
```

### 手順 4: VS Code 設定

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

VS Code の拡張ストアで `biomejs.biome` をインストールします。

### 手順 5: 動作確認

`src/App.tsx` に、わざと整形が崩れたコードを書きます:

```tsx
import {useState}from "react"

export default function App(){
const[count,setCount]=useState(0)
const unused = "使ってない";
return <div><h1>Count: {count}</h1><button onClick={()=>setCount(c=>c+1)}>+1</button></div>
}
```

ファイルを保存すると:

- インデントが揃う
- 改行が入る
- 引用符が統一される
- `unused` 変数が「使われていない」と警告される

ターミナルで `npm run check` を実行すると、すべての違反が一覧されます。`npm run check:fix` で自動修正できる範囲は直されます。

### 期待出力

```
Checked 5 files in 200ms. No fixes applied.
Found 1 warning.
```

```tsx
import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const unused = "使ってない";  // 警告: unused
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

### 変える

- `biome.json` の `formatter.indentStyle` を `space` ↔ `tab` で切り替えて差を確認
- `linter.rules.recommended` を `false` にしてみる。すべての警告が消える
- `linter.rules.correctness.noUnusedVariables` を `error` に変えて、警告がエラーになることを確認

### 自分で書く（任意）

- 既存の Vite テンプレートに **ESLint + Prettier** を入れて、Biome 構成と比較する
  - 必要なパッケージ数の違い
  - 設定ファイルの数の違い
  - `npm run lint` の所要時間
- Husky + lint-staged を入れて commit 時に自動 Lint / Format される構成を作る

## まとめ

- **Lint** はコード品質、**Format** はコード整形。役割が違う
- **ESLint v9** で flat config が既定化、**v10（2026 年 2 月）で `.eslintrc` を完全廃止**
- ESLint + Prettier の組み合わせは `eslint-config-prettier` で衝突回避
- VS Code の保存時 autofix で「書きながら綺麗になる」体験
- **Biome** は Lint + Format を 1 ツール、Rust 製、ESLint / Prettier より大幅に速い（公式ベンチで Lint 約 15x / Format 約 25x）、設定 1 ファイル
- 2026 年は **ESLint + Prettier**（最大派閥） / **Biome**（統合の利便性） / **oxlint + Prettier**（速度伸び盛り） の 3 択。決定的な勝者はまだいない
- 大規模 / 複雑なルールが必要なら ESLint、新規小規模で設定を減らしたいなら Biome、速度と ESLint 互換が欲しいなら oxlint
- `eslint-plugin-jsx-a11y` で書く段階から a11y 違反を検知
- Husky + lint-staged で commit 時の自動 Lint / Format
