# lesson32: fetch で API から取得する

## ゴール

- `fetch` で外部 API からデータを取得できる
- `response.json()` でレスポンスを JS のデータに変換できる
- `try` / `catch` でエラーを捕まえられる
- 「`fetch` も `response.json()` も Promise を返すので **両方 `await` が必要**」を覚える

## 解説

### fetch で取得する流れ

ネット越しにデータを取得する標準の関数が `fetch` です。URL を渡すと、レスポンス（応答）を Promise で返します。

```js
async function main() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();
  console.log(data);
}

main();
```

手順を分解すると:

1. `fetch(url)` を呼ぶ → **Promise** が返る
2. `await` して完了を待つ → `response` オブジェクトが得られる
3. `response.json()` を呼ぶ → これも **Promise** が返る（ここで `await` を忘れやすい）
4. `await` して完了を待つ → 実際のデータ（配列やオブジェクト）が得られる

### `await` を 2 回書く理由

冒頭で強調したとおり、**戻り値が Promise の関数・メソッドには `await` が必要** です。`fetch` と `response.json()` はどちらも Promise を返すため、両方に `await` を付けます。

`response.json()` の `await` を書き忘れると、Promise オブジェクトがそのまま変数に入ってしまい、データのつもりで使うとおかしな挙動になります（演習で体験します）。

### JSON とは

API が返すデータは、ほとんどの場合 **JSON** というテキスト形式で送られてきます。JS のオブジェクト / 配列と見た目がそっくりなので、`response.json()` を通すと JS のオブジェクトや配列として扱えるようになります。

### エラーを捕まえる: `try` / `catch`

ネットワークの処理は「URL が間違っている」「接続できない」など失敗する可能性があります。失敗に備えて `try` / `catch` で囲みます。

```js
async function main() {
  try {
    const response = await fetch("https://example.com/this-will-fail");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log("失敗しました");
    console.log(error);
  }
}

main();
```

- `try { ... }` の中でエラーが起きると、`catch (error) { ... }` に飛ぶ
- `error` にはエラー情報が入る

`try` / `catch` は「TODO アプリを作る」の `JSON.parse` でも再利用します。

### `fetch` の落とし穴: HTTP エラーは `catch` に飛ばない

`fetch` で最初につまずきやすい点があります。**サーバーから 404 や 500 などのエラーステータスが返ってきても、`fetch` は失敗とみなさず `try` / `catch` の `catch` には飛びません**。`catch` に飛ぶのは、

- URL の形式がおかしい
- ネットワーク接続に失敗した（オフラインなど）
- DNS で名前解決に失敗した

といった **通信そのものが成立しなかった** ときだけです。HTTP の 404 / 500 は「通信は成功、ただしサーバーが『エラーです』と返してきた」状態なので、`fetch` にとっては成功扱いになります。

HTTP エラーを自分で拾いたいときは、`response.ok` という真偽値（200〜299 のときに `true`）を見て分岐します。本コースの演習では深追いしませんが、次の 1 行を覚えておくと実務で役立ちます。

```js
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}
```

これを書いておくと、4xx / 5xx のときに `throw` して `catch` に飛ばせます。

### ブラウザ側 fetch の注意（予告）

ブラウザ側で `fetch` を使うと、ローディング状態の管理や競合（複数の fetch が同時に走って結果がずれる）など、考えることが多くなります。本コースでは、こうしたブラウザ側の fetch の難しさを扱わず、Next.js のレッスン群で **「サーバー側で `fetch` する」** やり方に寄せる方針を取ります。本レッスンでは「Console に出す」までに絞ります。

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson30</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson30: 非同期処理の基本</h1>
  </body>
</html>
```

**`script.js`**

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("start");
  await wait(1000);
  console.log("1 秒経過");
  await wait(1000);
  console.log("2 秒経過");
  await wait(1000);
  console.log("3 秒経過");
  console.log("end");
}

main();

console.log("main を呼んだ後のコード");
```

</details>

### ゴール

- JSONPlaceholder（無料の練習用 API）から記事一覧を取得して Console に出す
- URL をわざと壊して `catch` の中が実行されることを確認する
- `response.json()` の `await` を外して挙動を観察する

### 手順

1. `index.html` のタイトルを `lesson32` に変える
2. `script.js` を以下に書き換える

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson32</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson32: fetch で API から取得する</h1>
    <p>DevTools の Console を確認してください。</p>
  </body>
</html>
```

### `script.js`

```js
async function main() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const posts = await response.json();
    console.log("取得件数:", posts.length);
    console.log("先頭:", posts[0]);

    for (const post of posts.slice(0, 3)) {
      console.log(`#${post.id} ${post.title}`);
    }
  } catch (error) {
    console.log("エラーが発生しました");
    console.log(error);
  }
}

main();
```

### 期待出力

Console に次のような内容が出ます（API 側の内容によって文字列は変わる場合があります）。

```
取得件数: 100
先頭: {userId: 1, id: 1, title: "sunt aut facere ...", body: "..."}
#1 sunt aut facere repellat provident occaecati excepturi optio reprehenderit
#2 qui est esse
#3 ea molestias quasi exercitationem repellat qui ipsa sit aut
```

### 変える

#### URL を壊して `catch` を動かす

`fetch` の URL の途中を適当に壊して（例: `https://jsonplaceholder.typicode.com/no-such-path-xxxxx`）、Console で「エラーが発生しました」が出ることを確認します。

> 注意: JSONPlaceholder はどのパスでも空配列や JSON を返す傾向があるので、ドメインごと壊す（`https://this-domain-does-not-exist-xxxxx.test/posts`）方が確実にエラーになります。

#### `await` を外すとどうなるか

以下のように `response.json()` の `await` を外してみます。

```js
const posts = response.json(); // await を外す
console.log(posts);
console.log(posts.length);
```

Console には `Promise { ... }` のような表示が出て、`posts.length` は `undefined` になります。これが「Promise をそのまま使ってしまった状態」です。`await` を忘れると値がおかしい、という失敗の形を体験しておきます。

### 自分で書く

- URL を `https://jsonplaceholder.typicode.com/users` に変えて、ユーザー一覧を取得し、各ユーザーの `name` と `email` を Console に出す
- 取得した `posts` の中から「`id` が 10 以下」のものだけを `filter` で抜き出して出す
- `try` / `catch` の `catch` の中で、エラーが起きたときに `console.log("読み込みに失敗しました")` と日本語メッセージも表示する

## まとめ

- `fetch(url)` と `response.json()` は **どちらも Promise を返す**。両方 `await` が必要
- `try` / `catch` で失敗に備える
- `await` を忘れると Promise オブジェクトがそのまま出てきて、後続の処理が壊れる
- ブラウザ側 fetch を state と組み合わせて使うのは罠が多いので、本コースでは Next.js のサーバー側で扱う
