# lesson124: JWT の構造とセキュリティ

## ゴール

- JWT の Header / Payload / Signature の 3 部構成を説明できる
- JWS（署名のみ）と JWE（暗号化あり）の違いを区別できる
- HS256 と RS256 の違い（共有鍵 vs 公開鍵）を説明できる
- `alg: none` 攻撃とその対策を知っている
- セッション Cookie vs JWT の比較で、それぞれの使い所を判断できる

## 解説

lesson123 で学んだ OIDC は、認証情報を **JWT（JSON Web Token）** 形式のトークンで返します。Auth.js が発行するセッション Cookie も JWT の一種です。このレッスンでは JWT の内部構造とセキュリティ上の注意点を掘り下げます。

### JWT の 3 部構成

JWT は **`.`（ドット）で区切られた 3 つのパーツ** を繋げた文字列です。

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiLlsbHnlKjlpKnpg44iLCJpYXQiOjE3MTM5OTkwMDAsImV4cCI6MTcxNDAwMjYwMH0
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

各パーツはそれぞれ **Base64url エンコード** されています（暗号化ではない）。

#### Header

トークンの種類と署名アルゴリズムを示します。

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-1"
}
```

- `alg`: 署名アルゴリズム（`RS256`、`HS256` など）
- `typ`: トークン種別（`JWT` 固定）
- `kid`: 鍵の識別子。OIDC プロバイダ側で鍵をローテーションする時に使う（Auth.js 利用者は今は気にしなくて構いません）

#### Payload

実際のデータ（クレーム）が入ります。

```json
{
  "sub": "user-123",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "iat": 1713999000,
  "exp": 1714002600
}
```

標準クレーム:

| クレーム | 意味 |
|---|---|
| `sub` | Subject（ユーザー ID） |
| `iss` | Issuer（発行者の URL） |
| `aud` | Audience（受け取り手のクライアント ID） |
| `iat` | Issued At（発行日時、Unix 秒） |
| `exp` | Expiration（有効期限、Unix 秒） |

> **Unix 秒** は 1970 年 1 月 1 日 0 時 UTC からの経過秒数。ブラウザの `new Date(1714002600 * 1000)` で人間が読める日時に変換できます（JavaScript の `Date` はミリ秒なので 1000 倍する）。

**重要**: Payload は Base64url でエンコードされているだけで、**暗号化されていません**。誰でもデコードして中身を読めます。パスワードやクレジットカード番号などの秘密情報は絶対に入れないでください。

#### Signature

Header と Payload を秘密鍵で署名したもの。

```
RSASHA256(
  base64urlEncode(header) + "." + base64urlEncode(payload),
  privateKey
)
```

受信側は公開鍵（または共有鍵）で検証し、**Header / Payload が改ざんされていないこと** を確認します。Signature を破ることなく Payload を書き換えることはできません。

### JWS と JWE の違い

JWT には大きく 2 つのバリアントがあります。

| | **JWS**（JSON Web Signature） | **JWE**（JSON Web Encryption） |
|---|---|---|
| Payload | Base64url のまま（誰でも読める） | 暗号化されている（秘密鍵がないと読めない） |
| 目的 | **改ざん検知** | **改ざん検知 + 機密保護** |
| jwt.io | デコードできる | デコードできない（暗号化されているため） |
| Auth.js の既定 | `strategy: "jwt"` を明示した場合 | **v5 の既定**（`authjs.session-token` は JWE） |

lesson123 の演習で `jwt.io` に貼ってもデコードできなかったのは、Auth.js v5 が既定で **JWE** を使っているためです。「JWT の Payload は誰でも読める」という説明は JWS の話であり、JWE は暗号化されているため jwt.io でデコードできません。

**Auth.js で JWS に切り替える**（学習・デバッグ用）:

`auth.ts` に以下を追加すると、暗号化なしの JWS セッションに切り替わります（本番環境では JWE 推奨）。

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
  session: {
    strategy: "jwt",
  },
  jwt: {
    // 暗号化を無効化（学習目的のみ。本番非推奨）
    encode: async ({ token, secret }) => {
      const { encode } = await import("next-auth/jwt");
      return encode({ token, secret, salt: "authjs.session-token" });
    },
  },
});
```

### 署名アルゴリズム: HS256 と RS256

| 種類 | `alg` 値 | 鍵の種類 | 典型的な用途 |
|---|---|---|---|
| **HMAC-SHA256** | `HS256` | **共有鍵**（同じ鍵で署名・検証） | 自前のサーバー内で発行・検証する場合 |
| **RSA-SHA256** | `RS256` | **秘密鍵**で署名 / **公開鍵**で検証 | OIDC プロバイダ（Google / GitHub など） |
| **ECDSA-SHA256** | `ES256` | 楕円曲線（RSA より短く速い） | モバイル向けや高パフォーマンス要件 |

OIDC プロバイダ（Google / Auth0 など）は `RS256` を使い、公開鍵（JWKS）を次の URL で配布します。クライアントはこれを取得して署名を検証します。

```
https://<issuer>/.well-known/jwks.json
```

**HS256 の注意点**: 署名鍵と検証鍵が同じなので、**検証側が署名も偽造できます**。マイクロサービス間でトークンを共有する場合は RS256 を選ぶのが安全です。

### `alg: none` 攻撃

JWT 仕様には `alg: none`（署名なし）という値が存在します。Header を書き換えて `alg` を `none` にし、Signature 部分を空にしたトークンを送ると、**署名検証をスキップするライブラリでは任意の Payload が通ってしまいます**。

攻撃の流れ:

```
// 正規の Header
{ "alg": "RS256", "typ": "JWT" }

// 攻撃者が書き換えた Header
{ "alg": "none", "typ": "JWT" }

// Signature を空にしたトークン
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9.
```

対策:

- **ライブラリで `alg` の許可リスト（allowlist）を設定**し、`none` を受け付けない
- `jose`・`jsonwebtoken` などの主要ライブラリは既定で `none` を拒否しているが、設定を確認する

### Refresh Token

アクセストークンは **短命**（15 分〜1 時間）にして、万が一漏れても被害を最小化します。期限切れになったら **Refresh Token** で新しいアクセストークンを取得します。

| トークン | 有効期限 | 役割 | 漏れたときのリスク |
|---|---|---|---|
| **Access Token** | 短い（15 分〜1 時間） | API 呼び出し | 短時間だけ悪用可能 |
| **Refresh Token** | 長い（数日〜数週間） | Access Token を更新 | 長期間悪用される可能性 |

Refresh Token は **HttpOnly + Secure な Cookie** に保存し、`/token` エンドポイント経由でのみ交換します。

### セッション Cookie vs JWT

ログイン後の状態維持で **どちらを使うか** がよく議論されます。先に結論を書くと、**Web アプリ単独なら Cookie ベース、API 連携なら JWT** が大まかな目安です。詳しい根拠は表の後の「攻撃面」「一般的な指針」で説明するので、今は概観として眺めてください。

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

**一般的な指針**（2026 年）:

- **Web アプリ単独**: **セッション Cookie**（HttpOnly / Secure / SameSite）が最も安全
- **マイクロサービス間 / SPA + 別ドメイン API**: JWT のアクセストークン
- **モバイル / SPA で OIDC 利用**: ID Token を JWT で取得

「**Cookie に JWT を入れる**」のもよくある折衷案（Cookie の保護 + JWT の検証性）。Auth.js / Clerk / Lucia などの既定もこれに近い構成です。

## 演習

### ゴール

- jwt.io でサンプルトークンをデコードし、3 部構成を目で確認する
- `alg: none` の危険性を理解する
- JWT の `exp`（有効期限）の意味を確認する

### 手順 1: jwt.io でトークンを確認する

[jwt.io](https://jwt.io/) を開き、左側の Encoded 欄に次のサンプルトークン（JWS）を貼ってください。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiLlsbHnlKjlpKnpg44iLCJpYXQiOjE3MTM5OTkwMDAsImV4cCI6MTcxNDAwMjYwMH0.pWe5TtmHHHQgCIGDCMiWp-1Y-8dJCDAG8CYaD-nYKNA
```

右側に Header / Payload / Signature の 3 つが表示されます。

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user-123",
  "name": "山田太郎",
  "iat": 1713999000,
  "exp": 1714002600
}
```

### 期待出力

jwt.io に JWS トークンを貼ると、Header・Payload・Signature の 3 パーツがデコードされて表示されます。`exp` の値が Unix 秒であることを確認しましょう（`1714002600` → 2024 年 4 月 25 日頃）。

### 手順 2: `alg: none` の危険性を確認する

次のトークンは `alg: none` で署名なしのトークンです（Signature 部分が空）。

```
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsIm5hbWUiOiLnrqHnkIblkqQiLCJyb2xlIjoiYWRtaW4ifQ.
```

jwt.io に貼ってデコードしてみてください。

期待出力:

- Header に `"alg": "none"` が表示される
- Payload に `"sub": "admin"` / `"role": "admin"` が表示される
- Signature 欄は空のまま
- jwt.io の表示は **Invalid Signature**（署名検証に失敗したことを示す）になるが、Payload は問題なくデコードされて読める

つまり、署名がないため Payload を自由に書き換えて送り込める状態です。受け取るライブラリが `alg` の許可リストを設定していなければ、誰でも管理者になりすませてしまいます。

### 手順 3（自分で書く）: `exp` を設定してみる

`jose` ライブラリを使って、有効期限付きの JWT を発行するコードを書きます。**Node.js を直接動かせる StackBlitz テンプレート** を新規に開いてください: <https://stackblitz.com/fork/node>

開いたら以下を実行します:

1. ターミナルで `npm install jose`
2. `index.js` を `index.ts` にリネーム（`tsx` がプリインストール済み）
3. 下のコードを貼って `npm start`

```ts
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode("my-secret-key");

// JWT を発行（有効期限 1 時間）
const token = await new SignJWT({ sub: "user-123", name: "山田太郎" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(secret);

console.log("token:", token);

// JWT を検証
const { payload } = await jwtVerify(token, secret);
console.log("payload:", payload);
// payload.exp が現在時刻 + 3600 秒になっていることを確認

// 期限切れを試す: setExpirationTime("1s") にして 2 秒後に jwtVerify を呼ぶと
// JWTExpired エラーが発生する
```

期待出力:

- `token:` の右に 3 つの Base64url パートが `.` で連結された文字列が出る
- `payload:` の右に `{ sub: "user-123", name: "山田太郎", iat: <unix秒>, exp: <unix秒> }` が出る
- `payload.exp - payload.iat` がちょうど `3600` になっている

<details>
<summary>Auth.js で session strategy を切り替えて JWS を確認する（上級）</summary>

Auth.js のセッションストア戦略を `strategy: "database"` にすると、Cookie に入るのは DB のセッション ID だけになります（DB セッション方式）。`strategy: "jwt"` にすると JWT 形式でクライアント側に保存されます。

Auth.js v5 の既定では JWT を JWE として暗号化するため、`jwt.io` でデコードできません。学習目的で JWS に切り替える場合は、`解説` セクションのコードを参照してください。

JWS に切り替えた状態でログインし、Cookie の `authjs.session-token` の値を jwt.io に貼ると、Header / Payload / Signature が表示されます。Payload にはユーザー名やメールアドレスが含まれているはずです（秘密情報は入っていないことを確認）。

</details>

## まとめ

- **JWT は Header / Payload / Signature の 3 部構成**。`.` で連結した Base64url 文字列
- **Payload は暗号化されていない**（JWS の場合）。誰でも読めるため秘密情報を入れてはいけない
- **JWS**: 署名のみ。jwt.io でデコード可能。**JWE**: 暗号化あり。jwt.io でデコード不可。Auth.js v5 の既定は JWE
- 署名アルゴリズム: **HS256**（共有鍵）は自前発行・検証向け、**RS256**（公開鍵）は OIDC の標準
- **`alg: none` を絶対許可しない**。ライブラリの許可リスト設定を確認する
- **Refresh Token** でアクセストークンを短命に保ち、漏れ時の被害を最小化する
- **Web 単独はセッション Cookie**、API 呼び出しや OIDC では JWT が定石
