# lesson26: 配列の変換

<script setup>
const demoJs = `
const users = [
  { name: 'Alice', age: 20 },
  { name: 'Bob',   age: 15 },
  { name: 'Carol', age: 30 },
];

const names  = users.map((u) => u.name);
const adults = users.filter((u) => u.age >= 20);
const first  = users.find((u) => u.age >= 20);

console.log('map   (名前だけ):', names);
console.log('filter(成人だけ):', adults);
console.log('find  (最初の成人):', first);
console.log('元の配列は変わらない:', users);
`
</script>

## ゴール

- `map` で配列の各要素を変換した新しい配列を作れる
- `filter` で条件に合う要素だけを残した新しい配列を作れる
- いずれも元の配列を変えない（新しい配列を返す）ことを理解する

## 解説

### 「全部変換する」`map`

`map` は配列の各要素に関数を適用して、結果を並べた **新しい配列** を返します。

```js
const numbers = [1, 2, 3, 4];
const doubled = numbers.map((n) => n * 2);

console.log(doubled); // [2, 4, 6, 8]
console.log(numbers); // [1, 2, 3, 4] （元は変わらない）
```

- `配列.map((要素) => 新しい値)`
- 戻り値は **同じ長さの新しい配列**
- 元の配列は変わらない

オブジェクトの配列でもよく使います。

```js
const users = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 25 },
];

const names = users.map((user) => user.name);
console.log(names); // ["Alice", "Bob"]
```

### 「条件で絞り込む」`filter`

`filter` は条件を満たす要素だけを残した **新しい配列** を返します。

```js
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter((n) => n % 2 === 0);

console.log(evens);   // [2, 4]
console.log(numbers); // [1, 2, 3, 4, 5]
```

- `配列.filter((要素) => 条件)`
- 条件が `true` の要素だけが残る
- 戻り値は **同じかそれより短い新しい配列**
- 元の配列は変わらない

オブジェクトの配列で絞り込む例。

```js
const users = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 15 },
  { name: "Carol", age: 30 },
];

const adults = users.filter((user) => user.age >= 20);
console.log(adults);
// [{ name: "Alice", age: 20 }, { name: "Carol", age: 30 }]
```

下のデモで、同じ配列に対して `map` / `filter` / `find` がそれぞれどんな結果を返すかを並べて比較できます。元の配列は変わらない点にも注目してください。

<LiveDemo
  height="260px"
  :html="`<p>同じ配列に対する map / filter / find の結果:</p>`"
  :css="``"
  :js="demoJs"
/>

### `for...of` との違い

「繰り返し処理」の `for...of` でも同じことは書けます。ただ、`map` / `filter` を使うと：

- 「変換 / 絞り込み」という **意図が名前で伝わる**
- 結果が新しい配列で返るので、元の配列を壊さない
- 1 行で書けて短い

特に「新しい配列を作って返す」点が重要です。後の章（React）で大量に使います。

### 「1 件だけ取り出す」`find`

`filter` と似ていますが、**条件を満たす最初の 1 件だけ** を返すのが `find` です。

```js
const users = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 15 },
  { name: "Carol", age: 30 },
];

const found = users.find((user) => user.age >= 20);
console.log(found); // { name: "Alice", age: 20 }

const missing = users.find((user) => user.age >= 100);
console.log(missing); // undefined
```

- `配列.find((要素) => 条件)`
- 戻り値は **1 件の要素**（配列ではない）
- 該当がなければ `undefined`
- `filter` と違って、見つけた時点で走査を打ち切る

ID で目的の 1 件を取り出すような場面でよく使います。

```js
const todos = [
  { id: "a1", text: "牛乳を買う" },
  { id: "a2", text: "本を返す" },
];

const target = todos.find((todo) => todo.id === "a2");
console.log(target); // { id: "a2", text: "本を返す" }
```

5 章 の「動的ルート」で URL の `id` に合う記事を一覧から取り出すときに、この `find` をそのまま使います。

### チェーン（つなげて書く）

`map` も `filter` も戻り値が配列なので、続けてメソッドを呼べます。

```js
const users = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 15 },
  { name: "Carol", age: 30 },
];

const adultNames = users
  .filter((user) => user.age >= 20)
  .map((user) => user.name);

console.log(adultNames); // ["Alice", "Carol"]
```

「成人だけ絞り込んでから、名前だけ取り出す」という流れが素直に書けます。

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
    <title>lesson25</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson25: 分割代入とスプレッド</h1>
  </body>
</html>
```

**`script.js`**

```js
// 演習 A: 分割代入
const user = { name: "Alice", age: 20, city: "Tokyo" };

const { name, age } = user;
console.log(name);
console.log(age);

const colors = ["red", "green", "blue"];
const [first, second] = colors;
console.log(first);
console.log(second);

// 演習 B: スプレッド
const copy = { ...user };
console.log(copy);

const updated = { ...user, age: 21 };
console.log(updated);
console.log(user);

const a = [1, 2];
const b = [3, 4];
const merged = [...a, ...b];
console.log(merged);

const todos = ["牛乳を買う", "本を読む"];
const added = [...todos, "ジョギング"];
console.log(added);
console.log(todos);
```

</details>

### ゴール

- ユーザー配列から「成人（20 歳以上）だけ」の配列を作る
- ユーザー配列から「名前だけ」の配列を作る
- 2 つを組み合わせて「成人の名前だけ」の配列を作る
- ID で TODO の 1 件を取り出す（`find`）

### 手順

1. `index.html` のタイトルを `lesson26` に変える
2. `script.js` を以下に書き換える

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson26</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson26: 配列の変換</h1>
  </body>
</html>
```

### `script.js`

```js
const users = [
  { name: "Alice", age: 20 },
  { name: "Bob", age: 15 },
  { name: "Carol", age: 30 },
  { name: "Dave", age: 17 },
];

const adults = users.filter((user) => user.age >= 20);
console.log(adults);

const names = users.map((user) => user.name);
console.log(names);

const adultNames = users
  .filter((user) => user.age >= 20)
  .map((user) => user.name);
console.log(adultNames);

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);
const evens = numbers.filter((n) => n % 2 === 0);
console.log(doubled);
console.log(evens);
console.log(numbers);

const todos = [
  { id: "a1", text: "牛乳を買う" },
  { id: "a2", text: "本を返す" },
  { id: "a3", text: "ゴミを出す" },
];
const target = todos.find((todo) => todo.id === "a2");
console.log(target);

const missing = todos.find((todo) => todo.id === "zzz");
console.log(missing);
```

### 期待出力

```
[{name: "Alice", age: 20}, {name: "Carol", age: 30}]
["Alice", "Bob", "Carol", "Dave"]
["Alice", "Carol"]
[2, 4, 6, 8, 10]
[2, 4]
[1, 2, 3, 4, 5]
{id: "a2", text: "本を返す"}
undefined
```

最後の `console.log(numbers)` で、元の配列が変わっていないことを確認します。

### 変える

- `filter` の条件を `user.age < 20` に変えて「未成年」を取り出す
- `map` を `(user) => user.age` に変えて「年齢だけ」の配列を作る
- チェーンの `filter` と `map` の順番を入れ替えるとどうなるか考える（先に `map` で名前にしてしまうと `user.age` が使えなくなる）

### 自分で書く

- 数値配列 `[10, 25, 7, 42, 3]` から「10 以上のものだけ」を残す → `[10, 25, 42]`
- 文字列配列 `["apple", "banana", "cherry"]` から「すべて大文字に変えた新しい配列」を作る（ヒント: `s.toUpperCase()`）→ `["APPLE", "BANANA", "CHERRY"]`
- TODO の配列 `[{ id: "1", text: "A" }, { id: "2", text: "B" }, { id: "3", text: "C" }]` から `id: "2"` だけを除いた新しい配列を作る（`filter` を使う）

## まとめ

- `map` は「同じ長さの新しい配列を作る」変換
- `filter` は「条件で絞り込んだ新しい配列を作る」抽出
- `find` は「条件を満たす最初の 1 件を取り出す」抽出（見つからないときは `undefined`）
- どれも元の配列は変えない
- チェーンすると複数の処理を 1 行でつなげられる
- **`find` は5 章 の「動的ルート」（詳細取得、URL の `id` から 1 件取り出す）で再登場する**
- **`map` は4 章 の「配列を描画する」で JSX の配列を作る形で再登場する**
