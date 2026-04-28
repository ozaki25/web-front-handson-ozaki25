# lesson32: JSON を読み書きする

<script setup>
const demoJs = `
const output = document.getElementById('output');

const user = {
  name: 'Alice',
  age: 20,
  hobbies: ['読書', 'ランニング'],
};

const compact = JSON.stringify(user);
const pretty = JSON.stringify(user, null, 2);

const parsed = JSON.parse(compact);

output.textContent =
  '--- compact ---\\n' + compact +
  '\\n\\n--- pretty ---\\n' + pretty +
  '\\n\\n--- parse 結果 (name だけ取り出す) ---\\n' + parsed.name;
`
</script>

## ゴール

- JSON がどんな形式か（object / array / string / number / boolean / null）を説明できる
- `JSON.stringify` でオブジェクトを文字列にできる。インデントも付けられる
- `JSON.parse` で文字列をオブジェクトに戻せる
- 壊れた JSON を `try` / `catch` で安全に扱える（「try / catch でエラー処理」の応用）
- `replacer` / `reviver` という仕組みが存在することを知っている

## 解説

### JSON って何？

**JSON**（JavaScript Object Notation） は、オブジェクトや配列を **文字列として表現する** フォーマットです。ファイル保存 / `localStorage` / API との通信 / 設定ファイル、あらゆる場面で使います。

JSON で表現できる **値の種類は次の 6 種だけ** です（プリミティブが 4 つ + 構造が 2 つ）。

プリミティブ（単一の値）:

- 文字列: `"hello"`（**ダブルクォート必須**）
- 数値: `12` / `3.14` / `-5`
- 真偽値: `true` / `false`
- `null`

構造（プリミティブを組み合わせた箱）:

- 配列: `[1, 2, 3]`
- オブジェクト: `{ "key": "value" }`（キーも **ダブルクォートで囲む**）

JSON の **できないこと** も押さえておきます。

- コメントは書けない
- `undefined` / 関数 / `Date` オブジェクトはそのまま表現できない（`stringify` 時に消えるか文字列化される）
- キーをシングルクォートで囲めない
- 末尾カンマ（trailing comma）は許されない

### `JSON.stringify` でオブジェクト → 文字列

オブジェクトや配列を文字列化します。

```js
const user = { name: "Alice", age: 20 };
const text = JSON.stringify(user);
console.log(text); // '{"name":"Alice","age":20}'
```

#### インデント付きで整形する（第 3 引数）

第 3 引数にスペースの数（または文字列）を渡すと、改行とインデントが入った読みやすい形になります。

```js
const pretty = JSON.stringify(user, null, 2);
console.log(pretty);
// {
//   "name": "Alice",
//   "age": 20
// }
```

- 第 2 引数は後で触れる `replacer` です。使わないときは `null`
- 第 3 引数に `2` を渡すと半角スペース 2 個ずつでインデント
- 設定ファイルやログ出力など「人間が読む」用途では必ず付けましょう

#### 消えるもの

`JSON.stringify` は JSON に表現できない値を静かに落とします。

```js
const weird = {
  name: "Alice",
  greet: () => "hi",      // 関数は消える
  createdAt: undefined,   // undefined は消える
};

console.log(JSON.stringify(weird)); // '{"name":"Alice"}'
```

「保存したのにプロパティが欠ける」事故の原因になります。保存対象は JSON で表せる型だけにそろえましょう。

### `JSON.parse` で文字列 → オブジェクト

文字列を JS の値に戻します。

```js
const text = '{"name":"Alice","age":20}';
const user = JSON.parse(text);
console.log(user.name); // "Alice"
console.log(user.age);  // 20
```

#### 壊れた JSON は例外を投げる

構文が合っていない JSON を `parse` すると `SyntaxError` が投げられます。「try / catch でエラー処理」で学んだとおり、**必ず `try` / `catch` で囲む** 前提です。

```js
function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.log("JSON が壊れています:", error.message);
    return null;
  }
}

console.log(safeParse('{"ok":true}')); // { ok: true }
console.log(safeParse("{ broken"));    // null
```

`localStorage` から読む / 外部 API から受け取る、といった **自分で書いていない文字列** を扱うときは、この形がテンプレになります。

### `replacer` と `reviver`（軽く紹介）

`stringify` / `parse` にはフィルタ関数を挟む仕組みがあります。今は「こういう仕組みがある」と知っておけば十分です。

#### `replacer`

`stringify` の第 2 引数に関数を渡すと、キー・値のペアごとに呼ばれて「何を出力するか」をカスタマイズできます。

```js
const data = { name: "Alice", password: "secret" };
const safe = JSON.stringify(data, (key, value) => {
  if (key === "password") return undefined; // undefined を返すとそのキーは消える
  return value;
});
console.log(safe); // '{"name":"Alice"}'
```

パスワードなど「保存したくない値」を除外したいときに使います。

#### `reviver`

`parse` の第 2 引数に関数を渡すと、復元する値を加工できます。

```js
const text = '{"createdAt":"2026-04-22T00:00:00.000Z","title":"hello"}';
const obj = JSON.parse(text, (key, value) => {
  if (key === "createdAt") return new Date(value);
  return value;
});
console.log(obj.createdAt instanceof Date); // true
```

文字列化されて消えた `Date` を復元する、といった用途です。本コースの残りでは使いませんが、名前だけ覚えておくと後で読み解きやすくなります。

### デモで確認

オブジェクトを `stringify` してインデント付きで表示し、`parse` で戻して取り出す流れを動かしておきましょう。

<LiveDemo
  height="300px"
  :html="`
<button id='btn' onclick='run()'>動かす</button>
<pre id='output' style='background:#f5f5f5;padding:12px;border-radius:6px;'></pre>
  `"
  :css="`
body { padding: 16px; font-family: system-ui; }
pre { white-space: pre-wrap; font-size: 14px; }
  `"
  :js="demoJs"
/>

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。本レッスンでは `index.html` / `main.js` の 2 ファイルで TODO 配列を JSON 保存・復元します。

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
    <h1>lesson32: JSON</h1>
    <ul id="list"></ul>
    <pre id="raw"></pre>
  </body>
</html>
```

**`main.js`**

```js
const list = document.querySelector("#list");
const raw = document.querySelector("#raw");

const todos = [
  { id: "a1", text: "牛乳を買う", done: false },
  { id: "a2", text: "本を読む", done: true },
];

for (const todo of todos) {
  const li = document.createElement("li");
  li.textContent = todo.text;
  list.appendChild(li);
}
```

</details>

### ゴール

- TODO 配列を `JSON.stringify` でインデント付き文字列にして画面に出す
- `localStorage` に保存した JSON を、次回リロード時に `JSON.parse` で復元する
- 壊れた JSON が入っていても `try` / `catch` で受け止めて空配列から始める

### 手順

1. `main.js` に `STORAGE_KEY` と `loadTodos` / `saveTodos` を追加する
2. 初回は初期配列を `saveTodos` で保存し、次回以降は `loadTodos` で復元する
3. 画面に `<ul>` のリストと、`<pre>` にインデント付き JSON 表示を両方出す
4. `localStorage.setItem("json-todos", "{ broken")` を Console で叩いてリロードし、復元に失敗しても壊れないことを確認する

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
    <h1>lesson32: JSON</h1>
    <ul id="list"></ul>
    <h2>保存されている JSON</h2>
    <pre id="raw"></pre>
  </body>
</html>
```

**`main.js`**

```js
const STORAGE_KEY = "json-todos";

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.log("JSON の復元に失敗:", error.message);
    return [];
  }
}

function saveTodos(todos) {
  const text = JSON.stringify(todos);
  localStorage.setItem(STORAGE_KEY, text);
}

function render(todos) {
  const list = document.querySelector("#list");
  const raw = document.querySelector("#raw");

  list.textContent = "";
  for (const todo of todos) {
    const li = document.createElement("li");
    li.textContent = todo.done ? `[済] ${todo.text}` : todo.text;
    list.appendChild(li);
  }

  raw.textContent = JSON.stringify(todos, null, 2);
}

let todos = loadTodos();

if (todos.length === 0) {
  todos = [
    { id: "a1", text: "牛乳を買う", done: false },
    { id: "a2", text: "本を読む", done: true },
    { id: "a3", text: "掃除する", done: false },
  ];
  saveTodos(todos);
}

render(todos);
```

### 期待出力

画面に次の内容が表示されます。

```
lesson32: JSON

- 牛乳を買う
- [済] 本を読む
- 掃除する

保存されている JSON
[
  {
    "id": "a1",
    "text": "牛乳を買う",
    "done": false
  },
  {
    "id": "a2",
    "text": "本を読む",
    "done": true
  },
  {
    "id": "a3",
    "text": "掃除する",
    "done": false
  }
]
```

- DevTools の Application（または Storage）タブ → Local Storage に `json-todos` というキーが入っている
- Console で `localStorage.setItem("json-todos", "{ broken")` を実行しリロード → Console に「JSON の復元に失敗」と出て、初期データで再起動する

### 変える

- `JSON.stringify(todos, null, 2)` の `2` を `4` に変える → インデント幅が広がる
- `JSON.stringify(todos)` と第 3 引数なしにしてみる → `<pre>` が 1 行に詰まる
- 初期データに `createdAt: new Date()` を足して `stringify` → 日付が文字列として保存される（JSON には `Date` 型がない）

### 自分で書く

- `<button id="clear">`全消去`</button>` を置き、押すと `localStorage.removeItem(STORAGE_KEY)` してリロードさせる
- 各 `<li>` の横に「削除」ボタンを付け、配列から `filter` で除いて `saveTodos` → `render` する
- `replacer` を使って、`done: true` の項目だけを保存する `stringify` を書く（`saveTodos` をもう 1 つ増やす形で OK）

## まとめ

- JSON は「オブジェクト / 配列 / 文字列 / 数値 / 真偽値 / null」の 6 種類だけで構成される
- `JSON.stringify` で文字列化。第 3 引数でインデント付き整形ができる
- `JSON.parse` で文字列から値に戻す。壊れていると例外になる
- 外部から来た JSON を読むときは **必ず `try` / `catch` で囲む**
- `replacer` / `reviver` で出力・復元のカスタマイズができる（存在だけ覚える）
