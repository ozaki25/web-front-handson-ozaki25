# lesson19: 条件で分岐する

<script setup>
// LiveDemo の :js に渡す JS コード。
// 属性値に直接書くと Vue の HTML パーサーが JS 内の < や && を誤認するため、
// script setup の変数経由で渡している。
const demoJs = `
const age = 20;

if (age >= 20) {
  console.log(age + ' 歳: 成人です');
} else if (age >= 13) {
  console.log(age + ' 歳: 10 代です');
} else {
  console.log(age + ' 歳: 子供です');
}

if (age >= 20 && age < 60) {
  console.log('働き盛り');
}
`
</script>

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

### 補足: `==` の罠（読めるようにだけ）

他人のコードや古い記事では `==` が出てきます。書くことは推奨しませんが、読めるようには知っておきます。`==` は「型が違っても無理に合わせて比較する」ため、次のような直感に反する結果になります。

```js
0 == "";              // true（空文字を 0 として比較）
null == undefined;    // true（特別扱い）
"1" == 1;             // true（文字列を数値に変換）
```

`===` ならどれも `false` です。**自分で書くときは必ず `===`** にしてください。

### 補足: falsy 値（`if` の中で「偽」と扱われる値）

`if (x)` のように値そのものを条件として使うと、次の **6 つの値だけが `false` 扱い** になります（これを **falsy** と呼びます）。それ以外はすべて `true` 扱い（**truthy**）です。

| falsy 値 | 意味 |
| --- | --- |
| `false` | 真偽値の `false` |
| `0` | 数値のゼロ |
| `""` | 空文字列 |
| `null` | 「意図的に空」 |
| `undefined` | 「まだ値がない」 |
| `NaN` | 数値計算が失敗した結果 |

```js
if ("hello") { /* 実行される（空でない文字列は truthy） */ }
if ("") { /* 実行されない（空文字は falsy） */ }
if (0) { /* 実行されない（0 は falsy） */ }
if ("0") { /* 実行される（"0" は空でない文字列なので truthy） */ }
```

`if (name)` のように省略して書くと「`name` が空文字 / `null` / `undefined` のどれでも `false`」の意味になり、`if (name === "")` を書くより短くなります。便利ですが「`0` も falsy」の事実を忘れると、数値の 0 を空扱いしてしまうバグの原因になります。

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

下のデモで、`age` の値を変えると条件分岐の結果が Console にどう出るかを体感できます。`age` を `12` / `20` / `70` に書き換えると出力が変わります。

<LiveDemo
  height="180px"
  :html="`<p>age の値を変えてデモのソースを書き換えて試してください。</p>`"
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
    <title>lesson18</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson18: 値の種類</h1>
  </body>
</html>
```

**`script.js`**

```js
const userName = "Alice";
const age = 20;
const isStudent = true;
const nickname = null;
let score;

console.log(userName);
console.log(age);
console.log(isStudent);
console.log(nickname);
console.log(score);

const message = `あなたは ${userName} さんで、${age} 歳です`;
console.log(message);

const summary = `名前: ${userName} / 学生: ${isStudent} / 点数: ${score}`;
console.log(summary);
```

</details>

### ゴール

- 年齢を表す変数 `age` の値によって「成人 / 未成年」を分岐表示する
- 年齢を変えて結果が切り替わることを確認する

### 手順

1. `index.html` のタイトルを `lesson19` に変える
2. `script.js` を以下に書き換える
3. Console で結果を確認する

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
    <h1>lesson19: 条件で分岐する</h1>
  </body>
</html>
```

### `script.js`

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
