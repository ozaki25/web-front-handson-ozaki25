# lesson29: イベントで画面を動かす

<script setup>
const demoJs = `
let count = 0;
const btn = document.getElementById('btn');
const label = document.getElementById('label');
btn.addEventListener('click', () => {
  count = count + 1;
  label.textContent = 'カウント: ' + count;
});
`
</script>

## ゴール

- `addEventListener` でボタンのクリックに反応できる
- `submit` イベントでフォーム送信に反応できる
- `event.preventDefault()` でブラウザ既定の動作を止められる
- カウンターアプリを作る

## 解説

### イベントとは

ユーザーがボタンを押したり、フォームを送信したり、キーを押したりすると、ブラウザは **イベント** を発生させます。JS でそのイベントを「待ち構えて」処理を登録できます。

### `addEventListener`

「どの要素の」「どのイベントに」「何をする関数を呼ぶか」を指定します。

```js
const btn = document.querySelector("#btn");

btn.addEventListener("click", () => {
  console.log("クリックされた");
});
```

- 第 1 引数: イベント名（`"click"` / `"submit"` / `"input"` など）
- 第 2 引数: そのイベントが起きたときに呼ばれる関数

### `click` イベント

最もよく使うイベントです。任意の要素に登録できます。

```js
btn.addEventListener("click", () => {
  count = count + 1;
  label.textContent = `カウント: ${count}`;
});
```

下のデモはクリックで `count` を増やし、ラベルを書き換える最小の形です。ボタンを押すと数字が増えるのが確認できます。

<LiveDemo
  height="160px"
  :html="`
<button id='btn'>+1</button>
<span id='label'>カウント: 0</span>
  `"
  :css="`
body { padding: 16px; font-size: 18px; }
button {
  padding: 8px 16px;
  margin-right: 12px;
  font-size: 1rem;
  cursor: pointer;
}
  `"
  :js="demoJs"
/>

### `submit` イベントと `preventDefault`

`<form>` を送信したときに発生するのが `submit` イベントです。

ただし、HTML の `<form>` はデフォルトで「送信するとページがリロード（または別 URL に遷移）する」動きをします。JS で処理したいときはこの既定動作を止める必要があります。

```js
const form = document.querySelector("#form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // ページ遷移を止める
  console.log("送信されました");
});
```

- イベントハンドラの引数 `event` は「今起きたイベントの情報」
- `event.preventDefault()` で「ブラウザの既定動作をキャンセル」

この `preventDefault` は、フォームを JS で扱うときのほぼ定番の呪文です。

### ハンドラの 2 つの書き方

```js
btn.addEventListener("click", () => { ... });         // アロー関数
btn.addEventListener("click", handleClick);           // 関数名を渡す
function handleClick() { ... }
```

どちらでも動きます。短ければアロー関数、再利用するなら関数名を渡す、が目安です。

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson28</title>
    <link rel="stylesheet" href="./style.css" />
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1 id="title">lesson28</h1>
    <p id="box">このボックスのクラスが切り替わります</p>
    <ul id="list">
      <li>既存の項目 1</li>
      <li>既存の項目 2</li>
    </ul>
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
}

#box {
  padding: 12px;
  border: 1px solid #888;
  border-radius: 6px;
}

#box.active {
  background-color: #ffe58f;
  color: #222;
  border-color: #d48806;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #eaeaea;
    background-color: #1a1a1a;
  }

  #box {
    border-color: #aaa;
  }

  #box.active {
    background-color: #5a4600;
    color: #fff;
    border-color: #e6a817;
  }
}
```

**`script.js`**

```js
const title = document.querySelector("#title");
console.log(title.textContent);
title.textContent = "DOM を書き換えました";

const box = document.querySelector("#box");
box.classList.add("active");

const list = document.querySelector("#list");

const items = ["りんご", "みかん", "ぶどう"];
for (const item of items) {
  const li = document.createElement("li");
  li.textContent = item;
  list.appendChild(li);
}

const newLi = document.createElement("li");
newLi.textContent = "最後に追加した項目";
list.appendChild(newLi);
```

</details>

### ゴール

- 「+1」「-1」「リセット」のボタンを持つカウンターアプリを作る
- フォームの `submit` を捕まえ、入力した値を `preventDefault` で遷移させずに画面に表示する

### 手順

1. 3 ファイルを以下の内容にする
2. プレビューでボタンとフォームの挙動を確認する

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson29</title>
    <link rel="stylesheet" href="./style.css" />
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson29: カウンター</h1>

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

### `style.css`

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

### `script.js`

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

### 期待出力

- 「+1」を押すと「カウント: 1」「カウント: 2」... と増える
- 「-1」を押すと減る
- 「リセット」を押すと 0 に戻る
- 名前を入力して「送信」を押すと `（未入力）` が「こんにちは、◯◯ さん」に変わる
- 送信してもページはリロードされない（URL が変わらない、スクロール位置もそのまま）

### 変える

- `preventDefault` の行を **コメントアウト** すると、送信のたびにページが一瞬リロードされることを確認（URL に `?` が付く）。確認できたら戻す
- 「+1」ボタンを 3 回押したあと「リセット」を押して 0 に戻ることを確認
- `incBtn.addEventListener("click", ...)` の `"click"` を `"dblclick"`（ダブルクリック）に変えて、動きの違いを見る

### 自分で書く

- 「×2」ボタンを追加して、押すとカウントが 2 倍になるようにする
- フォームに「年齢」入力欄（`<input id="age-input" type="number">`）を追加し、送信時に「◯◯ さん（◯◯ 歳）」の形で表示する
- カウントが 0 未満になったら `#count-label` に `classList.add("negative")` を付け、CSS で赤色にする（0 以上なら `remove`）

## まとめ

- `要素.addEventListener("click", 関数)` でクリックに反応する
- フォーム送信は `"submit"` イベント、`event.preventDefault()` で既定動作を止める
- カウンターや入力フォームは、DOM 操作とイベントを組み合わせる定番の練習題
- **`preventDefault` は5 章 の「Server Actions の最小形」で登場する Server Actions では、React が自動でやってくれるようになる（コードから消える）**
