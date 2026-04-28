# lesson104: package.json と npm スクリプト

## ゴール

- `dependencies` / `devDependencies` / `peerDependencies` の違いを言える
- セマンティックバージョニング（`^` / `~` / 固定）の意味を読める
- `package-lock.json` がなぜ必要か説明できる
- npm / pnpm / yarn / Bun の違いを把握する
- `scripts` の書き方と `npm run` の仕組みを理解する

## 解説

### `package.json` はプロジェクトの「目次」

Node.js / フロントのプロジェクトには必ず `package.json` があります。役割は次の 4 つ。

1. **メタ情報**（プロジェクト名 / バージョン / 作者など）
2. **依存パッケージ** の宣言
3. **スクリプト** の登録（`npm run dev` など）
4. **ツール設定** の置き場（lint-staged / browserslist / 各種 CLI の設定）

最小例:

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "vite": "^8.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.9.0"
  }
}
```

### 依存の 3 つの種類

#### `dependencies`

「**実行時にも必要** な依存」。`react` / `next` / `axios` などはここに入ります。デプロイ先の本番環境でも `npm install` で入れる必要がある。

#### `devDependencies`

「**開発時だけ必要** な依存」。`typescript` / `vite` / `eslint` / `vitest` など、ビルド済みコードを動かすには不要なもの。本番のサーバーで `npm install --omit=dev` すると **dev は入らず、容量が減る** メリットがあります。

#### `peerDependencies`

「**親プロジェクトに入っているはず** の依存」。プラグイン / ライブラリ自身が宣言する。

例: `eslint-plugin-react` が `peerDependencies: { eslint: "^9.0.0" }` を持つ。これは「自分は ESLint なしでは動かない、けれど ESLint 自身は **使う側が** 入れる前提だよ」という意思表示。

普通のアプリ開発で書くことは少ないですが、ライブラリを公開する立場では重要です。

#### `optionalDependencies` / `bundledDependencies`

たまに見かけますが、めったに使いません。`optionalDependencies` は「入らなくても続行」、`bundledDependencies` は「自分のパッケージに同梱」。

### セマンティックバージョニング（semver）

`react: ^19.2.0` の数字は **3 つに区切られた意味** を持ちます。

```
19.2.0
│ │ │
│ │ └── PATCH（バグ修正）
│ └──── MINOR（後方互換のある機能追加）
└────── MAJOR（破壊的変更）
```

ルール:

- **PATCH を上げる** → 既存のコードは動き続けるはず
- **MINOR を上げる** → 既存のコードは動き、新機能が増える
- **MAJOR を上げる** → 既存のコードが動かなくなる可能性あり

#### 範囲指定の記号

| 書き方 | 意味 | 例: `^1.2.3` の許容範囲 |
|---|---|---|
| `^1.2.3` | MAJOR は固定。MINOR / PATCH は上げて OK | `>= 1.2.3 < 2.0.0` |
| `~1.2.3` | MINOR も固定。PATCH のみ上げて OK | `>= 1.2.3 < 1.3.0` |
| `1.2.3` | 完全固定 | `1.2.3` のみ |
| `>=1.2.3` | これ以上 | `1.2.3` 以降すべて |
| `1.x` / `1.*` | MAJOR だけ固定 | `>= 1.0.0 < 2.0.0` |

**新規プロジェクトのデフォルトは `^`**。多くのライブラリが semver を守っているので「MINOR / PATCH は自動で上がる」ことを期待します。

ただし、現実には semver を厳密に守らないライブラリもあります。重要なツール（型生成 / ビルドツール）は **`~` や固定** で慎重に上げる、という運用も。

### `package-lock.json` の役割

`package.json` に `^19.2.0` と書いてあっても、**実際にインストールされる版は `npm install` 実行時の最新** です。チームで開発していると「**人によって入る版が違う**」事態が起きます。

`package-lock.json` は「**実際に入った全パッケージの正確なバージョン**」を記録するファイル。

```json
// package-lock.json の中身（抜粋）
{
  "node_modules/react": {
    "version": "19.2.0",
    "resolved": "https://registry.npmjs.org/react/-/react-19.2.0.tgz",
    "integrity": "sha512-..."
  }
}
```

これにより:

- **再現可能なインストール** が保証される
- 直接の依存だけでなく、**間接の依存**（dependency の dependency） まで固定される
- セキュリティ的にも `integrity` でファイルの完全性が確認される

ルール:

- **`package-lock.json` は必ず Git にコミット** する
- 競合が起きたら片側を採用して `npm install` を再実行する（手動マージはしない）
- pnpm なら `pnpm-lock.yaml`、yarn なら `yarn.lock`、Bun なら `bun.lock`（旧 `bun.lockb`）が同じ役割

### npm / pnpm / yarn / Bun

2026 年の選択肢は 4 つ。それぞれ「**仕事は同じだが内部の効率と機能が違う**」と理解します。

| | 速度 | ディスク効率 | 安定性 | モノレポ |
|---|---|---|---|---|
| npm | 標準 | 普通 | 抜群 | workspaces 対応 |
| pnpm | 速い | **抜群**（ハードリンク共有） | 抜群 | workspaces 対応 |
| yarn (v4 / Berry) | 速い | 普通〜良 | 良 | workspaces 対応 |
| Bun | **最速** | 良 | 改善中 | workspaces 対応 |

#### pnpm の利点

- 同じパッケージを複数プロジェクトで使う場合、**1 回しかディスクに置かない**（`~/.pnpm-store` に集約）
- 厳密な依存解決（**書いていない依存は import できない**）でバグを防げる
- `pnpm-workspace.yaml` でモノレポ管理

2026 年現在、**新規プロジェクトで pnpm を選ぶ現場が増えています**。Vue / Vite / Vitest など主要 OSS の公式推奨も pnpm。

#### Bun の利点

- インストールが **桁違いに速い**（並列ダウンロード + 効率的な書き込み）
- ランタイムも兼ねる（`bun run script.ts` で `tsx` 不要）
- 仕様が安定してきた 2026 年は、**新規 CLI / バックエンドで採用** が増えている

#### Yarn の現在地

- v1（Classic）は古い。新規には選ばない
- v4（Berry）は機能豊富だが、PnP モードは **採用が頭打ち**

#### 使い分けの目安

- **学習中 / Next.js 公式チュートリアル** → npm（公式が npm 前提のため）
- **業務で長く付き合う** → pnpm
- **試してみたい / インストールの速さ重視** → Bun

このコースの演習では基本 `npm` を使います。これは普及度の問題で、pnpm に置き換えても何も変わりません（コマンド名だけ違う）。

### `scripts` と `npm run`

`package.json` の `scripts` に書いたコマンドを `npm run xxx` で実行できます。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "test": "vitest",
    "format": "prettier --write ."
  }
}
```

ルール:

- `npm run dev` で `vite` が走る
- `npm run` だけで使えるスクリプト一覧が表示される
- 環境変数 `npm run` 内では `node_modules/.bin` が PATH に追加される（`vite` のパスを書く必要がない）
- `dev` / `start` / `test` / `restart` / `stop` は `npm run` を省略できる（`npm test` だけで動く）

#### スクリプトを連結する

```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "ci": "npm run lint && npm run typecheck && npm run test"
  }
}
```

`&&` で **前が成功した時だけ次** に進みます。CI 用のチェック一式をまとめるのに便利。

並列実行は `&` ではなく `npm-run-all` / `concurrently` を使うのが安全です。

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:client": "vite",
    "dev:server": "node server.js"
  }
}
```

#### pre / post スクリプト

`scripts` に `prebuild` / `postbuild` を書くと **`npm run build` の前後で自動実行** されます。

```json
{
  "scripts": {
    "prebuild": "npm run lint",
    "build": "vite build",
    "postbuild": "echo 'done'"
  }
}
```

便利ですが、**チームで把握しづらい** ので連鎖を多用しないほうが無難。最近は `husky` + `lint-staged` で commit hook に寄せる現場が増えています。

#### `npx` と `pnpm dlx` / `bunx`

「**一度だけ** コマンドを実行したい」場合の使い捨て実行。

```bash
npx create-next-app my-app    # one-shot で create-next-app を取得して実行
pnpm dlx create-next-app my-app
bunx create-next-app my-app
```

`npm install -g` でグローバルに入れずに済むのが利点。**最新版を使える** という意味でも安全。

### `engines` で Node.js のバージョンを縛る

```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

`engines` で要求するバージョンを書き、環境が満たさない時に警告 / 失敗させられます。`.nvmrc` / `.node-version` と組み合わせて、**チーム全員が同じ Node を使う** よう揃えます。

### `.npmrc` と `.nvmrc`

| ファイル | 役割 |
|---|---|
| `.npmrc` | npm 自身の設定（registry / cache / strict-peer-deps など） |
| `.nvmrc` | nvm が読む。プロジェクトで使う Node のバージョン |
| `.node-version` | nvm 以外（asdf / fnm / volta）が読む |

`.npmrc` の代表例:

```
strict-peer-deps=true
save-exact=true
registry=https://registry.npmjs.org/
```

### よくある事故

#### `npm install` の度に lock が更新される

→ `^` で書いてあると、新しい patch / minor が出ているとロックが更新される。意図しない更新を防ぐには **CI では `npm ci`** を使う。

#### `npm ci` と `npm install` の違い

- `npm install`: 必要に応じて `package-lock.json` を更新
- `npm ci`: lock の通りに **そのまま** 入れる（CI で **再現性が高く速い**）

#### グローバルインストールに頼らない

`npm install -g` で入れた CLI は **マシン全体に影響**。プロジェクトごとに違う版が必要な時に困る。`npm install -D` でプロジェクト依存にし、`scripts` から呼ぶのが基本。

## 演習

### ゴール

- `package.json` の依存とスクリプトを実際に編集する
- `npm ci` と `npm install` の差を体験する

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest pkg-sample -- --template react-ts
cd pkg-sample
npm install
```

### 手順 2: dependencies / devDependencies を区別する

```bash
npm install dayjs              # dependencies に入る
npm install -D vitest          # devDependencies に入る
```

`package.json` を開いて、それぞれが正しく入っていることを確認します。

```json
{
  "dependencies": {
    "dayjs": "^1.11.10",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.9.0",
    "vite": "^8.0.0",
    "vitest": "^3.0.0"
  }
}
```

### 手順 3: scripts を増やす

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "echo 'lint placeholder'",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "ci": "npm run lint && npm run typecheck && npm run test"
  }
}
```

`npm run ci` を実行して、3 つのスクリプトが順に走ることを確認します。

### 手順 4: lock の挙動を観察する

```bash
git init
git add .
git commit -m "init"

# package-lock.json を消して install
rm package-lock.json
npm install
git diff --stat package-lock.json
```

ハッシュや解決バージョンが微妙に変わっていることがあります（依存ツリー全体で再解決される）。これが「lock を Git に入れる理由」です。

### 手順 5: npm ci を試す

```bash
rm -rf node_modules
npm ci
```

`npm install` より速く、`package-lock.json` の通り **そのまま** 入ります。CI 環境でこれを使うのが定石。

### 期待出力

- `npm install dayjs` 後、`dependencies` に `dayjs` が追加される
- `npm install -D vitest` 後、`devDependencies` に `vitest` が追加される
- `npm run ci` で 3 ステップが順に走る
- `package-lock.json` を消して install すると差分が出る場合がある
- `npm ci` は lock 通りに高速に入る

### 変える

- `dayjs: "^1.11.10"` を `dayjs: "~1.11.10"` に変えて、`npm update` で何が更新されるか観察する
- `engines: { "node": ">=20" }` を加えて、古い Node で `npm install` が警告を出すことを確認する
- `prebuild` / `postbuild` を追加して連鎖実行を体験する

### 自分で書く（任意）

- pnpm / Bun を入れて、同じプロジェクトの `install` 速度を比べる
- モノレポ（`workspaces`）の最小構成を作って、共通の utility パッケージを 2 つのアプリから使う
- `.npmrc` で `save-exact=true` を設定し、`npm install dayjs` した時に `^` が付かなくなることを確認

## まとめ

- `package.json` は **メタ情報 / 依存 / スクリプト / ツール設定** の 4 つを担う
- `dependencies` / `devDependencies` / `peerDependencies` の使い分け
- semver の `^` は **MAJOR 固定 / MINOR・PATCH 自動更新**、`~` は MINOR まで固定
- `package-lock.json` を **必ず Git に入れる**。CI では `npm ci` で再現性を保つ
- パッケージマネージャは **npm / pnpm / yarn / Bun** の 4 択。新規業務開発は pnpm が増加傾向、最速重視なら Bun
- `scripts` は `npm run xxx` で起動。`&&` で連結、`pre` / `post` で連鎖
- `npx` / `pnpm dlx` / `bunx` で **一度だけ実行** できる
- `engines` と `.nvmrc` でチーム間の Node のバージョンを揃える
- 別のレッスンでは **Vite の仕組み** に進んで、開発サーバーとビルドの中身を覗く
