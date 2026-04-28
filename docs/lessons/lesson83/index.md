# lesson83: 環境変数の基本

## ゴール

- `.env.local` に環境変数を書いて `process.env` から読める
- `NEXT_PUBLIC_` プレフィックスの意味を理解する
- Server Component と Client Component で **読める変数が違う** ことを体感する
- `.env.local` が `.gitignore` に入っている前提を知る

## 解説

### なぜ環境変数か

アプリには「環境ごとに変えたい値」があります。

- ローカル開発では `http://localhost:3000` の API、本番では `https://api.example.com` の API を叩きたい
- 開発用のテスト API キー、本番用のリリース API キー
- 機能フラグ（開発では有効、本番では無効）

これをコード本体に直接書くと、環境を変えるたびにコード修正 → デプロイが必要になり、シークレット（秘密鍵）の場合はリポジトリに漏れる危険もあります。

そこで、**環境変数**（Environment Variables）として外に出します。Next.js では `.env.local` というファイルに書く形が標準です。

### `.env.local` の書き方

プロジェクトルート直下に `.env.local` を作り、`KEY=VALUE` の形で書きます。

```
NEXT_PUBLIC_APP_NAME=My Todo App
APP_SECRET=super-secret-value
```

- 1 行 1 変数、`=` の左右にスペース不要
- クォートは不要（ただし空白を含むならクォートも可）
- ファイル末尾に改行を入れておく

**`.env.local` は `.gitignore` に入っている** のがデフォルト（`create-next-app` で作ったプロジェクトはこうなっています）。シークレットがリポジトリに入らない仕組みです。

### 読み方は `process.env.XXX`

コード側から読むときは、`process.env` オブジェクトを使います。

```ts
const name = process.env.NEXT_PUBLIC_APP_NAME; // "My Todo App"
const secret = process.env.APP_SECRET;          // "super-secret-value"（サーバー側のみ）
```

戻り値は常に `string | undefined`（TS の型）。値が無ければ `undefined` です。

### `NEXT_PUBLIC_` プレフィックスの意味

Next.js には重要なルールがあります。

> **`NEXT_PUBLIC_` で始まる変数だけが、Client Component からも読める。**
> **それ以外の変数は、Server Component・Route Handlers・Server Actions からしか読めない。**

なぜか:

- **サーバー側のみ** = ブラウザに配信される JS に値が入らない。シークレットを隠せる
- **`NEXT_PUBLIC_` 付き** = ビルド時にクライアント JS に値が埋め込まれる。公開しても構わない値だけ付ける

逆に言うと、`NEXT_PUBLIC_` で始まる変数は **ブラウザのソースを開けば全員が見える** ので、シークレットには絶対に付けません。

### `NEXT_PUBLIC_` の値は「一度公開したら取り消せない」

`NEXT_PUBLIC_` で始まる値は **ビルド時に JS バンドルへ焼き込まれて配信されます**。これが意味するのは:

- **CDN / ブラウザキャッシュ / Service Worker** に値が残り、デプロイをロールバックしても回収できない
- **Git の履歴に `.env.local` を誤って commit してしまった場合**、後から削除しても commit ハッシュをたどれば閲覧可能（force push と git history 削除も完全ではない）
- **リファラ / アクセスログ / 第三者の Web Archive** に URL ごと値が残ることもある

そのため、誤って `NEXT_PUBLIC_API_SECRET=...` のようにシークレットを付けてしまったら、**まずそのキーを発行元でローテート（無効化＋再発行）するのが優先**です。コード修正 / デプロイで取り消すことはできません。

### 命名の指針

- 公開しても困らない（URL、アプリ名、GA トラッキング ID など）: `NEXT_PUBLIC_` を付ける
- 公開すると困る（API キー、DB 接続文字列、JWT の秘密鍵など）: プレフィックスなし

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。`.env.local` と `app/env-test/` 配下の 2 ファイルを新規作成するだけです。

### ゴール

- `.env.local` に 2 種類の変数を書く
- Server Component と Client Component からそれぞれ読み、**プレフィックスなしの変数は Client では `undefined` になる** ことを体感する
- 本番（Vercel）での設定は「Vercel にデプロイする」でまとめて扱う

### 手順

1. 5 章 の既存プロジェクトを開く（どれでも可）
2. プロジェクトルートに `.env.local` を新規作成
3. 新しいページ `app/env-test/page.tsx`（Server Component）と `app/env-test/ClientView.tsx`（Client Component）を作る
4. プレビューで両方を比較

### `.env.local`（プロジェクトルート直下）

```
NEXT_PUBLIC_APP_NAME=私の TODO アプリ
APP_SECRET=super-secret-value
```

`.env.local` を編集した後は **開発サーバーを再起動** する必要があります（StackBlitz なら自動再起動、ローカルなら `Ctrl+C` → `npm run dev`）。

### `app/env-test/page.tsx`（Server Component）

```tsx
import { ClientView } from "./ClientView";

export default function EnvTestPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const secret = process.env.APP_SECRET;

  return (
    <main>
      <h1>環境変数のテスト</h1>

      <section>
        <h2>Server Component から読む</h2>
        <p>NEXT_PUBLIC_APP_NAME = {appName ?? "(undefined)"}</p>
        <p>APP_SECRET = {secret ?? "(undefined)"}</p>
      </section>

      <ClientView />
    </main>
  );
}
```

### `app/env-test/ClientView.tsx`（Client Component）

```tsx
"use client";

export function ClientView() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const secret = process.env.APP_SECRET;

  return (
    <section>
      <h2>Client Component から読む</h2>
      <p>NEXT_PUBLIC_APP_NAME = {appName ?? "(undefined)"}</p>
      <p>APP_SECRET = {secret ?? "(undefined)"}</p>
    </section>
  );
}
```

### 期待出力

`/env-test` にアクセスすると、次のような表示になります。

- **Server Component から読む**
  - `NEXT_PUBLIC_APP_NAME = 私の TODO アプリ`
  - `APP_SECRET = super-secret-value`
- **Client Component から読む**
  - `NEXT_PUBLIC_APP_NAME = 私の TODO アプリ`
  - `APP_SECRET = (undefined)` ← **ここが重要**

`APP_SECRET` は Client 側では読めません。これが「サーバー専用の変数」と「クライアントに公開される変数」の違いを体感する瞬間です。

### さらに確認: ブラウザのソースを見る

1. `/env-test` を開いた状態で、ブラウザで「ページのソースを表示」
2. HTML ソース内で `super-secret-value` を検索 → **見つからない**（Client Component のバンドル JS にも含まれない）
3. `私の TODO アプリ` を検索 → 見つかる（`NEXT_PUBLIC_` なのでクライアントに配信されている）

シークレットが本当に漏れない仕組みになっていることを確認できます。

### 変える

- `APP_SECRET` の名前を `NEXT_PUBLIC_APP_SECRET` に変えると、Client 側でも読めるようになる（が、シークレットを付けるのは NG）
- 新しい変数 `NEXT_PUBLIC_API_URL=https://jsonplaceholder.typicode.com` を追加し、Client 側で `fetch(process.env.NEXT_PUBLIC_API_URL + "/posts")` して動作確認

### 自分で書く

- `NEXT_PUBLIC_GA_ID`（Google Analytics の ID 仮置き、`G-XXXXXX` のような値）を追加し、Server Component のレイアウトに表示する
- `DB_URL=postgres://user:pass@localhost/mydb` を追加し、Server Component でだけ表示する（Client に漏れないことを確認）

### 本番対比の予告

ローカルの `.env.local` は開発マシン上にしかありません。本番環境（Vercel）では、**Vercel ダッシュボードで同名の環境変数を設定** してデプロイします。その手順は **「Vercel にデプロイする」** でまとめて扱います。

本番でも `process.env.NEXT_PUBLIC_APP_NAME` で同じように読める、という点だけ先に知っておいてください。

### 環境ごとに値を分ける（Production / Preview / Development）

Vercel など主要なホスティングでは、環境変数を **Production / Preview / Development の 3 つ** に分けて設定できます。実務ではこの 3 つに **別々の値** を入れるのが定石です。

- **Production**: 本番ドメイン（`https://my-app.com`）で読み込まれる値
- **Preview**: PR ごとに作られるプレビュー URL（`https://my-app-pr-42.vercel.app` のような）で読み込まれる値
- **Development**: ローカルの `.env.development.local` で読み込まれる値（個人開発機向け）

たとえば DB やアナリティクス、フィーチャーフラグの SDK key は **Preview と Production で別の環境** を指すように設定します。同じ値を使い回すと、

- Preview の動作確認が **本番 DB のデータを書き換える事故** を起こす
- A/B テスト・アナリティクスの計測値に **開発者の挙動が混ざる**
- 本番フラグを **誤って Preview から ON にしてしまう**

といった事故になります。Vercel なら `Settings → Environment Variables` で各変数に対して **適用環境にチェックを入れる** UI があるので、新規追加時は「3 つ全部にチェック」ではなく **環境ごとに必要な値を分ける** ことを意識してください。

## まとめ

- 環境変数は `.env.local` に `KEY=VALUE` で書く
- `process.env.XXX` で読む。戻り値は `string | undefined`
- **`NEXT_PUBLIC_` 付きはクライアントに配信される**、それ以外はサーバー専用
- シークレットには絶対に `NEXT_PUBLIC_` を付けない
- `.env.local` はデフォルトで `.gitignore`。リポジトリに入らない
- 本番（Vercel）での設定は「Vercel にデプロイする」で扱う
