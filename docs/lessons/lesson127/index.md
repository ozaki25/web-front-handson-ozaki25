# lesson127: OAuth / OIDC の概念

## ゴール

- 「**認証**」と「**認可**」の違いを言える
- OAuth 2.0 の **登場人物（Role）** を説明できる
- OpenID Connect（OIDC）が「OAuth に **認証** を載せた拡張」だと分かる
- Auth.js / NextAuth.js・Firebase Auth などの選択肢を把握している

::: tip このレッスンの方針
認証は「自前で実装すると事故りやすい」分野です。本講座では概念の地図 + 既存 SaaS / ライブラリの選び方に絞ります。実装は SaaS のドキュメントと併せて行うのが現実的です。
:::

## 解説

### 認証 と 認可

最初に区別すべき言葉が 2 つあります。

| 用語 | 意味 |
|---|---|
| **認証**（Authentication, AuthN） | **誰** か（あなたは本当に山田さんか？） |
| **認可**（Authorization, AuthZ） | **何ができる** か（山田さんはこのファイルを編集できるか？） |

ID + パスワードでログインするのが認証で、「管理者だけ /admin にアクセス可」が認可です。**OAuth は本来 認可** で、**OIDC は 認証** を扱うため、混乱しないよう地図を頭に置いておきます。

### OAuth 2.0

「**ユーザーがパスワードを渡さずに、第三者アプリに自分のリソースへのアクセスを認可** する」プロトコル。

例: 「**Spotify に Google フォトの写真を読ませる**」と言われた時、Spotify に Google パスワードを渡すのは危険。OAuth なら Google 上で認可するだけで、Spotify は **アクセストークン** を受け取って Google フォト API を叩けます。

#### 登場する役割（Role）

Auth.js を使う実装では、この 4 役を理解しておくと「どこで何が起きているか」が掴みやすくなります。

| 役 | 例 |
|---|---|
| **Resource Owner** | エンドユーザー（あなた） |
| **Client** | アクセスするアプリ（Spotify） |
| **Authorization Server** | 認可するサーバー（Google） |
| **Resource Server** | API サーバー（Google フォト API） |

<details>
<summary>OAuth / OIDC の内部フロー（深掘り）</summary>

#### 認可コードフロー（推奨）

OAuth 2.0 で最も使われ、安全とされるフロー。**Client の種類** によって `client_secret` の扱いが変わるので、2 つに分けて図解します。

##### A. Confidential Client（サーバーアプリ / BFF）

サーバーが安全に `client_secret` を保持できる場合（Next.js の Route Handler など）。

<img src="/diagrams/oauth-confidential-flow.svg" alt="Confidential Client の認可コードフロー: ユーザーがログインボタンを押すと Client がAuthorizationServerに/authorizeリダイレクト、ユーザーが認可すると認可コードが返り、ClientはそのコードとclientSecretで/tokenを叩きaccessTokenを取得する" class="diagram" />

##### B. Public Client（ブラウザの SPA / ネイティブアプリ）

`client_secret` を保持できない場合。代わりに **PKCE**（後述）を必ず使います。

<img src="/diagrams/oauth-pkce-flow.svg" alt="PKCE を使った Public Client の認可コードフロー: SPA が verifier と challenge を生成し code_challenge 付きで/authorizeを呼ぶ、認可コードを受け取ったら verifier と一緒に/tokenを叩く。client_secret は不要" class="diagram" />

ポイント:

- **認可コード**（短命）→ アクセストークンに **サーバー側で交換**（A） / **PKCE で偽装防止**（B）
- ブラウザに **直接トークン** を渡さない（漏洩リスクが下がる）
- 現代の Web では **Auth.js / Clerk / Auth0 がこれを内部で組み立てる**

#### Implicit Flow は非推奨

ブラウザに直接トークンを返す **Implicit Flow** は古いやり方。**現代は使わない**。SPA であっても **Authorization Code Flow with PKCE** が推奨。

#### PKCE（Proof Key for Code Exchange）

「**認可コードが盗まれてもトークンに交換できない**」を実現する仕組み。

1. クライアントが **ランダムな verifier** を生成
2. その **ハッシュ**（challenge） を `/authorize` に渡す
3. 認可コードを **/token に送る時に verifier を一緒に送る**
4. 認可サーバーが challenge と一致するかを検証

ネイティブアプリ / SPA で必須。Auth0 / Clerk などの SaaS は自動でやってくれます。

</details>

### OpenID Connect（OIDC）

OAuth 2.0 は **認可** のフレームワーク。**「誰がログインしたか」** を扱う仕組みが標準化されていなかった。OIDC は OAuth 2.0 の上に **認証情報の規格** を載せたものです。

OIDC は次を追加:

- **`openid` スコープ**: OIDC を有効化
- **ID Token**: 「**この人がログインした**」を表す JWT
- **`/userinfo` エンドポイント**: ユーザープロフィール取得

#### ID Token の中身

```json
{
  "iss": "https://accounts.google.com",   // 発行者
  "sub": "user-123",                        // ユーザー ID
  "aud": "my-client-id",                    // クライアント ID
  "exp": 1714000000,                        // 有効期限
  "iat": 1713999000,                        // 発行時刻
  "email": "user@example.com",
  "name": "山田太郎"
}
```

これに **署名** が付き、クライアントが **公開鍵で検証** することで「**確かに Google が発行した本物**」を確認できます。ID Token のフォーマットが **JWT** で、その構造とセキュリティは「JWT の構造とセキュリティ」のレッスンで詳しく扱います。

### 既存 SaaS / ライブラリの位置付け

「**自前実装は避ける**」が現代の標準になっています。代表的な選択肢を挙げます。

| サービス / ライブラリ | 特徴 |
|---|---|
| **Auth0** | エンタープライズ標準。フロー / IdP 連携 / カスタムが豊富 |
| **Clerk** | React / Next.js 専用、UI コンポーネントが秀逸。スタートアップで人気 |
| **NextAuth.js**（Auth.js） | Next.js 用 OSS。OAuth プロバイダ多数、自前で動かせる |
| **Supabase Auth** | DB + 認証セット。Postgres ベース |
| **Firebase Authentication** | Google エコシステム。設定が簡単 |
| **AWS Cognito** | AWS 系インフラと統合 |
| **WorkOS** | エンタープライズ向け SAML / SSO |
| **Lucia / better-auth** | より軽量、自前で書きたい時の OSS |

選び方:

- **すぐ使いたい**: Clerk / Supabase
- **エンタープライズ要件**（SAML / SCIM）: Auth0 / WorkOS
- **OSS / ホストせず手元で**: NextAuth / better-auth
- **既存インフラに揃える**: Cognito / Firebase

### Passkeys（パスワードレス）

2024 年以降、Apple / Google / Microsoft が **Passkeys**（FIDO2 / WebAuthn）の普及を進めています。**パスワードを使わず、デバイスの生体認証で OIDC ログイン** できる仕組み。

```html
<!-- 簡略 -->
<script>
const cred = await navigator.credentials.get({ publicKey: {/* ... */} });
</script>
```

主要 SaaS（Clerk / Auth0 / NextAuth）はすでに **Passkey を 1 オプション** として提供。新規プロジェクトは **Passkey 対応の SaaS** を選ぶと将来安心。

### よくある事故

- **JWT の検証を skip** していて偽造を許す → **必ず署名検証**
- **localStorage にトークン** を入れて XSS で持ち出される → **HttpOnly Cookie** に
- **Refresh Token が無期限** → 短命 + ローテートを徹底
- **CORS で `Allow-Origin: *` + `Allow-Credentials: true`** → 仕様違反、CORS エラー
- **redirect_uri が緩い**（`*` 許可）→ open redirect で攻撃可能
- **state パラメータを検証していない** → CSRF 成立

これらが起きやすいので、**SaaS の SDK** に従うのが安全です。

## 演習

### ゴール

- NextAuth.js（Auth.js）で Google ログインを最小実装する
- Auth.js が発行するセッション Cookie（JWE）を DevTools で確認する

### 手順 1: 新規 Next.js

```bash
npx create-next-app@latest auth-sample --ts --app
cd auth-sample
npm install next-auth
```

### 手順 2: Google OAuth クライアント作成

[Google Cloud Console](https://console.cloud.google.com/) で:

1. プロジェクトを作成
2. APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Client ID と Secret を控える

### 手順 3: NextAuth の設定

`.env.local`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=（任意のランダム文字列）
```

> **補足: 環境変数名は v5 で `AUTH_*` に変わった**: Auth.js v5（旧 NextAuth.js）では `NEXTAUTH_SECRET` / `NEXTAUTH_URL` が **`AUTH_SECRET` / `AUTH_URL` にエイリアス（v4 名はそのままも動く）**されました。v5 で本番に必須なのは `AUTH_SECRET` だけで、`AUTH_URL` は **多くの環境で不要**（リクエストヘッダから自動検出されます。リバースプロキシ越し等で誤検出する場合に明示するくらい）です。`AUTH_SECRET` は `npx auth secret` でランダム生成できます。

`auth.ts`:

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});
```

`app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

`app/page.tsx`:

```tsx
import { signIn, signOut, auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <main style={{ padding: 24 }}>
        <form action={async () => { "use server"; await signIn("google"); }}>
          <button>Google でログイン</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <p>ようこそ {session.user?.name} さん</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <form action={async () => { "use server"; await signOut(); }}>
        <button>ログアウト</button>
      </form>
    </main>
  );
}
```

### 手順 4: 起動

```bash
npm run dev
```

`http://localhost:3000` で Google ログインを試します。

### 手順 5: セッション Cookie を覗く

ブラウザの DevTools → Application → Cookies で **`authjs.session-token`** を確認。Auth.js v5 の既定では **JWE（暗号化 JWT）** で発行されるため、[jwt.io](https://jwt.io/) に貼っても **デコードできません**（暗号化されている）。これは「Cookie が盗まれても中身を読めない」セキュリティ目的です。

JWT の構造（JWS と JWE の違い・署名アルゴリズム）は「JWT の構造とセキュリティ」のレッスンで詳しく扱います。

### 期待出力

- Google ログインが成立し、セッション情報が表示される
- Cookie に **`authjs.session-token`**（JWE）が入っている
- jwt.io で **デコードできず警告** が出る（暗号化されているため正常）

### 変える

- `Email` プロバイダ（マジックリンク）を追加
- 複数プロバイダ（GitHub / Discord）を追加
- ログイン後にしかアクセスできないルートを **Middleware で保護** する

### 自分で書く（任意）

- Clerk に置き換えて UI コンポーネントの体験を比較
- Supabase Auth を試して DB / 認証統合の体験
- Passkey 対応プロバイダ（WebAuthn）を有効にしてパスワードなしログイン

## まとめ

- **認証**（誰か） と **認可**（何ができるか） を区別する。OAuth は認可、OIDC は認証
- **OAuth 2.0 の認可コードフロー + PKCE** が現代の標準（Auth.js 等が内部で処理）
- **OIDC** は OAuth に **ID Token + /userinfo** を追加した認証規格
- **Auth0 / Clerk / NextAuth / Supabase / WorkOS** など SaaS / ライブラリで自前実装を避ける
- **Passkeys** が普及中。新規プロジェクトは対応 SaaS を選ぶと未来安心
- JWT の構造とセキュリティは「JWT の構造とセキュリティ」のレッスンで扱います
