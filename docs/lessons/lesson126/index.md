# lesson126: React Compiler

## ゴール

- React Compiler が **何を自動化** するかを言える
- 「手動メモ化（`useMemo` / `useCallback` / `React.memo`）が要らなくなる」境界を理解する
- React Compiler 1.0（2025 年 10 月安定版）の **現在地** を知る
- Next.js / Vite で React Compiler を **有効化** できる
- 既存コードでハマらないための注意点（Rules of React）を押さえる

::: tip 前提
このレッスンは「`useMemo` で計算のメモ化」の発展編です。`useMemo` / `useCallback` / `React.memo` の基本は「`useMemo` で計算のメモ化」「配列を描画する」を確認してください。
:::

## 解説

### 「手動メモ化」の苦しみ

React は **state や props が変わると再レンダリング** します。これは正しい挙動ですが、巨大なコンポーネントツリーで再レンダリングが連鎖すると重くなる。そのために導入されたのが:

- `useMemo`: 値の **再計算を抑える**
- `useCallback`: 関数の **再生成を抑える**
- `React.memo`: コンポーネントの **再レンダリングを抑える**

```tsx
const filtered = useMemo(
  () => items.filter((i) => i.active),
  [items],
);

const onClick = useCallback(
  () => handler(value),
  [value],
);

const Memoed = React.memo(Child);
```

3 つとも本来は **React が効率の良い動作をするためのヒント** にすぎません。けれど、現実は:

- **書き忘れ**でパフォーマンス劣化
- **依存配列のミス**でバグ
- **過度なメモ化**で逆に遅くなる
- 読みづらいコード

これを **コンパイラが自動でやる** のが React Compiler の役割です。

### React Compiler とは

[React Compiler](https://react.dev/learn/react-compiler/introduction) は、**Babel ベースのコンパイラ** で、ソースコードを **解析してメモ化を自動挿入** します。

```tsx
// あなたが書くコード
function Cart({ items }: { items: Item[] }) {
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return <p>合計: {total}</p>;
}

// Compiler が変換した結果（イメージ）
function Cart({ items }: { items: Item[] }) {
  const $ = useMemoCache(2);
  let total;
  if ($[0] !== items) {
    total = items.reduce((sum, i) => sum + i.price, 0);
    $[0] = items;
    $[1] = total;
  } else {
    total = $[1];
  }
  return <p>合計: {total}</p>;
}
```

実際の出力は人間が読まなくて良い形式ですが、要は **手動の useMemo を全部書いた状態** に近づけてくれます。

### 1.0 安定版（2025 年 10 月）

[React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1) が **2025 年 10 月** にリリースされました。Meta の Instagram / Facebook など大規模アプリで実戦投入され、**プロダクション ready** 扱い。

主な仕様:

- React 17 / 18 / 19 と互換（19 推奨）
- TypeScript 完全対応
- Next.js / Remix / Expo / Vite すべてでサポート
- ビルド時間は **やや増える**（軽量化が継続中）

### Next.js 16 で有効化

[Next.js 16](https://nextjs.org/blog/next-16)（2025 年 10 月）以降、React Compiler は **stable** な設定オプションになりました（experimental から昇格）。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

これだけで OK。デフォルトでは ON ではないので、**明示的に有効化** します。

#### 細かい設定

```ts
const nextConfig: NextConfig = {
  reactCompiler: {
    compilationMode: "annotation",  // "all" | "annotation" | "infer"
  },
};
```

| `compilationMode` | 説明 |
|---|---|
| `"all"`（デフォルト） | すべてのコンポーネントを変換 |
| `"annotation"` | `"use memo"` ディレクティブを書いたコンポーネントだけ |
| `"infer"` | use の前提を満たす関数のみ |

「徐々に試したい」場合は `"annotation"` から始めて、確認後に `"all"` に切り替えるのが安全。

### Vite で有効化

```bash
npm install -D babel-plugin-react-compiler
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const ReactCompilerConfig = {};

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ],
      },
    }),
  ],
});
```

### 「メモ化が要らなくなる」とは

#### Before

```tsx
function ProductList({ products, query }: Props) {
  const filtered = useMemo(
    () => products.filter((p) => p.name.includes(query)),
    [products, query],
  );

  const handleClick = useCallback(
    (id: string) => navigate(`/product/${id}`),
    [navigate],
  );

  return (
    <ul>
      {filtered.map((p) => (
        <ProductCard key={p.id} product={p} onClick={handleClick} />
      ))}
    </ul>
  );
}

const ProductCard = React.memo(({ product, onClick }: CardProps) => (
  <li onClick={() => onClick(product.id)}>{product.name}</li>
));
```

#### After（Compiler 有効）

```tsx
function ProductList({ products, query }: Props) {
  const filtered = products.filter((p) => p.name.includes(query));
  const handleClick = (id: string) => navigate(`/product/${id}`);

  return (
    <ul>
      {filtered.map((p) => (
        <ProductCard key={p.id} product={p} onClick={handleClick} />
      ))}
    </ul>
  );
}

function ProductCard({ product, onClick }: CardProps) {
  return <li onClick={() => onClick(product.id)}>{product.name}</li>;
}
```

「**普通に書いた JSX** が、コンパイル後は **十分にメモ化された** コードに変換される」のが Compiler の価値。

### 何が変わるか / 変わらないか

#### 変わるもの

- **`useMemo` / `useCallback` の手動記述が不要** に
- **`React.memo` で囲う必要がない**（依存があれば自動でメモ化される）
- 依存配列の書き間違いミスが消える

#### 変わらないもの

- `useEffect` / `useState` / `useRef` などの Hook は **そのまま** 使う
- **データ取得** や **副作用** の責務は変わらない
- **大きな計算は別ワーカーへ** 等、本質的な最適化は別問題

### Rules of React

Compiler が動くには **コードが React のルールに従っている** ことが前提です。

#### Components / Hooks は **純粋**

- レンダリング中に副作用を起こさない（DOM 直接操作 / API 呼び出し / setState）
- 同じ入力からは同じ出力を返す（**ピュア**）

```tsx
// NG: レンダリング中に外部状態を変更
function Bad() {
  globalCounter++;        // 副作用
  return <p>{globalCounter}</p>;
}

// OK: 副作用は useEffect 内で
function Good() {
  useEffect(() => { globalCounter++; }, []);
  return <p>{globalCounter}</p>;
}
```

#### イベントハンドラは外部状態を変えても OK

```tsx
function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

イベントハンドラはレンダリング中ではないので **副作用 OK**。Compiler はこれを区別します。

#### `eslint-plugin-react-compiler` で違反を検出

```bash
npm install -D eslint-plugin-react-compiler
```

```js
// eslint.config.js
import reactCompiler from "eslint-plugin-react-compiler";

export default [
  {
    plugins: { "react-compiler": reactCompiler },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
];
```

このルールは「**Compiler が変換できない場面**」を警告してくれます。Compiler を入れる前にまず ESLint でコードの問題を修正しておくのが安全。

### 「Compile されない」コードへの対処

Compiler が「危険」と判断したコンポーネントは **そのまま** にします（壊れない）。

警告メッセージ:

```
[ReactCompiler] Function `MyComponent` could not be compiled.
Reason: Mutation of value passed as argument
```

対応:

1. ESLint の指摘を素直に直す（**ピュア化**）
2. 直せない事情があれば **`"use no memo"`** ディレクティブで対象外に
3. **`"use memo"`** で「変換して欲しい」と明示

```tsx
"use no memo";

function LegacyComponent() {
  // Compiler 対象外
}
```

### 既存プロジェクトに導入する流れ

1. **`eslint-plugin-react-compiler` を入れて警告を見る**
2. 警告を直せる範囲で直す
3. **`compilationMode: "annotation"`** で **限定的に試す**
4. 動作確認 → 問題なければ **`"all"`** に切り替え
5. **`useMemo` / `useCallback` / `React.memo` を段階的に削除**

「全部一気に」ではなく **段階導入** が事故を減らします。

### パフォーマンス効果は？

[DebugBear のベンチマーク](https://www.debugbear.com/blog/react-compiler) などで:

- **手動メモ化が完璧でないコードベース** には大きな改善
- **既に十分メモ化済みのコード** にはほぼ同等
- **小規模アプリ** には変化なし

「**すべての React アプリが速くなる魔法** ではない」けれど、コードの **保守性** は確実に上がります。

### `useMemo` を残すべき場面

- **CPU 重い計算**: ビジビリティーラインの計算 / 大量データの並び替え。Compiler が判断しても明示する方が読みやすい
- **deep compare** が必要な場合: lodash の `isEqual` で比較したい時など
- **API 互換**: 公開ライブラリ（コンパイラ前提に強制できない）

### React 19 / Next.js 16 / React Compiler の関係

整理すると:

- **React 19**: Hooks 中心の API（`useEffectEvent` / `cacheSignal` / `<Activity />`）
- **React Compiler 1.0**: メモ化を自動化（19 推奨だが 17 / 18 でも動く）
- **Next.js 16**: Turbopack 標準、Cache Components、`reactCompiler` 設定が stable

3 つは **独立に進化** していて、組み合わせは選択可能。

### よくある誤解

- 「**React Compiler を使うと速くなる**」→ 速くなる **可能性が高い** だけ。本質的なボトルネックは別
- 「**全 useMemo を消すべき**」→ Compiler 任せでも動くが、**読みやすさのために残す** のはアリ
- 「**eslint-plugin-react-hooks は不要になる**」→ いいえ、引き続き必要

## 演習

> **このレッスンはローカル前提**: React Compiler の Babel プラグインを Next.js のビルドパイプラインに統合する都合上、**ローカルでの Node.js 実行を前提** にしています。StackBlitz の Next.js テンプレでも同じ手順は走りますが、ビルド時間が長くなり Compiler の確認が分かりにくいので、ローカル環境での実行を推奨します。

### ゴール

- Next.js 16 で React Compiler を有効化する
- `useMemo` / `useCallback` を消しても動くことを確認
- ESLint プラグインで違反を検出する

### 手順 1: 新規プロジェクト

```bash
npx create-next-app@latest compiler-sample --ts --app
cd compiler-sample
```

### 手順 2: React Compiler を有効化

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

### 手順 3: ESLint プラグインを導入

```bash
npm install -D eslint-plugin-react-compiler
```

`eslint.config.mjs`（Next.js 16 デフォルト）に追加:

```js
import reactCompiler from "eslint-plugin-react-compiler";

const config = [
  // ...既存
  {
    plugins: { "react-compiler": reactCompiler },
    rules: { "react-compiler/react-compiler": "error" },
  },
];

export default config;
```

### 手順 4: メモ化なしのコンポーネント

`app/page.tsx`:

```tsx
"use client";
import { useState } from "react";

export default function Page() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  const [filter, setFilter] = useState("");

  // useMemo を書かない
  const filtered = items.filter((n) => String(n).includes(filter));

  return (
    <main style={{ padding: 24 }}>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ul>
        {filtered.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <button onClick={() => setItems((x) => [...x, x.length + 1])}>追加</button>
    </main>
  );
}
```

`npm run dev` で動作。filter 入力 / 追加ボタンが快適に動くことを確認。

### 手順 5: わざとルール違反

```tsx
let counter = 0;

export default function BadCounter() {
  counter++;  // レンダリング中の副作用
  return <p>{counter}</p>;
}
```

ESLint がエラーを出します。**修正方法**: state に置き換える / `useEffect` に移す。

### 手順 6: 段階導入を試す

`next.config.ts`:

```ts
const nextConfig: NextConfig = {
  reactCompiler: { compilationMode: "annotation" },
};
```

このモードで `"use memo"` を書いたコンポーネントだけ変換されます:

```tsx
"use memo";

export default function CompiledComponent() { /* ... */ }
```

### 期待出力

- React Compiler が有効化されたメッセージがビルド時に出る
- ESLint プラグインがルール違反を **エラー / warning** で出す
- 動作は手動メモ化版と同じか **わずかに速い**

### 変える

- 手元の React + Vite プロジェクトに Compiler を入れる
- React DevTools の **Profiler** で再レンダリング回数を、ON / OFF で比較
- 大量レンダリング（1000 行のリスト）で差を観察

### 自分で書く（4 章 の成果物に適用）

このコースの **4 章「`useMemo` で計算のメモ化」** の演習で書いたプロジェクト、または手元の React + Vite プロジェクトに React Compiler を入れて **before / after を比較** します。

1. 該当プロジェクトを開く
2. **React DevTools の Profiler** で、何かアクション（追加・削除など）を 1 回計測 → 「再レンダリング回数」「総時間」をメモ
3. `babel-plugin-react-compiler` を追加 + `vite.config.ts` に組み込む
4. **同じアクション** を再度 Profiler で計測
5. 「再レンダリングが減ったか」「総時間が短くなったか」を観察
6. 続けて、コード上の `useMemo` / `useCallback` を **1 つずつ削除** して、Profiler の値が変わらないことを確認

これが「Compiler が効いている」直接的な証拠になります。手元に成果物がない場合は、`useMemo` を多用した小さいリスト + フィルタの例を新規に作って試します。

### 単独の任意課題

- `"use no memo"` で意図的に Compiler を外して、再レンダリング数の差を観察
- ベンチマーク（「Core Web Vitals の 3 つの指標と Lighthouse」の Lighthouse / Speed Insights）で **INP** がどう変わるか測る

## まとめ

- **React Compiler** は `useMemo` / `useCallback` / `React.memo` を **自動化** する Babel コンパイラ
- **2025 年 10 月に 1.0 安定版** がリリース、Meta 大規模で実戦投入済み
- **Next.js 16** で `reactCompiler: true` の設定が stable に
- Vite では `babel-plugin-react-compiler` を `@vitejs/plugin-react` の Babel に追加
- 動くには **Rules of React**（コンポーネント / Hooks のピュア性）が前提
- **`eslint-plugin-react-compiler`** で違反を検出 → 直すか `"use no memo"` で対象外に
- 段階導入は **`compilationMode: "annotation"`** から
- 「すべて速くなる魔法」ではないが、**保守性の向上は確実**
- 既存の `useMemo` を **残すか消すか** は判断次第、急いで全削除しなくてよい
