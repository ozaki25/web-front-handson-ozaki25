# lesson114: エラートラッキング（Sentry）

## ゴール

- 本番のエラーを **見逃さず通知する** 仕組みの必要性を理解する
- Sentry を React / Next.js プロジェクトに導入できる
- Source Map で **minified コードを元のコードに復元** する流れが分かる
- ユーザーコンテキスト / タグ / リリースで **エラーを絞り込む** 方法を知る
- 代替サービス（Datadog / Bugsnag / Rollbar 等）の位置付けを把握する

## 解説

### なぜエラートラッキングが必要か

開発中はブラウザの DevTools にエラーが出ます。けれど **本番** ではユーザーが「動かない」と言うまで何も分かりません。サーバーサイドなら CloudWatch / Datadog にログが貯まりますが、**ブラウザの中で起きたエラー** は誰も拾わない。

エラートラッキングサービスは:

- ブラウザで起きたエラーを **自動収集** する
- スタックトレース / OS / ブラウザ / URL / 直前の操作（breadcrumbs）を一緒に送る
- **集約・重複排除** してダッシュボードに並べる
- Slack / Email / PagerDuty に **通知** する
- リリース単位で「**この版で増えたエラー**」を可視化する

これがあるかないかで、本番運用の体感が大きく変わります。

### Sentry の位置付け

[Sentry](https://sentry.io/) は **エラートラッキングのデファクト** のひとつ。OSS で、**Hosted（SaaS）と self-hosted** の両方が選べます。

特徴:

- React / Next.js / Node.js / モバイルなど **多言語対応**
- パフォーマンス監視 / セッションリプレイ / プロファイリングも統合
- Source Map アップロードが整っていて、**minify されたコードでも元のコードで読める**
- 月 5,000 イベントまで **無料枠**

### React に導入する最小手順

```bash
npm install @sentry/react
```

`src/main.tsx`（最初の方）:

```tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,        // パフォーマンス計測。本番は 0.1 程度に
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
});
```

`.env`:

```
VITE_SENTRY_DSN=https://xxxxx@oXXX.ingest.sentry.io/12345
VITE_APP_VERSION=1.0.0
```

DSN は Sentry の管理画面で「プロジェクトの設定」から取得します。

### エラーを意図的に送る

#### 自動的に拾われるもの

- 未捕捉の `throw`
- 未処理の Promise rejection
- React のレンダリング中エラー（後述の Error Boundary 経由）

#### 手動で送る

```tsx
try {
  await someApi();
} catch (e) {
  Sentry.captureException(e);
  throw e;  // 必要なら再 throw
}

// メッセージだけ送る
Sentry.captureMessage("ユーザーが何度もログインに失敗");
```

### React の Error Boundary と統合

Sentry は **Error Boundary をラップ** したコンポーネントを提供します（lesson68 と相性 ◎）。

```tsx
import * as Sentry from "@sentry/react";

const App = () => (
  <Sentry.ErrorBoundary fallback={<p>エラーが起きました</p>}>
    <Routes />
  </Sentry.ErrorBoundary>
);
```

これだけで「**Error Boundary が捕まえた React レンダリングエラー** が Sentry に届く」状態になります。

### Next.js に導入する最小手順

[Sentry の Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/) は **ウィザード** で 1 コマンド導入できます。

```bash
npx @sentry/wizard@latest -i nextjs
```

ウィザードが行うこと:

- プロジェクトの選択 / DSN の設定
- `instrumentation-client.ts`（クライアント側 Sentry 初期化）を生成
- `sentry.server.config.ts` / `sentry.edge.config.ts`（サーバー / Edge ランタイム用）を生成
- `app/global-error.tsx`（App Router の **レンダリングエラー** を捕まえる場所）を生成
- `next.config.ts` を `withSentryConfig` でラップ
- ビルド時に **Source Map を自動アップロード** する設定を追加

```ts
// next.config.ts（生成例）
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  /* 既存の Next.js 設定 */
};

export default withSentryConfig(nextConfig, {
  org: "your-org",
  project: "your-project",
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
```

**Next.js / React Server Components / Server Actions / API Route / Edge Middleware の全部が 1 つの SDK でカバー** されるのが Sentry Next.js SDK の強み。

### Source Map とは

本番ビルドの JS は **minify** されて変数名が `a` / `b` になり、行も詰められています。これだとスタックトレースを見ても **どのコードか分からない**。

Source Map は「minify 後の位置 → 元のソースの行・列」のマッピング情報です。これがあると:

```
TypeError: Cannot read property 'foo' of undefined
  at a.b.c (index-Xj9k2.js:1:12345)
```

が:

```
TypeError: Cannot read property 'foo' of undefined
  at UserProfile.fetchData (src/components/UserProfile.tsx:42:18)
```

に **復元** されます。

#### Sentry の Source Map 運用

- **ビルド時に Source Map を生成**（`vite build` / `next build`）
- それを **Sentry にアップロード**（公開しない）
- Sentry の管理画面で **元のソースで** スタックトレースが見られる

`@sentry/nextjs` のウィザードがビルド時のアップロードまで設定してくれるので、最近は手動設定の必要が減りました。

::: warning Source Map をブラウザに公開しない
Source Map をそのまま `dist/` に置いてデプロイすると、**元のソースが誰でも読める** 状態になります。Sentry にアップロードして、ビルド成果物からは削除（または `.map` を CDN に出さない）するのが安全。
:::

### ユーザーコンテキスト

「**誰の** エラーか」が分かると原因究明が圧倒的に早くなります。

```ts
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

ログアウト時:

```ts
Sentry.setUser(null);
```

::: tip 個人情報の扱い
メールアドレスや氏名は **個人情報**。GDPR / 個人情報保護法的に、ユーザー同意やデータ最小化が必要です。本番では **ID だけ送る** / **ハッシュ化する** などの運用が無難。
:::

### タグとコンテキスト

タグは「**フィルタ用** の短い key-value」、コンテキストは「**詳細データ**」です。

```ts
// タグ（ダッシュボードで絞り込みに使える）
Sentry.setTag("page", "checkout");
Sentry.setTag("payment-provider", "stripe");

// コンテキスト（イベントに添付される詳細）
Sentry.setContext("cart", {
  items: 3,
  total: 12000,
  currency: "JPY",
});
```

### リリース管理

「この版で増えたエラー」を見るには、`release` と `environment` を設定します。

```ts
Sentry.init({
  dsn: "...",
  release: "my-app@1.2.3",       // package.json のバージョンや Git の SHA
  environment: process.env.NODE_ENV,
});
```

CI / CD でデプロイ時に Sentry CLI を使ってリリースを通知すると、ダッシュボードで:

- 「リリース 1.2.3 で **新規** に出たエラー」
- 「リリース 1.2.2 では出ていなかったが 1.2.3 で **退行** したエラー」
- 「修正済みリリース」

がトラッキングできます。

### Breadcrumbs

エラー発生 **直前のユーザー操作** を自動で記録するのが Breadcrumbs。

- ボタンクリック / フォーム送信
- ページ遷移
- ネットワークリクエスト
- console.log（任意）

```ts
Sentry.addBreadcrumb({
  category: "checkout",
  message: "クーポンコードを適用",
  level: "info",
});
```

「エラー発生 5 秒前にこのボタンを押している」が分かるので **再現が容易** になります。

### セッションリプレイ

Sentry の **Session Replay** を有効にすると、エラー発生時の **画面録画** が見られます（DOM の差分を記録するので画像ではなく軽い）。

```ts
Sentry.init({
  // ...
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,   // 通常セッションの 10%
  replaysOnErrorSampleRate: 1.0,   // エラーが起きたセッションは 100%
});
```

「**ユーザーがどう操作してエラーに辿り着いたか**」が動画で分かるのは強烈です。ただし **個人情報の保護** が必要（パスワード入力欄などはマスクする設定）。

### 代替サービス

| サービス | 特徴 |
|---|---|
| **Sentry** | OSS / 自前ホスト可。フロント・バック両方 |
| **Datadog** | 監視全部入り（メトリクス / ログ / APM / RUM）。運用の重心が APM 寄り |
| **Bugsnag** | エラートラッキング特化。料金体系がシンプル |
| **Rollbar** | 老舗のエラートラッキング。深い検索機能 |
| **LogRocket** | セッションリプレイが強み |
| **Honeybadger** | 開発者にやさしい価格 |

「**まず Sentry を入れる**」が安全な選択。後から Datadog 等に統合したくなった時の移行も可能。

### Edge / Worker 環境での扱い

Cloudflare Workers / Vercel Edge Functions では従来の Sentry SDK が動きにくかったですが、2026 年現在は **`@sentry/cloudflare` / `@sentry/vercel-edge`** など環境別 SDK が整備されています。Next.js の Edge Middleware は `@sentry/nextjs` の `sentry.edge.config.ts` で対応します。

## 演習

### ゴール

- React + Vite プロジェクトに Sentry を入れる
- 意図的にエラーを起こして Sentry に届くことを確認する
- ユーザーコンテキストとタグを付ける

### 手順 1: Sentry アカウントとプロジェクト作成

[sentry.io](https://sentry.io/) で無料アカウントを作り、**新規プロジェクト**（platform = React）を作成。**DSN** を控えます。

### 手順 2: 新規 React プロジェクト

```bash
npm create vite@latest sentry-sample -- --template react-ts
cd sentry-sample
npm install @sentry/react
npm install
```

### 手順 3: 初期化

`.env`:

```
VITE_SENTRY_DSN=（控えた DSN を貼る）
VITE_APP_VERSION=0.1.0
```

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
  release: `sentry-sample@${import.meta.env.VITE_APP_VERSION}`,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>エラーが起きました</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
```

### 手順 4: わざとエラーを起こす

`src/App.tsx`:

```tsx
import * as Sentry from "@sentry/react";
import { useState } from "react";

export default function App() {
  const [crash, setCrash] = useState(false);

  if (crash) {
    throw new Error("意図的にクラッシュさせた");
  }

  const sendCustom = () => {
    Sentry.captureMessage("カスタムメッセージ from Sentry test");
  };

  const sendException = () => {
    try {
      // @ts-expect-error わざと
      null.foo();
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const setUser = () => {
    Sentry.setUser({ id: "user-123", username: "テストユーザー" });
    Sentry.setTag("test-run", "manual");
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Sentry Demo</h1>
      <button onClick={() => setCrash(true)}>レンダリングエラー</button>
      <button onClick={sendException}>例外を送信</button>
      <button onClick={sendCustom}>メッセージを送信</button>
      <button onClick={setUser}>ユーザーをセット</button>
    </div>
  );
}
```

### 手順 5: 起動して確認

```bash
npm run dev
```

ボタンを押して、Sentry のダッシュボードでイベントが届くのを確認します（数秒〜数十秒の遅延あり）。

### 期待出力

- 「レンダリングエラー」を押すと Error Boundary の fallback が表示され、Sentry にイベントが届く
- 「例外を送信」で `TypeError` が届く
- 「メッセージを送信」で文字列イベントが届く
- 「ユーザーをセット」した後のイベントは **ユーザー情報付き** で届く
- ダッシュボードで `release: sentry-sample@0.1.0` 付きとして表示される

### 変える

- `tracesSampleRate` を `0.1` にして、パフォーマンス計測のサンプリング率を下げる
- `Sentry.replayIntegration()` を追加し、セッションリプレイを有効にする
- `setTag("page", "home")` などタグを増やしてダッシュボードで絞り込みを試す

### 自分で書く（任意）

- Next.js プロジェクトに `npx @sentry/wizard@latest -i nextjs` で Sentry を入れる
- API Route の中で意図的にエラーを起こし、Sentry に届くことを確認する
- ビルド時に Source Map をアップロードして、minify 後のコードが元のソースで表示されることを確認

## まとめ

- **エラートラッキング** は「ユーザーが言わなければ気づけないバグ」を救うインフラ
- Sentry は React / Next.js / Node.js を 1 つの SDK でカバー
- React は `Sentry.init` + `Sentry.ErrorBoundary`、Next.js は **`npx @sentry/wizard@latest -i nextjs`** が最速
- **Source Map** をアップロードすると、minify 後のスタックトレースが元のコードで読める（公開しない）
- `setUser` / `setTag` / `setContext` で **絞り込みと原因究明** を加速
- `release` / `environment` で **退行**（regression） を可視化
- **Breadcrumbs** と **Session Replay** で再現が容易になる
- 代替は Datadog / Bugsnag / Rollbar / LogRocket。**まず Sentry** が安全な選択
- 別のレッスンでは **Vercel Analytics と GA4** に進み、ユーザー行動とパフォーマンスの計測へ
