# lesson21: スコープとクロージャ

## ゴール

- `let` / `const` のブロックスコープと関数スコープを区別できる
- 「関数の中で作った変数」は外から触れないことを理解する
- クロージャ（関数が「作られた場所の変数」を覚えているしくみ）を体感する
- `makeCounter()` のように、関数を呼ぶたびに独立した状態を持たせられる

## 解説

### スコープとは

**変数が有効な範囲** のことを **スコープ** と呼びます。変数は「どこで宣言したか」によって、見える範囲が決まります。

スコープを知らないと、「なぜこの変数が `undefined` なのか」「なぜ外から触れないのか」がわからず、デバッグで迷子になりやすくなります。

### ブロックスコープ（`let` / `const`）

`{` と `}` で囲まれた部分を **ブロック** と呼びます。`let` と `const` で宣言した変数は、そのブロックの中でしか使えません。

```js
if (true) {
  const message = "こんにちは";
  console.log(message); // "こんにちは"
}

console.log(message); // ReferenceError: message is not defined
```

- ブロックの中で宣言した変数は、ブロックの外からは見えない
- `for` ループの `{` と `}` も同じ

```js
for (let i = 0; i < 3; i++) {
  console.log(i); // 0, 1, 2
}

console.log(i); // ReferenceError: i is not defined
```

ループが終わった後、`i` はもう存在しません。

### 関数スコープ

関数の中で宣言した変数も、関数の外からは見えません。

```js
function greet() {
  const message = "こんにちは";
  console.log(message);
}

greet(); // "こんにちは"
console.log(message); // ReferenceError: message is not defined
```

関数の中は「独立した部屋」と思ってください。中で作った変数は、その部屋を出たら使えません。

### レキシカルスコープ（書かれた場所で決まる）

JavaScript のスコープは **「書かれた場所」** で決まります。呼び出された場所ではありません。これを **レキシカルスコープ** と呼びます。

```js
const name = "外側";

function outer() {
  const name = "内側";
  inner();
}

function inner() {
  console.log(name); // "外側"
}

outer();
```

`inner` は `outer` から呼ばれていますが、**`inner` が書かれた場所** から見える `name` は外側の `"外側"` です。そのため `"外側"` が出力されます。

### クロージャ

関数は、自分の外側のスコープにある変数を **覚えています**。関数を「外に持ち出しても」その変数を使い続けられます。このしくみを **クロージャ** と呼びます。

```js
function makeCounter() {
  let count = 0;
  return function () {
    count = count + 1;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

`makeCounter` を呼ぶと、中に作られた `count` と、それを使う関数（戻り値）が一緒に「閉じ込められて」返ってきます。外から `count` に直接触ることはできませんが、返ってきた関数を呼ぶたびに `count` が 1 増えます。

#### 独立したカウンタが複数作れる

`makeCounter()` を 2 回呼ぶと、それぞれが **別の `count`** を持ちます。

```js
const counterA = makeCounter();
const counterB = makeCounter();

console.log(counterA()); // 1
console.log(counterA()); // 2
console.log(counterB()); // 1 （counterA とは独立）
console.log(counterA()); // 3
console.log(counterB()); // 2
```

`counterA` と `counterB` は、それぞれ自分専用の `count` を抱えています。これが「関数が状態を閉じ込める」しくみです。

#### 関数を作って返す（`makeFilter`）

同じパターンで、**設定を覚えた関数** を作ることもできます。lesson24 の `filter` と組み合わせる例を見てみます。

```js
function makeFilter(status) {
  return function (todo) {
    return todo.status === status;
  };
}

const isDone = makeFilter("done");
const isTodo = makeFilter("todo");

const todos = [
  { text: "牛乳を買う", status: "done" },
  { text: "本を読む",   status: "todo" },
  { text: "掃除する",   status: "done" },
];

console.log(todos.filter(isDone));
// [{ text: "牛乳を買う", status: "done" }, { text: "掃除する", status: "done" }]

console.log(todos.filter(isTodo));
// [{ text: "本を読む", status: "todo" }]
```

`makeFilter("done")` で返ってきた関数は、**`status` が `"done"` だったこと** を覚えています。この関数を `filter` に渡すと、`status === "done"` の要素だけが残ります。

「呼び出し時の引数を覚えた新しい関数を作る」のは、クロージャのとても実用的な使い方です。

### `var` との違い（軽く対比のみ）

古いコードでは `var` を見かけます。`var` はブロックスコープではなく **関数スコープ** で、宣言前に使ってもエラーにならず `undefined` になる（**巻き上げ**）という挙動があります。

```js
console.log(a); // undefined （エラーにならない）
var a = 1;

if (true) {
  var b = 2;
}
console.log(b); // 2 （ブロックの外でも見える）
```

本コースでは `let` / `const` だけを使います。`var` は「そういう古い書き方がある」とだけ覚えておけば十分です。

## 演習

### ゴール

- `makeCounter()` で独立したカウンタ `counterA` / `counterB` を作る
- `makeFilter(status)` で「状態ごとのフィルタ関数」を作り、`filter` に渡す

### 手順

1. `index.html` のタイトルを `lesson21` に変える
2. `script.js` を以下に書き換える

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson21</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson21: スコープとクロージャ</h1>
  </body>
</html>
```

### `script.js`

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

console.log(counterA()); // 1
console.log(counterA()); // 2
console.log(counterB()); // 1
console.log(counterA()); // 3
console.log(counterB()); // 2

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

### 期待出力

```
1
2
1
3
2
[{text: "牛乳を買う", status: "done"}, {text: "掃除する", status: "done"}]
[{text: "本を読む", status: "todo"}, {text: "ゴミを出す", status: "todo"}]
```

- `counterA` と `counterB` の出力が独立している（`counterB` を呼んでも `counterA` の値には影響しない）
- `isDone` / `isTodo` を `filter` に渡すと、それぞれの状態の TODO だけが抽出される

### 変える

- `makeCounter` の `count = 0` を `count = 10` に変える → `counterA()` の初回が `11` から始まる
- `makeCounter` の中の `count = count + 1` を `count = count + 2` にする → 2 ずつ増える
- `makeFilter("todo")` を `makeFilter("done")` に書き換えて、結果が変わることを確認する

### 自分で書く

- `makeAdder(n)` を作る。`makeAdder(5)` を呼ぶと「引数に 5 を足す関数」が返ってくる。`add5(10)` が `15` を返せば OK（ヒント: 戻り値の関数の中で外側の `n` を使う）
- `makeGreeter(word)` を作る。`makeGreeter("こんにちは")` を呼ぶと「`(name) => `${word}、${name} さん`` のような関数」が返ってくる。`greetJa("Alice")` で `"こんにちは、Alice さん"` が返れば OK
- `makeCounter` を改造して、呼ぶと `{ increment, reset, value }` の 3 つの関数を持つオブジェクトを返すようにする（余力があれば）

## まとめ

- 変数には **スコープ**（有効な範囲）がある
- `let` / `const` は **ブロックスコープ**、関数の中の変数は **関数スコープ**
- JavaScript は **レキシカルスコープ**: 変数の見える範囲は「書かれた場所」で決まる
- **クロージャ** は「関数が自分の外側の変数を覚えているしくみ」
- `makeCounter()` のように、関数を呼ぶたびに **独立した状態** を閉じ込めた関数を返せる
- `makeFilter(status)` のように、**引数を覚えた関数** を作って他のメソッドに渡せる
- 本コースでは `let` / `const` だけを使う。`var` の古い挙動は覚えなくてよい
- **ここで体感した「関数が状態を閉じ込める」しくみは、章 4 lesson55 のカスタムフックで再登場します**。`useTodos()` のような関数が内部の state を閉じ込めて、呼び出し側に必要な操作だけを返す、という形で、`makeCounter` / `makeFilter` と同じ発想を React の文脈で使います
