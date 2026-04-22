# lesson38: 判別共用体（discriminated union）

## ゴール

- オブジェクトのユニオン型に「種類を表す文字列リテラルのプロパティ」を付ける形（**判別共用体**）を書ける。
- `switch (state.kind)` で各ケースに分岐すると、TS が自動的に型を絞り込んでくれることを体験する。
- 画面の状態（ローディング / 成功 / エラー）を判別共用体で表現し、1 つの型でまるごと扱えるようになる。
- この形が章 4 lesson47 `useReducer` の `Action` 型で再登場する流れを理解する。

## 解説

### 判別共用体とは

lesson35 でユニオン型 `A | B` を、lesson37 で `in` 演算子による絞り込みを学びました。これをさらに読み書きしやすくしたのが **判別共用体**（discriminated union、タグ付きユニオンとも呼ばれます）です。

ポイントは **全ケースで共通の名前のプロパティ** を持ち、その値は **それぞれ別のリテラル型** にすることです。

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number };
```

- 共通プロパティ `kind` は全ケースで存在する。
- `kind` の値は `"circle"` / `"square"` / `"rectangle"` とケースごとに違うリテラル。
- それ以外のプロパティ（`radius`、`side`、`width` / `height`）はケース固有。

この「`kind` という共通プロパティの値で種類を見分ける」形を判別共用体と呼びます。共通プロパティの名前は `kind` でも `type` でも `tag` でも構いませんが、本コースでは **`kind`** に統一します（`type` は予約語ではないものの、型注釈の文脈で紛らわしいため）。

### `switch` で自動絞り込み

判別共用体の最大の嬉しさは、`switch` で **何も書かずに型が絞り込まれる** 点です。

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

- `case "circle":` のブロックでは `shape` の型が `{ kind: "circle"; radius: number }` に絞られている。`shape.radius` が使える。
- `case "square":` の中では `shape.side`、`case "rectangle":` の中では `shape.width` / `shape.height` が使える。
- `in` 演算子も `typeof` もカスタム型ガードも書いていないのに、TS が `kind` の値から自動で絞り込む。

`switch` の条件に「**判別用プロパティ**」を指定するだけで、各 `case` が局所的な型付けになる。これが判別共用体を使う一番大きな動機です。

### 網羅性チェックとの組み合わせ

lesson36 で学んだ `never` による網羅性チェックを組み合わせると、ケース追加時に漏れを検出できます。

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default: {
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}
```

`Shape` に新しいケースを足すと、`default` 節の `_exhaustive` に赤線が出て、`area` を直し忘れていることを教えてくれます。

### 画面の状態を判別共用体で表す

実用面でよく登場するのが **画面の状態** です。データを取ってきて表示する画面は、ざっくり 3 つの状態を取ります。

- まだ読み込み中（ローディング）
- 成功してデータがある
- 失敗してエラーメッセージがある

これを判別共用体で 1 つの型にまとめます。

```ts
import type { Todo } from "./types";

type TodoState =
  | { kind: "loading" }
  | { kind: "success"; todos: Todo[] }
  | { kind: "error"; message: string };
```

- `"loading"` のときは他に何もいらない。
- `"success"` のときだけ `todos` がある。
- `"error"` のときだけ `message` がある。

これを使う関数は、`switch` で自然に分岐できる。

```ts
function describe(state: TodoState): string {
  switch (state.kind) {
    case "loading":
      return "読み込み中...";
    case "success":
      return `${state.todos.length} 件の TODO があります`;
    case "error":
      return `エラー: ${state.message}`;
  }
}
```

- `case "loading":` のブロックでは `state` に `todos` も `message` もない。
- `case "success":` のブロックでは `state.todos` だけある。`state.message` と書くと赤線が出る。
- `case "error":` のブロックでは `state.message` だけある。

**存在しないプロパティにアクセスしようとすると TS が止めてくれる**。これが判別共用体の安全性です。

### 章 2 の JS との違い（オブジェクトリテラル辞書ではなく型で）

章 2 までは、似たようなことを「オブジェクトリテラル辞書」や「`if` チェーン」で書いていました。判別共用体を使うと、**型定義を見るだけでどんな状態があるかが一目で分かる**、**各状態で使えるプロパティが TS に守られる** という 2 つの利点が一気に手に入ります。

### `kind` 以外の名前を使うとき

既存のライブラリやサンプルでは、共通プロパティ名に `type`（HTTP のアクション種別など）を使っているものをよく見ます。

```ts
type Action =
  | { type: "add"; text: string }
  | { type: "delete"; id: string }
  | { type: "toggle"; id: string };
```

これも立派な判別共用体です。名前の選び方は、**そのデータが自然に呼ばれる語に合わせる** くらいで十分。本コースでは画面の状態には `kind`、Redux 風の動作には `type` を使い分けます（どちらも中身の仕組みは同じ）。

## 演習

### 手順 1: `Shape` の判別共用体

`src/main.ts` の中身を以下に置き換える。

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default: {
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}

console.log(area({ kind: "circle", radius: 2 }));
console.log(area({ kind: "square", side: 3 }));
console.log(area({ kind: "rectangle", width: 4, height: 5 }));
```

#### 期待出力

```
12.566370614359172
9
20
```

エディタで `case "circle":` の中の `shape` にマウスを乗せると `{ kind: "circle"; radius: number }` と出る。`kind` の値で型が絞られていることが確認できる。

### 手順 2: わざと他ケースのプロパティを触る

`case "circle":` の中で `shape.side` を参照してみる。

```ts
case "circle":
  return Math.PI * shape.side ** 2;
```

期待されるメッセージ:

```
Property 'side' does not exist on type '{ kind: "circle"; radius: number; }'.
```

`"circle"` のケースでは `side` は存在しないので、触らせてもらえない。確認できたら `shape.radius` に戻す。

### 手順 3: `TodoState` を書く

lesson35 で作った `src/types.ts` の `Todo` をそのまま使う。`src/main.ts` を次の内容に置き換える。

```ts
import type { Todo } from "./types";

type TodoState =
  | { kind: "loading" }
  | { kind: "success"; todos: Todo[] }
  | { kind: "error"; message: string };

function describe(state: TodoState): string {
  switch (state.kind) {
    case "loading":
      return "読み込み中...";
    case "success":
      return `${state.todos.length} 件の TODO があります`;
    case "error":
      return `エラー: ${state.message}`;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

const s1: TodoState = { kind: "loading" };
const s2: TodoState = {
  kind: "success",
  todos: [
    { id: "a1", text: "牛乳を買う", status: "open" },
    { id: "a2", text: "本を返す", status: "done" },
  ],
};
const s3: TodoState = { kind: "error", message: "ネットワーク切断" };

console.log(describe(s1));
console.log(describe(s2));
console.log(describe(s3));
```

#### 期待出力

```
読み込み中...
2 件の TODO があります
エラー: ネットワーク切断
```

### 手順 4: ケース追加で網羅性が崩れる様子

`TodoState` に `"empty"` を追加してみる。

```ts
type TodoState =
  | { kind: "loading" }
  | { kind: "success"; todos: Todo[] }
  | { kind: "error"; message: string }
  | { kind: "empty" };
```

`describe` の本体は触らない。すると `default:` の `const _exhaustive: never = state;` に赤線が出る。

期待されるメッセージ:

```
Type '{ kind: "empty"; }' is not assignable to type 'never'.
```

「`"empty"` のケースが処理されていない」と TS が教えてくれる。`case "empty":` を足して処理を書くと赤線が消える。

```ts
case "empty":
  return "TODO はまだありません";
```

実行して `describe({ kind: "empty" })` が `TODO はまだありません` を返すことを確認する。

### 手順 5: わざと存在しないプロパティを触る

`case "error":` のブロックで、`state.todos` を触ろうとしてみる。

```ts
case "error":
  return `エラー: ${state.message} (${state.todos.length} 件)`;
```

期待されるメッセージ:

```
Property 'todos' does not exist on type '{ kind: "error"; message: string; }'.
```

`"error"` のケースに `todos` は存在しない。判別共用体は **そのケースで本当にあるプロパティだけにアクセスを許可する**。確認できたら `state.todos` の部分は消す。

### 変えてみる

共通プロパティの名前を `kind` から `type` に変えてみる。

```ts
type TodoState =
  | { type: "loading" }
  | { type: "success"; todos: Todo[] }
  | { type: "error"; message: string };
```

`switch (state.type)` に変えれば、`kind` のときと完全に同じように動く。呼び出し側のオブジェクトリテラルも `{ type: "loading" }` のように変える。**名前が変わっても挙動は同じ** ことを確認する。

確認できたら `kind` に戻す（本コースでは状態には `kind` を使う）。

### 自分で書く

次の判別共用体と関数を自分で書く。

```ts
type FetchResult<T> =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; data: T }
  | { kind: "error"; message: string };
```

- この `FetchResult` は lesson39 で学ぶジェネリクスを先取りしている形。`T` にどんな型を入れても使える。
- `function render(r: FetchResult<string>): string` を書き、`"idle"` は `"待機中"`、`"loading"` は `"読み込み中"`、`"success"` は `data` をそのまま、`"error"` は `message` を返すようにする。
- `default:` で `const _: never = r;` の網羅性チェックを付ける。

書けたら 4 パターンの `FetchResult<string>` を作って呼び出し、期待通りの文字列が返ることを確認する。

## まとめ

- **判別共用体** は「全ケースで共通の名前のプロパティを持ち、値が別々のリテラル」のユニオン型。
- `switch (x.kind)` で分岐するだけで、各 `case` の中の型が自動で絞り込まれる。
- 存在しないプロパティを触ろうとすると TS が止めてくれる。
- `never` による網羅性チェックと組み合わせると、ケース追加時に処理漏れを検出できる。
- 共通プロパティの名前は `kind` / `type` / `tag` のどれでもよい。本コースでは状態表現に `kind`、動作表現に `type` を使う。
- **この判別共用体パターンは章 4 lesson47 の `useReducer` の `Action` 型で再登場します**。`{ type: "add"; text: string } | { type: "delete"; id: string } | { type: "toggle"; id: string }` の形で、ここで学んだ `switch` 分岐と網羅性チェックがそのまま効きます。
- 次のレッスン（lesson39）では、`FetchResult<T>` のように「型を引数として受け取る」ジェネリクスを学ぶ。判別共用体とジェネリクスを組み合わせると、実用的なデータ構造が一気に書けるようになる。
