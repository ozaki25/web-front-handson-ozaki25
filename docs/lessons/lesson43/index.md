# lesson43: オブジェクトの型と type エイリアス

## ゴール

- オブジェクトの「形」を型で書ける（オブジェクト型リテラル）。
- `type` エイリアスで型に名前を付けられる。
- `export type` / `import type` で型を別ファイルから使い回せる。

## 解説

### オブジェクトの型を書く

2 章 の「オブジェクト」で、オブジェクトを使って「人」や「TODO」のような複数の値をまとめました。TS ではそのオブジェクトの **形** を型で書けます。

```ts
const user: { name: string; age: number } = {
  name: "Alice",
  age: 20,
};
```

- `{ name: string; age: number }` が **オブジェクト型リテラル**。波括弧の中に「プロパティ名: 型」を並べる。
- プロパティの区切りは **セミコロン `;`**（カンマでも通るが、TS では `;` が慣例）。
- 値のオブジェクト（右辺）はプロパティの区切りが **カンマ `,`**。左と右で記号が違うので注意する。

このオブジェクトに、宣言した形と違う値を入れるとエラーになる。

```ts
const user: { name: string; age: number } = {
  name: "Alice",
  age: "二十", // ここで赤線
};
```

```
Type 'string' is not assignable to type 'number'.
```

プロパティが足りない / 余っている場合もエラーになる。

```ts
const user: { name: string; age: number } = {
  name: "Alice",
}; // age が足りない
```

```
Property 'age' is missing in type '{ name: string; }' but required in type '{ name: string; age: number; }'.
```

### `type` エイリアスで名前を付ける

同じオブジェクト型を何か所も書くのは大変です。`type` キーワードで型に **名前** を付けられます。

```ts
type User = {
  name: string;
  age: number;
};

const alice: User = { name: "Alice", age: 20 };
const bob: User = { name: "Bob", age: 25 };
```

- `type 名前 = 型の中身;` の形。末尾のセミコロンを忘れない。
- 慣習として、型の名前は **大文字で始める**（`User`、`Todo` など）。変数とぶつかりにくくするため。
- `type` エイリアスは「型に別名を付けるだけ」なので、コンパイル後の JS には残らない（実行時には影響しない）。

関数の引数にも使える。

```ts
function printUser(user: User): void {
  console.log(`${user.name} (${user.age})`);
}

printUser(alice);
```

### 型を別ファイルに置く（`export type` / `import type`）

同じ型をあちこちのファイルで使う場面では、型だけをまとめたファイルを作ります。慣習的に `types.ts` という名前にすることが多いです。

```ts
// src/types.ts
export type User = {
  name: string;
  age: number;
};
```

`export type` と書くと、この型を他のファイルから読み込めるようになります。

使う側は `import type` で読み込みます。

```ts
// src/main.ts
import type { User } from "./types";

const alice: User = { name: "Alice", age: 20 };
console.log(alice);
```

- `import type { ... } from "./types";` と書く。`import` の後ろに `type` が付いているのがポイント。
- `import type` で読み込んだ名前は **型の場所でしか使えない**（値としては使えない）。これは TS が「この import はコンパイル後の JS からは完全に消してよい」と判断できるようにするための書き方。
- 普通の `import { User }` でも動くが、`import type` のほうが意図がはっきりして、ビルド後のサイズにも優しい。

### TODO 1 件を型にする

リスト系のアプリでよくある「項目 1 件」のオブジェクトは、たとえばこういう形になります。

```js
{ id: "abc123", text: "牛乳を買う" }
```

この形を TS で書くと次のようになります。

```ts
type Todo = {
  id: string;
  text: string;
};
```

このレッスンでは、`id` と `text` の 2 プロパティだけの最小の `Todo` 型を作り、**全プロパティが必須** の形だけを書きます。「未完了 / 完了」の状態や「メモ」のようなオプショナルなプロパティは扱いません。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の TypeScript（Vanilla TS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/typescript>）から始められます。

### 手順 1: `User` 型を書く

`src/main.ts` の中身を以下に置き換える。

```ts
type User = {
  name: string;
  age: number;
};

const alice: User = { name: "Alice", age: 20 };
const bob: User = { name: "Bob", age: 25 };

function printUser(user: User): void {
  console.log(`${user.name} (${user.age})`);
}

printUser(alice);
printUser(bob);
```

#### 期待出力

```
Alice (20)
Bob (25)
```

### 手順 2: わざとプロパティを欠けさせてエラーを見る

次のように書き換えて、赤線が出る場所を確認する。

```ts
const charlie: User = { name: "Charlie" };
```

期待されるメッセージ:

```
Property 'age' is missing in type '{ name: string; }' but required in type 'User'.
```

続けて、余分なプロパティも試す。

```ts
const dave: User = { name: "Dave", age: 30, email: "dave@example.com" };
```

期待されるメッセージ:

```
Object literal may only specify known properties, and 'email' does not exist in type 'User'.
```

「`User` 型に `email` というプロパティは定義されていない」と教えてくれている。

### 手順 3: `types.ts` を作って `Todo` 型を置く

1. StackBlitz で `src/` の下に新しいファイル `types.ts` を作る。
2. 中身を次のように書く。

```ts
// src/types.ts
export type Todo = {
  id: string;
  text: string;
};
```

3. `src/main.ts` を次のように書き換える。

```ts
import type { Todo } from "./types";

const todos: Todo[] = [
  { id: "a1", text: "牛乳を買う" },
  { id: "a2", text: "本を返す" },
];

function printTodo(todo: Todo): void {
  console.log(`- [${todo.id}] ${todo.text}`);
}

for (const todo of todos) {
  printTodo(todo);
}
```

`Todo[]` は「`Todo` の配列」を意味する型注釈。ここでは「配列の各要素が `Todo` 型」とだけ理解しておけばよい。

#### 期待出力

Console に次のように出る。

```
- [a1] 牛乳を買う
- [a2] 本を返す
```

### 手順 4: 型に合わない値を入れてエラーを見る

`printTodo` に TODO ではないものを渡してみる。

```ts
printTodo({ id: "a3" }); // text が足りない
```

期待されるメッセージ:

```
Argument of type '{ id: string; }' is not assignable to parameter of type 'Todo'.
  Property 'text' is missing in type '{ id: string; }' but required in type 'Todo'.
```

続けて、`id` に数値を入れてみる。

```ts
printTodo({ id: 3, text: "書類を出す" });
```

期待されるメッセージ:

```
Type 'number' is not assignable to type 'string'.
```

### 変えてみる

`types.ts` の `Todo` 型の `text` プロパティを一時的に `number` に変えてみる。

```ts
export type Todo = {
  id: string;
  text: number; // わざと変える
};
```

`main.ts` の配列で定義した各 `{ id: ..., text: "..." }` の `text` の下に一斉に赤線が出るのを確認する。型を 1 か所変えると、その型を **import している全ファイル** で整合性のチェックが走るのが TS の強み。

確認できたら `text: string` に戻す。

### 自分で書く

`types.ts` に **新しい型** `User` を追記する（`Todo` はそのまま残す）。

```ts
export type User = {
  id: string;
  name: string;
  age: number;
};
```

`main.ts` から `import type { User } from "./types";` で読み込み、`User` 型の配列を 3 件作って、各ユーザーの `name` と `age` を Console に出す関数を書く。`printUser(user: User): void` の形。

書けたら、わざと `age` に文字列を入れるなどしてエラーメッセージを確認してから戻す。

## まとめ

- オブジェクト型は `{ プロパティ名: 型; ... }` で書く。区切りはセミコロン。
- `type 名前 = ...` で型に名前を付けられる。型の名前は大文字始まりが慣習。
- 型を別ファイルに置くときは `export type`、使う側は `import type` で読み込む。型専用の import と明示できる。
