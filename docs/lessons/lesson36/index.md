# lesson36: TODO アプリを作る

<script setup>
// LiveDemo の :js に渡す JS コード。
// 属性値に直接書くと Vue の HTML パーサーが JS 内の < や && を誤認するため、
// script setup の変数経由で渡している。
const demoJs = `
let items = ['牛乳を買う', '本を読む'];
const list = document.getElementById('list');
const btn = document.getElementById('add');

function render() {
  list.innerHTML = items.map((t) => '<li>' + t + '</li>').join('');
}

btn.addEventListener('click', () => {
  items = [...items, '項目' + (items.length + 1)];
  render();
});

render();
`
</script>

## ゴール

- 2 章 の知識（配列 / オブジェクト / 関数 / DOM / イベント / `filter` / `try`/`catch`）を統合する
- 入力・追加・削除ができる小さなアプリを HTML + JS で組み立てる
- `localStorage` に保存して、リロードしても残るようにする

## 解説

ここまでのレッスンで積み上げてきた道具で、実際に動く小さなアプリを組み立てます。新しい概念は 1 つだけ: **`localStorage`** です。

### `localStorage` とは

ブラウザが提供する「文字列を保存しておける箱」です。ページを閉じてもデータは残り、次に同じページを開いたときに読み出せます。

```js
localStorage.setItem("key", "value"); // 保存
const v = localStorage.getItem("key"); // 取り出し（なければ null）
```

- 保存できるのは **文字列だけ**
- 配列やオブジェクトをそのまま入れることはできない

### `JSON.stringify` / `JSON.parse`

配列やオブジェクトを文字列に変換 / 戻すための道具です。

```js
const todos = [{ id: "1", text: "A" }, { id: "2", text: "B" }];

const str = JSON.stringify(todos);
// '[{"id":"1","text":"A"},{"id":"2","text":"B"}]'

const back = JSON.parse(str);
// [{ id: "1", text: "A" }, { id: "2", text: "B" }]
```

- `JSON.stringify(値)`: JS のデータを JSON 文字列に
- `JSON.parse(文字列)`: JSON 文字列を JS のデータに戻す

`JSON.parse` は「壊れた文字列」を渡されると例外を投げます。localStorage の値を誰かが手動で書き換えていた場合など、失敗しうるので **「fetch で API から取得する」で学んだ `try` / `catch` で囲む** のが安全です。

### id をユニークに作る

削除のたびに「どの TODO を消したか」を判断するために、各 TODO には **一意な id** を持たせます。ブラウザ標準の `crypto.randomUUID()` を使うと、衝突しない id 文字列が手に入ります。

```js
const id = crypto.randomUUID();
// 例: "8a7c3f...-...-..."
```

### 画面構成

完成系は以下の構造です。

- 画面上部: 入力欄 `<input>` と「追加」ボタン
- 下部: TODO 一覧 `<ul>`（各行は `<li>` で、テキストと「削除」ボタンを含む）

新しい TODO を追加すると一覧の末尾に `<li>` が 1 件増え、削除ボタンを押すとその行だけが消えます。リロードしてもデータが残ります。

### デモで確認する

下のデモは、TODO アプリの核となる「配列の state + `render` 関数 + イベントハンドラ」の最小形です。ボタンを押すと配列に要素が追加され、`map` で一覧を組み立て直して画面に描画します。

<LiveDemo
  height="260px"
  :html="`<button id='add'>項目を追加</button><ul id='list'></ul>`"
  :css="`button { padding: 6px 12px; margin-bottom: 8px; cursor: pointer; } ul { padding-left: 20px; }`"
  :js="demoJs"
/>

本編ではこの土台に「入力欄からのテキスト追加」「削除ボタン」「`localStorage` による永続化」を重ねていきます。

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。本レッスンは2 章 の総仕上げで、ここまでの演習ファイルがあるとスムーズですが、下のコードでここまでの状態を再現してから演習に入っても同じ状態から始められます。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson35</title>
    <link rel="stylesheet" href="./style.css" />
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson35: カウンター</h1>

    <section>
      <p id="count-label">カウント: 0</p>
      <button id="inc">+1</button>
      <button id="dec">-1</button>
      <button id="reset">リセット</button>
    </section>

    <hr />

    <section>
      <h2>フォーム送信</h2>
      <form id="form">
        <label for="name-input">名前:</label>
        <input id="name-input" type="text" />
        <button type="submit">送信</button>
      </form>
      <p id="form-result">（未入力）</p>
    </section>
  </body>
</html>
```

**`style.css`**

```css
body {
  color: #222;
  background-color: #fff;
  font-family: sans-serif;
  padding: 16px;
  max-width: 480px;
}

button {
  margin-right: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

hr {
  margin: 24px 0;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #eaeaea;
    background-color: #1a1a1a;
  }

  button {
    background-color: #333;
    color: #eaeaea;
    border: 1px solid #555;
  }

  input {
    background-color: #222;
    color: #eaeaea;
    border: 1px solid #555;
  }
}
```

**`script.js`**

```js
// カウンター
let count = 0;
const label = document.querySelector("#count-label");
const incBtn = document.querySelector("#inc");
const decBtn = document.querySelector("#dec");
const resetBtn = document.querySelector("#reset");

function render() {
  label.textContent = `カウント: ${count}`;
}

incBtn.addEventListener("click", () => {
  count = count + 1;
  render();
});

decBtn.addEventListener("click", () => {
  count = count - 1;
  render();
});

resetBtn.addEventListener("click", () => {
  count = 0;
  render();
});

// フォーム
const form = document.querySelector("#form");
const nameInput = document.querySelector("#name-input");
const result = document.querySelector("#form-result");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = nameInput.value;
  result.textContent = `こんにちは、${value} さん`;
});
```

</details>

本レッスンは **3 段構え** です。各段でコミット（ファイル保存）して、次の段に進みます。

### 共通: HTML と CSS

3 段を通して使います。

#### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson36 TODO</title>
    <link rel="stylesheet" href="./style.css" />
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>TODO</h1>

    <form id="form">
      <input id="input" type="text" placeholder="やることを入力" />
      <button type="submit">追加</button>
    </form>

    <ul id="list"></ul>
  </body>
</html>
```

#### `style.css`

```css
body {
  color: #222;
  background-color: #fff;
  font-family: sans-serif;
  padding: 16px;
  max-width: 480px;
}

#form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

#input {
  flex: 1;
  padding: 6px 8px;
  font-size: 1rem;
}

button {
  padding: 6px 12px;
  cursor: pointer;
}

#list {
  list-style: none;
  padding: 0;
}

#list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #eaeaea;
    background-color: #1a1a1a;
  }

  #input {
    background-color: #222;
    color: #eaeaea;
    border: 1px solid #555;
  }

  button {
    background-color: #333;
    color: #eaeaea;
    border: 1px solid #555;
  }

  #list li {
    border-bottom-color: #444;
  }
}
```

### ステップ 1: 入力 + 一覧表示

まずは追加だけを作ります。削除や localStorage はまだ考えません。

#### `script.js`（ステップ 1）

**`const` ではなく `let` を使う理由**: 本コースでは `todos = [...todos, newTodo]` のように **新しい配列を作って差し替える**（「分割代入とスプレッド」で学んだイミュータブルな更新）スタイルで書く。「中身を足す」だけなら `const` のままで `todos.push(...)` でも動くが、4 章 以降の React / Server Actions では「新しい配列を渡す」形が基本になるため、2 章 の段階から同じ書き方に慣れておく。差し替えるには再代入が必要なので、変数宣言は `let` にする。

```js
const form = document.querySelector("#form");
const input = document.querySelector("#input");
const list = document.querySelector("#list");

let todos = [];

function render() {
  list.textContent = ""; // 一度空にする
  for (const todo of todos) {
    const li = document.createElement("li");
    li.textContent = todo.text;
    list.appendChild(li);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") {
    return;
  }
  const newTodo = {
    id: crypto.randomUUID(),
    text: text,
  };
  todos = [...todos, newTodo];
  input.value = "";
  render();
});

render();
```

#### 期待出力（ステップ 1）

- 入力欄に「牛乳を買う」と入力して「追加」を押す → `<ul>` の末尾に `牛乳を買う` の `<li>` が 1 件増える
- さらに「本を読む」を追加 → 2 件目が末尾に並ぶ
- 入力欄に何も入れずに「追加」を押しても何も起きない（空文字は弾く）
- **リロードすると全部消える**（localStorage はまだ使っていない）

ここでいったんファイルを保存（コミット相当）します。

### ステップ 2: 削除ボタンを追加

各 `<li>` に「削除」ボタンを付け、「配列の変換」の `filter` を使って対象を取り除きます。

#### `script.js`（ステップ 2）

```js
const form = document.querySelector("#form");
const input = document.querySelector("#input");
const list = document.querySelector("#list");

let todos = [];

function render() {
  list.textContent = "";
  for (const todo of todos) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = todo.text;
    li.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      render();
    });
    li.appendChild(deleteBtn);

    list.appendChild(li);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") {
    return;
  }
  const newTodo = {
    id: crypto.randomUUID(),
    text: text,
  };
  todos = [...todos, newTodo];
  input.value = "";
  render();
});

render();
```

#### 期待出力（ステップ 2）

- 各行に「削除」ボタンが付いている
- 「削除」を押すとその行だけが消える（他の行は残る）
- 3 件追加 → 真ん中の「削除」を押すと、その 1 件だけ消える
- リロードするとまだ全部消える（localStorage はまだ）

ここでもう一度保存（2 回目のコミット相当）します。

### ステップ 3: `localStorage` で保存・復元

最終形です。TODO の変更があるたびに localStorage に保存し、起動時に読み戻します。

#### `script.js`（最終形）

```js
const form = document.querySelector("#form");
const input = document.querySelector("#input");
const list = document.querySelector("#list");

const STORAGE_KEY = "todo-app-todos";

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
    console.log("保存データの読み込みに失敗しました");
    console.log(error);
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

let todos = loadTodos();

function render() {
  list.textContent = "";
  for (const todo of todos) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = todo.text;
    li.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      saveTodos();
      render();
    });
    li.appendChild(deleteBtn);

    list.appendChild(li);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") {
    return;
  }
  const newTodo = {
    id: crypto.randomUUID(),
    text: text,
  };
  todos = [...todos, newTodo];
  saveTodos();
  input.value = "";
  render();
});

render();
```

#### 期待出力（最終形）

- 3 件追加 → リロード → 3 件がそのまま表示される
- 削除 → リロード → 削除後の状態が残る
- 全部削除 → リロード → 空のリストが表示される（`<ul>` の中身が空）
- DevTools の Application（または Storage）タブ → Local Storage の項目で `todo-app-todos` に JSON 文字列が入っているのが確認できる
- Console で `localStorage.setItem("todo-app-todos", "{ broken")` のように壊れた JSON をわざと入れてリロード。「保存データの読み込みに失敗しました」というメッセージが Console に出つつ、空配列として起動する（`try` / `catch` の効果）

### 変える

- `STORAGE_KEY` を好きな名前に変える → 以前の保存と別扱いになり、リストが空から始まる
- 追加時に `todos = [...todos, newTodo]` を `todos = [newTodo, ...todos]` に変えて、新しいものが先頭に来るようにする
- 入力値の前後の空白を許すように、`trim()` を外してみる（半角スペースだけで追加できてしまう）

### 自分で書く

- 「すべて削除」ボタンを追加し、押すと `todos = []` にして保存・再描画する
- 各 `<li>` をクリックすると `classList.toggle("done")` が切り替わり、CSS で打ち消し線を付ける（打ち消し線の状態自体は保存しなくてよい）。CSS は `style.css` に次の 1 行を足せば足りる:

```css
.done {
  text-decoration: line-through;
  color: #6b7280;
}
```
- 現在の件数を「全 N 件」として画面上部に表示する

## まとめ

- TODO アプリの最小構成は **配列の state + `render` 関数 + イベントハンドラ** で作れる
- 追加は `[...todos, newTodo]`、削除は `todos.filter((t) => t.id !== id)` のようにイミュータブルに書く
- `localStorage` は文字列しか保存できないので `JSON.stringify` / `JSON.parse` を使う
- `JSON.parse` は失敗しうるので `try` / `catch` で囲む
