# lesson83: デバッグに効く Console API

<script setup>
const demoJs = `
const users = [
  { id: 1, name: 'Alice', age: 28, role: 'admin' },
  { id: 2, name: 'Bob', age: 34, role: 'user' },
  { id: 3, name: 'Carol', age: 22, role: 'user' },
];

document.querySelector('#btn-log').addEventListener('click', () => {
  console.log('log: 普通の出力', users[0]);
});

document.querySelector('#btn-warn').addEventListener('click', () => {
  console.warn('warn: 注意喚起。まだ動くが気にしてほしいこと');
});

document.querySelector('#btn-error').addEventListener('click', () => {
  console.error('error: 何か壊れた。スタックトレースも一緒に出る');
});

document.querySelector('#btn-table').addEventListener('click', () => {
  console.table(users);
});

document.querySelector('#btn-group').addEventListener('click', () => {
  console.group('リクエスト処理');
  console.log('ユーザー認証');
  console.log('データ取得');
  console.groupEnd();
});

document.querySelector('#btn-time').addEventListener('click', () => {
  console.time('sort');
  const arr = Array.from({ length: 100000 }, () => Math.random());
  arr.sort();
  console.timeEnd('sort');
});

document.querySelector('#btn-count').addEventListener('click', () => {
  console.count('ボタン押下回数');
});

document.querySelector('#btn-assert').addEventListener('click', () => {
  const total = 100;
  console.assert(total > 200, 'total が 200 を超えていない', { total });
});
`
</script>

## ゴール

- `console.log` 以外の `warn` / `error` で深刻度を出し分けられる
- `console.table` で配列やオブジェクトを表形式で眺められる
- `console.group` / `groupEnd` で出力を階層化できる
- `console.time` / `timeEnd` で処理時間を測れる
- `console.count` / `assert` で回数や条件付き警告を出せる
- DevTools の Console タブで、深刻度別のフィルタと検索ができる

## 解説

### `console.log` 以外があることを知る

`console.log` はよく使いますが、Console API にはもっと多くの仲間があります。適切なものを使うと **DevTools が自動的に見た目を区別してくれる**（色付け、スタックトレース、フィルタ）ので、デバッグの効率が段違いに上がります。

### 深刻度で使い分ける: `log` / `info` / `warn` / `error`

出力の「重み」を変えるだけの書き分けです。引数の渡し方は `log` と全部同じです。

```js
console.log("普通のログ");                 // 灰色や黒
console.info("参考情報");                  // i アイコン（`log` と同等扱いのブラウザも多い）
console.warn("削除されたプロパティを使っています"); // 黄色、三角アイコン
console.error("API 呼び出しに失敗しました");  // 赤、スタックトレース付き
```

DevTools の Console タブ上部で **「Errors / Warnings / Info / Verbose」** のチェックを切り替えると、深刻度別に絞り込めます。本番や長時間実行で「エラーだけ見たい」場面でとても役立ちます。

### 表形式で眺める: `console.table`

配列やオブジェクトを **表** にしてくれます。ログに `JSON.stringify` を書かずとも、キーごとに列が揃った形で読めるようになります。

```js
const users = [
  { id: 1, name: "Alice", age: 28 },
  { id: 2, name: "Bob", age: 34 },
];

console.table(users);
// id | name  | age
// ---+-------+----
//  1 | Alice | 28
//  2 | Bob   | 34
```

第 2 引数に列名の配列を渡すと、その列だけ表示できます。

```js
console.table(users, ["name", "age"]);
```

API レスポンスや大量の state を眺めるときの定番です。

### 出力を階層化する: `console.group` / `console.groupEnd`

ログを入れ子にしてまとめられます。DevTools 上では折りたためるブロックになります。

```js
console.group("リクエスト処理");
console.log("1. ユーザー認証");
console.log("2. データ取得");
console.group("データ変換");
console.log("2-1. JSON パース");
console.log("2-2. 整形");
console.groupEnd();
console.groupEnd();
```

一気に折りたたんで他のログから隠せるので、フロントエンドの画面更新のような「関連する複数ステップ」の追跡に向きます。最初から折りたたみたい場合は `console.groupCollapsed()` を使います。

### 処理時間を測る: `console.time` / `console.timeEnd`

同じラベルで `time` を呼び `timeEnd` を呼ぶと、その間の経過時間を出します。

```js
console.time("fetch-posts");
const posts = await fetch("/api/posts").then((r) => r.json());
console.timeEnd("fetch-posts"); // fetch-posts: 312ms
```

`console.timeLog("fetch-posts")` で **途中経過** を出すこともできます。長い処理を区切って計測したいときに便利です。

### 回数を数える: `console.count`

同じラベルで呼ぶたびにカウンタが上がります。「ここを何回通ったか」をざっくり知るのに便利です。

```js
function render() {
  console.count("render 呼び出し");
  // ...
}

render(); // render 呼び出し: 1
render(); // render 呼び出し: 2
render(); // render 呼び出し: 3
```

リセットしたい場合は `console.countReset("render 呼び出し")`。

### 条件付きで警告する: `console.assert`

第 1 引数が **偽のとき** だけ出力する関数です。「ここは常に真のはず」という前提を軽くチェックしたいときに使います。

```js
const total = 100;
console.assert(total > 0, "total が 0 以下", { total });
// total > 0 が真なので何も出ない

console.assert(total > 200, "total が 200 を超えていない", { total });
// 200 より小さいので Assertion failed の警告が出る
```

エラーで止めたいわけではない（通してもアプリは壊れない）が、**本来ありえない状態** を検知したい場合の軽いガードに使います。本格的なチェックには `throw new Error(...)` を使ってください。

### スタックトレースを出す: `console.trace`

その行までの呼び出し階層を出します。「どこから呼ばれた？」を追いたいときに。

```js
function inner() {
  console.trace("ここを通った");
}

function middle() {
  inner();
}

middle();
```

### スタイル付き出力: `%c`

第 1 引数の文字列に `%c` を入れ、第 2 引数以降に CSS を渡すと色付きのログになります。ライブラリが Console にロゴを出すのに使っているのを見たことがあるかもしれません。

```js
console.log("%cデバッグモード", "color: white; background: steelblue; padding: 2px 6px; border-radius: 3px;");
```

多用するとノイズになるので、「今だけ強調したい」1 行で使うくらいが丁度いいです。

### デモで触ってみる

下のデモで、各ボタンを押すごとに対応する Console API が呼ばれます。DevTools の Console タブを開いた状態でボタンを押してみてください。

<LiveDemo
  height="220px"
  :html="`
<p>DevTools の Console タブを開き、各ボタンを押してください。</p>
<div>
  <button id='btn-log' type='button'>log</button>
  <button id='btn-warn' type='button'>warn</button>
  <button id='btn-error' type='button'>error</button>
  <button id='btn-table' type='button'>table</button>
  <button id='btn-group' type='button'>group</button>
  <button id='btn-time' type='button'>time / timeEnd</button>
  <button id='btn-count' type='button'>count</button>
  <button id='btn-assert' type='button'>assert</button>
</div>
  `"
  :css="`
button { margin: 4px 6px 4px 0; padding: 6px 12px; }
  `"
  :js="demoJs"
/>

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
    <title>lesson83</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>Console API 体験</h1>
    <p>DevTools の Console タブを開いてリロードしてください。</p>
  </body>
</html>
```

**`script.js`**

```js
// 空のまま
```

</details>

### ゴール

- Console タブに、`log` / `warn` / `error` / `table` / `group` / `time` がすべて出ている
- 深刻度別フィルタ（Errors / Warnings / Info）でメッセージが絞り込めることを確認する

### 手順

1. `script.js` を以下の内容にします。
2. プレビューの DevTools の Console タブを開き、リロードします。
3. 出力をフィルタで絞り込みながら眺めます。

### `script.js` の完成形

```js
console.log("起動しました");
console.info("Vite テンプレートで動いています");

console.group("環境情報");
console.log("URL:", location.href);
console.log("言語:", navigator.language);
console.log("ユーザーエージェント:", navigator.userAgent);
console.groupEnd();

console.warn("この warn は目立ちますが、アプリは動いています");
console.error("この error は赤く出ます。試しに出しているだけです");

const users = [
  { id: 1, name: "Alice", role: "admin" },
  { id: 2, name: "Bob", role: "user" },
  { id: 3, name: "Carol", role: "user" },
];
console.table(users);

console.time("重い処理");
const arr = [];
for (let i = 0; i < 100000; i++) {
  arr.push(Math.random());
}
arr.sort();
console.timeEnd("重い処理");

function render() {
  console.count("render 呼び出し");
}
render();
render();
render();

const total = 100;
console.assert(total > 200, "total は 200 を超えているはず", { total });

console.log(
  "%c完了",
  "color: white; background: steelblue; padding: 2px 8px; border-radius: 3px;",
);
```

### 期待出力

- Console に `起動しました` から順に表示される
- `環境情報` のグループが折りたためる状態で出る（左の ▶ で開閉）
- `warn` は黄色系、`error` は赤系で、アイコンが違う
- `users` が表形式で出る
- `重い処理: 〜ms` の経過時間が出る
- `render 呼び出し` のカウンタが 1 → 2 → 3 と増える
- `Assertion failed: total は 200 を超えているはず` が警告として出る
- 最後に `完了` が青背景の塊で出る

### 変える

- Console タブの上部で「Errors」だけチェックし、`error` 以外が消えることを確認
- `console.table(users)` を `console.table(users, ["name", "role"])` に変えて列を絞る
- `console.group(...)` を `console.groupCollapsed(...)` に変え、最初から折りたたまれて表示されることを確認
- `console.time("重い処理")` と `console.timeEnd("重い処理")` のあいだに `console.timeLog("重い処理", "途中経過")` を挟んでみる

### 自分で書く

- `fetch` で JSONPlaceholder（`https://jsonplaceholder.typicode.com/posts`）から記事一覧を取り、`console.table` で `id` / `title` の 2 列だけ表示する。ヒント: `fetch` は 2 章 の「fetch で API から取得する」で扱った形
- 「重い処理」を `console.time` で 2 段階（`取得` / `整形`）に分割計測する

## まとめ

- `console.log` / `info` / `warn` / `error` で深刻度を分ける（DevTools のフィルタに効く）
- `console.table` で配列やオブジェクトを表形式に
- `console.group` / `groupEnd`（`groupCollapsed`）で出力を折りたためる階層に
- `console.time` / `timeEnd` / `timeLog` で経過時間を測る
- `console.count` / `countReset` で呼び出し回数を数える
- `console.assert(条件, メッセージ)` は条件が偽の時だけ出る軽いガード
- `console.trace` でスタックトレース、`%c` + CSS で装飾
- 2 章（JavaScript）はここで一区切り。本コースの残りの章（TypeScript / React / Next.js）でも、今回の API は日常的に使います
