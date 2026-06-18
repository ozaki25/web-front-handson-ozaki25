# lesson115: GitHub Actions で CI

## ゴール

- CI / CD の意味と価値を説明できる
- GitHub Actions のワークフロー YAML の基本構造を読める
- push / pull_request トリガーで Lint / Test / Build を自動実行できる
- 失敗時の通知・ステータスバッジ・キャッシュの基本を知る
- ブランチ保護ルールに **CI 必須** を組み合わせる
- Vercel / Netlify の Preview Deployment が裏でやっていることを理解する

## 解説

### CI / CD とは

- **CI**（Continuous Integration、継続的インテグレーション）: コードをリポジトリに統合する **そのたびに** 自動でビルド / テスト / Lint を回す仕組み
- **CD**（Continuous Delivery / Deployment、継続的デリバリー / デプロイ）: 統合に成功したら自動でステージング / 本番にデプロイする仕組み

CI が崩れたまま開発を続けると、**「どの変更で壊れたか分からない」** 状態になります。1 つの PR ごとに「壊れていない」を保証することで、main は常に動く状態を保てます。

### GitHub Actions とは

GitHub に組み込まれた CI / CD プラットフォームです。`.github/workflows/` 配下に YAML ファイルを置くだけで、push / PR / スケジュール / 手動実行などのトリガーで処理を実行できます。**Public リポジトリは無料・無制限** で実行できます。Private リポジトリは Free プランで月 2,000 分まで（執筆時点）、Pro / Team / Enterprise で枠が増えます。

主要な競合: **CircleCI** / **GitLab CI** / **Travis CI**。GitHub を使っているなら Actions が一番自然です。

### 最小のワークフロー

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run test:run
```

このファイルを **commit + push** すると、GitHub Actions タブに最初の実行が現れ、自動で:

1. Ubuntu の仮想マシンを起動
2. リポジトリを `checkout`
3. Node.js 22 をセットアップ（npm キャッシュも有効化）
4. `npm ci` で依存パッケージをインストール
5. `npm run test:run` でテストを実行

### 構造を読む

- **`name`**: ワークフローの表示名
- **`on`**: トリガー条件
  - `push.branches`: 指定ブランチへの push で実行
  - `pull_request.branches`: 指定ブランチを **マージ先** にする PR で実行
  - `schedule`: cron 式で定期実行
  - `workflow_dispatch`: 手動実行
- **`jobs`**: 並列実行できる仕事の単位
- **`runs-on`**: 実行環境（`ubuntu-latest` / `macos-latest` / `windows-latest`）
- **`steps`**: 順番に実行する処理
  - `uses: actions/...@v4`: 既製のアクションを使う
  - `run: ...`: シェルコマンドを実行

<img src="/diagrams/github-actions-pipeline.svg" alt="push / pull_request がトリガーになり、lint・test・build の 3 つの job が並列実行される。各 job は checkout → setup-node → npm ci → コマンド の steps を順に実行し、すべて成功すると PR マージ可になる。" class="diagram" />

### Lint / テスト / ビルドを並列で

実用的には次のような構成です。

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run test:run

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
```

3 つの job が **並列で実行** されます。1 つでも fail すると全体が fail として扱われ、PR ページに赤い X が出ます。

### キャッシュで速くする

`actions/setup-node@v6` の `cache: npm` を指定するだけで、`~/.npm` の中身がキャッシュされます。2 回目以降の `npm ci` が秒速で終わります。

`pnpm` / `yarn` の場合も同様にキャッシュキーを指定できます。

### マトリクスで複数バージョンをテスト

```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      node: [20, 22]
  steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v6
      with: { node-version: ${{ matrix.node }}, cache: npm }
    - run: npm ci
    - run: npm run test:run
```

これで Node 20 と 22 の両方で同じテストが走ります。複数 OS（`os: [ubuntu, macos, windows]`）も同様。

### 環境変数とシークレット

機密情報（API キー / Vercel トークン等）はリポジトリ設定の **Settings → Secrets and variables → Actions → New repository secret** に登録します。ワークフローからは:

```yaml
- run: deploy --token $VERCEL_TOKEN
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

YAML やコードに **直接書くと公開されてしまう** ので絶対に避けます。

### ステータスバッジ

`README.md` の冒頭に CI バッジを貼ると、ブランチが「動く状態か」が一目で分かります。

```md
[![CI](https://github.com/your-name/your-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-name/your-repo/actions/workflows/ci.yml)
```

緑のチェックは通過、赤は失敗していることを一目で示すアイコンで、OSS では事実上の必須記号として扱われます。

### ブランチ保護と CI 必須

「GitHub の PR とコードレビュー」で設定したブランチ保護に **「Require status checks to pass before merging」** を追加し、`lint` / `test` / `build` の各 job を必須に指定します。

これで:

- CI が通っていない PR は **マージ ボタンが押せない**
- 「テスト書いてあるけど動かしたら fail してた」が起きなくなる
- 安心して main を信じられる

### Vercel / Netlify との関係

Vercel / Netlify の **Preview Deployment** は、内部で GitHub Actions と似た仕組みを動かしています。PR を作るたびに **そのブランチの内容で本物のサイトを一時デプロイ** してくれて、URL が PR にコメントされます。

CI（GitHub Actions）と Preview Deployment は **役割が違う** ので両方使うのが普通です:

- **CI**（Actions）: テストや Lint で「壊れてないか」を機械的に検証
- **Preview Deployment**: 「本物の動作を人間がブラウザで確認」する場所

### よく使う公式アクション

| アクション | 用途 |
|---|---|
| `actions/checkout@v6` | リポジトリを checkout |
| `actions/setup-node@v6` | Node.js セットアップ |
| `actions/cache@v5` | 任意のディレクトリをキャッシュ |
| `actions/upload-artifact@v7` | テスト結果やビルド成果物を保存 |
| `actions/download-artifact@v8` | 保存した成果物を取り出す |

| `pnpm/action-setup` | pnpm セットアップ（Node とは別途） |

`actions/checkout` のバージョンは年に数回更新されます。最新版は <https://github.com/marketplace?type=actions> で確認できます。

## 演習

### ゴール

- 「GitHub の PR とコードレビュー」で作ったリポジトリに `.github/workflows/ci.yml` を追加する
- PR を作って CI が走るのを確認する
- ブランチ保護に CI 必須を追加する

### 手順 1: Vitest で最小テストを用意

リポジトリに Vitest を追加し、実際に動くテストを 1 本書きます。

```bash
npm install -D vitest
```

`package.json` の `scripts`:

```json
{
  "scripts": {
    "test:run": "vitest run",
    "lint": "echo 'Lint 実行'",
    "build": "echo 'Build 実行'"
  }
}
```

`src/sum.test.ts`（テストファイル）:

```ts
import { describe, it, expect } from "vitest";

function sum(a: number, b: number) {
  return a + b;
}

describe("sum", () => {
  it("1 + 2 = 3", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

ローカルで `npm run test:run` を実行し、`✓ src/sum.test.ts` が出ることを確認します。

**CI が fail する体験**: `toBe(3)` を `toBe(999)` に変えて push すると、GitHub Actions が赤くなり PR がマージできなくなります（確認したら戻す）。

### 手順 2: ワークフローを書く

`.github/workflows/ci.yml`（プロジェクトルートから見たパス）:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
```

### 手順 3: ブランチで commit + push

```bash
git switch -c chore/ci
mkdir -p .github/workflows
# 上記 ci.yml を保存
git add .github package.json src/sum.test.ts
git commit -m "chore: GitHub Actions で CI を追加"
git push -u origin chore/ci
```

### 手順 4: PR を作って CI を観察

GitHub のリポジトリ → PR を作成。

PR ページに **「Some checks haven't completed yet」** が出て、しばらくすると **「All checks have passed」** に変わるはずです。**Details** リンクから個別の job ログを見られます。Vitest の出力（`✓ sum > 1 + 2 = 3`）が Actions ログに表示されます。

PR 内で右側の **Checks** タブを開くと、各 step ごとの所要時間とログが時系列で見られます。

### 手順 5: ブランチ保護に CI 必須を追加

リポジトリの **Settings → Branches → main → Edit rule**:

- **Require status checks to pass before merging** にチェック
- 検索ボックスに `ci` と入力 → 表示されたチェックを **必須** に登録
- 保存

これ以降、CI が成功していない PR はマージできなくなります。試しに `ci.yml` をわざと壊して push してみると、CI が fail して PR がマージできない状態になります（確認したら戻す）。

### 期待出力

- PR ページに緑のチェック「All checks have passed」が出る
- Actions タブにワークフロー実行履歴が並ぶ
- ブランチ保護でマージボタンが無効化される（CI 失敗時）

### 変える

- ジョブを 3 つに分割（lint / test / build）して並列実行に変える。CI 全体の時間が短くなる
- `runs-on` を `windows-latest` に変えて Windows でも動くか確認（Vite / Next なら通常 OK）
- `if: github.event_name == 'pull_request'` を追加して、特定の job を PR 時だけ実行
- `actions/cache@v5` で `~/.cache/Cypress` などをキャッシュして E2E を速くする

### 自分で書く

- README に CI バッジを貼る
- Vercel デプロイのプレビュー URL を Lighthouse CI で計測するワークフローを足す（`treosh/lighthouse-ci-action@v12`）
- Slack 通知を `if: failure()` で組み込む

## まとめ

- **CI** は push / PR のたびに自動でビルド / テスト / Lint を回す仕組み
- GitHub Actions は **`.github/workflows/*.yml`** に書くだけで動く
- 構造: `on`（トリガー）→ `jobs`（並列の仕事）→ `steps`（順次のコマンド / アクション）
- `actions/checkout` + `actions/setup-node` が定番の出発点。`cache: npm` で 2 回目以降が爆速
- マトリクスで複数 OS / 複数 Node バージョンを並列テストできる
- シークレットは **Settings → Secrets** に登録し、ワークフロー内で `secrets.NAME` を参照（具体的な記法は本文の YAML 例を参照）
- ブランチ保護で **CI 必須** に設定すると安全
- Vercel / Netlify の Preview Deployment は CI とは別の役割（実機確認）
- Lighthouse CI / Slack 通知 / Artifact 保存などの拡張が豊富
