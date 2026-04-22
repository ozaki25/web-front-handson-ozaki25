# lesson71: Middleware で認証前処理

## ゴール

- `middleware.ts` を使ってリクエストに割り込める
- 認証状態（Cookie）に応じてリダイレクトできる
- Edge ランタイムの制約を理解する
- `matcher` で適用範囲を絞れる

## 解説

### Middleware とは

**Middleware** は、Next.js が **すべてのリクエストの前** に実行してくれる関数です。ページや Route Handler が呼ばれる前に「認証済みか確認する」「言語設定でリダイレクトする」など、横断的な前処理を書けます。

配置ルール:

- ファイル名は **`middleware.ts`（または `.js`）** 固定
- 配置は **プロジェクトルート直下**（`app/` の横）
- 1 つのプロジェクトに 1 ファイルのみ

### 最小の middleware

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ここに前処理を書く
  return NextResponse.next(); // 通常通りページを表示
}
```

- 引数 `request` は `NextRequest`（通常の `Request` に Next.js 独自の機能を追加したもの）
- 戻り値:
  - `NextResponse.next()` → そのままページへ
  - `NextResponse.redirect(url)` → リダイレクトする
  - `NextResponse.rewrite(url)` → URL はそのままで別ページを表示（中身を差し替え）

### `matcher` で適用範囲を絞る

デフォルトでは **すべてのリクエスト** で middleware が動きます。特定のパスだけで動かすには `config.matcher` を書きます。

```ts
export const config = {
  matcher: ["/todos/:path*", "/admin/:path*"],
};
```

- `/todos/:path*` は `/todos` と `/todos/*` の全部にマッチ
- 静的アセット（画像・CSS）など余計なものを避ける

### Edge ランタイムの制約

Middleware は **既定で Edge ランタイム** で動きます。Node.js ランタイムとは違い、以下が使えません。

- `fs`（ファイルシステム）
- `path`（パスユーティリティのうち一部）
- ネイティブモジュール全般

Edge は「世界中のエッジサーバーで素早く動く」ことを目的にしているため、Node 依存の重い処理はできません。DB 接続や重い計算は Route Handlers や Server Component（どちらも既定 Node.js）に任せる、と役割分担します。

前のレッスンの Route Handlers は既定で Node.js、Middleware は既定で Edge。この違いは覚えておいてください。

### 本コースの範囲

本レッスンでは **最小形の認証前処理** だけを扱います。

- Cookie `auth` がある → 通す
- Cookie `auth` が無い → `/login` にリダイレクト

本格的な認証（NextAuth、JWT 検証、セッション管理）は扱いません。「認証のガワを書く感じ」を体験するだけです。

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。`middleware.ts` と `app/login/page.tsx` の 2 ファイルが中心です。`/todos` ページが存在しない場合は、最小形の `app/todos/page.tsx`（`<h1>TODO 一覧</h1>` だけでも可）を用意すれば `matcher` の挙動を確認できます。

### ゴール

- `/todos` にアクセスしたとき、Cookie `auth` が無ければ `/login` にリダイレクトする
- `/login` ページで「ログイン」ボタンを押すと Cookie が立って `/todos` に戻れる

### 手順

1. 前のレッスンのプロジェクトを開く（またはこれまでの章 5 プロジェクト）
2. `middleware.ts` をプロジェクトルート直下に新規作成
3. `app/login/page.tsx` を新規作成

### `middleware.ts`（プロジェクトルート直下）

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const auth = request.cookies.get("auth");

  if (!auth) {
    // /login にリダイレクト
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/todos/:path*"],
};
```

ポイント:

- `request.cookies.get("auth")` で Cookie を読む
- `NextResponse.redirect(loginUrl)` でリダイレクト
- `matcher` で `/todos` 配下だけに適用（`/` や `/about` は素通り）

### `app/login/page.tsx`（新規）

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  function handleLogin() {
    // Cookie をその場で立てる（max-age 1 時間）
    document.cookie = "auth=1; path=/; max-age=3600";
    // /todos に遷移
    router.push("/todos");
  }

  return (
    <main>
      <h1>ログイン</h1>
      <p>
        本格認証は本コースでは扱いません。下のボタンで Cookie を立てて `/todos`
        にアクセスできるようにします。
      </p>
      <button type="button" onClick={handleLogin}>
        ログイン
      </button>
    </main>
  );
}
```

ポイント:

- `"use client"` を付ける（`document.cookie` や `useRouter` を使うため）
- ボタンクリックで `document.cookie` を直接書く
- `useRouter().push("/todos")` で `/todos` に遷移

### 期待出力

1. Cookie が何もない状態で `/todos` にアクセス → `/login` にリダイレクトされる
2. 「ログイン」ボタンを押す → `/todos` に遷移、一覧が見える
3. DevTools → Application → Cookies で `auth=1` が登録されているのが確認できる
4. Cookie を削除してから `/todos` にアクセスし直す → また `/login` に戻される

### 変える

- Cookie 名を `session` に変えて、`middleware.ts` と `login/page.tsx` の両方を追随する
- `matcher` を `["/todos/:path*", "/admin/:path*"]` に増やして、`/admin/page.tsx` を作り、そちらでもリダイレクトが効くことを確認
- `NextResponse.redirect` を `NextResponse.rewrite` に変えて挙動の違いを見る（URL が書き換わらないで表示が変わる）

### 自分で書く

- 「ログアウト」ボタンを `/login` に追加し、Cookie を消す:
  ```ts
  document.cookie = "auth=; path=/; max-age=0";
  ```
- `/todos` のページヘッダーに「ログイン中」と表示し、Cookie が無いとリダイレクトされるので逆に常に「ログイン中」しか出ないことを確認

### Route Handlers との組み合わせ（発展）

前のレッスンで作った `/api/todos` も、middleware で認証必須にできます。

```ts
export const config = {
  matcher: ["/todos/:path*", "/api/todos/:path*"],
};
```

これで `/api/todos` を Cookie なしで叩くと `/login` にリダイレクトされるようになります。API の場合は通常 401 を返すほうが妥当なので、実務ではもう少し分岐を書きますが、本コースでは「middleware で API も守れる」ことだけ押さえます。

### Edge の制約を体感

`middleware.ts` で試しに以下を書くとエラーになります。

```ts
import fs from "fs"; // NG: Edge では使えない
```

ビルド時・実行時に「Module not supported」のようなエラーが出ます。Edge ランタイムの制約を体感するなら 1 度書いて、確認したら消してください。

## まとめ

- `middleware.ts` はルート直下に 1 ファイル、全リクエストに割り込む
- `NextResponse.next` / `redirect` / `rewrite` で分岐
- `matcher` で適用パスを絞る
- Edge ランタイムなので `fs` 等は使えない（Route Handlers の Node.js とは別物）
- 本格認証は本コース外。疑似ログインで流れだけ掴む
