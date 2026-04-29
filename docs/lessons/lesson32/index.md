# lesson32: try / catch でエラー処理

<script setup>
const demoJs = `
const output = document.getElementById('output');

function run() {
  const raw = '{ broken json';
  try {
    const data = JSON.parse(raw);
    output.textContent = '成功: ' + JSON.stringify(data);
  } catch (error) {
    output.textContent =
      'catch しました: ' + error.name + ' / ' + error.message;
  } finally {
    output.textContent += ' (finally まで到達)';
  }
}

document.getElementById('btn').addEventListener('click', run);
`
</script>

## ゴール

- プログラムが途中で止まってしまう原因を知り、例外処理が必要な場面を言葉にできる
- `try` / `catch` / `finally` の構文と実行順を書ける
- `Error` オブジェクトから `message` や `name` を取り出せる
- `throw new Error(...)` で自分でエラーを投げられる
- 壊れた JSON を `JSON.parse` に渡して例外を受け止められる

## 解説

### なぜエラー処理が必要か

普段書いている JS は、処理の途中で **例外**（Exception） が飛ぶことがあります。例外が飛ぶと、その行より下は実行されず、キャッチされなければ以降の全処理が止まります。

例外が飛ぶ代表的な場面は次のようなものです。

- 壊れた文字列を `JSON.parse` に渡す（構文エラー）
- ネットワークが切れた状態で `fetch` する（通信エラー）
- 想定外の入力（`undefined` のプロパティを読む、ゼロ除算以外の不整合など）
- 自分で `throw` したカスタムエラー

ここで **例外をちゃんと受け止める** 仕組みが `try` / `catch` です。

### `try` / `catch` / `finally` の構文

基本形は次のとおりです。

```js
try {
  // 例外が起きるかもしれない処理
} catch (error) {
  // 例外が起きたときだけ実行される
} finally {
  // 例外の有無に関係なく最後に実行される
}
```

- `try` ブロックの中で例外が飛んだ瞬間、実行は `catch` に飛びます
- `catch` の引数 `error` には **投げられた値**（通常は `Error` オブジェクト）が入ります
- `finally` は例外があろうとなかろうと最後に必ず走ります
- `catch` と `finally` は **どちらかだけでも OK** です

### `Error` オブジェクト

例外としてよく投げられるのは `Error` オブジェクトです。次のプロパティを持ちます。

- `error.message`: 人間向けのエラーメッセージ
- `error.name`: エラーの種類（`"SyntaxError"` / `"TypeError"` など）
- `error.stack`: スタックトレース（どのファイルの何行目で起きたかの情報、デバッグ用）

```js
try {
  JSON.parse("{ broken");
} catch (error) {
  console.log(error.name);    // "SyntaxError"
  console.log(error.message); // "Unexpected token ..." など
}
```

### `throw` で自分でエラーを投げる

関数の中で「この引数はおかしいので、呼び出し元に決めてもらう」ときは、`throw` を使います。

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("0 で割ることはできません");
  }
  return a / b;
}

try {
  const result = divide(10, 0);
  console.log(result);
} catch (error) {
  console.log("失敗:", error.message); // "失敗: 0 で割ることはできません"
}
```

- `throw new Error("メッセージ")` がお作法です
- `throw "文字列"` のように文字列をそのまま投げることもできますが、スタックトレースが取れないので `Error` オブジェクトを投げるのが基本です

### 実行順を目で追う

`try` / `catch` / `finally` の実行順を 1 回見ておくと誤解しません。

```js
function safeParse(raw) {
  try {
    console.log("A: parse を試す");
    const data = JSON.parse(raw);
    console.log("B: parse 成功");
    return data;
  } catch (error) {
    console.log("C: parse 失敗", error.message);
    return null;
  } finally {
    console.log("D: 片付け処理");
  }
}

safeParse('{"ok":true}'); // A → B → D
safeParse("{ broken");     // A → C → D
```

成功時も失敗時も `finally` は必ず走ります。ファイルを閉じる / ローディング表示を消すなど、**片付けたいこと** を書く場所です。

### 壊れた JSON を受け止める最小例

実際に壊れた JSON を `try` / `catch` で受ける様子を下のデモで見てください。ボタンを押すと、パースに失敗したエラーをキャッチして表示します。

<LiveDemo
  height="180px"
  :html="`
<button id='btn'>壊れた JSON をパースする</button>
<p id='output'>（ここに結果が出ます）</p>
  `"
  :css="`
body { padding: 16px; font-family: system-ui; }
button { padding: 8px 16px; font-size: 1rem; cursor: pointer; }
p { margin-top: 12px; }
  `"
  :js="demoJs"
/>

### catch しなかったらどうなるか

`try` / `catch` を書かずに例外を投げると、ブラウザ Console に赤字で「Uncaught ...」と表示され、そこから下の処理が **一切走らなくなります**。ページ全体の JS が止まってしまうので、**ユーザー入力や外部データを扱う場所では必ず囲む** のが鉄則です。

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。本レッスンでは `index.html` / `main.js` / `storage.js` の 3 ファイル構成で進めます。「import / export でモジュール化」で作った `storage.js` を出発点にして、壊れた JSON に強くする流れです。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson32</title>
    <script type="module" src="./main.js"></script>
  </head>
  <body>
    <h1>lesson32: try / catch</h1>
    <pre id="log"></pre>
  </body>
</html>
```

**`storage.js`**

```js
const STORAGE_KEY = "try-catch-demo";

export function loadValue() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return null;
  }
  return JSON.parse(raw);
}

export function saveValue(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
```

**`main.js`**

```js
import { loadValue, saveValue } from "./storage.js";

saveValue({ name: "Alice", age: 20 });

const value = loadValue();
console.log(value);
```

</details>

### ゴール

- `storage.js` の `loadValue` を `try` / `catch` で保護し、壊れたデータのときは既定値（`null`）を返す
- `main.js` から `divide(a, b)` という自作関数を呼び、`b === 0` のときは `throw` して `catch` で拾う
- Console に「何が起きたか」が日本語で表示される

### 手順

1. `storage.js` の `loadValue` を、例外に強い形へ書き換える
2. `main.js` に `divide` 関数を追加し、呼び出しを `try` / `catch` で囲む
3. わざと壊れた値を `localStorage.setItem` で入れてリロードし、既定値が返ることを確かめる

### 主要ファイルの完成形

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson32</title>
    <script type="module" src="./main.js"></script>
  </head>
  <body>
    <h1>lesson32: try / catch</h1>
    <pre id="log"></pre>
  </body>
</html>
```

**`storage.js`**

```js
const STORAGE_KEY = "try-catch-demo";

export function loadValue() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.log("保存データの読み込みに失敗しました");
    console.log(error.name, error.message);
    return null;
  }
}

export function saveValue(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
```

**`main.js`**

```js
import { loadValue, saveValue } from "./storage.js";

function divide(a, b) {
  if (b === 0) {
    throw new Error("0 で割ることはできません");
  }
  return a / b;
}

// 1. 自作エラーを投げて受け取る
try {
  const result = divide(10, 0);
  console.log("計算結果:", result);
} catch (error) {
  console.log("divide が失敗:", error.message);
} finally {
  console.log("divide の後処理");
}

// 2. 保存と読み出し（正常系）
saveValue({ name: "Alice", age: 20 });
const ok = loadValue();
console.log("読み込み結果:", ok);

// 3. わざと壊れたデータを入れてから読み出す
localStorage.setItem("try-catch-demo", "{ broken");
const broken = loadValue();
console.log("壊れたとき:", broken);
```

### 期待出力

Console に次のような行が出ます（エラーメッセージの文言はブラウザによって少し変わります）。

```
divide が失敗: 0 で割ることはできません
divide の後処理
読み込み結果: {name: 'Alice', age: 20}
保存データの読み込みに失敗しました
SyntaxError <壊れた JSON のメッセージ>
壊れたとき: null
```

- 赤字の「Uncaught ...」は **出ない**。出ていたら `try` / `catch` で囲み損ねている
- `finally` の「divide の後処理」が、成功・失敗どちらでも表示される

### 変える

- `divide(10, 2)` に書き換える → `divide が失敗` の行が消え、`計算結果: 5` と出る。`finally` は変わらず出る
- `throw new Error(...)` の引数メッセージを好きな日本語に変える → `catch` 側の `error.message` がそれになる
- `storage.js` の `return null;` を `return [];` に変える → 壊れたときに空配列が返るようになる

### 自分で書く

次の 2 つを順にやってみる。慣れていないうちは 1 つだけでも構わない。

- `main.js` に `parseNumber(text)` という関数を作る。`text` が数値に変換できないとき（`Number(text)` が `NaN`）は `throw new Error("数値ではありません")`。呼び出し側で `try` / `catch` する
- `storage.js` の `saveValue` にも `try` / `catch` を入れる。`localStorage` の容量オーバーなどで失敗した場合に `console.log` で気付けるようにする

## まとめ

- 例外は放置するとそこから先の処理が全部止まる
- `try` / `catch` / `finally` で受け止められる。`finally` は成功・失敗どちらでも最後に走る
- `Error` オブジェクトは `name` / `message` / `stack` を持つ
- `throw new Error("...")` で自分でもエラーを投げられる
- 外部データ（`localStorage` / `fetch` の結果 / ユーザー入力）を扱う場所は、ほぼ例外なく `try` / `catch` で囲む
