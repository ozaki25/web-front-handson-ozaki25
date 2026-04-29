# lesson51: Utility Types で仕上げる

## ゴール

- 既にある型から新しい型を派生させる **Utility Types** という仕組みを理解する。
- `Partial<T>` で「全プロパティが省略可能」な型を作れる。
- `Pick<T, K>` で「特定のプロパティだけ取り出した」型を作れる。
- `Todo` 型から `TodoDraft`（下書き）と `TodoSummary`（一覧用）を派生させ、関数で使い分けられる。

## 解説

### 「似ているけど少しだけ違う型」問題

3 章 を通じて、TODO 1 件を表す `Todo` 型をここまで育ててきました。

```ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};
```

ここで次のような場面を想像します。

- **下書き**: ユーザーが「新規作成」ボタンを押した直後。まだ `id` も `text` も決まっていない。
- **一覧用の要約**: 一覧画面では `id` と `text` だけ表示すればよい。`status` や `memo` は詳細画面でだけ使う。

これらは `Todo` に似ていますが、「全部必須ではない」「一部しか使わない」という違いがあります。そのたびに別の `type` を手で書くと、`Todo` を変更したときに派生型もすべて追従させる必要があり、ズレが生まれます。

TS には「既にある型から **自動で** 新しい型を作る」道具が用意されています。それが **Utility Types**（ユーティリティ型）です。

### `Partial<T>`: 全プロパティをオプショナルにする

`Partial` は「`T` のすべてのプロパティを省略可能（`?:` 付き）にした型」を作ります。

```ts
type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
};

type TodoDraft = Partial<Todo>;
// 展開すると次と同じ:
// type TodoDraft = {
//   id?: string;
//   text?: string;
//   status?: "open" | "done";
//   memo?: string;
// }
```

`TodoDraft` は「下書き」にぴったりです。まだ `id` が決まっていなくても、`text` だけ入力された状態でも受け入れられる。

```ts
const draft1: TodoDraft = {};                           // OK
const draft2: TodoDraft = { text: "牛乳を買う" };         // OK
const draft3: TodoDraft = { text: "本を返す", memo: "" }; // OK
```

オプショナル版になったので、使う側では `undefined` を意識する必要があります（「配列・ユニオン・リテラル型・オプショナル」で扱った通り）。

### `Pick<T, K>`: プロパティを選んで取り出す

`Pick` は「`T` の中から指定したプロパティだけを取り出した型」を作ります。

```ts
type TodoSummary = Pick<Todo, "id" | "text">;
// 展開すると次と同じ:
// type TodoSummary = {
//   id: string;
//   text: string;
// }
```

- 第 1 引数に元の型、第 2 引数に取り出したいプロパティ名のユニオン（`"id" | "text"`）。
- 取り出したプロパティは、元の型の必須 / オプショナルをそのまま引き継ぐ。
- 指定していないプロパティは含まれない。

一覧画面のコンポーネントが「`id` と `text` しか使わない」と宣言したいとき、`Todo` 全体を受け取る代わりに `TodoSummary` で受け取れば、余計な情報を意識せずに済みます。

### Utility Types が嬉しいのは「追従」してくれること

`Todo` 型に新しいプロパティ（例えば `dueDate: string`）が増えたとします。

```ts
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
  dueDate: string; // 追加
};
```

このとき:

- `TodoDraft = Partial<Todo>` は自動的に `dueDate?: string` を含む型に更新される。
- `TodoSummary = Pick<Todo, "id" | "text">` は影響を受けない（`dueDate` は含まないと指定しているから）。

`type TodoDraft = { id?: string; text?: string; ... }` と手で書いていたら、`dueDate?` を追加し忘れる事故が起きます。Utility Types はこれを仕組みで防ぎます。

### その他の Utility Types（コラム）

TS には他にも Utility Types があります。代表的なものを名前だけ紹介します。

- `Readonly<T>`: すべてのプロパティを読み取り専用にする。
- `Record<K, V>`: キーと値の型を指定したオブジェクト型を作る（`Record<string, number>` など）。
- `Omit<T, K>`: `Pick` の逆で「指定したプロパティ **以外**」を取り出す。
- `Required<T>`: `Partial` の逆で「全プロパティを必須にする」。

**このコースでは `Partial` と `Pick` の 2 つだけ** を使います。他は「必要になったときに TS の公式ドキュメントを検索すればすぐ使える」程度に覚えておけば十分です。名前と「こういう用途がある」だけ頭の片隅にあればよい、という距離感です。

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

### 手順 1: `Todo` 型から派生型を作る

「配列・ユニオン・リテラル型・オプショナル」の `src/types.ts` をそのまま使う。`src/main.ts` を次の形に書き換える。

```ts
import type { Todo } from "./types";

type TodoDraft = Partial<Todo>;
type TodoSummary = Pick<Todo, "id" | "text">;

const draft: TodoDraft = { text: "新しい TODO" };

const summaries: TodoSummary[] = [
  { id: "a1", text: "牛乳を買う" },
  { id: "a2", text: "本を返す" },
  { id: "a3", text: "ゴミを出す" },
];

function printSummary(item: TodoSummary): void {
  console.log(`- [${item.id}] ${item.text}`);
}

console.log("下書き:");
console.log(draft);

console.log("一覧:");
for (const item of summaries) {
  printSummary(item);
}
```

#### 期待出力

```
下書き:
{ text: '新しい TODO' }
一覧:
- [a1] 牛乳を買う
- [a2] 本を返す
- [a3] ゴミを出す
```

（`draft` の表示形式は環境により `{text: "新しい TODO"}` のように表示される場合もある。プロパティの中身が同じであれば OK。）

### 手順 2: 派生型の嬉しさを確かめる

次のように、`TodoDraft` にはどのプロパティも必須ではないことを確認する。

```ts
const d1: TodoDraft = {};
const d2: TodoDraft = { text: "メモだけ" };
const d3: TodoDraft = { id: "a1", status: "open" };
```

いずれも赤線が出なければ OK。

次に、`TodoSummary` には `status` を入れられないことを確認する。

```ts
const s: TodoSummary = { id: "a1", text: "牛乳を買う", status: "open" };
```

期待されるメッセージ:

```
Object literal may only specify known properties, and 'status' does not exist in type 'TodoSummary'.
```

`TodoSummary` は `id` と `text` しか持たない型として派生させたので、`status` を入れようとすると TS が止めてくれる。

### 手順 3: `Partial` で「更新関数」を書く

`Partial<Todo>` は「一部のプロパティだけ変える」という更新のときにも便利。

```ts
import type { Todo } from "./types";

type TodoDraft = Partial<Todo>;

function updateTodo(todo: Todo, patch: TodoDraft): Todo {
  return { ...todo, ...patch };
}

const original: Todo = {
  id: "a1",
  text: "牛乳を買う",
  status: "open",
};

const updated = updateTodo(original, { status: "done", memo: "牛乳コーナー" });

console.log(original);
console.log(updated);
```

#### 期待出力

```
{ id: 'a1', text: '牛乳を買う', status: 'open' }
{ id: 'a1', text: '牛乳を買う', status: 'done', memo: '牛乳コーナー' }
```

- 元の `original` は変わらない（イミュータブル更新。4 章 で React と組み合わせて再登場）。
- `patch` に `id` や `text` を含めてもよいし、含めなくてもよい。`Partial<Todo>` だから。

### 手順 4: 元の型を変えて追従を体験する

`src/types.ts` に `dueDate` プロパティを **一時的に** 追加してみる。

```ts
// src/types.ts（一時的な変更）
export type Todo = {
  id: string;
  text: string;
  status: "open" | "done";
  memo?: string;
  dueDate: string;
};
```

`src/main.ts` を見ると、`const original: Todo = { ... }` のところで赤線が出るはず。

期待されるメッセージ:

```
Property 'dueDate' is missing in type '{ id: string; text: string; status: "open"; }' but required in type 'Todo'.
```

一方、`TodoSummary`（`Pick<Todo, "id" | "text">`）で作っていた `summaries` のほうは何も言われない。`dueDate` は `TodoSummary` の範囲外だから。

これが **派生型が自動で追従する** 効果。確認できたら `dueDate` の追加は取り消して元に戻す。

### 変えてみる

`TodoSummary` に `status` も含めた新しい型 `TodoListItem` を派生させてみる。

```ts
type TodoListItem = Pick<Todo, "id" | "text" | "status">;

const items: TodoListItem[] = [
  { id: "a1", text: "牛乳を買う", status: "open" },
  { id: "a2", text: "本を返す", status: "done" },
];

for (const item of items) {
  const mark = item.status === "done" ? "x" : " ";
  console.log(`[${mark}] ${item.text}`);
}
```

期待出力:

```
[ ] 牛乳を買う
[x] 本を返す
```

### 自分で書く

`Todo` 型から、次の 2 つの派生型を自分で書く。

1. `TodoWithoutMemo` — `memo` を含まない型。ヒント: `Pick` で `"id" | "text" | "status"` を選ぶ。
2. `TodoPatch` — すべて省略可能な型（`TodoDraft` と同じ中身でよいので、`Partial<Todo>` を使う）。

それぞれの型で変数を 1 つずつ作り、`console.log` する。エディタでマウスオーバーして、プロパティの中身が期待通りかを確認する。

### コラム: その他の Utility Types

`Readonly<T>` / `Record<K, V>` / `Omit<T, K>` / `Required<T>` などは本コースでは扱いません。必要な場面に出会ったら TS 公式ドキュメント（<https://www.typescriptlang.org/docs/handbook/utility-types.html>）の該当項目を読めば、基本の使い方はすぐ身につきます。Utility Types はどれも「既にある型から別の型を作る」という同じ考え方の延長線上にあります。

## まとめ

- Utility Types は「既にある型から新しい型を派生させる道具」。手で別の `type` を書く代わりに、仕組みで自動追従させる。
- `Partial<T>`: すべて省略可能にする。下書きや更新の差分に使える。
- `Pick<T, K>`: 特定のプロパティだけ取り出す。一覧用の軽い型に使える。
- 他の Utility Types（`Readonly` / `Record` / `Omit` / `Required` など）は本コースでは扱わない。必要になったら公式ドキュメントを参照する。
