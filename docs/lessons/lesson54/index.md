# lesson54: 配列を描画する

## ゴール

- 配列を `.map` で JSX の配列に変換し、`<ul>` の中に並べられる
- `key` prop に何を渡すべきかを説明できる
- 素の JS での描画（2 章 の「繰り返し処理」「TODO アプリを作る」）との違いが書き出せる

## 解説

### 2 章 の「繰り返し処理」の `for...of` / 「TODO アプリを作る」の DOM 追加との対比

2 章 で、TODO アプリの一覧を描画したときは次のように書きました。

```js
// 素の JS での描画イメージ（2 章 の「繰り返し処理」+「TODO アプリを作る」）
const ul = document.querySelector("#list");
for (const todo of todos) {
  const li = document.createElement("li");
  li.textContent = todo.text;
  ul.appendChild(li);
}
```

「1 件ずつ DOM を作って `appendChild`」。数が増えても手順は同じです。

React では、**配列を JSX の配列に変換するだけ**です。`return` に書いた JSX を見て、React が前回のツリーとの差分を計算し、必要な DOM だけを更新してくれます。

```tsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
</ul>
```

`for` ループで `appendChild` を呼ぶ必要はありません。配列（`todos`）から配列（JSX の `<li>` の並び）への**変換**だけを書きます。

### `map` は2 章 の「配列の変換」の続き

2 章 の「配列の変換」で `map` / `filter` を学びました。`map` は配列の各要素を別の値に変換して、新しい配列を返すメソッドです。

```ts
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2); // [2, 4, 6]
```

React の配列描画は、この `map` で **JSX の要素に変換する** ことに他なりません。

```tsx
const items = ["りんご", "みかん", "ぶどう"];
const listItems = items.map((item) => <li>{item}</li>);
// listItems は [<li>りんご</li>, <li>みかん</li>, <li>ぶどう</li>]

<ul>{listItems}</ul>;
```

実際は変数に入れずに、JSX の中で直接書きます。

```tsx
<ul>
  {items.map((item) => (
    <li>{item}</li>
  ))}
</ul>
```

### `key` prop は「誰がどれか」を React に伝える

上のコードを実際に書くと、ブラウザのコンソールに**警告**が出ます。

```
Warning: Each child in a list should have a unique "key" prop.
```

「リストの各要素に `key` prop を付けてね」という警告です。

React は状態が変わるたびに、前回のツリーと新しいツリーを比べて差分を反映します。このとき、配列で並んでいる要素のうち「どれが前回と同じ要素なのか」を判断する材料が必要です。その材料が `key` です。

```tsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
</ul>
```

- `key` には **配列内でユニークな値** を渡す
- TODO のように `id` を持つデータなら、`id` をそのまま使う
- 「配列のインデックス（`map((todo, i) => ...)` の `i`）を渡す」のは**避ける**。並び替えや途中削除で挙動が怪しくなるため

`key` は props 扱いですが、コンポーネント側で受け取れる値ではなく、**React 内部だけが使う特別な prop** です。

### 空の配列でも動く

`todos` が空配列 `[]` の場合、`map` の結果も空配列になるので、`<ul>` の中身は空になります。エラーにはなりません。

「0 件のとき専用のメッセージを出したい」場合は、条件表示と組み合わせます。

### 要素の中で `{式}` は 1 つだけ書けばよい

JSX の中の `{ ... }` には、式を 1 つだけ書きます。`for` 文や `if` 文は書けません。配列の `map` の戻り値はれっきとした「式」（値を返す）なので、そのまま書けます。

```tsx
{
  /* OK: map は式 */
  todos.map((t) => <li key={t.id}>{t.text}</li>);
}
{
  /* NG: for 文は式ではない */
  for (const t of todos) {
    /* ... */
  }
}
```

## 演習

### 途中から始める場合

これまでのレッスンで作ったプロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開き、下の「出発点のファイル」を貼って揃えてください。

<details>
<summary>出発点のファイル</summary>

**`src/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
};
```

本レッスンの演習でこのファイルを `import type { Todo } from "./types"` の形で利用します。

</details>

### ゴール

- ハードコードした `todos` 配列を `<ul>` で描画する
- `Todo` 型を3 章 の `types.ts` から `import type` して再利用する
- 各 `<li>` に `key={todo.id}` を付ける

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/types.ts` を作成（3 章 の「オブジェクトの型と type エイリアス」「配列・ユニオン・リテラル型・オプショナル」で作ったものを持ってくる想定）
3. `src/TodoList.tsx` を作成
4. `src/App.tsx` を書き換える

### `src/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
};
```

3 章 で `status` や `memo` を足した版を書いた場合はそちらを使っても OK です。このレッスンは `id` と `text` しか使いません。

### `src/TodoList.tsx`

```tsx
import type { Todo } from "./types";

type TodoListProps = {
  todos: Todo[];
};

export function TodoList({ todos }: TodoListProps) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### `src/App.tsx`

```tsx
import { TodoList } from "./TodoList";
import type { Todo } from "./types";
import "./App.css";

const sampleTodos: Todo[] = [
  { id: "a1", text: "牛乳を買う" },
  { id: "a2", text: "原稿を書く" },
  { id: "a3", text: "散歩する" },
];

function App() {
  return (
    <>
      <h1>今日のタスク</h1>
      <TodoList todos={sampleTodos} />
    </>
  );
}

export default App;
```

### `src/App.css`

```css
.todo-list {
  list-style: disc;
  padding-left: 20px;
  color: #222;
}

.todo-list li {
  padding: 4px 0;
}

@media (prefers-color-scheme: dark) {
  .todo-list {
    color: #eee;
  }
}
```

### 期待出力

画面に次のような表示が出ます。

```
今日のタスク
  ・ 牛乳を買う
  ・ 原稿を書く
  ・ 散歩する
```

ブラウザのコンソールに `key` に関する警告が **出ない** ことも確認してください。

### 変える

- `sampleTodos` に要素を 2, 3 件追加して、画面が 1 行ずつ増えることを確認
- `<li key={todo.id}>` の `key={todo.id}` を削除して、コンソールに警告が出ることを確認（確認できたら戻す）
- `sampleTodos` を空配列 `[]` にすると `<ul>` が空になる。エラーにはならないことを確認

### 自分で書く

- `src/TodoList.tsx` を少しだけ変えて、リストの頭に `<p>合計 N 件</p>` を表示する
- ヒント: `<ul>` の外側を `<div>` やフラグメントで包み、`<p>合計 {todos.length} 件</p>` を足す
- 期待出力: 「今日のタスク」の下に「合計 3 件」と出て、その下にリスト

## まとめ

- 配列の描画は `配列.map((item) => <JSX />)` でおこなう
- 各要素に **ユニークな `key`** を付ける（インデックスは避ける）
- `for` / `appendChild` を書く素の JS と違い、React は「前のツリーとの差分」を自分で計算して DOM を更新する
