# lesson23: 関数

<script setup>
const demoJs = `
function add(a, b) {
  return a + b;
}

console.log('add(1, 2) =', add(1, 2));
console.log('add(10, 20) =', add(10, 20));
console.log('add(-5, 5) =', add(-5, 5));
`
</script>

## ゴール

- `function` 宣言で関数を定義できる
- アロー関数でも関数を定義できる
- 引数と戻り値（`return`）を使える

## 解説

### 関数とは

「決まった処理をまとめて名前をつけたもの」が関数です。同じ処理を何度も書く代わりに、関数を 1 つ作っておけば、名前を呼ぶだけで再利用できます。

### `function` 宣言

一番シンプルな書き方です。

```js
function greet(name) {
  console.log(`こんにちは、${name} さん`);
}

greet("Alice");
greet("Bob");
```

- `function 関数名(引数) { ... }` で定義
- `関数名(値)` で呼び出す
- 引数は「関数に渡す値」、関数の中では受け取った名前（`name`）で使う

### `return` で値を返す

関数は「処理をする」だけでなく「結果を返す」こともできます。

```js
function add(a, b) {
  return a + b;
}

const result = add(1, 2);
console.log(result); // 3
```

- `return 値` で呼び出し元に結果を返す
- `const result = add(1, 2)` のように、戻り値を変数に受け取れる

`return` を書かない関数は `undefined` を返します。`console.log` だけしている関数は `undefined` を返すことになります。

下のデモで、関数を複数回呼び出すと同じ処理が毎回動き、結果だけが引数に応じて変わるのを確認できます。

<LiveDemo
  height="180px"
  :html="`<p>関数を複数回呼び出します。</p>`"
  :css="``"
  :js="demoJs"
/>

### アロー関数

もう 1 つの書き方がアロー関数です。「繰り返し処理」の `forEach` で一度出てきました。

```js
const add = (a, b) => {
  return a + b;
};

console.log(add(1, 2)); // 3
```

- `(引数) => { ... }` の形
- 変数に入れて使う（`const 関数名 = (引数) => { ... }`）

波かっこの中で「計算 → 即 return」だけしたいときは、波かっこと `return` を省略できます。

```js
const add = (a, b) => a + b;
console.log(add(1, 2)); // 3
```

本コースでは、まず **両方の書き方を読める** ことを目指します。書き分けは後から慣れで身につきます。

### どちらを使う？

どちらでも動きます。近年のコードはアロー関数が多いですが、`function` 宣言も十分使われます。本コースでは混ぜて使うので、どちらも読めるようにしておきます。

### 宣言の場所と参照可能なタイミング

`function` 宣言とアロー関数（`const` で受ける）には、**ファイル内で「どこから呼べるか」が違う** という細かい差があります。

```js
// function 宣言は、宣言より前でも呼べる（巻き上げ）
sayHi();
function sayHi() {
  console.log("Hi");
}

// アロー関数は、宣言より前で呼ぶとエラー
greet();           // ReferenceError: Cannot access 'greet' before initialization
const greet = () => console.log("Hello");
```

`function` 宣言は **コードの読み込み時にトップに巻き上げられる**（hoisting と呼びます）ので、ファイルのどこに書いても動きます。一方、アロー関数を `const` / `let` で受けた場合は **`const` の規則に従う** ので、宣言より前では参照できません。

実用上は **「使う前に書く」を守れば気にする必要はない** 話ですが、他人のコードで「下のほうにある関数を上のほうから呼んでいる」場面を見たら、これは `function` 宣言だな、と分かります。

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
    <title>サンプル</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>繰り返し処理</h1>
  </body>
</html>
```

**`script.js`**

```js
const todos = ["牛乳を買う", "本を読む", "ジョギング"];

console.log("--- for...of ---");
for (const todo of todos) {
  console.log(todo);
}

console.log("--- forEach ---");
todos.forEach((todo) => {
  console.log(todo);
});

console.log("--- 合計 ---");
const numbers = [1, 2, 3, 4, 5];
let total = 0;
for (const n of numbers) {
  total = total + n;
}
console.log(total);
```

</details>

### ゴール

- 2 つの数を合計する関数を `function` 宣言とアロー関数の両方で書く
- 関数に挨拶文を作ってもらう

### 手順

1. `script.js` を以下に書き換える

### `script.js`

```js
function add(a, b) {
  return a + b;
}

const addArrow = (a, b) => {
  return a + b;
};

const addShort = (a, b) => a + b;

console.log(add(1, 2));
console.log(addArrow(10, 20));
console.log(addShort(100, 200));

function greet(name) {
  return `こんにちは、${name} さん`;
}

const message = greet("Alice");
console.log(message);
console.log(greet("Bob"));

function introduce(name, age) {
  return `${name}（${age} 歳）です`;
}

console.log(introduce("Carol", 30));
```

### 期待出力

```
3
30
300
こんにちは、Alice さん
こんにちは、Bob さん
Carol（30 歳）です
```

### 変える

- `add` の中身を `a - b` に変える → Console の 1 行目が `-1` になる
- `greet` を、挨拶の文言も引数で受け取るように変える（第 2 引数 `word` を追加して、「おはよう」「こんばんは」などを渡せるようにする）
- `introduce` で `return` を書き忘れるとどうなるか確認する（`console.log` で `undefined` が表示される）

### 自分で書く

- 3 つの数を合計する関数 `sum3(a, b, c)` を書く
- 1 つの数を受け取って「偶数」または「奇数」を返す関数 `evenOrOdd(n)` を書く（ヒント: `n % 2 === 0` で偶数判定）
- 名前と点数を受け取り、点数が 60 以上なら「○○ さんは合格」、そうでなければ「○○ さんは不合格」を返す関数 `judge(name, score)` を書く

## まとめ

- 書き方は 2 種類: `function 関数名(...) { ... }` とアロー関数 `(...) => { ... }`
- `return` で値を返し、呼び出し元で `const 変数 = 関数(...)` で受け取れる
- 引数は複数渡せる
