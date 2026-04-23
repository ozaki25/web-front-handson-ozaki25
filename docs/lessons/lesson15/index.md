# lesson15: 最初の JavaScript

<script setup>
const demoJs = `
console.log('Hello, JavaScript');
console.log('2 + 3 は', 2 + 3);
`
</script>

## ゴール

- HTML に外部 JavaScript ファイルを読み込める
- `console.log` で値を出力できる
- `let` と `const` で変数を宣言できる
- DevTools の Console パネルでログを確認できる
- `<script defer>` を「外部 JS を読み込む標準の書き方」として身につける

## 解説

### JavaScript はブラウザの中で動く

1 章 で書いてきた HTML と CSS は「何を置くか」と「どう見せるか」を担当します。ここから学ぶ JavaScript（以降 JS）は「動きをつける」担当です。ボタンを押したら何かが起きる、入力した内容に応じて画面が変わる、といった処理はすべて JS が担当します。

JS は基本的にブラウザの中で動くプログラミング言語です。HTML に JS を読み込ませると、ページを開いたときにブラウザが JS を実行してくれます。

### JS を HTML に読み込む方法

今回から、JS は `script.js` という別ファイルに書いて、HTML から読み込む形にします。HTML に直接書くより読みやすく、後で管理しやすくなります。

読み込むタグは `<script>` です。本コースでは以下の形に固定します。

```html
<script defer src="./script.js"></script>
```

`defer` 属性を付けると、ブラウザは「HTML をすべて読み終えてから JS を実行する」という順序で動いてくれます。これを徹底しておくと、後のレッスンで `document.querySelector(...)` が `null` を返す事故（HTML より先に JS が走り、まだ存在しない要素を探してしまう）を防げます。

### なぜ `defer` か（コラム）

`<script>` の書き方には昔からいくつかの流派があります。

- `<head>` の中に `<script src="...">` だけ書く → HTML の解析が止まって遅くなる
- `<body>` の末尾に `<script src="...">` を書く → 動くが、書く場所が散らばる
- `<head>` の中に `<script defer src="...">` を書く → HTML の解析を止めず、解析完了後に実行される

3 つ目の書き方が現在の推奨です。HTML が完成してから JS が動くため、DOM を探しに行く処理（「DOM を操作する」以降）でも安心して使えます。本コースではこの形だけを使います。

### `console.log` と DevTools の Console

`console.log(...)` は「この値をログに出す」命令です。ブラウザの DevTools にある「Console」パネルを開くと、そこにログが表示されます。画面には出ませんが、開発中の確認に最も使う命令です。

DevTools の開き方は1 章 で学んだ Elements パネルと同じで、右クリック → 「検証」、または `F12` キーです。Elements の隣に Console タブがあります。

下のデモは JS が実際に動いている最小例です。`console.log` の結果がページ下部の黒い領域に表示されます（本物の DevTools Console と同じ内容）。

<LiveDemo
  height="200px"
  :html="`<p>JS からの出力は下の黒い領域に出ます。</p>`"
  :css="``"
  :js="demoJs"
/>

### `let` と `const`

値に名前をつけておくしくみを変数と呼びます。JS では 2 つのキーワードを使い分けます。

- `const`: 後から値を書き換えない変数。迷ったらまずこちら
- `let`: 後から値を書き換える可能性がある変数

古い教材では `var` も出てきますが、本コースでは使いません。

```js
const userName = "Alice";
let count = 0;
count = count + 1;
```

`const` で宣言した変数に別の値を代入しようとすると、エラーになります。これは「うっかり書き換え」を防いでくれる仕組みです。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）から始められます。前のレッスンのコードは引き継ぎません。

### ゴール

- `script.js` を作り、自分の名前を変数に入れてコンソールに表示する

### 手順

1. StackBlitz の Vanilla（HTML + CSS + JS）テンプレートを開く
2. `index.html` を以下の内容にする
3. `script.js` を以下の内容にする
4. プレビューを開き、DevTools の Console を開く

### `index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lesson15</title>
    <script defer src="./script.js"></script>
  </head>
  <body>
    <h1>lesson15: 最初の JavaScript</h1>
    <p>DevTools の Console を開いてください。</p>
  </body>
</html>
```

### `script.js`

```js
const userName = "Alice";
let count = 0;

console.log("Hello, JavaScript");
console.log(name);
console.log(count);

count = count + 1;
console.log(count);
```

### 期待出力

DevTools の Console に、上から順に次のように表示されます。

```
Hello, JavaScript
Alice
0
1
```

画面には何も追加で表示されません（JS は Console にだけ書き出しています）。

### 変える

- `userName` の中身を自分の名前に書き換える → Console の 2 行目が変わる
- `count = count + 1;` の下にもう 1 行 `count = count + 1;` を足して `console.log(count);` を追加 → `2` が表示される
- `const` で宣言した `userName` に別の値を代入する行を追加（例: `userName = "Bob";`）→ Console に赤字でエラーが出ることを確認（下記の注意を参照）

**`const` への再代入を試したときの挙動について**: 再代入の行を加えると、スクリプト全体の実行が **途中で止まる** ことがある。最初の `console.log("Hello, JavaScript")` までしか出ず、その下の `console.log(userName)` などが出ないケースもある。これは環境によって「実行中のエラー」ではなく「パース段階でのエラー」扱いになるため。動作が変だと感じたら、足した 1 行を削除して元に戻せばよい。

**変数名に `name` を使わない理由**: 今回は `userName` を使っている。ブラウザの `window` には組み込みで `window.name` というプロパティがあり、`const name = ...` を書くと環境によって衝突して予想外の挙動になる。他人のコードで `name` を見たときはこの落とし穴を思い出すとよい。

### 自分で書く

- `const age = 20;` のような行を追加し、`console.log(age);` で値を表示する
- `let message = "こんにちは";` と書き、後から `message = "さようなら";` に書き換えて 2 回 `console.log(message)` する

## まとめ

- 外部 JS は `<head>` に `<script defer src="...">` で読み込む
- `console.log(...)` は DevTools の Console にログを出す
- 変数は `const`（書き換え不可）を基本にし、必要なときだけ `let` を使う
- `<script defer>` は以降すべてのレッスンで標準形として使い続ける
