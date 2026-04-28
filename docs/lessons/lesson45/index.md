# lesson45: `unknown` と `never`

## ゴール

- `any` を使うと TS の型チェックが無効化されること、本コースでは `any` を **原則禁止** にする方針を理解する。
- 「型が分からない値」は `unknown` で受けられる。`unknown` のままでは **何もできない** 制約を体験する。
- `never`（「起こり得ない」を表す型）の役割を知り、`switch` + `never` による **網羅性チェック** を書ける。

## 解説

### `any` とその問題点

TS には、型チェックを **一時的にすべて無効にする** `any` という型があります。何を代入しても、何を呼び出しても、TS は何も警告しません。

```ts
let x: any = 123;
x = "hello";        // OK
x = { a: 1 };       // OK
x.toUpperCase();    // 実行時エラーになるのに、TS は止めない
x.bar.baz.qux();    // これも通ってしまう
```

`any` は JS の世界に戻るのと同じことです。コンパイルは通ってしまい、**実行してはじめて壊れていることに気付きます**。

本コースでは **`any` は原則禁止** とします。既存ライブラリの型情報が不足している場合などに仕方なく使う場面はありますが、学習中は使う場面をゼロにして差し支えありません。

### `unknown`: 「型が分からない」を安全に受ける

「型が分からない値」を受ける安全な代替が **`unknown`** です。`any` と違い、`unknown` はそのままでは **ほとんど何も操作できません**。

```ts
let x: unknown = 123;
x = "hello";   // 代入自体は何でも OK
x = { a: 1 };  // OK

console.log(x.toUpperCase()); // エラー
```

```
'x' is of type 'unknown'.
```

`unknown` のままでは、プロパティアクセスもメソッド呼び出しもできません。**「使う前に型を絞り込め」** と TS が促してくれます。

本レッスンでは、`unknown` が「絞り込まないと何もできない型」であることだけを体験します。

### `unknown` の使いどころ

`unknown` が登場する典型は、**外から入ってくる値** です。

- `JSON.parse(text)` の戻り値
- `fetch(...).then(r => r.json())` の戻り値
- Server Actions / Route Handlers のリクエストボディ

これらは実行時まで中身が何か分かりません。かつては `any` で受けていましたが、現在の TS では `unknown` で受けて、あとから型ガードで絞り込むのが基本形です。

```ts
const raw: unknown = JSON.parse('{"name":"Alice"}');
// raw.name と書きたくても書けない。
```

### `never`: 「起こり得ない」を表す型

`never` は「**値が存在しえない**」ことを表す型です。次のような場面で登場します。

- 関数が **例外しか投げない**、あるいは **無限ループで絶対に return しない** 場合の戻り値型

    ```ts
    function fail(message: string): never {
      throw new Error(message);
    }
    ```

- `switch` の全ケースを処理し終えた後の残り物。これを使って **網羅性チェック** ができる。

「`never` に値を代入しようとするとエラーになる」という性質を逆手にとると、「**ここに値が来たら漏れがある**」という警告を TS に書かせることができます。

### 網羅性チェック（`switch` + `never`）

「配列・ユニオン・リテラル型・オプショナル」で学んだリテラル型のユニオンを `switch` で分岐するとき、**全ケースを処理したことを TS に検証させる** 書き方を紹介します。

```ts
type Status = "open" | "done" | "archived";

function label(status: Status): string {
  switch (status) {
    case "open":
      return "未完了";
    case "done":
      return "完了";
    case "archived":
      return "保管";
    default: {
      const _exhaustive: never = status; // ここに来たら網羅できていない
      return _exhaustive;
    }
  }
}
```

ポイントは `default` で `const _exhaustive: never = status;` と書いている部分です。

- `Status` が `"open" | "done" | "archived"` のとき、上の 3 つの `case` で全部処理している。
- `default` に到達する時点で `status` の型は **残りがない** ので `never` 型になる。
- `never` 型の変数に代入できるのは `never` 型の値だけ。このとき `status` が `never` なので代入が通る。

> **補足: 仕組みは「型の絞り込み」（narrowing）**: TS は `case "open"` を通過したら「`status` の候補から `"open"` が消える」、というふうに **case を進むたびに型を絞り込んで** いきます。3 つ全部処理し終えた `default` の時点で残りが無くなり `never` になる、という流れです。これを **型の絞り込み**（narrowing）と呼び、`if (typeof x === "string")` などにも同じ仕組みが効きます。**今は上の `_exhaustive: never = status` をテンプレとしてコピペで使えれば十分** です。

ここで `Status` に **新しいケースを足した** とします。

```ts
type Status = "open" | "done" | "archived" | "deleted";
```

すると `label` の `default` で、`status` の型は `"deleted"` が残っている状態（= `never` ではない）になります。

```
Type '"deleted"' is not assignable to type 'never'.
```

TS が `label` 関数の中で「`"deleted"` ケースを書き忘れている」と教えてくれます。新しい状態を追加したときに処理漏れを防ぐ、強力な仕組みです。

### このレッスンで扱わないこと

`unknown` を **どう絞り込むか**（`typeof` / `in` / カスタム型ガード）はここでは深掘りしません。「絞り込まないと何もできない」こと、そして「`never` で網羅性を検査できる」ことだけ押さえればじゅうぶんです。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の TypeScript（Vanilla TS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/typescript>）から始められます。

### 手順 1: `any` の危うさを確認する

`src/main.ts` の中身を以下に置き換える。

```ts
let x: any = 123;
x = "hello";
console.log(x.toUpperCase()); // OK
console.log(x.bar.baz.qux()); // TS は止めないが、実行するとクラッシュする
```

エディタでは赤線が出ない。ビルドも通る。しかし実行すると次のような実行時エラーになる。

```
TypeError: Cannot read properties of undefined (reading 'baz')
```

`any` を使うと、TS は「ある型として扱える」と信じ込んでしまう。**実行するまで壊れていることに気付けない** のがポイント。

### 手順 2: `unknown` に置き換えて、エラーが出ることを確認する

同じコードを `unknown` で書き直す。

```ts
let x: unknown = 123;
x = "hello";
console.log(x.toUpperCase());
```

期待されるメッセージ（`x.toUpperCase()` の行に赤線）:

```
'x' is of type 'unknown'.
```

さらにプロパティアクセスも試す。

```ts
console.log(x.bar);
```

期待されるメッセージ:

```
'x' is of type 'unknown'.
```

`unknown` は「中身が何か分からない」ので、プロパティにもメソッドにも触らせてくれない。`any` のように **実行してから壊れる** のではなく、**書いた瞬間に TS が止める**。

### 手順 3: `JSON.parse` の戻り値を受けてみる

TS の型定義では `JSON.parse` の戻り値は `any` ですが、実務では安全のため `unknown` にキャストして受けるやり方があります。ここでは学習のため明示的に `unknown` で受けます。

```ts
const raw: unknown = JSON.parse('{"name":"Alice","age":20}');

console.log(raw.name);
```

期待されるメッセージ:

```
'raw' is of type 'unknown'.
```

`raw` を `unknown` 型で受けると、中身にアクセスする前に「絞り込み」が必要になる。

確認できたら `console.log(raw.name);` は消しておく（ビルドを通すため）。

### 手順 4: `never` による網羅性チェック

次のコードを `src/main.ts` に書く。

```ts
type Status = "open" | "done" | "archived";

function label(status: Status): string {
  switch (status) {
    case "open":
      return "未完了";
    case "done":
      return "完了";
    case "archived":
      return "保管";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

console.log(label("open"));
console.log(label("done"));
console.log(label("archived"));
```

#### 期待出力

```
未完了
完了
保管
```

### 手順 5: ユニオンにケースを追加して、処理漏れを検出させる

`Status` に `"deleted"` を追加する。

```ts
type Status = "open" | "done" | "archived" | "deleted";
```

`label` 関数の本体は変えない。すると `default` 節の `const _exhaustive: never = status;` に赤線が出る。

期待されるメッセージ:

```
Type '"deleted"' is not assignable to type 'never'.
```

「`label` 関数で `"deleted"` のケースが処理されていない」と TS が教えてくれる。

`case "deleted":` を追加して処理を書き足すと、エラーが消える。

```ts
function label(status: Status): string {
  switch (status) {
    case "open":
      return "未完了";
    case "done":
      return "完了";
    case "archived":
      return "保管";
    case "deleted":
      return "削除済み";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
```

これで `Status` が増えるたびに、処理を書き忘れたら TS が止めてくれる。

### 変えてみる

`never` を返す関数を試す。

```ts
function fail(message: string): never {
  throw new Error(message);
}

const value: string = fail("ここでストップ");
console.log(value); // ここには到達しない
```

実行すると例外で止まり、`console.log` の行は動かない。

```
Error: ここでストップ
```

`never` を戻り値とする関数は「呼んだら戻ってこない」ことを型レベルで表現している。

### 自分で書く

次のユニオン型と関数を書く。

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  // ...
}
```

- `case "circle":` で `Math.PI * shape.radius ** 2` を返す。
- `case "square":` で `shape.side ** 2` を返す。
- `default:` で `const _exhaustive: never = shape;` を書く。

書けたら、わざと `Shape` に `{ kind: "triangle"; base: number; height: number }` を追加して、`_exhaustive` に赤線が出ることを確認する。確認できたら追加分を元に戻す。

ヒント: `switch (shape.kind)` で分岐する。このような「プロパティで種類を見分ける」形は「判別共用体」で **判別共用体** として本格的に扱う。

## まとめ

- `any` は型チェックを無効化してしまうため、**本コースでは原則禁止**。
- `unknown` は「型が分からない」を安全に受ける型。そのままでは **何もできない** 制約がある。
- `never` は「起こり得ない」を表す型。`switch` の `default` で `const _: never = x;` と書くと、処理漏れを TS に検出してもらえる（網羅性チェック）。
- リテラル型のユニオンが増えたとき、網羅性チェックが入っていれば **処理を書き忘れた場所が赤線で分かる**。安全にユニオンを育てていくための定番パターン。
