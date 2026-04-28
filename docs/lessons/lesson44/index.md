# lesson44: 配列・ユニオン・リテラル型・オプショナル

## ゴール

- 配列の型を `T[]` / `Array<T>` の 2 通りで書ける。
- 「この型 **または** あの型」を表す **ユニオン型**（`|`）を書ける。
- 「特定の値のみ許す」 **リテラル型** を書ける。
- 省略可能なプロパティ `?:` を書ける。
- 「オブジェクトの型と type エイリアス」の `Todo` 型に `status: "open" | "done"` と `memo?: string` を足して、育てた `Todo` 型で配列を扱える。

## 解説

### 配列の型

2 章 で書いた配列に型を付けていきます。配列の型は 2 通りの書き方があります。どちらも意味は同じです。

```ts
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["Alice", "Bob"];
```

- `number[]`: 「数値の配列」。短くて読みやすいので普段はこちら。
- `Array<number>`: 「`Array` という型に `number` を流し込んだもの」。ジェネリクス（「ジェネリクス入門」で扱う）の書き方。

どちらも、中身の型が合わないとエラーになる。

```ts
const numbers: number[] = [1, 2, "3"];
```

```
Type 'string' is not assignable to type 'number'.
```

### ユニオン型 `|`

「文字列 **または** 数値」のように、複数の型のどれかを受け入れる型を **ユニオン型** と呼びます。

```ts
let id: string | number;
id = "abc123"; // OK
id = 42;        // OK
id = true;      // エラー
```

```
Type 'boolean' is not assignable to type 'string | number'.
```

ユニオン型の値を使うときは、どちらの型の操作でも共通して使える部分しか呼べません。例えば `string | number` に対しては文字列だけが持つ `.toUpperCase()` は呼べません。使い分けたいときは `typeof` で絞り込みます（このコースでは深追いしない）。

### リテラル型

TS では **値そのもの** を型として使えます。これを **リテラル型** と呼びます。

```ts
let answer: "yes";
answer = "yes"; // OK
answer = "no";  // エラー
```

```
Type '"no"' is not assignable to type '"yes"'.
```

これだけだと使い道がありませんが、ユニオン型と組み合わせると強力です。

```ts
let status: "open" | "done" | "archived";
status = "open";     // OK
status = "done";     // OK
status = "archived"; // OK
status = "todo";     // エラー
```

```
Type '"todo"' is not assignable to type '"open" | "done" | "archived"'.
```

「この変数には `"open"` か `"done"` か `"archived"` のどれかしか入らない」ということが型で書けます。2 章 で文字列リテラルを比較していた部分（`if (status === "done")` など）が、typo まで含めて TS が守ってくれるようになります。

### オプショナルプロパティ `?:`

オブジェクトのプロパティのうち「あってもなくてもよい」ものは、名前の後ろに `?` を付けます。

```ts
type User = {
  name: string;
  email?: string;
};

const alice: User = { name: "Alice" };                          // OK
const bob: User = { name: "Bob", email: "bob@example.com" };    // OK
```

- `email?: string` は「`email` は省略してもよい。書くなら `string`」という意味。
- 省略した場合、`user.email` の型は `string | undefined` になる（`undefined` も入りうる、ということ）。

`undefined` が入りうるので、使う側では存在チェックが必要になります。

```ts
function printEmail(user: User): void {
  if (user.email) {
    console.log(user.email.toUpperCase());
  } else {
    console.log("メールなし");
  }
}
```

`if (user.email)` を付けずに `user.email.toUpperCase()` とだけ書くと、TS が次のように止めます。

```
'user.email' is possibly 'undefined'.
```

### `Todo` 型を育てる

「オブジェクトの型と type エイリアス」の `Todo` 型を次の形に育てます。

```ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};
```

- `status`: `"open"` か `"done"` のどちらか。必須。
- `memo?`: 省略可能な自由記述のメモ。書くなら文字列。

これで「未完了 / 完了」を型レベルで表せるようになり、`Todo[]` は「育った `Todo` の配列」になります。

## 演習

### 途中から始める場合

新規 StackBlitz の TypeScript テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/typescript>）を開き、`src/types.ts` を以下の内容で作ってから始めてください。

<details>
<summary>`src/types.ts`（これまでに育ててきた版）</summary>

```ts
export type Todo = {
  id: string;
  text: string;
};
```

</details>

### 手順 1: 配列の型に慣れる

`src/main.ts` の中身を以下に置き換える。

```ts
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["Alice", "Bob", "Charlie"];

for (const n of numbers) {
  console.log(n);
}

for (const name of names) {
  console.log(name);
}
```

#### 期待出力

```
1
2
3
Alice
Bob
Charlie
```

わざと要素の型を間違えてみる。

```ts
const numbers: number[] = [1, 2, "3"];
```

期待されるメッセージ:

```
Type 'string' is not assignable to type 'number'.
```

確認したら `[1, 2, 3]` に戻す。

### 手順 2: ユニオン型とリテラル型

```ts
let id: string | number;

id = "abc123";
console.log(id);

id = 42;
console.log(id);
```

#### 期待出力

```
abc123
42
```

次に `true` を代入してみる。

```ts
id = true;
```

期待されるメッセージ:

```
Type 'boolean' is not assignable to type 'string | number'.
```

赤線を確認したら、**`id = true;` の行は消して** 次に進む（残しておくと後続コードが実行されない可能性がある）。続けて、リテラル型のユニオンを試す。

```ts
let status: "open" | "done" | "archived";
status = "open";
console.log(status);
status = "done";
console.log(status);
status = "todo"; // typo わざと
```

期待されるメッセージ:

```
Type '"todo"' is not assignable to type '"open" | "done" | "archived"'.
```

確認したら `status = "todo";` の行を消すか、正しい値（`"archived"` など）に直す。

### 手順 3: `Todo` 型を育てる

`src/types.ts` を次の形に書き換える。

```ts
// src/types.ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};
```

`src/main.ts` を次の形に書き換える。

```ts
import type { Todo } from "./types";

const todos: Todo[] = [
  { id: "a1", text: "牛乳を買う", status: "open" },
  { id: "a2", text: "本を返す", status: "done", memo: "駅前の図書館" },
  { id: "a3", text: "ゴミを出す", status: "open" },
];

function printTodo(todo: Todo): void {
  const mark = todo.status === "done" ? "x" : " ";
  const memoText = todo.memo ? ` (memo: ${todo.memo})` : "";
  console.log(`[${mark}] ${todo.text}${memoText}`);
}

for (const todo of todos) {
  printTodo(todo);
}
```

#### 期待出力

```
[ ] 牛乳を買う
[x] 本を返す (memo: 駅前の図書館)
[ ] ゴミを出す
```

`memo` を持つ項目だけ `(memo: ...)` が付き、完了しているものは `[x]`、未完了は `[ ]` になる。

### 手順 4: 型のミスを見つけてもらう

次の 3 つをそれぞれ試し、メッセージを確認する。確認したら元に戻す。

```ts
const todos: Todo[] = [
  { id: "a1", text: "牛乳を買う", status: "todo" }, // typo
];
```

```
Type '"todo"' is not assignable to type '"open" | "done"'.
```

```ts
const todos: Todo[] = [
  { id: "a1", text: "牛乳を買う" }, // status が足りない
];
```

```
Property 'status' is missing in type '{ id: string; text: string; }' but required in type 'Todo'.
```

```ts
function printTodo(todo: Todo): void {
  console.log(todo.memo.toUpperCase());
}
```

```
'todo.memo' is possibly 'undefined'.
```

最後のパターンは、オプショナルプロパティが `undefined` になりうることを TS が警告してくれている例。`if (todo.memo)` を挟んでから `toUpperCase()` するのが正しい使い方。

### 変えてみる

`printTodo` の中で「未完了の TODO のテキストを大文字にして目立たせる」実装にしてみる。

```ts
function printTodo(todo: Todo): void {
  if (todo.status === "open") {
    console.log(`TODO: ${todo.text.toUpperCase()}`);
  } else {
    console.log(`DONE: ${todo.text}`);
  }
}
```

期待出力:

```
TODO: 牛乳を買う
DONE: 本を返す
TODO: ゴミを出す
```

### 自分で書く

`Todo` 型の配列 `todos` に対して、次の 2 つの関数を書く。

1. `countOpen(todos: Todo[]): number` — `status === "open"` の件数を返す。
2. `filterDone(todos: Todo[]): Todo[]` — `status === "done"` のものだけを新しい配列で返す。

呼び出して結果を Console に出す。使える道具は2 章 で学んだ `for...of`、`filter`、`length` など。どれを使っても構わない。

### スコープ外の明記

TS には「列挙型」を作る `enum` や、値を型に格上げする `as const` という機能もあります。**本コースでは扱いません**。理由は次の通り。

- `"open" | "done"` のようなリテラル型ユニオンで、列挙型が担う用途のほとんどは代替できる。
- `enum` はランタイムにコードを生成するため、`import type` で消せない副作用を持つ。
- `as const` は学習コストに対してこのコースのゴール（Next.js で小さなアプリ）への寄与が薄い。

使う場面に出会ったら、そのときに公式ドキュメントを読めば十分追いつけます。

## まとめ

- 配列の型は `T[]` / `Array<T>` の 2 通り。普段は `T[]`。
- ユニオン型 `A | B` で「どちらでも受け入れる」が書ける。
- リテラル型とユニオン型を組み合わせると、`"open" | "done"` のように「決まった値だけ許す」型が書ける。
- `?:` で省略可能なプロパティを書ける。使う側では `undefined` を意識した分岐が必要。
- `enum` / `as const` は本コースでは扱わない。
