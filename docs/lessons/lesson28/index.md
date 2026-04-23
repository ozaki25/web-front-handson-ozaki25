# lesson28: DOM を操作する

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

- HTML が DOM という木構造（ツリー）として扱われることを絵で理解できる
- `document.querySelector` で HTML の要素を取得できる
- `textContent` で中身のテキストを読み書きできる
- `classList` で CSS クラスを付け外しできる
- `createElement` と `appendChild` で要素を JS から作って追加できる

## 解説

### HTML は DOM という「木」になっている

ブラウザは HTML を読み込むと、それを **木構造（ツリー構造）のデータ** として保持します。この内部表現が **DOM（Document Object Model）** です。JS から DOM を操作すると、画面の内容を動的に変えられます。

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

これまでは Console に出すだけでしたが、本レッスンからは **この木に JS で手を入れて、画面を書き換える** 世界に入ります。

### 要素を取得する: `document.querySelector`

CSS セレクタで要素を 1 つ取り出します。

```js
const title = document.querySelector("h1");
const box = document.querySelector("#box");
const btn = document.querySelector(".btn");
```

- `"h1"`: 要素セレクタ
- `"#id名"`: id セレクタ
- `".クラス名"`: クラスセレクタ

見つからない場合は `null` が返ります。

> `<script defer>` を使っていれば、HTML の解析が終わってから JS が動くので、要素がまだ存在せず `null` になる事故を防げます。

### テキストの読み書き: `textContent`

取得した要素の中身のテキストを読み書きします。

```js
const title = document.querySelector("h1");

console.log(title.textContent);    // 元のテキストを読む
title.textContent = "書き換えました"; // 書き換える
```

### クラスの操作: `classList`

CSS クラスを付け外しするための専用 API です。

```js
const box = document.querySelector("#box");

box.classList.add("active");      // クラスを追加
box.classList.remove("active");   // クラスを削除
box.classList.toggle("active");   // あれば消す、なければ付ける
```

CSS 側で `.active { ... }` のスタイルを定義しておけば、JS で `add` / `remove` / `toggle` を呼ぶだけで見た目を切り替えられます。

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

### 要素を作って追加: `createElement` / `appendChild`

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

この「作る → テキストを入れる → 追加する」の流れは、次のレッスン以降で繰り返し使います。

## 演習

### 途中から始める場合

前のレッスンまでで作ったファイルがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、下の「出発点のコード」を貼って揃えてください。本レッスンからは `style.css` も加わります（ファイル作成がまだなら新規作成してください）。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson27</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson27: fetch で API から取得する</h1>
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
- Console に元のタイトル「lesson28」が出る

### 変える

- `box.classList.add("active")` を `box.classList.remove("active")` に変えると、CSS が当たらないことを確認
- `box.classList.toggle("active")` に変えて、実行のたびに切り替わる動きを想像する（次レッスンでクリックに結び付ける）
- `items` に要素を 2 つ足して、リストが 8 行になることを確認
- `list.appendChild(newLi)` の代わりに、別の場所（例: `document.body.appendChild(newLi)`）に入れるとどうなるか試す

### 自分で書く

- 新しい段落要素 `<p>` を `createElement` で作り、好きな文章を入れて `document.body.appendChild` で本文末尾に追加する
- `#title` の `textContent` を、JS 側で `const userName = "..."` と定義した名前を含むテンプレートリテラル（`` `ようこそ、${userName} さん` ``）に置き換える

## まとめ

- `document.querySelector` は CSS セレクタで要素を 1 つ取る（見つからないと `null`）
- `textContent` でテキストの読み書き
- `classList.add` / `remove` / `toggle` でクラスの付け外し
- `createElement` で要素を作り、`appendChild` で親に追加
- 次レッスンで「クリックしたら〜」のイベントと組み合わせて、動きのある画面を作る
