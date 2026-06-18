# lesson28: Date で日付と時刻を扱う

<script setup>
const dateDemoJs = `
const out = document.getElementById('out');
const btn = document.getElementById('run');

function show() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  out.textContent =
    'getFullYear: ' + y + '\\n' +
    'getMonth + 1: ' + m + '   ← getMonth は 0-indexed なので +1\\n' +
    'getDate: ' + d + '\\n' +
    'getHours / Minutes / Seconds: ' + h + ':' + min + ':' + s + '\\n' +
    'getTime (ms): ' + now.getTime() + '\\n' +
    'toISOString (UTC): ' + now.toISOString() + '\\n' +
    'toLocaleString (ja-JP): ' + now.toLocaleString('ja-JP');
}

btn.addEventListener('click', show);
show();
`
</script>

## ゴール

- `new Date()` で日付・時刻オブジェクトを作れる
- `getFullYear` / `getMonth` / `getDate` などで値を取り出せる
- **月は 0-indexed** という JS Date の代表的な罠を覚える
- `Date.now()` と `getTime()` でタイムスタンプ（ミリ秒）を扱える
- 日付の差分（何日経った）と比較ができる
- タイムゾーン（UTC / ローカル / ISO 文字列）の違いを言葉にできる
- 日付計算が複雑になってきたら `day.js` のようなライブラリを検討できる

## 解説

### `Date` オブジェクトの作り方

JS の組み込み型 `Date` は、**ある瞬間の日時** を表します。代表的な作り方は 4 つ。

```js
// 1. 今この瞬間
const now = new Date();

// 2. ISO 文字列から
const a = new Date("2026-04-29T10:30:00");

// 3. 年月日を直接指定（ローカルタイム扱い）
const b = new Date(2026, 3, 29, 10, 30); // 2026 年 4 月 29 日 10:30
//                       ^^ 0-indexed: 0=1月、3=4月

// 4. ミリ秒タイムスタンプから
const c = new Date(1745890200000);
```

`Date` は **ミリ秒数** を内部に持っているだけのシンプルな型です（1970 年 1 月 1 日 00:00:00 UTC からの経過ミリ秒、いわゆる **Unix タイム × 1000**）。表示形式（日本式 / ISO 形式 / 西暦・元号など）は別の話で、後述の `toLocaleString` や `Intl.DateTimeFormat`（「Intl API で国際化の基礎」）で整形します。

### 値を取り出す（getter）

`Date` オブジェクトから日付の各部分を取り出すには getter を使います。

```js
const d = new Date("2026-04-29T10:30:45");

d.getFullYear();  // 2026
d.getMonth();     // 3   ← 0-indexed なので 4 月は 3
d.getDate();      // 29  ← 「日」は 1-indexed
d.getDay();       // 3   ← 曜日（0=日 〜 6=土）
d.getHours();     // 10
d.getMinutes();   // 30
d.getSeconds();   // 45
d.getTime();      // 1777800645000   ← Unix タイム（ms）
```

::: warning 罠 1: 月は 0-indexed、日は 1-indexed
`getMonth()` は **0 から始まり** ます（1 月 = 0、12 月 = 11）。一方 `getDate()` は **1 から始まる**（普通の「日」）。一貫していないので、月だけ毎回 `+1` するのを忘れずに。

```js
const d = new Date(2026, 3, 29); // 4 月 29 日
console.log(d.getMonth());      // 3 ← 4 ではない
console.log(d.getMonth() + 1);  // 4 ← これが「人間の 4 月」
```
:::

### `Date.now()` と `getTime()`

「今この瞬間のタイムスタンプ（ミリ秒）」だけが欲しいときは `Date.now()` がいちばん速いです。

```js
const t1 = Date.now();           // 数値（ms）
const t2 = new Date().getTime(); // 同じ値
```

タイムスタンプは数値なので **引き算ができる**（後述の差分計算）、**比較も簡単**（`a < b` で先後判定）、**localStorage への保存も楽**（数値を文字列化するだけ）です。「日時を保存しておきたい」場面では `Date.now()` を取っておくのが定番です。

### 日付の比較と差分

```js
const a = new Date("2026-04-29");
const b = new Date("2026-05-01");

a < b;            // true   ← Date 同士は比較演算子で先後判定できる
a.getTime() < b.getTime(); // 同じ意味
b - a;            // 172800000   ← ミリ秒単位の差（数値）
(b - a) / 86400000; // 2   ← 日単位に変換（1 日 = 86,400,000 ms）
```

`b - a` の結果は数値（ミリ秒）です。日数にしたいときは `1000 * 60 * 60 * 24 = 86_400_000` で割ります。

```js
function daysBetween(a, b) {
  return Math.round((b - a) / 86_400_000);
}
```

### 日付の加減算

`Date` は **直接の加算 API を持ちません**。普通は `setDate` / `setMonth` などで「今の値に足して上書き」します。

```js
const d = new Date("2026-04-29");
d.setDate(d.getDate() + 7);       // 1 週間後
console.log(d.toISOString().slice(0, 10)); // "2026-05-06"

const m = new Date("2026-01-31");
m.setMonth(m.getMonth() + 1);     // 1 ヶ月後
console.log(m.toISOString().slice(0, 10)); // "2026-03-03" ← 2 月 31 日が 3 月にあふれる
```

`setMonth` は「2 月 31 日」のような無効な日を **自動で繰り上げ** ます。これが想定外の動きを生むことがあるので、月またぎの計算では注意が必要になります。

### 文字列に整形する

最低限覚えるのはこの 3 つ。

```js
const d = new Date("2026-04-29T10:30:00+09:00");

d.toISOString();
// "2026-04-29T01:30:00.000Z"   ← UTC 基準、API で送るときの定番

d.toLocaleString("ja-JP");
// "2026/4/29 10:30:00"   ← 表示用のロケール別フォーマット

d.toLocaleDateString("ja-JP");
// "2026/4/29"
```

細かい整形（曜日も入れる、時刻だけ、相対表現「3 分前」など）は `Intl.DateTimeFormat` を使います。「Intl API で国際化の基礎」で扱います。

### タイムゾーン

ここが Date の **いちばんの罠** です。

- **`Date` オブジェクト自体に「タイムゾーン」はない**。内部は UTC ミリ秒だけ
- 表示するときに **ブラウザ（実行環境）のローカルタイム** に変換される
- だから同じ `Date` でも、東京で表示するか LA で表示するかで見た目の文字列が変わる

```js
const d = new Date("2026-04-29T10:30:00Z");
// 末尾 Z = UTC（協定世界時）

d.toISOString();
// "2026-04-29T10:30:00.000Z"   ← どこで動かしても同じ

d.toLocaleString("ja-JP");
// 東京で動かす  : "2026/4/29 19:30:00"   ← UTC + 9 時間
// LA で動かす   : "2026/4/29 3:30:00"
```

実務での目安:

- **API でやり取りする / DB に保存する** ときは **ISO 文字列の UTC**（`toISOString()`）を使う
- **画面に表示する** ときに `toLocaleString("ja-JP")` でローカル変換する
- **「日付だけ」** （誕生日、記念日など、時刻が無関係なもの）は `"2026-04-29"` のような文字列で持つ方が安全。`new Date("2026-04-29")` は **UTC の真夜中** として解釈されるため、東京で `getDate()` すると 4 月 29 日でも、LA で動かすと 4 月 28 日になってしまう

### `Date.parse` の落とし穴

`new Date(文字列)` は内部で `Date.parse` を使います。`Date.parse` は **ISO 形式（`2026-04-29T10:30:00`）以外は環境依存** で、ブラウザによって解釈が揺れます。

```js
new Date("2026/04/29");      // ブラウザによって NaN や違う解釈
new Date("April 29, 2026");  // 同上
new Date("2026-04-29");      // OK: ISO 形式は安全
```

**入力文字列は ISO 形式（`YYYY-MM-DD` または `YYYY-MM-DDTHH:mm:ss`）に統一する** のを基本としてください。

### `day.js` の出番

純正 `Date` だけで頑張れる範囲は次のようなものです。

- 「今この瞬間」を取る、ミリ秒単位の差を計算する
- ISO 文字列にする、`toLocaleString` で軽く表示する
- 単純な前後比較

これを超える要件、たとえば次のような場面では **ライブラリを使う方が安全で短い** です。

- 「今月の月末日」「来月の同じ曜日」のような日付演算
- 「3 分前」「2 日後」のような相対表現
- 「日本標準時の今日」「ニューヨークの今」のような **明示的なタイムゾーン操作**
- 営業日（平日 / 土日 / 祝日）計算

軽量な定番が **[Day.js](https://day.js.org/)** です（`Moment.js` の小型後継、約 2 KB）。

```js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs().format("YYYY-MM-DD HH:mm:ss");  // "2026-04-29 19:30:00"
dayjs().add(3, "day").format("YYYY-MM-DD"); // 3 日後
dayjs().endOf("month").format("YYYY-MM-DD"); // 今月の月末

// 明示的なタイムゾーン
dayjs.tz("2026-04-29 10:00", "America/Los_Angeles").format();
```

本コースでは Day.js は使いませんが、「Date の素手では辛い」と感じたらライブラリを思い出してください。なお、より新しい標準 API として **`Temporal`** がブラウザに来つつあります（2026 年現在は実験的）。将来的には Temporal が `Date` の置き換え標準になる見込みです。

### デモ: 今この瞬間

下のデモは `new Date()` から各 getter で値を取り出した結果です。「再表示」を押すたびに更新されます。

<!-- textlint-disable ja-technical-writing/sentence-length -->

<LiveDemo
  height="280px"
  :html="`
<button id='run' type='button'>再表示</button>
<pre id='out' aria-live='polite'></pre>
  `"
  :css="`
button { padding: 6px 12px; }
pre { background: #f5f5f5; color: #222; padding: 12px; border-radius: 4px; margin-top: 8px; min-height: 8em; font-family: ui-monospace, monospace; }
@media (prefers-color-scheme: dark) {
  pre { background: #2a2a2a; color: #eaeaea; }
}
  `"
  :js="dateDemoJs"
/>

<!-- textlint-enable ja-technical-writing/sentence-length -->

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、`script.js` を下記の内容に書き換えてください。

### ゴール

- 自分の誕生日からの **経過日数** を計算して Console に出す
- 「3 日後」「30 日後」の **日付** を求めて Console に出す
- ISO 文字列とローカル表示の違いを目で確認する

### 手順

1. `script.js` を以下の内容に書き換える
2. プレビューを開いて、ブラウザの DevTools（Console タブ）を表示する
3. 出力を確認する

### `script.js`

```js
const birthday = new Date("2000-01-01"); // ←ここを自分の誕生日に変える
const today = new Date();

// 1. 経過日数
const diffMs = today - birthday;
const diffDays = Math.floor(diffMs / 86_400_000);
console.log("生まれてから " + diffDays + " 日");

// 2. 3 日後
const in3days = new Date();
in3days.setDate(in3days.getDate() + 3);
console.log("3 日後 (ISO):", in3days.toISOString());
console.log("3 日後 (ja):", in3days.toLocaleString("ja-JP"));

// 3. 30 日後
const in30days = new Date();
in30days.setDate(in30days.getDate() + 30);
console.log("30 日後:", in30days.toLocaleDateString("ja-JP"));

// 4. 今月の最終日（来月 1 日の前日 = 今月末）
const endOfMonth = new Date();
endOfMonth.setMonth(endOfMonth.getMonth() + 1);
endOfMonth.setDate(0); // 0 日 = 前月の末日
console.log("今月の最終日:", endOfMonth.toLocaleDateString("ja-JP"));
```

### 期待出力

実行した日付によって変わりますが、形式は以下のようになります（2026 年 4 月 29 日に実行した例）。

```
生まれてから 9615 日
3 日後 (ISO): 2026-05-02T...Z
3 日後 (ja): 2026/5/2 ...
30 日後: 2026/5/29
今月の最終日: 2026/4/30
```

ポイント:

- `today - birthday` は **ミリ秒** で出る。`/ 86_400_000` で日数にする
- `setDate(getDate() + N)` で N 日後を計算。負の値で N 日前
- `setDate(0)` は「前月の末日」になる（月末計算の定番イディオム）
- ISO は UTC 基準、ローカル表示は実行環境のタイムゾーンに合わせて変換される

### 変える

以下はそれぞれ独立に試してください（1 つ試したら元に戻してから次に進む）。

- `birthday` を未来の日付（自分の次の誕生日など）に変える。`diffDays` がマイナスになる
- `setDate(in3days.getDate() + 3)` を `setMonth(in3days.getMonth() + 1)` に変えて、1 ヶ月後を計算する
- 「2 月 31 日」のように **存在しない日付** を直接渡してみる: `new Date(2026, 1, 31)`。`toISOString` で確認すると **3 月 3 日にあふれている** （`setDate` の繰り上げ動作）
- `new Date("2026-04-29")` と `new Date("2026/04/29")` を `console.log` で比べる。**前者は ISO 形式で安全、後者はブラウザ依存**

### 自分で書く

#### 課題 1: 曜日を日本語で出す

`getDay()`（0=日, 1=月, ..., 6=土）と配列を使って、**今日が何曜日か** を `今日は 水曜日 です` のように Console に出力する。

ヒント: `const week = ["日", "月", "火", "水", "木", "金", "土"]` と `week[date.getDay()]`。

#### 課題 2: ある日からの経過日数を関数化する

入力 ISO 文字列を受け取り、今日との経過日数を返す関数 `daysSince(iso)` を書く。

期待される使い方:

```js
console.log(daysSince("2024-01-01")); // → 数百日くらいの整数
console.log(daysSince("2026-04-25")); // → 4 程度（実行日依存）
```

ヒント: `new Date(iso)` で Date 化し、`(Date.now() - date.getTime()) / 86_400_000` を `Math.floor` する。

## まとめ

- `Date` は **UTC ミリ秒** を内部に持つだけのオブジェクト。表示形式は別の話
- `getMonth()` は **0-indexed**。`+1` を忘れない。`getDate()` は 1-indexed なので一貫しない
- 「今のタイムスタンプ」は `Date.now()` がいちばん速い
- 引き算 → ミリ秒 → `/ 86_400_000` で日単位に変換できる
- 日付加算は `setDate(getDate() + N)`。`setDate(0)` で「前月末」のイディオム
- 文字列化は `toISOString()`（UTC、API・DB 用）と `toLocaleString("ja-JP")`（表示用）を使い分ける
- 入力文字列は **ISO 形式（`YYYY-MM-DD`）に統一** すると環境差がない
- 複雑な日付計算（タイムゾーン操作、相対時間、月末・営業日など）は **Day.js** のような小型ライブラリを使う方が安全。将来は標準の `Temporal` が来る
