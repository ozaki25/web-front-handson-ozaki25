# lesson105: コンポーネントカタログ — Storybook

## ゴール

- Storybook が「**コンポーネントをアプリから切り離して 1 つずつ表示できる開発サーバー**」だと説明できる
- React + Vite プロジェクトに Storybook を `npm create storybook@latest` で導入できる
- 1 つのコンポーネントに対して **複数の見た目（Story）** を書ける
- Storybook の **Controls** で props を変えて挙動を確認できる
- **`addon-a11y`** でアクセシビリティ違反を画面上で発見できる

## 解説

### Storybook が解決すること

アプリを作っていると、いくつかの場面で困ります。

- 「エラー状態の見た目」を画面に出すには、わざとエラーを起こす必要がある
- 「ログイン後にしか出ないモーダル」を確認するために毎回ログインする
- 「リスト 0 件の時の表示」を確認するためにデータベースを空にする

**Storybook** は、こうした「特定の状態のコンポーネント」を **アプリ操作なしで** 開いて見られる開発サーバーです。ボタンの **通常 / 押せない状態 / 送信中** といったバリエーションを、サイドバーのツリーから 1 クリックで切り替えられます。

ボタンや入力欄のような単発のコンポーネントごとに **見た目のカタログ**を作るためのツール、と捉えるのが分かりやすいです。Shopify や Microsoft のデザインシステムも Storybook で公開されています。

#### Story（ストーリー）とは

「あるコンポーネントを、ある props（プロパティ）で表示した 1 シーン」を **Story** と呼びます。`Button` というコンポーネントに対して、たとえば次のような Story を書きます。

- **Primary**（主アクション色）
- **Secondary**（控えめ色）
- **Disabled**（押せない状態）

Storybook を起動するとサイドバーにこれらが並び、選ぶと中央のキャンバスにそのコンポーネントだけが表示されます。

### このレッスンの前提

React + Vite + TypeScript のプロジェクトに Storybook を入れていきます。「**コンポーネントテスト — React Testing Library**」で作ったプロジェクトをそのまま使えます。手元に無ければ:

```bash
npm create vite@latest storybook-sample -- --template react-ts
cd storybook-sample
npm install
```

### 1. Storybook を入れる

プロジェクトのルートで次を実行します。

```bash
npm create storybook@latest
```

CLI が `package.json` を見て、React + Vite 用の Storybook を自動で構成します。途中でアドオンの追加を聞かれたら、**accessibility（a11y）** に関するものは入れておきます。

> CLI の質問内容はバージョンごとに変わります。終わったあとで `.storybook/main.ts` を開き、`addons` 配列に `"@storybook/addon-a11y"` が含まれていれば OK です。入っていなければ、次のコマンドで後から追加できます。
>
> ```bash
> npm install --save-dev @storybook/addon-a11y
> ```
>
> 追加した場合は `.storybook/main.ts` の `addons` に `"@storybook/addon-a11y"` の行を加えて、`npm run storybook` を再起動します。

完了後、`package.json` に次のスクリプトが追加されます。

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

そして次のファイルが生えます。

```
.storybook/
├─ main.ts        ← Story の置き場所とアドオンの設定
└─ preview.ts     ← Story 全体に共通する設定
```

### 2. 起動して触ってみる

```bash
npm run storybook
```

ブラウザが自動で `http://localhost:6006/` を開きます。`npm create storybook@latest` の段階で **サンプルの Button や Header の Story** が自動で作られているはずなので、サイドバーから `Example > Button` を選んで眺めてみてください。

中央にボタンが表示され、画面下の **Controls** パネルで `label` の文字列や `primary` のチェックを切り替えると、リアルタイムでボタンが変わるのが確認できます。下のように、左にサイドバー、中央にコンポーネント、右上にツールバー、下に Controls / Actions / Accessibility などのパネルが並ぶレイアウトです。

<img src="/screenshots/storybook-overview.png" alt="Storybook の画面構成。左サイドバーに Components > Badge > Green / Yellow / Red の Story ツリー。中央キャンバスに緑のバッジ「公開中」。下部に Controls / Actions / Interactions / Visual tests / Accessibility のパネルタブ。Controls タブを開くと label のテキスト入力と color の green / yellow / red ラジオが並ぶ。" class="diagram" />

### 3. 自分で書いてみる: 最初の Story

サンプルが動いたら、自前のコンポーネントで Story を書いてみます。短くしたいので **色違いのバッジ** にします。

`src/components/Badge.tsx`:

```tsx
type BadgeProps = {
  label: string;
  color?: "green" | "yellow" | "red";
};

export function Badge({ label, color = "green" }: BadgeProps) {
  const palette = {
    green: { bg: "#dcfce7", fg: "#166534" },
    yellow: { bg: "#fef9c3", fg: "#854d0e" },
    red: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const { bg, fg } = palette[color];
  return (
    <span
      style={{
        background: bg,
        color: fg,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
```

このコンポーネントの Story を書きます。

`src/components/Badge.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  args: {
    label: "公開中",
    color: "green",
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Green: Story = {};

export const Yellow: Story = {
  args: { color: "yellow" },
};

export const Red: Story = {
  args: { label: "停止中", color: "red" },
};
```

#### ファイルの読み方

このファイルは、Storybook 標準のフォーマット **CSF（Component Story Format）** で書かれています。覚えるのは 2 つだけです。

- **default export の `meta`**: そのファイルの全 Story に共通する設定
  - `title`: Storybook サイドバーでの表示パス（`/` で階層を作れる）
  - `component`: 対象のコンポーネント
  - `args`: コンポーネントに渡す props の **既定値**
- **名前付き export**: 1 つの Story。`args` を上書きして見た目の差分だけを書く

`Meta<typeof Badge>` という型は「`Badge` コンポーネント用の meta ですよ」と TS に教えるためのものです。書いておくと `args` の補完とタイプチェックが効きます（書かなくても動きます）。

保存すると Storybook が自動で再読込し、サイドバーに **`Components > Badge > Green / Yellow / Red`** が並びます。

### 4. Controls で props を変える

Storybook 画面下部の **Controls** パネルには、`args` に書いたプロパティが自動で並びます。

- `label`: テキスト入力
- `color`: `"green" | "yellow" | "red"` のセレクト

入力欄を操作するとバッジがその場で変化します。**「もしユーザーが長い文字列を入れたら？」「赤色の時にアイコンを足す？」**といった検討を、コードに手を入れず UI から試せます。

### 5. アクセシビリティを画面でチェック（addon-a11y）

サイドバーで Story を開いたまま、画面下のパネルで **Accessibility** タブをクリックします。`addon-a11y` が **axe-core**（「**アクセシビリティの自動チェック — axe / Lighthouse / スクリーンリーダー**」と同じエンジン）を走らせ、いまの DOM に違反がないか教えてくれます。

問題なければ次のように **「No accessibility violations found」** と表示されます。

<img src="/screenshots/storybook-a11y-pass.png" alt="Storybook の Accessibility パネルが Violations 0 / Passes 3 / Inconclusive 0 を表示している。中央に 'No accessibility violations found.' のテキスト。中央キャンバスの緑バッジ『公開中』は読みやすいコントラストで表示されている。" class="diagram" />

#### わざと違反を作って確認する

`Badge.tsx` の color パレットを **薄い色だけ** に変えて、テキストとのコントラストを意図的に落としてみます。

```tsx
// 失敗例: 文字色と背景色が近すぎる
green: { bg: "#dcfce7", fg: "#a7f3d0" },
```

保存すると次のように Accessibility パネルの Violations が **1** になり、「Color contrast」の違反が **Serious**（重大）で報告されます。中央のキャンバスでも、バッジの文字がほぼ読めなくなっているのが見えるはずです。確認できたら元に戻します。

<img src="/screenshots/storybook-a11y-fail.png" alt="Storybook の Accessibility パネルが Violations 1 を表示。下に 'Color contrast' の違反が Serious 重大度で出ている。中央キャンバスのバッジは文字色が薄く、ほぼ読めない状態。" class="diagram" />

このように **Story ごとに axe を流せる**ので、コンポーネント単位で a11y を担保しやすくなります。

### 何を Story にするか

経験的には、次の単位で書くと役立ちます。

- **色 / バリアントごと**: `Primary` / `Secondary` / `Danger`
- **状態ごと**: `Loading` / `Empty` / `Error`
- **境界ケース**: 長文 / 空文字 / 数字 0 / 100%

逆に、**「ログインしてフォームを送ってリスト画面に戻る」のようなアプリ全体のシナリオ**は Storybook には書きません。それは「**E2E テスト — Playwright**」の出番です。Storybook は **1 つのコンポーネントの中の差** を見せる場所と覚えてください。

### 発展トピック（任意）

ここから先は今回扱いません。気になったら後で調べる、で十分です。

- **`play` 関数**: 「クリック → 期待結果」のような **インタラクション** を Story に組み込み、Storybook 上で自動再生・アサートする
- **`addon-vitest`**: Story を Vitest のテストとして実行できる。`npm test` で各 Story の描画チェックが走る（a11y を fail 条件に含めたい場合は `parameters.a11y` の追加設定が必要）
- **`build-storybook`**: 静的ファイル化して Vercel や GitHub Pages にデプロイ。チームに常時アクセス可能な UI カタログを配れる
- **Chromatic**: Storybook の作者たちが提供する、PR ごとに見た目の差分を検出するサービス（ビジュアルリグレッション）

## 演習

### ゴール

- Vite + React + TS のプロジェクトに Storybook を入れる
- 自前の `Badge` コンポーネントで **3 つの Story**（Green / Yellow / Red）を書いて画面に並べる
- **Controls** で props を変えると表示が追従することを確認する
- **Accessibility** タブで違反 0 件と、わざと違反を作って赤くなることの両方を確認する

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

- どの構成か → 自動検出（React + Vite）でそのまま Enter
- a11y アドオンを入れるか → **yes**

完了後、`package.json` に `storybook` / `build-storybook` スクリプトが追加され、`.storybook/` ディレクトリができていることを確認します。

### 手順 2: 起動して既存サンプルを眺める

```bash
npm run storybook
```

ブラウザで `http://localhost:6006/` が開きます。サイドバーの `Example > Button` をクリックし、Controls の `label` を書き換えて画面が追従することを確認します。

### 手順 3: 自前の Badge を作る

`src/components/Badge.tsx` に上の `Badge` コードをそのままコピーします。

### 手順 4: Story を書く

`src/components/Badge.stories.tsx` を作り、上の Story コードをそのままコピーします。

### 期待出力

- サイドバーに **`Components > Badge > Green / Yellow / Red`** が並ぶ
- Green を開くと「公開中」と書かれた緑のバッジが見える
- Yellow / Red を開くと色とラベルが切り替わる
- 下の **Controls** で `label` / `color` を変えるとバッジがその場で変わる
- 右パネルの **Accessibility** タブに **No violations found** と表示される

### 変える

- `meta.args.label` を `"NEW"` に変える → 全 Story の初期文字列が変わる（個別 args が上書きしている Red は `"停止中"` のままになる）
- `Badge.tsx` の green を `{ bg: "#dcfce7", fg: "#a7f3d0" }` にする → Accessibility パネルがコントラスト不足の違反を表示する（確認後は戻す）

### 自分で書く

- `Badge` に新しい色 `"blue"` を足し、`Blue` Story を 1 つ加える
- 別のコンポーネント（例: `Avatar` — 画像とサイズを props で取る、`Tag` — クリックで × アイコンを出す等）を 1 つ実装し、その Story を 2 つ以上書く

## まとめ

- Storybook はコンポーネントを **アプリから切り離して** 1 つずつ開く開発サーバー
- Story は CSF（**`meta`（default export）** + **名前付き export**）で書き、`args` で props を差し替える
- **Controls** で props を UI から触れる
- **`addon-a11y`** で各 Story ごとに axe-core によるアクセシビリティチェックが走る
