# lesson73: Server Component と Client Component

## ゴール

- Server Component と Client Component の違いを、動く場所と使える機能の観点で説明できる
- `"use client"` を **ファイル先頭 1 行目** に書くルールを覚え、`import` された子に Client 扱いが伝播することを理解する
- Client Component から Server Component を `import` できないが、`children` や props として受け取れることを知る
- `console.log` をブラウザ / サーバーの両方で仕掛け、境界の違いを目で確認する

## 解説

### 2 種類のコンポーネントの違い

「Next.js ってなに？」で触れた通り、App Router にはコンポーネントが 2 種類あります。本レッスンではこの違いをコードで体感していきます。

| | Server Component | Client Component |
|---|---|---|
| 動く場所 | サーバー側 | ブラウザ側 |
| デフォルトか | **既定**（何もしなければこちら） | `"use client"` を明示する必要がある |
| `useState` / `useEffect` / `onClick` | 使えない | 使える |
| DB 接続 / API キー | 使える | 使えない（ブラウザに漏れるため） |
| ブラウザに送られる JS | 送られない（結果だけが届く） | 送られる |

基本の使い分けは次の通りです。

- 静的に描画するだけ・データ取得をしたいだけ → **Server Component**
- ボタンクリック・state 管理・ブラウザ API（`localStorage` など）が必要 → **Client Component**

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

<img src="/diagrams/server-client-tree.svg" alt="RootLayout(Server) → page.tsx(Server) → Nav(Server) / Counter(Client) / TodoForm(Client) のツリー。Server Component が外側を占め、Client Component が必要な葉のみ" class="diagram" />

- 図の緑（Server）は、アクセスごとにサーバー側で React が走って結果を送る部分です。
- 図の青（Client）は、ブラウザに JS が届いて動く部分です。
- Client の部分は「葉」に配置します。ページ全体を Client にしません。

### Client → Server の呼び出しルール

ここがよく詰まるポイントです。

- Client Component から Server Component を **`import` できません**。
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

### Server → Client へ渡せる props は JSON で表せる値だけ

Server Component から Client Component へ props を渡すとき、**JSON で表せる値**（= シリアライズ可能な値）しか渡せません。これは Server で計算した結果を **ネットワーク越しに JSON にして Client へ送る** ためです。

> **シリアライズ** は「メモリ上のオブジェクトを、ネットワークやファイルで送れる文字列／バイト列に変換すること」。JSON 化はその代表例です。

- **OK**: 文字列 / 数値 / 真偽値 / `null` / 配列 / プレーンオブジェクト / Server Action として宣言された関数
- **NG**: `Date` オブジェクト / `Map` / `Set` / 普通の関数（コールバック）/ クラスのインスタンス / Symbol

`Date` を渡すと `Error: Only plain objects can be passed to Client Components` のようなエラーになります。実務での回避パターン:

- **`Date` → 文字列**: Server で `date.toISOString()` してから渡し、Client 側で必要なら `new Date(str)` に戻す
- **`Map` / `Set` → 配列 / オブジェクト**: `Array.from(map)` で配列化してから渡す
- **コールバック関数**: 普通の関数は渡せない。**Server Action**（`"use server"` を付けた関数）として定義したものだけ渡せる

### `"use client"` を忘れたときのエラー

`useState` を使うファイルで `"use client"` を書き忘れると、Next.js はビルド時にエラーを出します。実際に出るメッセージの一部は以下のような文言です。

```
You're importing a component that needs useState. This React Hook only works in a Client Component. To fix, mark the file (or its parent) with the "use client" directive.
```

このメッセージが出たら、冒頭に `"use client";` を足せばすぐ直ります。

### コラム: RSC ペイロードって何？

Server Component の結果は、実は **HTML そのもの** としてブラウザに届くわけではありません。Next.js はサーバー側で React をレンダリングし、その結果を **React が読める特殊な形式**（RSC ペイロードと呼ばれる）に変換してブラウザに送ります。ブラウザ側の React はそれを受け取って、ページのツリーに差し込みます。

ブラウザの「ソースを表示」で見える HTML は、初回表示用に別で生成された HTML です。`<Link>` でのページ遷移では、RSC ペイロードだけが追加で送られてきて、必要な部分だけがツリーに差し替わります。

本コースでは RSC ペイロードの詳細までは踏み込みませんが、「Server Component は HTML を直接返すのとは違う仕組みで動いている」とだけ覚えておけば十分です。

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
