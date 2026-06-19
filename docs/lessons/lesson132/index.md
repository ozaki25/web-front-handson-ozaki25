# lesson132: Service Worker のライフサイクルとキャッシュ戦略

## ゴール

- Service Worker の特徴（DOM 不可・HTTPS 必須・同一オリジン）を説明できる
- install / activate / fetch の 3 つのライフサイクルと `event.waitUntil()` の役割を理解する
- Cache First・Network First・Stale While Revalidate など主要なキャッシュ戦略を使い分けられる
- Workbox と `vite-plugin-pwa` でオフライン対応を実装できる

## 解説

### PWA とは

「**Progressive Web App**」とは、Web を **アプリのように扱う** ための仕組みの総称です。本講座のドキュメントサイト自体も `@vite-pwa/vitepress` で PWA 化済みで、デスクトップ / モバイルから **インストール** できます。

PWA の柱:

1. **Service Worker**（バックグラウンドのスクリプト）
2. **Web App Manifest**（インストール時のメタデータ）
3. **HTTPS**（必須）
4. インストール可能 / オフライン対応 / 通知

### Service Worker とは

Service Worker は **ブラウザのバックグラウンドで動く、ネットワークプロキシ的な JavaScript** です。ページから独立して動き、`fetch` イベントを **横取り** してキャッシュ応答 / カスタム応答ができます。

特徴:

- **DOM にアクセスできない**（ワーカー）
- **HTTPS 必須**（localhost は例外）
- **同一オリジン** に限定
- **永続的** に動き、ページが閉じても残る（バックグラウンドで通知 / 同期）

### ライフサイクル

3 つの状態を順に行き来します。

<img src="/diagrams/sw-lifecycle.svg" alt="Service Worker のライフサイクル: install（事前キャッシュ）→ activate（古いキャッシュ削除）→ idle/fetch/message（リクエスト横取り・通知受信）。更新時は新 SW が install し、旧 SW 終了後に activate する。" class="diagram" />

#### `install`

最初にインストールされた時に呼ばれるイベントで、事前キャッシュを作るタイミングです。

`event.waitUntil(promise)` は、この Promise が解決するまでライフサイクルの遷移を保留する API です。キャッシュ保存が終わる前に SW がアクティブにならないよう制御するために使います。

```js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) =>
      cache.addAll(["/", "/index.html", "/styles.css", "/app.js"]),
    ),
  );
});
```

#### `activate`

install が完了して制御を取る時のイベントで、古いキャッシュの削除をするタイミングです。

```js
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== "v1").map((k) => caches.delete(k))),
    ),
  );
});
```

#### `fetch`

ページからの fetch を横取りするイベントで、ここでキャッシュ戦略を実装します。

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request)),
  );
});
```

### キャッシュ戦略（Workbox 風）

リソース別に **どんな順序でキャッシュ / ネットワークを使うか** を決める戦略です。

| 戦略 | 流れ | 適切なリソース |
|---|---|---|
| **CacheFirst** | キャッシュ → なければネット | フォント / 画像 / 不変アセット |
| **NetworkFirst** | ネット → 失敗したらキャッシュ | API レスポンス / HTML（最新優先） |
| **StaleWhileRevalidate** | キャッシュ即返却 + 裏でネット更新 | 一覧 / プロフィール画像（やや古くて OK） |
| **NetworkOnly** | ネットのみ | POST / 認証など |
| **CacheOnly** | キャッシュのみ | 完全オフライン専用ページ |

#### CacheFirst の例

```js
self.addEventListener("fetch", (event) => {
  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((res) =>
        res || fetch(event.request).then((networkRes) => {
          const clone = networkRes.clone();
          caches.open("images").then((c) => c.put(event.request, clone));
          return networkRes;
        }),
      ),
    );
  }
});
```

#### NetworkFirst の例

```js
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open("api").then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request)),
    );
  }
});
```

### Workbox

Google が出している **キャッシュ戦略のヘルパー** ライブラリです。生で書くと冗長な処理を **数行で** 表現できます。

```js
// sw.js
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 3600 })],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({ cacheName: "api", networkTimeoutSeconds: 3 }),
);

registerRoute(
  ({ request }) => request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({ cacheName: "assets" }),
);
```

### Vite / Next.js での導入

#### Vite + `vite-plugin-pwa`

```bash
npm install -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My App",
        short_name: "App",
        start_url: "/",
        display: "standalone",
        theme_color: "#1e40af",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
});
```

#### Next.js + `@ducanh2912/next-pwa` / `serwist`

Next.js は `next-pwa` の代替として **`serwist`** が活発です（旧 next-pwa はメンテ少）。

```bash
npm install @serwist/next serwist
```

`next.config.ts`:

```ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist({});
```

`app/sw.ts`:

```ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

### オフライン対応

最小例: ネットが切れた時に「オフライン画面」を出す。

```js
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((c) => c.add(OFFLINE_URL)),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
  }
});
```

`/offline.html` は静的に **「オフラインです」** と書かれた HTML を置きます。

### よくある罠

- **HTTPS でないと動かない**（localhost 以外）
- **Service Worker は更新が反映されない問題**（古い SW がキャッシュを返し続ける）→ `skipWaiting()` + `clientsClaim()` を使う / **更新確認 UI** を入れる
- **キャッシュが暴走** → `ExpirationPlugin` で件数 / 期間を制限

### 確認ツール

- Chrome DevTools → **Application** タブ
  - **Manifest**: マニフェストの内容
  - **Service Workers**: 登録状態 / 更新ボタン
  - **Cache Storage**: キャッシュの中身
  - **Storage**: クォータと使用量
- **Lighthouse** → PWA カテゴリ（インストール可能性 / オフライン動作のチェック）
- [PWA Builder](https://www.pwabuilder.com/) でマニフェスト診断

## 演習

### ゴール

- Vite プロジェクトに `vite-plugin-pwa` を入れて PWA 化
- 自前の Service Worker を書いて **オフライン fallback** を実装
- ホーム画面追加 / Lighthouse の PWA 診断を通す

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest pwa-sample -- --template react-ts
cd pwa-sample
npm install
npm install -D vite-plugin-pwa
```

### 手順 2: vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "PWA Sample",
        short_name: "PWA",
        start_url: "/",
        display: "standalone",
        theme_color: "#1e40af",
        background_color: "#ffffff",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png}"],
        navigateFallback: "/offline.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
```

### 手順 3: オフラインページ

`public/offline.html`:

```html
<!doctype html>
<html lang="ja">
  <head><meta charset="UTF-8"><title>オフライン</title></head>
  <body>
    <h1>オフラインです</h1>
    <p>ネットワークに接続してください</p>
  </body>
</html>
```

`public/pwa-192.png` / `pwa-512.png` は適当な PNG を置きます（自前で作るか、`vite-pwa-assets` で生成）。

### 手順 4: ビルドとプレビュー

```bash
npm run build
npm run preview
```

`http://localhost:4173` で開いて DevTools の Application タブを確認。

1. **Service Workers**: SW が登録されている
2. **Manifest**: フィールドが反映されている
3. ネットを **Offline** に切り替えて再読込 → `offline.html` が表示される

### 手順 5: Lighthouse で PWA 診断

DevTools → Lighthouse → PWA カテゴリで実行。**インストール可能性** が緑になっていることを確認。

### 期待出力

- アドレスバーに **インストールアイコン** が出る
- ホーム画面 / アプリ一覧から起動可能
- オフラインで `/offline.html` が表示される
- Lighthouse の PWA カテゴリが緑

### 変える

- `runtimeCaching` で API URL を `NetworkFirst` でキャッシュ
- `manifest.shortcuts` を追加して **長押しメニュー** を作る
- `purpose: "maskable"` のアイコンを追加して、Android で円形にトリミングされる挙動を確認

### 自分で書く（任意）

- `IndexedDB` を使って、オフラインで作成したデータを再接続時に同期する
- `ExpirationPlugin` でキャッシュの有効期限と最大件数を設定する
- Lighthouse の PWA カテゴリで全項目が緑になるよう診断結果を改善する

## まとめ

- **Service Worker** は **install / activate / fetch** のライフサイクルで動く
- `event.waitUntil()` で Promise が完了するまでライフサイクルの遷移を保留できる
- キャッシュ戦略は **CacheFirst / NetworkFirst / StaleWhileRevalidate / NetworkOnly / CacheOnly** から選ぶ
- **Workbox** で戦略の記述が劇的に短くなる
- Vite は `vite-plugin-pwa`、Next.js は `@serwist/next` が定番
- **`navigateFallback`** で **オフラインページ** を出せる
- DevTools の Application タブと **Lighthouse PWA** で診断

Web Push 通知とインストール設定は「PWA の通知・インストール・manifest」のレッスンで扱います。
