# lesson116: CI/CD パイプラインの設計

## ゴール

- 「CI」と「CD」を正しく区別して語れる
- パイプラインを **段階**（lint → test → build → deploy） に分けて設計できる
- GitHub Actions の **キャッシュ / マトリクス / 並列ジョブ** で速くする
- Lighthouse CI で速度劣化を **PR 単位** で検知できる
- Vercel の **Preview Deployment** とテストを連携できる

::: tip 前提
このレッスンは「GitHub Actions で CI」の発展編です。基本構文（`workflow_dispatch` / `on: push` / `actions/checkout`）は「GitHub Actions で CI」を参照してください。
:::

## 解説

### CI と CD の違い

| 略 | 正式名称 | やること |
|---|---|---|
| **CI** | Continuous Integration（継続的インテグレーション） | コードをこまめに統合し、**自動でテスト** |
| **CD** | Continuous Delivery（継続的デリバリ）または Deployment（継続的デプロイ） | テストを通ったコードを **自動でリリース** |

「ボタン 1 つでデプロイ」が **Continuous Delivery**、「main にマージ → そのまま本番へ」が **Continuous Deployment**。両方とも略称が CD。

### パイプラインの基本構成

<img src="/diagrams/cicd-pipeline-design.svg" alt="push/PR をトリガーに lint・typecheck・test が並列実行され、すべて成功すると build が走る。main マージ時のみさらに deploy が実行される。" class="diagram" />

ポイント:

- **lint / test / typecheck は並列**（独立しているので速い）
- **build は依存** が解決した後（手戻りを早く検知）
- **deploy は最後** にする
- **PR では deploy しない**（preview deployment は別フロー）

### GitHub Actions の最小パイプライン

`.github/workflows/ci.yml`:

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
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test

  build:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
```

`needs:` で **前のジョブが成功した時だけ** 次に進みます。

### キャッシュで速くする

毎回 `npm ci` するとパッケージダウンロードに 30 秒〜1 分かかります。`actions/setup-node@v6` の `cache: npm` で **`~/.npm` をキャッシュ** すれば数秒に短縮されます。

#### `actions/cache` で任意のディレクトリ

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

Next.js なら `.next/cache` を保存すると **増分ビルド** が効いて高速。

::: warning キャッシュの落とし穴
キャッシュ key の設計がずれると **古いキャッシュを掴んでバグる** ことがあります。`package-lock.json` のハッシュを必ず key に含める / 想定外の挙動が出たら手動で **caches を削除** する。
:::

### マトリクスビルド

複数の Node.js バージョン / OS で同時にテストする時に便利。

```yaml
test:
  runs-on: ${{ matrix.os }}
  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
      node: [20, 22]
  steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v6
      with: { node-version: ${{ matrix.node }} }
    - run: npm ci
    - run: npm test
```

これだけで **OS 3 種 x Node 2 種 = 6 並列** のテストが走ります。OSS ライブラリなどで重宝。

### 並列の使いどころ

- **Lint / Typecheck / Test を並列に**
- **Unit / E2E を分ける**（E2E は遅いので別ジョブ）
- **Storybook ビルドを別ジョブに**
- **Cypress / Playwright を shard** で分割

シャーディング例（Playwright）:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

### CD（デプロイ）の戦略

#### Vercel / Netlify / Cloudflare Pages を使うなら

これらのサービスは **GitHub と連携するだけで自動デプロイ** されます。`.github/workflows/deploy.yml` を書く必要すらありません。**main = 本番、PR = Preview** が自動。

#### 自前でデプロイする時の最小例

```yaml
deploy:
  if: github.ref == 'refs/heads/main'
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v6
      with: { node-version: 22, cache: npm }
    - run: npm ci
    - run: npm run build
    - run: npm run deploy
      env:
        DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

`if: github.ref == 'refs/heads/main'` で **main 限定** にする。

### Vercel の Preview Deployment と組み合わせる

Vercel は PR ごとに **プレビュー URL**（`https://my-app-git-feature-x.vercel.app`）を作ります。これを使うと:

- レビュアーが **動作確認しながら** レビューできる
- E2E テストを **本番に近い環境** で走らせられる
- Lighthouse CI を **プレビュー URL に対して** 実行できる

#### プレビュー URL に E2E を回す

```yaml
e2e:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v6
      with: { node-version: 22, cache: npm }
    - run: npm ci
    - run: npx playwright install --with-deps
    - name: Wait for Vercel preview
      uses: patrickedqvist/wait-for-vercel-preview@v1
      id: vercel
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        max_timeout: 300
    - run: npx playwright test
      env:
        BASE_URL: ${{ steps.vercel.outputs.url }}
```

### Lighthouse CI

PR 単位で **Lighthouse スコアの劣化** を検知します。

```bash
npm install -D @lhci/cli
```

`lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["https://example.com/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

GitHub Actions で:

```yaml
lighthouse:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v6
      with: { node-version: 22, cache: npm }
    - run: npm ci
    - run: npx lhci autorun
```

スコアが基準を下回ると **CI が fail** するので、性能劣化が main に入る前に止められます。

### シークレットの取り扱い

- API キー / トークンは **GitHub Settings → Secrets** に登録し、workflow から `secrets.NAME` の形（`$` と `{{ }}` の組み合わせ）で参照
- workflow ファイルに **平文で書かない**
- **fork からの Pull Request** に対する `pull_request` トリガーでは **secrets は読めません**（空文字列になります）。これは「fork してきた攻撃者が悪意ある workflow を入れて secrets を盗む」サプライチェーン攻撃を防ぐためです。CI で secrets が必要な処理は「自分のリポジトリ内のブランチからの PR」だけで動くように分けます
- `pull_request_target` を使うと fork PR でも secrets が読めますが、**fork の悪意あるコードがそのまま走るため極めて危険** です。利用は「ラベル付けや welcome コメント等、コードを実行しない処理に限る」のが鉄則です

### 環境（Environment）の活用

`environment: production` を指定すると:

- Required reviewers（**承認が必要**）
- Wait timer（**N 分待つ**）
- Branch policy（**main 限定**）
- 環境固有のシークレット（`PRODUCTION_DB_URL` など）

を設定できます。**本番デプロイに人手の承認を入れる** のに便利。

```yaml
deploy-prod:
  environment: production
  runs-on: ubuntu-latest
  steps: ...
```

### 再利用可能な workflow

組織内で **同じ workflow を複数リポジトリで使う** 場合、**reusable workflow** が便利。

```yaml
# .github/workflows/_node-ci.yml（呼ばれる側）
on:
  workflow_call:
    inputs:
      node-version: { type: string, default: "20" }
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: ${{ inputs.node-version }}, cache: npm }
      - run: npm ci
      - run: npm run lint && npm run test
```

```yaml
# 呼び出す側
jobs:
  ci:
    uses: my-org/.github/.github/workflows/_node-ci.yml@main
    with:
      node-version: "22"
```

### 失敗を早く検知するコツ

- **fail-fast: false** にすると、1 つ失敗しても他のマトリクスが続行する。原因の切り分けに便利
- **`continue-on-error: true`** を一時的に付けると、失敗しても次に進む（実験的なジョブで）
- **`timeout-minutes`** を設定して暴走を止める
- 失敗したジョブの **アーティファクト**（スクリーンショット / ログ）を `actions/upload-artifact` で保存

### コスト管理

GitHub Actions は **public リポジトリは無料**、private は **月 2,000 分** まで無料（有料プランで増える）。コストを抑えるコツ:

- **キャッシュ** で `npm ci` の時間を削る
- **早く失敗するジョブを先に**（lint で 10 秒で落ちれば後続が走らない）
- **paths フィルタ** で対象を絞る（ドキュメント変更だけなら CI スキップ）

```yaml
on:
  pull_request:
    paths:
      - "src/**"
      - "package*.json"
```

## 演習

### ゴール

- 既存プロジェクトに **lint → typecheck → test → build** の並列パイプラインを構築する
- キャッシュを効かせて 2 倍速にする

### 手順 1: ベースのプロジェクト

```bash
npm create vite@latest cicd-sample -- --template react-ts
cd cicd-sample
npm install
git init && git add . && git commit -m "init"
```

GitHub にリポジトリを作って push。

### 手順 2: scripts を整える

`package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

ESLint 設定 / 簡単な test は省略可。

### 手順 3: workflow

`.github/workflows/ci.yml`:

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

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test

  build:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
```

### 手順 4: PR を作って動作確認

```bash
git checkout -b feature/test
echo "// test" >> src/App.tsx
git commit -am "test"
git push -u origin feature/test
```

PR を開くと、GitHub の Actions タブで **lint / typecheck / test が並列で走り、終わったら build** が動くのを確認できます。

### 期待出力

- 4 つのジョブが Actions のタブに並ぶ
- 1 回目は `npm ci` が遅い（30 秒〜）、2 回目以降はキャッシュが効いて速い（数秒）
- どれか fail すると build が走らない（`needs:` のおかげ）

### 変える

- `paths:` フィルタを追加して、`docs/**` だけの変更で CI を走らせない
- マトリクスを使って Node 20 と 22 の両方でテストする
- `if: github.ref == 'refs/heads/main'` の deploy ジョブを追加する

### 自分で書く（任意）

- Lighthouse CI を組み込み、Performance スコア 90 未満で fail させる
- Vercel に連携して PR で Preview URL が作られる構成にする
- Reusable workflow を別リポジトリに切り出して、複数プロジェクトから呼ぶ
- `environment: production` で本番デプロイに承認ステップを入れる

## まとめ

- **CI** はテスト統合、**CD** はデプロイ。**パイプライン** はその段階を並べたもの
- **lint / typecheck / test を並列**、build は `needs:` で待たせるのが基本形
- **キャッシュ**（`actions/setup-node@v6` の `cache: npm` / `actions/cache`）で大幅に高速化
- **マトリクスビルド** で OS / Node のバージョン違いを同時にテスト
- **Vercel / Netlify / Cloudflare Pages** を使えば CD は GitHub 連携だけで完結
- **Preview Deployment** で E2E と Lighthouse CI を本番に近い環境で実行
- **シークレット** は GitHub Secrets に置く。**`environment: production`** で承認ゲート
- **paths フィルタ / 早く失敗するジョブ先頭** でコストを抑える
