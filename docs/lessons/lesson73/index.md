# lesson73: Server Component と Client Component

## ゴール

- Server Component と Client Component の違いを、動く場所と使える機能の観点で説明できます。
- `"use client"` を **ファイル先頭 1 行目** に書くルールを覚え、`import` された子にも Client 扱いが伝播することを理解できます。
- Client Component が Server Component を `import` はできませんが、`children` や props として受け取れることを知っています。
- `console.log` をブラウザ / サーバーの両方で仕掛け、境界の違いを自分の目で確認できます。

## 解説

### 2 種類のコンポーネントがある

App Router では、コンポーネントが 2 種類あります。

- **Server Component**（デフォルト）
  - サーバー側で React を実行します。
  - `useState` / `useEffect` / `onClick` など、**ブラウザでしか動かないもの** は使えません。
  - データベースアクセスや秘密情報を扱えます。
  - 送り出されたあとはブラウザでは再実行されません。
- **Client Component**
  - ブラウザで動きます。4 章 までの React と同じ感覚で書けます。
  - `useState` / `useEffect` / `onClick` が使えます。
  - 先頭に `"use client"` を書いて明示します。

4 章 と同じ感覚で `useState` を使いたい部品は Client Component に、静的に描画するだけの部品は Server Component に、というのが基本の使い分けです。

### `"use client"` のルール

Client Component にしたいファイルは、**1 行目に** 次の 1 行を書きます。

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  // ...
}
```

- 必ず **ファイル先頭 1 行目**（`import` より上）です。
- このファイルから `import` される子コンポーネントも、Server Component として書いてあっても **実質 Client 扱い** になります（Client 境界は import グラフに沿って伝播します）。

つまり「あるファイルに `"use client"` を書く」＝「そこから先はすべてブラウザ側で動く」と覚えれば良いです。

### 境界のイメージ

ページ全体を木に例えると、外側は Server Component（緑）、必要な葉だけが Client Component（青）というイメージになります。

```mermaid
graph TD
  classDef server fill:#2d6a4f,stroke:#95d5b2,color:#ffffff;
  classDef client fill:#1b4965,stroke:#62b6cb,color:#ffffff;

  Layout["RootLayout (Server)"]:::server
  Page["page.tsx (Server)"]:::server
  Nav["Nav (Server)"]:::server
  Counter["Counter (Client)"]:::client
  Form["TodoForm (Client)"]:::client

  Layout --> Page
  Page --> Nav
  Page --> Counter
  Page --> Form
```

- 図の緑（Server）は、アクセスごとにサーバー側で React が走って結果を送る部分です。
- 図の青（Client）は、ブラウザに JS が届いて動く部分です。
- Client の部分は「葉」に配置します。ページ全体を Client にしません。

上記図はダークモード前提で十分なコントラスト（背景 `#2d6a4f` / `#1b4965`、枠 `#95d5b2` / `#62b6cb`、文字 `#ffffff`）を指定しています。

### Client → Server の呼び出しルール

ここがよく詰まるポイントです。

- Client Component が Server Component を **`import` することはできません**。
- ただし、`children` や props として **受け取ること** は可能です。

つまり、「Client の中に Server を入れたい」なら、**親 Server Component の側で組み立てて、Client の `children` に渡す** 形にすれば良いです。

```tsx
// Server Component（親）
import { ClientWrapper } from "./ClientWrapper";
import { ServerInfo } from "./ServerInfo";

export default function Page() {
  return (
    <ClientWrapper>
      <ServerInfo />
    </ClientWrapper>
  );
}
```

```tsx
// ClientWrapper.tsx
"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export function ClientWrapper({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>開閉</button>
      {open && children}
    </div>
  );
}
```

`ClientWrapper` は自分では `ServerInfo` を `import` していませんが、`children` として渡ってきた内容は Server Component として動けます。

### `"use client"` を忘れたときのエラー

`useState` を使うファイルで `"use client"` を書き忘れると、Next.js はビルド時にエラーを出します。実際に出るメッセージの一部は以下のような文言です。

```
You're importing a component that needs useState. This React Hook only works in a Client Component. To fix, mark the file (or its parent) with the "use client" directive.
```

このメッセージが出たら、冒頭に `"use client";` を足せばすぐ直ります。

## 演習

### 途中から始める場合

このレッスンのカウンター演習は比較的独立しています。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、本文の手順だけで完結します（`app/page.tsx` と `app/components/` 配下の新規作成のみで進められます）。

### 既存のプロジェクトを使う

「共通レイアウトを作る」のレッスンで作ったプロジェクトを開き直しましょう。

### 手順 1: Client Component の `Counter` を作る

`app/` と同じ階層（または `app/` 内どこでも）に `components/` ディレクトリを新しく作って、そこに `Counter.tsx` を置きます（本コースでは `app/components/` に置くことにします）。

`app/components/Counter.tsx`:

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  console.log("client render");
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

- 1 行目に `"use client"` を書きます。
- `useState` と `onClick` を使っています。
- `console.log("client render")` をレンダリング中に仕掛けます。

### 手順 2: Server Component の `page.tsx` に埋め込む

`app/page.tsx` を次のように書き換えます。

```tsx
import { Counter } from "./components/Counter";

export default function Page() {
  console.log("server render");
  return (
    <>
      <h1>ようこそ</h1>
      <p>Counter は Client Component として動く。</p>
      <Counter />
    </>
  );
}
```

- `app/page.tsx` には `"use client"` を書かないので、これは Server Component です。
- `console.log("server render")` を仕掛けます。

### 手順 3: 境界を確認する

1. ブラウザで `/` を開きます。
2. ブラウザの DevTools → Console を開きます。
3. StackBlitz 画面下部の **ターミナル** も見える状態にします（サーバー側ログが流れる場所です）。
4. ページを再読み込みします。

#### 期待出力

- StackBlitz ターミナル側: `server render` が出ます。ブラウザ Console には出ません。
- ブラウザ Console: `client render` が出ます。ターミナル側にも 1 回だけ出る場合がありますが、それはサーバー側で初回描画したときのログです（Client Component でも最初の HTML を出すために一度サーバー側でも走ります）。
- カウンターの「+1」ボタンを押すと、ブラウザ Console にだけ `client render` が追加で出続けます。ターミナル側には一切出ません（ボタン操作はサーバーに届かないからです）。

これで、**Server Component はサーバーで 1 回、Client Component は操作のたびにブラウザで** 動く、という境界の違いを目で確認できます。

### 手順 4: `"use client"` を消してみる

`app/components/Counter.tsx` の 1 行目 `"use client";` をコメントアウト、または削除して保存します。

ビルドが失敗し、ターミナルに次のようなエラーが出ます（抜粋）。

```
You're importing a component that needs useState. This React Hook only works in a Client Component. To fix, mark the file (or its parent) with the "use client" directive.
```

このエラーが出たら、`"use client"` を書き戻して直しましょう。Next.js は `useState` などを検知して「これは Client Component じゃないと動かないよ」と教えてくれます。

### 手順 5: Server を Client の children として渡す

以下の 2 ファイルを新しく作って、「Client の中に Server」の組み立てを体験しましょう。

`app/components/ClientBox.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export function ClientBox({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>
        {open ? "閉じる" : "開く"}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
```

`app/components/ServerInfo.tsx`:

```tsx
export function ServerInfo() {
  // Server Component なので、ここでサーバー時刻が取れる
  const now = new Date().toISOString();
  return <p>サーバー時刻: {now}</p>;
}
```

`app/page.tsx` を書き換え、Server の `ServerInfo` を Client の `ClientBox` の `children` として渡します。

```tsx
import { Counter } from "./components/Counter";
import { ClientBox } from "./components/ClientBox";
import { ServerInfo } from "./components/ServerInfo";

export default function Page() {
  console.log("server render");
  return (
    <>
      <h1>ようこそ</h1>
      <Counter />
      <ClientBox>
        <ServerInfo />
      </ClientBox>
    </>
  );
}
```

#### 期待出力

- 最初は `サーバー時刻: 2026-...` が見えています。
- 「閉じる」ボタンで `ServerInfo` の表示が消えます。「開く」で戻ります。
- `ClientBox` は Client Component、中身の `ServerInfo` は Server Component、という組み合わせが成立しています。

もし `ClientBox.tsx` の中で直接 `import { ServerInfo } from "./ServerInfo";` しようとすると、Server Component 側の機能（将来的に DB 呼び出しなど）は動かなくなります。**渡す** 形を使うのがコツです。

### 変えてみる

1. `ClientBox` の初期値を `useState(false)` に変えて、最初は閉じているようにしましょう。
2. `ServerInfo` で取得する時刻を `new Date().toLocaleString("ja-JP")` に変えましょう。

### 自分で書く

「ダークモード切り替えトグル」を Client Component で書いてみましょう。`useState<boolean>(false)` でオン／オフを持って、ボタンで切り替え、`<p>` に現在の状態を描画するだけで構いません。それをトップページに足してみましょう。

## まとめ

- Server Component がデフォルトです。Client Component にしたいファイルは 1 行目に `"use client"` と書きます。
- `"use client"` のファイルから `import` された子は、書いた本人が気付かなくても Client 扱いに伝播します。
- Client Component は Server Component を `import` できませんが、`children` や props として **受け取る** ことはできます。
- `console.log` の出方の違い（ターミナル vs ブラウザ Console）で境界を体感できます。
- 別のレッスンで Server Component で実際にデータを `fetch` します。Client では扱いにくかった「サーバー側取得」のうまみを体験しましょう。
