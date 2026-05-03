# lesson92: ブラウザと HTTP の基本

## ゴール

- Web ページが表示されるまでにブラウザとサーバーのあいだで何が起きているか、おおまかに説明できる
- HTTP のリクエスト / レスポンスがそれぞれ「何行か文字列が連なったもの」であることを理解する
- HTTP メソッド（GET / POST / PUT / PATCH / DELETE）の違いを 1 行で言える
- ステータスコードの番台（2xx / 3xx / 4xx / 5xx）を使い分けの文脈で説明できる
- 主要なリクエスト / レスポンスヘッダの役割を数個挙げられる

## 解説

### ブラウザがページを表示するまでの流れ

アドレスバーに `https://example.com/` と入れて Enter を押したとき、ざっくり次の流れで動いています。

1. DNS でホスト名（`example.com`）を IP アドレスに解決する
2. その IP アドレスの **サーバーに TCP 接続 + TLS**（https なら） を張る
3. `GET / HTTP/1.1` 的な **リクエスト** を送る
4. サーバーから **レスポンス**（HTML 文字列）が返る
5. HTML を読みながら、中に書かれている `<link>` / `<script>` / `<img>` の URL を **追加でリクエスト** する（CSS / JS / 画像）
6. それらをすべて受け取って、ブラウザが DOM・CSSOM・レイアウト計算 → 画面に描画

本レッスンでは、このうち **3-5 の「HTTP 通信の中身」** を見ていきます。「DOM を操作する」で扱った DOM は 6 の段階（ブラウザの内部表現）の話でした。

### HTTP は「文字列のやり取り」

HTTP は意外と素朴なプロトコルで、**人間が読める文字列** を TCP の上で送り合っているだけです。

例えばクライアント（ブラウザ）がサーバーに送るリクエストは、次のような形をしています。

```
GET /articles/42 HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (...)
Accept: text/html
Accept-Language: ja,en
Cookie: session=abc123

```

1 行目: **リクエストライン**。`HTTP メソッド パス HTTP バージョン` の 3 つ。2 行目以降: **ヘッダ**。キー: 値。空行が 1 つ入ったあと、必要ならリクエストボディが続きます（GET では普通は付けません）。

それに対してサーバーからのレスポンスは次のような形です。

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1234
Cache-Control: public, max-age=3600
Set-Cookie: session=abc123; HttpOnly

<!doctype html>
<html>
...
</html>
```

1 行目: **ステータスライン**。`HTTP バージョン ステータスコード 理由フレーズ`。2 行目以降: **ヘッダ**。空行の後に **ボディ**（HTML / JSON / 画像バイナリなど）。

この 2 つのかたまりがブラウザとサーバーのあいだを **1 往復する** のが HTTP 通信の基本単位です。HTTPS の場合も、TLS で暗号化されるだけで中身の形は同じです。

### HTTP メソッドの 5 つ

大きく 5 つ覚えておけば、ほぼ現代のアプリは読めます。

| メソッド | 用途 | 冪等性 | 安全性 | ボディ |
|---|---|---|---|---|
| **`GET`** | 取得 | あり | あり | 基本なし |
| **`POST`** | 作成・任意の操作 | なし | なし | あり |
| **`PUT`** | 全体置換 | あり | なし | あり |
| **`PATCH`** | 部分更新（特定フィールドだけ書き換え） | なし | なし | あり |
| **`DELETE`** | 削除 | あり | なし | 基本なし |

他にも `HEAD`（ヘッダだけ取得）/ `OPTIONS`（CORS の事前問い合わせ）がありますが、ブラウザが自動で送るものなのでアプリ側で書く機会は少ないです。

**冪等性**（idempotent）とは「同じリクエストを何回送っても結果が同じ」という性質です。ネットワーク不良で再送されても結果が変わらない `GET` / `PUT` / `DELETE` と、再送で二重登録になる恐れがある `POST` は別物として扱われます。`PATCH` も仕様上「冪等である保証はない」とされており（MDN の HTTP メソッド表でも `POST` と並んで Idempotent: No）、`POST` と同じく「再送で結果が変わりうる」側として扱うのが安全です。実装次第で冪等にすることもできますが、原則は **冪等ではない** と覚えます。

**安全性**（safe）とは「リクエストがサーバーの状態を変えない」という性質です（RFC 9110 の定義）。`GET` / `HEAD` / `OPTIONS` / `TRACE` が安全で、他はサーバー側のデータを変更します。冪等かどうかは「何回送っても結果が同じか」、安全かどうかは「そもそも状態を変えるか」の話なので、別の軸として理解しておくと API を読む時に役立ちます。

### ステータスコードの 4 つの番台

先頭 1 桁でグループを表します。

| 番台 | 意味 | 代表例 |
|---|---|---|
| **2xx 成功** | リクエストは正常に処理された | `200 OK` / `201 Created` / `204 No Content` |
| **3xx リダイレクト / キャッシュ** | 別の URL へ / ブラウザのキャッシュを使って | `301 Moved Permanently` / `302 Found` / `304 Not Modified` |
| **4xx クライアントエラー** | 送り方が悪い | `400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found` / `429 Too Many Requests` |
| **5xx サーバーエラー** | サーバー側の問題 | `500 Internal Server Error` / `502 Bad Gateway` / `503 Service Unavailable` |

細かい違いの覚え方:

- `401` は「認証が要る / 認証情報が間違っている」
- `403` は「認証は通ったが権限がない」
- `404` は「リソースがない」
- `429 Too Many Requests` は「短時間に呼びすぎ」。API のレート制限に引っかかった時に返る。レスポンスヘッダの `Retry-After` で「何秒後に再試行してよいか」が示されることがある
- `500` は「サーバー側が想定外で落ちた」
- `502 Bad Gateway` は、リバースプロキシやロードバランサが上流サーバーから不正な応答を受け取った時に返す
- `503 Service Unavailable` は「一時的にサービス利用不可」。アプリ自身（メンテナンスモード / 過負荷）が返すこともあれば、ロードバランサが上流に到達できない時にも返される

### 主要なヘッダ

全部は覚えなくて良いですが、以下は DevTools の Network タブでも頻出します。

**リクエストヘッダ（クライアント → サーバー）:**

| ヘッダ | 意味 |
|---|---|
| `Host` | どのホストに向けたリクエストか |
| `User-Agent` | ブラウザの種類・バージョン |
| `Accept` | 受け取れる Content-Type |
| `Accept-Language` | 希望言語（`ja,en` など） |
| `Authorization` | 認証情報（`Bearer xxxx` など） |
| `Cookie` | サーバーから受け取った Cookie |
| `Referer` | どのページから来たか（綴り間違い通りに定義されている） |

**レスポンスヘッダ（サーバー → クライアント）:**

| ヘッダ | 意味 |
|---|---|
| `Content-Type` | ボディの種類（`text/html` / `application/json` 等） |
| `Content-Length` | ボディのバイト数 |
| `Cache-Control` | キャッシュ制御（次の「HTTP キャッシュ」で詳解） |
| `ETag` | リソースのバージョン識別子（キャッシュ用） |
| `Location` | リダイレクト先（3xx と一緒に使う） |
| `Set-Cookie` | Cookie を発行 |

### DevTools の Network タブで見る

ここまでの話は、ブラウザの DevTools を使うと **実際にやり取りされているリクエスト / レスポンスの生の姿** として観察できます。

Chrome の場合: F12（または `Cmd+Opt+I`）→ Network タブ → ページをリロード → 一覧から 1 行クリックすると、Headers / Payload / Preview / Response / Timing の各パネルで詳細が見られます。

この「目で見て学ぶ」のが最も早いので、本レッスンの演習は主にここで手を動かします。

## 演習

### ゴール

- 任意のページを開いて DevTools の Network タブで通信を観察する
- 1 つのリクエスト / レスポンスを選び、ヘッダ・ステータス・メソッドを読み取れる
- `curl` でも同じ内容が取れることを手元で確認する（任意）

### 手順

1. 手元のブラウザで `https://jsonplaceholder.typicode.com/posts/1` を開きます（ブラウザが JSON をそのまま表示します）
2. DevTools（F12）→ Network タブを開いた状態で、ページをリロードします
3. 一番上に `posts/1` のような行が出ます。これをクリックします
4. 右側に開くパネルで以下を確認します。

### 観察するポイント

**Headers タブ:**

- General: Request URL / Request Method（`GET`）/ Status Code（`200 OK`）
- Response Headers: `content-type: application/json; charset=utf-8` / `cache-control: ...`
- Request Headers: `Host` / `User-Agent` / `Accept` / `Accept-Language`

**Response タブ（または Preview タブ）:**

- レスポンスボディの JSON（`{ "userId": 1, "id": 1, "title": "...", ... }`）

**Timing タブ:**

- DNS Lookup / Initial connection / TLS / Waiting (TTFB) / Content Download の各段階にかかった時間

### 任意課題: `curl` で同じことを体験する

ターミナルから `curl` を叩くと、ブラウザ抜きで同じ通信を確認できます。

```bash
curl -i https://jsonplaceholder.typicode.com/posts/1
```

`-i` オプションでレスポンスヘッダも表示します。出力の先頭に `HTTP/2 200` のようなステータスライン、空行の後に JSON ボディが続くのが見えます。

送信側を見たいときは `-v`（詳細）を使います。

```bash
curl -v https://jsonplaceholder.typicode.com/posts/1
```

`>` で始まる行がリクエスト、`<` で始まる行がレスポンスです。最初の `> GET /posts/1 HTTP/2` と `> host: jsonplaceholder.typicode.com` を見比べると、本文で説明したリクエストの形と一致していることが分かります。

### 期待出力

- `curl -i https://jsonplaceholder.typicode.com/posts/1` を実行すると、先頭に `HTTP/2 200` などのステータス行が出る
- レスポンスヘッダーに `content-type: application/json` が含まれる
- ボディに JSON 文字列が表示される

### 変える

- URL を `https://jsonplaceholder.typicode.com/does-not-exist` に変えて、ブラウザのアドレスバーで開く。Network タブで Status Code が **`404`** になっていることを確認
- `https://httpstat.us/500` を開く。Status Code が **`500`** になる（HTTP のテスト用サービス。明示的に各ステータスを返す）
- `https://httpstat.us/301` を開く。リダイレクト先があって、ブラウザが自動で追従する様子を Network タブで確認

### 自分で書く

- DevTools の Network タブで、最近よく見るサイト（自分のポートフォリオ・ブログ等）を開き、**1 つの HTML ページを開くときにいくつのリクエストが発生しているか** を数えてみる
- その中で、Status が `304 Not Modified` になっているものを探す。これはブラウザキャッシュが効いたレスポンス

## まとめ

- HTTP はリクエスト / レスポンスという文字列の塊を 1 往復やり取りする素朴なプロトコル
- リクエストは「メソッド + パス + ヘッダ + ボディ（任意）」の形
- レスポンスは「ステータス + ヘッダ + ボディ」の形
- メソッドは `GET` / `POST` / `PUT` / `PATCH` / `DELETE` の 5 つを基本に、冪等性・安全性を意識して使う
- ステータスコードは 2xx / 3xx / 4xx / 5xx で大分類。細かい違い（401 vs 403 など）は都度覚える
- ヘッダには `Host` / `User-Agent` / `Accept` / `Content-Type` / `Cache-Control` / `Set-Cookie` などがあり、DevTools の Network タブで実物を観察できる
