# lesson45: state で状態を持つ

## ゴール

- `useState` で状態（state）を持ち、ボタンクリックで画面が更新される仕組みを書ける
- `setCount(count + 1)` と `setCount((c) => c + 1)` の違いを、動く画面で確認できる
- 「同じイベント内の複数の `setX` をまとめて処理する」というバッチングの考え方を説明できる

## 解説

### state とは

画面が変化するアプリには、必ず「状態」があります。TODO の件数、ログインしているかどうか、入力欄の文字、選んでいるタブ、など。

素の JS では変数や DOM にその状態を持たせ、イベントのたびに DOM を直接書き換えていました。React では、状態を**フック**と呼ばれる仕組みで扱います。本レッスンで使うのが `useState` です。

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>現在: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </>
  );
}
```

- `useState(0)` は「初期値 0 で state を 1 つ作って」という意味
- 戻り値は 2 要素のタプル。配列の分割代入で `[count, setCount]` として受け取る
  - `count`: 今の値
  - `setCount`: 値を更新するための関数
- 名前は自由。`[score, setScore]` でも OK

`setCount(1)` を呼ぶと、React が「state が変わった」と気づいてコンポーネントを**再実行**します。再実行した結果の JSX を前回のツリーと比較し、変わった部分だけ DOM に反映します。

### ボタンに関数を渡すときの形

`onClick` には **関数** を渡します。関数呼び出しの結果ではありません。

```tsx
{/* OK: クリックされたら setCount(count + 1) が走る */}
<button onClick={() => setCount(count + 1)}>+1</button>

{/* NG: 描画の瞬間に setCount が呼ばれ、無限ループになる */}
<button onClick={setCount(count + 1)}>+1</button>
```

アロー関数 `() => ...` で包むのが基本です。

### 壊れやすい書き方 vs 正しい書き方

state を更新する関数には、2 つの渡し方があります。

```tsx
// (A) 値で渡す形
setCount(count + 1);

// (B) 関数形式
setCount((prev) => prev + 1);
```

1 回だけ呼ぶ分には、どちらも同じに見えます。違いが出るのは、**同じイベントの中で連続して呼んだとき**です。

```tsx
// 壊れやすい書き方: 3 回呼んでも 1 しか増えない
function handleClickA() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}

// 正しい書き方: 3 回呼ぶと 3 増える
function handleClickB() {
  setCount((c) => c + 1);
  setCount((c) => c + 1);
  setCount((c) => c + 1);
}
```

なぜか。React は **同じイベント内で呼ばれた `setX` をまとめて（バッチで）処理します**。処理するタイミングまで、`count` の値は「このイベントが始まった時点の値」のままです。

つまり (A) では、3 回とも `count + 1` が「0 + 1」と評価され、最終的に state は 1 になります。

(B) の関数形式は「**今 state に入っている値を受け取って、次の値を返す**」書き方です。React は内部で state を更新するたびに `prev` を最新に差し替えてくれるので、3 回目は `prev = 2` が渡されて 3 が返ります。

### バッチングのまとめ

- React は同じイベントで呼ばれた複数の state 更新を、**まとめて 1 回の再レンダリング**にする
- そのため、同じイベント内では state の値は「イベント開始時点」のまま
- 現在の state から次の値を計算したいなら、**必ず関数形式 `setX((prev) => ...)`** を使う

規模の大きいアプリでもこの原則は同じです。将来書く `setTodos((prev) => [...prev, newTodo])` のような形も、この延長線上にあります。

### 補足: バッチングが効くのは同期イベントハンドラだけ

上の「3 回呼んでも 1 しか増えない」は、`onClick` のような **同期のイベントハンドラの中** で 3 回連続で `setCount` を呼んだケースです。非同期処理（`setTimeout` や `await` のあと）から `setCount` を呼ぶ場合でも React 18 以降は原則バッチングされますが、条件によってはイベントの境界が切れ、1 回の `setCount(count + 1)` で素直に 1 増える挙動になります。挙動に違和感を感じたら、まずは関数形式 `setX((prev) => ...)` に書き換えて安全側に倒すのが無難です。

### `useState` の型

`useState(0)` のように初期値を渡すと、TypeScript は「state の型は `number`」と推論します。

```tsx
const [count, setCount] = useState(0); // count: number
const [name, setName] = useState(""); // name: string
```

複雑な型（配列、オブジェクト、ユニオン）は、次のように明示的に指定できます。

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
```

今回は数値しか使わないので、型推論に任せます。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- カウンター UI を作り、「壊れやすい書き方」と「正しい書き方」のボタンを並べる
- 実際に押して、増え方の違いを画面で確認する

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/App.tsx` を書き換える
3. `src/App.css` を書き換える

### `src/App.tsx`

```tsx
import { useState } from "react";
import "./App.css";

function App() {
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);

  // (A) 壊れやすい書き方: count + 1 を 3 回
  function handleClickA() {
    setCountA(countA + 1);
    setCountA(countA + 1);
    setCountA(countA + 1);
  }

  // (B) 正しい書き方: 関数形式を 3 回
  function handleClickB() {
    setCountB((c) => c + 1);
    setCountB((c) => c + 1);
    setCountB((c) => c + 1);
  }

  return (
    <>
      <h1>バッチングを体感する</h1>

      <section className="box">
        <h2>(A) 壊れやすい書き方</h2>
        <p>現在: {countA}</p>
        <button onClick={handleClickA}>3 回 setCountA(countA + 1)</button>
      </section>

      <section className="box">
        <h2>(B) 正しい書き方</h2>
        <p>現在: {countB}</p>
        <button onClick={handleClickB}>3 回 setCountB((c) =&gt; c + 1)</button>
      </section>
    </>
  );
}

export default App;
```

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

.box button {
  padding: 6px 10px;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .box {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
}
```

### 期待出力

- 画面に 2 つのボックス「(A) 壊れやすい書き方」「(B) 正しい書き方」が並ぶ
- (A) のボタンを 1 回押す → 表示が **0 → 1**。もう 1 回 → **1 → 2**。**1 ずつしか増えない**
- (B) のボタンを 1 回押す → 表示が **0 → 3**。もう 1 回 → **3 → 6**。**3 ずつ増える**

押したボタンごとに、増え方が明確に違うことを確認してください。

### 変える

- (A) の `handleClickA` の中の `setCountA(countA + 1)` を 5 回に増やしてみる → それでも 1 しか増えない
- (B) の `setCountB((c) => c + 1)` を 5 回に増やすと、1 クリックで 5 増える
- (A) を `setCountA((c) => c + 1)` に差し替えると、3 ずつ増える側に変わる

### 自分で書く

- 別の state `[step, setStep]` を作り、初期値を `1` にする
- `<input>` で `step` の値を数値として編集できるようにする（本格的なフォームは lesson48 で扱うので、ここでは下記のヒントをコピペでよい）
- 既存のボタンを「`step` ずつ増やす」ボタンに差し替える（`setCountB((c) => c + step)` の形）

ヒント（`<input>` まわりはコピペで OK です）:

```tsx
<input
  type="number"
  value={step}
  onChange={(e) => setStep(Number(e.target.value))}
/>
```

## まとめ

- 状態は `useState(初期値)` で持つ。戻り値は `[値, 更新関数]`
- `setX(v)` を呼ぶと React がコンポーネントを再実行して差分を DOM に反映する
- 同じイベント内の複数の `setX` は**バッチで**処理されるので、同じイベントの中では state の値は変わらない
- 現在の state を元に次の値を計算するなら、**関数形式 `setX((prev) => ...)`** を使う
