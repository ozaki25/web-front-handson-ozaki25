# lesson68: Error Boundary と Suspense

## ゴール

- コンポーネントツリーの中で起きた例外が、親の境界で受け止められる仕組みを説明できる
- `ErrorBoundary` をクラスコンポーネントで最小実装できる（React 19 でも現状クラスが必要）
- `<Suspense fallback={...}>` の役割を説明でき、最小の使い方を書ける
- `<ErrorBoundary>` と `<Suspense>` を組み合わせるパターンを書ける
- Next.js App Router の `error.tsx` / `loading.tsx` がこれを Route レベルで統合したものだと理解する

## 解説

### なぜ必要か: 1 箇所のエラーで全画面真っ白

React は、レンダリング中にどこかで例外が飛ぶと **そのコンポーネントのツリー全体をアンマウント** します。本来関係ないヘッダーやフッターまで消えて、画面が真っ白になってしまいます。

たとえば「記事一覧」「記事本文」「関連記事」の 3 つを並べていて、本文取得に失敗しただけで全部消える、という状況は避けたいわけです。

ここで登場するのが **ErrorBoundary**。境界より内側で起きた例外を受け止めて、フォールバック UI（エラー表示）に差し替えます。境界の外側は無事なままです。

### `ErrorBoundary` は現状クラスコンポーネントが必要

React 19 でも、ErrorBoundary を **自分で書く** ときはクラスコンポーネントを使います。関数コンポーネントのフックだけでは用意できません。

ただし日常的にクラスを書く必要はなく、「この 1 ファイルだけクラスで書いて、以後は `<ErrorBoundary>` として JSX で使う」という運用でほぼ間に合います。

最小の実装は次のとおりです。

```tsx
import { Component, type ReactNode } from "react";

type Props = {
  fallback: ReactNode;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_error: Error): State {
    // レンダリング中に例外が飛んだら、この戻り値で state を差し替える
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // ログ送信など副作用を行いたい場合に使う
    console.log("ErrorBoundary がキャッチ:", error.message, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

- **`getDerivedStateFromError`**: 例外を受け取って、エラー状態に切り替えるための **純粋な** メソッドです。ここで state を `{ hasError: true }` に差し替えます。
- **`componentDidCatch`**: 副作用（ロギング / 通報）を走らせる場所です。ログ送信が要らなければ省略できます。
- `fallback` と `children` は props で受け取る、シンプルなコンテナです。

### 使い方

守りたい範囲を囲むだけです。

```tsx
<ErrorBoundary fallback={<p>関連記事の読み込みに失敗しました</p>}>
  <RelatedPosts />
</ErrorBoundary>
```

`<RelatedPosts />` でどれだけ例外が飛んでも、境界の外にあるヘッダー / ナビ / 他セクションは生きたままです。

### 拾える例外と拾えない例外

ErrorBoundary が捕まえるのは「**レンダリング中** の例外」です。次は拾えません。

- イベントハンドラの中で投げた例外（`onClick={() => { throw ... }}`）
- 非同期処理（`setTimeout` / `Promise` の `.then` の中）
- サーバーサイドで起きる例外（Next.js の Server Component は別の仕組みで拾う）

イベントハンドラの例外は、普通の `try` / `catch`（「try / catch でエラー処理」）か、state を使って自分でフォールバックを出すのが基本です。

### `<Suspense>`: ローディングの境界

`<Suspense>` はエラーの兄弟です。**非同期なデータ / コンポーネントを待つ間、フォールバック UI を見せる** 仕組みです。

```tsx
<Suspense fallback={<p>読み込み中...</p>}>
  <SlowComponent />
</Suspense>
```

- 中のコンポーネントが読み込み待ち状態（Promise を投げている / lazy ロードの途中）になると、`fallback` が代わりに表示される
- 待ちが終わると中身に切り替わる
- `<Suspense>` は React 本体の機能で、ライブラリ（Next.js / Remix / lazy など）と組み合わせて使う

日常的には、後に学ぶ Next.js の App Router で Server Component と組み合わせて使うのが主戦場です（「Loading UI と Streaming」で扱います）。

### 組み合わせパターン

エラーとローディングは同時に起こりえます。両方を囲むのが基本形です。

```tsx
<ErrorBoundary fallback={<p>読み込みに失敗しました</p>}>
  <Suspense fallback={<p>読み込み中...</p>}>
    <RemoteContent />
  </Suspense>
</ErrorBoundary>
```

- **外側** が ErrorBoundary、**内側** が Suspense の順が定番です
- 途中で Promise が投げられれば Suspense が受け取り、途中で例外が投げられれば ErrorBoundary が受け取ります

### Next.js App Router での発展

Next.js App Router では、**ルートごと** にこの 2 つを書けるようになっています。

- `app/posts/[id]/error.tsx` → そのルート配下の ErrorBoundary
- `app/posts/[id]/loading.tsx` → そのルート配下の Suspense

ファイルを置くだけで境界が自動で入るので、毎回コンポーネントを囲む必要がなくなります。今回学ぶ「境界で区切って、フォールバックに差し替える」発想は、Next.js でそのまま生きます。

## 演習

### 途中から始める場合

「TODO アプリを React で作る」で作ったプロジェクトを使い回しても構いませんし、新しいプロジェクトで始めても構いません。手元に無ければ、新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開き、下の「出発点のファイル」を貼って揃えてください。本レッスンは **新規の小さな演習** として分離して進めるのが楽です。

<details>
<summary>出発点のファイル</summary>

**`src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**`src/App.tsx`**

```tsx
export default function App() {
  return (
    <div>
      <h1>lesson68</h1>
    </div>
  );
}
```

</details>

### ゴール

- わざと例外を投げる子コンポーネント `Bomb` を `ErrorBoundary` で囲み、画面全体が死なずにフォールバックに切り替わる
- `Suspense` で `lazy` 読み込みのコンポーネントを囲み、ロード中のフォールバックを確認する
- 「爆発するボタンを押す前」は通常表示、「押した後」は ErrorBoundary のフォールバックが出ることを確認する

### 手順

1. `src/ErrorBoundary.tsx` を新規作成して、クラスコンポーネントの ErrorBoundary を用意する
2. `src/Bomb.tsx` を新規作成する。props で `shouldExplode` を受け取り、`true` のときは `throw new Error(...)` する
3. `src/LazyGreeting.tsx` を作り、`App.tsx` から `lazy(() => import("./LazyGreeting"))` で読み込む
4. `App.tsx` に 2 つのセクションを並べる。それぞれ境界で囲む

### 主要ファイルの完成形

**`src/ErrorBoundary.tsx`**

```tsx
import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = {
  fallback: ReactNode;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log("ErrorBoundary がキャッチ:", error.message);
    console.log("発生場所:", info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

**`src/Bomb.tsx`**

```tsx
type Props = {
  shouldExplode: boolean;
};

export function Bomb({ shouldExplode }: Props) {
  if (shouldExplode) {
    throw new Error("Bomb が爆発しました");
  }
  return <p>Bomb はまだ安全です</p>;
}
```

**`src/LazyGreeting.tsx`**

```tsx
export default function LazyGreeting() {
  return <p>こんにちは！（遅れて読み込まれたコンポーネント）</p>;
}
```

**`src/App.tsx`**

```tsx
import { lazy, Suspense, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Bomb } from "./Bomb";

const LazyGreeting = lazy(() => import("./LazyGreeting"));

export default function App() {
  const [exploded, setExploded] = useState(false);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h1>lesson68: ErrorBoundary と Suspense</h1>

      <section>
        <h2>1. ErrorBoundary</h2>
        <button onClick={() => setExploded(true)}>爆発させる</button>
        <ErrorBoundary
          fallback={
            <div style={{ color: "red" }}>
              ここだけエラーになりました（他のセクションは生きています）
            </div>
          }
        >
          <Bomb shouldExplode={exploded} />
        </ErrorBoundary>
      </section>

      <section>
        <h2>2. Suspense</h2>
        <Suspense fallback={<p>読み込み中...</p>}>
          <LazyGreeting />
        </Suspense>
      </section>

      <section>
        <h2>3. 組み合わせ</h2>
        <ErrorBoundary fallback={<p>組み合わせでも守られています</p>}>
          <Suspense fallback={<p>読み込み中 (組み合わせ)...</p>}>
            <LazyGreeting />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  );
}
```

### 期待出力

1. 最初の画面には 3 つのセクションが並び、Suspense セクションは一瞬「読み込み中...」が見えた後、グリーティングに置き換わる
2. 「爆発させる」ボタンを押す → 1 番目のセクションだけ赤字のフォールバックに切り替わる。ページ全体は生きたまま、ヘッダー（`h1`）も他のセクションも残っている
3. Console に `ErrorBoundary がキャッチ: Bomb が爆発しました` のログが出る
4. **StrictMode の開発ビルドでは、キャッチされた後もブラウザ Console に赤字のエラーが表示されます**。これは開発時の二重警告で、本番ビルドでは出ません（ErrorBoundary のキャッチ自体は機能しています）。気にせず進めて大丈夫です。

### 変える

- `fallback` の中身を絵文字なしの自由な HTML に差し替えて、見た目を変える（例: `<div><h3>読み込みエラー</h3><p>あとで試してください</p></div>`）
- `Bomb` を 2 つ並べ、それぞれ別の ErrorBoundary で囲む → 片方だけ爆発させたときに、もう片方は生きたままになる
- ErrorBoundary の外側に `Bomb` を置くと画面全体が落ちることを確認する（確認後、内側に戻す）

### 自分で書く

- ErrorBoundary に **「再試行」ボタン** を付ける。`state` に `hasError` を持っているので、押したら `setState({ hasError: false })` 相当の処理でリセットできる（クラスの `this.setState({ hasError: false })` を使う）
- `LazyGreeting` の読み込みをわざと遅らせる。トップに `await new Promise(r => setTimeout(r, 2000))` 相当の処理を入れるダミーを作り、Suspense のフォールバックが長く見えることを確認する
- 複数の ErrorBoundary を入れ子にする。内側でキャッチしたエラーは外側に届かないことを確認する

## まとめ

- ErrorBoundary は「レンダリング中の例外」を境界で受け止め、画面全体の崩壊を防ぐ
- React 19 でも、ErrorBoundary を書くにはクラスコンポーネントが必要。ただし 1 回書いたら以降は JSX で使うだけ
- `getDerivedStateFromError` で state を切り替え、`componentDidCatch` でログを残す
- `<Suspense fallback={...}>` は非同期な待ちの間にフォールバック UI を出す
- 外側に ErrorBoundary、内側に Suspense、が定番の組み合わせ
- Next.js App Router では、この 2 つが `error.tsx` / `loading.tsx` としてルート単位で使えるようになる
