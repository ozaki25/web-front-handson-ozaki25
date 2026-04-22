# レッスン一覧（ドラフト v3）

v2 からの主な変更:

- **lesson21 を 2 本化**（`非同期の基本` + `fetch で API`）。過積載を解消。
- **lesson49 を 2 本化**（`Server Actions の最小形` + `送信状態とエラー表示`）。React 19 の `useActionState` / `useFormStatus` を独立回に。
- **lesson25（旧 lesson24）の TODO に localStorage を追加**。「リロードで消える」問題を先に体験させる。
- **lesson42（旧 lesson41）の React 版 TODO で localStorage から復元**（`useEffect([])`）して螺旋を閉じる。
- **lesson46 Server/Client 境界の図解**を明示化（Client は葉、Server が Client を children として包める）。
- **lesson47 fetch キャッシュ**: Next.js 15 の既定変更（デフォルトでキャッシュしない）を注意喚起。
- **lesson48 動的ルート**: `searchParams` も Promise 化。詳細取得で `find` を使い章 2 を復習。
- **lesson34 props 型**: 章 3 で定義した `type` を `import` で使う具体例に。
- **lesson31 末尾に章 4 への前振り**（この `Todo` 型を React の props に渡す）を追加。
- **lesson36 / 37**: `setX(prev => ...)` や配列・オブジェクトのイミュータブル更新を明示。
- **自己紹介ページの再訪**: lesson44 で `/about` として章 1 の自己紹介を Next.js に移植。
- **`useActionState` の import 元は `react`**（`react-dom` ではない）ことを lesson51 で明記。
- **`<form action={fn}>` の書き方** を lesson38（フォーム）で先に 1 度触れる。
- **lesson43 RSC 概要**: 「サーバーで実行され、結果が RSC ペイロードとしてブラウザに届く」を一言。
- **章番号のずれ**: 章 2 の分割で章 3 以降が +1、章 5 の分割でさらに +1。総数 53。

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

- **ゴール**: セマンティックタグで骨格を作れる。
- **新概念**: `<header>` / `<main>` / `<footer>`（`<nav>` / `<section>` は演習で軽く触れる）。
- **演習**: 自己紹介ページを `<header>` / `<main>` / `<footer>` で整理する。

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
- **演習**: 自己紹介ページのヘッダーとカード一覧を Flexbox で並べ、スマホサイズで縦並びに切り替える。

---

## 章 2: JavaScript

共通題材: lesson25 で「TODO アプリ（HTML + JS + localStorage）」を組み立てる。

### lesson12: 最初の JavaScript

- **ゴール**: HTML に JS を読み込み、コンソールに出力できる。変数を宣言できる。DevTools の Console パネルを使える。
- **新概念**: `<script>` / `console.log` / `let` / `const` / DevTools（Console）。
- **演習**: 自分の名前を変数に入れてコンソールに表示する。

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

- **ゴール**: オブジェクト / 配列から値を取り出し、コピーしたり結合できる。
- **新概念**: 分割代入（`const { a, b } = obj`）/ 配列分割代入 / スプレッド構文（`...`）。
- **演習**: `user` オブジェクトから必要なプロパティを取り出し、別オブジェクトにスプレッドでマージする。

### lesson20: 配列の変換

- **ゴール**: `map` / `filter` で配列を変換・絞り込みできる。
- **新概念**: `map` / `filter`（`find` は次回以降で扱う）。
- **演習**: ユーザー配列から「成人のみ」「名前だけ」のリストを作る。

### lesson21: 非同期処理の基本

- **ゴール**: 「時間がかかる処理」の概念を理解し、`async` / `await` で結果を受け取れる。
- **新概念**: 同期 / 非同期 / Promise（概念のみ）/ `async` / `await` / `setTimeout`。
- **演習**: `setTimeout` を `Promise` でラップした `wait(ms)` 関数を `await` する。「1 秒後に表示」を体験。

### lesson22: fetch で API から取得する

- **ゴール**: 外部 API からデータを取得して表示できる。エラーを捕まえられる。
- **新概念**: `fetch` / `response.json()` / `try` / `catch` / ネットワークエラー。
- **演習**: ダミー API（JSONPlaceholder など）から記事一覧を取得してコンソールに出す。URL をわざと壊して `catch` を動かす。

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
- **演習**: フォーム入力 → 配列に追加 → `map` で描画 → 削除ボタンで `filter`。**まず localStorage なしで作り、リロードで消えることを体験** → `localStorage` で保存して解決する、の 2 段構え。
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

- **ゴール**: オブジェクトの形を `type` で表現できる。オプショナルプロパティを使える。`export type` / `import type` で型を別ファイルから使える。
- **新概念**: オブジェクト型リテラル / `type` エイリアス / オプショナル（`?`）/ `export type` / `import type`。
- **演習**: `Todo` 型を別ファイル（`types.ts`）に書いて `import type` で使う。関数で受け取る。

### lesson29: 配列・ユニオン・リテラル型

- **ゴール**: 配列の型、複数の型の受け入れ、特定の値のみ許す型を表現できる。
- **新概念**: `T[]` / `Array<T>` / ユニオン型 (`|`) / リテラル型。
- **演習**: `status: "open" | "done"` を持つ `Todo` 配列を扱う。

### lesson30: ジェネリクス入門

- **ゴール**: 汎用関数に型パラメータを付けられる。
- **新概念**: ジェネリクス（`<T>`）/ 型推論の仕組み。
- **演習**: `first<T>(arr: T[]): T | undefined` を書く。

### lesson31: Utility Types で仕上げる

- **ゴール**: よく使う Utility Types を知り、型を派生できる。章 4 への前振りを理解する。
- **新概念**: `Pick` / `Partial` / `Readonly`（軽く `Record`）。
- **演習**: `Todo` から `TodoDraft = Partial<Todo>` や `TodoId = Pick<Todo, 'id'>` を派生させる。
- **前振り**: 「この `Todo` 型を次章では React のコンポーネントの props に渡す」ことを末尾で予告。

---

## 章 4: React

共通題材: TODO アプリを React に移植し、段階的にリッチ化。最終的に localStorage 永続化まで取り戻す。

### lesson32: React ってなに？

- **ゴール**: なぜ React なのかを理解し、StackBlitz で最小の React + Vite プロジェクトを起動できる。
- **新概念**: React / コンポーネント / 仮想 DOM（軽く）/ Vite / `App.tsx`。
- **演習**: テンプレートから起動して「Hello, React」を表示する。

### lesson33: JSX を書く

- **ゴール**: JSX の書き方と JS の式を埋め込む方法を理解する。
- **新概念**: JSX / `{式}` / `className`（`class` との違い）/ 属性のキャメルケース / フラグメント。
- **演習**: 名前と現在時刻を埋め込んだコンポーネントを書く。

### lesson34: コンポーネントと props

- **ゴール**: コンポーネントを分けて再利用し、型付きの props を渡せる。章 3 で定義した型を `import type` で使える。
- **新概念**: コンポーネント分割 / props / 型付き props / `children` / `import type`。
- **演習**: `Greeting` コンポーネントに `type GreetingProps = { name: string; age?: number }` を別ファイルで定義し、`import type` して 3 パターン表示する。

### lesson35: 配列を描画する

- **ゴール**: 配列から要素のリストを生成できる。
- **新概念**: `.map` でのレンダリング / `key` prop の役割。
- **演習**: ハードコードした `todos` 配列を `<ul>` で描画する。`Todo` 型（章 3 の `type`）を `import type` して使う。

### lesson36: state で状態を持つ

- **ゴール**: `useState` で状態を持ち、UI が自動更新される仕組みを理解する。更新関数に関数を渡す形（`setX(prev => prev + 1)`）を使える。
- **新概念**: `useState` / 状態更新関数 / 再レンダリング / 関数形式の更新（`prev =>`）。
- **演習**: カウンターアプリを React で作る。連打しても正しく増える書き方（`setCount(c => c + 1)`）と、壊れやすい書き方（`setCount(count + 1)` を短時間で連続）を比較する。

### lesson37: イベントとイミュータブル更新

- **ゴール**: クリックやキーイベントで state を更新できる。配列・オブジェクトの state を **作り直して** 更新できる。
- **新概念**: `onClick` / イベントオブジェクトの型 / スプレッドでの配列・オブジェクト更新 / 「直接書き換えない」ルール。
- **演習**: カウンターに「リセット」「マイナス」を追加。さらに `todos` 配列 state に対して「末尾に追加」「先頭に追加」「指定 id を削除」を **新しい配列を作る形** で実装。

### lesson38: フォームと制御コンポーネント

- **ゴール**: 入力値を state と同期させて制御できる。`<form>` には `action` 属性も渡せることを知る（詳細は章 5）。
- **新概念**: 制御コンポーネント / `onChange` / `value` / `<form action={fn}>` の書き方（紹介のみ）。
- **演習**: 入力欄の内容がリアルタイムに表示されるプレビューを作る。末尾コラムで「`<form action={fn}>` は章 5 の Server Actions で本格的に使う」と予告。

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
- **演習**: マウント時に `document.title` を書き換える。データ取得（fetch）は **扱わず Next.js 章へ**。
- **次レッスンへの橋渡し**: 「次は localStorage から TODO を読み戻す」と予告。

### lesson42: TODO アプリを React で作る（ミニ統合）

- **ゴール**: 章 2 の TODO アプリを React + TS に移植して完成させる。localStorage から読み戻し、変更のたびに保存する。
- **新概念**: なし（統合）/ 型付き state / コンポーネント分割の実践 / `useEffect` による localStorage 連携。
- **演習**: 章 2 の TODO を `TodoInput` / `TodoList` / `TodoItem` に分割し、props と state で再構築。`useEffect(..., [])` で localStorage から復元、`useEffect(..., [todos])` で保存。章 2 の「リロードで消える問題」が React でも解決することを確認。
- **想定時間**: 60〜120 分。

---

## 章 5: Next.js

共通題材: TODO アプリを Next.js（App Router）にルーティング付きで移植。Server Actions で永続化。章 1 の自己紹介も `/about` として復活。

### lesson43: Next.js ってなに？

- **ゴール**: Next.js と App Router の役割、React との違いを理解し、StackBlitz で最小のプロジェクトを起動できる。「サーバーでも動く」がどういうことか、ざっくり掴める。
- **新概念**: Next.js / App Router / ファイルベースルーティング / `app/page.tsx` / Server Component がデフォルトであること（RSC の一言紹介）。
- **演習**: テンプレートから起動してトップページを表示する。末尾コラムで「Server Component はサーバーで実行され、結果が RSC ペイロードとしてブラウザに届く」を 1 段落で紹介。

### lesson44: ページを増やしてリンクで移動する

- **ゴール**: 新しいページを追加し、`<Link>` で遷移できる。章 1 の自己紹介ページを `/about` として復活させる。
- **新概念**: `app/xxx/page.tsx` / `next/link` / ディレクトリ構造と URL の対応。
- **演習**: `/about`（章 1 の自己紹介 HTML を JSX に書き換えて移植）、`/todos` の 2 ページを追加し、ナビを作る。「章 1 で作った HTML がほぼそのまま JSX になる」ことを体験。

### lesson45: 共通レイアウトを作る

- **ゴール**: `layout.tsx` で全ページ共通のヘッダー / フッターを作れる。
- **新概念**: `layout.tsx` / `children` の受け渡し / ルートレイアウトがデフォルトで Server Component であること。
- **演習**: ヘッダーとフッターを全ページ共通にする。

### lesson46: Server Component と Client Component

- **ゴール**: 2 種類のコンポーネントの違いと使い分けを理解し、必要な箇所だけ Client にできる。境界の図を見て「Client は葉、Server が Client を children として包める」を掴める。
- **新概念**: Server Component（デフォルト）/ Client Component / `"use client"` / どんな時に Client が必要か（state / イベント / ブラウザ API）/ 境界の方向性（Client が Server を import はできないが、Server は Client を children として渡せる）。
- **演習**: カウンターを Client Component として分離する。Server Component の中に `<Counter />` を配置し、境界を図で確認。
- **図**: Server（外側）→ Client（内側）のツリー図を必ず入れる。ダークモード色指定忘れず。

### lesson47: Server Component でデータを取得する

- **ゴール**: Server Component で `fetch` を直接書けて、結果を描画できる。ローディング表示を追加できる。Next.js 15 の fetch 既定挙動を知る。
- **新概念**: async Server Component / サーバー側 `fetch` / `loading.tsx` / Next.js 15 のキャッシュ既定（デフォルトでキャッシュしない）。
- **演習**: ダミー API から記事一覧を取って表示し、`loading.tsx` でローディング UI を出す。末尾で「Next.js 14 まではデフォルトでキャッシュしていたが、15 からはデフォルトでキャッシュしない。キャッシュしたい場合は `fetch(url, { cache: 'force-cache' })`」を注意喚起。

### lesson48: 動的ルート

- **ゴール**: URL の一部をパラメータとして受け取るページを作れる。`params` と `searchParams` が Promise であることを扱える。章 2 で学んだ `find` を再利用する。
- **新概念**: `[slug]` ディレクトリ / `params`（Next.js 15 から `Promise<...>`）/ `searchParams`（同じく Promise）/ `await params` / `Array.prototype.find`。
- **演習**: `/posts/[id]` で記事詳細を表示。一覧を fetch して `find` で対象を取り出す実装にし、章 2 の復習を兼ねる。`searchParams` でクエリ文字列（例: `?highlight=true`）を受け取る演習も追加。

### lesson49: エラーと見つからないページ

- **ゴール**: 例外とルート未マッチを個別のページで扱える。
- **新概念**: `error.tsx` / `not-found.tsx` / `notFound()` 関数。
- **演習**: 記事詳細ページで存在しない ID の時に `not-found`、取得失敗時に `error` を表示。

### lesson50: Server Actions の最小形

- **ゴール**: フォーム送信をサーバー側の関数で処理できる。再検証で画面が更新される仕組みを理解する。
- **新概念**: Server Actions（`"use server"`）/ `<form action={fn}>` の `fn` に Server Action を渡す / `FormData` / `revalidatePath`。
- **演習**: TODO 追加フォームを Server Actions で実装。成功したら `revalidatePath('/todos')` で一覧を更新。**送信中状態とバリデーションエラーは次回**と明示。

### lesson51: 送信状態とエラー表示

- **ゴール**: フォームの送信中状態とバリデーションエラーを表示できる。React 19 の新フックを正しく使える。
- **新概念**: `useActionState`（`react` から import）/ `useFormStatus`（`react-dom` から import）/ アクションの戻り値で状態を返す設計。
- **演習**: 前回の TODO フォームに「空入力ならエラー」「送信中はボタン disabled」を追加。`useActionState` の第 2 引数に Server Action、戻り値で `{ error?: string }` を返す形を実装。
- **注意**: `useActionState` は **`react`** から import（`react-dom` ではない）。`useFormStatus` は `react-dom` から。ここで混乱しやすいので 1 段落で強調。

### lesson52: 小さなアプリを仕上げる（統合）

- **ゴール**: ここまでの知識で「投稿可能な TODO アプリ」を完成させる。メタデータも設定できる。
- **新概念**: なし（統合）/ `export const metadata`（軽く）/ `revalidatePath` の使いどころ復習。
- **演習**: TODO 一覧ページ + 詳細ページ + 追加フォームを統合。メタデータを設定。`/about` も含めて全体を整える。
- **想定時間**: 60〜120 分。

### lesson53: Vercel にデプロイする

- **ゴール**: 作ったアプリを Vercel で公開し、URL を共有できる。
- **新概念**: GitHub 連携 / Vercel プロジェクト作成 / 環境変数の触り。
- **演習**: GitHub にプッシュ、Vercel で公開、URL を共有。

---

## レビュー観点（自己チェック）

- [ ] 各レッスンで導入概念が実質 1 つ（Flexbox 等の関連プロパティ群はまとめて 1 概念として許容）
- [ ] 前のレッスンで未説明の概念を使っていない（特に `async`、分割代入、`preventDefault`、`FormData`）
- [ ] 演習が「ゴール + 期待出力」で書ける粒度
- [ ] 章末のミニ統合（11 / 25 / 42 / 52）が前章までの知識だけで解ける
- [ ] 章 4 → 章 5 の接続（lesson43 で「なぜ Next.js か」を明示）
- [ ] 最新版 API 準拠（React 19: `useActionState`（`react` から） / `useFormStatus`（`react-dom` から）、Next.js 15: `params` / `searchParams` は async、fetch 既定はキャッシュしない）
- [ ] StackBlitz で 20〜40 分に収まる規模（統合レッスンは 60〜120 分と明示）
- [ ] 章 1 → 章 5（`/about` 再訪）、章 2 → 章 4（TODO 移植）、章 2 → 章 5（`find` 再登場）の螺旋が機能している
- [ ] ダークモード色指定忘れなし
