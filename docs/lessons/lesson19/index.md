# lesson19: 繰り返し処理

<script setup>
const demoJs = `
const todos = ['牛乳を買う', '本を読む', 'ジョギング'];

for (const todo of todos) {
  console.log('- ' + todo);
}

console.log('合計', todos.length, '件');
`
</script>

## ゴール

- `for...of` で配列の全要素を順に処理できる
- `forEach` でも同じことができることを知る

## 解説

### 「全部に対して同じことをする」

配列の要素を 1 つずつ取り出して `console.log` したいとき、`todos[0]` / `todos[1]` / `todos[2]` ... と書き並べるのは大変です。要素数が増えるたびに書き足す必要があり、現実的ではありません。

こういう「全部の要素に対して同じことをする」ために、繰り返し処理を使います。

### `for...of`

本コースで最初に覚える書き方は `for...of` です。配列専用ではありませんが、配列との相性がよく、書き方が素直です。

```js
const todos = ["牛乳を買う", "本を読む", "ジョギング"];

for (const todo of todos) {
  console.log(todo);
}
```

- `for (const 変数名 of 配列)` と書く
- `{ ... }` の中が「各要素に対してやりたい処理」
- ループのたびに `todo` に次の要素が順番に入る

インデックスは使わず、「要素そのもの」を直接受け取ります。インデックスが必要なときは後の章で別の書き方を学びますが、まずはこの形で十分です。

下のデモで、配列を 1 件ずつ取り出して `console.log` が順に並ぶ様子を確認できます。

<LiveDemo
  height="220px"
  :html="`<p>配列を順に出力します。</p>`"
  :css="``"
  :js="demoJs"
/>

### `forEach`（軽く触れる）

配列には `forEach` というメソッドもあります。書き味が少し違うだけで、できることはほぼ同じです。

```js
const todos = ["牛乳を買う", "本を読む", "ジョギング"];

todos.forEach((todo) => {
  console.log(todo);
});
```

- `(todo) => { ... }` はアロー関数と呼ばれる記法（次のレッスンで詳しく扱う）
- 配列の各要素に対して、カッコの中の処理が呼ばれる

本コースでは `for...of` を主に使いますが、後のレッスンや実際のコードでは `forEach` もよく見かけます。「同じ意味の別の書き方」として覚えておきます。

### どちらを使う？

- 読みやすさ重視なら `for...of`
- 既存コードに合わせるなら `forEach`

迷ったら `for...of` で統一して構いません。

## 演習

### 途中から始める場合

前のレッスンまでで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」を貼って揃えてください。

<details>
<summary>出発点のコード（lesson18 完成時点）</summary>

**`index.html`**

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

**`script.js`**

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

</details>

### ゴール

- やることリストの配列を `for...of` で全件 Console に出す
- 同じ処理を `forEach` でも書いてみる

### 手順

1. `index.html` のタイトルを `lesson19` に変える
2. `script.js` を以下に書き換える

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson19</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson19: 繰り返し処理</h1>
  </body>
</html>
```

### `script.js`

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

### 期待出力

```
--- for...of ---
牛乳を買う
本を読む
ジョギング
--- forEach ---
牛乳を買う
本を読む
ジョギング
--- 合計 ---
15
```

### 変える

- `todos` の要素を 5 つに増やす → どちらのループも自動で 5 回実行される
- `console.log(todo)` を `console.log("- " + todo)` に変える → 各行の先頭に `- ` が付く
- `numbers` の合計処理で、`total = total + n` を `total = total + n * 2` に変える → 出力が `30` になる

### 自分で書く

- 数値の配列 `scores = [80, 95, 62, 77, 90]` を作り、`for...of` で合計と平均を計算して出す（平均 = 合計 / 要素数）
- 文字列の配列 `names = ["Alice", "Bob", "Carol"]` を作り、`for...of` で「こんにちは、○○ さん」と 1 人ずつ出力する

## まとめ

- 配列の全要素を処理するには `for...of` を使う
- `forEach` でも同じことが書けるが、本コースでは `for...of` を主に使う
- ループの中で `let` で用意した合計用変数を更新すると、合計や平均も計算できる
