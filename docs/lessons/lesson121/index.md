# lesson121: OAuth / OIDC / JWT の概念

## ゴール

- 「**認証**」と「**認可**」の違いを言える
- OAuth 2.0 の **認可コードフロー** の流れを大づかみで説明できる
- OpenID Connect（OIDC）が「OAuth に **認証** を載せた拡張」だと分かる
- JWT の構造（Header / Payload / Signature）と **署名検証** の意味を理解する
- セッション Cookie と JWT の使い分けを判断できる
- Auth0 / Clerk / NextAuth / Supabase Auth の位置付けを把握する

::: tip このレッスンの方針
認証は「自前で実装すると事故りやすい」分野です。本講座では概念の地図 + 既存 SaaS / ライブラリの選び方に絞ります。実装は SaaS のドキュメントと併せて行うのが現実的。
:::

## 解説

### 認証 と 認可

最初に区別すべき 2 つの言葉。

| 用語 | 意味 |
|---|---|
| **認証**（Authentication, AuthN） | **誰** か（あなたは本当に山田さんか？） |
| **認可**（Authorization, AuthZ） | **何ができる** か（山田さんはこのファイルを編集できるか？） |

ID + パスワードでログインするのは認証。「管理者だけ /admin にアクセス可」は認可。**OAuth は本来 認可** で、**OIDC は 認証**。混乱の元なので、地図を頭に置いておきます。

### OAuth 2.0

「**ユーザーがパスワードを渡さずに、第三者アプリに自分のリソースへのアクセスを認可** する」プロトコル。

例: 「**Spotify に Google フォトの写真を読ませる**」と言われた時、Spotify に Google パスワードを渡すのは危険。OAuth なら Google 上で認可するだけで、Spotify は **アクセストークン** を受け取って Google フォト API を叩けます。

#### 主役（Role）

| 役 | 例 |
|---|---|
| **Resource Owner** | エンドユーザー（あなた） |
| **Client** | アクセスするアプリ（Spotify） |
| **Authorization Server** | 認可するサーバー（Google） |
| **Resource Server** | API サーバー（Google フォト API） |

#### 認可コードフロー（推奨）

OAuth 2.0 で最も使われ、安全とされるフロー。**Client の種類** によって `client_secret` の扱いが変わるので、2 つに分けて図解します。

##### A. Confidential Client（サーバーアプリ / BFF）

サーバーが安全に `client_secret` を保持できる場合（Next.js の Route Handler など）。

```
[User]                         [Client(Server)]              [Auth Server]
  │   1. ログインボタン押下       │                                │
  │ ───────────────────────────> │                                │
  │                              │   2. /authorize にリダイレクト │
  │                              │ ──────────────────────────────>│
  │   3. ログイン + 認可画面     │                                │
  │ <─────────────────────────────────────────────────────────── │
  │   4. 認可                    │                                │
  │ ────────────────────────────────────────────────────────── > │
  │                              │   5. /redirect?code=XXX        │
  │                              │ <──────────────────────────────│
  │                              │   6. /token (code + client_secret) │
  │                              │ ──────────────────────────────>│
  │                              │   7. access_token 取得         │
  │                              │ <──────────────────────────────│
```

##### B. Public Client（ブラウザの SPA / ネイティブアプリ）

`client_secret` を保持できない場合。代わりに **PKCE**（後述）を必ず使います。

```
[Browser SPA]                                                   [Auth Server]
   │   1. verifier を生成、challenge を計算                        │
   │   2. /authorize?code_challenge=...                              │
   │ ────────────────────────────────────────────────────────────────> │
   │   3-4. ログイン + 認可                                          │
   │ <───────────────────────────────────────────────────────────────│
   │   5. /redirect?code=XXX                                         │
   │ <───────────────────────────────────────────────────────────────│
   │   6. /token (code + verifier) ← secret は持たない               │
   │ ────────────────────────────────────────────────────────────────> │
   │   7. access_token 取得                                          │
   │ <───────────────────────────────────────────────────────────────│
```

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

これに **署名** が付き、クライアントが **公開鍵で検証** することで「**確かに Google が発行した本物**」を確認できます。

### JWT（JSON Web Token）

JWT は「**JSON データに署名を付けたトークン**」のフォーマット。OIDC の ID Token も JWT。アクセストークンも JWT 形式で返ってくることが多い。

#### 構造: 3 つを `.` で繋ぐ

```
eyJhbGciOiJIUzI1NiI...   ← Header（base64url）
.
eyJzdWIiOiJ1c2VyLTEyMyI...   ← Payload（base64url）
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← Signature
```

Header の例:

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-1"
}
```

Payload の例:

```json
{
  "sub": "user-123",
  "name": "山田太郎",
  "iat": 1713999000,
  "exp": 1714002600
}
```

Signature は **Header + Payload を秘密鍵で署名** したもの。

#### 重要な事実

- **Payload は base64 のエンコードされているだけ** で **暗号化されていない**。誰でも読める
- **改ざんはできない**（署名検証で弾く）
- **秘密情報を Payload に入れない**（パスワード / クレジットカードなど）

### 署名アルゴリズム

| 種類 | 例 | 用途 |
|---|---|---|
| **HMAC**（共有鍵） | `HS256` | 自前で発行 + 検証する場合 |
| **RSA**（公開鍵） | `RS256` | 発行は秘密鍵、検証は公開鍵。**OIDC で標準** |
| **ECDSA**（楕円曲線） | `ES256` | RSA より短く速い |

OIDC は通常 `RS256` を使い、**JWKS**（公開鍵のセット）を `https://issuer.example.com/.well-known/jwks.json` で配布します。クライアントはこれを取得して **署名検証** します。

#### `alg: none` の罠

JWT 仕様には `alg: none`（署名なし）があり、**チェックなしの実装** だと攻撃者が任意の payload で偽造できます。**ライブラリで `alg: none` を許可しない** が必須。

### セッション Cookie vs JWT

ログイン後の状態維持で **どちらを使うか** がよく議論されます。**「保存方式」と「攻撃面」は組合せで決まる** ので、表で整理します。

| | セッション Cookie（DB セッション） | JWT |
|---|---|---|
| 保存場所 | サーバー側（DB / Redis）+ Cookie に ID | クライアント側（保存先は **Cookie / localStorage の選択** 次第） |
| 取り消し | DB から消すだけ（即時無効化） | 短命にする / Blacklist で対処（即時は難しい） |
| ステートレス性 | サーバー状態あり | サーバー状態なし |
| サイズ | 小さい（ID だけ） | 大きい（ペイロード分） |
| クロスドメイン | 工夫が必要 | 渡すだけ |

**攻撃面は保存場所で決まる**:

- **Cookie**（`HttpOnly` + `Secure` + `SameSite=Lax` か `Strict`）: XSS で **盗めない**。ただし CSRF が要対策（SameSite + CSRF トークンで防御）
- **localStorage**: XSS で **JS から盗まれる**。CSRF はそもそも該当しない（ブラウザが自動付与しない）

→ **HttpOnly Cookie に JWT を入れる** 形が現代の安全策で、Auth.js / Clerk / Lucia などの既定もこれに近い構成です。

#### 一般的な指針（2026 年）

- **Web アプリ単独**: **セッション Cookie**（HttpOnly / Secure / SameSite）が最も安全
- **マイクロサービス間 / SPA + 別ドメイン API**: JWT のアクセストークン
- **モバイル / SPA で OIDC 利用**: ID Token を JWT で取得

「**Cookie に JWT を入れる**」のもよくある折衷案（Cookie の保護 + JWT の検証性）。

### Refresh Token

アクセストークンは **短命**（15 分〜1 時間）にしておき、**Refresh Token** で更新します。

- Access Token: API 呼び出し用、漏れても被害が短時間
- Refresh Token: Access Token を更新するため、漏れると被害が長期

Refresh Token は **HttpOnly + Secure な Cookie** に保存し、`/token` 経由で交換します。

### 既存 SaaS / ライブラリの位置付け

「**自前実装は避ける**」が現代の標準。代表的選択肢:

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

- OAuth / OIDC / JWT の **トークンの中身** を実物で確認する
- NextAuth.js（Auth.js）で Google ログインを最小実装する

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
NEXTAUTH_SECRET=（任意のランダム文字列）
NEXTAUTH_URL=http://localhost:3000
```

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
export { GET, POST } from "@/auth";
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

「JWT の Payload は base64 で誰でも読める」のは **暗号化なしの JWS** の話です。学習用に中身を見たい時は、別途 `jose` ライブラリでサーバー側 token を発行 / `getToken()` で復号した値を `console.log` する、という手順が要ります。

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
- **OAuth 2.0 の認可コードフロー + PKCE** が現代の標準
- **Implicit Flow は非推奨**
- **OIDC** は OAuth に **ID Token + /userinfo** を追加した認証規格
- **JWT** は Header / Payload / Signature の 3 部構成。**Payload は誰でも読める**
- 署名アルゴリズムは `RS256` などを使い、**`alg: none` を絶対許可しない**
- セッション Cookie vs JWT: **Web 単独はセッション Cookie**、API 呼び出しは JWT が定石
- **Refresh Token** で Access Token を短命に保つ
- **Auth0 / Clerk / NextAuth / Supabase / WorkOS** など SaaS / ライブラリで自前実装を避ける
- **Passkeys** が普及中。新規プロジェクトは対応 SaaS を選ぶと未来安心
- 別のレッスンでは **WebSocket / SSE** に進み、リアルタイム通信の選択肢を広げる
