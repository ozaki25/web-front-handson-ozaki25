# lesson99: API モック — MSW（Mock Service Worker）

## ゴール

- なぜテストで API モックが必要かを説明できる
- MSW（Mock Service Worker）の **思想** と他のモック手法との違いを理解する
- `http.get` / `http.post` で HTTP ハンドラを書ける
- `setupServer` で Vitest にモックを組み込める
- 成功 / 失敗 / 遅延の各レスポンスを書き分けてテストできる
- 1 つのテスト内で `server.use(...)` でハンドラを上書きできる

## 解説

### なぜテストで API モックが必要か

`fetch` で外部 API を呼ぶコードを **そのまま** テストすると、次の問題が起きます。

- ネットワーク不調・API 仕様変更・レート制限でテストが落ちる（不安定）
- 実 API なので **書き換えテスト**（POST / DELETE）が本番データを壊す
- 速度が遅い（数百 ms × テスト数だけ待たされる）
- オフラインで CI が動かない

これを避けるには、テスト内で **実 API を叩かず偽のレスポンスを返す** 仕組みが必要です。これが API モックです。

### MSW とは

**Mock Service Worker**（MSW） は、ネットワーク層で `fetch` を **横取り** して偽のレスポンスを返すライブラリです。

特徴:

- アプリ側のコードは `fetch("https://api.example.com/posts")` のままでよい（モックを意識しない）
- 開発時 / Vitest テスト / Playwright E2E のすべてで **同じハンドラ定義** を共有できる
- ブラウザでは Service Worker が、Node.js では request interceptor がそれぞれ HTTP を横取り
- 2026 年現在 **v2 が安定版**。`http.get(...)` / `HttpResponse.json(...)` の API になった（v1 とは少し違う）

### 他のモック手法との比較

- `vi.mock("axios", ...)` のような **モジュールモック**: ライブラリ全体を差し替える。実装に密結合
- `global.fetch = vi.fn(...)` の **グローバル差し替え**: `fetch` を関数モックで上書き。簡単だが書きづらい
- **MSW**: ネットワーク層で横取り。アプリのコードは無改変、宣言的なハンドラを書くだけ

複雑なテストや、複数の API を扱うアプリでは MSW が圧倒的に楽です。

### セットアップ

「コンポーネントテスト」で React Testing Library を入れたプロジェクトに MSW を追加します。

```bash
npm install -D msw
```

`src/mocks/handlers.ts` を作成（ハンドラ定義）:

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  // GET /api/posts
  http.get("https://api.example.com/posts", () => {
    return HttpResponse.json([
      { id: 1, title: "1 件目" },
      { id: 2, title: "2 件目" },
    ]);
  }),

  // POST /api/posts
  http.post("https://api.example.com/posts", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body }, { status: 201 });
  }),
];
```

`src/mocks/server.ts` を作成（Node.js / Vitest 用のサーバ）:

```ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

`vitest.setup.ts` に追記（テスト全体のフック）:

```ts
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./src/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

これで:

- 全テストの前にモックサーバを起動
- 各テスト後にハンドラをリセット（`server.use(...)` で上書きしたものを巻き戻す）
- 全テスト後にサーバを停止
- ハンドラに登録されてない URL を fetch するとテストが fail（`onUnhandledRequest: "error"`）

### 簡単なコンポーネントテスト

`src/PostsList.tsx`:

```tsx
import { useEffect, useState } from "react";

type Post = { id: number; title: string };

export function PostsList() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.example.com/posts")
      .then((res) => {
        if (!res.ok) throw new Error("読み込み失敗");
        return res.json();
      })
      .then(setPosts)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p>エラー: {error}</p>;
  if (posts === null) return <p>読み込み中...</p>;

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

`src/PostsList.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostsList } from "./PostsList";

describe("PostsList", () => {
  it("最初は読み込み中を表示する", () => {
    render(<PostsList />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("読み込みが終わると一覧を表示する", async () => {
    render(<PostsList />);
    expect(await screen.findByText("1 件目")).toBeInTheDocument();
    expect(screen.getByText("2 件目")).toBeInTheDocument();
  });
});
```

`findByText` は **要素が現れるまで待つ** クエリです。`useEffect` での fetch 結果を待ち受けるのにぴったりです。

### 失敗ケースのテスト: `server.use` で一時上書き

「読み込みが失敗したらエラー表示が出る」をテストするには、テストごとに **そのテストだけのハンドラ** を登録します。

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server";
import { PostsList } from "./PostsList";

describe("PostsList のエラー", () => {
  it("API が 500 を返したらエラーを表示", async () => {
    server.use(
      http.get("https://api.example.com/posts", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<PostsList />);

    expect(await screen.findByText("エラー: 読み込み失敗")).toBeInTheDocument();
  });

  it("API が 404 を返したらエラーを表示", async () => {
    server.use(
      http.get("https://api.example.com/posts", () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    render(<PostsList />);

    expect(await screen.findByText(/エラー/)).toBeInTheDocument();
  });
});
```

`server.use(...)` は **そのテスト中だけ** のハンドラ上書きです。`afterEach` で `server.resetHandlers()` を呼んでいるので、次のテストでは元の成功レスポンスに戻ります。

### POST のテスト

書き込みリクエストもモックできます。送信内容を `request.json()` で取り出して、それに応じたレスポンスを返せます。

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CreatePostForm } from "./CreatePostForm";

describe("CreatePostForm", () => {
  it("送信すると新しい記事 ID が表示される", async () => {
    const user = userEvent.setup();
    render(<CreatePostForm />);

    await user.type(screen.getByLabelText("タイトル"), "テスト投稿");
    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(await screen.findByText("作成しました: ID 99")).toBeInTheDocument();
  });
});
```

`handlers.ts` の `http.post(...)` ハンドラが `id: 99` を返すように書いてあれば、テストはこれだけで通ります。

### 遅延を入れる: `delay`

「読み込み中...」の表示を確実に検証したい場合、レスポンスを遅らせます。

```ts
import { http, HttpResponse, delay } from "msw";

export const handlers = [
  http.get("https://api.example.com/posts", async () => {
    await delay(100);  // 100ms 遅らせる
    return HttpResponse.json([{ id: 1, title: "1 件目" }]);
  }),
];
```

これで「最初は読み込み中」のテストが、ミリ秒単位の競合に振り回されずに通ります。

## 演習

### ゴール

- MSW のセットアップを完了する
- ハンドラ 3 種（成功 / エラー / 遅延）を書く
- `useEffect` で fetch する小さなコンポーネントをテストする
- `server.use` でテストごとにレスポンスを上書きできる

### 途中から始める場合

「コンポーネントテスト」で RTL + Vitest をセットアップしたプロジェクトを継ぎます。手元になければ、新規 Vite + React + TypeScript テンプレートに以下を順に入れます。

```bash
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D msw
```

`vitest.config.ts` と `vitest.setup.ts` は「コンポーネントテスト」の設定をベースにします。

### 手順 1: モックサーバを構築

`src/mocks/handlers.ts`:

```ts
import { http, HttpResponse, delay } from "msw";

export const handlers = [
  http.get("https://api.example.com/users", async () => {
    await delay(50);
    return HttpResponse.json([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  }),
];
```

`src/mocks/server.ts`:

```ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

`vitest.setup.ts` に追記:

```ts
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./src/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 手順 2: コンポーネントを作る

`src/UsersList.tsx`:

```tsx
import { useEffect, useState } from "react";

type User = { id: number; name: string };

export function UsersList() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.example.com/users")
      .then((res) => {
        if (!res.ok) throw new Error("ユーザーの読み込みに失敗しました");
        return res.json();
      })
      .then(setUsers)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (users === null) return <p>読み込み中...</p>;

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

> **補足: `role="alert"` を後挿入で使うときの注意**: `role="alert"` を持つ要素は **live region** として扱われ、内容が更新されるとスクリーンリーダーが即座に読み上げます。ただし、エラー発生時に `<p role="alert">` を **新しく描画** する形（上のコードのように `{error && <p role="alert">...}` で出し入れする形）は、SR 実装によっては読み上げが発火しないことがあります。確実に通知したいときは「常設の `<div role="alert">` を空で置いておき、中身だけ差し替える」「`aria-live="assertive"` を併記する」形を検討します。

### 手順 3: テストを書く

`src/UsersList.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server";
import { UsersList } from "./UsersList";

describe("UsersList", () => {
  it("最初は読み込み中を表示する", () => {
    render(<UsersList />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("読み込みが終わるとユーザーを並べる", async () => {
    render(<UsersList />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("エラー時はエラーメッセージを表示する", async () => {
    server.use(
      http.get("https://api.example.com/users", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<UsersList />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("ユーザーの読み込みに失敗しました");
  });
});
```

### 手順 4: 実行

```bash
npm run test
```

3 件すべて緑になれば成功です。

### 期待出力

```
 PASS  src/UsersList.test.tsx (3)
   PASS  最初は読み込み中を表示する
   PASS  読み込みが終わるとユーザーを並べる
   PASS  エラー時はエラーメッセージを表示する

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

### 変える

- ハンドラの `delay(50)` を `delay(500)` に増やしてみる。テストはまだ通るが、読み込み完了を待つ時間が伸びる
- 「エラー時」テストで `server.use(...)` を消してみる。エラーが起きないので fail することを確認 → 元に戻す
- `onUnhandledRequest: "error"` を `"warn"` に変えて、ハンドラ未定義の URL を fetch しても fail しなくなることを確認

### 自分で書く

- POST ハンドラを足す: `POST https://api.example.com/users` を `{ id: 99, name: 受信した値 }` で返す
- 「ユーザー追加フォーム」コンポーネントを作り、送信したら `<p>追加しました: ID 99</p>` を出す
- 上記コンポーネントのテストを書く（フォーム入力 → 送信 → メッセージ確認）

## まとめ

- API モックは「不安定 / 本番破壊 / 遅い / オフライン」の 4 問題を解消する
- **MSW v2** はネットワーク層で `fetch` を横取りする宣言的なライブラリ
- ハンドラは `http.get(URL, handler)` / `http.post(URL, handler)` で書く
- `HttpResponse.json(data)` で JSON レスポンス、`new HttpResponse(null, { status: 500 })` でエラーレスポンス
- Vitest 統合は `setupServer` + `server.listen` / `resetHandlers` / `close` の 3 フック
- テストごとに `server.use(...)` でハンドラを上書きできる
- `delay(ms)` で意図的にレスポンスを遅らせると、ローディング状態のテストが書きやすい
- `onUnhandledRequest: "error"` で「未定義 API への fetch」を即検知
- 別のレッスンでは **Playwright で E2E テスト** に進む。MSW は E2E でも同じハンドラを使い回せる
