# lesson38: URL と History API でページ遷移なしに URL を操作する

<script setup>
const demoUrlJs = `
const urlInput = document.querySelector('#url-input');
const parseBtn = document.querySelector('#parse-btn');
const output = document.querySelector('#output');

parseBtn.addEventListener('click', () => {
  try {
    const url = new URL(urlInput.value);
    const params = [];
    url.searchParams.forEach((value, key) => {
      params.push(\`    \${key}: \${value}\`);
    });
    output.textContent = [
      'origin:   ' + url.origin,
      'pathname: ' + url.pathname,
      'search:   ' + url.search,
      'hash:     ' + url.hash,
      'searchParams:',
      params.length === 0 ? '    （なし）' : params.join('\\n'),
    ].join('\\n');
  } catch (error) {
    output.textContent = 'URL として解釈できませんでした: ' + error.message;
  }
});
`
</script>

## ゴール

- `URL` オブジェクトで URL を組み立て・分解できる
- `URLSearchParams` でクエリ文字列を安全に扱える
- `history.pushState` / `history.replaceState` でページ遷移なしに URL を書き換えられる
- `popstate` イベントでブラウザの戻る / 進むに反応できる
- SPA（Single Page Application）が「URL だけ変えて画面は同じ JS で描く」仕組みの下地を説明できる

## 解説

### URL はただの文字列ではない

URL は文字列に見えますが、実際には **複数のパーツの集まり** です。素の文字列として連結・分解すると、エスケープ漏れや `?` と `&` の並び順ミスなどで簡単にバグります。モダン JS には専用の **`URL`** オブジェクトがあります。

```js
const url = new URL("https://example.com/articles/42?tag=css&sort=new#comments");

console.log(url.origin);     // "https://example.com"
console.log(url.pathname);   // "/articles/42"
console.log(url.search);     // "?tag=css&sort=new"
console.log(url.hash);       // "#comments"
console.log(url.searchParams.get("tag")); // "css"
```

パーツの一覧:

| プロパティ | 取れるもの | 例 |
|---|---|---|
| `origin` | プロトコル + ホスト | `"https://example.com"` |
| `pathname` | パス部分 | `"/articles/42"` |
| `search` | `?` から始まるクエリ文字列 | `"?tag=css&sort=new"` |
| `searchParams` | クエリを扱う `URLSearchParams` | （後述） |
| `hash` | `#` から始まるアンカー | `"#comments"` |
| `host` | ホスト + ポート | `"example.com"` |

### 現在のページの URL を取る: `location`

今開いているページの URL は `window.location` から取れます。`location.href` を `URL` に渡せば、現在のページも同じ方法で解析できます。

```js
console.log(location.href);         // 現在の完全な URL
console.log(location.pathname);     // 現在のパス
console.log(location.search);       // 現在のクエリ

const current = new URL(location.href);
console.log(current.searchParams.get("q")); // クエリの "q" を読む
```

### クエリ文字列を扱う: `URLSearchParams`

`?key=value&key2=value2` 形式のクエリを手で `split("&")` するのは、エスケープ処理が面倒で壊れやすいパターンの代表です。`URLSearchParams` を使えば安全です。

```js
const params = new URLSearchParams(location.search);

console.log(params.get("q"));         // "react"
console.log(params.has("page"));      // true / false
console.log(params.getAll("tag"));    // 同じキーが複数あるとき、配列で全部取れる

params.set("page", "2");              // 値を上書き
params.append("tag", "ssr");          // 同じキーで複数値を追加
params.delete("sort");                // キーごと削除

console.log(params.toString());       // "q=react&page=2&tag=css&tag=ssr"
```

空から組み立てることもできます。

```js
const params = new URLSearchParams();
params.set("q", "日本語 OK");         // エンコードは自動（%E6%97%A5%... になる）
params.set("limit", "10");

const url = "https://example.com/search?" + params.toString();
```

`URLSearchParams` が自動で URL エンコード（スペースを `%20`、日本語を `%E3%81%82...` 等に変換）してくれるので、自分で `encodeURIComponent` を呼ぶ必要はありません。

### `URL` と `URLSearchParams` を組み合わせる

`URL` オブジェクトの `searchParams` は `URLSearchParams` そのものなので、両方を行き来できます。

```js
const url = new URL("https://example.com/search");

url.searchParams.set("q", "react");
url.searchParams.set("page", "2");

console.log(url.toString());
// "https://example.com/search?q=react&page=2"
```

フォーム送信先の URL を動的に組み立てたり、`fetch` のエンドポイントにクエリを付けたりするときの定番です。

### URL を解析する小さなデモ

下のデモは URL を貼り付けると各パーツに分解します。`origin` / `pathname` / `search` / `hash` と、`searchParams` の中身を一覧で確認できます。

<LiveDemo
  height="320px"
  :html="`
<input id='url-input' type='text' value='https://example.com/search?q=react&tag=css&tag=ssr#comments' style='width: 100%;' />
<div>
  <button id='parse-btn' type='button'>分解する</button>
</div>
<pre id='output' style='background:#f1f5f9; padding:12px; border-radius:4px; white-space:pre-wrap; color:#1f2937;'></pre>
  `"
  :css="`
body { padding: 16px; }
input { padding: 6px 10px; font-family: monospace; }
button { margin-top: 8px; padding: 6px 12px; }
  `"
  :js="demoUrlJs"
/>

### History API で URL を書き換える

`URL` は「文字列としての URL」を扱う道具でした。**ブラウザが今表示している URL そのものを書き換える** には、`history` オブジェクトを使います。

```js
// URL を書き換える（履歴に追加される）
history.pushState(null, "", "/articles/42?highlight=true");

// URL を書き換える（履歴は追加しない。現在のエントリを差し替え）
history.replaceState(null, "", "/articles/42");
```

重要なのは、`pushState` / `replaceState` を呼んでも **ページは再読み込みされない** 点です。アドレスバーの URL は変わりますが、JS の状態や DOM はそのままです。これが SPA（ページ遷移せずに画面を切り替える作り）の核になっています。

第 2 引数は昔のブラウザで使われた title で、**現代では無視されます**。空文字 `""` を渡しておけば十分です。

### 戻る / 進むに反応する: `popstate`

ユーザーがブラウザの戻るボタンや進むボタンを押すと **`popstate`** イベントが飛びます。ここで URL を見て、画面の中身を描き直します。

```js
window.addEventListener("popstate", () => {
  const url = new URL(location.href);
  const id = url.searchParams.get("id");
  // id に合わせて画面の内容を書き換える
  render(id);
});
```

`pushState` で「進んだ」履歴を、ユーザーが戻るボタンで戻ったときに `popstate` が発火する、という流れです。`pushState` を呼んだ **直後には** `popstate` は発火しない点に注意してください。

### 定番の組み合わせ: URL に状態を同期する

モーダルの開閉、検索条件、並び順、選択中のタブなど、**ユーザーが URL を共有したときに同じ画面を復元したい状態** は URL にも反映しておくのが定番です。

```js
function applyFilter(filter) {
  // 画面を書き換える
  renderList(filter);

  // URL にも反映（履歴に残したい）
  const url = new URL(location.href);
  url.searchParams.set("filter", filter);
  history.pushState(null, "", url);
}

window.addEventListener("popstate", () => {
  const current = new URL(location.href).searchParams.get("filter") ?? "all";
  renderList(current);
});
```

Next.js の App Router のような SPA フレームワークは、内部でこの `pushState` + `popstate` を使って「同じ HTML で URL を切り替える」挙動を実現しています。本レッスンで仕組みを押さえておくと、5 章 の Next.js ルーティングが驚かずに読めるようになります。

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
    <title>lesson38</title>
    <link rel="stylesheet" href="./style.css" />
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>フィルタとページ</h1>
    <div id="controls">
      <button type="button" data-filter="all">すべて</button>
      <button type="button" data-filter="open">未完了</button>
      <button type="button" data-filter="done">完了</button>
    </div>
    <p>現在のフィルタ: <span id="current">all</span></p>
    <p>現在の URL: <span id="current-url"></span></p>
  </body>
</html>
```

**`style.css`**

```css
body { font-family: sans-serif; padding: 16px; color: #222; background: #fff; }
button { padding: 6px 12px; margin-right: 6px; }
button.active { background: #1f4e79; color: #fff; border-color: #1f4e79; }
#current, #current-url { font-weight: bold; color: #1f4e79; }

@media (prefers-color-scheme: dark) {
  body { color: #eaeaea; background: #1a1a1a; }
  button { color: #eaeaea; background: #2a2a2a; border: 1px solid #555; }
  button.active { background: #9ecbff; color: #1a1a1a; border-color: #9ecbff; }
  #current, #current-url { color: #9ecbff; }
}
```

**`script.js`**

```js
// 空のまま
```

</details>

### ゴール

- 「すべて / 未完了 / 完了」ボタンを押すと、URL のクエリが `?filter=all` / `?filter=open` / `?filter=done` に切り替わる
- 切り替えはページ再読み込みなしで行われる
- 戻る / 進むボタンで、前後のフィルタ状態に戻る
- URL を直接貼り付けて開いた場合も、URL のクエリに合わせてボタンの見た目が変わる

### 手順

1. `script.js` を以下の内容にします。
2. プレビューでボタンを順にクリックし、アドレスバーのクエリが変わるのを確認します。
3. 戻るボタンで前のフィルタに戻ることを確認します。
4. URL を `?filter=done` 付きで開き直し、「完了」ボタンがハイライトされることを確認します。

### `script.js` の完成形

```js
const controls = document.querySelector("#controls");
const currentLabel = document.querySelector("#current");
const currentUrlLabel = document.querySelector("#current-url");

function applyFilterFromUrl() {
  const url = new URL(location.href);
  const filter = url.searchParams.get("filter") ?? "all";

  currentLabel.textContent = filter;
  currentUrlLabel.textContent = location.href;

  const buttons = controls.querySelectorAll("button");
  buttons.forEach((btn) => {
    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

controls.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (btn === null) return;

  const filter = btn.dataset.filter;

  const url = new URL(location.href);
  url.searchParams.set("filter", filter);
  history.pushState(null, "", url);

  applyFilterFromUrl();
});

window.addEventListener("popstate", () => {
  applyFilterFromUrl();
});

applyFilterFromUrl();
```

### 期待出力

- 起動直後、URL は `?filter=...` を含まないが、表示は `all` で「すべて」ボタンがハイライト
- 「未完了」を押すと、URL が `?filter=open` に変わり、ハイライトが「未完了」に移る。画面は再読み込みされない
- 「完了」を押すと、URL が `?filter=done` に。戻るボタンで `?filter=open`、もう一度戻って初期状態に戻る
- 現在の URL を別のタブで開き直すと、該当のフィルタが最初からハイライトされた状態で開く

### 変える

- `history.pushState` を `history.replaceState` に書き換えて、戻るボタンでフィルタが戻らなくなることを確認。使い分けは「履歴に残したいか否か」
- `url.searchParams.set("filter", filter)` の代わりに `url.hash = filter` にしてみる。アドレスバーが `#done` 形式になり、挙動が似て非なるものになることを確認（`hash` は `popstate` ではなく `hashchange` イベントで拾うのが本筋）
- `url.searchParams.set(...)` を 2 回呼び、`"filter"` と `"sort"` を両方操作する。2 つのクエリが共存すること、片方だけ変えても他方が残ることを確認

### 自分で書く

- `controls` の下に `<input id="search" type="text" placeholder="検索語">` を追加し、入力のたびに `?q=入力値` を URL に反映する。ヒント: `addEventListener("input", ...)` + `history.replaceState`（毎文字で履歴に残さない方が UX が良い）
- 現在の `filter` と `q` を合わせて「状態を URL から読む / 書く」関数を 1 つにまとめる（`readState()` と `writeState({ filter, q })` の 2 つに分解）

## まとめ

- URL は `URL` オブジェクトで分解・組み立てする。`origin` / `pathname` / `search` / `searchParams` / `hash`
- クエリ文字列は `URLSearchParams` で扱い、エンコードは自動
- `history.pushState(null, "", newUrl)` で **ページ再読み込みなし** に URL を書き換えられる。履歴に残したくないときは `replaceState`
- ユーザーの戻る / 進むは `popstate` で検知し、URL から状態を読み直して画面を描き直す
- この「URL と画面を同期させる」仕組みが SPA の基礎。5 章 の Next.js ルーティングもこの延長線上にある
