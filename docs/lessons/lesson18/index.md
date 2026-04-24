# lesson18: 配列を扱う

<script setup>
// LiveDemo の :js に渡す JS コード。
// 属性値に直接書くと Vue の HTML パーサーが JS 内の < や && を誤認するため、
// script setup の変数経由で渡している。
const demoJs = `
const fruits = ['apple', 'banana'];
fruits.push('cherry');
console.log(fruits);
console.log('length: ' + fruits.length);
console.log('先頭: ' + fruits[0]);
for (const f of fruits) {
  console.log('- ' + f);
}
`
</script>

## ゴール

- 配列を作り、中の要素を取り出せる
- `length` で要素数を確認できる
- `push` / `pop` で末尾に追加・削除できる

## 解説

### 配列とは

同じ種類のデータを複数まとめたものが配列です。「やることリスト」「買い物リスト」のように「並んでいるもの」に使います。

```js
const fruits = ["apple", "banana", "cherry"];
```

- `[` と `]` で囲む
- 要素と要素はカンマで区切る
- 中身は文字列でも数値でも何でも入れられる

### インデックスで取り出す

配列の中の要素には、先頭から `0`, `1`, `2`, ... と番号が振られています。これをインデックスと呼びます。

```js
const fruits = ["apple", "banana", "cherry"];
console.log(fruits[0]); // "apple"
console.log(fruits[1]); // "banana"
console.log(fruits[2]); // "cherry"
```

0 から始まる点に注意します。`fruits[1]` は「2 番目」ではなく「インデックス 1 の要素（=先頭から 2 つ目）」です。

存在しないインデックスを指定すると `undefined` が返ります。

```js
console.log(fruits[5]); // undefined
```

### `length` で要素数を知る

```js
const fruits = ["apple", "banana", "cherry"];
console.log(fruits.length); // 3
```

末尾の要素は `fruits[fruits.length - 1]` で取れます（インデックスは 0 始まりなので `-1`）。

### 追加と削除

- `push(値)`: 末尾に追加する
- `pop()`: 末尾を取り除く（取り除いた値を返す）

```js
const fruits = ["apple", "banana"];
fruits.push("cherry");
console.log(fruits); // ["apple", "banana", "cherry"]

const removed = fruits.pop();
console.log(removed); // "cherry"
console.log(fruits);  // ["apple", "banana"]
```

`const` で宣言した配列に対しても `push` や `pop` は使えます。`const` は「変数に入っている配列そのものを別のものに差し替えない」という約束で、配列の中身の操作はできます。

### デモで確認する

下のデモでは、配列に `push` で要素を足し、`length` とインデックスアクセス、`for...of` でのループ表示を一気に体感できます。

<LiveDemo
  height="260px"
  :html="`<p>配列の基本操作をまとめて確認するデモ</p>`"
  :css="``"
  :js="demoJs"
/>

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
    <title>lesson17</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson17: 条件で分岐する</h1>
  </body>
</html>
```

**`script.js`**

```js
const age = 20;
const userName = "Alice";
const isStudent = true;

if (age >= 20) {
  console.log(`${userName} さんは成人です`);
} else {
  console.log(`${userName} さんは未成年です`);
}

if (age >= 13 && age <= 19) {
  console.log("10 代です");
} else if (age >= 20 && age < 60) {
  console.log("大人です");
} else {
  console.log("それ以外の年代です");
}

if (isStudent && age >= 20) {
  console.log("成人の学生です");
}

if (!isStudent) {
  console.log("学生ではありません");
} else {
  console.log("学生です");
}
```

</details>

### ゴール

- 「やることリスト」の配列を作り、要素を足したり取り出したりしてコンソールに表示する

### 手順

1. `index.html` のタイトルを `lesson18` に変える
2. `script.js` を以下に書き換える
3. Console を確認する

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson18</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson18: 配列を扱う</h1>
  </body>
</html>
```

### `script.js`

```js
const todos = ["牛乳を買う", "本を読む", "ジョギング"];

console.log(todos);
console.log(todos.length);
console.log(todos[0]);
console.log(todos[todos.length - 1]);

todos.push("部屋を片付ける");
console.log(todos);
console.log(todos.length);

const last = todos.pop();
console.log(last);
console.log(todos);

console.log(todos[99]);
```

### 期待出力

```
["牛乳を買う", "本を読む", "ジョギング"]
3
牛乳を買う
ジョギング
["牛乳を買う", "本を読む", "ジョギング", "部屋を片付ける"]
4
部屋を片付ける
["牛乳を買う", "本を読む", "ジョギング"]
undefined
```

配列の表示形式はブラウザによって少し変わりますが、要素の並びは同じです。

### 変える

- `todos` の初期値に 5 つ要素を入れる → `length` が `5` になることを確認
- `todos.push(...)` を 2 回連続で呼んで、末尾に 2 つ追加する
- `todos.pop()` を 3 回呼んで、3 つ取り除く（配列が空になる）
- 空の配列 `[]` に `pop` を呼ぶと何が返るか確認する（`undefined`）

### 自分で書く

- 好きな食べ物 3 つを配列 `foods` に入れて、それぞれをインデックスで取り出して `console.log` する
- `foods` の末尾に 2 つ追加し、末尾から 1 つ取り除いてから、最終的な `foods` を `console.log` する

## まとめ

- 配列は `[値1, 値2, ...]` で作る
- インデックスは 0 から始まる
- 要素数は `length`、末尾追加は `push`、末尾削除は `pop`
- 存在しないインデックスを読むと `undefined` が返る
