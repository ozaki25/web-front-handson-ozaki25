# lesson52: useRef（DOM 参照と値保持）

## ゴール

- `useRef` で DOM 要素への参照を取れる
- フォームの入力欄に自動 focus を当てられる
- `useRef` と `useState` の違いを説明できる
- React 19 以降、`ref` は通常の props として渡せることを理解する

## 解説

### なぜ DOM を直接触りたいことがあるか

React は普段「JSX を書けば DOM は React が作る・更新する」仕組みです。自分で DOM を探したり書き換えたりする必要はありません。

ただし、**React が自動でやってくれない操作** もあります。

- 入力欄に自動で focus を当てる（`input.focus()`）
- 動画要素を再生・停止する（`video.play()`）
- canvas に描画する
- 外部ライブラリに DOM 要素を渡す

これらは「画面を描く」ではなく「画面の要素に対して命令を出す」操作です。React の JSX からは直接書けません。このとき、`useRef` で **DOM 要素への参照** を取ります。

### useRef の基本形

```tsx
import { useRef } from "react";

function MyInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>input に focus</button>
    </>
  );
}
```

- `useRef<HTMLInputElement>(null)` で `ref` オブジェクトを作る
- `<input ref={inputRef} />` で、その `ref` に DOM 要素が入るよう指示
- コンポーネントがレンダリングされた後、`inputRef.current` にその DOM 要素が入る
- `inputRef.current?.focus()` で DOM のメソッドを呼ぶ

### `current` が `null` になり得る理由

`inputRef.current` は `HTMLInputElement | null` 型です。`null` の可能性があるのは、次の理由です。

- 初期値を `null` にして作っているため
- 条件付きレンダリングで `<input>` が描画されていないときは null のまま

そのため、使うときは **`?.`（optional chaining）** で null チェックします。

```tsx
inputRef.current?.focus(); // current が null なら何もしない
```

### 値保持用途

`useRef` は DOM だけのためのものではありません。「再レンダリングされても値を保持したい」が「値が変わっても再レンダリングしたくない」ケースでも使えます。

```tsx
const clickCount = useRef(0);

function handleClick() {
  clickCount.current += 1;
  console.log(`${clickCount.current} 回目のクリック`);
}
```

この `clickCount.current` は:

- 再レンダリングを挟んでも値が残る
- 書き換えても **再レンダリングは起きない**

### useState との違い

| | `useState` | `useRef` |
| --- | --- | --- |
| 値を保持する | はい | はい |
| 値を変えると再レンダリングされる | はい | **いいえ** |
| 画面に表示する値 | 向く | 向かない |
| 画面に表示しない値（前回のクリック時刻など） | 無駄な再レンダリングが起きる | 向く |
| DOM 参照 | 使えない | 向く |

**画面に反映したい値は `useState`、画面に出さない値は `useRef`** と覚えるのが基本です。

### React 19 の ref: 普通の props として渡せる

React 19 以降、自作の関数コンポーネントでも `ref` を **普通の props として** 受け取れるようになりました。

```tsx
import type { Ref } from "react";

type MyInputProps = {
  ref: Ref<HTMLInputElement>;
  placeholder?: string;
};

function MyInput({ ref, placeholder }: MyInputProps) {
  return <input ref={ref} placeholder={placeholder} />;
}

// 呼び出し側
function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <MyInput ref={inputRef} placeholder="名前" />;
}
```

- `ref` を普通の props として受け取って、中の `<input>` に渡すだけ
- 型は `react` から `Ref<HTMLInputElement>` を `import type` で取る

### 過去形（`forwardRef`）は扱わない

React 18 までは、自作コンポーネントで `ref` を受け取るために `React.forwardRef(...)` という特別な関数で包む必要がありました。

**本コースでは `forwardRef` を扱いません**。React 19 以降は不要になった書き方です。ただし既存コードや古いチュートリアルで `forwardRef` を見かけることはあるので、「昔のやり方だ」と認識できれば十分です。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- TODO 追加フォームで、「追加」ボタンを押したあとに **自動で入力欄に focus が戻る** 形を作る
- `useRef` で `<input>` の DOM 要素を取り、`.focus()` を呼ぶ

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/types.ts` を作成
3. `src/App.tsx` を書き換える
4. `src/App.css` を書き換える

### `src/types.ts`

```ts
export type Todo = {
  id: string;
  text: string;
};
```

### `src/App.tsx`

```tsx
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Todo } from "./types";
import "./App.css";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    const newTodo: Todo = { id: crypto.randomUUID(), text: trimmed };
    setTodos((prev) => [...prev, newTodo]);
    setText("");
    // 追加後に入力欄へ focus を戻す
    inputRef.current?.focus();
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <h1>useRef で自動 focus</h1>

      <form onSubmit={handleSubmit} className="box">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="やることを入力"
        />
        <button type="submit">追加</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button type="button" onClick={() => handleDelete(todo.id)}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
```

- `useRef<HTMLInputElement>(null)` で ref を作る
- `<input ref={inputRef} ...>` で、その input DOM への参照を受け取る
- 追加処理の末尾で `inputRef.current?.focus()` を呼ぶことで、続けて次の TODO をタイプできる

### `src/App.css`

```css
.box {
  border: 1px solid #ccc;
  padding: 12px;
  margin: 12px 0;
  border-radius: 4px;
  color: #222;
  background-color: #fff;
}

.box input {
  padding: 6px;
  margin-right: 8px;
}

.box button {
  padding: 4px 10px;
  cursor: pointer;
}

.todo-list {
  list-style: disc;
  padding-left: 20px;
  color: #222;
}

.todo-list li {
  padding: 4px 0;
}

.todo-list li button {
  margin-left: 8px;
  padding: 2px 8px;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .box {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
  .todo-list {
    color: #eee;
  }
}
```

### 期待出力

- 画面に入力欄と「追加」ボタン、その下に TODO 一覧
- 入力欄に文字を打ち「追加」を押すと、一覧に追加され、入力欄はクリアされて **カーソル（focus）が戻る**
- マウスで入力欄をクリックし直さなくても、続けてキー入力できる
- 「削除」ボタンで各行を削除できる

### 変える

- `handleSubmit` の末尾の `inputRef.current?.focus()` を **コメントアウト** します。追加したあと、入力欄に focus が戻らず、続けて打とうとすると何も反応しなくなることを確認します。`useRef` の効果を体感する演習です。確認したら戻します。
- `useRef<HTMLInputElement>(null)` の型パラメータ `<HTMLInputElement>` を消すと、`inputRef.current` の型が不明瞭になり `.focus()` の行でエラーになります。**型を付けることの意味** を体感する演習です。
- `<input ref={inputRef} ... />` の `ref={inputRef}` を消すと、`inputRef.current` がずっと `null` のままで focus が効かなくなります。

### 自分で書く

- 「クリア」ボタンを追加して、押したら `todos` を空配列にすると同時に `inputRef.current?.focus()` で入力欄に focus を戻してください。
- ページを開いた直後に入力欄に focus が当たっているようにします。`useEffect(() => { inputRef.current?.focus(); }, [])` で実現できます（次のレッスンで学ぶ `useEffect` の先取りです）。

### 挑戦（折りたたみ）: 連打防止のデバウンスもどき

::: details useRef で前回クリック時刻を記憶する

`useRef` は「画面に出さない値を保持する」用途でも使えます。その応用として、**1 秒以内の連打を無視する** 追加ボタンを作ってみます。

```tsx
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Todo } from "./types";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAddedAt = useRef<number>(0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    const now = Date.now();
    if (now - lastAddedAt.current < 1000) {
      // 前回追加から 1 秒以内なら無視
      return;
    }
    lastAddedAt.current = now;

    const newTodo: Todo = { id: crypto.randomUUID(), text: trimmed };
    setTodos((prev) => [...prev, newTodo]);
    setText("");
    inputRef.current?.focus();
  }

  // ... JSX は本編と同じ
}
```

ポイント:

- `lastAddedAt` を **`useState` ではなく `useRef`** で持っています。時刻を更新しても再レンダリングしたくない（画面に出さない値だから）ためです
- `useState` で持つと、クリックのたびに再レンダリングが走って無駄になります

本格的なデバウンスは `setTimeout` と `clearTimeout` でタイマー管理が必要になり、クリーンアップ関数（本コースでは扱わない）に踏み込むことになります。ここでは「前回時刻を覚えておいて比較する」という一番単純な形で体感します。

:::

## まとめ

- `useRef<HTMLInputElement>(null)` + `ref={inputRef}` で DOM 要素にアクセスできる
- `inputRef.current?.focus()` のように null チェックして使う
- `useState` は「画面に出す値」、`useRef` は「画面に出さない値」「DOM への参照」で使い分ける
- React 19 以降、`ref` は普通の props として渡せる（`function MyInput({ ref }: { ref: Ref<HTMLInputElement> })` の形）
- `forwardRef` の過去形は本コースでは扱わない
- 次のレッスンでは副作用の扱い方（`useEffect`）を学ぶ
