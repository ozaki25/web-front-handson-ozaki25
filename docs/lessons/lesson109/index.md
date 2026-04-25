# lesson109: 状態管理の地図（TanStack Query / Zustand / Jotai）

## ゴール

- React の **state を 5 種類に分けて** 整理できる（ローカル / URL / サーバー / グローバルクライアント / フォーム）
- なぜ 1 つのライブラリですべてを賄わないのかを説明できる
- **TanStack Query** が **サーバー state** に特化していることを理解する
- **Zustand** が **グローバルクライアント state** の現代の定番であることを知る
- **Jotai** の atom 思想と Zustand との使い分けを 1 行で言える
- **Redux Toolkit** の現在地（特定用途に残る）を把握する
- 「迷ったら何を選ぶか」の判断軸を持つ

## 解説

### state を 5 種類に分ける

「React アプリの state」は実は性質が違う 5 種類が混ざっています。それぞれ最適なツールが違います。

| 種類 | 例 | 最適なツール |
|---|---|---|
| **ローカル state** | モーダルの開閉、入力中の値 | `useState` / `useReducer` |
| **URL state** | 検索条件、選択中のタブ、ページ番号 | URL の `?param=...` + `useSearchParams` |
| **サーバー state** | API から取ってくるデータ | **TanStack Query** / SWR |
| **グローバルクライアント state** | 認証ユーザー、テーマ、UI 設定 | **Zustand** / Jotai / Context |
| **フォーム state** | フォーム入力値とエラー | **React Hook Form** |

> 2023 年頃までは「Redux 1 つで全部管理する」が主流でしたが、2026 年は **役割ごとに使い分ける** のが現代の合意です。

### 1. ローカル state: `useState` / `useReducer`

特定のコンポーネントの中だけで使う state は React 組み込みで十分。**これが最初の選択肢** です。

```tsx
const [isOpen, setIsOpen] = useState(false);
```

「複数のコンポーネントで共有したい」が出てきて初めて、上のレベルに上げる検討をします。

### 2. URL state: `useSearchParams`

「フィルタを共有したい」「ブラウザの戻るで前の状態に戻したい」状態は **URL に置く** のが最適です。

```tsx
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tag = searchParams.get("tag") ?? "all";

  function setTag(newTag: string) {
    const params = new URLSearchParams(searchParams);
    params.set("tag", newTag);
    router.push(`${pathname}?${params}`);
  }

  return (
    <select value={tag} onChange={(e) => setTag(e.target.value)}>
      <option value="all">すべて</option>
      <option value="js">JavaScript</option>
      <option value="css">CSS</option>
    </select>
  );
}
```

URL に状態が入ると:

- ブラウザの戻る / 進むで遷移できる
- URL を共有すれば同じ画面が再現できる
- ブックマークできる

「フィルタ / 並び順 / ページ番号 / 選択中のタブ」のような **共有可能な状態** はまず URL を検討するのが 2026 年の作法です。

### 3. サーバー state: TanStack Query

API から取ってきたデータは「**自分の真実ではなくサーバーの真実**」です。次の特性があります。

- **古くなる**（他のユーザーが書き換えるかもしれない）
- **キャッシュしたい**（同じデータを何度も取りたくない）
- **再取得したい**（ページに戻ってきた時など）
- **楽観的更新したい**（UI を先に変えて、サーバー応答で確定）

これらを `useEffect` + `useState` で自前実装するのは 100 行以上のコードになり、しかも罠が多い（競合状態 / メモリリーク / 重複リクエスト）。

**TanStack Query**（React Query から改名）はこの問題を **`useQuery` 1 行** で解決します。

```bash
npm install @tanstack/react-query
```

```tsx
import { useQuery } from "@tanstack/react-query";

function PostsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      return res.json();
    },
  });

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>エラー</p>;
  return <ul>{data.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

`useQuery` がやってくれること:

- **キャッシュ**: 同じ `queryKey` のデータは再利用
- **重複排除**: 同じ key で複数コンポーネントから呼んでも 1 回だけ fetch
- **再取得**: ウィンドウフォーカス時 / ネットワーク復帰時
- **ステール管理**: `staleTime` を超えたら古い扱いに
- **楽観的更新**: `useMutation` で送信中に UI を先に更新
- **無限スクロール**: `useInfiniteQuery`

2026 年の React アプリで **API 呼び出しがある** なら、TanStack Query 入れない理由はほぼないです。

> Next.js の Server Component で `fetch` を使う場合は、サーバー側で完結するので TanStack Query は不要です。Client Component から動的に取る場面で使います。

### 4. グローバルクライアント state: Zustand / Jotai / Context

「複数のコンポーネントで共有したいが、サーバー由来ではない」状態（テーマ / 認証情報 / UI 設定）には:

#### 軽量な定番: Zustand

```bash
npm install zustand
```

```tsx
import { create } from "zustand";

type AuthStore = {
  user: { id: string; name: string } | null;
  login: (user: { id: string; name: string }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

```tsx
function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return user ? (
    <div>
      ようこそ、{user.name} さん
      <button onClick={logout}>ログアウト</button>
    </div>
  ) : (
    <p>未ログイン</p>
  );
}
```

利点:

- **Provider が要らない**: import するだけで使える
- **boilerplate が少ない**: Redux に比べて 1/5 のコード
- **TypeScript フレンドリー**
- **React 外でも呼べる**: `useAuthStore.getState()` で外部からも参照可能

2026 年の **グローバルクライアント state の第一候補**。Redux Toolkit の boilerplate に疲れた人が大量に乗り換えました。

#### atom ベース: Jotai

```bash
npm install jotai
```

```tsx
import { atom, useAtom } from "jotai";

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

特徴:

- 状態を **小さな atom** に分割。それぞれが独立に管理される
- 「明確な store がない、散らばった state を組み合わせる」アプリ向け
- 派生状態（derived atom）が綺麗に書ける

Zustand の **明確な store** とは対照的に、Jotai は **粒度の細かい atom** を組み合わせる思想です。React の useState を「アプリ全体に拡張した版」と考えると分かりやすい。

#### React Context（組み込み）

`useContext` も簡易な共有手段ですが、**頻繁に変わる state には向きません**（全消費者が再レンダリングされる）。テーマや言語設定のような「滅多に変わらない」共有値に使うのが定番です。

「`Context` で済むなら Context、頻繁に変わるなら Zustand or Jotai、サーバー由来なら TanStack Query」が 2026 年の使い分けです。

### Redux / Redux Toolkit の現在地

Redux は 2018 年頃の React 標準でした。Redux Toolkit（RTK）で boilerplate は減りましたが、**新規プロジェクトでは Zustand に押されている** のが現実です。

Redux が今でも残るのは:

- **既存プロジェクト**: 移行コストで残る
- **大規模 + 複雑な action / reducer ロジック** が要る場合
- **Redux DevTools の時間旅行デバッグ** が欲しい場合
- **ミドルウェア（thunk / saga）の生態系** に依存

新規アプリなら **Zustand から始める** のが軽量で十分です。

### SWR（TanStack Query の代替）

Vercel 製の **SWR**（Stale-While-Revalidate）も同じ問題領域のライブラリです。

- TanStack Query: 機能豊富、エコシステム大、複雑系も得意
- SWR: シンプル、API が小さい、学習コスト低、Next.js との親和性

「シンプルさを優先」なら SWR、「全部入りで困らない」なら TanStack Query、というイメージです。

### 「迷ったらこう選ぶ」フローチャート

1. **コンポーネント内だけで完結？** → `useState`
2. **URL で共有 / 復元したい？** → URL に置く（`useSearchParams`）
3. **サーバーから取るデータ？** → **TanStack Query**
4. **複数コンポーネントで共有、頻繁に変わる？** → **Zustand**
5. **散らばった派生状態が多い？** → **Jotai**
6. **滅多に変わらない設定値？** → **Context**
7. **フォームの入力値？** → **React Hook Form**

これに迷ったら、**まず 1（useState）から始めて、共有が必要になった時点で 2-7 を検討** が安全です。最初から大きなライブラリを入れる必要はありません。

## 演習

### ゴール

- 「TanStack Query で API データ取得」「Zustand でテーマ切替」「URL state でフィルタ」を 1 つのアプリで体験する
- それぞれが **どの種類の state** を扱っているか意識する

### 途中から始める場合

新規 Vite + React + TS プロジェクトを作成。

```bash
npm create vite@latest state-sample -- --template react-ts
cd state-sample
npm install
npm install @tanstack/react-query zustand
```

### 手順 1: TanStack Query の Provider を入れる

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

### 手順 2: Zustand store

`src/themeStore.ts`:

```ts
import { create } from "zustand";

type ThemeStore = {
  theme: "light" | "dark";
  toggle: () => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
}));
```

### 手順 3: 統合した App

`src/App.tsx`:

```tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useThemeStore } from "./themeStore";

type Post = { id: number; title: string };

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const [filter, setFilter] = useState("all");  // 簡易版（本来は URL state）

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts");
      return (await res.json()) as Post[];
    },
  });

  const filtered = filter === "all" ? data : data?.filter((p) => p.id <= 10);

  return (
    <main
      style={{
        background: theme === "dark" ? "#1a1a1a" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#1a1a1a",
        padding: 16,
        minHeight: "100vh",
      }}
    >
      <h1>状態管理の地図</h1>

      <button onClick={toggleTheme}>
        テーマ: {theme}（クリックで切替 — Zustand）
      </button>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setFilter("all")}>すべて（ローカル state）</button>
        <button onClick={() => setFilter("first10")}>最初の 10 件</button>
      </div>

      <h2>記事一覧（TanStack Query で fetch）</h2>
      {isLoading && <p>読み込み中...</p>}
      {error && <p>エラー</p>}
      <ul>
        {filtered?.slice(0, 20).map((p) => (
          <li key={p.id}>#{p.id} {p.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

### 期待出力

- ページを開くと「読み込み中...」が一瞬 → 記事一覧が表示
- 「テーマ: light」を押すとダークモードに切り替わる（Zustand）
- 「最初の 10 件」を押すと表示が絞り込まれる（ローカル state）
- ブラウザを **リロードしても fetch は走らない**（TanStack Query のキャッシュ）→ DevTools の Network で 2 回目以降は出ない

### 変える

- `useQuery` の `staleTime: 1000 * 60` を渡してみる。1 分間は再取得されないキャッシュ
- Zustand の `theme` をブラウザリロード後も保持するために `zustand/middleware` の `persist` を使ってみる
- `filter` を URL state に変更（`useSearchParams` で `?filter=...`）

### 自分で書く

- TanStack Query の `useMutation` で「記事を作成」ボタンを足す（POST）。送信中の UI を表示
- Jotai を入れて、`countAtom` でカウンターを実装し、Zustand 版と書き味を比較

## まとめ

- React の state は **5 種類**: ローカル / URL / サーバー / グローバルクライアント / フォーム
- 2026 年は **役割ごとに使い分ける** のが定番
- **TanStack Query**（サーバー state）+ **Zustand**（グローバルクライアント state）+ **React Hook Form**（フォーム state）の組み合わせがほとんどの場合の正解
- **Jotai** は atom ベース、散らばった派生状態に向く
- **Redux** は新規では Zustand に押されている。既存プロジェクトでは続投
- **SWR** は TanStack Query のシンプル代替
- まず `useState` から始めて、共有が必要になった時点で適切なツールを選ぶ
- 別のレッスンでは **モダン CSS**（:has / Container Queries / View Transitions） に進む
