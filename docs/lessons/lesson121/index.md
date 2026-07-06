# lesson121: TanStack Query / Zustand 実践

## ゴール

- **TanStack Query** で API データ取得・キャッシュ・再取得を実装できる
- **`useMutation`** でデータ更新後にキャッシュを破棄できる
- **Zustand** でグローバルクライアント state の store を設計できる
- Jotai の atom 思想と Zustand との使い分けを 1 行で説明できる

## 解説

「状態管理の地図」で整理したとおり、サーバー state には TanStack Query、グローバルクライアント state には Zustand を使います。このレッスンではそれぞれを手を動かして習得します。

### TanStack Query

#### インストール

```bash
npm install @tanstack/react-query
```

アプリのルートに `QueryClientProvider` を置きます。

```tsx
// src/main.tsx
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

#### `useQuery` でデータ取得

```tsx
import { useQuery } from "@tanstack/react-query";

type Post = { id: number; title: string; body: string };

function PostsList() {
  const { data, isPending, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts");
      if (!res.ok) throw new Error("fetch 失敗");
      return (await res.json()) as Post[];
    },
  });

  if (isPending) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {String(error)}</p>;
  return (
    <ul>
      {data?.slice(0, 10).map((p) => (
        <li key={p.id}>#{p.id} {p.title}</li>
      ))}
    </ul>
  );
}
```

`useQuery` がやってくれること:

- **キャッシュ**: 同じ `queryKey` のデータは再利用。同じコンポーネントを 2 枚表示しても 1 回だけ fetch
- **重複排除**: 複数の呼び出し元が同じ key を使っても fetch は 1 回
- **自動再取得**: ウィンドウにフォーカスが戻ったとき / ネットワークが復帰したとき
- **ステール管理**: `staleTime` を超えたら「古い」とみなして次回マウント時に再取得

#### `staleTime` で再取得を制御

```tsx
useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  staleTime: 1000 * 60,  // 1 分間はキャッシュを新鮮扱い
});
```

デフォルトは `staleTime: 0`（即刻ステール）。「毎回最新を取りたい」場合はそのまま、「頻繁に変わらないデータ」は長めに設定します。

#### `useMutation` で更新

書き込み後にキャッシュを無効化して再取得します。

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreatePostForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: { title: string }) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    },
    onSuccess: () => {
      // 成功したら posts キャッシュを無効化 → 自動再取得
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ title: "新しい記事" })}
    >
      {mutation.isPending ? "送信中..." : "記事を作成"}
    </button>
  );
}
```

`mutation.isPending` が `true` の間はボタンを無効化し、二重送信を防ぎます。

#### React Query Devtools

開発中は Devtools を入れると、キャッシュの状態・ステール判定・再取得のタイミングが視覚的に分かります。

```bash
npm install @tanstack/react-query-devtools
```

```tsx
// main.tsx（開発時のみ）
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Zustand

#### インストール

```bash
npm install zustand
```

#### store を作る

`create` に関数を渡すだけで store が完成します。Provider は不要です。

```ts
// src/themeStore.ts
import { create } from "zustand";

type ThemeStore = {
  theme: "light" | "dark";
  toggle: () => void;
};

// OS のダークモード設定を初期値に使う
const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: prefersDark ? "dark" : "light",
  toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
}));
```

#### コンポーネントから使う

```tsx
import { useThemeStore } from "./themeStore";

function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={theme === "dark"}
      onClick={toggle}
    >
      テーマ: {theme}
    </button>
  );
}
```

`useThemeStore((s) => s.theme)` のようにセレクタを使うと、**選択した値が変わった時だけ** コンポーネントが再レンダリングされます。

#### Zustand の利点まとめ

- **Provider が要らない**: import するだけ使える
- **boilerplate が少ない**: Redux の 1/5 程度のコード量
- **TypeScript フレンドリー**
- **React 外でも読める**: `useThemeStore.getState()` で外部から参照・更新可能

#### `persist` ミドルウェアでリロードに耐える

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "theme-storage" },  // localStorage のキー
  )
);
```

`persist` を付けると `localStorage` に値を保存し、リロード後も設定が残ります。

### Jotai: atom ベースの代替

Zustand が「明確な store」を作るのに対し、**Jotai は小さな atom を組み合わせる** 思想です。

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

「React の `useState` を、アプリ全体に拡張した版」と考えると分かりやすいです。派生状態（他の atom から計算する値）が綺麗に書けます。

**Zustand vs Jotai 選び方**:
- **Zustand**: 認証情報 / カート / UI 設定など、まとまりのある store が要るとき
- **Jotai**: 独立した小さな値（カウンター / トグル / フォームの一部フィールド）が散らばっているとき

## 演習

### ゴール

- TanStack Query で外部 API を取得し、Zustand でテーマを切り替えるアプリを作る
- useMutation でデータを送信し、キャッシュ更新を体験する

### 手順 1: プロジェクト準備

```bash
npm create vite@latest state-sample -- --template react-ts
cd state-sample
npm install
npm install @tanstack/react-query @tanstack/react-query-devtools zustand
```

### 手順 2: QueryClientProvider を追加

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
```

### 手順 3: Zustand store

`src/themeStore.ts`:

```ts
import { create } from "zustand";

type ThemeStore = {
  theme: "light" | "dark";
  toggle: () => void;
};

const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: prefersDark ? "dark" : "light",
  toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
}));
```

### 手順 4: App 統合

`src/App.tsx`:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useThemeStore } from "./themeStore";

type Post = { id: number; title: string };

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts");
      return (await res.json()) as Post[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <main
      style={{
        background: theme === "dark" ? "#1a1a1a" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#1a1a1a",
        padding: 16,
        minHeight: "100vh",
      }}
    >
      <h1>状態管理の実践</h1>

      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={toggleTheme}
        style={{ marginBottom: 12 }}
      >
        テーマ: {theme}（Zustand）
      </button>

      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("テスト記事")}
        >
          {mutation.isPending ? "送信中..." : "記事を作成（useMutation）"}
        </button>
        {mutation.isSuccess && <span> 送信完了</span>}
      </div>

      <h2>記事一覧（TanStack Query）</h2>
      {isPending && <p>読み込み中...</p>}
      {error && <p>エラー</p>}
      <ul>
        {data?.slice(0, 10).map((p) => (
          <li key={p.id}>
            #{p.id} {p.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### 期待出力

- ページを開くと「読み込み中...」が一瞬 → 記事一覧が表示される
- 「テーマ: light」を押すとダークモードに切り替わる（Zustand）
- 「記事を作成」を押すと「送信中...」→「送信完了」と変わる（useMutation）
- ブラウザの **React Query Devtools**（画面下のアイコン）で `posts` のキャッシュ状態を確認できる
- **DevTools の Network タブ** でブラウザタブを切り替えてから戻すと、フォーカス復帰で自動再取得が走ることを確認できる

### 変える

- `staleTime: 1000 * 60` を `useQuery` に渡してみる。1 分間は再取得されない
- `persist` ミドルウェアを themeStore に追加してリロード後もテーマを保持する
- Jotai を入れて `countAtom` でカウンターを実装し、Zustand との書き味を比較する

### 自分で書く（任意）

- API から取得した認証ユーザーを Zustand store に入れ、全画面で参照する
- TanStack Query の `useInfiniteQuery` で無限スクロールを実装する
- Jotai の `atomWithStorage` でリロード耐性を持つ atom を作る

## まとめ

- **TanStack Query**: `useQuery` 1 行でキャッシュ / 重複排除 / 自動再取得を解決。`useMutation` + `invalidateQueries` で書き込み後のキャッシュ更新まで一貫して扱える
- `staleTime` でキャッシュの鮮度を調整。React Query Devtools でキャッシュの状態を可視化できる
- **Zustand**: `create` だけで store が完成、Provider 不要。セレクタで必要な値だけ購読し、余計な再レンダリングを防ぐ
- `persist` ミドルウェアを使えば localStorage に永続化できる
- **Jotai**: atom 単位で状態を管理。Zustand の「まとまった store」とは対照的に、散らばった独立状態に向く
