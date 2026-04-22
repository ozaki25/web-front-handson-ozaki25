# レッスン一覧（ドラフト v4）

v3 からの主な変更（サイクル 3 レビュー 3 視点を反映）:

- **lesson21**: Promise の自作を要求せず、`wait(ms)` 関数をコピペで提示して `await` する側だけ書かせる。
- **lesson37**: オブジェクトのイミュータブル更新を lesson42（React 版 TODO）に移し、lesson37 は「イベント + 配列のイミュータブル更新」に絞る。
- **lesson28**: オプショナル（`?`）を lesson29 へ移動。lesson28 は「オブジェクト型 / `type` / `export/import type`」の 3 点に絞る。
- **lesson31**: Utility Types を `Pick` / `Partial` の 2 つに絞り、`Readonly` / `Record` はコラム扱い。
- **lesson32**: 「仮想 DOM」という古い用語を避け、「React は UI を JS のツリーとして保持し、差分だけ DOM に反映する」に言い換え。Vite / npm / `package.json` / `npm run dev` の最低限を冒頭で紹介。
- **lesson48**: `searchParams` を lesson52（統合）へ移動。lesson48 は `params` の Promise 化と `find` による章 2 の復習に集中。`params: Promise<{ id: string }>` の型例を明記。
- **lesson50**: `"use server"` の配置位置（ファイル先頭 or 関数先頭）と async 必須を明記。データ保存先（インメモリ `const todos: Todo[] = []` + 再起動で消える）を明確化。`preventDefault` 自動化の対比も追加。
- **lesson51（最重要修正）**: `useActionState` の **シグネチャ** を正しく `[state, formAction, isPending] = useActionState(action, initialState)` と記載。action は `(prevState, formData) => newState` という reducer 形であることを強調。
- **lesson42（React 版 TODO）**: `useEffect([])` での復元と `useEffect([todos])` での保存が **初回の保存で localStorage を空配列で上書きするバグ** を防ぐため、`useState(() => JSON.parse(...))` 形式で初期値関数を使う方針を明記。
- **期待出力の書き下し**: 統合レッスン（25 / 42 / 52）と、lesson36（`setCount(count+1)` バッチ挙動）、lesson46（`console.log` で境界を体感）、lesson48（`?highlight=true` で該当タイトルに黄色背景）を具体化。
- **螺旋接続の 1 行予告 / 1 行対比**:
  - lesson11 末尾「最終 HTML を保存しておく。章 5 で JSX に書き換えて使う」
  - lesson20 末尾「`find` は章 5 で再登場」
  - lesson34 冒頭「lesson19 の分割代入と同じ書き方」
  - lesson35 冒頭「lesson16 の `for...of` / lesson20 の `map` との対比」
  - lesson38 冒頭「lesson06 の `name` → 制御コンポーネント」
  - lesson41 末尾「ブラウザ側 fetch の罠は Next.js 章で Server Component に任せる」
  - lesson44 冒頭「HTML → JSX の違い 3 点（`class`→`className` / `for`→`htmlFor` / 自己閉じタグ `/`）」
  - lesson50 冒頭「lesson24 の `preventDefault` は Server Actions では React が自動で止める」
- **lesson47**: fetch キャッシュの話題を「fetch 単体の既定変更」にスコープ限定し、`{ next: { revalidate: N } }` も併記。`loading.tsx` と `<Suspense>` の関係を 1 段落で紹介。
- **lesson46**: Client Component でも Server Component を **children / props 経由で** 受け取れる点を補足。`"use client"` はファイル先頭 1 行目で、import された子も Client 扱いになることを明記。エラーメッセージ例（"You're importing a component that needs useState..."）も掲載。
- **lesson49**: `error.tsx` の範囲は「レンダリング中の例外」であり、Server Actions のフォームエラーは `useActionState` で返す別経路である旨を明記。
- **lesson12**: `<script defer src="...">` を推奨パターンとして固定し、以降の章で `querySelector` が null を返す事故を防ぐ。
- **アクセシビリティ**: lesson05（または lesson09）に「見出し階層」「コントラスト」「フォーカスリング」の最小限の注意を 1 段落追加。
- **章番号は v3 から変更なし**（53 レッスン）。

## 設計方針

- 読者: Web 開発の初心者。HTML / CSS / JS / React / Next.js をほぼ触ったことがない。
- 1 レッスンで新しく導入する概念は原則 1 つ。
- 座学 → 演習 の順。StackBlitz で即動かす。
- 最終到達点: Next.js (App Router) で「フォーム + データ表示 + ルーティング」の小さなアプリを自作できる。
- 各レッスンはおおよそ 20〜40 分想定（読む + 手を動かす）。統合レッスン（25 / 42 / 52）は 60〜120 分想定。
- 章をまたぐ共通題材: 章 1 は「自己紹介ページ」、章 2 以降は「TODO アプリ」を段階的に進化させる。
- 自己紹介ページは章 5 で `/about` として再訪し、章 1 の資産を活かす。

## 章構成

| 章 | テーマ | レッスン数 | 範囲 |
|---|---|---|---|
| 1 | HTML / CSS | 11 | lesson01 〜 lesson11 |
| 2 | JavaScript | 14 | lesson12 〜 lesson25 |
| 3 | TypeScript | 6 | lesson26 〜 lesson31 |
| 4 | React | 11 | lesson32 〜 lesson42 |
| 5 | Next.js | 11 | lesson43 〜 lesson53 |

合計 **53 レッスン**。

---

## 章 1: HTML / CSS

共通題材: 「自己紹介ページ」を少しずつ育てる。

### lesson01: HTML ってなに？

- **ゴール**: 最小の HTML を書いてブラウザで表示する。DevTools の Elements パネルで要素を覗ける。
- **新概念**: HTML / タグ / `<!DOCTYPE html>` / `<html>` / `<head>` / `<body>` / DevTools（Elements）。
- **演習**: StackBlitz で「Hello, HTML」のページを作り、DevTools で `<h1>` を見る。

### lesson02: テキストを書く

- **ゴール**: 見出し・段落・強調を使い分けて文章を構造化する。
- **新概念**: `<h1>〜<h6>` / `<p>` / `<strong>` / `<em>`。
- **演習**: 自己紹介ページの冒頭を作る。

### lesson03: リストで並べる

- **ゴール**: 順序なし / 順序付きリストを書ける。
- **新概念**: `<ul>` / `<ol>` / `<li>`。
- **演習**: 自己紹介ページに「好きなもの」リストを追加する。

### lesson04: リンクと画像

- **ゴール**: 外部ページへのリンクと画像を埋め込める。
- **新概念**: `<a href>` / `<img src alt>`。
- **演習**: 自己紹介ページにお気に入りサイトへのリンクと画像を追加する。

### lesson05: ページの骨格を組む

- **ゴール**: セマンティックタグで骨格を作れる。アクセシビリティの最小限（見出しは `<h1>` をページに 1 つ、要素に意味のあるタグを使う）を意識できる。
- **新概念**: `<header>` / `<main>` / `<footer>`（`<nav>` / `<section>` は演習で軽く触れる）/ 見出し階層の原則。
- **演習**: 自己紹介ページを `<header>` / `<main>` / `<footer>` で整理する。末尾コラムで「色のコントラスト」「フォーカスリングを消さない」をアクセシビリティの入口として 1 段落紹介。

### lesson06: フォームを作る

- **ゴール**: 名前・メール・メッセージを受け取るフォームが書ける。`name` 属性と HTML ネイティブバリデーションを使える。`<label htmlFor>` でラベルと入力を紐付けられる。
- **新概念**: `<form>` / `<input type="text|email">` / `<label for>` / `<textarea>` / `<button>` / `name` / `required`。
- **演習**: 自己紹介ページに問い合わせフォームを追加（送信機能は後の章）。ラベルクリックで入力にフォーカスが移ることを DevTools で確認。

### lesson07: CSS を当てる

- **ゴール**: 外部 CSS ファイルを読み込み、要素セレクタで見た目を変えられる。
- **新概念**: `<link rel="stylesheet">` / 要素セレクタ / 宣言（プロパティ: 値）。
- **演習**: 自己紹介ページの `h1` と `p` に色を付ける。

### lesson08: クラスと状態

- **ゴール**: クラスセレクタを使い分け、マウスオーバー / フォーカスで見た目を変えられる。
- **新概念**: `class` 属性 / クラスセレクタ / `:hover` / `:focus`。
- **演習**: ボタンとリンクに hover と focus のスタイルを付ける。

### lesson09: 色と文字を整える

- **ゴール**: 色・背景色・フォントサイズ・行間・フォントファミリーを指定できる。
- **新概念**: `color` / `background-color` / `font-size` / `line-height` / `font-family`。
- **演習**: 自己紹介ページの配色とフォントを整える。

### lesson10: ボックスモデルで余白を作る

- **ゴール**: `margin` / `padding` / `border` / `width` を使い分けて余白と枠を作れる。
- **新概念**: ボックスモデル / `margin` / `padding` / `border` / `width` / `box-sizing`。
- **演習**: カード風の見た目を作る。

### lesson11: Flexbox とレスポンシブ（ミニ統合）

- **ゴール**: Flexbox で横並びにし、画面幅で切り替わるレイアウトを作れる。これまでの知識を統合して自己紹介ページを完成させる。
- **新概念**: `display: flex` / `gap` / `justify-content` / `align-items` / `@media` メディアクエリ。
- **演習**: 自己紹介ページのヘッダーと、lesson10 で作ったカード要素を 3 つ並べる。スマホサイズ（`max-width: 600px`）で縦並びに切り替える。
- **期待出力**: PC 幅では 3 枚のカードが横並び、スマホ幅では縦並び。ヘッダーは常に横並び。
- **想定時間**: 60 分（章 1 の統合のため長め）。
- **次章以降への橋渡し**: この最終 HTML と CSS を StackBlitz の自分のプロジェクトに保存しておく。章 5 の lesson44 で Next.js の `/about` ページとして JSX に書き換えて復活させる。

---

## 章 2: JavaScript

共通題材: lesson25 で「TODO アプリ（HTML + JS + localStorage）」を組み立てる。

### lesson12: 最初の JavaScript

- **ゴール**: HTML に JS を読み込み、コンソールに出力できる。変数を宣言できる。DevTools の Console パネルを使える。`<script defer>` を推奨パターンとして身につける。
- **新概念**: `<script defer src="...">`（外部 JS を遅延読み込みする標準パターン）/ `console.log` / `let` / `const` / DevTools（Console）。
- **演習**: 自分の名前を変数に入れてコンソールに表示する。`<script defer>` を `<head>` に書く形で固定し、以降の章ではこの形を使い続ける。
- **補足コラム**: 「なぜ defer か」を 1 段落で説明（`defer` なし or `<body>` 末尾配置との差、`querySelector` が null になる事故の予防）。

### lesson13: 値の種類

- **ゴール**: 文字列・数値・真偽値・null / undefined を区別できる。文字列にはテンプレートリテラルで値を埋め込める。
- **新概念**: 文字列 / 数値 / 真偽値 / `null` / `undefined` / テンプレートリテラル。
- **演習**: `` `あなたは ${name} さんです` `` のような出力を作る。

### lesson14: 条件で分岐する

- **ゴール**: `if` / `else` / 比較・論理演算で処理を分岐できる。
- **新概念**: `if` / `else if` / `else` / `===` / `!==` / `&&` / `||` / `!`。
- **演習**: 年齢で「成人 / 未成年」を分岐表示する。

### lesson15: 配列を扱う

- **ゴール**: 配列を作り、要素を参照・追加・削除できる。
- **新概念**: `[]` / インデックス / `length` / `push` / `pop`。
- **演習**: やることリストを配列で作り、要素を足して表示する。

### lesson16: 繰り返し処理

- **ゴール**: 配列の全要素を処理できる。
- **新概念**: `for...of`（主）/ `forEach`（軽く触れる程度）。
- **演習**: 配列の全要素をコンソールに出す。

### lesson17: 関数

- **ゴール**: 関数を定義して呼び出せる。引数と戻り値を使える。
- **新概念**: `function` 宣言 / アロー関数 / `return`。
- **演習**: 2 つの数を合計する関数。

### lesson18: オブジェクト

- **ゴール**: オブジェクトを作り、プロパティを読み書きできる。
- **新概念**: `{ key: value }` / ドット記法 / プロパティの追加・更新。
- **演習**: `user` オブジェクトを作って名前と年齢を読み書き。

### lesson19: 分割代入とスプレッド

- **ゴール**: オブジェクト / 配列から値を取り出し（分割代入）、コピーしたり結合したりできる（スプレッド）。2 つの違いを混乱せずに使い分けできる。
- **新概念**: 分割代入（`const { a, b } = obj`）/ 配列分割代入 / スプレッド構文（`...`）。
- **解説のポイント**: 「**取り出すとき** = 分割代入、**まとめる・広げるとき** = スプレッド」の対比表を必ず入れる。見た目が似ているので混同しやすい点を冒頭で警告。
- **演習（2 段）**: (A) `user` オブジェクトから `name` と `age` を分割代入で取り出して表示。(B) 取り出した値と既存オブジェクトをスプレッドでマージして新オブジェクトを作る。
- **章 4 への橋渡し**: lesson34（コンポーネントと props）で `function Greeting({ name }: Props)` のように分割代入を再利用する。

### lesson20: 配列の変換

- **ゴール**: `map` / `filter` で配列を変換・絞り込みできる。
- **新概念**: `map` / `filter`。
- **演習**: ユーザー配列から「成人のみ」「名前だけ」のリストを作る。
- **次章以降への橋渡し**: 配列から 1 件だけ取り出す `find` は章 5 の lesson48（動的ルートの詳細取得）で再登場する。章 4 の lesson35 では `map` が JSX の配列を作る形で再登場する。

### lesson21: 非同期処理の基本

- **ゴール**: 「時間がかかる処理」の概念を理解し、`async` / `await` で結果を受け取れる。Promise は「まだ完了していない結果を表す箱」という直感を持つ。
- **新概念**: 同期 / 非同期 / Promise（直感のみ。`.then` や `resolve` の自作は扱わない）/ `async` / `await` / `setTimeout`。
- **コピペで与えるコード**: `wait(ms)` 関数は本文にそのまま掲載し、読者は **呼び出し側だけ** 書く。`new Promise(...)` を自作させない。
  ```js
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  ```
- **演習**: 上記 `wait` をコピペし、`async function main() { ... }` の中で `await wait(1000)` して「1 秒後に表示」を体験する。
- **次レッスンへの橋渡し**: 戻り値が Promise である関数・メソッドは `await` が必要（`fetch`、`response.json()` など）。lesson22 で実例を扱う。

### lesson22: fetch で API から取得する

- **ゴール**: 外部 API からデータを取得して表示できる。エラーを捕まえられる。`fetch` も `response.json()` も Promise を返すため **両方とも `await` が必要** であることを理解する。
- **新概念**: `fetch` / `response.json()` / `try` / `catch` / ネットワークエラー。
- **解説のポイント**: 「戻り値が Promise のメソッドは `await` が必要」を冒頭で強調。`response.json()` を await し忘れる事故を防ぐ。
- **演習**: ダミー API（JSONPlaceholder など）から記事一覧を取得してコンソールに出す。URL をわざと壊して `catch` を動かす。`response.json()` の await を外すとどうなるか（Promise オブジェクトがそのまま表示される）も体験。

### lesson23: DOM を操作する

- **ゴール**: JS から HTML の内容を読み書き・クラスの付け外しができる。
- **新概念**: `document.querySelector` / `textContent` / `classList` / 要素の作成（`createElement`、`appendChild`）。
- **演習**: ボタンクリック（次レッスン）で切り替わる準備として、要素を JS で作って挿入する。

### lesson24: イベントで画面を動かす

- **ゴール**: クリックや入力に反応して画面を書き換えられる。フォーム送信の既定動作を止められる。
- **新概念**: `addEventListener` / `click` イベント / `submit` イベント / `event.preventDefault()`。
- **演習**: カウンターアプリ（+1 ボタン）を作る。

### lesson25: TODO アプリを作る（ミニ統合）

- **ゴール**: 章 2 の知識を統合して、入力・追加・削除できる TODO アプリを完成させる。`localStorage` で保存して、リロードしても消えないようにする。後続章で進化させる共通題材。
- **新概念**: なし（統合）/ `localStorage.getItem` / `localStorage.setItem` / `JSON.stringify` / `JSON.parse`。
- **演習の期待出力**:
  - 画面上部に入力欄と「追加」ボタン。下に `<ul>` の一覧が並ぶ。
  - 入力して追加 → 一覧の末尾に `<li>` が 1 件増え、各項目に「削除」ボタンが付く。
  - 削除ボタンクリック → その 1 件だけが消える。
  - リロードすると全部消える（章内チェックポイント 1）。
  - `localStorage` を追加 → リロードしても残る（章内チェックポイント 2）。
- **演習の 3 段構え**:
  1. 入力＋一覧表示（lesson23 の DOM + lesson24 のイベントで組み立てる、ここで一度コミット）
  2. 削除ボタン追加（lesson20 の `filter` を使う、ここで 2 回目のコミット）
  3. `localStorage` で保存・復元（`JSON.stringify` / `JSON.parse`。`JSON.parse` は失敗する可能性があるので lesson22 で学んだ `try` / `catch` で囲む、最終形）
- **想定時間**: 60〜120 分。

---

## 章 3: TypeScript

共通題材: 章 2 の TODO アプリの関数・データに型を付けてみる演習。

### lesson26: TypeScript ってなに？

- **ゴール**: 型がある意義を理解し、プリミティブ型の変数に型注釈を付けられる。
- **新概念**: 静的型付け / `string` / `number` / `boolean` / 型注釈。
- **演習**: 変数に型を付け、間違った値を入れてエラーを確認する。

### lesson27: 関数の型

- **ゴール**: 関数の引数と戻り値に型を付けられる。
- **新概念**: 引数の型 / 戻り値の型 / `void` / 関数型。
- **演習**: 章 2 で書いた関数に型を付け直す。

### lesson28: オブジェクトの型と type エイリアス

- **ゴール**: オブジェクトの形を `type` で表現できる。`export type` / `import type` で型を別ファイルから使える。
- **新概念**: オブジェクト型リテラル / `type` エイリアス / `export type` / `import type`。
- **演習**: `Todo` 型（`id: string; text: string` の 2 プロパティ）を `types.ts` に書いて `export type` する。別ファイルから `import type` して関数で受け取る。
- **次レッスンへの橋渡し**: オプショナルプロパティ（`?`）と配列・ユニオン型は lesson29 で扱う。`Todo` 型は lesson29 でさらに `status` を追加して拡張する。

### lesson29: 配列・ユニオン・リテラル型・オプショナル

- **ゴール**: 配列の型、複数の型の受け入れ、特定の値のみ許す型、省略可能なプロパティを表現できる。
- **新概念**: `T[]` / `Array<T>` / ユニオン型 (`|`) / リテラル型 / オプショナルプロパティ（`?`）。
- **演習**: lesson28 の `Todo` 型に `status: "open" | "done"` と `memo?: string` を追加。`Todo[]` 型の配列を扱う関数を書く。
- **スコープ外の明記**: `enum` や `as const` は本コースでは扱わない（リテラル型ユニオンで十分）。

### lesson30: ジェネリクス入門

- **ゴール**: 汎用関数に型パラメータを付けられる。
- **新概念**: ジェネリクス（`<T>`）/ 型推論の仕組み。
- **演習**: `first<T>(arr: T[]): T | undefined` を書く。

### lesson31: Utility Types で仕上げる

- **ゴール**: よく使う Utility Types を知り、型を派生できる。章 4 への前振りを理解する。
- **新概念**: `Pick` / `Partial`。
- **演習**: `Todo` から `TodoDraft = Partial<Todo>`（`id` が未確定の下書き表現）や `TodoSummary = Pick<Todo, 'id' | 'text'>`（一覧表示用）を派生させる。
- **コラム**: `Readonly` / `Record` など他の Utility Types は「必要になったときに調べればよい」と紹介程度に留める（本コースでは使わない）。
- **次章への前振り**: この `Todo` 型は次章 lesson34 / 35 で React コンポーネントの props として `import type` され、lesson42 の React 版 TODO アプリの型基盤になる。

---

## 章 4: React

共通題材: TODO アプリを React に移植し、段階的にリッチ化。最終的に localStorage 永続化まで取り戻す。

### lesson32: React ってなに？

- **ゴール**: なぜ React なのかを理解し、StackBlitz で最小の React + Vite プロジェクトを起動できる。Vite / npm / `package.json` / `npm run dev` の役割をざっくり把握する。
- **新概念**: React / コンポーネント / 「React は UI を JS のツリーとして保持し、変化した差分だけを DOM に反映する」 / Vite（開発サーバー + ビルド）/ npm（パッケージマネージャ）/ `package.json` の `scripts` / `npm run dev` / `App.tsx`。
- **解説のポイント**:
  - 「仮想 DOM」という古い用語は使わず、差分反映の仕組みとして説明する。
  - StackBlitz を使う限り `npm install` や `npm run dev` は自動で走る。コマンドは **知っておく程度** でよい。
  - `package.json` は `scripts` セクションだけ見れば今は十分。
- **演習**: StackBlitz の React + Vite テンプレートから起動して「Hello, React」を表示する。`package.json` を開いて `scripts.dev` の中身を確認するだけの小タスクも入れる。

### lesson33: JSX を書く

- **ゴール**: JSX の書き方と JS の式を埋め込む方法を理解する。
- **新概念**: JSX / `{式}` / `className`（`class` との違い）/ 属性のキャメルケース / フラグメント。
- **演習**: 名前と現在時刻を埋め込んだコンポーネントを書く。

### lesson34: コンポーネントと props

- **ゴール**: コンポーネントを分けて再利用し、型付きの props を渡せる。章 3 で定義した型を `import type` で使える。props の分割代入は lesson19 の復習と理解できる。
- **新概念**: コンポーネント分割 / props / 型付き props / `children`（型は `React.ReactNode`、コピペで与える）/ `import type`。
- **解説のポイント**: `function Greeting({ name }: GreetingProps)` の書き方は lesson19 で学んだオブジェクト分割代入そのもの。`children` の型 `React.ReactNode` はまずコピペで使い、意味は後追いで十分。
- **演習**: `types.ts` に `type GreetingProps = { name: string; age?: number; children?: React.ReactNode }` を定義し、`Greeting` コンポーネントが `import type` して 3 パターン表示する（名前のみ / 名前 + 年齢 / 名前 + `children` としてメッセージ）。

### lesson35: 配列を描画する

- **ゴール**: 配列から要素のリストを生成できる。素の JS との違いを掴める。
- **新概念**: `.map` でのレンダリング / `key` prop の役割。
- **解説の対比**: lesson16 の `for...of` + DOM 追加、lesson25 の TODO の描画と比較する。素の JS は「1 件ずつ DOM を作って `appendChild`」、React は「配列を `map` で JSX の配列に変えて `return` するだけ」。
- **演習**: lesson25 の TODO 形（`id: string; text: string`）をそのまま使い、ハードコードした `todos` 配列を `<ul>` で描画する。`Todo` 型は章 3 の `types.ts` から `import type` する。`key` を `todo.id` に設定。

### lesson36: state で状態を持つ

- **ゴール**: `useState` で状態を持ち、UI が自動更新される仕組みを理解する。更新関数に関数を渡す形（`setX(prev => prev + 1)`）を使える。
- **新概念**: `useState` / 状態更新関数 / 再レンダリング / 関数形式の更新（`prev =>`）。
- **演習**: カウンターアプリを React で作る。以下の 2 つを同じページ内で作って比較:
  - 「壊れやすい書き方」ボタン: `onClick` で `setCount(count + 1)` を 3 回呼ぶ → 1 しか増えない
  - 「正しい書き方」ボタン: `onClick` で `setCount(c => c + 1)` を 3 回呼ぶ → 3 増える
- **期待出力**: 「壊れやすい」側を押すと 1 ずつ、「正しい」側を押すと 3 ずつ増えるのが画面で確認できる。
- **解説のポイント**: React は同じイベント内の `setX` を **まとめて** 処理する（バッチング）。同じ `count` の値を参照するので `count + 1` は 3 回とも同じ結果になる。関数形式なら「その時点の `prev`」が毎回新しいので積み上がる。

### lesson37: イベントと配列のイミュータブル更新

- **ゴール**: クリックやキーイベントで state を更新できる。配列の state を **新しい配列を作って** 更新できる。
- **新概念**: `onClick` / イベントオブジェクトの型（`React.MouseEvent<HTMLButtonElement>` などはコピペで与える）/ スプレッドでの配列更新 / 「直接 `push` / `splice` しない」ルール。
- **演習**: カウンターに「リセット」「マイナス」を追加。さらに `todos` 配列 state に対して以下を実装:
  - 「末尾に追加」: `setTodos(prev => [...prev, newTodo])`
  - 「先頭に追加」: `setTodos(prev => [newTodo, ...prev])`
  - 「指定 id を削除」: `setTodos(prev => prev.filter(t => t.id !== id))`
- **スコープ外の明記**: オブジェクトの state を更新する方法（`setUser(prev => ({ ...prev, age: 30 }))` など）は lesson42 の React 版 TODO でまとめて扱う。ここでは配列更新に集中する。

### lesson38: フォームと制御コンポーネント

- **ゴール**: 入力値を state と同期させて制御できる。lesson06 の HTML フォーム（`name` 属性で値を集める）との対比を理解する。`<form>` には `action` 属性も渡せることを知る（詳細は章 5）。
- **新概念**: 制御コンポーネント / `onChange` / `value` / `<form action={fn}>` の書き方（紹介のみ）。
- **解説のポイント**:
  - lesson06 では `<input name="email">` と `<form>` の組み合わせで「ブラウザが値を集める」。React の制御コンポーネントは「state が入力値の持ち主になる」形。どちらも正しい書き方だが React では後者が基本。
  - `<form action>` は React 19 で **URL 文字列（従来の送信）も関数（Server Actions 等）も両方受け付ける** ようになった。章 4 の段階では紹介のみ、章 5 の lesson50 で関数を渡す形を使う。
- **演習**: 入力欄の内容がリアルタイムに表示されるプレビューを作る。`<form onSubmit={e => { e.preventDefault(); ... }}>` 形式は章 4 内の lesson40 / lesson42 で使い、`<form action={fn}>` 形式は章 5 lesson50 で登場する、と末尾で予告する。

### lesson39: 条件で出し分ける

- **ゴール**: 状態に応じて表示を分岐できる。
- **新概念**: `&&` / 三項演算子 / 早期 return。
- **演習**: ログイン状態で表示を切り替える。

### lesson40: 親子コンポーネントの連携

- **ゴール**: 子から親に値を伝え、状態を上に持ち上げられる。
- **新概念**: コールバック props / 状態の持ち上げ（state lifting）。
- **演習**: TODO 追加フォーム（子）と一覧（親）を分け、親の state に追加させる。

### lesson41: useEffect の基本

- **ゴール**: マウント時に一度だけ副作用を実行できる。依存配列の意味を理解する。
- **新概念**: `useEffect` / 依存配列（空配列 `[]` とそれ以外の違いのみ）/ 副作用とは。
- **このレッスンの範囲（冒頭で明示）**: 本コースの `useEffect` は **2 つのパターンだけ** 扱う。
  - (1) マウント時に 1 回だけ実行（依存配列 `[]`）: lesson41 の演習
  - (2) 特定の値が変わるたびに実行（依存配列 `[todos]` など）: lesson42 の演習（localStorage 保存）
  - クリーンアップ関数（戻り値の関数）、イベントリスナの解除などは本コースでは扱わない。
- **演習**: マウント時に `document.title` を「TODO (件数)」のように書き換える。データ取得（fetch）は扱わず Next.js 章へ（理由は末尾）。
- **コラム**: React 19 では `<title>` を JSX に直接書ける（ドキュメントメタデータサポート）。このレッスンは `useEffect` の素振りのために `document.title` を書き換える。実務で title だけ変えたいなら JSX に書く方が簡単。
- **次レッスンへの橋渡し**: ブラウザ側で `fetch` と `useEffect` を組み合わせると競合状態 / ローディング / エラー管理など罠が多い。本コースでは Next.js 章の Server Component でサーバー側 `fetch` に任せる方針。まずは lesson42 で localStorage からの復元に `useEffect` を使う。

### lesson42: TODO アプリを React で作る（ミニ統合）

- **ゴール**: 章 2 の TODO アプリを React + TS に移植して完成させる。localStorage から読み戻し、変更のたびに保存する。オブジェクトの state 更新（`setUser(prev => ({ ...prev, ... }))` 形）もここで扱う。
- **新概念**: なし（統合）/ 型付き state / コンポーネント分割の実践 / `useState` の **初期値関数**（`useState<Todo[]>(() => JSON.parse(localStorage.getItem('todos') ?? '[]'))`）/ オブジェクト state のイミュータブル更新。
- **重要な落とし穴の回避**: `useEffect(..., [])` で読み込み → `useEffect(..., [todos])` で保存、の順にすると **初回レンダー直後に空配列を localStorage に書き戻してしまう** バグが起きる。これを避けるため、初期値を `useState(() => ...)` の **初期値関数** で読み込む設計を採用する。保存は `useEffect(() => { localStorage.setItem('todos', JSON.stringify(todos)); }, [todos])` で良い。
- **コンポーネント分割の例**:
  ```tsx
  // TodoList の props
  type TodoListProps = {
    todos: Todo[];
    onDelete: (id: string) => void;
  };
  // TodoInput の props
  type TodoInputProps = {
    onAdd: (text: string) => void;
  };
  ```
- **演習の期待出力**:
  - lesson34 以降で作ってきた `types.ts` の `Todo` 型をそのまま使う。
  - `TodoInput` で入力 → 「追加」で一覧末尾に表示。
  - 各項目の「削除」でその行だけ消える。
  - リロードしても残る（localStorage から復元）。
  - `useState` の初期値関数を使わない誤った実装も章内コラムで紹介し、空配列書き戻しバグを再現 → 初期値関数で修正、を体験する。
- **想定時間**: 60〜120 分。

---

## 章 5: Next.js

共通題材: TODO アプリを Next.js（App Router）にルーティング付きで移植。Server Actions で永続化。章 1 の自己紹介も `/about` として復活。

### lesson43: Next.js ってなに？

- **ゴール**: Next.js と App Router の役割、React との違いを理解し、StackBlitz で最小のプロジェクトを起動できる。「サーバーでも動く」がどういうことか、ざっくり掴める。
- **新概念**: Next.js / App Router / ファイルベースルーティング / `app/page.tsx` / Server Component がデフォルトであること（RSC の一言紹介）。
- **演習**: テンプレートから起動してトップページを表示する。
- **末尾コラム（RSC ペイロード）**: 「Server Component はサーバーで React のレンダリングを行い、その結果を **HTML ではない、React が読める特殊な形式（RSC ペイロード）** でブラウザに送る。ブラウザ側の React はそれを受け取ってツリーに展開する。本コースでは詳細は扱わないが、『HTML をそのまま返すのとは違う』と覚えておけばよい」。

### lesson44: ページを増やしてリンクで移動する

- **ゴール**: 新しいページを追加し、`<Link>` で遷移できる。章 1 の自己紹介ページを `/about` として復活させる。
- **新概念**: `app/xxx/page.tsx` / `next/link` / ディレクトリ構造と URL の対応。
- **HTML → JSX の違い 3 点（冒頭で明示）**:
  1. `class` → `className`
  2. `for`（`<label for="...">`）→ `htmlFor`
  3. 自己閉じタグに `/` が必要（`<img src="..." />`、`<br />`）
- **演習**: `/about` と `/todos` の 2 ページを追加してナビを作る。
  - `/about`: lesson11 で保存した自己紹介ページの HTML を開き、上記 3 点の差し替えだけで `app/about/page.tsx` にする。CSS は `app/about/page.module.css` に移すか、`globals.css` にまとめる。
  - `/todos`: 空のプレースホルダ（「TODO 一覧はここに実装」）だけでよい。本実装は lesson52 で統合する。
- **期待出力**: ヘッダーの `<Link>` から `/` `/about` `/todos` の 3 ページを行き来できる。`/about` は章 1 と同じ見た目になる。

### lesson45: 共通レイアウトを作る

- **ゴール**: `layout.tsx` で全ページ共通のヘッダー / フッターを作れる。
- **新概念**: `layout.tsx` / `children` の受け渡し / ルートレイアウトがデフォルトで Server Component であること。
- **演習**: ヘッダーとフッターを全ページ共通にする。

### lesson46: Server Component と Client Component

- **ゴール**: 2 種類のコンポーネントの違いと使い分けを理解し、必要な箇所だけ Client にできる。境界の図を見て「Client は葉、Server が Client を children として包める」を掴める。
- **新概念**:
  - Server Component（デフォルト）/ Client Component / `"use client"`
  - どんな時に Client が必要か（state / イベント / ブラウザ API）
  - **`"use client"` はファイル先頭 1 行目に書く**。そのファイルから `import` されたコンポーネントも Client 扱いになる（Client 境界は import グラフに沿って伝播する）
  - Client が Server を **import はできない** が、**`children` / props として受け取る** ことは可能
- **演習**:
  1. `Counter.tsx` を `"use client"` 付きで作る（`useState` を使う）
  2. `app/page.tsx`（Server Component）の中に `<Counter />` を配置
  3. `Counter.tsx` の中に `console.log('client render')`、`app/page.tsx` に `console.log('server render')` を入れて実行
  4. ブラウザの Console には `client render` だけ、StackBlitz のターミナル（サーバー側）には `server render` だけが出ることを確認
- **期待出力の確認**: 上記の `console.log` の出方で、境界が体感できる。
- **エラーメッセージの例**: `Counter.tsx` から `"use client"` を消すとビルドエラーになる（`You're importing a component that needs useState. This React Hook only works in a Client Component...`）。このエラー文言も本文に載せる。
- **図**: Server（外側ツリー）→ Client（内側の葉）のツリー図を必ず入れる。ダークモードの色指定（背景・線・文字の各色）を忘れず、ライト / ダーク両方でコントラストが WCAG AA を満たすよう指定する。

### lesson47: Server Component でデータを取得する

- **ゴール**: Server Component で `fetch` を直接書けて、結果を描画できる。ローディング表示を追加できる。Next.js 15 の fetch 既定挙動を知る。
- **新概念**: async Server Component / サーバー側 `fetch` / `loading.tsx` / Next.js 15 の fetch キャッシュ既定（デフォルトでキャッシュしない）。
- **演習**: ダミー API（JSONPlaceholder など）から記事一覧を取って表示し、`loading.tsx` でローディング UI を出す。演習コード上はキャッシュ指定なしの `fetch(url)` のままでよい。
- **キャッシュの注意喚起（fetch に限定）**:
  - Next.js 14 までは fetch の結果はデフォルトでキャッシュされていた。15 以降、**fetch に関しては** デフォルトでキャッシュしない。
  - キャッシュしたい場合は `fetch(url, { cache: 'force-cache' })`。
  - 一定時間でキャッシュを更新したい場合は `fetch(url, { next: { revalidate: 60 } })`（60 秒毎に再取得）。
  - Route Handlers のキャッシュ挙動や Router Cache など、fetch 以外の話題は本コースでは扱わない。
- **コラム（`loading.tsx` と Suspense）**: `loading.tsx` は内部的には React の `<Suspense>` によるストリーミング描画で、ページの非同期待ちの間にフォールバック UI を表示する仕組み。本コースでは `<Suspense>` を単独では扱わないが、「`loading.tsx` の裏で Suspense が動いている」ことを 1 段落で紹介。

### lesson48: 動的ルート

- **ゴール**: URL の一部をパラメータとして受け取るページを作れる。`params` が Promise であることを扱える。章 2 で学んだ `find` を再利用する。
- **新概念**: `[id]` ディレクトリ / `params`（Next.js 15 から `Promise<...>`）/ `await params` / `Array.prototype.find`。
- **型例（本文に必ず掲載）**:
  ```tsx
  type Props = {
    params: Promise<{ id: string }>;
  };
  export default async function PostPage({ params }: Props) {
    const { id } = await params;
    // ...
  }
  ```
- **演習**: `/posts/[id]/page.tsx` を作り、一覧を `fetch` で取得した後 `find(p => p.id === id)` で対象記事を取り出して表示する。lesson20 の `find` の実用例として復習を兼ねる。
- **期待出力**: `/posts/1` にアクセスすると id=1 の記事タイトルと本文が表示される。
- **スコープ外の明記**: `searchParams`（`?highlight=true` のようなクエリ文字列の受け取り）も Next.js 15 で Promise 化されているが、本レッスンでは扱わない。lesson52（統合）で `searchParams` を使った「ハイライト表示」の演習を用意する。

### lesson49: エラーと見つからないページ

- **ゴール**: 例外とルート未マッチを個別のページで扱える。`error.tsx` がカバーする範囲を正しく理解する。
- **新概念**: `error.tsx` / `not-found.tsx` / `notFound()` 関数。
- **重要な範囲の注記**: `error.tsx` は **レンダリング中の例外**（Server Component の fetch 失敗、`throw` など）を捕まえるためのもの。Server Actions のフォーム送信エラー（バリデーション失敗など）は `error.tsx` では拾わず、lesson51 の `useActionState` で戻り値として返す別経路を使う。2 つは別物と覚える。
- **演習**: 記事詳細ページで存在しない ID の時に `notFound()` を呼んで `not-found.tsx` を表示。取得失敗時（URL を意図的に壊す）には `error.tsx` を表示。

### lesson50: Server Actions の最小形

- **ゴール**: フォーム送信をサーバー側の関数で処理できる。再検証で画面が更新される仕組みを理解する。
- **新概念**: Server Actions（`"use server"`）/ `<form action={fn}>` の `fn` に Server Action を渡す / `FormData` / `revalidatePath`。
- **`"use server"` の配置ルール（本文で明示）**:
  - **ファイル先頭に書く**: そのモジュール内のすべての **async エクスポート関数** が Server Action になる（例: `app/actions.ts` の先頭）
  - **関数の先頭行に書く**: その関数だけが Server Action になる（Server Component 内に定義するパターン）
  - **Server Action は必ず `async` 関数**。同期関数には書けない
  - **Client Component の中に `"use server"` は書けない**（別ファイルに分けて import する）
- **データ保存先の明示**: 本コースでは外部 DB は使わず、`app/actions.ts` の **モジュールトップレベルに `const todos: Todo[] = []`** を置いて擬似的な永続化とする。StackBlitz のサーバーが再起動すると消える（本物の DB ではない）ことを明示。
- **`preventDefault` の対比（冒頭コラム）**: lesson24 の素の JS では `<form>` の送信を `event.preventDefault()` で止めた。`<form action={fn}>` に **関数** を渡すと、React がデフォルト送信を自動で止めて `fn` を呼ぶ。コードから `preventDefault` が消えることに注目。
- **`revalidatePath` の仕組み（図付きで解説）**:
  - Server Component（例: `/todos` の `page.tsx`）は一度描画されるとキャッシュされる
  - Server Action の中で `revalidatePath('/todos')` を呼ぶと、そのパスのキャッシュが無効化される
  - 次にアクセス（または React の自動再描画）で Server Component が再実行され、`fetch` や配列読み取りの結果が最新になる
  - これによりフォーム送信後に一覧が自動で更新される
- **コラム（`revalidateTag`）**: パス単位以外に tag 単位の再検証もある。`fetch(url, { next: { tags: ['todos'] } })` と `revalidateTag('todos')` の組み合わせ。本コースでは使わないが、実務では頻出なので 1 段落で紹介。
- **演習**:
  1. `app/actions.ts` を作り、先頭に `"use server"`。`const todos: Todo[] = []` とエクスポート関数 `addTodo(formData: FormData)` を書く
  2. `addTodo` は `formData.get('text')` を取り出し、`todos.push({ id: crypto.randomUUID(), text })`、最後に `revalidatePath('/todos')`
  3. `/todos/page.tsx` を Server Component にし、`<form action={addTodo}>` を置いて追加フォームを作る。一覧はモジュールから `todos` を読む
  4. フォーム送信 → 一覧が更新される
- **次レッスンへの予告**: 「送信中にボタンを disabled にする」「空入力ならエラー表示」は lesson51 で扱う。

### lesson51: 送信状態とエラー表示

- **ゴール**: フォームの送信中状態とバリデーションエラーを表示できる。React 19 の新フックを正しく使える。
- **新概念**: `useActionState`（`react` から import）/ `useFormStatus`（`react-dom` から import）/ アクションの戻り値で状態を返す設計。
- **`useActionState` の正確なシグネチャ（本文で必ず書く）**:
  ```tsx
  "use client";
  import { useActionState } from "react";
  import { addTodo } from "./actions";

  type AddTodoState = { error?: string };

  const initialState: AddTodoState = {};

  // action は (prevState, formData) => newState の形（reducer に似た形）
  // useActionState(action, initialState) の順で渡す
  const [state, formAction, isPending] = useActionState(addTodo, initialState);
  ```
  - **第 1 引数**: Server Action（`async function addTodo(prevState, formData) { ... return newState; }`）
  - **第 2 引数**: 初期状態
  - **戻り値**: `[state, formAction, isPending]` の 3 要素タプル
  - `<form action={formAction}>` に渡すのは **`formAction`**（ラップ済みの関数）で、元の `addTodo` ではない
- **Server Action 側の形の修正（lesson50 の `addTodo` を変更）**:
  ```tsx
  "use server";
  export async function addTodo(prevState: AddTodoState, formData: FormData): Promise<AddTodoState> {
    const text = String(formData.get("text") ?? "").trim();
    if (text.length === 0) {
      return { error: "空のまま追加はできません" };
    }
    todos.push({ id: crypto.randomUUID(), text });
    revalidatePath("/todos");
    return {}; // 成功時は error なし
  }
  ```
- **`useFormStatus` の位置**:
  - `useFormStatus` は `<form>` の **子コンポーネント** で呼ぶ必要がある（フォーム本体では呼べない）
  - 「送信ボタン」を別コンポーネントに切り出し、その中で `const { pending } = useFormStatus()` を呼ぶ
- **import 元の混乱ポイント（必ず強調）**:
  - `useActionState` は **`react`** から（`react-dom` ではない）
  - `useFormStatus` は **`react-dom`** から
  - 名前が似ていて同じ領域の機能だが import 元が違う。ここで詰まる学習者が多いので太字で強調
- **演習**: lesson50 の TODO フォームに以下を追加:
  - 空入力のまま送信 → `state.error` を `<p>` に表示
  - 送信中は `SubmitButton` 内で `useFormStatus` を使い `disabled={pending}`
- **期待出力**:
  - 空のまま追加ボタンを押すと「空のまま追加はできません」と赤文字で表示（薄い赤背景）
  - 送信中は送信ボタンが disabled（グレー背景）
  - 成功するとエラー表示が消え、一覧に反映される

### lesson52: 小さなアプリを仕上げる（統合）

- **ゴール**: ここまでの知識で「投稿可能な TODO アプリ」を完成させる。メタデータを設定し、`searchParams` でハイライト表示を作れる。
- **新概念**: なし（統合）/ `export const metadata`（軽く）/ `generateMetadata` の紹介（動的メタデータ）/ `searchParams`（`Promise<{ highlight?: string }>`）/ `revalidatePath` の使いどころ復習。
- **演習の期待出力**:
  - `/todos`: 一覧（Server Component で `todos` を読む）+ 追加フォーム（Server Actions、`useActionState` でエラーと送信中状態を表示）
  - `/todos/[id]`: 詳細ページ（`params` を `await`、`find` で取り出す）
  - `/todos?highlight=<id>`: クエリ文字列で指定された id の TODO のテキストに **黄色背景** を付ける（`searchParams` を `await` して `highlight` を取り出し、一覧描画時に条件付き `className` を付ける）
  - `/about`: 章 1 の自己紹介ページが表示される
  - ルートレイアウトの `metadata` で全ページ共通のタイトルを設定
  - 詳細ページの `generateMetadata` で記事タイトルを動的に設定
- **`searchParams` の型例**:
  ```tsx
  type Props = {
    searchParams: Promise<{ highlight?: string }>;
  };
  export default async function TodosPage({ searchParams }: Props) {
    const { highlight } = await searchParams;
    // ...
  }
  ```
- **`generateMetadata` の最小例**（本文掲載）:
  ```tsx
  export async function generateMetadata({ params }: Props) {
    const { id } = await params;
    return { title: `Todo #${id}` };
  }
  ```
- **想定時間**: 60〜120 分。

### lesson53: Vercel にデプロイする

- **ゴール**: 作ったアプリを Vercel で公開し、URL を共有できる。StackBlitz → GitHub → Vercel の 3 ステップを実践できる。
- **新概念**: GitHub アカウント / StackBlitz の GitHub 連携（Fork to GitHub） / Vercel プロジェクト作成 / 環境変数の触り（概念のみ、本コースでは実際には使わない）。
- **手順（本文にステップバイステップで記載）**:
  1. GitHub アカウントを作る（すでにあれば不要）
  2. StackBlitz 上部の「Connect Repository」または「Fork to GitHub」を押し、自分の GitHub に新しいリポジトリとして保存する
  3. Vercel アカウントを作り（GitHub でログイン可能）、「Add New Project」から上記リポジトリを選択
  4. デフォルト設定（Framework Preset: Next.js）のまま Deploy を押す
  5. 数十秒で `https://<project>.vercel.app` が発行される
  6. URL を共有、またはブラウザで開いて動作確認
- **期待出力**: `https://<your-project>.vercel.app` にアクセスすると StackBlitz と同じ TODO アプリが動く。
- **注意**: StackBlitz のインメモリ `const todos: Todo[] = []` は Vercel でも「プロセスが生きている間だけ」保持される。Vercel のサーバーレス関数は呼び出しごとにリセットされる可能性があるため、**本番の永続化には DB が必要** という事実を末尾コラムで紹介（ただし本コースでは扱わない）。

---

## レビュー観点（自己チェック）

- [ ] 各レッスンで導入概念が実質 1 つ（Flexbox 等の関連プロパティ群はまとめて 1 概念として許容）
- [ ] 前のレッスンで未説明の概念を使っていない（特に `async`、分割代入、`preventDefault`、`FormData`）
- [ ] 演習が「ゴール + 期待出力」で書ける粒度。統合レッスンは画面構成まで具体化
- [ ] 章末のミニ統合（11 / 25 / 42 / 52）が前章までの知識だけで解ける
- [ ] 章 4 → 章 5 の接続（lesson43 で「なぜ Next.js か」を明示）
- [ ] 最新版 API 準拠:
  - React 19: `useActionState`（`react` から、シグネチャ `[state, formAction, isPending] = useActionState(action, initialState)`、action は `(prevState, formData) => newState`）
  - React 19: `useFormStatus`（`react-dom` から、`<form>` の子コンポーネントで呼ぶ）
  - Next.js 15: `params` / `searchParams` は `Promise<...>`、`await` して取り出す
  - Next.js 15: fetch の既定はキャッシュしない。`{ cache: 'force-cache' }` / `{ next: { revalidate: N } }` / `{ next: { tags: [...] } }` の 3 パターンを知る
- [ ] Server Actions の `"use server"` 配置ルール（ファイル先頭 or 関数先頭、async 必須、Client Component 内には書けない）を lesson50 で明記
- [ ] StackBlitz で 20〜40 分に収まる規模（統合レッスン 11 / 25 / 42 / 52 は 60〜120 分と明示）
- [ ] 螺旋構造が機能している:
  - 章 1 自己紹介ページ → lesson44 で `/about` として復活（HTML → JSX 差分 3 点）
  - 章 2 TODO → lesson42 React 移植 → lesson50 Server Actions 化
  - 章 2 `find` → lesson48 動的ルートで再登場
  - 章 2 localStorage → lesson42 で `useState` 初期値関数で復元（書き戻しバグ回避）
  - 章 3 `Todo` 型 → lesson34 / 35 で `import type`
  - 章 2 `for...of` / `map` → lesson35 で React の `map` に接続
  - 章 2 `preventDefault` → lesson38 `onSubmit` → lesson50 で React が自動化
- [ ] 仮想 DOM など古い用語を使っていない（React 19 時代の表現にする）
- [ ] ダークモード色指定忘れなし
