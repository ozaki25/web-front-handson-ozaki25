# lesson64: useEffect の基本

## ゴール

- `useEffect` が何のためにあるかを説明できる
- 依存配列 `[]` とそれ以外（`[todos]` など）の違いを書き分けられる
- `document.title` をマウント時に書き換える最小の例を手を動かして作れる

## 解説


### 副作用（side effect）とは

ここまでのレッスンで書いたコンポーネントは、次の形でした。

- **入力**: props と state
- **出力**: JSX（画面）

この「入力から JSX を計算する」部分だけなら、コンポーネントは純粋な関数です。関数を呼ぶと JSX が返ってくる、それだけ。

ところが、実用的なアプリでは次のようなこともしたいことがあります。

- `document.title` を書き換える
- ブラウザの localStorage にデータを書き込む
- サーバーにデータを送る

これらはコンポーネントの「描画」そのものではなく、**画面を描いた結果として起きてほしい**処理です。こうした処理をまとめて **副作用**（side effect） と呼びます。

`useEffect` は「描画の後に、副作用を実行する」ためのフックです。

### 最小形

```tsx
import { useEffect } from "react";

useEffect(() => {
  document.title = "Hello";
}, []);
```

- 第 1 引数: 副作用として実行したい関数
- 第 2 引数: **依存配列**

### 依存配列の意味

依存配列は、「中に入っている値のうち 1 つでも前回と違ったら、副作用を再実行する」というルールで効きます。

- **`[]`**（空配列）: どの値も監視しない → **マウント時に 1 回だけ** 実行
- **`[count]`**: `count` が変わるたびに実行
- **`[todos]`**: `todos` が変わるたびに実行
- 書かない（第 2 引数を省略）: **毎回の描画後** に実行。原則使わない（無限ループの原因になりやすい）

本コースでは `[]` と `[何かの値]` の 2 通りだけ使います。

### マウント時に 1 回だけ

「マウント」はコンポーネントが **初めて画面に現れた瞬間** を指します。

```tsx
useEffect(() => {
  console.log("mounted");
}, []);
```

このコードは、コンポーネントが表示されたときに一度だけ `mounted` をログに出します。その後、state が変わって再レンダリングされても、もうこの副作用は走りません。

### 何かが変わるたび

```tsx
useEffect(() => {
  document.title = `TODO (${todos.length})`;
}, [todos]);
```

`todos` が変わるたびにタブのタイトルを更新する例です。配列の**中身**が変わっただけでなく、**配列オブジェクト自体**が前回と違う必要があります。「イベントと配列のイミュータブル更新」で学んだ「スプレッドで新しい配列を作る」イミュータブル更新が、このシグナルとして効きます。

### localStorage への保存と復元: `useState` の初期値関数を使う

**2章で直接操作していた `localStorage`** を、React のコンポーネントからどう使うかを見ていきます。

`useEffect` の典型的な使い道に、「state の変化を localStorage に保存し、リロード時に復元する」があります。素直に書くと次のような形を思い浮かべます。

```tsx
// NG: 誤った実装
const [todos, setTodos] = useState<Todo[]>([]);

useEffect(() => {
  const saved = localStorage.getItem("todos");
  if (saved) setTodos(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);
```

一見正しそうに見えますが、初回レンダリング時の流れを追うと:

1. `useState([])` で `todos = []`（空配列）で初期化される
2. 初回レンダリング完了
3. 保存用の `useEffect` が走る → `localStorage.setItem("todos", "[]")` で **localStorage を空配列で上書きしてしまう**
4. 読み込み用の `useEffect` が走る → もう遅い

つまり **ページを開くたびに一度 localStorage が空になる** バグが生まれます。以後のセッションで追加した内容は保存されますが、タブを開き直すと毎回リセットされる（ように見える）のです。

#### 解決策: `useState` の初期値関数

`useState(initialValue)` の `initialValue` には **関数を渡す** ことができます。関数を渡すと、その関数は **コンポーネントの初回レンダリング時だけ** 実行されます。

```tsx
// OK: 正しい実装
const [todos, setTodos] = useState<Todo[]>(() => {
  try {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);
```

- 初回レンダリング時点で `todos` には復元済みの配列が入る
- `useEffect([todos])` は走るが、復元済みの値を書き戻すだけ
- 空配列で上書きするバグは起きない

`try` / `catch` で囲んでいるのは、`localStorage` に不正な JSON が保存されていた場合に `JSON.parse` が例外を投げるためです。「`try` / `catch` でエラー処理」の復習です。

### コラム: React 19 では `<title>` を JSX に書ける

React 19 では、JSX の中に `<title>` / `<meta>` / `<link>` を直接書くと、React が `<head>` に自動で差し込んでくれるようになりました。

```tsx
function Page() {
  return (
    <>
      <title>TODO</title>
      <h1>...</h1>
    </>
  );
}
```

つまり「タイトルを変えたいだけ」なら、`useEffect` で `document.title` を書き換える必要はありません。それでもこのレッスンでは **`useEffect` の素振り** として `document.title` を扱います。「タイトル書き換え」という用途に限れば `<title>` の方が簡単、という事実は頭の片隅に。

### コラム: React 19.2 の `useEffectEvent`

React 19.2 で **`useEffectEvent`** が **安定版（stable）** になりました。それ以前は `experimental_useEffectEvent` という名前で実験的チャンネルにのみ存在していました。これは「effect の中で使っているが、その値が変わっても effect を再実行したくない」という場面に使います。

```tsx
import { useEffectEvent } from "react";

function Chat({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    // theme を参照しても、theme が変わっただけでは再接続しない
    showNotification(theme, "接続しました");
  });

  useEffect(() => {
    const connection = connectToRoom(roomId);
    connection.on("connected", onConnected);
    return () => connection.disconnect();
  }, [roomId]); // theme は依存配列に入れなくて良い
}
```

React の ESLint プラグイン（`eslint-plugin-react-hooks`）には、effect 内で使っている値を依存配列に入れ忘れると警告する `exhaustive-deps` ルールがあります。通常はこの警告に従うべきです。ただし「値を参照したいが effect を再実行させたくない」という場面では、除外すると警告が出てしまいます。`useEffectEvent` に切り出した関数はその対象から外れるため、依存配列に入れなくても警告が出ません。本レッスンでは踏み込みませんが、useEffect の複雑な依存配列に悩んだら思い出してください。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- 画面の `<h1>` とカウンター UI を作り、マウント時に `document.title` を書き換える
- カウンターの値が変わるたびに `document.title` を `TODO (N)` のように更新する

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/App.tsx` を書き換える

### `src/App.tsx`

```tsx
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  // (1) マウント時に 1 回だけ
  useEffect(() => {
    console.log("mounted: 初期タイトルをセット");
    document.title = "TODO (起動中)";
  }, []);

  // (2) count が変わるたびに
  useEffect(() => {
    document.title = `TODO (${count})`;
  }, [count]);

  return (
    <>
      <h1>useEffect 入門</h1>
      <p>カウンター: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </>
  );
}

export default App;
```

### 期待出力

- 画面に `useEffect 入門` という見出しと `カウンター: 0` 、`+1` / `リセット` ボタン
- **ブラウザのタブのタイトル** が `TODO (0)` になっている（開いた直後は `TODO (起動中)` になることもあるが、すぐ `TODO (0)` に上書きされる）
- `+1` を押すたびにタブのタイトルが `TODO (1)` → `TODO (2)` → ... に変わる
- `リセット` を押すとタブのタイトルが `TODO (0)` に戻る
- ブラウザのコンソールに `mounted: 初期タイトルをセット` が **一度だけ** 出る

### 変える

- (1) の依存配列 `[]` を消す（依存配列ごと省略する）と、`mounted: 初期タイトルをセット` がクリックのたびに出てしまう（描画のたびに副作用が走る）。確認したら戻す
- (2) の `[count]` を `[]` に変えると、タブのタイトルが `+1` しても更新されなくなる（マウント時の 1 回だけになる）
- (1) と (2) を 1 つにまとめてもよい（依存配列は `[count]` で、中で `document.title = TODO (${count})`）

### 自分で書く

- `count` の代わりに、「親子コンポーネントの連携」で作った `todos` state を使って、`document.title` を `TODO (${todos.length})` に更新する
- `<input>` で文字を入れて追加ボタンで増やすと、タブのタイトルの件数が増える、という挙動を作る

### 末尾予告

- ブラウザ側で `fetch` を `useEffect` で呼ぶパターンは、競合状態、ローディング、エラー管理など罠が多いので、本コースでは扱いません。データ取得は 5 章（Next.js）の **Server Component** にサーバー側 `fetch` としてまとめます

### 開発時に effect が 2 回呼ばれる（StrictMode）

`npm run dev` で動かすと、`mounted: 初期タイトルをセット` の console.log が **2 回** 出ることがあります。これは Vite / Next.js のテンプレが既定で **`<React.StrictMode>` でアプリを包んでいる** ためで、開発中にだけ effect が **マウント → クリーンアップ → 再マウント** の順で走ります。「クリーンアップ漏れ」「同じ API を 2 回叩いてしまう書き方」を早期に気づかせるための仕組みで、**バグではありません**。

- **本番ビルド**（`npm run build` 後）では 1 回だけ走ります
- 「2 回呼ばれて困る」effect は、それ自体が StrictMode で炙り出されたバグ（fetch を 2 回飛ばす / イベントリスナを 2 回登録する等）です。クリーンアップ関数（`return () => { ... }`）で正しく後始末を書くのが正攻法
- 「2 回出るのが気になる」というだけで `<React.StrictMode>` を外すのは避けるのが定石

## まとめ

- `useEffect(() => { ... }, deps)` は「描画の後に走る処理」を書く場所
- 依存配列 `[]` は **マウント時 1 回だけ**
- 依存配列に値を入れると、その値が変わるたびに再実行
- 本コースではこの 2 パターンのみ扱う。クリーンアップ関数やイベントリスナ管理は扱わない
- React 19 では `<title>` を JSX に直接書けるので、実務で「タイトルだけ」なら `useEffect` は不要
