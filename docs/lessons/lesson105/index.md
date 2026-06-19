# lesson105: コンポーネントカタログ — Storybook

## ゴール

- Storybook が「**コンポーネントをアプリから切り離して 1 つずつ表示・編集できる開発環境**」であることを説明できる
- React + Vite プロジェクトに Storybook を `npm create storybook@latest` で導入できる
- Story（CSF）の最小形を書ける（`meta` + 名前付き export）
- `args` でコンポーネントの props を UI から差し替えられる
- `addon-a11y` で各 Story にアクセシビリティチェックを掛けられる

## 解説

### Storybook とは

Storybook は **コンポーネントを 1 つだけ取り出して表示** できる開発サーバーです。アプリ全体を起動しなくても、`Button` や `Modal` を **状態ごとに** 開いて見比べたり、UI から props を変えて挙動を確認したりできます。

似た言葉に「コンポーネントカタログ」「コンポーネントエクスプローラー」がありますが、Storybook はそのデファクトです。Shopify / Microsoft / Airbnb など多くのデザインシステムが Storybook で公開されています。

主な用途は次の 3 つです。

1. **開発時の単体プレビュー**: ログイン後にしか出ないモーダル、エラー状態の表示、空配列のリストなど、アプリ操作では再現が面倒な UI を独立して開発できる
2. **デザインとの共有**: デザイナーや PM に URL を渡すだけで、すべての UI バリエーションを見せられる
3. **テストの基盤**: 各 Story がそのまま `addon-a11y` / Vitest 統合のテスト対象になる（後述）

#### Story とは

「ある props・ある状態でレンダリングされた、コンポーネントの 1 シーン」を **Story**と呼びます。たとえば `Button` には次のような Story が考えられます。

- `Primary`（主アクション色）
- `Secondary`（控えめ色）
- `Disabled`（押せない状態）
- `Loading`（送信中のスピナー付き）

Storybook はこれらを左サイドバーのツリーに並べ、選ぶと中央のキャンバスに表示します。

### 前提

このレッスンは React + Vite + TypeScript のプロジェクトを前提にします。「**コンポーネントテスト — React Testing Library**」で作ったプロジェクトをそのまま流用できます。手元に無ければ次で新規作成してください。

```bash
npm create vite@latest storybook-sample -- --template react-ts
cd storybook-sample
npm install
```

Storybook 10 の動作要件は **Node.js 20+ / Vite 5+ / React 18+** です。

### インストール

プロジェクトのルートで次のコマンドを実行します。

```bash
npm create storybook@latest
```

CLI が package.json を見て、React + Vite 用の Storybook を自動で構成します。途中で「テスト統合を入れるか」「a11y アドオンを入れるか」のような質問が出るので、本レッスンでは **両方 yes** で進めます。

インストール後、次のスクリプトが `package.json` に追加されます。

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

そして次のディレクトリが生えます。

```
.storybook/
├─ main.ts        ← どこから Story を読むか、どのアドオンを使うか
└─ preview.ts     ← グローバルデコレータ・パラメータ

src/stories/      ← サンプル Story（CLI が初回だけ作る）
├─ Button.tsx
├─ Button.stories.ts
└─ ...
```

`.storybook/main.ts` の最小形:

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
```

- `stories`: Story ファイルを探すパターン。デフォルトは `src` 配下の `*.stories.*`
- `addons`: 機能拡張。`addon-a11y` がアクセシビリティパネル、`addon-vitest` が Vitest 連携テスト
- `framework`: フレームワーク + バンドラの組み合わせを指定（React + Vite）

### 起動

```bash
npm run storybook
```

ブラウザで `http://localhost:6006/` が開きます。左サイドバーに CLI が自動生成したサンプル Story が並んでいるので、`Button > Primary` などを選んで表示を確認します。

### Story の書き方（Component Story Format / CSF）

Story は **ES Module の default export + 名前付き export** で書きます。これを **CSF（Component Story Format）** と呼びます。CSF は Storybook 標準のフォーマットで、テストツールや IDE などからも読みやすい設計です。

最小例として、自前の `Button` を書いてみます。

`src/components/Button.tsx`:

```tsx
export type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  label,
  variant = "primary",
  disabled = false,
  onClick,
}: ButtonProps) {
  const bg = variant === "primary" ? "#1d4ed8" : "#e5e7eb";
  const color = variant === "primary" ? "#ffffff" : "#111827";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        background: bg,
        color,
        border: "none",
        borderRadius: 6,
        padding: "8px 16px",
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}
```

`src/components/Button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    label: "押してね",
    variant: "primary",
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
```

ポイント:

- **`meta`**（default export）はそのファイル全 Story の共通設定。`title` がサイドバーのパス、`component` が対象、`args` が既定 props
- **名前付き export** が 1 つの Story。`args` でこの Story 固有の差分を上書き
- **`tags: ["autodocs"]`** を付けると「Docs」タブが自動生成され、props 一覧と各 Story が並ぶページが出る
- 型は **`StoryObj<typeof Button>`** にすると、`args` の補完と型チェックが効く

保存すると Storybook が HMR で更新し、サイドバーに `Components > Button > Primary / Secondary / Disabled` が並びます。

### Controls で props を変える

Storybook 下部の **Controls** パネルでは、`args` で宣言したプロパティを UI から書き換えられます。`label` のテキスト入力、`variant` のセレクト、`disabled` のチェックボックスが自動生成されます。

ボタンの文言や色を CSS に手を入れずに切り替えて、見え方の差を確かめられるので、デザインレビューが捗ります。

### Actions でイベントを観察

`onClick` のようなコールバックは、Story の `args` で `fn()` を渡しておくと、Storybook の **Actions** パネルにクリックログが流れます。

```tsx
import { fn } from "storybook/test";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: {
    label: "押してね",
    onClick: fn(),
  },
};
```

`fn()` は Vitest 互換のスパイ関数で、Storybook が呼び出しを記録します。後述する `play` 関数からもアサート可能です。

### アクセシビリティアドオン（addon-a11y）

`addon-a11y` は Deque の **axe-core** をブラウザ内で走らせて、表示中の Story の DOM をルールに照らして検査します。配色のコントラスト不足、`aria-*` の誤用、見出しレベル飛ばしなどがその場で見つかります。

導入は CLI が yes 時に自動でやってくれますが、手動で入れる場合は次の通り。

```bash
npm install --save-dev @storybook/addon-a11y
```

`.storybook/main.ts` の `addons` に `"@storybook/addon-a11y"` を追加すると、Storybook の右パネルに **Accessibility** タブが出ます。

#### 試してみる: わざと違反を作る

`Button` の文字色を背景に近づけてコントラストを落とすと、Accessibility パネルが赤くなり「Elements must have sufficient color contrast」と教えてくれます。

```tsx
// 失敗例
const color = variant === "primary" ? "#a5b4fc" : "#9ca3af";
```

これは **「アクセシビリティの自動チェック（axe / Lighthouse / スクリーンリーダー）」** と同じ axe-core が走っているので、ルールセットも同じです。

### Vitest 統合で Story をテストに使う

Storybook 8.2 以降、`addon-vitest` で **Story をそのままテストとして実行** できます。Vitest が Story を 1 つずつブラウザで開き、レンダリングできたかをアサートします。アクセシビリティルールの違反もエラーにできます。

セットアップは CLI が自動でやってくれますが、ポイントだけ:

- `vitest.config.ts` で `@storybook/addon-vitest/vitest-plugin` を読み込む
- 既存の Vitest（「**テスト入門 — Vitest でユニットテスト**」で使ったもの）にプロジェクトとして合流する形になる
- `npm run test` で **既存ユニットテスト + Story スナップショット + a11y チェック** が一括で走る

### play 関数でインタラクションを書く

「クリックしたら開く」「入力するとボタンが活性化する」のような **挙動付きの Story** も書けます。

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: { label: "送信", onClick: fn() },
};

export default meta;

export const クリックして送信される: StoryObj<typeof Button> = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "送信" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
```

`play` は **「コンポーネントテスト — React Testing Library」** の操作と同じ `userEvent` / `within` / `expect` を使います。書き味も React Testing Library とほぼ同じです。Storybook 上でも自動再生されるので、開いた瞬間にボタンがクリックされて Actions パネルに記録が残ります。

### Story ファイルをどこに置くか

```
src/
├─ components/
│  ├─ Button/
│  │  ├─ Button.tsx
│  │  └─ Button.stories.tsx   ← コンポーネントの隣
│  └─ Modal/
│     ├─ Modal.tsx
│     └─ Modal.stories.tsx
```

「**コンポーネントテスト — React Testing Library**」で扱った `*.test.tsx` と同じ流儀で、**実装ファイルの隣** に置きます。これでファイルを探す手間が無く、移動・削除も同時にできます。

### 本番ビルドと公開

```bash
npm run build-storybook
```

`storybook-static/` に静的ファイルが出力されます。これを Vercel / Netlify / GitHub Pages / S3 などに上げると、チームに **常時アクセス可能なコンポーネント一覧** が配れます。Pull Request ごとにプレビュー URL を作るサービスとして **Chromatic**（Storybook の作者たちが運営）も人気です。

### 何を Story にすべきか

経験的には次の単位で書くと役立ちます。

- **`variant` ごと**: `Primary` / `Secondary` / `Danger`
- **状態ごと**: `Loading` / `Empty` / `Error`
- **境界ケース**: 長文 / 空文字 / 数字 0 / 100% 残量
- **a11y 確認用**: 入力エラー時、フォーカス時

逆に、**アプリ全体のシナリオ**は Storybook に書きません。それは「**E2E テスト — Playwright**」の出番です。Storybook は **1 コンポーネントの中の差** を見せる場所と覚えてください。

## 演習

### ゴール

- Vite + React + TS プロジェクトに Storybook を導入する
- 自前の `Button` コンポーネントに対して `Primary` / `Secondary` / `Disabled` の 3 Story を書く
- Controls から props を切り替えて表示が変わることを確認する
- `addon-a11y` のパネルでアクセシビリティ違反が出ないことを確認する

### 途中から始める場合

「**コンポーネントテスト — React Testing Library**」で作ったプロジェクトに合流するのが楽です。なければ:

```bash
npm create vite@latest storybook-sample -- --template react-ts
cd storybook-sample
npm install
```

### 手順 1: Storybook を入れる

```bash
npm create storybook@latest
```

質問には次のように答えます。

- どの構成か → 自動検出（React + Vite）でそのまま
- テスト統合を入れるか → **yes**
- a11y アドオンを入れるか → **yes**

完了後、`package.json` に `storybook` / `build-storybook` スクリプトが入り、`.storybook/` ディレクトリができていることを確認します。

### 手順 2: 起動して既存の Story を眺める

```bash
npm run storybook
```

ブラウザで `http://localhost:6006/` を開き、サイドバーの `Example > Button` などをクリックします。**Controls** パネルで `label` を書き換えて、画面のボタンが追従することを確認します。

### 手順 3: 自前の Button を作る

`src/components/Button.tsx` を作成し、上の「Story の書き方（CSF）」の `Button` コードをそのままコピーします。

### 手順 4: Story を書く

`src/components/Button.stories.tsx` を作成し、上の `Primary` / `Secondary` / `Disabled` をそのまま貼ります。保存すると Storybook のサイドバーに **`Components > Button > Primary / Secondary / Disabled`** が並びます。

### 期待出力

- 3 つの Story が左サイドバーに並ぶ
- 中央の Canvas に対応するボタンが表示される
- 下の **Controls** で `label` / `variant` / `disabled` を変更できる
- 右パネルの **Accessibility** タブで「No violations found」と表示される

スクリーンショットは省略しますが、3 種のボタンが切り替わって表示されれば成功です。

### 変える

- `variant` に `"danger"` を追加し、赤系の配色で `Danger` Story を増やす
- `Button` の文字色を **わざと薄く**（`#a5b4fc` など）してコントラスト不足を作り、Accessibility パネルが赤くなることを確認する。確認後は戻す
- `Button` に `loading?: boolean` を足し、ローディングインジケータ付きの `Loading` Story を書く

### 自分で書く

- 別のコンポーネント（例: `Card` / `Modal` / `Badge`）を 1 つ実装し、その Story を 3 つ以上書く
- `play` 関数を使い、「ボタンをクリックすると `onClick` が 1 回呼ばれる」アサーションを 1 つ書く（`storybook/test` の `fn` / `expect` / `userEvent` を使う）
- `npm run build-storybook` を実行し、`storybook-static/index.html` をブラウザで開いて静的ビルドが動くことを確認する

## まとめ

- Storybook は **コンポーネントをアプリから切り離して 1 つずつ開発・確認** するための開発サーバー
- Story は CSF（default export `meta` + 名前付き export）で書き、`args` で props を差し替えられる
- `addon-a11y` で axe-core によるアクセシビリティチェックがその場で走る
- `play` 関数 + `storybook/test` でインタラクションを書け、Vitest 統合により `npm test` で一括実行できる
