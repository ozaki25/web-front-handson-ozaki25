# lesson82: Proxy で認証前処理

## ゴール

- `proxy.ts` を使ってリクエストに割り込める
- 認証状態（Cookie）に応じてリダイレクトできる
- Node.js ランタイムで動くことと、軽量処理に留めるべき理由を理解する
- `matcher` で適用範囲を絞れる

## 解説

### Proxy とは

**Proxy** は、Next.js が **すべてのリクエストの前** に実行してくれる関数です。ページや Route Handler が呼ばれる前に「認証済みか確認する」「言語設定でリダイレクトする」など、横断的な前処理を書けます。

> Next.js 15 以前は **`middleware.ts`** という名前で同じ役割を担っていました。Next.js 16 から **ネットワーク境界の役割** を明示するために **`proxy.ts`** へ改名され、既定ランタイムも Edge から **Node.js** に変更されました。挙動の基本は変わらないので、古いチュートリアルやブログで `middleware.ts` を見たら「今は proxy のことだ」と読み替えてください。

配置ルール:

- ファイル名は **`proxy.ts`**（または `.js`） 固定
- 配置は **プロジェクトルート直下** または `src/` 直下（`app/` や `pages/` の横に置く）
- 1 つのプロジェクトに 1 ファイルのみ

### 最小の proxy

```ts
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // ここに前処理を書く
  return NextResponse.next(); // 通常通りページを表示
}
```

- 引数 `request` は `NextRequest`（通常の `Request` に Next.js 独自の機能を追加したもの）
- export は **named `proxy` 関数** または **default export** のどちらかで書けます
- 戻り値:
  - `NextResponse.next()` → そのままページへ
  - `NextResponse.redirect(url)` → リダイレクトする
  - `NextResponse.rewrite(url)` → URL はそのままで別ページを表示（中身を差し替え）

### `matcher` で適用範囲を絞る

デフォルトでは **すべてのリクエスト** で proxy が動きます。特定のパスだけで動かすには `config.matcher` を書きます。

```ts
export const config = {
  matcher: ["/todos/:path*", "/admin/:path*"],
};
```

- `/todos/:path*` は `/todos` と `/todos/*` の全部にマッチ
- 静的アセット（画像・CSS）など余計なものを避ける

### Node.js ランタイムで動く

Next.js 16 から、proxy は **既定で Node.js ランタイム** で動くようになりました。以前の middleware が Edge ランタイム（軽量だが Node の `fs` / `path` 等が使えない制約）だったのに対し、proxy では **Node.js の全 API が使えます**。JWT の検証ライブラリ、DB クライアントなども扱えるようになった反面、「軽量な前処理」という設計意図は変わっていません。

重要な指針:

- **重い処理は proxy に書かない**。ユーザー認証の JWT 署名検証や細かい権限チェックは Server Components / Server Actions に寄せる
- proxy は「Cookie が無ければログインへ飛ばす」のような **トラフィック制御** に絞る

「Route Handlers」と同じ Node.js ランタイム上で動きますが、**ページ本体の前に毎回走る** ぶん、オーバーヘッドが気になりやすい点に注意してください。

### 本コースの範囲

本レッスンでは **最小形の認証前処理** だけを扱います。

- Cookie `auth` がある → 通す
- Cookie `auth` が無い → `/login` にリダイレクト

本格的な認証（NextAuth、JWT 検証、セッション管理）は扱いません。「認証のガワを書く感じ」を体験するだけです。

## 演習

### 途中から始める場合

このレッスンは比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します。`proxy.ts` と `app/login/page.tsx` の 2 ファイルが中心です。`/todos` ページが存在しない場合は、最小形の `app/todos/page.tsx`（`<h1>TODO 一覧</h1>` だけでも可）を用意すれば `matcher` の挙動を確認できます。

### ゴール

- `/todos` にアクセスしたとき、Cookie `auth` が無ければ `/login` にリダイレクトする
- `/login` ページで「ログイン」ボタンを押すと Cookie が立って `/todos` に戻れる

### 手順

1. これまでのプロジェクトを開く（5 章 のここまでの成果を引き継ぐ）
2. `proxy.ts` をプロジェクトルート直下に新規作成
3. `app/login/page.tsx` を新規作成

### `proxy.ts`（プロジェクトルート直下）

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
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

### この演習の Cookie は「学習用」（本物のログインではない）

上の `document.cookie = "auth=1; ..."` は **学習用の擬似ログイン** です。本物の認証では絶対にこの形にしません。理由は次の 3 点。

1. **JavaScript から `document.cookie` で書ける Cookie は、ブラウザ側のすべての JS から読める**。XSS（任意の JS が走る攻撃）が成立すると即漏洩します。
2. **`HttpOnly` フラグが付いていない**。本物の認証 Cookie には必ず `HttpOnly` を付けて、JS から読めないようにします。`HttpOnly` はサーバー側でしか付けられないため、`document.cookie` で立てた時点で「JS 可視」になっています。
3. **`SameSite` / `Secure` が指定されていない**。CSRF / 中間者攻撃に対する基本防御が抜けています。

実運用では、認証 Cookie はサーバー側（Server Action や Route Handler）で次のように発行します。

```ts
// Server Action / Route Handler 内で（例）
import { cookies } from "next/headers";

(await cookies()).set("session", token, {
  httpOnly: true,        // JS から読めない
  secure: true,          // HTTPS のみ送信
  sameSite: "lax",       // 別オリジンからの送信を制限（CSRF 対策）
  maxAge: 60 * 60 * 24,  // 1 日
  path: "/",
});
```

本コースでは認証フローには深入りしないため、この演習では学習用の擬似 Cookie を使いますが、**実装するときは「JS から `document.cookie` を書く」を絶対にしない** と覚えてください。本格的な認証は別レッスン（Auth.js / NextAuth 等）で扱います。

### 期待出力

1. Cookie が何もない状態で `/todos` にアクセス → `/login` にリダイレクトされる
2. 「ログイン」ボタンを押す → `/todos` に遷移、一覧が見える
3. DevTools → Application → Cookies で `auth=1` が登録されているのが確認できる
4. Cookie を削除してから `/todos` にアクセスし直す → また `/login` に戻される

### 変える

- Cookie 名を `session` に変えて、`proxy.ts` と `login/page.tsx` の両方を追随する
- `matcher` を `["/todos/:path*", "/admin/:path*"]` に増やして、`/admin/page.tsx` を作り、そちらでもリダイレクトが効くことを確認
- `NextResponse.redirect` を `NextResponse.rewrite` に変えて挙動の違いを見る（URL が書き換わらないで表示が変わる）
- `export function proxy(...)` を `export default function(...)` に書き換えて、どちらでも動くことを確認

### 自分で書く

- 「ログアウト」ボタンを `/login` に追加し、Cookie を消す:
  ```ts
  document.cookie = "auth=; path=/; max-age=0";
  ```
- `/todos` のページヘッダーに「ログイン中」と表示し、Cookie が無いとリダイレクトされるので逆に常に「ログイン中」しか出ないことを確認

### Route Handlers との組み合わせ（発展）

これまでのレッスンで作った `/api/todos` も、proxy で認証必須にできます。

```ts
export const config = {
  matcher: ["/todos/:path*", "/api/todos/:path*"],
};
```

これで `/api/todos` を Cookie なしで叩くと `/login` にリダイレクトされるようになります。API の場合は通常 401 を返すほうが妥当なので、実務ではもう少し分岐を書きますが、本コースでは「proxy で API も守れる」ことだけ押さえます。

### Node.js ランタイムでの注意

Next.js 16 から proxy は Node.js ランタイムで動くので、`fs` / `path` / ネイティブモジュールなどの Node API が使えます。ただし **proxy は毎リクエスト前に走る** ため、重い処理（DB 接続・大きな計算）は書かないでください。ファイル I/O や外部 API 呼び出しは Server Components / Server Actions / Route Handlers に寄せるのが原則です。

## まとめ

- `proxy.ts` はルート直下に 1 ファイル、全リクエストに割り込む
- Next.js 15 までの `middleware.ts` から改名された。Next.js 16 で既定ランタイムが **Edge → Node.js** に
- `NextResponse.next` / `redirect` / `rewrite` で分岐
- `matcher` で適用パスを絞る
- Node.js の全 API が使えるようになったが、**毎リクエスト前に走る** ので軽量な前処理に留める
- 本格認証は本コース外。擬似ログインで流れだけ掴む
