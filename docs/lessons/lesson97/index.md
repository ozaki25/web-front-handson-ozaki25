# lesson96: Cookie と Web セキュリティ

## ゴール

- Cookie と Web Storage の違いと使い分けを説明できる
- Cookie の属性（`HttpOnly` / `Secure` / `SameSite` / `Domain` / `Path` / `Expires` / `Max-Age`）の役割を説明できる
- XSS（Cross-Site Scripting）と CSRF（Cross-Site Request Forgery）の概要と、それぞれに効く防御を挙げられる
- セッション Cookie を安全に扱うための実務パターン（HttpOnly / Secure / SameSite=Lax）を知る
- Content-Security-Policy や HTTPS の位置づけを大まかに把握する

## 解説

### Cookie とは何か（もう一度）

Cookie は「サーバーがブラウザに値を持たせて、次回以降のリクエストに **自動で付けさせる** 仕組み」です。サーバーからのレスポンスに次のヘッダが付いていると、ブラウザは **`user=alice`** を覚え、同じサイトへの次のリクエストに自動で `Cookie: user=alice` を付けます。

```
# サーバーからのレスポンス
HTTP/1.1 200 OK
Set-Cookie: user=alice; Path=/; HttpOnly; Secure; SameSite=Lax

# 以後、ブラウザが自動で付ける
GET /profile HTTP/1.1
Cookie: user=alice
```

この「自動で送る」性質が、認証セッションを維持する用途に向いています。一方で同じ性質が **後述の CSRF 攻撃の温床** にもなります。

> **`user=alice` は仕組み説明用の架空値**: 上の例では分かりやすさのために `user=alice` という平文を入れていますが、**実例では Cookie に主体識別子を直接入れません**。代わりに、サーバーが発行した **不可逆なセッション ID**（例: `session=abc123xyz...`）を入れて、サーバー側でその ID から「これは alice さんのセッション」と引き当てる形が一般的です。本文の以降の例 (`session=abc123` など) はこの実運用の形を想定しています。

### Cookie と Web Storage の使い分け（再掲）

| 用途 | Cookie | Web Storage |
|---|---|---|
| ログインセッションの維持 | **最適**（サーバーに自動送信される） | 不向き |
| ユーザー設定（テーマ / 言語） | 可能だが毎リクエストで送信されるのでムダ | **最適** |
| 容量 | 4KB 程度（小さい） | 5〜10MB |
| JS からの読み書き | `document.cookie`（`HttpOnly` ならブラウザで JS からは見えない） | `localStorage.setItem` 等 |
| 有効期限 | 属性で制御 | localStorage は恒久、session は タブ閉じで消える |

認証は Cookie、クライアント完結の設定は Web Storage、というのが現代の定番です。

### Cookie の主要属性

`Set-Cookie` に付けられる属性で、Cookie の振る舞いを細かく制御します。どれもセキュリティに直結します。

#### `HttpOnly`

**JS から読み書きできない** Cookie にします。`document.cookie` で見ようとしても出てきません。

```
Set-Cookie: session=abc123; HttpOnly
```

XSS（後述）でページに悪意ある JS が混入しても、`HttpOnly` 付きのセッション Cookie は盗めません。ログインセッション用の Cookie は **原則 `HttpOnly` を付ける** のが現代の正解です。

#### `Secure`

**HTTPS 経由のリクエストにしか送らせない** 属性です。平文 HTTP で運ばれて盗聴される事故を防ぎます。

```
Set-Cookie: session=abc123; Secure
```

本番はほぼ HTTPS のみになった現在では、**セッション Cookie には常に `Secure`** を付けます。

#### `SameSite`

**クロスサイトのリクエストで Cookie を送るか** を制御する属性です。CSRF 攻撃への主要な防御です。

| 値 | 動作 |
|---|---|
| `Strict` | 他サイトからの遷移では一切送らない（ログインが切れる UX になりがち） |
| `Lax` | トップレベル GET ナビゲーション（リンククリック等）では送る。フォーム POST や iframe では送らない |
| `None` | すべて送る。**`Secure` 必須** |

現代のブラウザの **デフォルトは `Lax`** です。クロスサイトで明示的に送りたい場合のみ `None; Secure` を付けます。通常のセッション Cookie は `Lax` のままで十分な場合が多いです。

#### `Domain` / `Path`

どのホスト・どのパスに対して Cookie を送るかの指定です。指定しなければ **発行元のホストとパス以下** になります。

- `Domain=example.com`: サブドメイン（`api.example.com` 等）にも送る
- `Path=/admin`: `/admin` 以下のパスにだけ送る

広く付けすぎるとセキュリティ事故の原因になるので、**必要最小限** に絞るのが原則です。

#### `Expires` / `Max-Age`

有効期限の指定です。

- `Expires=Wed, 21 Oct 2026 07:28:00 GMT`: 指定日時まで
- `Max-Age=3600`: 3600 秒後まで（現代では推奨）

どちらも付けなかった Cookie は **セッション Cookie**（ブラウザを閉じると消える）になります。

### 典型的な「ログインセッション Cookie」の形

実務で多く見る典型パターンです。

```
Set-Cookie: session=abc123xyz; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

読み解き:

- `Path=/`: サイト全体で有効
- `HttpOnly`: JS から見えない（XSS 対策）
- `Secure`: HTTPS のみ
- `SameSite=Lax`: 基本的なクロスサイトリクエストでは送らない（CSRF 対策）
- `Max-Age=86400`: 24 時間有効

この組み合わせを **デフォルトの出発点** と覚えてください。

### XSS（Cross-Site Scripting）

悪意ある JS を **自分のサイトの一部として** 動かされる攻撃です。

代表的な入り口:

1. ユーザー入力をそのまま `innerHTML` で出力（「DOM を操作する」の `innerHTML` 節で扱った）
2. `<script src="ユーザー入力">` のように属性にも入力が流れ込む
3. URL のクエリから取った値を HTML にそのまま埋め込む

成功すると、`document.cookie` / `localStorage` の中身を攻撃者のサーバーに送信されたり、ユーザーになりすまして投稿されたりします。

#### 防御の基本

- **出力をエスケープする**: `textContent` を使う、React / Vue のテンプレートを信じる（彼らが自動でエスケープする）
- **`innerHTML` には自分で書いた安全な文字列だけ**: ユーザー入力は決して入れない
- **`HttpOnly` Cookie**: セッション Cookie を JS から見えなくする（攻撃が成功しても Cookie だけは守れる）
- **Content-Security-Policy（CSP）ヘッダ**: `<script>` の実行元を制限する（後述）

React / Next.js は `{variable}` で値を埋め込む限り、自動的にテキストとして扱ってくれます。生の HTML を埋め込みたいときの `dangerouslySetInnerHTML` が「**危険**」という名前なのは、まさにこの XSS を警告するためです。

### CSRF（Cross-Site Request Forgery）

ログインしているユーザーに **意図しないリクエスト** を送らせる攻撃です。仕組み:

1. 攻撃者が罠サイトを用意する
2. ログイン中の標的ユーザーに罠サイトを踏ませる
3. 罠サイトの HTML から銀行 API へのリクエストを自動発火させる。GET なら `https://bank.example.com/transfer?to=attacker&amount=10000`、POST なら `<form action="https://bank.example.com/transfer" method="POST">` の自動送信が典型例
4. ブラウザは `bank.example.com` のセッション Cookie を **自動で付けて** リクエストする
5. 銀行サーバーから見ると、正規ユーザーの認証済みリクエストに見える

#### 防御

- **`SameSite=Lax` / `Strict`**: クロスサイトの POST で Cookie を送らせない。現代のブラウザのデフォルトが `Lax` なので、大半の単純な CSRF は既にブロック済み
- **CSRF トークン**: フォーム送信のたびにサーバーから一意のトークンを渡し、リクエスト時に一緒に送らせる。攻撃者の罠サイトはトークンを知らないので送れない
- **重要操作の再認証**: パスワード変更や送金では、現行セッションでも再度パスワードを入れさせる

現代のフレームワーク（Next.js の Server Actions など）は CSRF トークン処理を内蔵していることが多いため、自分で手書きする機会は減っています。仕組みは知っておく価値があります。

### HTTPS と HSTS

HTTPS は **通信を暗号化** する基本です。HTTPS でない（平文 HTTP）通信は途中経路で改ざん・盗聴される可能性があります。

**HSTS**（HTTP Strict Transport Security） ヘッダを付けると、ブラウザに「今後はこのサイトは必ず HTTPS で来い」と覚えさせられます。初回のみ平文アクセスが発生しうる隙を塞ぎます。

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Vercel / Netlify などはデフォルトで HTTPS のみでの配信になっています。本コースの教材サイトもすべて HTTPS です。

> **`includeSubDomains` の罠**: 一度配信すると、ブラウザはこのドメインの **全サブドメインも HTTPS 必須** として `max-age` の期間（上の例では 1 年）覚え続けます。社内ツールなど一部サブドメインに HTTPS が無いと、その期間アクセスできなくなります。`max-age=0` を返しても **既に保存済みのブラウザを巻き戻せません**。本番投入は `max-age` を短めから始めて段階的に伸ばすのが安全です。

### `SameSite=None; Secure`（クロスサイト Cookie の現代的形）

外部サイトからの埋め込み（iframe / クロスオリジン fetch with credentials）で Cookie を送りたい場合は、`SameSite=None` を明示する必要があります。**さらに `Secure` の併記が必須**（Chrome / Safari / Firefox の現行仕様）です。

```
Set-Cookie: session=abc; Path=/; HttpOnly; Secure; SameSite=None
```

`SameSite=None` 単独や、HTTPS でない通信での `SameSite=None` は **ブラウザが拒否します**。サードパーティ Cookie 廃止の流れも進んでいるため、可能なら `SameSite=Lax` で済ませる設計を選ぶのが現代の標準です。

### Content-Security-Policy（CSP）

レスポンスヘッダで **「このページで実行してよい JS の出所」** を制限する仕組みです。XSS の最後の砦として効きます。

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

この例では、`<script>` は自サイトと指定した CDN 以外からは一切読ませない、という宣言です。インラインスクリプトや `eval` も既定では禁止されます。

強力ですが設定を間違えると自分のサイトが動かなくなるので、導入は慎重に（まずは `Content-Security-Policy-Report-Only` で違反だけログに流し、問題がないと確認してから本番適用するのが定番）。

### オリジンと CORS（軽く）

**オリジン** は `スキーム + ホスト + ポート` の 3 つ組で、ブラウザのセキュリティ境界の基本単位です。`https://a.example.com` と `https://b.example.com` は別オリジンです。

ブラウザは既定で **別オリジンへの `fetch` が返すレスポンスを JS から読めなくする** 同一オリジンポリシーを採用しています。別オリジンの API を使いたい場合、サーバー側が `Access-Control-Allow-Origin` 等の CORS ヘッダで明示的に許可する必要があります。

CORS は実務で詰まりやすい分野です。本コースでは深入りせず、「オリジンが違うと fetch 結果が読めないことがある / サーバー側で CORS ヘッダを返してもらう必要がある」という認識だけ押さえてください。

## 演習

### ゴール

- 本サイトおよび任意のサイトの Cookie 属性を DevTools Application タブで眺める
- `HttpOnly` / `Secure` / `SameSite` がどう出ているか確認する
- XSS / CSRF のイメージを自分の言葉で説明できるようにする

### 手順 1: Cookie を観察する

1. Google や GitHub などログイン済みのサイトを開きます
2. DevTools → Application タブ → Cookies → そのサイトを選択します
3. 一覧の `Name` / `Value` / `HttpOnly` / `Secure` / `SameSite` / `Expires` 列を眺めます
4. セッション系の Cookie には `HttpOnly` と `Secure` がチェックされているはずです

### 手順 2: `document.cookie` で JS からの可視性を確認する

DevTools の Console タブで次を実行します。

```js
document.cookie
```

出力には **`HttpOnly` が付いていない Cookie だけ** が出ます。セッション系の重要な Cookie が出てこないのは、`HttpOnly` 属性が働いているためです。

試しに適当なサイト（攻撃を想定したメモ）で、もしセッション Cookie が JS から見えてしまっていた場合は、そのサイトは XSS 耐性が弱い可能性があります。

### 手順 3: 自分の言葉でまとめる

次の質問に、本レッスンを閉じた状態で自分の言葉で答えてみます（目安: それぞれ 2-3 文）。

- Q1: XSS と CSRF のそれぞれが「何を悪用する」攻撃か
- Q2: 典型的なログインセッション Cookie には、どの属性を付けるか（3 つ挙げよ）
- Q3: `SameSite=Lax` は CSRF にどう効くか

### 期待出力

- DevTools Application タブ → Cookies で、設定した Cookie のキーと値が確認できる
- `HttpOnly` を付けた Cookie は `document.cookie` で読めないことを Console で確認できる
- HTTPS でないと `Secure` 属性の Cookie がセットされないことが分かる

### 変える

- **観察対象は本コースの教材サイト / 自分のローカルプロジェクト / StackBlitz プレビュー** などにとどめます。他人のサイトで Cookie 操作を試す行為は、利用規約や攻撃の境界が曖昧になりやすいので避けます。
- 自分が動かしている開発環境で、Application タブから Cookie を 1 つ選び、右クリック → Delete で削除する。再度アクセスしてもページが見られることを確認
- 自分が管理するアカウントの開発環境で、セッション Cookie を削除するとログアウトになることを確認（本番アカウントではなく開発用で）

### 自分で書く

- 自分がよく使うサイト 3 つの、ログイン後に Application タブの Cookies で確認できる **`HttpOnly` の付き方** を比較する
- Next.js の Server Actions で POST を送る際、ブラウザ開発者ツールの Network タブから CSRF 関連ヘッダがどう付いているか観察する（将来の発展）

## まとめ

- Cookie はサーバーが発行してブラウザが **自動で付けて送る** 値。セッション維持の本命
- 属性の黄金律: `HttpOnly; Secure; SameSite=Lax`。セッション Cookie はこれを最低ラインに
- XSS は「サイトに悪意 JS を混入される」攻撃。`textContent` / エスケープ / `HttpOnly` / CSP で防ぐ
- CSRF は「ログイン中のユーザーに意図しないリクエストを送らせる」攻撃。`SameSite` / CSRF トークンで防ぐ
- HTTPS + HSTS は前提。平文 HTTP は現代の Web ではほぼ使わない
