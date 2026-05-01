# lesson129: PWA の manifest とインストール

## ゴール

- PWA がなぜ「インストール」できるのかを説明できる
- `manifest.webmanifest` の主要フィールドを設定できる
- `display` の違い（`standalone` / `browser`）を体験できる
- Web Push 通知のサーバー → SW → ブラウザの大まかな流れを説明できる
- iOS Safari の制約を把握している

## 解説

lesson128 で学んだ Service Worker を使って、ネイティブアプリに近い機能を追加します。

### PWA とは「インストールできる Web アプリ」

通常の Web サイトはブラウザで URL を開くだけですが、PWA（Progressive Web App）は次の条件を満たすとホーム画面に追加できるようになります。

- HTTPS で配信されている
- Service Worker が登録されている
- **`manifest.webmanifest` が設定されている**

ホーム画面からアプリアイコンで起動でき、`display: standalone` を指定するとアドレスバーが消えてネイティブアプリのような見た目になります。

インストールの主なメリット:
- ブラウザ URL バーなしで起動できる（アプリらしい外観）
- ホーム画面のアイコンからすぐ開ける
- オフラインキャッシュと組み合わせると、ネットがなくても起動できる

### `manifest.webmanifest` の役割

`manifest.webmanifest` は「このアプリの名前・アイコン・起動方法」をブラウザに伝える JSON ファイルです。HTML の `<head>` から次のように参照します。

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

ブラウザはこのファイルを見て「インストール可能か」を判断し、アドレスバーにインストールアイコンを表示するかどうか決めます。

### 主要フィールド

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
| `name` | インストール画面・スプラッシュに表示される正式名 |
| `short_name` | ホーム画面のアイコン下に表示される短い名前 |
| `display` | 起動時のブラウザ UI の表示モード（後述） |
| `theme_color` | 上部バーや OS タスクバーの色 |
| `background_color` | スプラッシュ画面の背景色 |
| `icons` | ホーム画面のアイコン（複数サイズを用意） |
| `purpose: "maskable"` | OS が円形等にトリミングできるアイコン |

### `display` の違い

起動時にブラウザ UI をどこまで表示するかを指定します。

| 値 | 見た目 |
|---|---|
| `standalone` | アドレスバーとナビゲーションボタンが消え、アプリのように見える |
| `browser` | 通常のブラウザタブと同じ見た目 |
| `minimal-ui` | アドレスバーだけ残してナビゲーションボタンを消す |
| `fullscreen` | ブラウザ UI が完全に消える（ゲーム向け） |

多くの PWA では `standalone` を選びます。`browser` にすると「なぜわざわざインストールしたのか」という見た目になるので、インストールを促す意味がなくなります。

> **ダークモード対応**: `<meta name="theme-color">` に `media` 属性を付けると OS のテーマ設定に応じて切り替えられます。マニフェストの `theme_color` はインストール後のフォールバックとして残し、`<meta>` が上書きする形になります。
>
> ```html
> <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
> <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a">
> ```

### Web Push 通知の仕組み（概念のみ）

Service Worker があるとブラウザを閉じていても通知を受け取れます。ただし配信の仕組みは少し複雑です。

Web Push では **Push Service** というリレーサーバーが必ず間に入ります。Apple・Google・Mozilla それぞれがブラウザごとに運営しており、あなたのサーバーは直接ブラウザには送れません。

```
クライアント ──購読──→ Push Service ──endpoint 発行──→ クライアント
クライアント ──endpoint を保存──→ あなたのサーバー
あなたのサーバー ──送信──→ Push Service ──配信──→ SW → 通知表示
```

この仕組みが存在する理由は、**バッテリーと通信の効率化**です。スマートフォンがすべてのアプリのサーバーと常時接続を保つ代わりに、OS レベルで Push Service との接続を 1 本だけ維持することで消費電力を抑えています。

**VAPID** は「あなたのサーバーが正規の送信者である」ことを Push Service に証明するための公開鍵暗号の仕組みです。秘密鍵で署名して送ることで、無関係な第三者が勝手に通知を送れなくなります。

実装には `web-push` パッケージ（Node.js）と Service Worker の `push` イベントリスナーが必要です。本レッスンでは流れの把握にとどめ、実装は扱いません。

### iOS Safari の制約

デスクトップ Chrome / Android Chrome では比較的スムーズに動く Web Push ですが、iOS は制約が多いので注意が必要です。

- **iOS 16.4 以降のみ** Web Push が動作する
- **ホーム画面にインストール済みであること**が必須（Safari ブラウザのまま開いただけでは通知を受け取れない）
- HTTPS と明示的なユーザー操作も必要

「iOS の Safari で開いているだけ」では動かない、という点は実装前に確認しておく必要があります。

### 確認ツール

- Chrome DevTools → **Application** タブ
  - **Manifest**: マニフェストの内容とアイコンのプレビュー
  - **Service Workers**: 登録状態の確認・更新ボタン
- **Lighthouse** → PWA カテゴリでインストール可能性をチェック

## 演習

### ゴール

- `manifest.webmanifest` を作成してインストールアイコンが現れることを確認する
- `display` の違いを実際に見比べる

### 手順 1: manifest.webmanifest を作成する

lesson128 で作った `pwa-sample` プロジェクトを使います。lesson128 では `vite-plugin-pwa` の `manifest` オプションで自動生成していましたが、ここでは静的ファイルを手動で配置する形を確認します。

アイコンは lesson128 の手順で `public/pwa-192.png` / `public/pwa-512.png` を置いている前提です。まだ無ければ、任意の 192×192 / 512×512 PNG を同名で配置してください（無くても manifest 自体は読めますが、DevTools のアイコンプレビューが壊れた画像になります）。

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
- アドレスバーにインストールアイコン（PC は ⊕ のようなアイコン）が現れる

### 変える

`display` を `"standalone"` から `"browser"` に変更して `npm run build && npm run preview` で再ビルドします。

インストール済みのアプリに変更を反映するには、DevTools → Application → Manifest の「Uninstall」で一度アンインストールしてから再インストールしてください（インストール済みの状態では変更が反映されません）。

期待差分:

- `standalone`: ホーム画面から起動するとアドレスバーが消え、アプリのように見える
- `browser`: ホーム画面から起動してもアドレスバーが表示され、通常のブラウザタブと同じ

## まとめ

- PWA は HTTPS + Service Worker + **`manifest.webmanifest`** の 3 点セットでインストール可能になる
- `display: standalone` でアドレスバーを消し、ネイティブアプリのような外観にできる
- **Web Push** は Push Service が中継する 3 システム構成。Push Service が存在する理由はバッテリー・通信効率のため
- **VAPID** で送信者を認証し、第三者による不正送信を防ぐ
- **iOS Safari** で Push 通知が使えるのは iOS 16.4 以降かつホーム画面インストール後のみ
- DevTools の Application タブと Lighthouse PWA カテゴリで動作確認できる
