# lesson129: PWA の manifest とインストール

## ゴール

- `manifest.webmanifest` の主要フィールドを設定できる
- `display` の違い（`standalone` / `browser`）を体験できる
- Web Push 通知のサーバー → SW → ブラウザの大まかな流れを説明できる
- iOS Safari の制約を把握している

## 解説

lesson128 で学んだ Service Worker を使って、ネイティブアプリに近い機能を追加します。

### `manifest.webmanifest` の主要フィールド

PWA をホーム画面にインストール可能にするには `manifest.webmanifest` が必要です。

```json
{
  "name": "My PWA App",
  "short_name": "PWA",
  "description": "サンプル PWA アプリ",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "lang": "ja",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
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

HTML の `<head>` に次の 1 行を加えると、ブラウザがマニフェストを読み込みます。

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

> **補足: `theme_color` をダーク/ライトで切り替える**: `<meta name="theme-color">` に `media` 属性を付けるとダーク/ライトで切り替えられます。
>
> ```html
> <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
> <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a">
> ```

### `display` の違い

| 値 | 見た目 |
|---|---|
| `standalone` | アドレスバーとナビゲーションボタンが消え、アプリのように見える |
| `browser` | 通常のブラウザタブと同じ見た目 |
| `minimal-ui` | アドレスバーだけ残してナビゲーションボタンを消す |
| `fullscreen` | ブラウザ UI が完全に消える（ゲーム向け） |

### Web Push 通知の仕組み（概念）

Web Push はブラウザを閉じている時でもプッシュ通知が届く仕組みです。3つのシステムが関わります。

```
クライアント ──購読──→ Push Service（ブラウザベンダーが運営）──endpoint 発行──→ クライアント
クライアント ──endpoint を保存──→ あなたのサーバー
あなたのサーバー ──Push 送信──→ Push Service ──配信──→ SW の push イベント → 通知表示
```

- **Push Service**: Apple・Google・Mozilla それぞれが運営するリレーサーバー
- **VAPID**: 「あなたのサーバーが正規の送信者だ」と Push Service に証明するための公開鍵暗号の仕組み。VAPID 秘密鍵で署名して送る
- **Service Worker**: `push` イベントを受け取って `showNotification()` を呼ぶ

実装は `web-push` パッケージ（Node.js）と Service Worker の `push` イベントリスナーを組み合わせます。本レッスンでは流れの把握にとどめ、実装は扱いません。

### iOS Safari の制約

Web Push は **iOS 16.4 以降のみ** 動作します。

動作条件:

- ホーム画面に **インストール済み**（ホーム画面追加が必要）
- HTTPS
- ユーザーの明示的な購読操作

通常の Safari ブラウザ（ホーム画面追加なし）では Push が動きません。

### 確認ツール

- Chrome DevTools → **Application** タブ
  - **Manifest**: マニフェストの内容とアイコン確認
  - **Service Workers**: 登録状態 / 更新ボタン
- **Lighthouse** → PWA カテゴリ（インストール可能性のチェック）

## 演習

### ゴール

- `manifest.webmanifest` を作成して DevTools で PWA スコアを確認する
- `display` の違いを体験する

### 手順 1: manifest.webmanifest を作成する

lesson128 で作った `pwa-sample` プロジェクトを使います。lesson128 では `vite-plugin-pwa` の `manifest` オプションで自動生成していましたが、ここでは静的ファイルを手動で配置する形を確認します。

アイコンは lesson128 の手順で `public/pwa-192.png` / `public/pwa-512.png` を置いている前提です。まだ無ければ、任意の 192×192 / 512×512 PNG を同名で配置してください。

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
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
```

`npm run build && npm run preview` でビルドし、DevTools → Application → Manifest でアイコンと name が表示されることを確認します。

### 期待出力

- DevTools → Application → Manifest でアイコンと `name: "PWA Sample App"` が表示される
- アドレスバーにインストールアイコンが現れる

### 変える

`display` を `"standalone"` から `"browser"` に変更して `npm run build && npm run preview` で再ビルドします。インストール済みのアプリに変更を反映するには、DevTools → Application → Manifest の「Uninstall」で一度アンインストールしてからインストールし直してください。

期待差分:

- `standalone`: ホーム画面から起動するとアドレスバーが消え、アプリのように見える
- `browser`: ホーム画面から起動してもアドレスバーが表示され、通常のブラウザタブと同じ

## まとめ

- **`manifest.webmanifest`** の `display` / `icons` / `theme_color` でインストール体験を整える
- `<link rel="manifest">` で HTML に紐付ける
- **Web Push** は Push Service が中継する 3 システム構成。VAPID で送信者を認証する
- **iOS Safari** で Push 通知が使えるのは iOS 16.4 以降かつホーム画面インストール後のみ
- DevTools の Application タブと Lighthouse PWA カテゴリで動作確認できる
