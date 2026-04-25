# lesson24: オブジェクト

<script setup>
// LiveDemo の :js に渡す JS コード。
// 属性値に直接書くと Vue の HTML パーサーが JS 内の < や && を誤認するため、
// script setup の変数経由で渡している。
const demoJs = `
const user = { name: 'Alice', age: 20, isStudent: true };
console.log('name(ドット): ' + user.name);
console.log('age(ブラケット): ' + user['age']);
user.age = 21;
console.log('書き換え後の age: ' + user.age);
for (const key of Object.keys(user)) {
  console.log(key + ' = ' + user[key]);
}
`
</script>

## ゴール

- `{ key: value }` の形でオブジェクトを作れる
- ドット記法でプロパティを読み書きできる
- プロパティを追加・更新できる

## 解説

### オブジェクトとは

「名前付きの値」をいくつかまとめたものがオブジェクトです。配列が「並んだリスト」なら、オブジェクトは「ラベル付きの箱の集まり」です。

```js
const user = {
  name: "Alice",
  age: 20,
  isStudent: true,
};
```

- `{` と `}` で囲む
- 中は `キー: 値` のペアをカンマで区切る
- キーのことをプロパティ名と呼ぶ

キーは文字列（クオートは省略できる）、値は何でも入れられます（文字列・数値・真偽値・別のオブジェクト・配列など）。

### ドット記法で読み書き

プロパティを読むときも書くときも、ドット（`.`）を使います。

```js
const user = {
  name: "Alice",
  age: 20,
};

console.log(user.name); // "Alice"
console.log(user.age);  // 20

user.age = 21;          // 書き換え
console.log(user.age);  // 21

user.city = "Tokyo";    // 新しいプロパティを追加
console.log(user.city); // "Tokyo"
```

存在しないプロパティを読むと `undefined` が返ります。

```js
console.log(user.email); // undefined
```

`const` で宣言したオブジェクトでも、プロパティの追加や書き換えはできます（配列と同じ）。

### 配列の中にオブジェクトを並べる

実際のデータでよくある形です。

```js
const users = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 25 },
  { name: "Carol", age: 30 },
];

console.log(users[0].name);      // "Alice"
console.log(users[1].age);       // 25
console.log(users.length);       // 3
```

`for...of` と組み合わせると、全員の情報を順に処理できます。

```js
for (const user of users) {
  console.log(`${user.name} は ${user.age} 歳`);
}
```

この「配列にオブジェクトを並べる」形は、TODO アプリやユーザー一覧など、後のレッスンで頻繁に使います。

### デモで確認する

下のデモでは、オブジェクトをドット記法・ブラケット記法でアクセスし、値の書き換えとプロパティ一覧表示を体感できます。

<LiveDemo
  height="260px"
  :html="`<p>オブジェクトの読み書きをまとめて確認するデモ</p>`"
  :css="``"
  :js="demoJs"
/>

`Object.keys(obj)` はオブジェクトのキー名を配列で返すメソッドです。ブラケット記法 `obj[key]` と組み合わせると、全プロパティを順に処理できます。

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」を貼って揃えてください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson23</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson23: スコープとクロージャ</h1>
  </body>
</html>
```

**`script.js`**

```js
function makeCounter() {
  let count = 0;
  return function () {
    count = count + 1;
    return count;
  };
}

const counterA = makeCounter();
const counterB = makeCounter();

console.log(counterA());
console.log(counterA());
console.log(counterB());
console.log(counterA());
console.log(counterB());

function makeFilter(status) {
  return function (todo) {
    return todo.status === status;
  };
}

const todos = [
  { text: "牛乳を買う", status: "done" },
  { text: "本を読む",   status: "todo" },
  { text: "掃除する",   status: "done" },
  { text: "ゴミを出す", status: "todo" },
];

const isDone = makeFilter("done");
const isTodo = makeFilter("todo");

console.log(todos.filter(isDone));
console.log(todos.filter(isTodo));
```

</details>

### ゴール

- `user` オブジェクトを作り、ドット記法で名前と年齢を読み書きする
- 配列に複数のユーザーを並べて、`for...of` で全員分表示する

### 手順

1. `index.html` のタイトルを `lesson24` に変える
2. `script.js` を以下に書き換える

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson24</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson24: オブジェクト</h1>
  </body>
</html>
```

### `script.js`

```js
const user = {
  name: "Alice",
  age: 20,
  isStudent: true,
};

console.log(user);
console.log(user.name);
console.log(user.age);

user.age = 21;
console.log(user.age);

user.city = "Tokyo";
console.log(user.city);
console.log(user);

console.log(user.email);

const users = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 25 },
  { name: "Carol", age: 30 },
];

for (const u of users) {
  console.log(`${u.name} は ${u.age} 歳`);
}
```

### 期待出力

```
{name: "Alice", age: 20, isStudent: true}
Alice
20
21
Tokyo
{name: "Alice", age: 21, isStudent: true, city: "Tokyo"}
undefined
Alice は 20 歳
Bob は 25 歳
Carol は 30 歳
```

オブジェクト全体を `console.log` したときの表示形式はブラウザで少し異なります。

### 変える

- `user` に `hobby: "読書"` というプロパティを追加で持たせて `console.log(user.hobby)` を試す
- `user.isStudent = false;` で値を書き換えて Console に出してみる
- `users` に 4 人目 `{ name: "Dave", age: 40 }` を `push` で追加し、もう一度 `for...of` で全員出す

### 自分で書く

- `book` オブジェクト（`title` / `author` / `year`）を作り、3 つのプロパティをテンプレートリテラルで 1 行にまとめて表示する
- 本を 3 冊入れた `books` 配列を作り、`for...of` で「『タイトル』（著者, 年）」の形で全件出す

## まとめ

- オブジェクトは `{ key: value, ... }` で作る
- 読み書きはドット記法（`user.name`）
- 存在しないプロパティを読むと `undefined`
- 配列にオブジェクトを並べる形は実務でもよく使う
