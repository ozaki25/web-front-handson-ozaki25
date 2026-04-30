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

### Background Sync（紹介のみ）

「**ネットがない時に送信失敗した POST を、復活した時に再送する**」仕組みです。実装には未送信データを一時保管する場所（IndexedDB）が必要なので、本レッスンでは API の形だけ眺めて、IndexedDB のレッスンで実装に踏み込みます。

クライアント側で「あとで送る」とタグ付きで登録:

```js
const reg = await navigator.serviceWorker.ready;
await reg.sync.register("send-message");
```

Service Worker 側でタグごとに処理を書く:

```js
self.addEventListener("sync", (event) => {
  if (event.tag === "send-message") {
    event.waitUntil(sendQueuedMessages());
  }
});
```

`sendQueuedMessages()` は IndexedDB から未送信データを取り出して `fetch` し、成功したものをキューから消す処理になります（実装は IndexedDB のレッスンで扱います）。

`Periodic Background Sync` は **定期的にバックグラウンドで実行** する別の API で、権限の関係で対応ブラウザが限られます。

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

lesson127 で作った `pwa-sample` プロジェクトを使います。lesson127 では `vite-plugin-pwa` の `manifest` オプションで自動生成していましたが、ここでは **静的ファイルを手動で配置する形** を確認します。両方ある場合、`<link rel="manifest" href="...">` で指定したパスのファイルが優先されます（プラグインの自動生成は `<link>` を後から書き換えない限り上書きされません）。

アイコンは lesson127 の手順で `public/pwa-192.png` / `public/pwa-512.png` を置いている前提です。まだ無ければ、任意の 192×192 / 512×512 PNG を同名で配置してください（無くても manifest 自体は読めますが、DevTools のアイコンプレビューが broken image になります）。

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

生成した公開鍵を使って購読コードを書きます。下のコードは解説で示したクライアント側の購読コードを TypeScript で書き直したものです（`urlBase64ToUint8Array` も同じ実装）。`src/subscribe.ts`:

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

`public/manifest.webmanifest` の `display` を `"standalone"` から `"browser"` に変更し、`npm run build && npm run preview` で再ビルドします。アドレスバーから一度アンインストール（DevTools → Application → Manifest の「Uninstall」）してからインストールし直してください（インストール済みのアプリは `display` 変更が反映されません）。

期待差分:

- `standalone`: ホーム画面から起動するとアドレスバーとナビゲーションボタンが消え、ネイティブアプリのように見える
- `browser`: ホーム画面から起動してもアドレスバーとナビゲーションボタンが表示され、通常のブラウザタブと同じ見た目

### 自分で書く（オプション）

サーバーサイドから Web Push を送信する最小スクリプトを書きます。本コースの主軸は Next.js 上での Push なので、このステップは StackBlitz では再現が難しい部分があります（後の章で Next.js の Route Handler から送る形が本筋）。「動かせる人だけ動かす」位置づけで読んでください。

事前準備:

1. `npm install -D tsx` を行い、TypeScript ファイルを直接実行できるようにする
2. プロジェクト直下に `.env` を作成し、`web-push generate-vapid-keys` で出力した値を貼る

`.env`:

```
VAPID_PUBLIC_KEY=BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

`scripts/send-push.ts`:

```ts
import "dotenv/config";
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

`dotenv` をインストールしてから実行します:

```bash
npm install -D dotenv
npx tsx scripts/send-push.ts
```

ブラウザで購読済みの状態でこのスクリプトを実行し、通知が届けば成功です。失敗しやすい点:

- `web-push generate-vapid-keys` で出した値と、購読時にクライアントに渡した値が一致していない（古い購読情報を貼ってしまっている）
- `subscription.endpoint` が古い（ブラウザを変えた / 購読を解除した後で残ったもの）

VAPID 鍵を作り直したら、ブラウザの DevTools → Application → Service Workers から **Unregister** して購読し直す必要があります。

## まとめ

- **Web Push** は Push Service が中継する。購読 → endpoint 保存 → サーバーから送信 → SW が受信の流れ
- **VAPID** は送信者認証の仕組み。公開鍵をブラウザに登録し、送信時に秘密鍵で署名する
- **Background Sync** でオフライン時の送信失敗を再接続後に自動リトライできる
- **`manifest.webmanifest`** の `display` / `icons` / `shortcuts` でアプリ体験を整える
- **iOS Safari** で Push 通知が使えるのは iOS 16.4 以降かつホーム画面インストール後のみ
- DevTools の Application タブと **Lighthouse PWA** / **PWA Builder** で診断する
