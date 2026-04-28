# lesson129: Web Analytics（Vercel Analytics / GA4）

## ゴール

- 「サイトを公開したら見るべき指標」が何かを理解する
- Vercel Analytics と Speed Insights を Next.js に入れられる
- Google Analytics 4（GA4）の最小設定とカスタムイベント送信が分かる
- プライバシー（Cookie 同意 / ITP / iOS の制限）配慮の基本を押さえる
- 解析結果から **何を改善するか** を判断する手順を持つ

## 解説

### 「サイトを公開したら見るべきもの」

公開後に最低限見たい指標は次の 3 軸です。

| 軸 | 例 |
|---|---|
| 来訪数 | PV（ページビュー）/ UU（ユニークユーザー）/ 流入元 |
| 体験 | 表示速度（Core Web Vitals）/ エラー率（→ Sentry） |
| 行動 | クリック / スクロール / フォーム送信 / コンバージョン |

エラー率は Sentry のレッスンで扱いました。**残り 2 軸を埋めるのが Web Analytics** の役割です。

### サービスの組み合わせ

| ツール | カバーする軸 | 特徴 |
|---|---|---|
| **Vercel Analytics** | PV / 流入元 | Cookieless、Next.js 統合が秒で済む |
| **Vercel Speed Insights** | Core Web Vitals | 実ユーザーの LCP / INP / CLS を集める |
| **Google Analytics 4**（GA4） | PV / イベント / コンバージョン | 機能多 / 学習コスト高 / Cookie 必要 |
| **Plausible / Fathom / Simple Analytics** | PV / 流入元 | プライバシー重視、料金固定 |
| **PostHog / Mixpanel / Amplitude** | プロダクト分析（イベント深掘り） | 機能フラグ / セッション再生も統合 |

「Vercel Analytics + Sentry」だけで小規模サイトは十分。**ユーザー行動の深掘り** が要るなら GA4 / PostHog などを追加します。

### Vercel Analytics（Next.js）

Vercel に Next.js をデプロイしているなら **管理画面で ON にして 1 行 import するだけ** で導入できます。

```bash
npm install @vercel/analytics
```

`app/layout.tsx`:

```tsx
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

ポイント:

- **Cookie を使わない** プライバシー設計（ファーストパーティ集計）
- 個人情報を保存しない
- ヨーロッパでも同意バナーなしで使える
- Vercel ダッシュボードに **PV / 流入経路 / リファラー / 国別** が出る

### Vercel Speed Insights

実ユーザーの **Core Web Vitals**（lesson101）を集めるツールです。

```bash
npm install @vercel/speed-insights
```

```tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

これで Lighthouse の合成指標ではなく **本物のユーザー体験** が記録されます。「LCP が悪化したのは○月○日のリリース後」のような診断ができる。

### Google Analytics 4（GA4）

#### 設定の流れ

1. [Google アナリティクス](https://analytics.google.com/) にログイン
2. プロパティを作成（**GA4 を選ぶ**。**Universal Analytics は 2023 年に終了**しているので新規はもう作れない）
3. **測定 ID**（`G-XXXXXXXXXX`）を取得

#### Next.js に追加（最小）

```tsx
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ja">
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`.env`:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### カスタムイベントを送る

GA4 は **イベントベース**。「ページが読まれた」も `page_view` イベントです。任意のイベントを送れます。

```ts
declare global {
  interface Window {
    gtag?: (
      command: "event",
      action: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

// 使う側
trackEvent("signup_completed", { method: "email" });
trackEvent("add_to_cart", { item_id: "ABC", value: 1200, currency: "JPY" });
```

GA4 の管理画面で **「主要イベント（旧コンバージョン）」** にチェックを入れると、その回数が KPI として追えるようになります。

#### App Router の SPA 遷移を補足する

App Router は Server Components で初回はネイティブ遷移ですが、`next/link` で **クライアント遷移** すると `page_view` が自動では飛びません。`usePathname` の変化で送ります。

```tsx
"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function GAPageView({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!window.gtag) return;
    const url = pathname + (search?.toString() ? `?${search}` : "");
    window.gtag("event", "page_view", {
      page_path: url,
      send_to: gaId,
    });
  }, [pathname, search, gaId]);

  return null;
}
```

`<GAPageView gaId={gaId} />` を `app/layout.tsx` に置くだけ。

### プライバシー（重要）

#### GDPR / Cookie 同意

**ヨーロッパ** からアクセスがある場合、Cookie を使う Analytics は **同意バナー** が必要です。日本の個人情報保護法も「クッキー類による行動データの第三者提供」に同意取得を要求するケースが増えています。

実装の選択肢:

- **Cookieless な Vercel Analytics / Plausible / Fathom** に切り替える
- GA4 を使うなら **同意管理プラットフォーム**（CMP） を入れる：CookieYes、Cookiebot、Osano、Iubenda
- GA4 の **Consent Mode v2** を使うと、同意がない場合でも「集計値だけ」を匿名で送れる

#### ITP（Intelligent Tracking Prevention）

Safari の ITP は **3rd-party cookie を実質ブロック**、1st-party cookie も **7 日で失効** させます。Chrome は **2024 年 7 月に 3rd-party cookie の一律廃止計画を撤回** し、**ユーザーが選択する形** で段階的にブロックを進める方針へ転換しました（2025 年以降も継続）。とはいえ Safari の挙動と合わせて長期的には **「3rd-party cookie に依存しない設計」** が必要なのは変わりません。

#### 個人情報を送らない

URL に `?email=xxx@example.com` のようなクエリが入った場合、それが **そのまま Analytics に送られる** 事故が起きます。**送信前にサニタイズ** する習慣を。

```ts
function trackPageView(path: string) {
  // メールアドレスっぽい文字列を匿名化
  const safe = path.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
  window.gtag?.("event", "page_view", { page_path: safe });
}
```

### 解析結果の読み方

#### PV だけ見ない

PV が増えても **すぐ離脱** していたら意味がありません。次の指標を組み合わせて見ます。

- **エンゲージメント時間**: 1 セッションあたりの滞在
- **直帰率**（Bounce Rate）: 1 ページだけ見て離脱した割合
- **コンバージョン率**: 目的のアクション（購入 / 登録）に至った割合

#### 集約より分解

「全体の PV」より「**流入元別の PV**」「**国別の PV**」を見ると、何を改善するかが見えやすいです。「Twitter からの流入は直帰率が高い」「日本以外は読まれていない」など。

#### Speed Insights は「**75 パーセンタイル**」を見る

平均値ではなく **75th percentile** が指標になります。「**75% のユーザーがこの値より良い体験**」という意味。Core Web Vitals の合格基準も 75th percentile で判定されます。

### 自分の Vercel デプロイ以外（Vite SPA など）

Vercel Analytics は **Vercel 以外でも動く** ようになりました。`@vercel/analytics/react` をインポートするだけ。

```tsx
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
  </>,
);
```

GA4 / Plausible / PostHog などはホスティング先を問わず動きます。

### 最低限の Cookie 同意ダイアログ（参考）

外部 CMP を使わず、**同意があるまで GA4 を読み込まない** 簡易実装。

```tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";

export function ConsentBanner({ gaId }: { gaId: string }) {
  const [accepted, setAccepted] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setAccepted(localStorage.getItem("ga-consent") === "yes");
  }, []);

  // 表示直後にフォーカスを「同意する」ボタンに当てる
  useEffect(() => {
    if (!accepted) {
      acceptBtnRef.current?.focus();
    }
  }, [accepted]);

  // Esc キーで閉じる（保留扱い: 同意せず一時的に隠すだけ）
  useEffect(() => {
    if (accepted) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAccepted(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [accepted]);

  const accept = () => {
    localStorage.setItem("ga-consent", "yes");
    setAccepted(true);
  };

  return (
    <>
      {accepted && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <Script id="ga4">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {!accepted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-title"
          aria-describedby="consent-desc"
        >
          <h2 id="consent-title">Cookie 同意</h2>
          <p id="consent-desc">このサイトは GA4 で利用状況を計測しています。</p>
          <button ref={acceptBtnRef} type="button" onClick={accept}>
            同意する
          </button>
        </div>
      )}
    </>
  );
}
```

> **`aria-modal` と focus 制御の最小三点**: バナー / モーダルとして読み上げてもらうには `aria-modal="true"` と **アクセシブルな名前**（`aria-labelledby` / `aria-label`）の指定、**初期フォーカスを内部の操作対象に当てる**（上の例では「同意する」ボタン）、**Esc で閉じる** の三点が最小ラインです。複雑な focus trap（背後にフォーカスを移さない厳密な実装）まで自前で書くより、本格的な要件は次に説明する CMP に任せるのが現実的です。

実運用では地域判定 / 拒否時の挙動 / 設定リンクなど追加要件があるので、**プロダクションでは CMP を使う** のが現実的。

## 演習

### ゴール

- Next.js プロジェクトに **Vercel Analytics + Speed Insights** を入れる
- GA4 のカスタムイベントを 1 つ送れるようにする

### 手順 1: 新規 Next.js プロジェクト

```bash
npx create-next-app@latest analytics-sample --ts --app
cd analytics-sample
```

質問にはデフォルトで答えます（Tailwind: yes / src directory: no / App Router: yes）。

### 手順 2: Vercel Analytics と Speed Insights

```bash
npm install @vercel/analytics @vercel/speed-insights
```

`app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analytics Sample",
  description: "Vercel Analytics と GA4 のテスト",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 手順 3: GA4 を追加

`.env.local`:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

`app/layout.tsx` に Script を追加（「Next.js に追加（最小）」で示したコードの通り）。

### 手順 4: カスタムイベントを送るボタン

`app/page.tsx`:

```tsx
"use client";

declare global {
  interface Window {
    gtag?: (cmd: "event", name: string, params?: Record<string, unknown>) => void;
  }
}

export default function Home() {
  const handleClick = () => {
    window.gtag?.("event", "demo_click", { label: "hero-cta", value: 1 });
    alert("送信しました（DevTools の Network で確認）");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Analytics 演習</h1>
      <button onClick={handleClick}>イベントを送信</button>
    </main>
  );
}
```

### 手順 5: 確認

```bash
npm run dev
```

ブラウザの DevTools で **Network** タブを開き、`google-analytics.com/g/collect` へのリクエストが飛ぶことを確認します（GA4 のイベント送信）。`vitals.vercel-insights.com` への送信も Speed Insights のもの。

### 期待出力

- ボタンクリックで `collect?...&en=demo_click` 形式のリクエストが出る
- `vitals.vercel-insights.com/v1/vitals` に LCP / INP / CLS のメトリクスが送られる
- Vercel にデプロイすると、ダッシュボードで PV と Speed Insights が見られる

### 変える

- ConsentBanner を実装し、同意があるまで GA4 を読まない構成に変える
- イベント名を `add_to_cart` / `view_item` のような **GA4 推奨イベント名** にすると、レポートで自動分類される
- `gtag('config', gaId, { send_page_view: false })` にして `page_view` を自分で送る形にする

### 自分で書く（任意）

- Plausible / Fathom / PostHog のうち 1 つを試して、Vercel Analytics との UI 差を比較する
- ページ遷移ごとに `page_view` を送る `<GAPageView />` を作って `app/layout.tsx` に組み込む
- `Speed Insights` のデータと `Lighthouse` のスコアを比較し、合成 vs 実ユーザーの差を観察

## まとめ

- 「公開後に見るもの」は **来訪 / 体験 / 行動** の 3 軸。エラーは Sentry、残り 2 軸が Analytics の役割
- **Vercel Analytics** は Cookieless で導入が秒。Vercel 以外でも `@vercel/analytics/react` で動く
- **Speed Insights** は実ユーザーの Core Web Vitals を **75 パーセンタイル** で集める
- **GA4** はイベントベースで強力だが、**Cookie 同意 / Consent Mode v2** を意識する必要がある
- 個人情報（メールアドレスなど）が **URL から漏れて Analytics に送られる事故** を避ける
- ITP / 3rd-party cookie 廃止の流れで、**1st-party / Cookieless 設計** が主流
- 「PV だけを見ない」。**エンゲージメント / 流入元 / 国 / コンバージョン** を分解して見る
