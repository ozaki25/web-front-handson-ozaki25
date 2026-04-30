# lesson122: 依存性セキュリティ（npm audit / Dependabot）

## ゴール

- 「依存パッケージ経由で攻撃される」という **サプライチェーン** リスクを理解する
- `npm audit` のレポートを読み、優先度を判断できる
- **Dependabot / Renovate** で更新を自動化できる
- パッケージを採用する時の判断軸（DL 数 / メンテナンス / 依存の深さ）を持つ
- ロックファイル / 整合性検証 / SBOM の役割を知る

## 解説

### サプライチェーン攻撃とは

「自分のコードは安全」でも、**依存している npm パッケージ** が改ざんされると、そのまま自分のサイトに **攻撃コードが配布** されます。実際に過去:

- `event-stream` 事件（2018）: 人気ライブラリの管理権限を譲り受けた攻撃者が暗号通貨ウォレット狙いのコードを混入
- `colors.js` / `faker.js` 事件（2022）: 作者本人が抗議で暴走コードを混入
- typosquatting: `react-doom`（react-dom の typo）のような偽パッケージ

これらは npm 公式に公開されたパッケージ経由で広がります。**依存ツリー** が深くなるほど面が広がり、リスクも増す。

### npm audit

`npm audit` は **既知の脆弱性 DB**（GitHub Advisory Database） に対し、現在の依存ツリーをチェックします。

```bash
npm audit
```

出力例:

```
# npm audit report

semver  <5.7.2
Severity: high
ReDoS in semver - https://github.com/advisories/GHSA-c2qf-rxjj-qqgw
fix available via `npm audit fix`
node_modules/semver

5 vulnerabilities (2 high, 3 moderate)
```

### 重要度（Severity）

| レベル | 対応の目安 |
|---|---|
| **critical** | 即座に対応。本番が止まっても直す |
| **high** | 計画的に修正、長くて 1 週間 |
| **moderate** | 月次でまとめて対応 |
| **low** | 余力で対応 |

### `npm audit fix`

```bash
npm audit fix
```

semver の範囲内で **自動アップデート** します。安全だが、メジャーバージョン更新が必要なケースは手動。

```bash
npm audit fix --force
```

`--force` で **メジャーアップデート込み** で直してくれますが、**破壊的変更** が混じる可能性があります。CI / 動作確認とセットでないと危険。

### 「audit だけ」では足りない

`npm audit` の限界:

- **devDependencies の脆弱性** がノイズになりやすい（本番に届かないものまで警告）
- **fix なし** の脆弱性は手動で対処するしかない
- **新しい脆弱性** は DB に登録された後に通知される（ゼロデイには無力）

→ **audit + 自動アップデート + パッケージ選定** の三本柱で守る。

### Dependabot

GitHub の純正サービス。**依存パッケージのバージョンを自動で PR 作成** してくれます。

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      production:
        dependency-type: "production"
      development:
        dependency-type: "development"
```

挙動:

- **毎週月曜** に依存をチェック
- 更新があれば PR を作る（`production` / `development` でグループ化）
- セキュリティ脆弱性は **常時監視** され、即時 PR

GitHub の **「Security」タブ** に Dependabot Alerts が並びます。

### Renovate

[Renovate](https://docs.renovatebot.com/) は OSS の代替。Dependabot より **設定が柔軟** で、Bot が活発に開発されています。

`renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":dependencyDashboard"
  ],
  "schedule": ["before 9am on monday"],
  "packageRules": [
    {
      "matchPackagePatterns": ["^@types/"],
      "groupName": "type definitions"
    },
    {
      "matchUpdateTypes": ["patch", "minor"],
      "automerge": true
    }
  ]
}
```

特徴:

- **Group で複数パッケージをまとめて** PR
- `automerge: true` で **CI 通過すれば自動マージ**（patch だけなど安全範囲）
- Dependency Dashboard の Issue で **全更新を一覧** できる
- monorepo / 言語 / Docker などへの対応が広い

「Dependabot は標準、Renovate はもっと管理したい場合」の使い分け。

### Socket と OSV-Scanner

audit では拾えない攻撃を補う 2 つのツール。

#### Socket

[socket.dev](https://socket.dev/) は **疑わしいパッケージの挙動** を静的解析で検知。`postinstall` でネットに繋いだ / 環境変数を読んだ / shell を起動した、などのフラグを立てます。

```bash
npx @socketsecurity/cli scan
```

GitHub Actions で **PR 単位** に新規依存をスキャンする運用も可能。

#### OSV-Scanner（Google）

```bash
npx osv-scanner -L package-lock.json
```

OSV.dev という横断的脆弱性 DB を参照。Python / Go / Rust などにも使えます。

### 整合性検証

`package-lock.json` には各パッケージの **`integrity`** フィールドがあり、ハッシュで完全性を確認します。

```json
{
  "node_modules/react": {
    "version": "19.2.0",
    "integrity": "sha512-...",
    "resolved": "https://registry.npmjs.org/react/-/react-19.2.0.tgz"
  }
}
```

`npm ci` は **lock の通りにそのままインストール** し、ハッシュが合わなければエラー。CI ではこれを使って改ざんを検知。

### SBOM（Software Bill of Materials）

「ソフトウェアの **部品表**」。何のパッケージをどのバージョンで使っているかを **機械可読な形式**（SPDX / CycloneDX） で出力します。

```bash
npm sbom --sbom-format=cyclonedx > sbom.json
```

なぜ必要:

- 新しい脆弱性が報告された時、**自社のどのプロダクトが影響を受けるか** を即座に確認できる
- 米国の調達基準では SBOM の提出を求めるケースが増えている

GitHub には **Dependency Graph** が組み込みで、リポジトリの依存を可視化してくれます。

### パッケージを採用する時の判断軸

新しい npm パッケージを入れる時、次を見る習慣を。

#### 1. ダウンロード数

[npmtrends](https://npmtrends.com/) でダウンロード推移を確認。**月数百万 DL** あると安定。**急増** はバズ後で挙動が変わるかも、**減少** はメンテナンスが止まった可能性。

#### 2. メンテナンスの頻度

GitHub の **コミット頻度 / 最終リリース日 / 未解決 Issue 数** をチェック。**3 ヶ月コミットがない** と要注意。

#### 3. 依存の深さ

`npx npm-why some-package` や [Bundlephobia](https://bundlephobia.com/) で **どんな子依存を引っ張ってくるか** を見る。**子依存が深い** とサプライチェーン面が広がる。

#### 4. ライセンス

MIT / Apache 2.0 / BSD は OK。**GPL** は公開要件があるので業務利用前に法務確認。

#### 5. メンテナーの質

GitHub の **メンテナー一覧** / セキュリティポリシーの整備状況。**1 人メンテナンス** はリスクが集中する。

#### 6. 代替案

「**標準で書ける** ことを依存追加で済ませていないか」を再検討。`Date.now()` / `fetch` / `Intl` / `Set` など、**ブラウザ / Node 標準で書ける** ものは依存を入れない方がよい。

### ゼロデイへの備え

audit に載る前の脆弱性（ゼロデイ）への対処は限定的:

- **GitHub Advisory** をウォッチ
- **新パッケージの即採用は避ける**（少なくとも数日寝かせる）
- **`postinstall` を実行しないインストール**（`--ignore-scripts`）を CI で
- **lockfile を厳しく**（`npm ci`、`pnpm install --frozen-lockfile`）

### おすすめの基本セット

最小構成:

1. **Dependabot Alerts ON**（GitHub の Security タブ）
2. **Dependabot version updates** で週次 PR
3. **CI で `npm audit --omit=dev`** を実行（本番依存だけチェック）
4. **`npm ci`** で lockfile 通りインストール
5. **SBOM をビルド成果物に含める**（後で照会できる）

これで「**最低限** のサプライチェーン対策」になります。

## 演習

### ゴール

- `npm audit` を読む
- Dependabot を有効にして PR が来る状態を作る
- 新しいパッケージを採用する判断材料を集める

### 手順 1: 既存プロジェクトで audit

```bash
cd /path/to/your-project
npm audit
npm audit --json | jq '.metadata.vulnerabilities'
```

`.metadata.vulnerabilities` で重要度ごとの件数が JSON で見えます。

### 手順 2: 自動修正を試す

```bash
npm audit fix       # semver 範囲内で自動更新
git diff package*.json
```

修正後は **必ず動作確認 + テスト**。

### 手順 3: Dependabot を有効化

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: { interval: "weekly" }
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
```

GitHub の **Settings → Code security → Dependabot alerts** を ON。`Settings → Code security → Dependabot security updates` も ON。

### 手順 4: パッケージ採用の練習

候補: `dayjs` / `date-fns` / `luxon`

それぞれを次の観点で比較:

- npmtrends の DL 推移
- GitHub のメンテナンス頻度
- Bundlephobia のサイズと依存
- TypeScript 型定義の有無
- ライセンス

採用する 1 つを決めて、`npm install` する。

### 手順 5: SBOM を出す

```bash
npm sbom --sbom-format=cyclonedx --omit=dev > sbom.json
ls -la sbom.json
```

### 期待出力

- `npm audit` で脆弱性の表が出る（または `0 vulnerabilities`）
- Dependabot を有効化すると **数時間〜1 日で初回の PR / Alert** が来る
- パッケージ比較の表ができ、採用根拠を説明できる
- SBOM の JSON が生成される

### 変える

- `dependabot.yml` の `interval` を `daily` に変えて頻度を上げる
- `automerge: true` のルールで patch 更新を自動マージにする
- CI に `npm audit --omit=dev --audit-level=high` を追加して **high 以上で fail** にする

### 自分で書く（任意）

- Renovate を導入し、Dashboard Issue で全更新を一覧する
- Socket / OSV-Scanner を CI に組み込む
- 自社で許可するライセンスを決め、許可外があれば fail するルールを CI に書く

## まとめ

- 自分のコードが安全でも **依存パッケージ経由** で攻撃される（サプライチェーン）
- **`npm audit`** で既知の脆弱性をチェック。Severity に従って対応
- 自動修正は `npm audit fix`、メジャー込みなら `--force`（要動作確認）
- **Dependabot / Renovate** で依存更新を自動 PR 化
- `npm audit` の補完に **Socket / OSV-Scanner**
- **lockfile + `npm ci` + integrity** で改ざん検知
- **SBOM** で「自社の何が影響を受けるか」を素早く特定
- 新しいパッケージは **DL 数 / メンテ頻度 / 依存の深さ / ライセンス** で判断
- 「**標準で書けるなら依存しない**」が最大の防御
