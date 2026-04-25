# lesson35: Web Storage で値をブラウザに保存する

<script setup>
const demoJs = `
const input = document.querySelector('#note');
const saveBtn = document.querySelector('#save');
const loadBtn = document.querySelector('#load');
const clearBtn = document.querySelector('#clear');
const output = document.querySelector('#output');

saveBtn.addEventListener('click', () => {
  localStorage.setItem('demo-note', input.value);
  output.textContent = 'localStorage に保存しました: ' + input.value;
});

loadBtn.addEventListener('click', () => {
  const saved = localStorage.getItem('demo-note');
  if (saved === null) {
    output.textContent = '（まだ保存されていません）';
  } else {
    input.value = saved;
    output.textContent = '読み込みました: ' + saved;
  }
});

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('demo-note');
  input.value = '';
  output.textContent = '削除しました';
});
`
</script>

## ゴール

- `localStorage` と `sessionStorage` でブラウザに値を保存・読み出しできる
- 文字列しか保存できないことを理解し、オブジェクトや配列は `JSON.stringify` / `JSON.parse` 経由で扱える
- `localStorage` と `sessionStorage` と Cookie の違いを 1 行で説明できる
- 保存上限と、保存できない場合に備えた `try` / `catch` を書ける

## 解説

### 3 つの保存場所

ブラウザにデータを保存する仕組みはいくつかあります。本レッスンでは最もよく使う **Web Storage** を中心に扱います。

| 仕組み | 保持期間 | 容量の目安 | 送信 | 主な用途 |
|---|---|---|---|---|
| `localStorage` | タブを閉じても残る | 5〜10MB | しない | ユーザー設定、TODO、下書き |
| `sessionStorage` | タブを閉じると消える | 5〜10MB | しない | 1 セッション限定のフォーム一時保存 |
| Cookie | 有効期限次第 | 4KB 程度 | **毎リクエスト自動送信** | 認証、サーバー連携 |

Cookie は **サーバーへ毎回自動で送られる** ため、セッション ID のようにサーバー側で読む必要がある値に使います。クライアント側だけで完結する保存は `localStorage` / `sessionStorage` が基本です。

### `localStorage` の使い方

API は 3 つ覚えれば十分です。

```js
// 保存
localStorage.setItem("theme", "dark");

// 読み出し
const theme = localStorage.getItem("theme");
console.log(theme); // "dark"

// 削除
localStorage.removeItem("theme");

// 全部消す（同一オリジン内のすべての値）
localStorage.clear();
```

- キーも値も **文字列** です（後述）
- 存在しないキーを `getItem` すると **`null`** が返ります
- 同じキーで `setItem` すると上書きされます

### `sessionStorage` も API は同じ

`localStorage` と全く同じ API を持ちますが、**タブを閉じると消える** 点だけが違います。

```js
sessionStorage.setItem("step", "2");
sessionStorage.getItem("step"); // "2"
```

「タブを開いている間だけ保持したい」値（たとえば複数ページにまたがるウィザードの入力中データ）に向きます。ユーザー設定や TODO のように **次回訪問時も残したい** 値は `localStorage` を選びます。

### 文字列しか保存できない

Web Storage は **文字列だけ** を扱います。数値や真偽値を入れると、読み出したときには文字列に変わっています。

```js
localStorage.setItem("count", 5);
localStorage.setItem("isOpen", true);

console.log(localStorage.getItem("count"));  // "5"  ← 文字列
console.log(localStorage.getItem("isOpen")); // "true" ← 文字列
```

数値として使いたい場合は `Number(...)`、真偽値は `value === "true"` のように自分で変換します。

### オブジェクトや配列は JSON でくるむ

配列やオブジェクトはそのまま入れても文字列化（`"[object Object]"` など）されてしまい、中身が失われます。**`JSON.stringify` / `JSON.parse` とセット** で使います。

```js
const todos = [
  { id: 1, text: "牛乳を買う", done: false },
  { id: 2, text: "本を返す", done: true },
];

// 保存するときは文字列化
localStorage.setItem("todos", JSON.stringify(todos));

// 読み出すときは元の型に戻す
const saved = localStorage.getItem("todos");
const loaded = saved === null ? [] : JSON.parse(saved);

console.log(loaded[0].text); // "牛乳を買う"
```

このパターンは TODO アプリや下書き保存などで頻繁に登場します。「JSON を読み書きする」と「try / catch でエラー処理」で扱った内容をそのまま使います。

### 失敗しうる場所

Web Storage は **必ず成功する API ではありません**。次のケースで例外が飛ぶことがあります。

1. **容量オーバー**: 上限を超えた `setItem` は `QuotaExceededError` で失敗します
2. **プライベートブラウジング**: ブラウザによっては Web Storage が実質無効化され、`setItem` が失敗します
3. **壊れた JSON**: 保存時と読み出し時で形が違うと `JSON.parse` が例外を投げます

安全に書くなら `try` / `catch` でくるみ、失敗時は既定値で乗り切ります。

```js
function loadTodos() {
  try {
    const saved = localStorage.getItem("todos");
    if (saved === null) return [];
    return JSON.parse(saved);
  } catch {
    // 壊れていたら捨てて空で始める
    return [];
  }
}

function saveTodos(todos) {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch {
    // 容量オーバー等。今回は何もしない
  }
}
```

### Cookie はクライアントから直接扱わないのが主流

`document.cookie` という API で読み書きもできますが、**文字列連結と `;` 区切り** で扱う古い API で、実務では以下のいずれかで間接的に触ることが多いです。

- ログイン認証などのセッション Cookie は、サーバーが `Set-Cookie` ヘッダで返すものを使う（クライアントでは触らない）
- クライアントから操作する必要があれば、`js-cookie` のような小さなライブラリを使う

本コースでは **クライアント側の保存は `localStorage` / `sessionStorage`** に統一します。Cookie は「サーバーとやり取りする値が自動で送られる仕組み」としてだけ覚えておけば十分です。

### 小さなデモ

下のデモは `localStorage` の超最小例です。何か書いて「保存」を押し、ブラウザのタブを閉じて開き直しても、「読み込み」で復元できます。

<LiveDemo
  height="220px"
  :html="`
<input id='note' type='text' placeholder='メモを入力' />
<div>
  <button id='save' type='button'>保存</button>
  <button id='load' type='button'>読み込み</button>
  <button id='clear' type='button'>削除</button>
</div>
<p id='output'></p>
  `"
  :css="`
input { padding: 6px 10px; width: 240px; }
button { margin-right: 6px; padding: 6px 12px; }
#output { color: #1f4e79; }
  `"
  :js="demoJs"
/>

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
    <title>lesson35</title>
    <link rel="stylesheet" href="./style.css" />
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>下書きメモ</h1>
    <textarea id="memo" rows="6" cols="40" placeholder="ここに入力"></textarea>
    <div>
      <button id="clear" type="button">削除</button>
      <span id="status"></span>
    </div>
  </body>
</html>
```

**`style.css`**

```css
body { font-family: sans-serif; padding: 16px; color: #222; background: #fff; }
textarea { display: block; padding: 8px; font-family: inherit; }
button { margin-top: 8px; padding: 6px 12px; }
#status { margin-left: 12px; color: #1f4e79; }

@media (prefers-color-scheme: dark) {
  body { color: #eaeaea; background: #1a1a1a; }
  textarea { color: #eaeaea; background: #2a2a2a; border: 1px solid #555; }
  #status { color: #9ecbff; }
}
```

**`script.js`**

```js
// 空のまま
```

</details>

### ゴール

- ページを開いたときに、前回の入力内容が復元される
- 入力するたびに自動で `localStorage` に保存される
- 「削除」ボタンで保存内容を消せる

### 手順

1. `script.js` を以下の内容にします。
2. プレビューでテキストエリアに何か書き、タブを閉じて開き直します。
3. 書いた内容が復元されることを確認します。

### `script.js` の完成形

```js
const STORAGE_KEY = "memo-draft";

const memo = document.querySelector("#memo");
const clearBtn = document.querySelector("#clear");
const status = document.querySelector("#status");

function showStatus(text) {
  status.textContent = text;
  setTimeout(() => {
    status.textContent = "";
  }, 1500);
}

function loadMemo() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      memo.value = saved;
    }
  } catch {
    // 読み込み不可 → 何もしない
  }
}

function saveMemo() {
  try {
    localStorage.setItem(STORAGE_KEY, memo.value);
    showStatus("保存しました");
  } catch {
    showStatus("保存に失敗しました");
  }
}

function clearMemo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    memo.value = "";
    showStatus("削除しました");
  } catch {
    showStatus("削除に失敗しました");
  }
}

loadMemo();
memo.addEventListener("input", saveMemo);
clearBtn.addEventListener("click", clearMemo);
```

### 期待出力

- 画面を開くと、前回入力した内容がテキストエリアに復元される
- テキストエリアに入力するたびに「保存しました」が短く出る
- 「削除」ボタンを押すと中身が空になり、「削除しました」が出る
- タブを閉じて開き直しても、削除後は空のまま開く
- DevTools の Application タブ → Local Storage で、`memo-draft` キーの値が変化する様子を確認できる

### 変える

- `localStorage.setItem` を `sessionStorage.setItem` に書き換えて、タブを閉じると値が消える挙動になることを確認
- `STORAGE_KEY` を別の文字列（例: `"memo-v2"`）に変えて、以前の値と共存する（キーが違うと別物として扱われる）ことを確認
- `saveMemo` 内の `localStorage.setItem` をあえて `localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: memo.value, at: Date.now() }))` にして、読み出し側を `JSON.parse` 前提に書き換える。オブジェクトとしての保存パターンを体験する

### 自分で書く

- 入力された内容が **10000 文字を超えたら** `showStatus("長すぎます")` を出して保存しない、という制限を加える。ヒント: `if (memo.value.length > 10000)` で分岐
- ページに「テーマ切替」の `<button>` を足し、クリックするたびに `<body>` に `dark` クラスを付け外しする。付いているかどうかを `localStorage` に保存し、次回訪問時に復元する（「DOM を操作する」の `classList.toggle` と組み合わせ）

## まとめ

- ブラウザ内保存は `localStorage`（残る）/ `sessionStorage`（タブを閉じると消える）/ Cookie（サーバー送信あり）
- Web Storage は **文字列しか保存できない**。オブジェクトや配列は `JSON.stringify` / `JSON.parse` とセット
- 3 つの基本 API: `setItem` / `getItem`（未保存は `null`）/ `removeItem`
- 失敗するケース（容量オーバー、プライベートブラウジング、壊れた JSON）を `try` / `catch` で吸収する
- Cookie は実務ではサーバー側が管理するのが主流。クライアントで扱う保存は Web Storage が基本
- 別のレッスンで、URL と History API を使って「ページ内状態を URL にも反映する」方法を学ぶ
