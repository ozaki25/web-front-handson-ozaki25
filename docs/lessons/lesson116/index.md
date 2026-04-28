# lesson116: 環境変数とシークレット管理

## ゴール

- `.env` / `.env.local` / `.env.production` などのファイルの **使い分け** が分かる
- Next.js / Vite の **`NEXT_PUBLIC_` / `VITE_`** プレフィックスの意味と公開範囲を説明できる
- Vercel / GitHub / Doppler / 1Password などの **シークレット管理サービス** の役割を理解する
- シークレットを **誤って Git にコミットしない** 仕組みを作れる
- 漏洩した時の対応の流れを知る

## 解説

### 環境変数とは

「**コードから見える値だが、コードと一緒に管理したくない**」値を入れる仕組みです。代表例:

- API のベース URL（環境ごとに違う）
- データベース接続文字列
- API キー / アクセストークン
- フィーチャーフラグの ON / OFF

これらを **コードに直書き** すると:

- 開発 / 本番の切り替えが面倒
- **シークレットが Git に残る**（git history に永久保存）

ので、環境変数で外に出します。

### `.env` ファイルの種類

Node.js / Next.js / Vite が読み込む慣習的なファイル名:

| ファイル | 読み込まれる場面 | コミット |
|---|---|---|
| `.env` | すべての環境で読まれる（あれば） | 場合による |
| `.env.local` | **ローカル開発時のみ**。同名キーを上書き | **NG**（gitignore） |
| `.env.development` | `NODE_ENV=development` 時 | OK（ただし秘密は書かない） |
| `.env.production` | `NODE_ENV=production` 時 | OK（ただし秘密は書かない） |
| `.env.test` | テスト時 | OK |
| `.env.example` | サンプル / テンプレート | **OK**（コミットする） |

#### `.gitignore`

```
.env*.local
.env
```

`.env.local` と `.env` は **絶対にコミットしない**。一方 `.env.example` は **必ずコミット** する（チームメンバーが何を設定すべきかの目安になる）。

#### `.env.example`

```
# データベース
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# API キー（実値ではなくダミー）
SENTRY_DSN=https://example@sentry.io/1234

# 公開して問題ない値
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

### Next.js の `NEXT_PUBLIC_` プレフィックス

Next.js（および Vite の `VITE_`）には **「クライアントに公開する値」を明示するルール** があります。

```
DATABASE_URL=postgres://...               ← サーバーのみ（漏れない）
SENTRY_AUTH_TOKEN=xxx                      ← サーバーのみ（漏れない）
NEXT_PUBLIC_API_URL=https://api.example.com ← クライアントにも露出
NEXT_PUBLIC_GA_ID=G-XXXX                    ← クライアントにも露出
```

ルール:

- **`NEXT_PUBLIC_` で始まる値だけ** がクライアントの JS バンドルに **インライン** される
- それ以外は **サーバー（API Route / Server Component / Middleware）でしか読めない**
- ビルド時に **値が文字列として埋め込まれる**（実行時のフェッチではない）

#### 露出する 例

```tsx
// app/page.tsx（Server Component でも Client Component でも）
const apiBase = process.env.NEXT_PUBLIC_API_URL; // ブラウザでも読める
```

ビルド後の JS には **値そのもの** が入ります。**シークレットを `NEXT_PUBLIC_` に置くのは事故** の元。

#### 露出しない 例

```ts
// app/api/users/route.ts（Route Handler）
export async function GET() {
  const dbUrl = process.env.DATABASE_URL; // サーバーのみ
  // ...
}
```

サーバー専用コードでは **プレフィックスなしの値** が読めます。クライアント側で同じコードを書くと `undefined` になる。

::: warning Server Component / Server Action の罠
Server Component / Server Action のソースを **Client Component に間接的に import** すると、Next.js のバンドラがコードをクライアント側に持ち込んでしまうことがあります。シークレットを参照するコードは **`"use server"` ファイル** に隔離するか、**`server-only`** パッケージを import して **誤って client にバンドルされたら build 時に失敗させる** のが安全です。

```ts
import "server-only"; // クライアントから import するとエラー
const dbUrl = process.env.DATABASE_URL;
```
:::

### Vite の `VITE_` プレフィックス

Vite は同じ仕組みで **`VITE_`** プレフィックス。

```
VITE_API_URL=https://api.example.com   ← import.meta.env.VITE_API_URL で読める
SECRET_KEY=do_not_expose                ← undefined（読めない）
```

```ts
console.log(import.meta.env.VITE_API_URL);  // OK
console.log(import.meta.env.SECRET_KEY);    // undefined
```

詳細は lesson105 でも触れた通り。

### 環境ごとの設定

Vercel に Next.js をデプロイする場合、`.env.production` などのファイルは使わず **Vercel 管理画面で設定** するのが普通です。

| 設定箇所 | 主な役割 |
|---|---|
| Vercel Dashboard → Settings → Environment Variables | Production / Preview / Development それぞれに値を設定 |
| `.env.local` | ローカル開発の上書き |

`vercel env pull .env.local` で **Vercel の値をローカルに引っ張ってくる** こともできます（同じ設定で動かしたい時に便利）。

### GitHub Secrets と Actions

GitHub Actions の workflow で使う API キーは **GitHub Settings → Secrets and variables → Actions** に登録。workflow からは `secrets.NAME` 構文（`$` と `{{ }}` の組合せ）で参照します。

**ファイルにベタ書きしない、ログに出さない、Pull Request の workflow で使わない** が三原則。

### シークレット管理の選択肢

#### サービス別

| サービス | 役割 |
|---|---|
| **Vercel Environment Variables** | Vercel デプロイのシークレット |
| **GitHub Actions Secrets** | CI のシークレット |
| **AWS Secrets Manager / Parameter Store** | AWS インフラ全体 |
| **Doppler** | 複数環境のシークレットを一元管理する SaaS |
| **1Password Connect / Secrets Automation** | 人と CI で同じシークレットを使う |
| **HashiCorp Vault** | エンタープライズ標準。OSS |
| **Infisical** | OSS のシークレット管理 |

「**ローカル開発 + CI + 本番** で同じ値を 1 箇所から配信したい」場合に Doppler / 1Password / Vault が役立ちます。

#### Doppler の最小例

```bash
doppler login
doppler setup
doppler run -- npm run dev   # .env を読まずに Doppler から値を流し込む
```

CI でも `doppler run --` 経由でビルドすれば、**GitHub Secrets を一切登録せずに** 動かせます。

### 「シークレットをコミットしない」仕組み

#### 1. `.gitignore` を整える

```
.env
.env.local
.env.*.local
```

#### 2. `git-secrets` / `gitleaks` で push 前にスキャン

```bash
# gitleaks（OSS、Go 製）
brew install gitleaks
gitleaks git .            # リポジトリ履歴全体をスキャン

# pre-commit フックで自動化
git config core.hooksPath .githooks
```

`.githooks/pre-commit`:

```sh
#!/bin/sh
# v8.18 以降は protect サブコマンドが廃止。git --pre-commit --staged で代替する
gitleaks git --pre-commit --staged --no-banner || exit 1
```

#### 3. GitHub の Secret Scanning

GitHub は **public リポジトリの push を自動でスキャン** し、AWS / Stripe / GitHub トークンなど主要な型を検出するとメールで通知します。**private リポジトリでも有効化** すると、組織のセキュリティが上がる（GitHub Advanced Security の機能）。

#### 4. Husky + lint-staged で運用に組み込む

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,env,yaml}": ["gitleaks git --pre-commit --staged --no-banner"]
  }
}
```

### 漏洩した時の対応

「`.env` を間違って push してしまった」を想定:

1. **すぐにそのキーを無効化**（rotate）
   - クラウドサービス（AWS / Stripe / Sentry）の管理画面で **キーを再生成**
   - GitHub に残った時点で **公開済み** とみなす（git history を消しても遅い）
2. **新しいキーを Vercel / GitHub Secrets に登録**
3. **チームに共有 + 監査ログをチェック**（不正利用がないか）
4. **任意で git history から削除**（`git filter-repo`）
   - **キーを無効化したあと** にやる。順番を逆にすると無意味

::: warning git history からの削除は事後処置
リポジトリが public なら、push した瞬間に **bot がスキャンして既にコピー** している可能性があります。**「消したから安全」ではなく、必ずキーを rotate** すること。
:::

### 設計の指針

#### 1. シークレットはサーバーで使う

ブラウザに渡す API キーは「**それが漏れても大丈夫な値**」だけ。本当の認証はバックエンド経由で。

#### 2. `NEXT_PUBLIC_` には機密を入れない

「Sentry DSN は公開しても良いと書いてあるからクライアントに置く」のは OK。けれど **DB 接続文字列 / OAuth クライアントシークレット** を `NEXT_PUBLIC_` に置くのは事故の温床。

#### 3. 必須値は起動時に検証

```ts
// utils/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

これで「**環境変数の設定漏れ** で本番が落ちる」を防げます。Zod / `t3-env` などのライブラリで型安全に。

#### 4. 個人別の値 / 共通の値を分離

| 値 | 置き場 |
|---|---|
| 個人の作業用 API キー | `.env.local`（gitignore） |
| チーム共通の URL | `.env.development`（コミット可） |
| 本番のシークレット | Vercel Environment Variables |

### よくある事故

#### 1. 本番 DB に開発から繋いでしまう

`DATABASE_URL` を `.env.local` で本番にして、勘違いしてマイグレーションを実行 → 本番データ破壊。

→ **本番のキーは個人の `.env.local` に置かない** ルールに。Vercel から `vercel env pull` する時も `--environment=development` を明示。

#### 2. `process.env.X` がビルドで消える

Next.js は **静的解析** でビルド時に置換するので、`process.env[key]` のような **動的アクセスは展開されない**。

```ts
const key = "NEXT_PUBLIC_API_URL";
process.env[key]; // undefined になりがち
process.env.NEXT_PUBLIC_API_URL; // OK
```

#### 3. `.env.production` をコミットしてしまった

→ 「**シークレットを外に置く**」を徹底。`.env.production` を使うなら **dummy 値** に。

#### 4. 古いキーが Slack に残っている

→ シークレット管理サービスの「**監査ログ**」とローテーションスケジュールを意識。

## 演習

### ゴール

- Next.js の Server / Client / Middleware で環境変数の **読み取り権限** を体感する
- gitleaks で push 前のチェックを入れる

### 手順 1: 新規プロジェクト

```bash
npx create-next-app@latest env-sample --ts --app
cd env-sample
```

### 手順 2: `.env.local` と `.env.example`

`.env.example`:

```
# 公開して OK
NEXT_PUBLIC_APP_NAME=EnvSample

# 公開 NG
SECRET_TOKEN=replace_me
```

`.env.local`（コミットしない）:

```
NEXT_PUBLIC_APP_NAME=ローカルの名前
SECRET_TOKEN=local-secret-xxx
```

### 手順 3: Server / Client で読み比べる

`app/page.tsx`（Server Component）:

```tsx
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Server Component</h1>
      <p>NEXT_PUBLIC_APP_NAME: {process.env.NEXT_PUBLIC_APP_NAME}</p>
      <p>SECRET_TOKEN（サーバー）: {process.env.SECRET_TOKEN ?? "なし"}</p>
    </main>
  );
}
```

`app/client/page.tsx`:

```tsx
"use client";

export default function ClientPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Client Component</h1>
      <p>NEXT_PUBLIC_APP_NAME: {process.env.NEXT_PUBLIC_APP_NAME}</p>
      <p>SECRET_TOKEN（クライアント）: {process.env.SECRET_TOKEN ?? "なし"}</p>
    </main>
  );
}
```

`npm run dev` してブラウザで両方確認します。

### 期待出力

| 場所 | NEXT_PUBLIC_APP_NAME | SECRET_TOKEN |
|---|---|---|
| Server Component | ローカルの名前 | local-secret-xxx |
| Client Component | ローカルの名前 | **なし** |

クライアントには **`NEXT_PUBLIC_` 以外が露出しない** ことを確認します。

### 手順 4: gitleaks を導入

```bash
brew install gitleaks       # macOS。Linux は go install / docker でも
# または: docker run -v $(pwd):/path zricethezav/gitleaks detect --source /path
```

リポジトリ直下で:

```bash
git init
echo "AWS_SECRET=AKIA1234567890ABCDEF" > test.txt
git add test.txt
gitleaks protect --staged
```

`AWS_SECRET` のような パターンが検出され、**push を止めるべき** 警告が出ます。

### 手順 5: pre-commit に組み込む

```bash
mkdir -p .githooks
cat > .githooks/pre-commit <<'EOF'
#!/bin/sh
gitleaks protect --staged --no-banner || exit 1
EOF
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

これで `git commit` の前に自動で gitleaks が走ります。

### 変える

- `process.env[key]` のような動的アクセスを書いて、ビルド後にどう展開されるか確認
- `import "server-only"` を入れたファイルを Client Component から import して **ビルドエラー** になることを確認
- Zod / t3-env で起動時の env 検証を組み込む

### 自分で書く（任意）

- Doppler を試して、`doppler run -- npm run dev` で `.env` なしの開発体験を作る
- Vercel に deploy し、Production / Preview で **異なる値** を設定する
- 漏洩シミュレーション: わざとリポジトリ（個人テスト用）に `.env` を push し、**キーをローテートする手順** をリハーサルする

## まとめ

- `.env` ファイルは **`.local` をコミットせず、`.example` を必ずコミット** する
- Next.js の **`NEXT_PUBLIC_`** / Vite の **`VITE_`** プレフィックスは「**クライアントに露出させる**」明示
- それ以外の値は **サーバー専用**。`server-only` パッケージで誤バンドルを防ぐ
- 設定の置き場は **Vercel Environment Variables** / GitHub Secrets / Doppler / Vault
- **gitleaks** + pre-commit / GitHub の Secret Scanning で push 前後のスキャン
- 漏洩したら **キーのローテートが最優先**。git history 削除は事後処置
- **起動時に Zod で env を検証** すると、設定漏れに早く気づける
- 「個人の値」「チームの値」「本番の値」を **置き場で分ける** ルールを決める
