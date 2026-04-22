# lesson16: 値の種類

## ゴール

- 文字列・数値・真偽値・`null` / `undefined` を区別できる
- テンプレートリテラルで文字列の中に変数を埋め込める

## 解説

### 値には「種類」がある

JS では、変数に入れる値にいくつかの種類があります。今回は 5 種類を覚えます。

| 種類 | 例 | 説明 |
| --- | --- | --- |
| 文字列 | `"Alice"` / `'hello'` | テキスト。ダブルクオート / シングルクオートで囲む |
| 数値 | `42` / `3.14` | 整数と小数の両方。クオートを付けない |
| 真偽値 | `true` / `false` | 「はい / いいえ」の 2 値。条件分岐で使う |
| `null` | `null` | 「意図的に空」 |
| `undefined` | `undefined` | 「まだ値がない」 |

`null` と `undefined` はどちらも「空」を表しますが、ニュアンスが違います。

- `null`: プログラマが「ここは空にしておくぞ」と明示的に入れるもの
- `undefined`: 変数を宣言しただけで値を入れていないときに、自動で付く初期状態

当面は「どちらも空を表す」くらいの理解で十分です。使い分けは徐々に身につきます。

### 数値と文字列は混ぜない

```js
const a = 1 + 2;       // 3 （数値の足し算）
const b = "1" + "2";   // "12" （文字列の連結）
const c = 1 + "2";     // "12" （文字列側に寄せられる）
```

`+` は数値なら足し算、文字列なら連結になります。片方が文字列だと全体が文字列になる、という挙動だけ頭の片隅に置いておきます。

### テンプレートリテラル

文字列の中に変数を埋め込みたいとき、バッククオート（`` ` ``）で囲む書き方が便利です。これをテンプレートリテラルと呼びます。

```js
const userName = "Alice";
const age = 20;

const message = `あなたは ${userName} さんで、${age} 歳です`;
console.log(message);
```

- バッククオートで囲む
- `${ ... }` の中に変数や式を書く

シングルクオート / ダブルクオートで囲んだ文字列では `${ ... }` は使えません。埋め込みたいときは必ずバッククオートを使います。

## 演習

### 途中から始める場合

lesson15 までで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。

<details>
<summary>出発点のコード（lesson15 完成時点）</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson15</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson15: 最初の JavaScript</h1>
    <p>DevTools の Console を開いてください。</p>
  </body>
</html>
```

**`script.js`**

```js
const userName = "Alice";
let count = 0;

console.log("Hello, JavaScript");
console.log(userName);
console.log(count);

count = count + 1;
console.log(count);
```

</details>

### ゴール

- 変数 `userName` と `age` を定義し、テンプレートリテラルで「あなたは ○○ さんで、○○ 歳です」のような文を作ってコンソールに表示する

### 手順

1. lesson15 の `index.html` をそのまま使う（タイトルだけ `lesson16` に変える）
2. `script.js` を以下の内容に書き換える
3. プレビューの Console を開く

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson16</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson16: 値の種類</h1>
  </body>
</html>
```

### `script.js`

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

### 期待出力

```
Alice
20
true
null
undefined
あなたは Alice さんで、20 歳です
名前: Alice / 学生: true / 点数: undefined
```

`score` は `let score;` と宣言しただけで値を入れていないので、自動で `undefined` になります。テンプレートリテラルの中に入れると `undefined` という文字列として表示されます。

### 変える

- `age` を `20` から `"20"`（文字列）に変えて、`age + 1` の結果を `console.log` してみる → `201` になる（文字列連結）
- `isStudent` を `false` に変えて Console を確認
- `nickname` を `"あり"` に変えて `summary` の出力に含まれる挙動を確認

### 自分で書く

- 自分の情報（名前・好きな数字・趣味）を 3 つの変数に入れ、「私は ○○ です。好きな数字は ○○ で、趣味は ○○ です。」という 1 行の文をテンプレートリテラルで作って表示する

## まとめ

- 値には文字列 / 数値 / 真偽値 / `null` / `undefined` の 5 種類（当面はこれで十分）
- 文字列の中に変数を埋め込むときはバッククオート + `${ ... }`
- クオートの種類（`` ` `` と `"` と `'`）を取り違えると `${ ... }` が文字通りに出てしまうので注意
