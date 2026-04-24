# lesson51: Context API で多層バケツリレー回避

## ゴール

- 多段階の props リレー（prop drilling）を Context で置き換えられる
- `createContext` / `Provider` / `useContext` の 3 点セットの形を覚える
- Context の型を付けられる
- Context を使うべきでない場面を理解する

## 解説

### バケツリレー問題

「親子コンポーネントの連携」で学んだように、props は「親 → 子」の一方通行でした。これが深い階層になると、**途中のコンポーネントが使わない値を、ただ下に渡すためだけに受け取る** 状況が生まれます。

```
App (theme を持つ)
 └─ Layout (theme を受け取って Header に渡すだけ)
     └─ Header (theme を受け取って Nav に渡すだけ)
         └─ Nav (theme を受け取って ThemeToggle に渡すだけ)
             └─ ThemeToggle (ここで初めて theme を使う)
```

`Layout` / `Header` / `Nav` は `theme` を **自分では使わない** のに、props として受け取って子に渡しています。バケツをリレーするように値を運ぶだけの中間層が増え、型定義も面倒になります。これを **prop drilling**（バケツリレー問題）と呼びます。

### Context の考え方

Context は、「ある範囲のコンポーネントツリー全体から参照できる共有値」を作る仕組みです。途中のコンポーネントは関与せず、値を使いたいコンポーネントが **直接** Context から取り出せます。

```
App
 └─ ThemeProvider (value={theme})   ← ここに値を提供
     └─ Layout
         └─ Header
             └─ Nav
                 └─ ThemeToggle ← useContext(ThemeContext) で直接読む
```

中間層はノータッチで、`ThemeToggle` だけが Context を読みます。

### 3 点セット

Context は次の 3 つをセットで使います。

1. `createContext<型>(初期値)` で Context を作る
2. `<Context.Provider value={値}>` で配下に値を提供する
3. 使いたい側で `useContext(Context)` で値を取り出す

```tsx
import { createContext, useContext, useState } from "react";

// (1) 作る
type Theme = "light" | "dark";
const ThemeContext = createContext<Theme>("light");

// (2) 提供する
function App() {
  const [theme, setTheme] = useState<Theme>("light");
  return (
    <ThemeContext.Provider value={theme}>
      <Child />
    </ThemeContext.Provider>
  );
}

// (3) 読む
function Child() {
  const theme = useContext(ThemeContext);
  return <p>現在のテーマ: {theme}</p>;
}
```

### Context の型と初期値

`createContext<型>(初期値)` の初期値は、**Provider で包まれていないときに使われる値** です。「包み忘れたらこれを使う」という保険です。

今回のテーマ切替では、値だけでなく「切り替える関数」も一緒に配りたいので、オブジェクトで型を作ります。

```ts
type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};
```

### Context を使うべきでないケース

Context は便利ですが、何でも入れていい仕組みではありません。

| 場面 | 向く / 向かない |
| --- | --- |
| テーマ、ログインユーザー情報、言語設定 | 向く（変化が少なく、広く参照される） |
| フォーム入力のリアルタイム値 | 向かない（頻繁に変わる） |
| 大規模な state 全体 | 向かない（外部ストア管理の領域） |

**頻繁に変わる値** を Context に入れると、Provider 配下のすべての `useContext` 利用コンポーネントが再レンダリングされます。小さなアプリなら気になりませんが、大きくなると性能上の負荷になります。

そうした用途（TODO アプリ全体の状態管理など）では Zustand / Redux など専用のライブラリが使われますが、**本コースでは扱いません**。今回は「テーマ切替」という変化の少ない題材に絞ります。

### TODO の Context 化は扱わない

「カスタムフック」で `useTodos` カスタムフックを作り、「TODO アプリを React で作る」の発展枠で「`useTodos` を Context でアプリ全体に提供する」パターンに触れます。本レッスンでは **テーマ切替のみ** を扱い、TODO の Context 化には踏み込みません。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- アプリ全体でテーマ（`"light" | "dark"`）を Context で共有する
- 深い階層の `ThemeToggle` から、props を経由せずにテーマを切り替える
- 中間層のコンポーネント（`Layout` / `Header` / `Nav`）が props を受け取らないことを確認する

### 手順

1. StackBlitz の React + Vite（TS）テンプレートから新規プロジェクトを作る
2. `src/ThemeContext.tsx` を作成
3. `src/Layout.tsx` / `src/Header.tsx` / `src/Nav.tsx` / `src/ThemeToggle.tsx` を作成
4. `src/App.tsx` を書き換える
5. `src/App.css` を書き換える

### `src/ThemeContext.tsx`

```tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme は ThemeProvider の中で使ってください");
  }
  return ctx;
}
```

- Context の初期値を `null` にしておき、`useTheme` で「`null` ならエラー」をチェックしています。これで「Provider で包み忘れた」ときに、はっきりエラーメッセージが出ます
- Provider はよく使う形なので、`ThemeProvider` という関数コンポーネントとしてラップしています
- `useTheme` という **カスタムフック** にしておくと、使う側が `useContext(ThemeContext)` と書かずに済みます（カスタムフックは「カスタムフック」で深掘りします）

### `src/ThemeToggle.tsx`

```tsx
import { useTheme } from "./ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle">
      現在: {theme} (クリックで切替)
    </button>
  );
}
```

深い階層のコンポーネントが、props を **一切受け取らず** に Context からテーマを読み出して切り替えています。

### `src/Nav.tsx`

```tsx
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  return (
    <nav className="nav">
      <span>メニュー</span>
      <ThemeToggle />
    </nav>
  );
}
```

`Nav` はテーマのことを知りません。`ThemeToggle` を置くだけです。

### `src/Header.tsx`

```tsx
import { Nav } from "./Nav";

export function Header() {
  return (
    <header className="header">
      <h1>Context API のデモ</h1>
      <Nav />
    </header>
  );
}
```

### `src/Layout.tsx`

```tsx
import type { ReactNode } from "react";
import { Header } from "./Header";
import { useTheme } from "./ThemeContext";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();

  return (
    <div className={`layout ${theme}`}>
      <Header />
      <main className="main">{children}</main>
    </div>
  );
}
```

`Layout` は `theme` の値を **見た目を変えるために** 読みますが、props としては受け取っていません。Context から直接取り出しています。

### `src/App.tsx`

```tsx
import { ThemeProvider } from "./ThemeContext";
import { Layout } from "./Layout";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <p>このページは Context からテーマを受け取って見た目を変えます。</p>
        <p>右上のボタンで light / dark を切り替えてみてください。</p>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
```

`App` は `<ThemeProvider>` で全体を包むだけです。`theme` を各コンポーネントに props として渡していません。

### `src/App.css`

```css
.layout {
  min-height: 100vh;
  transition: background-color 200ms, color 200ms;
}

.layout.light {
  background-color: #fff;
  color: #222;
}

.layout.dark {
  background-color: #202020;
  color: #eee;
}

.header {
  padding: 12px 16px;
  border-bottom: 1px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header h1 {
  font-size: 1.2rem;
  margin: 0;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main {
  padding: 16px;
}

.theme-toggle {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid currentColor;
  background-color: transparent;
  color: inherit;
}
```

背景色と文字色を `.light` / `.dark` クラスで切り替えています。クラス名は `Layout` が `theme` を見て付けています。

### 期待出力

- 画面右上に「現在: light (クリックで切替)」ボタンが表示される
- 画面全体が白背景・黒文字（light テーマ）で表示される
- ボタンを押すと「現在: dark (クリックで切替)」に変わり、画面全体が黒背景・白文字に切り替わる
- もう一度押すと light に戻る
- `Nav` / `Header` コンポーネントは props を 1 つも受け取っていないのにテーマ切替が動く

### 変える

- `App.tsx` で `<ThemeProvider>` の行を削除してみます。`useTheme` の中で `throw new Error(...)` が発動し、画面がエラー表示になります。「Provider を必ず外側に置く」必要性を体感する演習です。確認したら元に戻します。
- `ThemeContext.tsx` の `createContext<ThemeContextValue | null>(null)` を `createContext<ThemeContextValue>({ theme: "light", toggleTheme: () => {} })` のように「ダミーのデフォルト値」に変えることもできます。こうすると Provider 無しでもエラーは出ませんが、「包み忘れ」に気づけなくなる欠点があります。本コースでは `null` + チェック方式を推奨します。
- `ThemeToggle` を `Header` の直下に移動しても、変わらず動くことを確認します。Context は **ツリーのどこに置いても** Provider の配下なら届きます。

### 自分で書く

- `useTheme` の戻り値に `isDark: boolean` を追加してみてください（`theme === "dark"` で計算する）。`ThemeToggle` の文言を `isDark ? "Dark" : "Light"` のように切り替えると、より実用的な見た目になります（本コース本体は絵文字なしで統一しています。お好みで差し替えてください）。
- 別の Context として `LangContext`（`"ja" | "en"` を持つ）を追加し、`Header` の見出しを言語で切り替える演習もおすすめです。Context を **複数使う** 形に慣れます。

## まとめ

- Context は「ツリーの途中を通さずに値を共有する」仕組み
- `createContext` / `<Provider value>` / `useContext` の 3 点セットで使う
- 初期値を `null` にして、カスタムフックでチェックすると Provider 包み忘れに気づきやすい
- テーマ、ログインユーザー、言語設定のように **変化が少なく広く参照される値** に向く
- 頻繁に変わる値や大規模 state には不向き。外部ライブラリ（Zustand / Redux 等）の領域だが本コースでは扱わない
- TODO を Context 化する応用は「TODO アプリを React で作る」の発展枠で扱う
- 次のレッスンでは `useRef` で DOM を直接触る方法を学ぶ
