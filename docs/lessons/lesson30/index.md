# lesson30: 非同期処理の基本

<script setup>
const demoJs = `
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('start');
  await wait(1000);
  console.log('1 秒後');
  await wait(1000);
  console.log('さらに 1 秒後（計 2 秒）');
  console.log('end');
}

main();
`
</script>

## ゴール

- 「時間がかかる処理」と「すぐ終わる処理」の違いを理解する
- `async` / `await` を使って「結果を待ってから続ける」書き方ができる
- Promise を「まだ完了していない結果を表す箱」として直感的に理解する

## 解説

### 同期と非同期

ここまで書いてきた処理は、上から順にすぐ実行されていました。これを **同期処理** と呼びます。

```js
console.log("A");
console.log("B");
console.log("C");
// 出力: A → B → C
```

一方で、「ネットワーク通信」「一定時間待つ」など、**時間がかかる処理** もあります。こうした処理は、途中で止まらず後続のコードを先に進めておく仕組みになっています。これを **非同期処理** と呼びます。

```js
console.log("A");
setTimeout(() => {
  console.log("B");
}, 1000);
console.log("C");
// 出力: A → C → （1秒後に）B
```

`setTimeout(関数, ミリ秒)` は「指定時間後に関数を呼ぶ」ブラウザの機能です。1 秒待っている間に `C` が先に出る、というのが非同期の挙動です。

### Promise というもの

非同期処理の結果は、すぐには手に入りません。そのため JS には「まだ完了していない結果を表す箱」として **Promise**（プロミス） という仕組みがあります。

- `fetch` は「結果そのもの」ではなく「Promise」を返す
- `setTimeout` **自体は Promise を返さない**（タイマーの ID という数値を返す）。後述の `wait` のように **`setTimeout` を Promise で包んだ関数** を用意すると、Promise が返るようになる
- Promise は「いつか結果が入る箱」
- 結果を取り出すには「箱が埋まるのを待つ」必要がある

本コースでは `.then` や `new Promise(...)` の自作は扱いません。使う側の書き方である `async` / `await` だけ覚えます。

> **補足: 本レッスンで Promise を返すのは `wait(ms)` だけ**: 「Promise を返す処理」がどれかを今この時点で見分ける必要はありません。本レッスンの演習では `wait(ms)` 1 つだけが Promise を返すと覚えれば十分です。

### `async` / `await`

関数の前に `async` と書き、Promise を返す処理の前に `await` と書くと、「結果が返ってくるのを待ってから続きを実行」できます。

```js
async function main() {
  console.log("start");
  await wait(1000);   // 1 秒待つ
  console.log("end"); // 1 秒後に実行される
}

main();
```

- `async function` は「中で `await` を使える関数」
- `await Promise` は「その Promise の結果が返るまで待つ」
- `await` は `async function` の中でしか使えない

### `wait(ms)` 関数（コピペで使う）

「○ミリ秒待つ」という Promise を作る関数を、以下のままコピペで使います。中身の `new Promise(...)` は後の章でも自作しません。

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

この `wait` は「`ms` ミリ秒後に完了する Promise」を返します。呼び出し側は `await wait(1000)` のように書くだけで、1 秒待つ動きになります。

下のデモを開くと、1 秒・2 秒の間隔でログが順に増えていきます。`await` が「ここで待つ」と動いているのが時間差として見えます。

<LiveDemo
  height="240px"
  :html="`<p>await が実際に時間を待つ様子:</p>`"
  :css="``"
  :js="demoJs"
/>

### 次への橋渡し

**戻り値が Promise の関数・メソッドは `await` が必要** です。たとえば `fetch(...)` や `response.json()` はどちらも Promise を返すので、両方に `await` を付けなければいけません。

「Promise を返す → `await` して結果を取り出す」という流れは、以降のレッスンで繰り返し出てきます。

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。なお本レッスンでは `<script defer src="./script.js">` の単一ファイル構成に戻って `wait` 関数を学びます。下のコードは「これまでに作った状態」を再現するためのものなので、本レッスンの演習自体は新しい `index.html` と `script.js` で進めて構いません。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson29</title>
    <script type="module" src="./main.js"></script>
  </head>
  <body>
    <h1>lesson29: import / export</h1>
    <ul id="list"></ul>
  </body>
</html>
```

**`storage.js`**

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

**`render.js`**

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

**`main.js`**

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

</details>

### ゴール

- `wait` 関数をコピペで用意し、1 秒ごとにメッセージを表示するプログラムを作る

### 手順

1. `script.js` を以下に書き換える（`wait` の中身は書き換えない）

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson30</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson30: 非同期処理の基本</h1>
  </body>
</html>
```

### `script.js`

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("start");
  await wait(1000);
  console.log("1 秒経過");
  await wait(1000);
  console.log("2 秒経過");
  await wait(1000);
  console.log("3 秒経過");
  console.log("end");
}

main();

console.log("main を呼んだ後のコード");
```

### 期待出力

Console に、1 秒ごとに以下が順に追加されます。

```
start
main を呼んだ後のコード
1 秒経過
2 秒経過
3 秒経過
end
```

ポイント:

- `main()` は Promise を返すので、その後の `console.log("main を呼んだ後のコード")` は **待たずに** すぐ実行される
- `main` の内部は `await` があるので、順番に待ちながら進む
- 合計で「約 3 秒」かけて順番にログが出る

### 変える

- `wait(1000)` の値を `wait(2000)` に変えて、1 つ 1 つが 2 秒待つようにする
- `await` を外して `wait(1000)` だけにすると、全部のログが一瞬で出る（待たなくなる）ことを確認
- `main()` の呼び出しを削除すると、何も実行されないことを確認

### 自分で書く

- 0.5 秒ごとに「1 → 2 → 3 → 4 → 5」とカウントアップするプログラムを書く
- 「A を表示」「2 秒待つ」「B を表示」「1 秒待つ」「C を表示」という順に動く `main` を書く

## まとめ

- 同期は「上から順にすぐ実行」、非同期は「時間がかかる処理を待たずに先へ進む」
- 非同期処理の結果は Promise という「まだ完了していない結果を表す箱」で返る
- `async` 関数の中で `await Promise` すると、結果が返るまで待てる
- `new Promise(...)` は自作しない。`wait` などはコピペで用意して使う
