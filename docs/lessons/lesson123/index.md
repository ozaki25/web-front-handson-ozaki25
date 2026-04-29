# lesson123: Service Worker と PWA 深掘り

## ゴール

- Service Worker の **ライフサイクル**（install / activate / fetch）を理解する
- Workbox の **キャッシュ戦略**（CacheFirst / NetworkFirst / StaleWhileRevalidate）を選べる
- オフライン対応（fallback ページ）の最小実装ができる
- Web Push 通知の流れを大づかみに掴む
- `manifest.webmanifest` の主要フィールドが分かる

## 解説

### PWA とは

「**Progressive Web App**」= Web を **アプリのように扱う** ための仕組みの総称。本講座のドキュメントサイト自体も `@vite-pwa/vitepress` で PWA 化済みで、デスクトップ / モバイルから **インストール** できます。

PWA の柱:

1. **Service Worker**（バックグラウンドのスクリプト）
2. **Web App Manifest**（インストール時のメタデータ）
3. **HTTPS**（必須）
4. インストール可能 / オフライン対応 / 通知

### Service Worker とは

**ブラウザのバックグラウンドで動く、ネットワークプロキシ的な JavaScript**。ページから独立して動き、`fetch` イベントを **横取り** してキャッシュ応答 / カスタム応答ができます。

特徴:

- **DOM にアクセスできない**（ワーカー）
- **HTTPS 必須**（localhost は例外）
- **同一オリジン** に限定
- **永続的** に動き、ページが閉じても残る（バックグラウンドで通知 / 同期）

### ライフサイクル

3 つの状態を順に行き来します。

```
[ install ] → [ activate ] → [ idle / fetch / message ]
                                       ↑
                                       │（更新時）新 SW が install
```

#### `install`

「**最初にインストールされた時** に呼ばれる」イベント。**事前キャッシュ** を作るタイミング。

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

「**install が完了して制御を取る時**」のイベント。**古いキャッシュの削除** をするタイミング。

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

「**ページからの fetch を横取り**」するイベント。ここがキャッシュ戦略の本丸。

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request)),
  );
});
```

### キャッシュ戦略（Workbox 風）

リソース別に **どんな順序でキャッシュ / ネットワークを使うか** を決める戦略。

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

Google が出している **キャッシュ戦略のヘルパー** ライブラリ。生で書くと冗長な処理を **数行で** 表現できます。

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
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist({});
```

`src/sw.ts`:

```ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: any };

new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
}).addEventListeners();
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

### Web Push 通知

ブラウザを閉じている時でも **プッシュ通知** が届く仕組み。

#### 仕組み

1. **クライアント** が **VAPID 鍵** を使って通知を購読
2. ブラウザが **Push Service**（Apple / Google / Mozilla）に **endpoint** を発行
3. クライアントが **endpoint をサーバーに送る**
4. サーバーが **endpoint に POST**（VAPID 秘密鍵で署名）
5. Push Service が **ブラウザに配信**
6. Service Worker の `push` イベントが発火 → `showNotification`

#### クライアント側の最小例

```js
// 通知の許可
const permission = await Notification.requestPermission();
if (permission !== "granted") return;

const reg = await navigator.serviceWorker.ready;
const subscription = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});

// サーバーに endpoint を保存
await fetch("/api/push/subscribe", {
  method: "POST",
  body: JSON.stringify(subscription),
  headers: { "Content-Type": "application/json" },
});
```

#### Service Worker 側

```js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "通知", {
      body: data.body ?? "",
      icon: "/icon-192.png",
      badge: "/badge.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
```

#### サーバー側

`web-push` パッケージで送信:

```ts
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

await webpush.sendNotification(subscription, JSON.stringify({
  title: "新しい通知",
  body: "メッセージが届きました",
  url: "/inbox",
}));
```

#### iOS Safari の状況

iOS 16.4+ では **PWA をホーム画面に追加した時のみ** Push 通知が動くようになりました。要件:

- ホーム画面に **インストール済み**
- HTTPS
- ユーザーの明示的な購読

通常の Safari ブラウザではまだ Push が動かないので注意。

### Background Sync

「**ネットがない時に送信失敗した POST を、復活した時に再送する**」仕組み。

```js
self.addEventListener("sync", (event) => {
  if (event.tag === "send-message") {
    event.waitUntil(sendQueuedMessages());
  }
});
```

クライアント側:

```js
const reg = await navigator.serviceWorker.ready;
await reg.sync.register("send-message");
```

`Periodic Background Sync` は **定期的にバックグラウンドで実行** する仕組み（権限の関係で制限あり）。

### `manifest.webmanifest` の詳細

```json
{
  "name": "My PWA App",
  "short_name": "PWA",
  "description": "サンプル PWA アプリ",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "lang": "ja",
  "scope": "/",
  "categories": ["productivity"],
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshot1.png", "sizes": "1080x1920", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "新規作成", "url": "/new", "icons": [{ "src": "/new.png", "sizes": "96x96" }] }
  ]
}
```

| フィールド | 役割 |
|---|---|
| `display: standalone` | ブラウザ UI を消してアプリ風に |
| `theme_color` | 上部バーの色 |
| `background_color` | スプラッシュ画面の背景 |
| `icons` | ホーム画面のアイコン |
| `purpose: "maskable"` | OS が円形等にトリミングできるアイコン |
| `screenshots` | インストール画面（form_factor で広 / 狭を区別） |
| `shortcuts` | アプリ長押しでのクイックメニュー |

> **補足: `theme_color` をダーク/ライトで切り替える**: マニフェストの `theme_color` は単一値ですが、HTML の `<meta name="theme-color">` には `media` 属性を付けて **OS のテーマ設定に応じて切り替え** できます。
>
> ```html
> <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
> <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a">
> ```
>
> こうすると iOS / Android のダークモード利用者には暗い `theme_color` が、ライトモード利用者には明るい色が反映されます。マニフェストの `theme_color` はインストール後のフォールバックとして残り、`<meta>` が上書きする形になります。

### よくある罠

- **HTTPS でないと動かない**（localhost 以外）
- **Service Worker は更新が反映されない問題**（古い SW がキャッシュを返し続ける）→ `skipWaiting()` + `clientsClaim()` を使う / **更新確認 UI** を入れる
- **キャッシュが暴走** → `ExpirationPlugin` で件数 / 期間を制限
- **ローカルテストで Notification 権限が出ない** → ブラウザ設定でリセット
- **iOS で通知が来ない** → ホーム画面追加が必要

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

- `web-push` で Push 通知を送る最小サーバーを書く
- iOS Safari で **ホーム画面追加 → 通知許可** の流れを試す
- `IndexedDB` を使って、オフラインで作成したデータを再接続時に同期する

## まとめ

- **Service Worker** は **install / activate / fetch** のライフサイクルで動く
- キャッシュ戦略は **CacheFirst / NetworkFirst / StaleWhileRevalidate / NetworkOnly / CacheOnly** から選ぶ
- **Workbox** で戦略の記述が劇的に短くなる
- Vite は `vite-plugin-pwa`、Next.js は `@serwist/next` が定番
- **`navigateFallback`** で **オフラインページ** を出せる
- **Web Push 通知** は VAPID 鍵 + Push Service の流れ。iOS は **インストール後限定**
- **`manifest.webmanifest`** の `display` / `icons` / `shortcuts` でアプリ体験を整える
- DevTools の Application タブと **Lighthouse PWA** で診断
