# lesson48: ジェネリクス入門

## ゴール

- 「どんな型にも使える関数」を書くための仕組みである **ジェネリクス**（型パラメータ `<T>`）を理解する。
- `first<T>(arr: T[]): T | undefined` を自分で書けて、数値配列でも文字列配列でも `Todo` 配列でも動かせる。
- 呼び出し側で型パラメータを明示的に書かなくても、**型推論** が働いて正しい型になることを確認できる。

## 解説

### 「どんな型でも受け入れる関数」を書きたい

配列の先頭の要素を返す関数を書いてみます。数値配列なら次のように書けます。

```ts
function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}
```

- 配列が空なら `arr[0]` は `undefined` なので、戻り値の型は `number | undefined`。
- 文字列配列でも同じことをしたい場合、`firstString(arr: string[]): string | undefined` をもう 1 つ書く必要がある。
- `Todo` 配列でも同じことをしたくなったら、さらにもう 1 つ。

明らかに繰り返しです。中身の処理はどれも `return arr[0];` で同じ。違うのは **配列の要素の型と戻り値の型だけ**。

### ジェネリクス: 型を引数として受け取る

関数が **値** を引数で受け取るのと同じように、TS は **型** を引数で受け取れます。これを **ジェネリクス**（総称型）と呼びます。

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

- `<T>`: 関数名の直後に書く **型パラメータ**。`T` は「まだ決まっていない型」の仮の名前。
- 慣習的に `T`（Type の頭文字）を使う。複数あれば `T, U, V` や `TKey, TValue` のように付ける。
- 引数 `arr: T[]`: 「`T` の配列」。
- 戻り値 `T | undefined`: 「`T`、または空配列のときは `undefined`」。

この関数を呼び出すとき、`T` には **呼び出したときの値の型が自動で入ります**。

```ts
const n = first([1, 2, 3]);         // T = number、n は number | undefined
const s = first(["a", "b", "c"]);   // T = string、s は string | undefined
```

これが **型推論** です。呼び出し側が `<number>` のように書かなくても、渡した値の型から TS が決めてくれます。

### 明示的に書くこともできる

型推論に任せず、呼び出し側で `<型>` を明示することもできます。

```ts
const n = first<number>([1, 2, 3]);
```

普段は型推論に任せるほうが読みやすいですが、推論の結果が期待と違うときや、配列が空で推論のヒントがないときには明示します。

```ts
const empty = first([]); // T = never と推論されてしまう
const empty2 = first<number>([]); // T = number と明示
```

空配列 `[]` には型のヒントがないため、TS は `T` の候補を絞れず **最も狭い `never`** を選びます。`never[]` は何も入れられない型なので、その後の処理で結局困ります。空配列を渡すケースでは `<number>` のように **使う側が型を明示** すれば期待どおりに動きます。

### 型パラメータは「使う側が決める」

ジェネリクスは「関数を書く側」ではなく「関数を使う側」が型を決める仕組みです。`first` の実装は `T` が何であるかを知りません。だから `T` の中身（`.toUpperCase()` や `.toFixed()` など）を呼ぶことはできません。

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0].toUpperCase(); // エラー
}
```

```
Property 'toUpperCase' does not exist on type 'T'.
```

「`T` が何かは分からないので、その型にしかない操作は呼べない」という TS の警告です。この「中身に触らず通すだけの関数」が、ジェネリクスが最も活きる形です。

### `Array.prototype.map` もジェネリクス

実は2 章 で使った `map` / `filter` も TS の世界ではジェネリクス関数です。`map` は「`T[]` を受け取って、`(t: T) => U` の関数で変換して `U[]` を返す」という形で定義されています。ライブラリの内部ではこの形の型定義が大量に書かれていて、私たちは呼び出すだけで恩恵を受けています。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の TypeScript（Vanilla TS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/typescript>）から始められます。

### 手順 1: `first` を書く

`src/main.ts` の中身を以下に置き換える。

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);
const s = first(["a", "b", "c"]);
const empty = first<number>([]);

console.log(n);
console.log(s);
console.log(empty);
```

#### 期待出力

```
1
a
undefined
```

- `n` は `1`（数値）。
- `s` は `"a"`（文字列）。
- `empty` は `undefined`（空配列なので 0 番目がない）。

エディタで `n` にマウスを乗せると `const n: number | undefined` と表示される。`s` は `const s: string | undefined`。型が正しく推論されていることを確認する。

### 手順 2: `Todo` 配列でも動くことを確認する

`src/main.ts` を次の形に書き換える（`types.ts` は「配列・ユニオン・リテラル型・オプショナル」で作ったものをそのまま使う）。

```ts
import type { Todo } from "./types";

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const todos: Todo[] = [
  { id: "a1", text: "牛乳を買う", status: "open" },
  { id: "a2", text: "本を返す", status: "done", memo: "駅前の図書館" },
];

const topTodo = first(todos);

if (topTodo) {
  console.log(`先頭の TODO: ${topTodo.text} (status: ${topTodo.status})`);
} else {
  console.log("TODO はありません");
}
```

#### 期待出力

```
先頭の TODO: 牛乳を買う (status: open)
```

`topTodo` の型は `Todo | undefined` になっている（`if` で絞り込むと、中では `Todo` として `.text` や `.status` にアクセスできる）。

### 手順 3: わざと型を間違えてエラーを見る

`first` の中で `T` の中身を使おうとしてみる。

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0].toUpperCase();
}
```

期待されるメッセージ:

```
Property 'toUpperCase' does not exist on type 'T'.
```

続けて、呼び出し側で配列ではないものを渡してみる。

```ts
const n = first(123);
```

期待されるメッセージ:

```
Argument of type 'number' is not assignable to parameter of type 'unknown[]'.
```

「配列を渡してくれないと `T[]` にならない」と TS が止めてくれている。確認したら `first([1, 2, 3])` に戻す。

### 変えてみる

配列の最後の要素を返す `last` を書いてみる。

```ts
function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

console.log(last([1, 2, 3]));
console.log(last(["a", "b", "c"]));
console.log(last<number>([]));
```

期待出力:

```
3
c
undefined
```

### 自分で書く

次の 2 つの関数をジェネリクスで書く。

1. `second<T>(arr: T[]): T | undefined` — 配列の 2 番目の要素を返す（なければ `undefined`）。
2. `wrapInArray<T>(value: T): T[]` — 値を 1 つ受け取り、それだけを入れた配列を返す。

書けたら、数値・文字列・`Todo` の 3 パターンで呼び出し、期待通りの型が推論されていること（エディタでマウスオーバーして確認）と、期待通りの出力が出ることを確認する。

`wrapInArray` のヒント: `function wrapInArray<T>(value: T): T[] { return [value]; }` で書ける。

## まとめ

- ジェネリクスは「関数が型を引数として受け取る仕組み」。`<T>` で仮の型名を宣言する。
- `first<T>(arr: T[]): T | undefined` のように書くと、数値配列でも文字列配列でも `Todo` 配列でも、**同じ実装** で型安全に動く。
- 呼び出し側では通常 `<型>` を書かず、型推論に任せる。空配列などで推論のヒントがないときだけ明示する。
- 実装の中では `T` の中身に触れない（`T` が何かを知らないから）。「中身に触らず通すだけ」の関数がジェネリクスの得意分野。
