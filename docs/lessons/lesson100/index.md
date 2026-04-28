# lesson100: E2E テスト — Playwright

## ゴール

- E2E テストとユニット / コンポーネントテストの違いを説明できる
- Playwright をプロジェクトにセットアップできる
- `page.goto` / `page.getByRole` / `page.click` でブラウザ操作を書ける
- Playwright の **`expect`** で UI の状態を検証できる
- ヘッドレスモードと UI モード（`--ui`）の使い分けを知る
- 失敗時のスクリーンショット / トレース / ビデオの仕組みを理解する
- E2E は「ビジネスクリティカルな経路」だけに絞る判断軸を持てる

## 解説

### E2E テストの位置付け

これまでに学んだテストの違いを再確認します。

| 種類 | 範囲 | 速度 | 頻度 |
|---|---|---|---|
| ユニット (Vitest) | 関数 1 つ | 速い（ms） | 多い（70%） |
| コンポーネント (RTL) | コンポーネント | 中間（数十 ms） | 中間（20%） |
| E2E (Playwright) | アプリ全体 | 遅い（秒） | 少ない（10%） |

E2E は **本物のブラウザを起動して、ユーザーが実際にやる操作の流れ全体を再現** します。「フォームに入力 → 送信 → 別ページに遷移 → 一覧に表示される」のような **複数画面にまたがる経路** を 1 つのテストで検証できます。

代償は速度と安定性です。E2E は本物のブラウザを起動するぶん遅く、ネットワーク事情で fail することもあります。だから「最重要パスだけ」に絞るのが鉄則です。

### Playwright とは

**Playwright** は Microsoft 製の E2E テストフレームワークです。2026 年現在、Cypress と並ぶ二大選択肢で、新規プロジェクトでは Playwright が選ばれることが増えています。

特徴:

- Chromium / Firefox / WebKit（Safari エンジン）の **3 ブラウザを 1 つの API で** 操作できる
- **自動待機**: 要素が現れるまで自動で待つので、`waitFor(...)` を書かなくてよい
- **トレース・ビデオ・スクリーンショット** が失敗時に自動保存される
- **codegen** で操作を録画してテストコードを生成できる
- **UI モード**（`npx playwright test --ui`）で対話的にデバッグできる

### セットアップ

Vite + React プロジェクトに Playwright を追加します。

```bash
npm install -D @playwright/test
npx playwright install   # ブラウザ本体（Chromium / Firefox / WebKit）をダウンロード
```

> StackBlitz のブラウザ環境では `npx playwright install` でブラウザ本体を取れない場合があります。Playwright はローカル環境で動かすのが基本です。本レッスンは「読みながら手元で試す」前提で進めてください。

`playwright.config.ts` を作成（最小形）:

```ts
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  retries: isCI ? 2 : 0,                 // CI では失敗時に 2 回まで再実行
  reporter: isCI ? "github" : "list",    // CI では GitHub Actions 連携形式
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",             // 失敗時にトレースを保存
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // 必要に応じて WebKit / Firefox を足す
  ],
  webServer: {
    // CI では prod build を preview 配信して E2E（dev サーバーは HMR で揺れやすい）
    command: isCI ? "npm run build && npm run preview" : "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !isCI,
  },
});
```

`webServer` を書いておくと、テスト実行時に **自動でアプリを起動** してから E2E を回してくれます。`retries` / `projects` / 環境別の `command` を最初から入れておくと、後で CI に乗せるときに迷いません。

`package.json` に scripts を追加:

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

### 最小の E2E テスト

`e2e/home.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("トップページに見出しが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("About リンクをクリックすると /about に移動する", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL("/about");
});
```

ポイント:

- `page.goto("/")` で baseURL（`http://localhost:5173`）に対して相対パスで遷移
- `page.getByRole(...)` は React Testing Library と **同じセレクタ思想**（アクセシビリティロール優先）
- `expect(...).toBeVisible()` 等は **自動で待ってくれる**（要素が出るまで最大 5 秒待つ）
- すべて `await` を付けて呼ぶ（非同期）

Playwright と Testing Library のクエリ API はほぼ同じ書き味です。両方を使うチームでは認知コストが下がる利点があります。

### よく使う操作

```ts
// 遷移
await page.goto("/login");

// クリック
await page.getByRole("button", { name: "送信" }).click();

// 入力
await page.getByLabel("お名前").fill("Alice");
await page.getByPlaceholder("検索").fill("React");

// セレクト
await page.getByLabel("地域").selectOption("Tokyo");

// チェックボックス
await page.getByLabel("同意する").check();

// キーボード
await page.keyboard.press("Enter");
await page.getByLabel("検索").press("Enter");
```

### よく使うアサーション

```ts
// 要素が見える / 見えない
await expect(page.getByText("ようこそ")).toBeVisible();
await expect(page.getByText("エラー")).not.toBeVisible();

// テキストを含む
await expect(page.locator("h1")).toHaveText("こんにちは、Alice さん");

// URL の確認
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveURL(/\/posts\/\d+/);

// 値が入っている
await expect(page.getByLabel("名前")).toHaveValue("Alice");

// 件数
await expect(page.getByRole("listitem")).toHaveCount(3);
```

すべて **自動リトライ付き**。「fetch が終わってから出る要素」を待たなくても、`expect(...).toBeVisible()` 自体が最大 5 秒間繰り返しチェックします。

### UI モードで開発する

`npm run e2e:ui` を起動すると、Playwright の UI モードが立ち上がります。

- テスト一覧から個別に実行できる
- 各ステップの **ブラウザの状態をタイムライン** で確認できる
- 失敗時の **DOM スナップショット** をクリックで遡れる
- 「locator picker」で画面要素を選ぶと、推奨セレクタが自動生成される

最初に E2E を書く時は **UI モード必須** です。「どこでクリックすればいいか」「次の状態は何か」を見ながら書けるので、習得が一気に楽になります。

### Codegen で操作を録画

ゼロからテストを書くのは大変です。Playwright には **画面操作を録画してコードを生成する** 機能があります。

```bash
npx playwright codegen http://localhost:5173
```

ブラウザが立ち上がるので、人間が普通にサイトを操作します。クリック・入力・遷移のたびに、対応する Playwright コードが横のパネルに自動で出てきます。それをコピペして整形すれば、テストの叩き台が一気にできます。

複雑な経路でも、まずは codegen で粗い形を作ってから手で詰めるワークフローが定番です。

### 失敗時の証拠保存

`playwright.config.ts` に `trace: "on-first-retry"` を書いておくと、失敗時に **トレース** が自動保存されます。トレースには:

- 各ステップで送信されたリクエスト
- DOM スナップショット
- スクリーンショット
- ビデオ

が入っており、`npx playwright show-trace trace.zip` で UI モードと同じインターフェースで再生できます。**CI で起きた fail を後から再現できる** のが強みです。

### MSW を E2E でも使う（軽く紹介）

MSW のハンドラは E2E でも流用できます。Playwright の `page.route(...)` でブラウザ側の fetch を MSW Service Worker 経由で横取りする構成にすれば、ユニット / コンポーネント / E2E の **3 層で同じモックレスポンス** を使い回せます。

設定はやや複雑なので本コースでは触れませんが、本格運用ではこのパターンを取ると「ハンドラ定義の二重管理」が無くせる点だけ覚えておいてください。

### E2E はどこに書くか

E2E は遅いので、**書くべき経路** を絞ります。実務でよく投資されるのは:

1. **ログイン → サインイン関連**
2. **メイン購入 / 課金フロー**
3. **新規登録 → 重要な初回操作**
4. **データを書き換える系（CRUD）の代表的な 1 経路**

「すべての画面を網羅する」ような E2E は壊れまくり、メンテコストで死にます。**ビジネスが止まる経路だけ** を 20〜30 ケースくらい用意して守るのが現実解です。

## 演習

### ゴール

- 簡単な Vite + React アプリを起動状態にする
- Playwright をセットアップする
- 「トップから About ページに遷移」「フォーム入力 → 送信」の 2 経路を E2E でテストする
- UI モードで動きを観察する

### 途中から始める場合

ローカル環境で `create-vite` で React + TS テンプレートを作ります（StackBlitz では Playwright のブラウザ本体を取得できないため、ローカル前提）。

```bash
npm create vite@latest my-e2e-sample -- --template react-ts
cd my-e2e-sample
npm install
```

### 手順 1: アプリにページを 2 つ追加（ライブラリなしの最小ルーティング）

`src/App.tsx` をシンプルに書き換え。`location.pathname` で表示を切り替えるだけの自家製ルーティングを使います（学習用に最小化）。

> **補足: この `<a onClick={preventDefault}>` は学習用の最小例**: 自家製ルーティングは `Cmd + クリック`（新タブ）/ `中クリック` / 右クリックメニューの「リンクを開く」のようなブラウザ標準操作を全て壊します。実プロダクトでは **React Router**（Vite 用）や **Next.js の `<Link>`** を使い、自前の `preventDefault` 実装は避けます。本レッスンは Playwright の挙動確認に集中するためにあえて最小化しています。

```tsx
import { useState } from "react";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState("");

  function go(to: string) {
    window.history.pushState({}, "", to);
    setPath(to);
  }

  if (path === "/about") {
    return (
      <main>
        <h1>About</h1>
        <p>このページは about です。</p>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go("/");
          }}
        >
          Home に戻る
        </a>
      </main>
    );
  }

  return (
    <main>
      <h1>Home</h1>
      <p>Playwright のサンプル。</p>
      <a
        href="/about"
        onClick={(e) => {
          e.preventDefault();
          go("/about");
        }}
      >
        About
      </a>

      <hr />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) setSubmitted(name);
        }}
      >
        <label htmlFor="name">お名前</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">送信</button>
      </form>

      {submitted && <p>こんにちは、{submitted} さん</p>}
    </main>
  );
}
```

### 手順 2: Playwright をインストール

```bash
npm install -D @playwright/test
npx playwright install
```

### 手順 3: 設定ファイル

`playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
```

`package.json` の scripts に追加:

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui"
  }
}
```

### 手順 4: テストを書く

`e2e/sample.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("トップに Home の見出しが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
});

test("About リンクで /about に遷移する", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
});

test("フォーム送信で挨拶が表示される", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("お名前").fill("Alice");
  await page.getByRole("button", { name: "送信" }).click();
  await expect(page.getByText("こんにちは、Alice さん")).toBeVisible();
});
```

### 手順 5: 実行

UI モードで動きを見ながら:

```bash
npm run e2e:ui
```

CI / 自動実行用（ヘッドレス）:

```bash
npm run e2e
```

### 期待出力

UI モードでは画面右側にテスト一覧、中央にブラウザのプレビューが出ます。各テストをクリックすると、各ステップごとの DOM スナップショットが時系列で見られます。

ヘッドレスでは:

```
Running 3 tests using 1 worker

  ok 1 [chromium] › sample.spec.ts:4:1 › トップに Home の見出しが表示される
  ok 2 [chromium] › sample.spec.ts:9:1 › About リンクで /about に遷移する
  ok 3 [chromium] › sample.spec.ts:16:1 › フォーム送信で挨拶が表示される

3 passed (3.5s)
```

### 変える

- `<button>送信</button>` の `<button>` を `<div onclick="...">` に変えてみる。テストの `getByRole("button", ...)` が要素を見つけられず fail する。a11y 的に正しいタグ選びがテストにも効くと体感
- `playwright.config.ts` の `webServer.command` を `npm run preview` に変えてみる（本番ビルド済みを配信するモード）。本番ビルドで E2E を回せる
- 失敗するテストを 1 つ作って、`trace.zip` が生成されることを確認。`npx playwright show-trace trace.zip` で再生

### 自分で書く

- 「フォームを空のまま送信しても挨拶が出ない」テストを足す
- `page.getByLabel("お名前")` を `page.locator("input")` のような **実装に依存したセレクタ** に変えてみる。動くが、`<input>` が複数あったら壊れる、という弱さを体感

### codegen を試す（任意）

サーバーを `npm run dev` で別ターミナルから起動した状態で:

```bash
npx playwright codegen http://localhost:5173
```

ブラウザが立ち上がるので、リンクをクリックしたりフォームに入力したりすると、横のパネルにテストコードが自動生成されます。コピペして `e2e/auto.spec.ts` を作ってみると、自分で書いたものとの違いが見られます。

## まとめ

- E2E は本物のブラウザでアプリ全体を動かすテスト。**最重要パスだけ** に絞る
- **Playwright** は 3 ブラウザを 1 API で扱える、自動待機 / トレース / codegen 完備
- 設定は `playwright.config.ts` の `webServer` で `npm run dev` の自動起動が定番
- API は Testing Library と似た書き味（`getByRole` / `getByLabel`）
- アサーションも `expect(...).toBeVisible()` 等が自動リトライ
- **UI モード** で対話的にデバッグ、**codegen** で操作を録画してテストコード生成
- 失敗時の **トレース** で CI のエラーをローカル再現
- MSW のハンドラは E2E でも流用可（本格運用での節約パターン）
- ローディング表示には `role="status"` または `aria-busy="true"` を付け、`getByRole('status')` で待ち合わせると、見た目が変わってもテストが安定する
