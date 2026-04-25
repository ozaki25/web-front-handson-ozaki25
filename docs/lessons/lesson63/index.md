# lesson63: useEffect の基本

## ゴール

- `useEffect` が何のためにあるかを説明できる
- 依存配列 `[]` とそれ以外（`[todos]` など）の違いを書き分けられる
- `document.title` をマウント時に書き換える最小の例を手を動かして作れる

## このレッスンの範囲（冒頭で明示）

本コースで扱う `useEffect` は、この 2 パターンだけです。

1. マウント時に 1 回だけ実行（依存配列 `[]`）: **このレッスン**
2. 特定の値が変わるたびに実行（依存配列 `[todos]` など）: **「TODO アプリを React で作る」** で localStorage 保存に使う

**以下は扱いません**（本コースのスコープ外）。必要になった時点でドキュメントを調べてください。

- クリーンアップ関数（`useEffect` の中で return する関数）
- `addEventListener` / `removeEventListener` のようなイベントリスナの取り付け
- `setInterval` / `setTimeout` のタイマー管理

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
- **`[todos]`**: `todos` が変わるたびに実行（別のレッスンで使う）
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

React 19.2 で **`useEffectEvent`** という新しいフックが追加されました。これは「effect の中で使っているが、その値が変わっても effect を再実行したくない」という場面に使います。

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

依存配列に入れたくないイベントハンドラ的な処理を `useEffectEvent` に切り出すと、**依存配列から除外しても ESLint に怒られません**。本レッスンでは踏み込みませんが、useEffect の複雑な依存配列に悩んだら思い出してください。

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
- 「TODO アプリを React で作る」の準備として、ファイルを保存しておくと役立つ

### 末尾予告

- **ブラウザ側で `fetch` を `useEffect` で呼ぶパターン** は、競合状態、ローディング、エラー管理など罠が多いので、本コースでは扱いません。データ取得は5 章（Next.js）の **Server Component** にサーバー側 `fetch` としてまとめます
- **「TODO アプリを React で作る」** では、`useEffect` を **localStorage への保存** に使います（依存配列に `todos` を渡す形）。2 章 の「TODO アプリを作る」で作った「リロードしても消えない TODO」を、React 版でも取り戻します

## まとめ

- `useEffect(() => { ... }, deps)` は「描画の後に走る処理」を書く場所
- 依存配列 `[]` は **マウント時 1 回だけ**
- 依存配列に値を入れると、その値が変わるたびに再実行
- 本コースではこの 2 パターンのみ扱う。クリーンアップ関数やイベントリスナ管理は扱わない
- React 19 では `<title>` を JSX に直接書けるので、実務で「タイトルだけ」なら `useEffect` は不要
- 次は `useEffect` で localStorage 保存に挑戦
