# lesson113: Vite の仕組みを軽く

## ゴール

- Vite が **開発時とビルド時で別の戦略** を使う（古典的な 2 段構成）ことと、**Vite 8（2026 年 3 月）からは Rolldown 単独に統一** された経緯が分かる
- HMR（Hot Module Replacement）が「**変更した部分だけ差し替える**」仕組みを大づかみに理解する
- 本番ビルドでチャンク分割が起きる理由が言える
- `import.meta.env` で環境変数を読み込める
- Vite プラグインの位置付けを把握する

## 解説

### Vite の立ち位置

Vite は **Vue.js 作者の Evan You が始めた** モダンビルドツールです。React / Vue / Svelte / Solid など主要フレームワークの公式テンプレートにも採用され、2026 年現在は **新規プロジェクトのデフォルト** と言える存在です。

特徴:

- **開発サーバーが速い**（数百 ms で起動）
- **HMR が一瞬**（保存と同時にブラウザが追随）
- **本番ビルドはツリーシェイク + 最適化** までやる
- **プラグイン互換** で React / Vue / SVG / MDX / PWA など何でも繋がる

### 2 段構成の歴史と Rolldown 統一

Vite が登場した当初の戦略は **「開発と本番で違うツールを使う」** でした。

| 局面 | 使うツール | 役割 |
|---|---|---|
| 開発時 | esbuild | 依存関係の事前バンドル / TS・JSX 変換（**Go 製で速い**） |
| 本番ビルド時 | Rollup | チャンク分割 / ツリーシェイクが得意（**JS 製、プラグイン豊富**） |

開発は速さ重視 = esbuild、本番は最適化重視 = Rollup。**「両方のいいとこ取り」** という賢い設計でした。

#### Vite 8（2026 年 3 月）で Rolldown に統一

[Vite 8](https://vite.dev/blog/announcing-vite8) は **Rolldown** という Rust 製の新しいバンドラを採用し、**開発も本番も Rolldown 1 本** に統一しました。

- **Rolldown は Rust 製**で、Rollup と同じプラグイン API を持つ
- **esbuild より速く、Rollup の機能を備える**
- 結果として Vite はビルドが **最大 10〜30 倍速** になった
- Rolldown の中で **Oxc**（Rust 製パーサ / minifier）が使われる

「esbuild + Rollup の 2 段構成」から「Rolldown 1 段」に進化した、と覚えれば十分。**普段の使い方は変わりません**（`vite` / `vite build` / `vite preview`）。

### 開発サーバーの仕組み

Vite の開発サーバーが速い秘密は「**バンドルしないで配る**」ことです。

#### 古典的 webpack の流れ

1. 全ファイルを依存関係に従って **1 つにまとめる**（バンドル）
2. ブラウザに 1 つの大きな JS を渡す
3. 一部修正されると **再バンドル**

→ ファイル数が増えると線形に遅くなる。

#### Vite の流れ

1. ブラウザの **ESM**（`import` / `export`） をそのまま使う
2. `import "./App.tsx"` のリクエストが来た瞬間 **そのファイルだけ** TypeScript / JSX を変換して返す
3. 修正されたファイルだけ再変換 → HMR で **ピンポイントに差し替え**

→ ファイル数が増えても初回の起動が速い。

#### 例: 何が起きているか

ブラウザの開発者ツールで Network タブを見ると、`main.tsx` / `App.tsx` / `Button.tsx` / 各 npm パッケージが **個別に** リクエストされています。これがブラウザネイティブの ESM。

ただし `node_modules` 内の依存（`react`、`react-dom` など）は **事前バンドル**（pre-bundling）で 1 ファイルにまとめてから配ります。なぜなら多くの npm パッケージが内部で **数百ファイル** に分かれていて、そのまま配るとリクエスト数が膨大になるから。**「自分のコードは個別配信、依存は固める」** がコツです。

### HMR（Hot Module Replacement）

開発時にファイルを保存すると、**ブラウザのリロードなしに該当部分だけ更新** される機能です。

普通のブラウザリロードと違って:

- フォームに入力した値が **保持** される
- スクロール位置が保たれる
- 状態（state）も保たれる（フレームワーク側が対応していれば）

#### 仕組みを大づかみに

1. Vite はファイル変更を **fs.watch** で監視
2. 変更があると **どのモジュールが影響を受けるか** を依存グラフから割り出す
3. **影響モジュールだけ** ブラウザに WebSocket で送る
4. ブラウザ側のランタイムが **古いモジュールを新しいもので置換**

React / Vue は専用のプラグイン（`@vitejs/plugin-react` / `@vitejs/plugin-vue`）が **コンポーネントの state を保ったまま** 差し替える HMR を提供します。これが「保存と同時にコンポーネントだけ書き換わる」体験の正体。

### 本番ビルドの仕組み

`vite build` で行われること:

1. **エントリポイント** から依存関係を辿る
2. **ツリーシェイク** で使われない export を削除
3. **チャンク分割** で複数ファイルに分ける
4. **minify** でファイルサイズを削減
5. **assets**（画像 / CSS）にハッシュを付けて出力（`index-Xj9k2.js` のような名前）

#### チャンク分割（コード分割）

すべて 1 ファイルにすると初回ロードが重くなります。Vite はデフォルトで:

- **ベンダー**（`node_modules`）を別チャンクに
- **動的 import**（`import("./Heavy.tsx")` のような書き方）を別チャンクに

を行います。「ボタンを押した時だけ読む UI」は **動的 import** で別チャンクにすれば、初回バンドルから外せます（lesson102 のバンドルサイズ最適化と繋がる話）。

```ts
// クリック時に初めて読み込む
const handleClick = async () => {
  const { showModal } = await import("./modal");
  showModal();
};
```

#### ハッシュ付きファイル名

`index-Xj9k2.js` のように **内容ハッシュ** を付けることで、CDN に長期キャッシュを設定しても安全に運用できます（中身が変われば名前も変わる）。

### `import.meta.env` で環境変数

Vite は `.env` / `.env.local` / `.env.development` / `.env.production` を読み込みます。

```bash
# .env
VITE_API_URL=https://api.example.com
SECRET_KEY=do_not_expose
```

```ts
console.log(import.meta.env.VITE_API_URL); // OK
console.log(import.meta.env.SECRET_KEY);   // undefined（VITE_ で始まらないので公開されない）
```

ルール:

- **`VITE_` プレフィックス** が付いた値だけが **クライアントに公開** される
- それ以外は Vite が **読み捨てる**（漏洩対策）
- ビルド時に **値が文字列リテラルとして埋め込まれる**（実行時のフェッチではない）

組み込みで使える環境情報:

```ts
import.meta.env.MODE        // "development" / "production"
import.meta.env.DEV         // true / false
import.meta.env.PROD        // true / false
import.meta.env.BASE_URL    // "/" など
```

### プラグイン

Vite は **Rollup プラグイン互換** + Vite 独自の hook を持つ「プラグイン」で機能拡張します。

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({ registerType: "autoUpdate" }),
  ],
});
```

代表的なプラグイン:

- `@vitejs/plugin-react`: React の HMR + JSX 変換
- `@vitejs/plugin-vue`: Vue 単一ファイルコンポーネント対応
- `vite-plugin-svgr`: `import { ReactComponent as Icon } from "./icon.svg"`
- `vite-plugin-pwa`: PWA 化（このコースのドキュメント自体も使っている）
- `vitest`: テストランナー（lesson97）

Rolldown / Rollup プラグインがそのまま動く設計なので、**エコシステムが共有される** のが強みです。

### Vite と他ツールの関係

Next.js / Remix / Nuxt のようなフルスタックフレームワークも、内部で **Vite を採用** したり、独自の Turbopack / esbuild を使ったりしています。

- **Next.js**: 独自の Turbopack（Rust 製）を使う。Vite は採用していない
- **Remix v3 / React Router v7+**: 内部で Vite を採用
- **Nuxt 3+**: 内部で Vite を採用
- **Astro**: 内部で Vite を採用
- **SvelteKit**: 内部で Vite を採用

つまり「**フレームワーク非依存の Vite を使うか、Vite を内蔵したフレームワークを使うか**」という違いに帰着します。

### 「ハマる」パターン

#### `process.env` が `undefined`

→ Vite では **`import.meta.env`** を使う。`process.env` は Node.js のもので、ブラウザにはない。

#### 環境変数がクライアントに出てこない

→ 名前を **`VITE_` で始める**。さもないと意図的に削除される。

#### CommonJS のパッケージで失敗

→ `optimizeDeps.include` に追加する、または ESM 互換の代替パッケージを探す。最近は CJS のみのパッケージが減ったので、出会う頻度は下がっている。

#### `node:fs` を import してエラー

→ ブラウザ向けコードに **Node.js 専用 API** は使えない。サーバー側コード（Astro / Next.js / API ルート）に分離する。

## 演習

### ゴール

- Vite の開発サーバーで **HMR を体感** する
- ビルド出力のチャンク分割を眺める
- `import.meta.env` で環境変数を読む

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest vite-internals -- --template react-ts
cd vite-internals
npm install
```

### 手順 2: HMR を試す

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。`src/App.tsx` の文字列を編集して保存すると、**画面の該当部分だけ** 更新されることを確認します。React のカウンタの値が **保持されたまま** UI が変わるのが HMR の効果。

### 手順 3: ネットワークタブで個別配信を観察

DevTools の Network タブを開いた状態で **Cmd/Ctrl + Shift + R**（ハードリロード）。`main.tsx` / `App.tsx` などが **個別に** ロードされていることを確認します。`react` / `react-dom` は事前バンドルされて 1 つにまとまっています（`/node_modules/.vite/deps/...` のような URL）。

### 手順 4: 環境変数

`.env` を作成:

```bash
# .env
VITE_API_URL=https://api.example.com
SECRET_TOKEN=xxxxx
```

`src/App.tsx` に追加:

```tsx
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("SECRET_TOKEN:", import.meta.env.SECRET_TOKEN);
console.log("MODE:", import.meta.env.MODE);
```

ブラウザのコンソールで:

- `VITE_API_URL` は表示される
- `SECRET_TOKEN` は **`undefined`**（Vite が削除する）
- `MODE` は `"development"`

### 手順 5: 本番ビルド

```bash
npm run build
ls -la dist/assets
npm run preview
```

`dist/assets` 内に **ハッシュ付き** のファイル名（`index-Xj9k2.js` など）があり、CSS と JS が別ファイルに分かれていることを確認します。`npm run preview` で本番ビルドの動作確認ができます。

### 手順 6: 動的 import でチャンクを分割

`src/App.tsx`:

```tsx
import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");

  const handleClick = async () => {
    const mod = await import("./heavy");
    setText(mod.heavyFunction());
  };

  return (
    <div>
      <button onClick={handleClick}>重い処理</button>
      <p>{text}</p>
    </div>
  );
}
```

`src/heavy.ts`:

```ts
export function heavyFunction() {
  return "計算結果です";
}
```

`npm run build` を再度実行し、`dist/assets` を見ると `heavy-XXXX.js` のような **別チャンク** が生成されていることを確認します。

### 期待出力

- HMR でファイル保存と同時に画面が更新（リロードなし）
- DevTools で **個別の TS / JSX が ESM として配信** されている様子が見える
- `VITE_` プレフィックスの環境変数のみクライアントから読める
- `dist/assets` にハッシュ付きファイル / 別チャンクが見える

### 変える

- `vite.config.ts` の `build.rollupOptions.output.manualChunks` を設定して **手動チャンク分割** を試す
- `import.meta.env.MODE` の値を `npm run build` 時に確認（`production`）
- `vite-plugin-pwa` を入れて、ビルド時に Service Worker が生成されることを観察

### 自分で書く（任意）

- 自作プラグインを 1 つ書いてみる（`transform` フックで全ての `.ts` ファイルにコメントを足すなど）
- `import.meta.glob` を使って `src/pages/*.tsx` を一括取得し、簡易ルーターを作る
- Vite 7 と Vite 8（Rolldown）でビルド時間を比較してみる（既存のプロジェクトで `npm install vite@7` ↔ `vite@8`）

## まとめ

- **Vite 8（2026 年 3 月）から Rolldown 単独に統一**。それまでの「esbuild + Rollup 2 段構成」を 1 段に置き換え
- 開発時は **バンドルせず ESM として配る**。`node_modules` だけ事前バンドルする
- HMR は依存グラフを使って **影響モジュールだけ** 差し替える。フレームワーク用プラグインで state も保たれる
- 本番ビルドは **ツリーシェイク + チャンク分割 + minify + ハッシュ付き** ファイル名を生成
- 環境変数は **`import.meta.env`** で読む。`VITE_` プレフィックスのみクライアントに公開
- プラグインは **Rollup / Rolldown 互換**。エコシステムが共有される
- Next.js / Remix / Nuxt / Astro / SvelteKit などのフレームワークが Vite を内蔵
- 別のレッスンでは **Sentry でエラートラッキング** に進む
