# lesson126: CORS の詳細

## ゴール

- 同一オリジンポリシーと CORS（Cross-Origin Resource Sharing）の関係を説明できる
- **シンプルリクエスト** と **プリフライト**（OPTIONS）の違いを区別できる
- `Access-Control-Allow-Origin` / `Allow-Credentials` / `Allow-Headers` の使い分けが分かる
- `credentials: "include"` と Cookie の絡みを理解する
- よくある CORS エラーを **メッセージから即座に原因に到達** できる

## 解説

### 同一オリジンポリシーの復習

ブラウザは「**異なるオリジン** からの応答を JS に渡さない」という規則（同一オリジンポリシー）を持っています。

オリジン = `スキーム + ホスト + ポート`。

| URL A | URL B | 同一オリジン？ |
|---|---|---|
| `https://example.com` | `https://example.com/api` | はい |
| `https://example.com` | `http://example.com` | **いいえ**（スキームが違う） |
| `https://example.com` | `https://api.example.com` | **いいえ**（ホストが違う） |
| `https://example.com:443` | `https://example.com:8080` | **いいえ**（ポートが違う） |

### CORS = 「異なるオリジンからの読み取りを **明示的に許可**」

API がブラウザから直接呼ばれる現代では、別オリジンから読みたい場面が多発します。CORS は「**サーバー側がレスポンスヘッダで許可を出した時** に限り、ブラウザが JS にレスポンスを渡す」仕組みです。

ポイント:

- **送信は誰でもできる**（リクエスト自体はブラウザが送る）
- **応答を JS が読めるかどうか** は CORS ヘッダ次第
- だから **CSRF とは別問題**（CSRF は送信を防ぐ話）

### シンプルリクエスト

GET / POST / HEAD で、**ヘッダが標準的なもの** だけのリクエストは、ブラウザが直接送信します。

条件（主なもの）:

- メソッドは GET / POST / HEAD
- カスタムヘッダなし
- `Content-Type` は `application/x-www-form-urlencoded` / `multipart/form-data` / `text/plain` のいずれか

例:

```js
fetch("https://api.example.com/posts");
```

サーバーは応答に CORS ヘッダを返す:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://my-site.example
Content-Type: application/json
```

`Access-Control-Allow-Origin` がリクエスト元オリジンと一致 / `*` ならブラウザが JS に応答を渡す。一致しなければ **JS から読めずエラー**。

### プリフライト（OPTIONS）

メソッドが PUT / DELETE / PATCH、または `Content-Type: application/json` のような **シンプルでない** リクエストは、ブラウザが **本リクエストの前に OPTIONS** を送って許可を確認します。

<img src="/diagrams/cors-preflight-sequence.svg" alt="プリフライトの時系列: ブラウザが OPTIONS を送り、サーバーが Allow ヘッダ付き 204 を返すと本リクエストが許可される。拒否時は本リクエストがブロックされる。シンプルリクエストは OPTIONS なし。" class="diagram" />

```
OPTIONS /posts HTTP/1.1
Origin: https://my-site.example
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization
```

サーバーが応答:

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://my-site.example
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

OPTIONS の応答が **OK + 適切なヘッダ** ならブラウザは本リクエストを送る。NG なら本リクエストは飛ばない。

#### `Access-Control-Max-Age`

OPTIONS の結果を **キャッシュする秒数**。これがないとリクエストごとに OPTIONS が走って遅くなります。`3600`（1 時間）程度が目安。

### 主要ヘッダ

#### サーバー → ブラウザ（応答）

| ヘッダ | 内容 |
|---|---|
| `Access-Control-Allow-Origin` | 許可するオリジン（または `*`） |
| `Access-Control-Allow-Methods` | 許可するメソッド |
| `Access-Control-Allow-Headers` | 許可するリクエストヘッダ |
| `Access-Control-Allow-Credentials` | Cookie / Authorization を含むリクエストを許可するか |
| `Access-Control-Expose-Headers` | JS から読めるレスポンスヘッダの追加リスト |
| `Access-Control-Max-Age` | プリフライトのキャッシュ秒 |

#### ブラウザ → サーバー（リクエスト）

| ヘッダ | 内容 |
|---|---|
| `Origin` | リクエスト元オリジン（**ブラウザが自動付与、JS から偽装不能**） |
| `Access-Control-Request-Method` | プリフライト時の本来のメソッド |
| `Access-Control-Request-Headers` | プリフライト時の本来のヘッダ |

### Cookie / 認証ヘッダを含めるには

デフォルトで `fetch` は **クロスオリジンで Cookie を送らない**。送る場合は **両側に追加設定** が必要です。

#### クライアント側

```js
fetch("https://api.example.com/me", {
  credentials: "include",   // Cookie / Authorization を送る
});
```

`credentials` の値:

- `"omit"`: 送らない（デフォルトのクロスオリジン）
- `"same-origin"`: 同一オリジンの時だけ送る（デフォルトの同一オリジン）
- `"include"`: 常に送る（クロスオリジンでも）

#### サーバー側

```
Access-Control-Allow-Origin: https://my-site.example
Access-Control-Allow-Credentials: true
```

**重要な制約**:

- `Allow-Credentials: true` の時、`Allow-Origin: *` は **使えない**。**具体的なオリジン** を返す必要がある
- `Access-Control-Allow-Origin` に複数のオリジンは並べられない（`*` か **1 つだけ**）

複数許可したい場合は **リクエストの Origin を見て動的に返す**:

```ts
const allowed = [
  "https://my-site.example",
  "https://staging.example",
  "http://localhost:3000",
];

export async function GET(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const headers = new Headers({ "Content-Type": "application/json" });
  if (allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify({ ok: true }), { headers });
}
```

`Vary: Origin` を入れると **CDN がオリジン別にキャッシュ** してくれます。これがないと、別オリジンのキャッシュを別の人に返してしまう事故が起きます。

### Cookie 側の `SameSite`

「クロスオリジンで Cookie を送る」には Cookie 側の **`SameSite`** 属性も `None`（+ `Secure`）でないといけません。

```
Set-Cookie: session=abc; SameSite=None; Secure; HttpOnly; Path=/
```

- `SameSite=Strict`: クロスサイトには絶対送らない
- `SameSite=Lax`: トップレベルナビゲーションでは送る（デフォルト）
- `SameSite=None`（+ Secure）: クロスサイトでも送る（同意必要）

これをセットで考えないと、CORS 設定だけ整えても **Cookie が飛ばずログイン状態が維持されない** 事故になります。

### Next.js / Express での設定例

#### Next.js（Route Handler）

```ts
// app/api/posts/route.ts
import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://my-site.example",
];

function corsHeaders(origin: string | null): HeadersInit {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "3600",
    "Vary": "Origin",
  };
  // 許可されていないオリジンには Allow-Origin ヘッダ自体を返さない
  // （空文字を返すとブラウザは「許可なし」だがプロキシ / CDN のキャッシュ汚染源になる）
  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = origin!;
  }
  return headers;
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("Origin")),
  });
}

export async function GET(req: Request) {
  return NextResponse.json({ posts: [] }, {
    headers: corsHeaders(req.headers.get("Origin")),
  });
}
```

#### Express の `cors` パッケージ

```js
import cors from "cors";

app.use(
  cors({
    origin: ["https://my-site.example", "http://localhost:3000"],
    credentials: true,
    maxAge: 3600,
  }),
);
```

### よくある CORS エラーと原因

ブラウザのコンソールに出るメッセージ別の対処。

#### `No 'Access-Control-Allow-Origin' header is present on the requested resource`

→ サーバーがそもそも CORS ヘッダを返していない / OPTIONS で 4xx を返している。サーバー側設定を見直す。

#### `The 'Access-Control-Allow-Origin' header has a value 'X' that is not equal to the supplied origin`

→ `Allow-Origin` が **間違ったオリジン** を返している。動的に Origin を見て一致するものを返す。

#### `The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'`

→ `credentials: "include"` の時は **`*` ではなく具体的オリジン** を返す。

#### `Method PUT is not allowed by Access-Control-Allow-Methods`

→ `Allow-Methods` に PUT を追加。OPTIONS の応答に必ず含める。

#### `Request header 'X-Custom' is not allowed by Access-Control-Allow-Headers`

→ `Allow-Headers` にカスタムヘッダを追加。

#### `Cookie が送られない`

→ クライアント側 `credentials: "include"`、サーバー側 `Allow-Credentials: true`、Cookie の `SameSite=None; Secure` の **3 点セット** を確認。

### CORS が要らないケース

- **同一オリジンへのリクエスト**（`/api/...` のような相対パス）
- **`<img>` / `<script>` / `<link>` での読み込み**（こちらは元から CORS で制限されない。代わりに **`crossorigin` 属性** で読み取り権限が変わる）
- **サーバー → サーバー**（fetch がブラウザを通らない）

「**バックエンドプロキシ経由にすれば CORS 不要**」も実用的な選択肢です。Next.js なら `app/api/...` で **自分のオリジンに薄いラッパー** を置く形になります。

### CORB / CORP / COEP / COOP

似た名前の仕組みが他にもあります。混同しないように整理:

| 名前 | 役割 |
|---|---|
| **CORS** | クロスオリジンレスポンスを **JS に読ませるか** |
| **CORB**（Cross-Origin Read Blocking） | ブラウザが Spectre 対策で内部的に行うレスポンス遮断 |
| **CORP**（`Cross-Origin-Resource-Policy`） | リソース側が **誰に埋め込まれるか** を制限 |
| **COEP**（`Cross-Origin-Embedder-Policy`） | 自ページが埋め込む素材に **CORP / CORS の表明** を強制 |
| **COOP**（`Cross-Origin-Opener-Policy`） | window.opener 経由のクロスオリジン操作を制限 |

通常のアプリで気にするのは **CORS だけ** で済みます。SharedArrayBuffer / WebAssembly Threads を使う高度なケースで COEP/COOP/CORP が必要になります。

## 演習

### ゴール

- 自前 API に対して CORS エラーを **出してから直す** 流れを体験する
- プリフライトの OPTIONS が飛ぶことを観察する

### 手順 1: API サーバー（Hono）

```bash
mkdir cors-server
cd cors-server
npm init -y
npm install hono @hono/node-server
```

`server.ts`:

```ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/posts", (c) => c.json({ posts: ["a", "b", "c"] }));

serve({ fetch: app.fetch, port: 4000 });
console.log("API on http://localhost:4000");
```

```bash
npx tsx server.ts
```

### 手順 2: クライアント（別ポート）

別ターミナルで:

```bash
npm create vite@latest cors-client -- --template vanilla-ts
cd cors-client
npm install
npm run dev
```

`src/main.ts`:

```ts
async function load() {
  const res = await fetch("http://localhost:4000/posts");
  const data = await res.json();
  document.body.textContent = JSON.stringify(data);
}
load();
```

ブラウザで `http://localhost:5173`（Vite のデフォルトポート）を開くと、コンソールに **CORS エラー** が出るはずです。

```
Access to fetch at 'http://localhost:4000/posts' from origin 'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 手順 3: サーバーで CORS を許可

`server.ts`:

```ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 3600,
  }),
);

app.get("/posts", (c) => c.json({ posts: ["a", "b", "c"] }));
app.put("/posts/:id", (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: 4000 });
```

再起動するとクライアントから読めるようになります。

### 手順 4: プリフライトを観察

PUT を呼ぶ:

```ts
await fetch("http://localhost:4000/posts/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "updated" }),
});
```

DevTools の Network タブで:

1. まず **OPTIONS** が飛ぶ
2. 200 / 204 が返る
3. その後 **PUT** が飛ぶ

を確認します。

### 期待出力

- 最初は CORS エラー
- サーバーで許可してから読める
- PUT 時に **OPTIONS → PUT** の 2 段階のリクエストが見える

### 変える

- `Access-Control-Max-Age: 3600` を削除すると毎回 OPTIONS が飛ぶ
- `credentials: true` を消した状態で `fetch(url, { credentials: "include" })` するとエラー
- `origin` に `"*"` を入れると、`credentials` を使う場合だけエラー（仕様違反）

### 自分で書く（任意）

- Next.js の Route Handler で同じ CORS 設定を再現する
- `SameSite=None; Secure` の Cookie を使ってログインを成立させる
- バックエンドプロキシ（Next.js の `/api/proxy`）を立てて、CORS を消す構成にする

## まとめ

- CORS は **「クロスオリジン応答を JS に読ませるかどうか」** をサーバーが許可する仕組み
- **シンプルリクエスト** と **プリフライト**（OPTIONS） の 2 ルート
- 主要ヘッダ: `Allow-Origin` / `Allow-Methods` / `Allow-Headers` / `Allow-Credentials` / `Max-Age`
- **`credentials: "include"`** を使うなら、サーバー側で `Allow-Credentials: true` + 具体的なオリジン
- **Cookie の `SameSite=None; Secure`** とセットで考える
- 動的に Origin を見て返す時は **`Vary: Origin`** をつけて CDN を安全に
- エラーメッセージから原因を特定できる定型パターンを覚える
- 「バックエンドプロキシで CORS を消す」も実用解
