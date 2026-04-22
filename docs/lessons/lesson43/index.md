# lesson43: コンポーネントと props

## ゴール

- コンポーネントを分けて再利用できる
- `type` で props の型を定義し、`import type` して使える
- `children` を受け取って自由な中身を差し込めるコンポーネントが書ける

## 解説

### lesson23 の分割代入と同じ書き方

本題の前に、1 行で接続しておきます。

lesson23 で学んだオブジェクトの分割代入を思い出してください。

```ts
const user = { name: "Alice", age: 20 };
const { name, age } = user; // 取り出す
```

React コンポーネントの props も、**全く同じ書き方**で値を取り出します。「lesson23 の分割代入の再登場」と思ってください。

```tsx
function Greeting({ name }: GreetingProps) {
  return <p>こんにちは、{name} さん</p>;
}
```

### props とは

コンポーネントを関数として見たとき、props は **引数** です。呼び出し側から値を渡し、コンポーネントの中で使います。HTML タグに属性を付ける感覚で書けます。

```tsx
<Greeting name="Alice" />
<Greeting name="Bob" />
```

同じ `Greeting` コンポーネントを、`name` を変えながら何回でも使い回せます。

### 型付き props

TypeScript で書くときは、props の形を型で表します。章 3 lesson33 で学んだ `type` エイリアスをそのまま使います。

```tsx
type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <p>こんにちは、{name} さん</p>;
}
```

- `GreetingProps` は「`name` という string を持つオブジェクト」の型
- `function Greeting({ name }: GreetingProps)` は「props（`GreetingProps`）を受け取り、その中の `name` を取り出して使う関数」

オブジェクト分割代入と同じ書き方がそのまま効きます。

### `import type` で型を別ファイルから持ってくる

章 3 の lesson33 / lesson40 で `types.ts` に `Todo` や `GreetingProps` のような型を書き、`import type` で呼ぶ練習をしました。React でも同じやり方が使えます。

```ts
// src/types.ts
import type { ReactNode } from "react";

export type GreetingProps = {
  name: string;
  age?: number;
  children?: ReactNode;
};
```

```tsx
// src/Greeting.tsx
import type { GreetingProps } from "./types";
```

- `import type { ... }` は「**型だけ** を持ってくる」という書き方
- ビルド後の JS には残らない（実行時のコストはゼロ）
- `ReactNode` は `react` パッケージから import する。`React.ReactNode` のように名前空間経由で書くこともできるが、新しい Vite テンプレート（自動 JSX ランタイム前提）では名前空間経由だと「`React` が見つからない」エラーが出やすいので、**個別に import する形に統一する**

### オプショナルプロパティ `?`

`age?: number` は「`age` は省略しても OK」という意味です。書く側は `<Greeting name="Alice" />` でも `<Greeting name="Alice" age={20} />` でも動きます。省略された場合、`age` の値は `undefined` になります。

### `children`（コピペで与える `ReactNode`）

コンポーネントのタグの**中身**を受け取りたいことがあります。例えばこう書きたい。

```tsx
<Card>
  <h2>タイトル</h2>
  <p>本文</p>
</Card>
```

`Card` の中身（`<h2>` と `<p>`）を、`Card` の中の好きな場所にはめ込みたい。この「中身」を受け取る特別な props の名前が **`children`** です。

型は `ReactNode` を使います（`react` パッケージから `import type` する）。**意味は「JSX として描画できるもの全て（要素・文字列・数値・配列など）」** ですが、当面は**コピペで与える決まり文句**と思って構いません。

```tsx
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children?: ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}
```

使う側は、タグの中に何でも書けます。

```tsx
<Card title="お知らせ">
  <p>本日は休業です。</p>
</Card>
```

### コンポーネントの作り方（ファイル分割）

コンポーネントが増えてきたら、1 ファイル 1 コンポーネントに分けます。

```tsx
// src/Greeting.tsx
import type { GreetingProps } from "./types";

export function Greeting({ name, age, children }: GreetingProps) {
  return (
    <div>
      <p>こんにちは、{name} さん</p>
      {age !== undefined && <p>{age} 歳です</p>}
      {children}
    </div>
  );
}
```

- ファイル名はコンポーネント名に合わせる（大文字始まり）
- **コンポーネント名は必ず大文字始まり**（`Greeting` / `Card`）。小文字で書くと JSX が通常の HTML タグとして解釈されてしまう
- `export function ...` で名前付きエクスポートするのが本コースの基本形

`{age !== undefined && <p>{age} 歳です</p>}` の `&&` は「左が真なら右を表示」。条件表示の詳しい話は lesson49 で扱います。ここでは「`age` が省略されたら `<p>` は出ない」と読み取れれば OK です。

## 演習

### 途中から始める場合

lesson42 までで作ったプロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開いて始めてください。このレッスンは `src/App.tsx` を書き換えるだけでほぼ完結します。章 3 の `types.ts` を参照する場面で下の型をそのまま貼って使っても OK です。

<details>
<summary>出発点のファイル（章 3 の <code>types.ts</code> を再掲）</summary>

**`src/types.ts`**

```ts
export type Todo = {
  id: string;
  text: string;
};
```

このレッスン本体では `Todo` 型自体は使いませんが、以降のレッスンで再利用するのでここで用意しておいても構いません。

</details>

### ゴール

- `Greeting` コンポーネントを別ファイルに切り出し、`App` から 3 パターンで呼び出す
- 型 `GreetingProps` を `types.ts` に置き、`import type` で使う
- `children` に JSX を差し込めることを確認する

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る（lesson42 のを使い回しても OK）
2. `src/types.ts` を新規作成
3. `src/Greeting.tsx` を新規作成
4. `src/App.tsx` を書き換える

### `src/types.ts`

```ts
import type { ReactNode } from "react";

export type GreetingProps = {
  name: string;
  age?: number;
  children?: ReactNode;
};
```

### `src/Greeting.tsx`

```tsx
import type { GreetingProps } from "./types";

export function Greeting({ name, age, children }: GreetingProps) {
  return (
    <div className="greeting">
      <p>こんにちは、{name} さん</p>
      {age !== undefined && <p>{age} 歳です</p>}
      {children}
    </div>
  );
}
```

### `src/App.tsx`

```tsx
import { Greeting } from "./Greeting";
import "./App.css";

function App() {
  return (
    <>
      <h1>Greeting デモ</h1>

      {/* (1) 名前のみ */}
      <Greeting name="Alice" />

      {/* (2) 名前 + 年齢 */}
      <Greeting name="Bob" age={25} />

      {/* (3) 名前 + children にメッセージ */}
      <Greeting name="Carol">
        <p>今日はよい天気ですね。</p>
      </Greeting>
    </>
  );
}

export default App;
```

### `src/App.css`

```css
.greeting {
  border: 1px solid #ccc;
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 4px;
  color: #222;
  background-color: #fff;
}

@media (prefers-color-scheme: dark) {
  .greeting {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
}
```

### 期待出力

画面にカード風のブロックが 3 つ、縦に並びます。

1. `こんにちは、Alice さん`（1 行だけ）
2. `こんにちは、Bob さん` / `25 歳です`（2 行）
3. `こんにちは、Carol さん` / `今日はよい天気ですね。`（2 行、2 行目は `children` として渡した `<p>`）

### 変える

- `<Greeting name="Bob" age={25} />` の `age` を消して `<Greeting name="Bob" />` にすると、2 枚目のカードが 1 行だけになることを確認
- `<Greeting name="Carol">` の中身を `<ul><li>りんご</li><li>みかん</li></ul>` に変えると、`children` がリストとして表示される
- `name` を消して `<Greeting age={30} />` と書くと、TypeScript が赤線で「`name` が足りない」と教えてくれる（`name` は必須のため）

### 自分で書く

- `types.ts` に `type CardProps = { title: string; children?: ReactNode }` を追加（`ReactNode` は `react` から `import type`）
- `src/Card.tsx` を作って、`title` を `<h2>` で、`children` を `<div>` で包んで表示する `Card` コンポーネントを実装
- `App.tsx` で `Card` を 2 個使ってみる（中身は自由）

## まとめ

- props は「コンポーネントの引数」。オブジェクトの分割代入（lesson23）で受け取る
- 型は `type` エイリアスで書き、`export type` / `import type` で別ファイルから使える
- オプショナルプロパティ `?:` で「あってもなくてもよい」プロパティを表せる
- `children` はタグの中身を受け取る特別な props。型は `ReactNode`（`react` から `import type`）
- コンポーネント名は必ず大文字始まり
