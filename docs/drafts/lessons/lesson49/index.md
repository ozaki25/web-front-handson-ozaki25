# lesson49: エラーと見つからないページ

## ゴール

- レンダリング中に発生した例外を `error.tsx` で捕まえて、壊れた画面の代わりにエラー画面を出せます。
- `notFound()` を呼んで `not-found.tsx` を表示できます。
- `error.tsx` が担当する範囲と、Server Actions のフォームエラー（次の lesson51）の担当範囲が **別物** であることを理解しています。

## 解説

### ページの事故を 2 種類に分ける

Web アプリで出会う「いつもの画面が出ない」状況は、Next.js では次の 2 つに分けて扱います。

1. **存在しない URL / データ**: 記事 ID が存在しない、ユーザーが削除済みなど。→ `not-found.tsx`
2. **実行中の例外**: fetch が失敗、`throw new Error(...)` が飛んだ、など。→ `error.tsx`

この 2 つをそれぞれ専用のファイルで受け止めます。

### `not-found.tsx` と `notFound()`

該当データが見つからないときは、**`next/navigation`** から `notFound()` 関数を呼び出します。すると同じディレクトリ（またはその上位ディレクトリ）の `not-found.tsx` が表示されます。

```
app/
└── posts/
    └── [id]/
        ├── page.tsx
        └── not-found.tsx
```

```tsx
// app/posts/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  // ...探す
  const post = posts.find((p) => String(p.id) === id);
  if (!post) {
    notFound(); // ここで実行は止まり、not-found.tsx に切り替わる
  }
  return <div>{post.title}</div>;
}
```

- `notFound()` は呼ぶだけで良いです。`return` は書きません（書いても問題はありませんが、`notFound()` が例外を投げる仕組みで実行を止めるため、それ以降は走りません）。
- `not-found.tsx` はそのディレクトリに置きます。上位のディレクトリに置いておけば、配下のページ全部で共通利用できます。

### `error.tsx`

レンダリング中に `throw` された例外を捕まえるのが `error.tsx` です。**Client Component として書く必要があります**（`"use client"` が必要です）。エラーの情報とリトライ関数を props で受け取ります。

```
app/
└── posts/
    └── [id]/
        ├── page.tsx
        └── error.tsx
```

```tsx
"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div>
      <h1>問題が発生した</h1>
      <p>{error.message}</p>
      <button onClick={reset}>もう一度試す</button>
    </div>
  );
}
```

- 1 行目に `"use client"` を書きます。
- `error` は `Error` オブジェクトです。本番ビルドでは `message` は潰されます（情報漏れ防止）。開発中は読めます。
- `reset()` を呼ぶとページを再レンダリングしようとします。

### `error.tsx` の範囲は「レンダリング中」

ここが混同しやすいポイントです。**`error.tsx` はレンダリング中の例外だけを拾います**。

- Server Component の中で `throw` / `fetch` 失敗 → `error.tsx` で拾えます。
- Server Actions のフォーム送信で「空入力」のようなバリデーションエラー → `error.tsx` では **拾いません**。

Server Actions のフォームエラーは、例外を投げる代わりに **戻り値でエラー情報を返す** 設計になっています。次の lesson51 で扱う `useActionState` がその受け皿です。フォーム送信のエラーを `error.tsx` に落とそうとしても動かないので、混同しないでください。

まとめると:

| 事故の種類 | 担当 |
|---|---|
| 存在しない ID / ユーザー | `notFound()` + `not-found.tsx` |
| fetch 失敗・レンダリング中の `throw` | `error.tsx` |
| フォームの入力エラー | lesson51 の `useActionState`（戻り値） |

## 演習

### 前回のプロジェクトを開く

lesson48 で作ったプロジェクトを開き直しましょう。

### 手順 1: `not-found.tsx` を置く

`app/posts/[id]/not-found.tsx` を新規作成します。

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>記事が見つからない</h1>
      <p>指定された ID の記事は存在しない。</p>
      <Link href="/posts">一覧に戻る</Link>
    </>
  );
}
```

### 手順 2: 詳細ページで `notFound()` を呼ぶ

`app/posts/[id]/page.tsx` を書き換えます。見つからないときは `notFound()` を呼ぶ形に変更します。

```tsx
import { notFound } from "next/navigation";

type Post = {
  id: number;
  title: string;
  body: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await res.json();

  const post = posts.find((p) => String(p.id) === id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <h1>#{post.id} {post.title}</h1>
      <p>{post.body}</p>
    </>
  );
}
```

### 手順 3: `error.tsx` を置く

`app/posts/[id]/error.tsx` を新規作成します。

```tsx
"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <>
      <h1>読み込み中に問題が発生した</h1>
      <p>{error.message}</p>
      <button onClick={reset}>もう一度試す</button>
    </>
  );
}
```

### 手順 4: わざとエラーを起こす

`app/posts/[id]/page.tsx` の fetch URL をタイポで壊します（例: `typicodee`）。

```tsx
const res = await fetch("https://jsonplaceholder.typicodee.com/posts");
```

このままでは `res.json()` の手前で fetch が失敗し、例外が飛びます。`error.tsx` が表示されます。

### 期待出力

1. `/posts/1` にアクセス → タイポ URL のせいで `error.tsx` の「読み込み中に問題が発生した」が表示されます。
2. 「もう一度試す」ボタン → 同じエラーが再発します（URL を直さない限り）。
3. URL を正しい `typicode.com` に戻して再読み込み → 通常どおり記事が表示されます。
4. `/posts/999` にアクセス（存在しない ID）→ `not-found.tsx` の「記事が見つからない」と「一覧に戻る」リンクが表示されます。
5. エラー画面と not-found 画面は **別のファイルで扱われている** ことを確認しましょう。

### 変えてみる

1. `not-found.tsx` にイラストや再検索用のテキストを足して、よりユーザーに優しい表示にしましょう。
2. `error.tsx` の「もう一度試す」の下に `<Link href="/">トップに戻る</Link>` を追加しましょう。
3. `notFound()` を呼ぶ代わりに直接 `throw new Error("not found")` としてみましょう → `error.tsx` が出ることを確認します（`notFound()` を使わないと 404 ではなく 500 系扱いになる、という違いを体感できます）。

### 自分で書く

「存在しないユーザー ID のときの `not-found.tsx`」を `/users/[id]/` 配下に自力で追加してみましょう（lesson48 の「自分で書く」で `/users/[id]/page.tsx` を作っていればその続きです）。見た目は posts 側と同じレベルで良いです。

## まとめ

- 「見つからない」ときは `notFound()` + `not-found.tsx` です。
- 「レンダリング中の例外」は `error.tsx` です（`"use client"` 必須）。
- 2 つは担当範囲が違います。フォーム送信エラーはどちらでもなく、次の lesson50 / 51 で学ぶ `useActionState` の戻り値で扱います。
- 次の lesson50 では、フォームをサーバー側の関数（Server Actions）で受け取る仕組みを作り始めます。
