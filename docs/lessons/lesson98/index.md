# lesson98: コンポーネントテスト — React Testing Library

## ゴール

- React Testing Library の **思想**「ユーザーの見え方をテストする」を理解する
- `render` / `screen` で React コンポーネントを描画し、要素を取得できる
- `getBy*` / `queryBy*` / `findBy*` の 3 系統を使い分けられる
- `userEvent` でクリック / 入力をシミュレートできる
- 状態変化（`useState`）を含むコンポーネントのテストが書ける
- アクセシブルクエリ（`getByRole` / `getByLabelText`）を優先する理由を説明できる

## 解説

### React Testing Library の思想

React Testing Library（RTL）は **「実装の詳細ではなく、ユーザーから見える振る舞い」** をテストする方針です。次の 2 つの方針が大切です。

1. **DOM の見た目に近い情報** で要素を取得する（`getByRole("button", { name: "保存" })`）
2. **実装の詳細**（`useState` の中身 / コンポーネント名 / props）には触れない

これは Enzyme（古い React テストライブラリ）と対照的です。Enzyme は state や props を直接覗きますが、RTL は **DOM 経由** でしか触りません。結果として、

- 内部実装をリファクタしてもテストは壊れない
- スクリーンリーダー利用者と同じクエリでテストするので、**a11y の実地チェック** にもなる

### セットアップ

「テスト入門」で Vitest を入れたプロジェクトに、React + RTL を追加します。

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitejs/plugin-react
```

`vitest.config.ts` を更新:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",  // ブラウザ風 DOM を提供
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

`vitest.setup.ts` を作成（`@testing-library/jest-dom` の追加マッチャを有効化）:

```ts
import "@testing-library/jest-dom/vitest";
```

これで `expect(element).toBeInTheDocument()` のような追加マッチャが使えるようになります。

### 最小のコンポーネントテスト

テスト対象:

```tsx
// src/Greeting.tsx
type Props = { name: string };

export function Greeting({ name }: Props) {
  return <h1>こんにちは、{name} さん</h1>;
}
```

テスト:

```tsx
// src/Greeting.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Greeting } from "./Greeting";

describe("Greeting", () => {
  it("名前を含む挨拶を表示する", () => {
    render(<Greeting name="Alice" />);
    expect(screen.getByRole("heading")).toHaveTextContent("こんにちは、Alice さん");
  });
});
```

3 つの基本要素:

- **`render(<Component />)`**: コンポーネントを仮想 DOM に描画
- **`screen`**: 描画された DOM から要素を取得するためのユーティリティ
- **`getByRole(...)`**: 「見出し」というロールを持つ要素を取得（`<h1>`〜`<h6>` がマッチ）

### 要素を探す 3 系統: `getBy*` / `queryBy*` / `findBy*`

要素を探す関数は **接頭辞** で挙動が変わります。

| 接頭辞 | 見つからない時 | 用途 |
|---|---|---|
| `getBy*` | **エラーを投げる** | 「あるはず」を確認する |
| `queryBy*` | `null` を返す | 「無いはず」を確認する |
| `findBy*` | Promise を返し、現れるまで待つ | 非同期で後から現れる要素 |

例:

```tsx
// 「保存」ボタンが必ずある
const button = screen.getByRole("button", { name: "保存" });

// エラーメッセージは「無いはず」（成功時）
expect(screen.queryByText("エラーが発生しました")).not.toBeInTheDocument();

// fetch が終わった後に現れるユーザー名
const userName = await screen.findByText("Alice");
```

### クエリの優先順位

Testing Library は **アクセシブルなクエリを優先** することを推奨しています。

| 優先度 | クエリ | 何を見るか |
|---|---|---|
| 1 | `getByRole` | アクセシビリティロール（`button` / `heading` / `link` / `textbox` 等） |
| 2 | `getByLabelText` | フォームの `<label>` テキスト |
| 3 | `getByPlaceholderText` | input の placeholder |
| 4 | `getByText` | 表示テキスト |
| 5 | `getByDisplayValue` | input の現在値 |
| 6 | `getByAltText` | img の alt |
| 7 | `getByTitle` | title 属性 |
| 8 | `getByTestId` | `data-testid` 属性（最後の手段） |

**`getByTestId` は最後の手段** です。`data-testid="submit"` のようなテスト専用属性に頼ると、a11y の問題に気付けなくなります（スクリーンリーダーは testid を読まない）。

### `userEvent` でユーザー操作をシミュレート

ボタンクリックや入力は `userEvent` を使います。`fireEvent`（古い API）より人間の操作に忠実です。

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("ボタンを押すと数が増える", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    expect(screen.getByText("カウント: 0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+1" }));

    expect(screen.getByText("カウント: 1")).toBeInTheDocument();
  });

  it("複数回押すと累積する", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const button = screen.getByRole("button", { name: "+1" });
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(screen.getByText("カウント: 3")).toBeInTheDocument();
  });
});
```

`userEvent.setup()` を **各テストの最初** に呼んで `user` オブジェクトを作ります。`user.click(...)` / `user.type(input, "hello")` / `user.keyboard("{Enter}")` 等のメソッドが使えます。すべて `await` を付けて呼びます。

### フォーム入力のテスト

`<input>` への入力は `user.type` でシミュレートします。

```tsx
import { useState } from "react";

export function NameForm() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(name);
      }}
    >
      <label htmlFor="name">お名前</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">送信</button>
      {submitted && <p>こんにちは、{submitted} さん</p>}
    </form>
  );
}
```

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NameForm } from "./NameForm";

describe("NameForm", () => {
  it("名前を入力して送信すると挨拶が出る", async () => {
    const user = userEvent.setup();
    render(<NameForm />);

    const input = screen.getByLabelText("お名前");
    const button = screen.getByRole("button", { name: "送信" });

    await user.type(input, "Alice");
    await user.click(button);

    expect(screen.getByText("こんにちは、Alice さん")).toBeInTheDocument();
  });

  it("入力が空のままだと挨拶は出ない", async () => {
    const user = userEvent.setup();
    render(<NameForm />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.queryByText(/こんにちは、/)).not.toBeInTheDocument();
  });
});
```

`getByLabelText("お名前")` は `<label>` で紐付けられた `<input>` を取れます。アクセシブルなクエリの典型例です。

### よく使う追加マッチャ（jest-dom）

`@testing-library/jest-dom` を入れると、DOM 専用の便利マッチャが使えます。

```tsx
expect(element).toBeInTheDocument();        // DOM に存在する
expect(element).toHaveTextContent("hello"); // テキストを含む
expect(element).toBeVisible();              // 見える状態
expect(input).toHaveValue("Alice");         // input の値
expect(checkbox).toBeChecked();             // チェック済み
expect(button).toBeDisabled();              // disabled 属性付き
expect(element).toHaveClass("active");      // CSS クラス付き
expect(element).toHaveAttribute("href", "/about");
```

これらは **読みやすさが大幅に上がる** ので、入れない理由はないです。

## 演習

### ゴール

- React + RTL のセットアップを `vitest.config.ts` に反映する
- カウンターコンポーネントのテストを書ける
- 簡単なフォームのテストを書ける
- `getByRole` / `getByLabelText` を優先して使える

### 途中から始める場合

「テスト入門」で Vitest をセットアップしたプロジェクトを継ぎます。手元になければ、新規 StackBlitz の Vite + React + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）を開いてください。

### 手順 1: 依存パッケージをインストール

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

### 手順 2: 設定ファイルを更新

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

`vitest.setup.ts` を新規作成:

```ts
import "@testing-library/jest-dom/vitest";
```

### 手順 3: テスト対象のコンポーネントを書く

`src/Counter.tsx`:

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={() => setCount((c) => c - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}
```

`src/NameForm.tsx`:

```tsx
import { useState } from "react";
import type { FormEvent } from "react";

export function NameForm() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim()) {
      setSubmitted(name);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">お名前</label>
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">送信</button>
      {submitted && <p>こんにちは、{submitted} さん</p>}
    </form>
  );
}
```

### 手順 4: テストを書く

`src/Counter.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("初期値は 0", () => {
    render(<Counter />);
    expect(screen.getByText("カウント: 0")).toBeInTheDocument();
  });

  it("+1 ボタンで増える", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "+1" }));

    expect(screen.getByText("カウント: 1")).toBeInTheDocument();
  });

  it("-1 ボタンで減る", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "-1" }));

    expect(screen.getByText("カウント: -1")).toBeInTheDocument();
  });

  it("リセットボタンで 0 に戻る", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "+1" }));
    await user.click(screen.getByRole("button", { name: "+1" }));
    await user.click(screen.getByRole("button", { name: "リセット" }));

    expect(screen.getByText("カウント: 0")).toBeInTheDocument();
  });
});
```

`src/NameForm.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NameForm } from "./NameForm";

describe("NameForm", () => {
  it("名前を入力して送信すると挨拶が出る", async () => {
    const user = userEvent.setup();
    render(<NameForm />);

    await user.type(screen.getByLabelText("お名前"), "Alice");
    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.getByText("こんにちは、Alice さん")).toBeInTheDocument();
  });

  it("空のまま送信しても挨拶は出ない", async () => {
    const user = userEvent.setup();
    render(<NameForm />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.queryByText(/こんにちは、/)).not.toBeInTheDocument();
  });

  it("入力中の値が input に反映される", async () => {
    const user = userEvent.setup();
    render(<NameForm />);

    const input = screen.getByLabelText("お名前");
    await user.type(input, "Bob");

    expect(input).toHaveValue("Bob");
  });
});
```

### 手順 5: 実行

```bash
npm run test
```

すべてのテストが緑になれば成功。watch モードのまま、コンポーネントを編集して挙動を変えると即時 fail / pass の切り替わりが見えます。

### 期待出力

```
 PASS  src/Counter.test.tsx (4)
 PASS  src/NameForm.test.tsx (3)

 Test Files  2 passed (2)
      Tests  7 passed (7)
```

### 変える

- `Counter` の `+1` ボタンの実装を `setCount(c => c + 2)` に変えてみる。「+1 ボタンで増える」テストが fail することを確認 → 元に戻す
- `getByText("カウント: 0")` を `getByTestId("counter-value")` に変えるには、コンポーネントに `data-testid` を足す必要があるが、**やらない**。`getByText` の方が a11y を兼ねた検証になる
- `NameForm` の `<label htmlFor="name">` を消してみる。`getByLabelText("お名前")` が fail することを確認 → label 連携が a11y にもテストにも重要、と体感

### 自分で書く

- 「TODO 追加フォーム」コンポーネント `<TodoForm />` を作る:
  - 入力欄 + 「追加」ボタン
  - 追加されたら入力欄が空になる
  - 親に `onAdd(text)` で通知（テストでは `vi.fn()` で受け取る）
- テストで以下を検証:
  - 入力 → 送信 → `onAdd` が `"買い物"` で呼ばれる
  - 送信後に input が空になる
  - 空のまま送信しても `onAdd` は呼ばれない（`expect(onAdd).not.toHaveBeenCalled()`）

`vi.fn()` は Vitest のモック関数。引数が来たかを `toHaveBeenCalledWith(...)` で検証できます。

## まとめ

- React Testing Library は「ユーザーの見え方」をテストする思想
- `render` / `screen` でコンポーネントを描画して DOM クエリ
- `getBy*` / `queryBy*` / `findBy*` の 3 系統を使い分け
- アクセシブルなクエリ（`getByRole` / `getByLabelText`）を優先する。`getByTestId` は最後の手段
- ユーザー操作は `userEvent.setup()` で作った `user` で `await user.click(...)` / `user.type(...)`
- `@testing-library/jest-dom` で `toBeInTheDocument` 等の便利マッチャ
- 状態変化を含むコンポーネントは「初期状態 → 操作 → 結果」の流れでテスト
- 別のレッスンでは fetch を含むコンポーネントのテスト（**MSW** で API モック）に進む
