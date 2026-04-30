# lesson128: PWA の通知・インストール・manifest

## ゴール

- Web Push 通知のサーバー → SW → ブラウザの流れを説明できる
- VAPID 鍵の役割（送信者認証）を理解する
- `manifest.webmanifest` の主要フィールドを設定できる
- iOS Safari の制約を把握している

## 解説

lesson127 で学んだ Service Worker を使って、ネイティブアプリに近い機能を追加します。

### Web Push 通知の仕組み

ブラウザを閉じている時でも **プッシュ通知** が届く仕組みです。

#### 全体の流れ

Push Service（ブラウザベンダーが運営するサーバー）が間に入る構造になっています。

```
クライアント ──購読──→ Push Service ──endpoint 発行──→ クライアント
クライアント ──endpoint をサーバーに保存──→ あなたのサーバー
あなたのサーバー ──Push 送信──→ Push Service ──配信──→ SW の push イベント
SW ──showNotification──→ ブラウザ通知
```

具体的な手順:

1. **クライアント** が **VAPID 鍵** を使って通知を購読
2. ブラウザが **Push Service**（Apple / Google / Mozilla）に **endpoint** を発行
3. クライアントが **endpoint をサーバーに送る**
4. サーバーが **endpoint に POST**（VAPID 秘密鍵で署名）
5. Push Service が **ブラウザに配信**
6. Service Worker の `push` イベントが発火 → `showNotification`

#### VAPID とは

VAPID（Voluntary Application Server Identification）は、あなたのサーバーが正規の送信者であることを Push Service に証明するための署名の仕組みです。公開鍵をブラウザに登録し、送信時に秘密鍵で署名します。これにより、悪意ある第三者が勝手にあなたのユーザーへ通知を送ることを防ぎます。

#### クライアント側の購読コード

```js
// 通知の許可を求める
const permission = await Notification.requestPermission();
if (permission !== "granted") return;

// VAPID 公開鍵（Base64URL）を Uint8Array に変換するユーティリティ
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = "あなたの公開鍵をここに貼る";

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

#### Service Worker 側（受信）

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

#### サーバー側（送信）

`web-push` パッケージで送信します。

```ts
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

// subscription はクライアントから保存したもの
await webpush.sendNotification(
  subscription,
  JSON.stringify({
    title: "新しい通知",
    body: "メッセージが届きました",
    url: "/inbox",
  }),
);
```

### Background Sync

「**ネットがない時に送信失敗した POST を、復活した時に再送する**」仕組みです。

Service Worker 側:

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

`Periodic Background Sync` は **定期的にバックグラウンドで実行** する仕組みです（権限の関係で制限あり）。

### `manifest.webmanifest` の主要フィールド

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

### iOS Safari の制約

Web Push は **iOS 16.4 以降のみ** 動作します。それより前の iOS では Push 通知は届きません。

動作条件:

- ホーム画面に **インストール済み**（ホーム画面追加が必要）
- HTTPS
- ユーザーの明示的な購読操作

通常の Safari ブラウザ（ホーム画面追加なし）ではまだ Push が動かないので注意が必要です。

### 確認ツール

- Chrome DevTools → **Application** タブ
  - **Manifest**: マニフェストの内容とアイコン確認
  - **Service Workers**: 登録状態 / 更新ボタン
  - **Push Messaging**: Push 通知のテスト送信
- **Lighthouse** → PWA カテゴリ（インストール可能性のチェック）
- [PWA Builder](https://www.pwabuilder.com/) でマニフェスト診断

## 演習

### ゴール

- `manifest.webmanifest` を作成して DevTools で PWA スコアを確認する
- VAPID 鍵を生成して Push 通知の購読コードを書く

### 手順 1: manifest.webmanifest を作成する

lesson127 で作った `pwa-sample` プロジェクトを使います。`vite-plugin-pwa` がマニフェストを自動生成しますが、ここでは手動で置く方法も確認します。

`public/manifest.webmanifest`:

```json
{
  "name": "PWA Sample App",
  "short_name": "PWA",
  "description": "Service Worker とオフライン対応のサンプル",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "lang": "ja",
  "icons": [
    { "src": "/pwa-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

`index.html` の `<head>` にリンクを追加します:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
    <title>PWA Sample</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`npm run build && npm run preview` でビルドし、DevTools → Application → Manifest でアイコンと name が表示されることを確認します。

### 期待出力

- DevTools → Application → Manifest でアイコンと `name: "PWA Sample App"` が表示される
- アドレスバーにインストールアイコンが現れる

### 手順 2: VAPID 鍵を生成して Push 通知の購読コードを書く

VAPID 鍵の生成には `web-push` パッケージを使います。

```bash
npm install web-push
npx web-push generate-vapid-keys
```

出力例:

```
Public Key:
BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

生成した公開鍵を使って購読コードを書きます。`src/subscribe.ts`:

```ts
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = "ここに生成した公開鍵を貼る";

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("通知が拒否されました");
    return null;
  }

  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  console.log("購読情報:", JSON.stringify(subscription));
  return subscription;
}
```

### 変える

`display: "standalone"` を `display: "browser"` に変えてビルドし直します。`browser` ではブラウザの UI バーが残り、アドレスバーやナビゲーションボタンが表示されます。`standalone` と見比べると、インストール後のアプリ体験の違いが分かります。

### 自分で書く

サーバーサイドから Web Push を送信する最小スクリプトを書きます。

`scripts/send-push.ts`:

```ts
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

// 手順 2 で subscribeToPush() が出力した購読情報を貼る
const subscription: webpush.PushSubscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/xxxxxxxxxx",
  keys: {
    p256dh: "xxxxxxxxxxxxxxxxxxxx",
    auth: "xxxxxxxxxxxx",
  },
};

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

await webpush.sendNotification(
  subscription,
  JSON.stringify({
    title: "テスト通知",
    body: "Web Push が届きました",
    url: "/",
  }),
);

console.log("Push 送信完了");
```

`VAPID_PUBLIC_KEY` と `VAPID_PRIVATE_KEY` を環境変数に設定してから実行します:

```bash
VAPID_PUBLIC_KEY=xxx VAPID_PRIVATE_KEY=yyy npx tsx scripts/send-push.ts
```

ブラウザで購読済みの状態でこのスクリプトを実行し、通知が届けば成功です。

## まとめ

- **Web Push** は Push Service が中継する。購読 → endpoint 保存 → サーバーから送信 → SW が受信の流れ
- **VAPID** は送信者認証の仕組み。公開鍵をブラウザに登録し、送信時に秘密鍵で署名する
- **Background Sync** でオフライン時の送信失敗を再接続後に自動リトライできる
- **`manifest.webmanifest`** の `display` / `icons` / `shortcuts` でアプリ体験を整える
- **iOS Safari** で Push 通知が使えるのは iOS 16.4 以降かつホーム画面インストール後のみ
- DevTools の Application タブと **Lighthouse PWA** / **PWA Builder** で診断する
