# lesson35: DOM を操作する

<script setup>
const demoJs = `
const title = document.querySelector('#title');
const textBtn = document.querySelector('#btn-text');
const classBtn = document.querySelector('#btn-class');
const resetBtn = document.querySelector('#btn-reset');

textBtn.addEventListener('click', () => {
  title.textContent = '書き換えました';
  console.log('textContent を変更');
});

classBtn.addEventListener('click', () => {
  title.classList.toggle('active');
  console.log("classList.toggle('active') でスタイル切り替え");
});

resetBtn.addEventListener('click', () => {
  title.textContent = '最初の見出し';
  title.classList.remove('active');
  console.log('元に戻しました');
});
`
</script>

## ゴール

- HTML が DOM という木構造として扱われることを絵で理解できる
- `querySelector` / `getElementById` で要素を取得し、`textContent` で文字を読み書きできる
- `classList` で CSS クラスを付け外しできる
- `innerHTML` / `getAttribute` / `dataset` / `createElement` など主要な DOM API を必要に応じて使い分けられる

## 解説

### HTML は DOM という「木」になっている

ブラウザは HTML を読み込むと、それを **木構造（ツリー構造）のデータ** として保持します。この内部表現が **DOM**（Document Object Model） です。JS から DOM を操作すると、画面の内容を動的に変えられます。

「木」と呼ばれるのは、タグの入れ子関係が木の枝分かれのように表現されるためです。たとえば次の HTML を見てみましょう。

```html
<html>
  <head>
    <title>自己紹介</title>
  </head>
  <body>
    <h1>こんにちは</h1>
    <ul>
      <li>コーヒー</li>
      <li>散歩</li>
    </ul>
  </body>
</html>
```

これは DOM としては、次のように枝分かれする 1 本の木になります。

<div style="font-family:system-ui, sans-serif; font-size:0.9em; line-height:1.6; background:var(--vp-c-bg-mute); padding:16px 20px; border-radius:6px; margin:12px 0;">
  <div><code>document</code></div>
  <div style="padding-left:18px;">└─ <code>&lt;html&gt;</code></div>
  <div style="padding-left:36px;">├─ <code>&lt;head&gt;</code></div>
  <div style="padding-left:54px;">│&nbsp;&nbsp;└─ <code>&lt;title&gt;</code> ── <span style="color:var(--vp-c-brand-1);">"自己紹介"</span></div>
  <div style="padding-left:36px;">└─ <code>&lt;body&gt;</code></div>
  <div style="padding-left:54px;">&nbsp;&nbsp;&nbsp;├─ <code>&lt;h1&gt;</code> ── <span style="color:var(--vp-c-brand-1);">"こんにちは"</span></div>
  <div style="padding-left:54px;">&nbsp;&nbsp;&nbsp;└─ <code>&lt;ul&gt;</code></div>
  <div style="padding-left:72px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─ <code>&lt;li&gt;</code> ── <span style="color:var(--vp-c-brand-1);">"コーヒー"</span></div>
  <div style="padding-left:72px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ <code>&lt;li&gt;</code> ── <span style="color:var(--vp-c-brand-1);">"散歩"</span></div>
</div>

一番上に `document`（ページ全体を表すオブジェクト）があり、そこから `<html>` 要素が伸び、さらに `<head>` と `<body>` に枝分かれします。それぞれの要素の中身（子要素）も同じようにぶら下がります。

この木を扱うときの呼び方を覚えておくと、あとのコードが読みやすくなります。

- **親**（parent）: 1 段上の要素。`<li>` の親は `<ul>` です。
- **子**（child）: 1 段下の要素。`<ul>` の子は `<li>` が 2 つです。
- **兄弟**（sibling）: 同じ親を持つ隣の要素。2 つの `<li>` は互いに兄弟です。
- **テキストノード**: タグの中身の文字列（例: `"コーヒー"`）。これも木の一部として、タグの下にぶら下がっています。

ブラウザの DevTools の Elements（または「要素」）タブを開くと、まさにこのツリーが左端に展開されて表示されます。手元の Chrome で F12 を押して Elements タブを眺めてみてください。タグをクリックするたびに、ツリーの枝が開いたり閉じたりします。

これまでは Console に出すだけでしたが、本レッスンからは **JS で DOM を書き換えて画面を更新する** 方法を扱います。

### 要素を取得する: `querySelector` / `getElementById` / `querySelectorAll`

DOM から要素を取り出す方法はいくつかあります。用途に応じて使い分けます。

#### `document.querySelector`: CSS セレクタで 1 つ取る

CSS セレクタで **最初に見つかった 1 つ** を取り出します。

```js
const title = document.querySelector("h1");
const box = document.querySelector("#box");
const btn = document.querySelector(".btn");
```

- `"h1"`: 要素セレクタ
- `"#id名"`: id セレクタ
- `".クラス名"`: クラスセレクタ
- 複雑なセレクタもそのまま書けます（例: `"ul.menu > li:first-child"`）

見つからない場合は `null` が返ります。

#### `document.getElementById`: id 専用のショートカット

id で取り出すときの専用 API です。`querySelector("#id名")` と同じ結果になりますが、より短く書けます。

```js
const title = document.getElementById("title");
// 上と同じ: document.querySelector("#title")
```

引数は **`#` を付けない id 名そのもの** です。`querySelector` と違って CSS セレクタではないので、`#` や `.` を書くと動きません。

見つからない場合はこちらも `null` が返ります。実務では、id 指定に限っては `getElementById` を好む人もいれば、`querySelector` で統一する人もいます。どちらでも動きますが、本コースの演習では **id 指定は `getElementById`、それ以外は `querySelector`** を使い分ける書き方で進めます。

#### `document.querySelectorAll`: CSS セレクタで **全部** 取る

同じセレクタに当てはまる要素をまとめて取り出します。戻り値は **NodeList** という配列っぽいオブジェクトで、`forEach` で 1 件ずつ処理できます。

```js
const items = document.querySelectorAll("li");

items.forEach((li) => {
  console.log(li.textContent);
});
```

配列メソッド（`map` / `filter` など）は直接は使えません。使いたい場合は `Array.from(items)` で真の配列に変換してから扱います。

> `<script defer>` を使っていれば、HTML の解析が終わってから JS が動くので、要素がまだ存在せず `null` になる事故を防げます。

### テキストの読み書き: `textContent`

取得した要素の中身のテキストを読み書きします。

```js
const title = document.querySelector("h1");

console.log(title.textContent);    // 元のテキストを読む
title.textContent = "書き換えました"; // 書き換える
```

### HTML ごと読み書きする `innerHTML`

`textContent` は「ただの文字列」として扱いますが、**HTML タグとして解釈しながら** 中身を読み書きしたいときは `innerHTML` を使います。

```js
const box = document.querySelector("#box");

console.log(box.innerHTML);
// 書き込むと HTML として解釈される
box.innerHTML = "<strong>重要</strong> なお知らせ";
```

この例では `<strong>` が **タグとして** 解釈され、画面には太字の「重要」と続く「なお知らせ」が表示されます。

#### `innerHTML` の落とし穴（XSS）

便利ですが、**ユーザー入力をそのまま `innerHTML` に入れるのは絶対に避けてください**。悪意ある HTML（例: `<script>` タグや `onerror` 属性付きの `<img>`）が入ってきた場合、ブラウザがそれを実行してしまい、**Cookie の盗難やなりすまし投稿** などの攻撃（XSS = Cross-Site Scripting）につながります。

```js
// NG: 入力をそのまま埋め込むのは危険
const userInput = getFromUser();   // 例: '<img src=x onerror="alert(1)">'
box.innerHTML = userInput;         // ブラウザがタグとして実行してしまう

// OK: テキストとして埋め込む（タグは無害化される）
box.textContent = userInput;
```

**指針:**

- **ユーザーが入力した値** や **外部 API から来た値** を画面に出すときは、原則 `textContent` を使う
- `innerHTML` は「自分で書いた安全な HTML 文字列」を流し込むときだけ使う
- 迷ったら `textContent`

### クラスの操作: `classList`

CSS クラスを付け外しするための専用 API です。

```js
const box = document.querySelector("#box");

box.classList.add("active");      // クラスを追加
box.classList.remove("active");   // クラスを削除
box.classList.toggle("active");   // あれば消す、なければ付ける
```

CSS 側で `.active { ... }` のスタイルを定義しておけば、JS で `add` / `remove` / `toggle` を呼ぶだけで見た目を切り替えられます。

### 属性の読み書き `getAttribute` / `setAttribute` / `removeAttribute`

HTML タグの **属性**（`href` / `src` / `alt` / `disabled` など）を読み書きします。

```js
const link = document.querySelector("a");

console.log(link.getAttribute("href"));     // 現在の href を読む
link.setAttribute("href", "https://example.com"); // 書き換える
link.removeAttribute("target");             // 属性を消す
```

さらに、よく使う属性はプロパティとしても読み書きできます。たとえば `link.href` / `img.src` / `input.disabled` などです。

```js
const img = document.querySelector("img");
img.src = "/photo.png";
img.alt = "写真";
```

属性名と同じプロパティがあるときは **プロパティ経由（`img.src = ...`）の方が短く書けます**。使い分けは以下を目安にしてください。

- 標準的な HTML 属性 → プロパティ経由で OK（`link.href` / `img.src` / `input.disabled`）
- `data-*` など自作の属性 → `getAttribute` / `setAttribute`、または後述の `dataset`

### フォームの値 `.value` / `.checked`

`<input>` / `<textarea>` / `<select>` の値は `.value` で読み書きします。チェックボックスやラジオの入り切りは `.checked` です。

```js
const nameInput = document.querySelector("#name");
const agreeCheckbox = document.querySelector("#agree");

console.log(nameInput.value);         // 入力欄の現在の文字列
nameInput.value = "初期値";            // 入力欄に値を入れる

console.log(agreeCheckbox.checked);   // true / false
agreeCheckbox.checked = true;         // プログラムからチェックを入れる
```

`<input type="number">` でも `.value` は **文字列** で返ります。数値として扱いたい場合は `Number(nameInput.value)` のように変換します。

### インラインスタイル `element.style`

JS から直接スタイルを当てる場合は `element.style.プロパティ` を使います。CSS のプロパティ名は **キャメルケース** になります（`background-color` → `backgroundColor`）。

```js
const box = document.querySelector("#box");

box.style.backgroundColor = "steelblue";
box.style.color = "white";
box.style.padding = "12px";
```

ただし、**見た目の切り替えは基本的に CSS 側でクラスを用意して `classList.toggle` する方が保守しやすい** です。`element.style` は、CSS では表現しにくい値（マウス位置に応じた座標や、ドラッグ中の一時的な幅など）を JS から直接計算して当てたいときに使うのが定番です。

### データ属性 `dataset`

HTML の `data-*` 属性は、DOM 要素に **任意のデータをぶら下げる** ための標準的な方法です。JS からは `dataset` 経由で読み書きできます。

```html
<button id="delete-btn" data-todo-id="42" data-confirm-required="true">削除</button>
```

```js
const btn = document.querySelector("#delete-btn");

console.log(btn.dataset.todoId);            // "42"
console.log(btn.dataset.confirmRequired);   // "true"

btn.dataset.todoId = "99";                  // 書き換えも可能
```

- `data-todo-id` → `dataset.todoId`（ケバブケース → キャメルケース変換）
- **値は常に文字列** として扱われるため、数値として使いたい場合は `Number(btn.dataset.todoId)` で変換する

ボタンに「どの TODO を削除するのか」といった情報を持たせたいときに便利です。

下のデモでは、ボタンを押すたびに JS が `textContent` を書き換えたり `classList` を切り替えたりします。何度でも押し直せるので、挙動が気になったら「元に戻す」でやり直してください。

<LiveDemo
  height="240px"
  :html="`
<h1 id='title'>最初の見出し</h1>
<p>ボタンを押すと JS が DOM を書き換えます。</p>
<div>
  <button id='btn-text' type='button'>テキストを書き換える</button>
  <button id='btn-class' type='button'>クラスを切り替える</button>
  <button id='btn-reset' type='button'>元に戻す</button>
</div>
  `"
  :css="`
button { margin-right: 6px; padding: 6px 12px; }
#title.active {
  color: white;
  background: steelblue;
  padding: 8px 12px;
  border-radius: 4px;
}
  `"
  :js="demoJs"
/>

### 要素を作って追加 `createElement` / `appendChild`

新しい要素を作って、既存の要素の子として追加します。

```js
const ul = document.querySelector("ul");

const li = document.createElement("li");
li.textContent = "新しい項目";
ul.appendChild(li);
```

手順:

1. `document.createElement("li")` で `<li>` 要素を作る（まだ画面には出ていない）
2. `li.textContent = "..."` で中身のテキストを入れる
3. `ul.appendChild(li)` で実際にページに追加する

この「作る → テキストを入れる → 追加する」の流れは、以降のレッスンで繰り返し使います。

### 要素を削除する `element.remove()`

取得した要素を DOM から消すには、その要素自身の `remove()` を呼びます。

```js
const item = document.querySelector("#old-item");
item.remove();   // DOM ツリーから取り除く
```

昔は `parent.removeChild(child)` という書き方が主流でしたが、現代のブラウザでは **`element.remove()` の方が短く直感的** です。本コースでは `remove()` を使います。

削除された要素はページから消えますが、JS の変数にまだ保持している場合は `appendChild` で再度ツリーに戻すこともできます。ただし、この使い方は混乱しやすいので、削除したら忘れる方が安全です。

### ツリーをたどる `parentElement` / `children` / `nextElementSibling`

最初に紹介した「親 / 子 / 兄弟」の関係は、JS からも辿れます。

```js
const li = document.querySelector("li");

console.log(li.parentElement);          // 親（例: <ul>）
console.log(li.children);               // 子要素（HTMLCollection）
console.log(li.nextElementSibling);     // 次の兄弟
console.log(li.previousElementSibling); // 前の兄弟
```

- **`parentElement`**: 1 段上の要素
- **`children`**: 直接の子要素一覧（`HTMLCollection`。`for...of` では回せますが `forEach` は持たないので、使うなら `Array.from(li.children)` で配列にしてから）
- **`nextElementSibling` / `previousElementSibling`**: 同じ親の隣の要素。末端なら `null`

似た名前で `parentNode` / `childNodes` / `nextSibling` もありますが、こちらはテキストノードや改行ノードまで含むので、**通常はタグだけを対象にする `parentElement` / `children` / `nextElementSibling` を使う** のが無難です。

使いどころの例:

- 「削除」ボタンが押されたら、そのボタンを含む `<li>` ごと消したい → `event.target.parentElement.remove()`
- `<ul>` の中にある全部の `<li>` をループしたい → `ul.children` を `for...of` で回す

## 演習

### 途中から始める場合

これまでのレッスンで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」を貼って揃えてください。本レッスンからは `style.css` も加わります（ファイル作成がまだなら新規作成してください）。

<details>
<summary>出発点のコード</summary>

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
    <h1>DOM を操作する</h1>
    <p>DevTools の Console を確認してください。</p>
  </body>
</html>
```

**`script.js`**

```js
async function main() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const posts = await response.json();
    console.log("取得件数:", posts.length);
    console.log("先頭:", posts[0]);

    for (const post of posts.slice(0, 3)) {
      console.log(`#${post.id} ${post.title}`);
    }
  } catch (error) {
    console.log("エラーが発生しました");
    console.log(error);
  }
}

main();
```

</details>

### ゴール

- ボタンっぽい見た目の要素のクラスを JS で付け替える
- JS から新しい `<li>` 要素を作って `<ul>` に追加する

### 手順

1. `index.html` / `style.css` / `script.js` をそれぞれ以下の内容にする
2. プレビューを確認する

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>サンプル</title>
    <link rel="stylesheet" href="./style.css" />
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1 id="title">練習</h1>
    <p id="box">このボックスのクラスが切り替わります</p>
    <ul id="list">
      <li>既存の項目 1</li>
      <li>既存の項目 2</li>
    </ul>
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

### `script.js`

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

### 期待出力

- 画面の見出し: 「DOM を書き換えました」になっている
- ボックスは背景黄色（または枠色が濃いオレンジ）に変わる
- リストに `既存の項目 1` / `既存の項目 2` / `りんご` / `みかん` / `ぶどう` / `最後に追加した項目` の 6 項目が並ぶ
- Console に元の見出しテキスト「練習」が出る

### 変える

- `box.classList.add("active")` を `box.classList.remove("active")` に変えると、CSS が当たらないことを確認
- `box.classList.toggle("active")` に変える。リロード直後はクラスが無い状態から始まるので、結果は `add` と同じになる（「押すたびに切り替わる」動きは、イベントを学ぶレッスンで確認できる）
- `items` に要素を 2 つ足して、リストが 8 行になることを確認
- `list.appendChild(newLi)` の代わりに、別の場所（例: `document.body.appendChild(newLi)`）に入れるとどうなるか試す
- `document.querySelector("#title")` を `document.getElementById("title")` に書き換え、結果が変わらないことを確認
- `document.querySelectorAll("li")` で全 `<li>` を取り、`forEach` で `console.log` して件数が合うか確認

### 自分で書く

- 新しい段落要素 `<p>` を `createElement` で作り、好きな文章を入れて `document.body.appendChild` で本文末尾に追加する
- `#title` の `textContent` を、JS 側で `const userName = "..."` と定義した名前を含むテンプレートリテラル（`` `ようこそ、${userName} さん` ``）に置き換える
- `<a id="mdn" href="https://example.com">MDN</a>` を `index.html` に足し、JS から `setAttribute("href", "https://developer.mozilla.org/ja/")` で書き換える。リンクをクリックして飛び先が変わることを確認する
- `<li>` の 1 つに `data-fruit="citrus"` を付け、`dataset.fruit` で値を読み取って `console.log` する
- リストの **最初の `<li>`** を `querySelector("li")` で取り、`remove()` で消す。画面から 1 件減ることを確認する

## まとめ

- DOM は HTML の入れ子を表現した木構造。親 / 子 / 兄弟 の関係で要素がつながる
- 取得: `querySelector`（1 件）/ `querySelectorAll`（複数）/ `getElementById`（id 専用）
- テキスト書き換え: `textContent`（安全）。HTML として解釈したい場合だけ `innerHTML`（XSS に注意）
- クラス: `classList.add` / `remove` / `toggle`
- 属性: `getAttribute` / `setAttribute` / `removeAttribute`、標準属性は `element.プロパティ` でも可
- フォーム値: `.value` / `.checked`（`.value` は常に文字列）
- スタイル: 切り替えは CSS + `classList`。動的計算した値を当てるときだけ `element.style.プロパティ`
- データ属性: `data-*` ↔ `dataset.キー`（ケバブ→キャメル変換）
- 生成: `createElement` + `appendChild`、削除: `element.remove()`
- たどる: `parentElement` / `children` / `nextElementSibling`
