# lesson14: 条件で分岐する

## ゴール

- `if` / `else if` / `else` で処理を分けられる
- `===` / `!==` で等しい / 等しくないを判定できる
- `&&` / `||` / `!` を組み合わせて条件を書ける

## 解説

### `if` の基本形

```js
if (条件) {
  // 条件が true のときに実行される
}
```

条件が「真（`true`）」のときだけ、波かっこの中が実行されます。「偽（`false`）」なら飛ばされます。

### `else` と `else if`

「そうでないとき」は `else`、「別の条件も試したい」は `else if` を使います。

```js
if (age >= 20) {
  console.log("成人");
} else if (age >= 13) {
  console.log("中高生");
} else {
  console.log("それ以外");
}
```

上から順に条件を見て、最初に `true` になったブロックだけが実行されます。どれも当てはまらなければ `else` が実行されます。

### 比較演算子

| 演算子 | 意味 |
| --- | --- |
| `===` | 等しい |
| `!==` | 等しくない |
| `>` | 左が右より大きい |
| `>=` | 左が右以上 |
| `<` | 左が右より小さい |
| `<=` | 左が右以下 |

等しいかどうかは **必ず `===` と `!==`** を使います。`==` と `!=` は値の種類が違っても自動で変換して比較する古い演算子で、混乱の原因になるため本コースでは使いません。

### 論理演算子

複数の条件をつなぎたいときに使います。

| 演算子 | 意味 |
| --- | --- |
| `&&` | 両方とも `true` のとき `true` |
| `\|\|` | どちらかが `true` なら `true` |
| `!` | `true` と `false` を反転 |

```js
if (age >= 13 && age <= 19) {
  console.log("10 代");
}

if (name === "" || name === null) {
  console.log("名前が未入力");
}

if (!isStudent) {
  console.log("学生ではない");
}
```

## 演習

### ゴール

- 年齢を表す変数 `age` の値によって「成人 / 未成年」を分岐表示する
- 年齢を変えて結果が切り替わることを確認する

### 手順

1. `index.html` のタイトルを `lesson14` に変える
2. `script.js` を以下に書き換える
3. Console で結果を確認する

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson14</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson14: 条件で分岐する</h1>
  </body>
</html>
```

### `script.js`

```js
const age = 20;
const name = "Alice";
const isStudent = true;

if (age >= 20) {
  console.log(`${name} さんは成人です`);
} else {
  console.log(`${name} さんは未成年です`);
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

### 期待出力

`age = 20` の場合、Console には次のように表示されます。

```
Alice さんは成人です
大人です
成人の学生です
学生です
```

### 変える

- `age` を `18` に変える → 「未成年です」「10 代です」「学生です」に変わる（「成人の学生です」の行は出なくなる）
- `age` を `65` に変える → 「成人です」「それ以外の年代です」「学生です」になる（`isStudent` が `true` のまま）
- `isStudent` を `false` に変える → 「学生ではありません」に切り替わる
- `===` と `==`、`!==` と `!=` は本コースでは前者だけを使う。試しに `age == "20"` と書いてみると `true` になる（型が違うのに等しいと判定される）ので、その気持ち悪さだけ体験しておく

### 自分で書く

- 変数 `score`（テストの点数）を作り、90 以上なら「A」、70 以上なら「B」、50 以上なら「C」、それ未満なら「D」と出すコードを書く
- 変数 `hour`（0〜23）を作り、`6 <= hour && hour < 12` なら「おはよう」、`12 <= hour && hour < 18` なら「こんにちは」、そうでなければ「こんばんは」と出すコードを書く

## まとめ

- `if` / `else if` / `else` で分岐を書く
- 等しいかの判定は `===` / `!==`（`==` / `!=` は使わない）
- 複数条件は `&&`（かつ）/ `||`（または）/ `!`（否定）を使い分ける
