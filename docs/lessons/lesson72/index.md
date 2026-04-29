# lesson72: Route Groups で整理する

## ゴール

- `(group)/` という括弧付きディレクトリ名の意味を理解し、URL を変えずにファイル側だけを意味のある単位で整理できます。
- グループ内に `layout.tsx` を置くと、そのグループ配下のページだけに追加レイアウトが適用されることを確認できます。
- 「公開側」と「アプリ側」で共通レイアウトを分けたい、という典型的な使いどころを体験できます。

## 解説

### 前回までに作ったもの

「共通レイアウトを作る」で、全ページ共通のヘッダー・フッターを `app/layout.tsx` にまとめました。`/`、`/about`、`/todos` のどのページにアクセスしても、上にナビ・下にフッターが出る状態です。

一方で、今後アプリが大きくなると次のような悩みが出ます。

- `/about` は公開ページなのでサイドバーは不要
- `/todos` はアプリ内ページなので、左にサイドメニューがあると便利

「ページの種類ごとに追加レイアウトを変えたい」のに、URL 体系は `/`、`/about`、`/todos` のままにしたい。このとき役立つのが **Route Groups** です。

### `(group)/` の意味

App Router では、ディレクトリ名を `( )` で囲むと **URL には登場しない** 仕組みがあります。これが Route Groups です。

```
app/
├── (public)/
│   ├── page.tsx          → /
│   └── about/
│       └── page.tsx      → /about
└── (app)/
    ├── layout.tsx        → (app) 配下だけに適用
    └── todos/
        └── page.tsx      → /todos
```

- `(public)` というディレクトリ名は URL には出ません。`app/(public)/page.tsx` の URL は `/` です。
- 同じく `(app)` も URL には出ません。`app/(app)/todos/page.tsx` の URL は `/todos` です。
- 結果として、**URL は `/`、`/about`、`/todos` のまま変わりません**。ファイルの置き場所だけが整理されます。

### グループ内の `layout.tsx`

Route Groups の嬉しさは、グループ直下に `layout.tsx` を置けることです。この `layout.tsx` は、**そのグループ配下のページだけ** に適用されます。

- `app/(app)/layout.tsx` を置くと、`/todos` には適用されるが、`/` や `/about` には適用されない
- 逆に `app/(public)/layout.tsx` を置くと、`/` と `/about` には適用されるが、`/todos` には適用されない
- `app/layout.tsx`（ルートレイアウト）は引き続き全ページに適用される

つまり、レイアウトの構造は「ルートレイアウト → グループレイアウト → page」のように入れ子になります。

<img src="/diagrams/route-groups-layout.svg" alt="ルートの app/layout.tsx の下に (public) と (app) の 2 つのルートグループがあり、(public) は layout.tsx を持たず / と /about を直接含み、(app) は別の layout.tsx (サイドバー) を持って /todos を含むツリー" class="diagram" />

### 並列・インターセプトは扱わない

App Router には `@slot/page.tsx`（並列ルート）や `(.)path`（インターセプトルート）といったさらに発展的な機能もありますが、本コースでは **Route Groups まで** にとどめます。

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。

<details>
<summary>出発点のファイル</summary>

**`app/layout.tsx`**

```tsx
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "My Next App",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <nav>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/todos">Todos</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>&copy; 2026 My Next App</p>
        </footer>
      </body>
    </html>
  );
}
```

**`app/page.tsx`**

```tsx
export default function Page() {
  return (
    <>
      <h1>ようこそ</h1>
      <p>このアプリについてはヘッダーのリンクから。</p>
    </>
  );
}
```

**`app/about/page.tsx`**

```tsx
import "./about.css";

export default function AboutPage() {
  return (
    <>
      <section id="about">
        <h2>自己紹介</h2>
        <p>Web フロントエンドを学び中です。HTML / CSS / JavaScript から順に手を動かして進めています。</p>
      </section>

      <section id="likes">
        <h2>好きなもの</h2>
        <div className="cards">
          <article className="card">
            <img src="https://placehold.co/300x200.png" alt="コーヒーのプレースホルダ画像" />
            <h3>コーヒー</h3>
            <p>朝の 1 杯が欠かせない。</p>
          </article>
          <article className="card">
            <img src="https://placehold.co/300x200.png" alt="本のプレースホルダ画像" />
            <h3>本</h3>
            <p>技術書からエッセイまで。</p>
          </article>
          <article className="card">
            <img src="https://placehold.co/300x200.png" alt="散歩のプレースホルダ画像" />
            <h3>散歩</h3>
            <p>行き先を決めずに歩く。</p>
          </article>
        </div>
      </section>

      <section id="contact">
        <h2>問い合わせ</h2>
        <form>
          <div>
            <label htmlFor="name">お名前</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div>
            <label htmlFor="email">メール</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="message">メッセージ</label>
            <textarea id="message" name="message" rows={4} required></textarea>
          </div>
          <button type="submit">送信</button>
        </form>
      </section>
    </>
  );
}
```

**`app/about/about.css`**（「ページを増やしてリンクで移動する」と同じ。`.cards` / `.card` のスタイル中心に必要なものを貼ってください）

**`app/todos/page.tsx`**

```tsx
export default function TodosPage() {
  return (
    <>
      <h1>TODO 一覧</h1>
      <p>TODO 一覧はここに実装する。</p>
    </>
  );
}
```

**`app/globals.css`**

```css
.site-header ul {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 1rem;
  background: #f5f5f5;
}

.site-header a {
  text-decoration: none;
  color: #0070f3;
}

.site-footer {
  padding: 1rem;
  border-top: 1px solid #ddd;
  color: #555;
}

@media (prefers-color-scheme: dark) {
  .site-header ul {
    background: #1f1f1f;
  }
  .site-header a {
    color: #4ea2ff;
  }
  .site-footer {
    border-top-color: #333;
    color: #bbb;
  }
}
```

</details>

### 前回のプロジェクトを開く

これまでのレッスンで作った StackBlitz プロジェクトを開き直しましょう。

### 現状の確認

現在のファイル構成は次のようになっているはずです。

```
app/
├── layout.tsx       ← 全ページ共通のヘッダー・フッター
├── page.tsx         → /
├── about/
│   ├── page.tsx     → /about
│   └── about.css
└── todos/
    └── page.tsx     → /todos
```

この構成を、次の形に変えます。

```
app/
├── layout.tsx
├── (public)/
│   ├── page.tsx
│   └── about/
│       ├── page.tsx
│       └── about.css
└── (app)/
    ├── layout.tsx   ← 新規。サイドバーを置く
    └── todos/
        └── page.tsx
```

### 手順 1: `(public)` グループを作る

StackBlitz のファイルツリーで、`app/` の直下に新しいフォルダを作ります。名前は `(public)` です（括弧も含めてそのまま入力します）。

作れたら、次のファイル・フォルダを `(public)/` の中に **移動** します。

- `app/page.tsx` → `app/(public)/page.tsx`
- `app/about/` フォルダごと → `app/(public)/about/`

移動は StackBlitz の UI 上でドラッグするか、右クリックメニューの「Move」で行います。

### 手順 2: `(app)` グループを作る

同じ要領で、`app/` 直下に `(app)` というフォルダを新規作成します。

- `app/todos/` フォルダごと → `app/(app)/todos/`

これで `(public)` と `(app)` の 2 つのグループに分かれました。

### 手順 3: 動作確認（`layout.tsx` 追加前）

この時点で、ブラウザから `/`、`/about`、`/todos` の 3 つの URL を確認しましょう。

- URL は **変わりません**（Route Groups なので `( )` は URL に出ません）
- 見た目も **変わりません**（`app/layout.tsx` のヘッダー・フッターは全ページに適用されたままです）

「ファイルを動かしても URL が壊れない」ことが Route Groups の第一印象です。

### 手順 4: `(app)/layout.tsx` を作る

`app/(app)/layout.tsx` を新規作成します。ここに「アプリ用のサイドバー」を置きます。

```tsx
import Link from "next/link";

export default function AppLayout({ children }: LayoutProps<"/todos">) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h2>アプリメニュー</h2>
        <nav>
          <ul>
            <li>
              <Link href="/todos">TODO 一覧</Link>
            </li>
            <li>
              <Link href="/">ホームに戻る</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <section className="app-main">{children}</section>
    </div>
  );
}
```

ポイント:

- このファイルは `(app)` グループ配下の `layout.tsx` なので、`/todos` にだけ適用されます。`/` や `/about` には影響しません。
- `children` には `(app)` 配下の各 `page.tsx` が差し込まれます（今回は `/todos` だけ）。
- `"use client"` は不要です。`<Link>` を並べるだけで、クリックで動く JS は書いていません（Server Component のままで OK）。

### 手順 5: サイドバーの CSS

`app/globals.css` の末尾に次を追加します。

```css
.app-shell {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.app-sidebar {
  flex: 0 0 200px;
  padding: 1rem;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
}

.app-sidebar h2 {
  margin-top: 0;
  font-size: 1rem;
}

.app-sidebar ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-sidebar a {
  color: #0070f3;
  text-decoration: none;
}

.app-main {
  flex: 1;
}

/* ダークモード配慮 */
@media (prefers-color-scheme: dark) {
  .app-sidebar {
    background: #1f1f1f;
    border-right-color: #333;
    color: #e5e7eb;
  }
  .app-sidebar a {
    color: #4ea2ff;
  }
}

/* 画面が狭いときは縦積み */
@media (max-width: 640px) {
  .app-shell {
    flex-direction: column;
  }
  .app-sidebar {
    flex: 0 0 auto;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
}
```

### 期待出力

ブラウザで `/about` と `/todos` を開き比べます。

**`/about`（サイドバーなし）:**

```
+-----------------------------------------+
| Home | About | Todos   ← ルートレイアウト |
+-----------------------------------------+
|                                         |
| 自己紹介                                |
| ...                                     |
|                                         |
+-----------------------------------------+
| © 2026 My Next App                      |
+-----------------------------------------+
```

**`/todos`（サイドバーあり）:**

```
+-----------------------------------------+
| Home | About | Todos   ← ルートレイアウト |
+-----------------------------------------+
| アプリメニュー |                        |
| - TODO 一覧   |  TODO 一覧              |
| - ホームに戻る|  (ページ固有の内容)     |
|               |                         |
+-----------------------------------------+
| © 2026 My Next App                      |
+-----------------------------------------+
```

確認したいポイント:

- **URL は `/`、`/about`、`/todos` のまま変わらない**（`(public)` や `(app)` はどちらも URL に出ない）
- **`/about` にはサイドバーが出ない**（`(app)/layout.tsx` の適用範囲外）
- **`/todos` にはサイドバーが出る**（`(app)/layout.tsx` の適用範囲内）
- ルートレイアウト（ヘッダー・フッター）は 3 ページすべてに出る

この「同じ URL 体系のまま、一部のページだけに追加レイアウトを付けられる」のが Route Groups の狙いです。

### 変えてみる

1. `(app)/layout.tsx` のサイドバーに「新規作成」のリンク（仮に `/todos/new`）を足してみましょう（リンク先のページはまだ作らなくて構いません）。
2. `(public)/layout.tsx` を新規作成して、`/` と `/about` にだけ「Welcome!」と書かれた小さなバナーを上に出してみましょう。`/todos` には出ないことを確認します。
3. 手順の途中で、`(app)` を誤って `app/app/` のような括弧なしのディレクトリに作ったら URL がどうなるか試してみましょう（`/app/todos` のように URL に反映されてしまうはずです）。確認したら元に戻します。

### 自分で書く

何も見ずに、次の構造を組めるか挑戦しましょう。

- `(marketing)` グループの中に `/pricing` ページを作り、`(marketing)/layout.tsx` で「製品ページ共通の帯」を上に出す
- `/pricing` ではその帯が出るが、`/about` では出ないことを確認する

必要なファイルは `app/(marketing)/layout.tsx` と `app/(marketing)/pricing/page.tsx` の 2 つだけです。

## まとめ

- ディレクトリ名を `( )` で囲むと URL に出ない「グループ」になります。URL 体系を変えずにファイル配置だけを整理できます。
- グループ内に `layout.tsx` を置くと、そのグループ配下のページだけに追加レイアウトが適用されます。
- 典型的な使いどころは「公開ページ / アプリ側ページ」のような大きな 2 分割です。
- 本コースで扱うのはここまで。並列ルート（`@slot`）やインターセプトルート（`(.)path`）は本コースでは扱いません。
