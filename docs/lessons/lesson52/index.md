# lesson52: React ってなに？

## ゴール

- React が何を解決する道具なのかを、自分の言葉で説明できる
- Vite / npm / `package.json` / `npm run dev` の役割をざっくり理解する
- StackBlitz の React + Vite（TypeScript）テンプレートから、自分の文字を画面に出せる

## 解説

### ここまでの立ち位置

2 章 までで、HTML に `<script defer>` で JS を読み込み、`document.querySelector` で要素を取ってきて `textContent` や `classList` をいじって画面を書き換えてきました。フォーム入力を受け取って `<ul>` に `<li>` を追加したり、削除ボタンで消したり、`localStorage` に保存して復元したり、といった操作も体験しました。

そこまでできるのなら、React はなぜ必要なのでしょうか。

### React が解決すること

素の JS で画面を書き換えるコードを思い出してください。例えば「リストに 1 件追加する」ためには、次のような手順が必要でした。

1. 新しい `<li>` 要素を `document.createElement` で作る
2. その中に文字を入れる
3. 削除ボタンを作って `<li>` の中にくっつける
4. `<ul>` に `appendChild` で追加する

「画面をこう変えたい」という気持ちから遠い、**手順の羅列**になりがちです。項目数が増えたり、削除・並び替え・ハイライトなど状態の種類が増えると、どの DOM をどう更新するかを 1 つずつ書かないといけません。バグも混入しやすいです。

React の発想はこうです。

> **画面（UI）を「今の状態」から計算される結果として書く**

コードの書き方は「今、配列がこうなっているなら、画面はこういう形です」と宣言するだけ。追加・削除で配列が変わると、React が「前の画面」と「新しい画面」を比べて、**変わった箇所だけ** DOM に反映してくれます。

### 仮想 DOM（virtual DOM）

「変わった箇所だけ DOM に反映する」を支える仕組みが **仮想 DOM**（virtual DOM） です。React の代名詞としてよく語られる概念で、技術記事や面接でも頻出するので、ここで一度きちんと押さえます。

仮想 DOM とは「**JS のオブジェクトツリーで表した UI のスナップショット**」です。本物の DOM（ブラウザが表示している `<div>` や `<p>` の集まり）とは別に、React は内部で UI のツリーを JS オブジェクトとして保持しています。

```
本物の DOM                仮想 DOM（JS オブジェクト）
<ul>             ←対応→   { type: 'ul', children: [
  <li>A</li>                { type: 'li', children: ['A'] },
  <li>B</li>                { type: 'li', children: ['B'] }
</ul>                     ]}
```

仕組みを 3 ステップで分解するとこうなります。

1. **ツリーを作る**: 状態が変わると、React は新しい仮想 DOM ツリーを丸ごと作り直す
2. **前のツリーと比較する**（reconciliation / 差分計算）: 「ここの `<li>` が増えた」「この属性が変わった」だけを抽出する
3. **差分だけを本物の DOM に反映する**: 変わった箇所の `appendChild` / `setAttribute` / `removeChild` を React が代行する

「全部書き換える」のではなく「**新しい姿を宣言する → React が差分を計算して必要な箇所だけ更新する**」という流れになるので、開発者は手順ではなく結果だけ書けばよいわけです。

::: tip 補足: React Compiler（React 19+）
React 19 から、コンパイル時に「変わらないツリーは作り直さない」最適化を加える **React Compiler** が入りました。仮想 DOM の仕組みは残り続けますが、不要な再レンダリングが自動で削られるので、`useMemo` / `useCallback` を手書きする場面が減っていきます（詳しくは「React Compiler」のレッスンで扱います）。
:::

なお、仮想 DOM は **React 固有の発明ではない** 概念です。Vue / Preact なども同じ発想で動いており、逆に Svelte / Solid のように「コンパイル時に直接 DOM を更新するコードを生成する」ことで仮想 DOM を不要にする派もあります。「差分だけ反映する」というゴールは同じで、その実現方法に流派がある、と捉えてください。

### コンポーネントという単位

React では、画面を**コンポーネント**という部品に分けて組み立てます。コンポーネントは「JSX を返す関数」です。

```tsx
function Hello() {
  return <h1>Hello, React</h1>;
}
```

この `Hello` をアプリのどこかで `<Hello />` と書くと、その場所に `<h1>Hello, React</h1>` が展開されます。自作の HTML タグを増やしていくようなイメージです。

### Vite / npm / `package.json` の最低限

素の JS なら `<script defer src="./script.js">` と書けば動きました。React + TypeScript では、TS を JS に変換したり、開発中に保存するとブラウザを自動更新したりする仕組みが必要です。その仕組みをまとめて提供してくれるのが **Vite**（ヴィート） です。

Vite は次の 2 つを担います。

- **開発サーバー**: ファイルを保存するたびに画面を自動更新（`npm run dev`）
- **ビルド**: 本番公開用に最適化したファイルを出力（`npm run build`）

そして Vite 本体や React 本体などの「外部ライブラリ」をダウンロード・管理する道具が **npm**（Node Package Manager） です。npm は `package.json` というファイルを見て、「このプロジェクトはどのライブラリを使っていて、どのコマンドで起動するか」を判断します。

`package.json` の `scripts` セクションだけ見れば、とりあえず十分です。例えば次のような形です。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

`npm run dev` と打つと、npm は `scripts.dev` に書かれているコマンド（ここでは `vite`）を実行します。Vite が開発サーバーを立ち上げて、ブラウザで表示できる状態になります。

### StackBlitz なら自動で走る

StackBlitz の React + Vite テンプレートを開くと、次のことが自動で起きます。

1. `npm install`（`package.json` に書かれたライブラリをダウンロード）
2. `npm run dev`（Vite 開発サーバーを起動）
3. プレビューエリアに画面が表示される

本コースでは `npm install` や `npm run dev` を **知っておく程度** でよく、コマンドを手で打つことはほとんどありません。それでも「StackBlitz の裏では Vite が動いている」「設定は `package.json` に書かれている」ことだけ頭に入れておくと、後で応用が利きます。

### `App.tsx` の位置

Vite の React + TS テンプレートでは、画面の入口となるファイルが 2 つあります。

- `src/main.tsx`: React を起動する（ここは基本触らない）
- `src/App.tsx`: 画面の中身を書く（本コースではここを中心に触る）

`main.tsx` の中で `<App />` をブラウザに流し込んでいます。イメージとしてはこうです。

```tsx
// src/main.tsx（テンプレートに最初から入っている）
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`StrictMode` は「開発中に問題を見つけやすくするラッパー」です。今は気にしなくてよいです。

本コースで意識的に編集するのは、基本的に `src/App.tsx` です。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- StackBlitz の React + Vite（TS）テンプレートから新しいプロジェクトを起動する
- `src/App.tsx` を編集して「Hello, React」とあなたの名前を画面に表示する
- `package.json` を開いて `scripts.dev` の値を確認する

### 手順

1. ブラウザで直リンク [https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts](https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts) を開く（**Vite + React + TypeScript** のテンプレートが立ち上がる。本コースでは旧 Create React App ではなく必ずこの Vite 版を使う）
2. 左のファイルツリーから `src/App.tsx` を開く
3. 中身を下記の内容に書き換える
4. 右のプレビューで確認する

### `src/App.tsx`

```tsx
function App() {
  const userName = "Alice";
  return (
    <div>
      <h1>Hello, React</h1>
      <p>こんにちは、{userName} さん</p>
    </div>
  );
}

export default App;
```

`{userName}` の部分は JSX の中に JS の変数を埋め込む書き方です。

### 期待出力

プレビューに次の 2 行が表示されます。

```
Hello, React
こんにちは、Alice さん
```

見出しの `Hello, React` が `<h1>` の大きな文字、`こんにちは、Alice さん` が `<p>` の通常の大きさで並びます。

### 変える

- `const userName = "Alice";` の `"Alice"` をあなたの名前に書き換えて保存する。保存するとプレビューが自動で更新されることを確認する
- `<h1>Hello, React</h1>` を `<h1>Hello, 世界</h1>` に変えて保存。これも即反映されるはず

### 自分で書く

- 変数 `age` を追加して、`<p>{age} 歳です</p>` という行を増やす
- 変数の型は今は書かなくてよい（3 章 でやった型注釈は、次の lesson で必要に応じて使う）

### `package.json` を覗く小タスク

1. 左のファイルツリーから `package.json` を開く
2. `"scripts"` の中を見つける
3. `"dev": "vite"` のような行があることを確認する

StackBlitz が自動で走らせているのは、この `vite` コマンドです。手元で同じことをやるなら、ターミナルで `npm install` → `npm run dev` と打つ流れになります。

## まとめ

- React は「画面を今の状態から計算する」発想の道具。差分だけを DOM に反映する
- 画面は**コンポーネント**（JSX を返す関数）の組み合わせで作る
- Vite は開発サーバーとビルドを担当し、`npm run dev` で起動する
- `package.json` の `scripts` セクションに、起動やビルドのコマンドがまとまっている
- StackBlitz を使う限り、`npm install` も `npm run dev` も自動で走る。コマンドは知っておく程度で OK
- 編集するのは基本的に `src/App.tsx`
