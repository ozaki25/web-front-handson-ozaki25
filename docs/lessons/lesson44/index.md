# lesson44: `interface` と `type` の使い分け

## ゴール

- `interface` 宣言でオブジェクトの形に名前を付けられる。
- `extends` で `interface` を継承して、既存の型を拡張できる。
- `type` と `interface` の書き分けと、それぞれが得意とする場面を説明できる。
- 本コースでは `type` を基本に使う方針を理解する。

## 解説

### `interface` でオブジェクトの形に名前を付ける

「オブジェクトの型と type エイリアス」では `type` エイリアスでオブジェクトの型に名前を付けました。TS にはもう 1 つ、**`interface`** という構文があります。`interface` はオブジェクトの「形」に名前を付けるための専用構文です。

```ts
interface User {
  name: string;
  age: number;
}

const alice: User = { name: "Alice", age: 20 };
```

- `interface 名前 { ... }` の形。`type` と違い **末尾の `=` やセミコロンは書かない**。
- 中身の書き方（プロパティ名と型、区切りのセミコロン）は `type` のオブジェクト型リテラルと同じ。
- 慣習として大文字で始める（`User`、`Todo` など）。

同じ型が必要な場所で呼び出せるのも `type` と同じです。

```ts
function printUser(user: User): void {
  console.log(`${user.name} (${user.age})`);
}

printUser(alice);
```

型として見たときの振る舞いは、上のようなシンプルなオブジェクトの場合はほとんど `type` と同じです。違うのは **書き方** と **拡張の仕方**、そして **書けない型の種類** です。

### `extends` で継承する

`interface` は `extends` で **別の `interface` を継承** できます。継承すると、元のプロパティを全部引き継いだうえで、新しいプロパティを足せます。

```ts
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}

const admin: AdminUser = {
  id: "u001",
  name: "Alice",
  role: "admin",
  permissions: ["read", "write"],
};
```

- `AdminUser` は `User` のプロパティ（`id` と `name`）に加え、`role` と `permissions` を持つ。
- `extends` の右にカンマで並べれば、**複数の `interface`** を継承することもできる。

継承したプロパティを欠けさせるとエラーになります。

```ts
const admin: AdminUser = {
  id: "u001",
  role: "admin",
  permissions: ["read", "write"],
}; // name が足りない
```

```
Property 'name' is missing in type '{ id: string; role: "admin"; permissions: string[]; }' but required in type 'AdminUser'.
```

### `type` でも同じことは書ける

`type` エイリアスでも、**交差型** `&` を使えば継承に似たことが書けます。

```ts
type User = {
  id: string;
  name: string;
};

type AdminUser = User & {
  role: "admin";
  permissions: string[];
};
```

`User & { ... }` は「`User` のプロパティ **かつ** `{ role, permissions }` のプロパティを両方持つ型」という意味。`interface extends` とほぼ同じ結果になります。

### `type` だけが書けるもの

次のような型は `interface` では書けません。`type` 専用です。

1. **ユニオン型**（`A | B`）

    ```ts
    type Id = string | number;
    ```

    `interface Id = string | number;` のようには書けない。

2. **交差型**（`A & B`）

    `interface` を `extends` で合成するのとは別に、既存の型同士を `&` で組み合わせるのは `type` の役目。

3. **リテラル型 / プリミティブ型のエイリアス**

    ```ts
    type Status = "open" | "done";
    type Age = number;
    ```

4. **Utility Types の結果に名前を付ける**

    「Utility Types で仕上げる」で学ぶ `Pick` / `Partial` などの結果は `type` で受ける。

    ```ts
    type TodoDraft = Partial<Todo>;
    ```

このあたりは「`interface` はオブジェクトの形の宣言専用。それ以外の型操作は `type` で」と覚えておくとよいです。

### 使い分けの指針

両方書けるのでどちらを使うべきか迷いますが、本コースでは次の方針で進めます。

- **基本は `type`** に統一する
  - オブジェクト型・ユニオン・交差・Utility Types を **同じ書き方（`type ...=`）で書ける** ので、読者側の認知コストが低い。
  - 3 章 で `status: "open" | "done"` のようなユニオン・リテラル型が多用されるため、`type` で書けない場面は実質ない。
- `interface` は「存在を知っている」状態にする
  - 外部ライブラリの型定義（`@types/...`）では `interface` が多用される。読めるようにしておく必要がある。
  - 将来チームで書く際に `interface` を選ぶ流儀もある。読み書きの両方できるようにしておけば困らない。

要するに「どちらも書けるようになってから、本コースでは `type` で揃える」という立ち位置です。

### 宣言マージについて（本編では扱わない）

`interface` には「同じ名前の `interface` を複数書くとプロパティが合体する」 **宣言マージ** という挙動があります。

```ts
interface User {
  name: string;
}

interface User {
  age: number;
}

// ここで User は { name: string; age: number; } と同等
```

便利に見えますが、読み手が「どこでマージされているか」を追わなければならず、意図しない衝突も起こりえます。本コースでは **この機能は使いません**。`type` に統一する方針と合わせて、「1 つの型は 1 つの宣言で書く」と覚えておいてください。

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

### 手順 1: `interface Todo` で書き直す

これまでのレッスンで作った `src/types.ts` の `Todo` 型（`type` で書いたもの）を、一度 `interface` で書き直して挙動を確かめます。

`src/types.ts` を次のように書き換える。

```ts
// src/types.ts
export interface Todo {
  id: string;
  text: string;
}
```

`src/main.ts` はこれまでと同じで動くことを確認する。

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

#### 期待出力

```
- [a1] 牛乳を買う
- [a2] 本を返す
```

`type Todo = { ... }` を `interface Todo { ... }` に変えても、**使う側は何も書き換えずに動く** ことを確認する。`import type { Todo }` もそのまま使える。

### 手順 2: わざとプロパティを欠けさせてエラーを見る

`main.ts` に次の行を足す。

```ts
const broken: Todo = { id: "a3" };
```

期待されるメッセージ:

```
Property 'text' is missing in type '{ id: string; }' but required in type 'Todo'.
```

エラーの文面は `type` のときと同じく「`Todo` 型に `text` が足りない」と出る。`interface` か `type` かは、エラーメッセージの見え方にほぼ影響しない。確認できたらこの行は消す。

### 手順 3: `interface AdminUser extends User` を書く

`src/types.ts` に `User` と `AdminUser` を追記する。

```ts
// src/types.ts
export interface Todo {
  id: string;
  text: string;
}

export interface User {
  id: string;
  name: string;
}

export interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}
```

`src/main.ts` の末尾に次のコードを追加する。

```ts
import type { AdminUser } from "./types";

const admin: AdminUser = {
  id: "u001",
  name: "Alice",
  role: "admin",
  permissions: ["read", "write"],
};

console.log(`${admin.name}: ${admin.role} / ${admin.permissions.join(", ")}`);
```

#### 期待出力

```
- [a1] 牛乳を買う
- [a2] 本を返す
Alice: admin / read, write
```

### 手順 4: 継承したプロパティを欠けさせる

`admin` オブジェクトから `name` を消してみる。

```ts
const admin: AdminUser = {
  id: "u001",
  role: "admin",
  permissions: ["read", "write"],
};
```

期待されるメッセージ:

```
Property 'name' is missing in type '{ id: string; role: "admin"; permissions: string[]; }' but required in type 'AdminUser'.
```

`User` から継承した `name` も、`AdminUser` を使う側では必須として扱われる。確認できたら元に戻す。

### 手順 5: `interface` で書けないものを試す

`interface` ではユニオン型を書けないことを確かめる。`types.ts` に次を足してみる。

```ts
export interface Id = string | number;
```

赤線が出る。期待されるメッセージ（環境により文面は前後するが、いずれにせよ構文エラーになる）:

```
'=' expected.
```

`Interface name cannot be reserved word ...` のように別の文面で出ることもあります。意図は同じで、**`interface` の宣言構文は `interface 名前 { ... }` だけなので、`= 型` を書く場所がない**（= ユニオン型は `interface` では表現できない）ということです。確認できたら行ごと消して、`type` で書き直す。

```ts
export type Id = string | number;
```

こちらは通る。

### 変えてみる

`AdminUser` を `type` + 交差型で書き直して、挙動が同じことを確認する。

```ts
export type AdminUser = User & {
  role: "admin";
  permissions: string[];
};
```

`main.ts` の呼び出し側を書き換える必要はない。`User & { ... }` の形でも `interface extends` でも、呼び出し側から見たら区別がつかない。

確認できたら、3 章 の他レッスンで使いやすいように **`Todo` を `type` に戻して** おく。

```ts
// src/types.ts
export type Todo = {
  id: string;
  text: string;
};
```

`User` と `AdminUser` は `interface` / `type` どちらで残しても構わない。3 章 の他レッスンの演習では `Todo` 型だけ使うので、`Todo` だけは `type` で揃えておけば他のレッスンとズレない。

### 自分で書く

次の型を **`type` + 交差型** と **`interface` + `extends`** の 2 通りで書き、両方が同じように使えることを確認する。

- `Animal` 型: `{ name: string; legs: number; }`
- `Dog` 型: `Animal` に `breed: string` を足した形

書けたら、`Dog` 型の値を 1 件作って `name` と `breed` を Console に出す。どちらの書き方でも `main.ts` の呼び出し側が変わらないことを実感する。

## まとめ

- `interface 名前 { ... }` でオブジェクトの形に名前を付けられる。`type` とほぼ同じ使い方ができる。
- `interface` は `extends` で継承できる。`type` は `&`（交差型）で同じことができる。
- ユニオン型・リテラル型・Utility Types の結果に名前を付けるのは **`type` のみ** ができる。
- 宣言マージという機能もあるが、本コースでは使わない。
- **本コースは `type` を基本** に使う。読者として `interface` も読める状態にしておき、書くときは `type` に揃える。3 章 の他レッスンの `types.ts` は `type Todo = { ... }` に戻しておく。
