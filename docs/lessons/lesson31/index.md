# lesson31: 非同期処理の基本

<script setup>
const demoJs = `
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const log = document.getElementById('log');
const btn = document.getElementById('run');

async function main() {
  log.textContent = '';
  btn.disabled = true;
  log.textContent += 'start\\n';
  await wait(1000);
  log.textContent += '1 秒後\\n';
  await wait(1000);
  log.textContent += 'さらに 1 秒後（計 2 秒）\\n';
  log.textContent += 'end\\n';
  btn.disabled = false;
}

btn.addEventListener('click', main);
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

### Promise（あとで結果が届く箱）

非同期な処理は、呼んだ瞬間にはまだ結果が決まっていません。`fetch` でサーバーの返事を待つ、`wait(ms)` で 1 秒経つのを待つ、どちらも「呼び出した時点ではまだ何も起きていない」状態です。

そこで JS は、結果そのものではなく **「あとで結果が届く箱」** を返す仕組みを使います。これが **Promise**（プロミス） です。

```
非同期な関数を呼ぶ
   ↓ 即座に
Promise（中身は空）
   ↓ 後述の await で待つ
実際の結果
```

押さえるルールは 2 つだけです。

- Promise を返す関数を見つけたら、`await` を付けて結果を待つ
- `await` を使えるのは `async` を付けた関数の中だけ

本コースでは Promise を **作る** 書き方（`.then` や `new Promise(...)`）は扱いません。**Promise を返す関数を `await` で待つ**、使う側だけ覚えれば十分です。本レッスンで Promise を返すのは、次の節の `wait(ms)` 関数だけです。

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

- `async function` は「中で `await` を使える関数」、**常に Promise を返す**
- `await Promise` は「その Promise の結果が返るまで待つ」
- `await` で止まっているのは **その `async` 関数の中だけ**。ブラウザ全体や他の処理は止まらない
- `await` は `async function` の中でしか使えない

### `wait(ms)` 関数（コピペで使う）

「○ミリ秒待つ」という Promise を作る関数を、以下のままコピペで使います。中身は今は気にしなくてよいです（`setTimeout` を Promise で包んでいる、とだけ覚える）。

```js
// ms ミリ秒後に完了する Promise を返す
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

この `wait` は「`ms` ミリ秒後に完了する Promise」を返します。呼び出し側は `await wait(1000)` のように書くだけで、1 秒待つ動きになります。

下のデモで **「main() を実行」** を押すと、`start` が即出て、1 秒後・2 秒後にログが追加されていきます。`await` が「ここで待つ」と動いているのが時間差として見えます。

<!-- textlint-disable ja-technical-writing/sentence-length -->

<LiveDemo
  height="280px"
  :html="`
<button id='run' type='button'>main() を実行</button>
<pre id='log' aria-live='polite'></pre>
  `"
  :css="`
button { padding: 6px 12px; font-size: 1rem; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
pre { background: #f5f5f5; color: #222; padding: 12px; min-height: 6em; border-radius: 4px; margin-top: 8px; font-family: ui-monospace, monospace; }
@media (prefers-color-scheme: dark) {
  pre { background: #2a2a2a; color: #eaeaea; }
}
  `"
  :js="demoJs"
/>

<!-- textlint-enable ja-technical-writing/sentence-length -->

`wait(ms)` 以外にも、ネット越しにデータを取りに行く `fetch` のように **戻り値が Promise** の関数はたくさんあります。「Promise が返ってくる関数を見たら `await` で待つ」と覚えておけば、新しい関数に出会っても迷いません。なお Promise を返す処理は途中で失敗することもあります（ネット切断、URL の typo など）。失敗を受け止めるには `try` / `catch` を使います。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。これまでのレッスンのファイルは使いません。新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/html>）を開き、`script.js` を下記の内容に書き換えてください。`index.html` は最初から `<script defer src="./script.js">` を読み込んでいるテンプレートそのままで構いません。

### ゴール

- `wait` 関数をコピペで用意し、1 秒ごとにメッセージを表示するプログラムを作る

### 手順

1. `script.js` を以下の内容に書き換える（`wait` の中身は書き換えない）
2. プレビューを開いて、ブラウザの DevTools（Console タブ）を表示する
3. ログが順に出てくる様子を確認する

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

Console に以下の順で表示されます。タイミングに注目してください。

| 経過時間 | 出力 |
|---|---|
| 即時 | `start` |
| 即時（`start` に続けて） | `main を呼んだ後のコード` |
| 約 1 秒後 | `1 秒経過` |
| 約 2 秒後 | `2 秒経過` |
| 約 3 秒後 | `3 秒経過` |
| 続けて即時 | `end` |

ポイント:

- `async function` は **最初の `await` までは同期的に走る**。だから `console.log("start")` はすぐ出る
- `await wait(1000)` で `main` の実行が一旦止まり、呼び出し元に制御が戻る。だから `console.log("main を呼んだ後のコード")` が次に出る
- 1 秒経つと `main` の続きが再開し、`1 秒経過` 以降が 1 秒間隔で並ぶ
- 全体で約 3 秒かかる

### 変える

以下はそれぞれ独立に試してください（1 つ試したら元に戻してから次に進む）。

- 3 つの `wait(1000)` をすべて `wait(2000)` に変える。ログ間隔が 2 秒ずつになる
- 3 つの `await` をすべて外し、`wait(1000)` だけにする。`1 秒経過` などのログが時間差なく一瞬で全部出ることを確認（`await` を忘れたときの典型的な失敗パターン）
- `main()` の呼び出しを削除する。`main` の中身（`start` 〜 `end`）が実行されなくなり、最後の `console.log("main を呼んだ後のコード")` だけが出る
- `main()` の戻り値を `console.log(main())` で表示する。`Promise { ... }` のような表示が出れば、「`async function` は Promise を返す」が体感できる

### 自分で書く

#### 課題 1: A → 2 秒 → B → 1 秒 → C

`main` を書き換えて、Console に次の順で `console.log` する。

| 経過時間 | 出力 |
|---|---|
| 即時 | `A` |
| 約 2 秒後 | `B` |
| 約 3 秒後（B からさらに 1 秒） | `C` |

#### 課題 2: ループでカウントアップ

`for` 文と `await wait(500)` を組み合わせて、0.5 秒ごとに 1 から 5 まで `console.log` する。

| 経過時間 | 出力 |
|---|---|
| 約 0.5 秒後 | `1` |
| 約 1 秒後 | `2` |
| 約 1.5 秒後 | `3` |
| 約 2 秒後 | `4` |
| 約 2.5 秒後 | `5` |

ヒント: `for (let i = 1; i <= 5; i++) { ... }` の中で `await wait(500)` してから `console.log(i)` する。`for` 文の中でも `await` は普通に書ける。

## まとめ

- 同期は「上から順に実行」、非同期は「時間がかかる処理を待たずに先へ進む」
- 非同期な関数は **Promise**（あとで結果が届く箱） を返す
- `async` 関数の中で `await Promise` と書くと、結果が届くまで待てる
- 本コースでは `new Promise(...)` を自作しない。`wait` のような **Promise を返す関数** をコピペで用意して使う
- `fetch` など他の非同期関数も同じく「Promise を返す → `await` で待つ」パターン。失敗の可能性があるものは `try` / `catch` と組み合わせる
