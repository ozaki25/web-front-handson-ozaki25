# lesson30: import / export でモジュール化

## ゴール

- JS ファイルを複数に分割して、`import` と `export` で繋げられる
- 名前付き export と `export default` の違いを使い分けられる
- `<script type="module">` を使ってモジュールを読み込める
- ロジックを役割ごとに複数ファイルに分けて整理できる

## 解説

### なぜファイルを分けるのか

1 つの `script.js` に全部書いていくと、だんだん「どの処理がどこにあるか」がわからなくなります。

- 保存 / 読み込みのロジック
- 画面への描画ロジック
- イベントを受け取るエントリーポイント

これらを **役割ごとに別ファイルに分けておく** と、1 ファイルあたりの責任が小さくなり、読みやすくなります。これを **モジュール化** と呼びます。

### モジュールとして読み込む: `type="module"`

HTML から JS ファイルを読み込むとき、通常の `<script>` ではなく `<script type="module">` を使います。こうすると、その JS ファイルは「モジュール」として扱われ、`import` / `export` が使えるようになります。

```html
<script type="module" src="./main.js"></script>
```

- `type="module"` を付けないと `import` / `export` は使えない
- `defer` を付けなくても、モジュールは自動的に遅延読み込みされる

### export（公開する）

他のファイルから使ってほしい関数や値は、`export` で **公開** します。書き方は 2 種類あります。

#### 名前付き export

**その名前のまま** 公開します。1 つのファイルから複数の値を公開したいときに向きます。

```js
// math.js
export function add(a, b) {
  return a + b;
}

export function sub(a, b) {
  return a - b;
}

export const PI = 3.14;
```

まとめて最後に書くこともできます。どちらでも動きます。

```js
// math.js
function add(a, b) {
  return a + b;
}
function sub(a, b) {
  return a - b;
}
const PI = 3.14;

export { add, sub, PI };
```

#### デフォルト export

ファイルから **「中心となる 1 つ」だけを公開する** 書き方です。1 ファイルにつき 1 つだけ書けます。

```js
// greeter.js
export default function greet(name) {
  return `こんにちは、${name} さん`;
}
```

### import（読み込む）

別のファイルから `export` したものを受け取ります。パスの末尾には **`.js` まで書きます**（ブラウザで動かすときの決まり）。

#### 名前付き import

`{ }` で囲んで、export したときと同じ名前で受け取ります。

```js
// main.js
import { add, sub, PI } from "./math.js";

console.log(add(1, 2)); // 3
console.log(sub(5, 3)); // 2
console.log(PI);        // 3.14
```

- `{ add, sub }` のように必要なものだけ受け取れる
- 名前は export 側と **同じ** にする

#### デフォルト import

`{ }` を付けず、好きな名前で受け取れます。

```js
// main.js
import greet from "./greeter.js";

console.log(greet("Alice")); // "こんにちは、Alice さん"
```

- `{ }` を付けない
- 名前は自由に決められる（`greet` でも `hello` でも動く）

#### 名前付きとデフォルトの混在

同じファイルから両方を import するのも可能です。

```js
import greet, { PI } from "./greeter.js";
```

### 使い分けの目安

- **複数の関数 / 値を公開するファイル** → 名前付き export（本コースではこちらを基本に）
- **中心となる宣言が 1 つだけのファイル**（例: 1 つのコンポーネント） → デフォルト export

どちらが正解ということはなく、プロジェクトの方針で決めます。本コースでは **名前付き export を基本** にします。

### `.js` 拡張子は省略しない

Node.js のパッケージ開発では省略されることもありますが、**ブラウザで直接読み込むときは `.js` まで書きます**。

```js
// OK
import { add } from "./math.js";

// NG（ブラウザで 404 になる）
import { add } from "./math";
```

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」を貼って揃えてください。本レッスンからは `index.html` / `main.js` / `storage.js` / `render.js` の 4 ファイル構成になります。`script.js` は使わなくなるため、次の手順で新しいファイルを作成してください。

<details>
<summary>出発点のコード</summary>

これは **新規 StackBlitz から始める方向け** の最小スターターです（「Web Storage で値をブラウザに保存する」レッスンの完成形を厳密に再現したものではないため、内容は import / export の題材練習用に絞っています）。

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
    <h1>import / export の出発点</h1>
  </body>
</html>
```

**`script.js`**

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

</details>

### ゴール

- TODO アプリのロジックを 3 ファイルに分割する
  - `storage.js`: `localStorage` に配列を保存 / 読み出し（`JSON.parse` は `try` / `catch` で囲む）
  - `render.js`: 配列を受け取って `<ul>` に `<li>` を並べる
  - `main.js`: 2 つを import して、画面の初期描画だけを行うエントリ
- 画面を開くと、`storage.js` に仕込んだ初期データが `<ul>` に並んで表示される

### 手順

1. 以下 4 ファイルをプロジェクトに作る: `index.html` / `main.js` / `storage.js` / `render.js`
2. HTML から `<script type="module" src="./main.js">` を読み込む

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>サンプル</title>
    <script type="module" src="./main.js"></script>
  </head>
  <body>
    <h1>import / export</h1>
    <ul id="list"></ul>
  </body>
</html>
```

### `storage.js`

`localStorage` の読み書きだけを担当します。`JSON.parse` は壊れた文字列だと例外を投げるので、後の「fetch で API から取得する」で学ぶ `try` / `catch` で囲みます（ここで先取りします）。

```js
const STORAGE_KEY = "module-todos";

export function loadTodos() {
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
    console.log("保存データの読み込みに失敗しました");
    console.log(error);
    return [];
  }
}

export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
```

- `loadTodos()`: 保存されている配列を返す。なければ空配列、壊れていても空配列
- `saveTodos(todos)`: 配列を文字列に変えて保存

### `render.js`

DOM への描画だけを担当します。「どこに描くか」と「何を描くか」を引数で受け取れるようにしておくと、画面構成が変わっても中身を書き直さずに済みます。

```js
export function renderTodos(listElement, todos) {
  listElement.textContent = "";
  for (const todo of todos) {
    const li = document.createElement("li");
    li.textContent = todo.text;
    listElement.appendChild(li);
  }
}
```

- `listElement.textContent = ""` で一度中身を空にする
- 配列の各要素に対して `<li>` を作って `<ul>` に追加する

### `main.js`

エントリーポイントです。`storage.js` と `render.js` を import して、初期データがあれば描画、なければ動作確認用の初期データを入れて保存します。

```js
import { loadTodos, saveTodos } from "./storage.js";
import { renderTodos } from "./render.js";

const list = document.querySelector("#list");

let todos = loadTodos();

if (todos.length === 0) {
  todos = [
    { id: "a1", text: "牛乳を買う" },
    { id: "a2", text: "本を読む" },
    { id: "a3", text: "掃除する" },
  ];
  saveTodos(todos);
}

renderTodos(list, todos);
```

- 2 つのファイルから必要な関数を **名前付き import** で受け取る
- 初回起動時だけ、動作確認用のサンプルデータを保存する
- `renderTodos` に `<ul>` 要素と配列を渡して描画

### 期待出力

- 画面に以下の 3 行が `<ul>` の中に並ぶ

```
牛乳を買う
本を読む
掃除する
```

- DevTools の Application（または Storage）タブ → Local Storage に `module-todos` というキーで JSON 文字列が保存されている
- Console で `localStorage.setItem("module-todos", "{ broken")` と壊れた文字列をわざと入れてリロード → Console に「保存データの読み込みに失敗しました」と出て、サンプルデータで起動し直される（`try` / `catch` の効果）
- Console に `Uncaught SyntaxError: Cannot use import statement outside a module` が **出ない** ことを確認（出ていたら `<script type="module">` になっていない）

### 変える

- `main.js` のサンプルデータの中身を好きな TODO に変える → 一度 Local Storage の `module-todos` を削除してからリロードすると、新しいサンプルが表示される
- `renderTodos` の `textContent` を ``textContent = `・${todo.text}`` に変える → 各行の頭に `・` が付く
- `main.js` で `renderTodos(list, todos)` を呼ばないようにコメントアウト → `<ul>` が空のまま

### 自分で書く

- `storage.js` に `clearTodos()` という関数を追加して export する。中身は `localStorage.removeItem(STORAGE_KEY)` だけ。`main.js` から import して、ページ読み込み時に 1 回呼んでみる（動作確認したら外す）
- `render.js` を **デフォルト export** に書き換える（`export default function renderTodos(...) { ... }`）。`main.js` 側の import を `import renderTodos from "./render.js";` に変えて、同じ動きをすることを確認する
- 新しいファイル `format.js` を作り、``export function formatTodo(todo) { return `[${todo.id}] ${todo.text}`; }`` を書く。`render.js` の中で import して、`<li>` に整形後の文字列を表示する

## まとめ

- ファイルを役割ごとに分けると、読みやすく・変更しやすくなる
- ブラウザで `import` / `export` を使うには `<script type="module" src="...">` で読み込む
- **名前付き export**（`export function foo() {}`）と **デフォルト export**（`export default ...`）の 2 種類
- **名前付き import** は `{ 名前 }` で受け取り、名前は export と同じにする
- **デフォルト import** は `{ }` なしで、受け取り側で名前を自由に決められる
- ブラウザで直接読み込む場合、import パスの末尾は **`.js` まで書く**
- 本コースは **名前付き export を基本** とする
