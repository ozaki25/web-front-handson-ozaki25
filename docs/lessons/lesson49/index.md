# lesson49: 条件で出し分ける

<script setup>
const closeScript = '<' + '/script>'
const demoHtml =
  '<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js">' + closeScript +
  '<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js">' + closeScript +
  '<div id="root"></div>'

const demoJs = `
const h = React.createElement;
const { useState } = React;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unread, setUnread] = useState(0);

  return h(
    'div',
    null,
    // (1) 三項演算子: 2 択の切り替え
    isLoggedIn
      ? h('p', null, 'ようこそ、Alice さん')
      : h('p', null, 'ゲストさん、こんにちは'),
    h(
      'button',
      { onClick: () => setIsLoggedIn(v => !v), style: { marginRight: '8px' } },
      isLoggedIn ? 'ログアウト' : 'ログイン'
    ),
    h('hr'),
    // (2) && で「あるときだけ出す」
    h('p', null, '未読: ' + unread),
    unread > 0 &&
      h('p', { style: { color: '#b91c1c', fontWeight: 'bold' } }, unread + ' 件の未読があります'),
    h('button', { onClick: () => setUnread(c => c + 1), style: { marginRight: '8px' } }, '+1'),
    h('button', { onClick: () => setUnread(0) }, '既読にする')
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(App));
`
</script>

## ゴール

- `&&` / 三項演算子 / 早期 return の 3 パターンを使い分けて、状態に応じた表示切り替えができる
- それぞれの使いどころを説明できる

## 解説

### JSX は式だから、分岐も式で書く

「JSX を書く」で触れたとおり、JSX の `{ ... }` に書けるのは **式** だけです。`if` 文は書けません。なので、条件で出し分けるときも**式の形**を使います。

よく使うのは次の 3 つです。

1. `条件 && <JSX />`
2. `条件 ? <A /> : <B />`
3. 関数の先頭で `if` を使って早期 return

### (1) `&&` で「あるときだけ出す」

「条件が真のときだけ表示する / 偽なら何も出さない」は `&&` が定番です。

```tsx
{
  isLoggedIn && <p>ログイン中</p>;
}
```

- `isLoggedIn` が `true` なら `<p>ログイン中</p>` が評価されて表示される
- `isLoggedIn` が `false` なら `false` が評価結果になり、JSX としては何も描画されない

#### `&&` の落とし穴（数値 0）

`&&` の左側には **本当に真偽値** を置くようにしてください。数値の `0` を書くと、そのまま `0` が画面に表示されてしまいます。

```tsx
{
  count && <p>{count} 件あります</p>;
}
// count が 0 だと、画面に「0」という数字が出てしまう
```

件数のような**数値**で判定したいときは、明示的に真偽値に変換します。

```tsx
{
  count > 0 && <p>{count} 件あります</p>;
}
```

`string` や `Todo[]` は `length === 0` を意識しつつ、迷ったら三項演算子を使うとより安全です。

### (2) 三項演算子で「A か B か」

「ログイン中なら A、ログアウト中なら B を表示」のように **2 択** で切り替えたいときは三項演算子が素直です。

```tsx
{
  isLoggedIn ? <p>ログイン中</p> : <a href="/login">ログインへ</a>;
}
```

- `isLoggedIn` が `true` なら左側、`false` なら右側が表示される

3 択以上（オフライン / 接続中 / 接続済み）は、三項を重ねるより次の 3 番目の方が読みやすいです。

### (3) 早期 return

関数の**一番上**で条件判定して、不要な場合は `return` してしまう書き方です。

```tsx
type MessageProps = {
  text: string;
};

function Message({ text }: MessageProps) {
  if (text.length === 0) {
    return null; // null を返すと「何も描画しない」
  }
  return <p>{text}</p>;
}
```

- `null` を `return` すると、そのコンポーネントは **何も描画しない**
- 条件が多い場合は、三項や `&&` を重ねるより圧倒的に読みやすい

ローディング中専用のスピナー、エラー時専用のメッセージ、3 択以上の状態分岐など、分岐ごとに違う大きな JSX を返したい場合に使うとスッキリします。

### 小さなコンポーネントに分ける発想

条件が重なってきたら、「サブコンポーネントに切り出す」ことも考えます。

```tsx
function UserStatus({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return <p>ようこそ！</p>;
  }
  return <a href="/login">ログイン</a>;
}

// 呼び出し側
<UserStatus isLoggedIn={isLoggedIn} />;
```

1 ファイルの中で条件分岐が増えすぎたら、このような分割も選択肢になります。本コースでは以降のレッスンで使っていきます。

### 動きを見てみる

下のデモでボタンを押すと、三項演算子と `&&` の 2 パターンで表示が切り替わる様子を確認できます。「ログイン」を押すと挨拶文が差し替わり、`+1` を押して未読が 1 以上になったときだけ赤字の警告が現れます。

<LiveDemo
  height="320px"
  :html="demoHtml"
  :js="demoJs"
/>

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- ログイン / ログアウトの状態で表示を切り替える画面を作る
- `&&` / 三項 / 早期 return の 3 パターンそれぞれを、別の箇所で 1 回ずつ書く

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/App.tsx` と `src/Message.tsx` を書く

### `src/Message.tsx`

```tsx
type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  // 早期 return: 空文字なら何も描画しない
  if (text.length === 0) {
    return null;
  }
  return <p className="message">{text}</p>;
}
```

### `src/App.tsx`

```tsx
import { useState } from "react";
import { Message } from "./Message";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unread, setUnread] = useState(0);
  const [memo, setMemo] = useState("");

  return (
    <>
      <h1>条件表示のデモ</h1>

      <section className="box">
        <h2>(A) 三項演算子: ログイン状態で切り替え</h2>
        {isLoggedIn ? (
          <p>ようこそ、Alice さん</p>
        ) : (
          <p>ゲストさん、こんにちは</p>
        )}
        <button onClick={() => setIsLoggedIn((v) => !v)}>
          {isLoggedIn ? "ログアウト" : "ログイン"}
        </button>
      </section>

      <section className="box">
        <h2>(B) && で「あるときだけ出す」</h2>
        <p>未読: {unread}</p>
        {unread > 0 && <p className="alert">{unread} 件の未読があります</p>}
        <button onClick={() => setUnread((c) => c + 1)}>+1</button>
        <button onClick={() => setUnread(0)}>既読にする</button>
      </section>

      <section className="box">
        <h2>(C) 早期 return: Message コンポーネント</h2>
        <input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="空のままだと表示されない"
        />
        <Message text={memo} />
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
  margin-right: 8px;
  padding: 4px 10px;
  cursor: pointer;
}

.alert {
  color: #b3261e;
  font-weight: bold;
}

.message {
  background-color: #eaf6ff;
  padding: 6px 10px;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .box {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
  .alert {
    color: #ff7a6d;
  }
  .message {
    background-color: #13344d;
    color: #eee;
  }
}
```

### 期待出力

- (A) ボタン「ログイン」を押すと、見出し下のメッセージが `ゲストさん、こんにちは` → `ようこそ、Alice さん` に変わる。ボタンの文言も `ログアウト` に変わる
- (B) `+1` ボタンを押すと「未読」の数字が増え、**1 以上になると初めて** 「N 件の未読があります」が赤文字で現れる。`既読にする` を押すと数字が 0 になり、警告文も消える
- (C) 入力欄に文字を入れると、下に水色背景の `<p>` が現れる。空にすると `<p>` ごと消える（`null` を返している）

### 変える

- (B) の条件を `unread > 0 &&` から `unread &&` に書き換えて、未読 0 のときに **画面に `0` が表示される** 現象を再現する。確認したら戻す
- (A) の三項を `&&` と `||` の組み合わせに書き換えてみる（余裕があれば）
- (C) の `if (text.length === 0)` を `if (text === "")` に変えても同じ動きになることを確認

### 自分で書く

- 「ステータス」の state を `"offline" | "loading" | "online"` のユニオン型で作る
- 値に応じて、`offline → 灰色の丸`、`loading → 黄色の丸 + "接続中..."`、`online → 緑の丸 + "接続済み"` を表示する
- 3 択なので、早期 return か、または `switch` で `if ... return` を 3 本重ねる形がおすすめ
- ヒント: `const [status, setStatus] = useState<"offline" | "loading" | "online">("offline");`

## まとめ

- JSX の中に書けるのは式だけ。条件分岐も **式の形** で書く
- `&&`: あるときだけ出す（ただし数値 0 に注意）
- 三項演算子: 2 択の切り替え
- 早期 return（`return null` を含む）: 3 択以上 / それぞれが大きいとき
- 条件が増えてきたら **コンポーネント分割** も選択肢
