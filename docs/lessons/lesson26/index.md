# lesson26: 分割代入とスプレッド

<script setup>
// LiveDemo の :js に渡す JS コード。
// 属性値に直接書くと Vue の HTML パーサーが JS 内の < や && を誤認するため、
// script setup の変数経由で渡している。
const demoJs = `
const user = { name: 'Alice', age: 20 };
const { name, age } = user;
console.log('取り出し: ' + name + ', ' + age);

const colors = ['red', 'green', 'blue'];
const [first, ...rest] = colors;
console.log('first: ' + first);
console.log('rest: ' + JSON.stringify(rest));

const updated = { ...user, age: 21 };
console.log('updated: ' + JSON.stringify(updated));
console.log('元の user: ' + JSON.stringify(user));

const merged = [...colors, 'yellow'];
console.log('merged: ' + JSON.stringify(merged));
`
</script>

## ゴール

- オブジェクトや配列から値を分割代入で取り出せる
- スプレッド構文でオブジェクトや配列をコピー・結合できる
- 2 つの書き方を「取り出す」vs「まとめる・広げる」で使い分けられる

## 解説

### 最初に注意

分割代入とスプレッドは **見た目が似ていて混同しやすい** 機能です。先に目的の違いを押さえます。

| 構文 | どこに書く | 目的 | イメージ |
| --- | --- | --- | --- |
| 分割代入 | 代入の **左辺** | 値を **取り出す** | 箱の中身を取り出す |
| スプレッド `...` | 代入の **右辺**（配列・オブジェクトの中） | 値を **まとめる・広げる** | 中身を並べ直す |

この表を意識していれば、コードを読むときに迷いにくくなります。

### オブジェクトの分割代入

オブジェクトから特定のプロパティを取り出して、同じ名前の変数に入れます。

```js
const user = { name: "Alice", age: 20 };

const { name, age } = user;
console.log(name); // "Alice"
console.log(age);  // 20
```

`const { name } = user;` のように、欲しいものだけ取り出すこともできます。従来の書き方は `const name = user.name;` で、分割代入はそれを一度に書くための構文です。

### 配列の分割代入

配列の場合は `[` `]` を使います。位置（インデックス）で取り出します。

```js
const colors = ["red", "green", "blue"];

const [first, second] = colors;
console.log(first);  // "red"
console.log(second); // "green"
```

### オブジェクトのスプレッド

既存のオブジェクトの中身を「展開」して、新しいオブジェクトを作るときに使います。

```js
const user = { name: "Alice", age: 20 };

const copy = { ...user };
console.log(copy); // { name: "Alice", age: 20 }

const updated = { ...user, age: 21 };
console.log(updated); // { name: "Alice", age: 21 }
console.log(user);    // { name: "Alice", age: 20 } （元のオブジェクトは変わらない）
```

- `{ ...user }` で元の中身を展開してコピー
- 後ろに `age: 21` を書くと、同じキーは上書きされる
- 元のオブジェクトは変わらない（これを「イミュータブルな更新」と呼ぶ。4 章 で再登場）

### 配列のスプレッド

配列も同じように展開できます。

```js
const a = [1, 2];
const b = [3, 4];

const merged = [...a, ...b];
console.log(merged); // [1, 2, 3, 4]

const appended = [...a, 100];
console.log(appended); // [1, 2, 100]
```

### 分割代入とスプレッドの対比表

もう一度整理します。

| やりたいこと | 書き方 | 例 |
| --- | --- | --- |
| オブジェクトから値を取り出す | `const { key } = obj` | `const { name } = user` |
| 配列から値を取り出す | `const [a, b] = arr` | `const [first, second] = colors` |
| オブジェクトをコピー / 一部だけ変える | `{ ...obj, key: newValue }` | `{ ...user, age: 21 }` |
| 配列をコピー / 結合 / 末尾追加 | `[...arr, newValue]` | `[...todos, "新しい"]` |

「左辺に書く `{ }` / `[ ]`」は取り出す。「右辺の中に書く `...`」はまとめる・広げる。この対比で覚えます。

### デモで確認する

下のデモでは、オブジェクトと配列の分割代入、レスト構文、スプレッドによるコピー・マージを一通り実行します。元の値が変わらないこともあわせて確認できます。

<LiveDemo
  height="300px"
  :html="`<p>分割代入とスプレッドをまとめて確認するデモ</p>`"
  :css="``"
  :js="demoJs"
/>

`...rest` のように左辺で使うと「残り全部をまとめる」レスト構文になります。右辺で使うスプレッドと見た目は同じですが、役割は「取り出し」側である点に注意します。

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
    <h1>オブジェクト</h1>
  </body>
</html>
```

**`script.js`**

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

</details>

### ゴール

- （A）`user` オブジェクトから `name` と `age` を分割代入で取り出して表示する
- （B）分割代入で取り出した値と、既存オブジェクトをスプレッドでマージして新しいオブジェクトを作る

### 手順

1. `script.js` を以下に書き換える

### `script.js`

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

### 期待出力

```
Alice
20
red
green
{name: "Alice", age: 20, city: "Tokyo"}
{name: "Alice", age: 21, city: "Tokyo"}
{name: "Alice", age: 20, city: "Tokyo"}
[1, 2, 3, 4]
["牛乳を買う", "本を読む", "ジョギング"]
["牛乳を買う", "本を読む"]
```

スプレッドで作った `updated` や `added` は新しいオブジェクト / 配列で、元の `user` や `todos` は変わらないことを確認します。

### 変える

- 分割代入で `const { name, city } = user;` に変え、`city` の値を取り出す
- `const [, second, third] = colors;` で先頭を飛ばして 2 番目と 3 番目を取り出す（カンマで位置をずらす）
- `const updated2 = { ...user, name: "Bob" };` で名前を上書きした新オブジェクトを作る
- `const added2 = ["先頭", ...todos];` で先頭に追加してみる

### 自分で書く

- `book = { title: "JS入門", author: "山田", year: 2024 }` を作り、分割代入で `title` と `author` を取り出して「『○○』（○○）」の形で表示
- 上記 `book` からスプレッドを使って `year` だけ `2025` に変えた新しいオブジェクトを作り、両方とも Console に出して、元は変わらないことを確認

## まとめ

- 分割代入は左辺で書く「取り出し」の構文
- スプレッドは右辺で書く「まとめる・広げる」の構文
- 元のオブジェクト / 配列を変えずに新しいものを作る（イミュータブルな更新）のが基本
