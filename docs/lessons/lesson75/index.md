# lesson75: Next.js のキャッシュと revalidate

## ゴール

- **Data Cache**（サーバー側の fetch キャッシュ）と **Router Cache**（ブラウザ側のページキャッシュ）の違いを説明できる
- Next.js 15 以降、`fetch` のデフォルトはキャッシュしないことを理解する
- `{ cache: "force-cache" }` / `{ next: { revalidate: N } }` / `{ next: { tags: [...] } }` を使い分けられる
- `revalidatePath` と `revalidateTag` でキャッシュを手動で無効化できる
- Next.js 16 の `"use cache"` ディレクティブの基本的な書き方を知っている

## 解説

### なぜキャッシュが必要なのか

lesson74 で作った `/posts` ページは、アクセスするたびに外部 API を呼んでいます。学習用の JSONPlaceholder は無制限に使えますが、実際のサービスでは話が違います。

- **外部 API は呼び出しに課金される**: 回数ごとに費用が発生する API は多い
- **ネットワーク通信は時間がかかる**: 往復に 100ms かかれば、毎リクエストで 100ms ロスする
- **API が落ちると自分のサービスも落ちる**: 外部依存が多いほど障害のリスクが増える

キャッシュとは「一度取ったデータを手元に保管しておき、次に同じデータが必要なときに使い回す仕組み」です。うまく使うと、レスポンスが速くなり、外部 API への呼び出し回数が減ります。

ただし「古いデータをいつまでも使い続ける」問題もあります。これを管理するのが **revalidate**（再検証）です。キャッシュと revalidate は、セットで理解するのがポイントです。

### Next.js の 2 種類のキャッシュ

Next.js には複数のキャッシュ層がありますが、最初に押さえるのは **2 つ** です。

#### Data Cache（サーバー側 — fetch の結果をキャッシュ）

サーバー側で実行した `fetch` の結果を保管する仕組みです。

```
【1 回目のリクエスト】
  ブラウザ → サーバー → fetch → 外部 API → 「記事 100 件」が返る
                ↓
       Data Cache に保存
                ↓
       HTML を組み立てブラウザに返す

【2 回目のリクエスト（キャッシュが有効な場合）】
  ブラウザ → サーバー → Data Cache から「記事 100 件」を取り出す
             （外部 API は呼ばない → 速い）
                ↓
       HTML を組み立てブラウザに返す
```

保管場所はサーバー内です。`fetch` の第 2 引数でキャッシュ動作を制御します。

#### Router Cache（ブラウザ側 — ページの RSC payload をキャッシュ）

ブラウザ側で、訪問済みページの描画結果を保管する仕組みです。

```
/posts にアクセス → /posts/1 に移動 → 「戻る」で /posts に戻る
                                            ↑
                            Router Cache から即座に復元
                            （サーバーへのリクエストが起きない）
```

- 保管場所: ブラウザのメモリ（タブを閉じると消える）
- 有効期間: タブを開いている間だけ
- 操作: Server Action 内で `revalidatePath` / `revalidateTag` を呼ぶとクリアされる

#### 2 つの位置関係

```
ブラウザ側
  └─ Router Cache（ページの描画結果を保管 — 遷移を速くする）
          ↑↓
サーバー側
  └─ Server Component（ページを生成する）
          ↑↓
  └─ Data Cache（fetch の結果を保管 — API 呼び出しを減らす）
          ↑↓
      外部 API
```

「サーバー側の fetch キャッシュ = Data Cache」「ブラウザ側のページキャッシュ = Router Cache」と分けて覚えてください。

### Next.js 15 以降：`fetch` のデフォルトはキャッシュしない

**Next.js 14 まで**の `fetch` は、何も指定しなければ結果をキャッシュしていました。一度表示したページのデータが更新されてもサーバーが古い結果を返し続け、「なぜ更新されないの？」という事故が多発しました。

**Next.js 15 以降**はデフォルトが「キャッシュしない」に変わりました。

```tsx
// デフォルト（Next.js 15 以降）: 毎リクエストで外部 API を呼ぶ
const res = await fetch("https://jsonplaceholder.typicode.com/posts");
```

キャッシュしたいときは **明示的に指定** します。Next.js 14 以前の記事を読むと「デフォルトでキャッシュされる」と書いてあることがありますが、15 以降は当てはまらないので注意してください。

### キャッシュを使うときの 3 パターン

#### パターン 1: `force-cache`（ずっとキャッシュ）

```tsx
const res = await fetch(url, { cache: "force-cache" });
```

一度取ったらサーバーを再起動するまで使い回します。

- 向いているもの: 国名リスト・カテゴリ・マスターデータなど「ほぼ変わらないデータ」
- 向いていないもの: ユーザーが書き込むコンテンツ、在庫数など頻繁に変わるデータ

#### パターン 2: `{ next: { revalidate: N } }`（時間ベース再検証）

```tsx
// 60 秒間はキャッシュを使い、60 秒を過ぎたら次のリクエストで取り直す
const res = await fetch(url, { next: { revalidate: 60 } });
```

キャッシュに「賞味期限（秒）」を設けます。期限が切れた後は、次のリクエストのタイミングで新しく取り直します。

```
T=0 秒 : 最初のリクエスト → 外部 API から取得 → キャッシュに保存（有効期限 60 秒）
T=30 秒: 2 回目のリクエスト → キャッシュから返す（まだ 60 秒経っていない）
T=90 秒: 3 回目のリクエスト → キャッシュが古くなった → 外部 API から取り直す
```

- 向いているもの: ブログ記事一覧・ニュース・「数分に 1 回更新されればよい」データ

#### パターン 3: `{ next: { tags: [...] } }`（タグで手動無効化）

```tsx
const res = await fetch(url, { next: { tags: ["posts"] } });
```

タグを付けておき、「新しい記事が投稿された」など **何か変化が起きたとき** に `revalidateTag("posts")` を呼んでキャッシュを捨てます。時間に関係なく、必要なタイミングだけ更新できます。

- 向いているもの: フォーム送信後に一覧を更新したい、管理画面で更新したらフロントに即反映させたい

### `revalidatePath` と `revalidateTag` — キャッシュを手動で切る

`revalidatePath` と `revalidateTag` は `"next/cache"` からインポートして、**Server Action の中から** 呼び出す関数です（Server Action は lesson80 で詳しく扱います）。

```tsx
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

// パス指定: /posts ページのキャッシュをすべて捨てる
revalidatePath("/posts");

// タグ指定: "posts" タグのついた fetch キャッシュをすべて捨てる
revalidateTag("posts");
```

どちらを呼んでも **Data Cache と Router Cache の両方** が無効化されます。次にそのページを開いたとき、サーバーが改めてデータを取得します。

#### 使い分け

| | `revalidatePath` | `revalidateTag` |
|---|---|---|
| 指定の単位 | URL パス | fetch に付けたタグ文字列 |
| 使う場面 | 特定のページだけ更新したい | 複数ページにまたがるデータをまとめて更新したい |
| 例 | `/posts` を送信後に更新 | `"posts"` タグのついた fetch をすべてクリア |

#### 「revalidate し忘れる」と何が起きるか

これが最も陥りやすい失敗です。たとえば「新しい記事を投稿するフォーム」を作ったとします。

```
ユーザーがフォームを送信 → DB に記事を追加 → revalidatePath("/posts") を呼び忘れた
     ↓
/posts を開いてもキャッシュが残っているので、追加した記事が表示されない
     ↓
「投稿できていない？」とユーザーが困惑する
```

**DB やストレージにデータを書き込んだら、対応するパスまたはタグの revalidate を必ず呼ぶ** — これが基本ルールです。

#### Server Action との組み合わせのイメージ

Server Action の書き方は lesson80 で扱いますが、`revalidatePath` がどこに入るか先に形だけ見ておきます。

```tsx
"use server";
import { revalidatePath } from "next/cache";

export async function addPost(formData: FormData) {
  const title = formData.get("title") as string;

  // API や DB にデータを保存する処理（ここでは省略）

  // 保存後に /posts ページのキャッシュを切る
  revalidatePath("/posts");
}
```

「データを変えたら revalidate を呼ぶ」がパターンです。

### `"use cache"` ディレクティブ（Next.js 16）

Next.js 16 では **Cache Components** という仕組みが導入されました。`"use cache"` を関数やコンポーネントの先頭に書くと、その**結果全体**をキャッシュ対象にします。

有効にするには `next.config.ts` に設定が必要です。

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    cacheComponents: true,
  },
};
export default nextConfig;
```

```tsx
import { cacheLife, cacheTag } from "next/cache";

async function getPosts() {
  "use cache";
  cacheLife("hours");  // 1 時間キャッシュ
  cacheTag("posts");   // revalidateTag("posts") で切れるタグ

  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json();
}
```

`fetch` オプションで書く方法と何が違うかというと、**キャッシュの設定を「関数の中に閉じ込められる点**です。複数の処理をまとめてキャッシュしたいときに見通しがよくなります。

- **`cacheLife("minutes" | "hours" | "days" | "weeks" | ...)`** でキャッシュ寿命を設定
- **`cacheTag("...")`** でタグを付け、`revalidateTag` から無効化できる
- 書く場所はファイル先頭（ファイル全体）/ 関数先頭 / コンポーネント先頭のいずれか

::: warning `cacheComponents` が無効な状態で `"use cache"` を書くとビルドエラー
`next.config.ts` で `cacheComponents: true` を入れていない状態で `"use cache"` を書くと、ビルド時にエラーが出て動きません。本レッスンの演習では使わないので、`fetch` オプションで練習します。
:::

### まとめると

| 目的 | 書き方 |
|---|---|
| キャッシュしない（デフォルト） | `fetch(url)` そのまま |
| ずっとキャッシュ | `fetch(url, { cache: "force-cache" })` |
| N 秒ごとに再取得 | `fetch(url, { next: { revalidate: N } })` |
| タグで手動無効化 | `fetch(url, { next: { tags: ["name"] } })` |
| タグのキャッシュを切る | `revalidateTag("name")` （Server Action 内から） |
| パスのキャッシュを切る | `revalidatePath("/path")` （Server Action 内から） |
| 関数・コンポーネント単位でキャッシュ | `"use cache"` + `cacheLife` + `cacheTag` |

## 演習

### 途中から始める場合

lesson74 で作った `/posts` ページがあることを前提にします。手元になければ新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の出発点ファイルを作ってから始めてください。

<details>
<summary>出発点: <code>app/posts/page.tsx</code></summary>

```tsx
type Post = {
  id: number;
  title: string;
  body: string;
};

export default async function PostsPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await res.json();

  return (
    <>
      <h1>記事一覧</h1>
      <ul>
        {posts.slice(0, 10).map((post) => (
          <li key={post.id}>
            <strong>#{post.id}</strong> {post.title}
          </li>
        ))}
      </ul>
    </>
  );
}
```

</details>

### 前回のプロジェクトを開く

lesson74 で作ったプロジェクトを開き直しましょう。

### 手順 1: 時間ベースキャッシュを付ける

`app/posts/page.tsx` の `fetch` に `{ next: { revalidate: 60 } }` を追加します。

```tsx
type Post = {
  id: number;
  title: string;
  body: string;
};

export default async function PostsPage() {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    { next: { revalidate: 60 } },
  );
  const posts: Post[] = await res.json();

  return (
    <>
      <h1>記事一覧</h1>
      <ul>
        {posts.slice(0, 10).map((post) => (
          <li key={post.id}>
            <strong>#{post.id}</strong> {post.title}
          </li>
        ))}
      </ul>
    </>
  );
}
```

保存してページをリロードします。エラーが出なければ成功です。JSONPlaceholder のデータは変わらないので見た目の変化はありませんが、設定自体は有効になっています。

### 手順 2: タグ付きキャッシュに変える

`revalidate` の代わりにタグを使う書き方に変えます。

```tsx
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    { next: { tags: ["posts"] } },
  );
```

こちらもエラーが出なければ成功です。

### 手順 3: `force-cache` にしてみる

```tsx
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
    { cache: "force-cache" },
  );
```

エラーが出ないことを確認したら、`{ next: { revalidate: 60 } }` に戻しておきましょう。

### 期待出力

- 手順 1〜3 いずれでも `/posts` ページが正常に表示される
- StackBlitz のターミナルにエラーが出ない
- ブラウザの DevTools（F12 → Network タブ）で `jsonplaceholder.typicode.com` への直接リクエストが**出ていない**（サーバー側で fetch しているため、ブラウザは知らない）

### 変えてみる

1. `revalidate: 60` を `revalidate: 5` にしてみましょう。5 秒ごとに再取得する設定です（JSONPlaceholder は変わらないので見た目は変わりませんが、設定自体は機能します）
2. `{ next: { tags: ["posts"] } }` のタグ名を `"postList"` に変えても動きます。タグ名は自由な文字列です

### 自分で書く

`app/users/page.tsx`（lesson74 の「自分で書く」で作ったページ）の fetch に `{ next: { revalidate: 300 } }`（5 分）を付けましょう。ユーザー情報は記事より変わりにくいので、少し長い revalidate が向きます。

## まとめ

- Next.js のキャッシュは **Data Cache**（サーバー側 — fetch 結果を保管）と **Router Cache**（ブラウザ側 — ページを保管）の 2 層
- Next.js 15 以降、`fetch` のデフォルトはキャッシュしない。キャッシュしたいときは明示的に指定する
- `{ cache: "force-cache" }` は永続、`{ next: { revalidate: N } }` は時間ベース、`{ next: { tags: [...] } }` はタグで手動無効化
- `revalidatePath` / `revalidateTag` を Server Action から呼ぶとキャッシュが切れる。データを変えたら必ず呼ぶ
- Next.js 16 の `"use cache"` ディレクティブは関数・コンポーネント単位でキャッシュを設定できる新しい書き方
