# lesson40: Intl API で国際化の基礎

## ゴール

- `Intl.DateTimeFormat` で日付・時刻をロケール別に整形できる
- `Intl.NumberFormat` で通貨・パーセント・桁区切りを表示できる
- `Intl.RelativeTimeFormat` で「3 分前」「2 日後」を書ける
- `Intl.Collator` でロケールに従った文字列ソートができる
- 多言語化ライブラリ（next-intl / react-i18next）の立ち位置を理解する

## 解説

### 「国際化」と Intl API

「国際化（i18n）」は **表示言語の切り替え** だけではありません。日付の書き方（`2026/04/25` vs `25/04/2026` vs `April 25, 2026`）、数値の桁区切り（`1,234,567` vs `1.234.567`）、通貨表記（`¥1,200` vs `$10.50`）、文字列ソート（日本語のかな順 / ドイツ語の ä の扱い）まで含みます。

これらを自力で書くのは現実的ではありません。ブラウザと Node.js には **`Intl`** という組み込み API があり、ロケール（地域 + 言語）ごとの正しい整形を提供してくれます。2026 年現在、Web フロントエンドにおける i18n の整形処理は基本的にこの `Intl` を土台に組み立てます。

### `Intl.DateTimeFormat`

日付 / 時刻を **ロケール別** に整形します。

```js
const date = new Date("2026-04-25T10:30:00");

new Intl.DateTimeFormat("ja-JP").format(date);
// => "2026/04/25"

new Intl.DateTimeFormat("en-US").format(date);
// => "4/25/2026"

new Intl.DateTimeFormat("de-DE").format(date);
// => "25.4.2026"
```

#### オプションで細かく制御

```js
new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(date);
// => "2026年4月25日土曜日"

new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(date);
// => "10:30"
```

#### ユースケース

- ユーザーの地域に合わせた日付表示
- 「2026年4月25日」を「Apr 25, 2026」に切り替える

#### `toLocaleString` の簡便版

1 回限りの整形なら `date.toLocaleString("ja-JP", options)` でも同じことができます。同じものを何度も使うなら `Intl.DateTimeFormat` を **再利用** するほうが速いです（内部キャッシュが効く）。

### `Intl.NumberFormat`

数値を **桁区切り / 通貨 / パーセント / 単位** で整形します。

#### 桁区切り

```js
new Intl.NumberFormat("ja-JP").format(1234567.89);
// => "1,234,567.89"

new Intl.NumberFormat("de-DE").format(1234567.89);
// => "1.234.567,89"
```

ドイツ語圏では **カンマとピリオドが逆** になります。手書きで分岐を書くと、こうした地域差に起因するバグを埋め込みやすくなります。

#### 通貨

```js
new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
}).format(1200);
// => "￥1,200"

new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(10.5);
// => "$10.50"
```

#### パーセント

```js
new Intl.NumberFormat("ja-JP", { style: "percent" }).format(0.425);
// => "43%"（0.425 を百分率に）

new Intl.NumberFormat("ja-JP", {
  style: "percent",
  minimumFractionDigits: 1,
}).format(0.425);
// => "42.5%"
```

#### 単位

```js
new Intl.NumberFormat("ja-JP", { style: "unit", unit: "kilometer" }).format(20);
// => "20 km"

new Intl.NumberFormat("ja-JP", {
  style: "unit",
  unit: "kilometer-per-hour",
}).format(120);
// => "120 km/h"
```

#### コンパクト表記

```js
new Intl.NumberFormat("en", { notation: "compact" }).format(1500000);
// => "1.5M"

new Intl.NumberFormat("ja", { notation: "compact" }).format(15000);
// => "1.5万"
```

「フォロワー数 1.5M」「売上 1.5万円」のような表示にそのまま使えます。

### `Intl.RelativeTimeFormat`

「3 日前」「5 分後」のような相対時間を整形します。

```js
const rtf = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });

rtf.format(-3, "day");  // => "3 日前"
rtf.format(5, "minute"); // => "5 分後"
rtf.format(-1, "day");  // => "昨日"（numeric: "auto" なら言い換える）
rtf.format(0, "day");   // => "今日"
```

```js
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

rtf.format(-3, "day");  // => "3 days ago"
rtf.format(-1, "day");  // => "yesterday"
rtf.format(5, "minute"); // => "in 5 minutes"
```

`numeric: "always"` にすると「yesterday」が「1 day ago」に戻ります。

#### 経過秒から呼び出すヘルパー

```js
function timeAgo(dateString, lang = "ja") {
  const date = new Date(dateString);
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });

  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, sec] of units) {
    if (Math.abs(diffSec) >= sec || unit === "second") {
      return rtf.format(Math.round(diffSec / sec), unit);
    }
  }
}

timeAgo("2026-04-24T10:00:00"); // => "1 日前"
```

SNS や通知センターの「3 時間前」実装がこれだけで終わります。

### `Intl.Collator`

「**ロケールに従った文字列ソート**」を提供します。普通の `.sort()` は Unicode コードポイント順なので、かな / アクセント付き文字が期待通りに並びません。

```js
const items = ["りんご", "バナナ", "Apple", "みかん"];

items.sort(); // コードポイント順（英大文字が先に来る）
// => ["Apple", "バナナ", "みかん", "りんご"]

items.sort(new Intl.Collator("ja").compare);
// => ["Apple", "バナナ", "みかん", "りんご"]（日本語の並び）
```

ドイツ語の `ä` は `a` と同等に扱ってほしい（"apple" と "Äpfel" が隣に来る）など、**ロケールごとの期待** が違います。`Intl.Collator` はその差を吸収します。

```js
const words = ["apple", "Äpfel", "banana"];
words.sort(new Intl.Collator("de").compare);
// => ["apple", "Äpfel", "banana"]（ドイツ語なら ä は a 扱い）
```

### `Intl.ListFormat`

「A、B、C」のようなリスト形式の連結文字列を整形します。

```js
const lf = new Intl.ListFormat("ja", { style: "long", type: "conjunction" });
lf.format(["りんご", "バナナ", "みかん"]);
// => "りんご、バナナ、みかん"

new Intl.ListFormat("en", { type: "conjunction" }).format(["a", "b", "c"]);
// => "a, b, and c"
```

日本語の `conjunction` には英語の "and" / "および" のような連結語は付きません（CLDR / ICU のルール）。`type: "disjunction"` なら「A、B、または C」「a, b, or c」になります。

### `Intl.PluralRules`

「1 item / 2 items」のような **単数 / 複数の語形変化** の判定を返します。

```js
const pr = new Intl.PluralRules("en");
pr.select(1); // => "one"
pr.select(2); // => "other"

function itemLabel(n) {
  const cat = pr.select(n);
  return cat === "one" ? `${n} item` : `${n} items`;
}
```

ロシア語のように「1 / 2〜4 / 5 以上」で形が変わる言語もサポートします。ライブラリを使う時も内部で `Intl.PluralRules` が活躍しています。

### i18n ライブラリとの関係

Intl API は **土台** を提供しますが、「翻訳文字列の辞書管理 / ページ単位の言語切り替え / 翻訳キーの補完」はカバーしません。そこで i18n ライブラリが登場します。

| ライブラリ | 位置付け |
|---|---|
| `next-intl` | Next.js App Router 向け。サーバー / クライアント両対応。2026 年の Next.js 一押し |
| `react-i18next` | React 汎用。老舗で機能が豊富 |
| `lingui` | マクロで翻訳キーを自動抽出 |
| `paraglide` | コンパイル時に翻訳を最小バンドル化 |

これらは **中で Intl API を呼んでいる** ので、Intl API を知っておくと **学習が早く**、**ライブラリを使わず直接呼ぶ判断** もできます（小規模な表示なら Intl だけで十分）。

#### next-intl の最小例（参考）

```tsx
// app/[locale]/page.tsx
import { useTranslations, useFormatter } from "next-intl";

export default function Page() {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{format.dateTime(new Date(), { dateStyle: "long" })}</p>
      <p>{format.number(1234.5, { style: "currency", currency: "JPY" })}</p>
    </div>
  );
}
```

内部で `Intl.DateTimeFormat` / `Intl.NumberFormat` が動いているだけです。

## 演習

### ゴール

- Intl API を使って「投稿の日時」「価格」「経過時間」を表示する小さなページを作る

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest intl-sample -- --template vanilla-ts
cd intl-sample
npm install
```

### 手順 2: index.html

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Intl Demo</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <main>
      <h1>Intl API ショーケース</h1>

      <label>
        言語:
        <select id="locale">
          <option value="ja-JP">日本語</option>
          <option value="en-US">English (US)</option>
          <option value="de-DE">Deutsch</option>
        </select>
      </label>

      <section>
        <h2>日付</h2>
        <p id="date"></p>
      </section>

      <section>
        <h2>通貨</h2>
        <p id="currency"></p>
      </section>

      <section>
        <h2>経過時間</h2>
        <p id="relative"></p>
      </section>

      <section>
        <h2>リスト</h2>
        <p id="list"></p>
      </section>

      <section>
        <h2>ソート</h2>
        <ul id="sort"></ul>
      </section>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 手順 3: src/style.css

```css
body { font-family: sans-serif; padding: 24px; line-height: 1.6; }
main { max-width: 700px; margin: 0 auto; }
section { margin-block: 16px; padding: 16px; border: 1px solid #ccc; border-radius: 8px; }
label { display: block; margin-bottom: 16px; }
select { padding: 4px 8px; }
ul { margin: 0; padding-left: 20px; }
```

### 手順 4: src/main.ts

```ts
const localeSelect = document.getElementById("locale") as HTMLSelectElement;
const dateEl = document.getElementById("date")!;
const currencyEl = document.getElementById("currency")!;
const relativeEl = document.getElementById("relative")!;
const listEl = document.getElementById("list")!;
const sortEl = document.getElementById("sort")!;

const items = ["りんご", "Apple", "Äpfel", "banana", "みかん"];

function render(locale: string) {
  const now = new Date();

  dateEl.textContent = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(now);

  const currency =
    locale === "ja-JP" ? "JPY" : locale === "de-DE" ? "EUR" : "USD";
  currencyEl.textContent = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(1234567.89);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  relativeEl.textContent = [
    rtf.format(-3, "day"),
    rtf.format(5, "minute"),
    rtf.format(-1, "year"),
  ].join(" / ");

  const lf = new Intl.ListFormat(locale, { type: "conjunction" });
  listEl.textContent = lf.format(["りんご", "バナナ", "みかん"]);

  const collator = new Intl.Collator(locale);
  const sorted = [...items].sort(collator.compare);
  sortEl.innerHTML = sorted.map((x) => `<li>${x}</li>`).join("");
}

localeSelect.addEventListener("change", () => render(localeSelect.value));
render("ja-JP");
```

### 手順 5: 起動して確認

```bash
npm run dev
```

ブラウザで言語を切り替えて観察します。

### 期待出力

| ロケール | 日付例 | 通貨例 | 経過時間 |
|---|---|---|---|
| `ja-JP` | 2026年4月25日土曜日 10:30 | ￥1,234,568 | 3 日前 / 5 分後 / 昨年 |
| `en-US` | Saturday, April 25, 2026 at 10:30 AM | $1,234,567.89 | 3 days ago / in 5 minutes / last year |
| `de-DE` | Samstag, 25. April 2026 um 10:30 | 1.234.567,89 € | vor 3 Tagen / in 5 Minuten / letztes Jahr |

> 上の出力は **ICU / CLDR バージョン** によって細部が変わります。例えば `en-US` の AM/PM 直前のスペースは新しい ICU では **NNBSP**（U+202F、見た目は半角スペース）に置き換わっており、`ja-JP` の通貨記号も実装によって `¥`（U+00A5）と `￥`（U+FFE5）が入れ替わります。スペースや記号の違いで `===` の文字列比較に失敗することがあるので、出力をそのまま比較する処理を書かないようにします。

リストとソート順もロケールに追従します。

### 変える

- `Intl.DateTimeFormat` の `dateStyle` を `"long"` / `"medium"` / `"short"` に切り替えて差を見る
- `Intl.NumberFormat` の `notation: "compact"` を追加して `1,500,000 → 1.5M` の挙動を確認
- `Intl.Collator` の `sensitivity: "base"` を付けて `apple` と `Äpfel` が等価になるか見る
- `hour12: true` / `false` で時刻表記が切り替わる

### 自分で書く（任意）

- 投稿一覧ページに **「3 時間前」「2 日前」** を表示する関数を `Intl.RelativeTimeFormat` で書く
- 商品価格のリストを、ユーザーの `navigator.language` に従ったロケールで表示する
- `Intl.DisplayNames` で国名 / 言語名をロケール別に表示する（例: `ja` で `"日本"`、`en` で `"Japan"`）

## まとめ

- **Intl API** は日付 / 数値 / 相対時間 / ソート / リスト整形を **ロケール別** に行う組み込み API
- `Intl.DateTimeFormat` / `Intl.NumberFormat` / `Intl.RelativeTimeFormat` / `Intl.Collator` / `Intl.ListFormat` / `Intl.PluralRules` が主な構成要素
- 何度も使う整形は **インスタンスを使い回す** ほうが速い
- 多言語化ライブラリ（next-intl / react-i18next）は **Intl API の上に辞書管理** を載せたもの
- 小規模な表示整形なら Intl だけで十分。本格的な翻訳管理があるなら next-intl など

---

::: tip この章のドリルで力試し
[2 章「JavaScript」のドリル →](/quiz/chapter2/) で、4 択問題で理解度を確認できます。回答履歴はブラウザに保存されるので、途中で閉じても続きから再開できます。
:::
