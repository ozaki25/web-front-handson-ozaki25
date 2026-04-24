# lesson37: 型ガード（`typeof` / `in` / カスタム）

## ゴール

- `typeof` 演算子でプリミティブ型のユニオンを絞り込める。
- `in` 演算子でオブジェクトのプロパティの有無から型を絞り込める。
- `Array.isArray` で「配列かどうか」を絞り込める。
- `function isTodo(x: unknown): x is Todo` のような **ユーザー定義型ガード** を書ける。
- 「`unknown` と `never`」で受けた `unknown` を、型ガードを通して具体的な型まで絞り込める。

## 解説

### `unknown` からの接続

「`unknown` と `never`」で、`unknown` で受けた値は **そのままでは何もできない** こと、「絞り込む道具」は本レッスンで扱うと予告しました。このレッスンはその続きです。

`unknown` を扱うには、「この値は実際どの型なのか」を **実行時に確かめる** コードを書きます。TS はそのコードを読んで「このブロックの中では `unknown` ではなく具体的な型として扱ってよい」と判断してくれます。この「コードから型を絞り込む仕組み」を **型ガード** と呼びます。

### `typeof` 型ガード

JS の `typeof` 演算子は、値のプリミティブな種類を文字列で返します。TS はこの `typeof` の結果を読み取って、**分岐の中で型を絞り込みます**。

```ts
function describe(value: string | number): string {
  if (typeof value === "string") {
    return `文字列: ${value.toUpperCase()}`;
  }
  return `数値: ${value.toFixed(2)}`;
}

console.log(describe("hello"));
console.log(describe(3.14));
```

出力:

```
文字列: HELLO
数値: 3.14
```

- `if (typeof value === "string")` の中では `value` の型は `string` に絞られている。`.toUpperCase()` を呼べる。
- その外（`if` を通らなかった側）では `number` に絞られている。`.toFixed(2)` を呼べる。

`typeof` で判定できる文字列は `"string"` / `"number"` / `"boolean"` / `"bigint"` / `"symbol"` / `"function"` / `"undefined"` / `"object"` の 8 種類。ここで注意が必要なのは **`typeof null` が `"object"` になる** こと（JS の歴史的経緯）、そして **配列も `typeof` では `"object"`** になること。

### `Array.isArray` で配列を絞り込む

配列かどうかは `typeof` では判定できないので、専用の `Array.isArray` を使います。

```ts
function length(value: string | string[]): number {
  if (Array.isArray(value)) {
    return value.length; // ここでは string[]
  }
  return value.length;   // ここでは string
}

console.log(length("hello"));         // 5
console.log(length(["a", "b", "c"])); // 3
```

`Array.isArray(value)` が `true` のブロックでは `value` が `string[]`、それ以外では `string` として扱われる。

### `in` 演算子で絞り込む

オブジェクトの型のユニオンでは、`in` 演算子で「そのプロパティを持っているか」を見ることで絞り込めます。

```ts
type TodoItem = { kind: "todo"; text: string };
type NoteItem = { kind: "note"; body: string };
type Item = TodoItem | NoteItem;

function render(item: Item): string {
  if ("text" in item) {
    return `TODO: ${item.text}`;
  }
  return `Note: ${item.body}`;
}

console.log(render({ kind: "todo", text: "牛乳を買う" }));
console.log(render({ kind: "note", body: "今日は良い天気" }));
```

出力:

```
TODO: 牛乳を買う
Note: 今日は良い天気
```

- `"text" in item` が `true` のブロックでは `item` の型が `TodoItem` に絞られる。`item.text` が使える。
- `false` 側では `NoteItem` に絞られ、`item.body` が使える。

`in` は「文字列 `"プロパティ名"` が、オブジェクトの中に存在するか」を見ます。共通で持っているプロパティ（ここでは `kind`）ではなく、**片方だけが持つプロパティ**（`text` や `body`）で見分けるのがコツです。

なお、`kind` のような **「種類を表す共通プロパティ」** で分岐する方法もあります。こちらの書き方は次のレッスンで **判別共用体** として本格的に扱います。

### ユーザー定義型ガード（`x is Todo`）

組み込みの `typeof` や `in` で足りないときは、**自分で型ガード関数を書きます**。形は次の通り。

```ts
function isTodo(x: unknown): x is Todo {
  // この関数が true を返したら、呼び出し側では x の型が Todo になる
}
```

ポイントは戻り値型 `x is Todo` の部分。通常の戻り値型 `boolean` の代わりにこれを書くと、「`true` を返したら **呼び出し側の `x` の型を `Todo` に絞ってよい**」と TS に教えられます。これを **型述語**（type predicate）と呼びます。

具体的に書くと次のようになります（`Todo` は「配列・ユニオン・リテラル型・オプショナル」で育てた `{ id: string; text: string; status: "open" | "done"; memo?: string }`）。

```ts
import type { Todo } from "./types";

function isTodo(x: unknown): x is Todo {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string") return false;
  if (typeof o.text !== "string") return false;
  if (o.status !== "open" && o.status !== "done") return false;
  if (o.memo !== undefined && typeof o.memo !== "string") return false;
  return true;
}
```

- 最初の `typeof x !== "object" || x === null` で「そもそもオブジェクトか」を見る。`null` を除く理由は `typeof null === "object"` だから。
- `x as Record<string, unknown>` は「プロパティアクセスのために一時的に型を付け替える」書き方。`Record<string, unknown>` は「任意の文字列キーを持ち、値は `unknown`」の型。これで `o.id` などを書けるようになるが、個々のプロパティはまだ `unknown` のままなので、この後 1 つずつ `typeof` で確認する。
- 各プロパティを順に `typeof` で確認。全部通ったら `return true`。
- `memo` は `?:` なので「あるなら `string`、ないなら `undefined`」を許す。

この形の `isTodo` は **5 章 の「Route Handlers」で再び登場します**。サーバー側で受け取った JSON が本当に `Todo` の形かを検証するのに、まさにこの関数を使い回せます。

### 型ガードを通した `unknown` の扱い

`isTodo` を使うと、`unknown` を安全に `Todo` として扱えます。

```ts
const raw: unknown = JSON.parse('{"id":"a1","text":"牛乳","status":"open"}');

if (isTodo(raw)) {
  console.log(raw.text); // ここでは raw は Todo 型
} else {
  console.log("Todo の形ではありません");
}
```

- `if (isTodo(raw))` の中では `raw` の型が `unknown` から `Todo` に絞られている。`.text` や `.id` に安全にアクセスできる。
- `else` 側では絞り込みが成立していないので、`raw` は `unknown` のまま。

これが「`unknown` と `never`」で予告した「`unknown` を絞り込む具体的な方法」です。

## 演習

### 途中から始める場合

新規 StackBlitz の TypeScript テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/typescript>）を開き、`src/types.ts` を以下の内容で作ってから始めてください。

<details>
<summary>`src/types.ts`（これまでに育ててきた版）</summary>

```ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};
```

</details>

### 手順 1: `typeof` 型ガード

`src/main.ts` を次の内容に置き換える。

```ts
function describe(value: string | number): string {
  if (typeof value === "string") {
    return `文字列: ${value.toUpperCase()}`;
  }
  return `数値: ${value.toFixed(2)}`;
}

console.log(describe("hello"));
console.log(describe(3.14));
```

#### 期待出力

```
文字列: HELLO
数値: 3.14
```

わざと絞り込み **なし** で呼ぼうとしてみる。

```ts
function describe(value: string | number): string {
  return value.toUpperCase();
}
```

期待されるメッセージ:

```
Property 'toUpperCase' does not exist on type 'string | number'.
  Property 'toUpperCase' does not exist on type 'number'.
```

`string | number` のままでは `string` 限定のメソッドが呼べない。`typeof` で絞ると呼べるようになることを実感する。確認できたら元に戻す。

### 手順 2: `in` 演算子で分岐

```ts
type TodoItem = { kind: "todo"; text: string };
type NoteItem = { kind: "note"; body: string };
type Item = TodoItem | NoteItem;

function render(item: Item): string {
  if ("text" in item) {
    return `TODO: ${item.text}`;
  }
  return `Note: ${item.body}`;
}

console.log(render({ kind: "todo", text: "牛乳を買う" }));
console.log(render({ kind: "note", body: "今日は良い天気" }));
```

#### 期待出力

```
TODO: 牛乳を買う
Note: 今日は良い天気
```

わざと `if` を外すとどうなるかも確認する。

```ts
function render(item: Item): string {
  return `TODO: ${item.text}`;
}
```

期待されるメッセージ:

```
Property 'text' does not exist on type 'Item'.
  Property 'text' does not exist on type 'NoteItem'.
```

`Item` のままでは `.text` が `NoteItem` に存在しないため呼べない。`in` で絞ってから呼ぶのが正しい。確認できたら元に戻す。

### 手順 3: `unknown` から `Todo` に絞り込むカスタム型ガード

`src/types.ts` は「配列・ユニオン・リテラル型・オプショナル」で育てた形をそのまま使う。

```ts
// src/types.ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};
```

`src/main.ts` を次の内容に置き換える。

```ts
import type { Todo } from "./types";

function isTodo(x: unknown): x is Todo {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string") return false;
  if (typeof o.text !== "string") return false;
  if (o.status !== "open" && o.status !== "done") return false;
  if (o.memo !== undefined && typeof o.memo !== "string") return false;
  return true;
}

const raw1: unknown = JSON.parse(
  '{"id":"a1","text":"牛乳を買う","status":"open"}'
);
const raw2: unknown = JSON.parse('{"id":"a2"}');
const raw3: unknown = "just a string";

function show(raw: unknown): void {
  if (isTodo(raw)) {
    console.log(`OK: ${raw.id} / ${raw.text} / ${raw.status}`);
  } else {
    console.log("NG: Todo の形ではありません");
  }
}

show(raw1);
show(raw2);
show(raw3);
```

#### 期待出力

```
OK: a1 / 牛乳を買う / open
NG: Todo の形ではありません
NG: Todo の形ではありません
```

- `raw1` は `Todo` の形に合致するので `if` に入る。
- `raw2` は `text` が欠けているため弾かれる。
- `raw3` はそもそも文字列なので弾かれる。

### 手順 4: 型ガードなしで使おうとしてエラーを見る

`show` の中で、型ガードを外して直接触ろうとしてみる。

```ts
function show(raw: unknown): void {
  console.log(raw.text);
}
```

期待されるメッセージ:

```
'raw' is of type 'unknown'.
```

`unknown` に対しては絞り込みなしでプロパティアクセスできない。確認できたら型ガード版に戻す。

### 手順 5: `Array.isArray` を使う

「`Todo[]` かどうか」を検証するには、まず配列であることを確かめ、次に各要素が `Todo` かを確かめます。

```ts
function isTodoArray(x: unknown): x is Todo[] {
  if (!Array.isArray(x)) return false;
  return x.every((item) => isTodo(item));
}

const raw4: unknown = JSON.parse(
  '[{"id":"a1","text":"牛乳","status":"open"},{"id":"a2","text":"本","status":"done"}]'
);
const raw5: unknown = JSON.parse('[{"id":"a1"}]');

if (isTodoArray(raw4)) {
  console.log(`Todo 配列 (${raw4.length} 件)`);
} else {
  console.log("Todo 配列ではありません");
}

if (isTodoArray(raw5)) {
  console.log(`Todo 配列 (${raw5.length} 件)`);
} else {
  console.log("Todo 配列ではありません");
}
```

#### 期待出力

```
Todo 配列 (2 件)
Todo 配列ではありません
```

- `Array.isArray(x)` で配列かどうかを先に確認。
- 各要素に対して `isTodo` を呼び、**全部合格** したら `true` を返す。
- 戻り値型 `x is Todo[]` と書いているので、`true` が返った後は呼び出し側で `Todo[]` として `.length` / `.map` 等が使える。

### 変えてみる

`Todo` の `status` に `"archived"` を足したとします（型は一時的に `"open" | "done" | "archived"` とする）。`isTodo` の中の `status` チェックを、3 値に対応するよう書き換える。

```ts
if (o.status !== "open" && o.status !== "done" && o.status !== "archived") {
  return false;
}
```

3 つ以上のリテラル値を許す形の書き方に慣れる。確認できたら、本編を壊さないように `Todo` 型も型ガードも元の 2 値に戻しておく。

### 自分で書く

次の型ガードを自分で書く。

1. `isUser(x: unknown): x is User`
    - `User` 型は `{ id: string; name: string; age: number }` とする（「オブジェクトの型と type エイリアス」で `types.ts` に追加した形）。
    - 戻り値の「`x is User`」を忘れない。
2. `isUserArray(x: unknown): x is User[]`
    - `isTodoArray` を参考に、`Array.isArray` と `.every` を組み合わせて書く。

書けたら、`JSON.parse` で作った `unknown` を 3 パターン（正しい `User` / プロパティ欠け / そもそも配列でない）試し、期待通りに分岐することを確認する。

## まとめ

- 型ガードは「**実行時の確認を通して、TS に型を絞り込ませる**」仕組み。
- `typeof`: プリミティブ（`string` / `number` / `boolean` など）の判定。`typeof null === "object"` の落とし穴に注意。
- `Array.isArray`: 配列かどうかの専用判定。
- `in`: オブジェクトに特定のプロパティがあるかで判定。
- **ユーザー定義型ガード** `function isX(x: unknown): x is X` は、複雑な型を一箇所にまとめて検証するのに便利。「`unknown` と `never`」で受けた `unknown` を、ここでようやく実用的に絞り込めるようになる。
- このレッスンで書いた **`isTodo(x: unknown): x is Todo` のシグネチャは、5 章 の「Route Handlers」で再登場する**。サーバーで受け取った JSON ボディが `Todo` の形かを検証する用途で、そのまま使い回せる。
- 次のレッスンでは、`kind` のような **「種類を表すプロパティ」で自動的に絞り込める** 書き方（判別共用体）を学ぶ。型ガード関数を書かなくても、`switch` だけで分岐できるようになる。
