# lesson82: useFormStatus で送信中を無効化する

## ゴール

- `useFormStatus` を `react-dom` から import し、送信中に `pending: true` になることを確認できる
- `<form>` の子孫コンポーネントの中からのみ呼べる制約を説明できる
- `useActionState`（`react`）と `useFormStatus`（`react-dom`）の import 元の違いを覚えられる

## 解説

### なぜ送信中に `disabled` にするか

フォームを送信してサーバーが応答を返すまでの間、ユーザーが「追加」ボタンを連打できます。ネットワーク遅延があるときほど起きやすく、同じ TODO が重複して登録される原因になります。

送信中にボタンを `disabled` にしておけば、ユーザーは物理的に連打できなくなります。これが **二重送信防止** の基本的な UI 側の対策です。

> **補足**: UI 側の対策だけでは完全ではありません。ネットワーク断後の手動再送など、UI をバイパスした経路もあります。本番では Server 側でも冪等性（べきとう: 同じ操作を何回送っても結果が変わらない性質）を担保するのが作法です。このレッスンでは UI 側の対策を実装します。

### `useFormStatus` は `<form>` の子孫で呼ぶ

React DOM が提供するフック `useFormStatus` は、「自分が属している `<form>` の送信状態」を返します。

**重要な制約**: `<form>` を return しているコンポーネント自身の中では呼べません。その `<form>` の**子孫コンポーネント**の中で呼ぶ必要があります。

```tsx
// これは動かない: <form> を返しているコンポーネント自身で呼んでいる
export function TodoForm() {
  const { pending } = useFormStatus(); // 常に pending: false になる
  return <form action={formAction}>...</form>;
}
```

```tsx
// これが正しい: <form> の子コンポーネントの中で呼ぶ
function SubmitButton() {
  const { pending } = useFormStatus(); // 正しく pending が取れる
  return <button type="submit" disabled={pending}>追加</button>;
}

export function TodoForm() {
  return (
    <form action={formAction}>
      <SubmitButton /> {/* <form> の子 */}
    </form>
  );
}
```

### なぜ `SubmitButton` を別ファイルに切り出すか

`TodoForm.tsx` はすでに `"use client"` を付けているので、同じファイル内に `SubmitButton` を定義できます。ただし、実際のコードベースではボタンを独立したファイルに置くことで再利用しやすくなります。

このレッスンでは `app/todos/SubmitButton.tsx` として切り出します。

### import 元の違い

| フック | import 元 | 用途 |
|---|---|---|
| `useActionState` | `react` | フォームの状態管理 |
| `useFormStatus` | `react-dom` | 送信中の状態取得 |

見た目が似ていますが import 元が違います。間違えると「そんな export はない」というエラーが出ます。

## 演習

lesson81 で作った `TodoForm.tsx` を起点に進めます。lesson81 の演習が完了していることを前提にします。

### 手順の進め方

このレッスンは **2 つのファイル**（`app/todos/SubmitButton.tsx` の新規作成 / `app/todos/TodoForm.tsx` の書き換え）で完結します。`app/todos/page.tsx` と `app/actions.ts` は変更不要です。

### 手順 1: `SubmitButton.tsx` を新規作成する

`app/todos/SubmitButton.tsx` を新規作成します。

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "送信中..." : "追加"}
    </button>
  );
}
```

ポイント:

- **`useFormStatus` は `react-dom` から import** します（`react` ではありません）。
- `disabled={pending}` で送信中にボタンを操作不能にします。
- `{pending ? "送信中..." : "追加"}` でラベルも変えます。

### 手順 2: `TodoForm.tsx` の `<button>` を差し替える

`app/todos/TodoForm.tsx` を書き換えます。

```tsx
"use client";

import { useActionState } from "react";
import { addTodo, type AddTodoState } from "../actions";
import { SubmitButton } from "./SubmitButton";

const initialState: AddTodoState = { ok: true };

export function TodoForm() {
  const [state, formAction] = useActionState(addTodo, initialState);

  return (
    <form action={formAction}>
      <input type="text" name="text" placeholder="やることを入力" />
      <SubmitButton />
      {state.ok === false && <p className="error">{state.error}</p>}
    </form>
  );
}
```

変更点は `<button type="submit">追加</button>` を `<SubmitButton />` に差し替えただけです。`useActionState` の使い方は lesson81 と同じです。

### 期待出力

- 「追加」ボタンを押すと、一瞬ボタンがグレーアウトして押せなくなり、ラベルが「送信中...」に変わります。
- サーバーの応答が返ってくると、ボタンが元に戻ります。
- ネットワークが速い環境では変化が一瞬すぎて見えないこともあります。DevTools の Network タブで「Throttling: Slow 3G」を選んで送信すると確認しやすいです。

### よくある間違い

- `useFormStatus` を `react` から import して「export がない」エラーになる → `react-dom` から import します。
- `TodoForm` コンポーネント自身の中で `useFormStatus()` を呼んで `pending` が常に `false` になる → `<form>` の子孫コンポーネントに切り出して呼びます。
- `<SubmitButton>` に `"use client"` を付け忘れる → フックを使うコンポーネントには `"use client"` が必要です。

### 変えてみる

1. `SubmitButton` の「送信中...」の文言を自分の好きな表現に変えましょう（「追加中です」「お待ちください」など）。
2. `pending` のとき `aria-busy={true}` を button に付けてみましょう（スクリーンリーダーへの対応です）。

### 自分で書く

`SubmitButton` に CSS を追加して、`disabled` 状態のときに `opacity: 0.5` で薄く見えるようにしましょう。

```css
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

これを `app/globals.css` か `SubmitButton.tsx` のインラインスタイルで適用してみましょう。ダークモードでも同じ挙動になることを確認してください。

## まとめ

- `useFormStatus` は `react-dom` から import する
- `<form>` の子孫コンポーネント内でのみ呼べる（フォーム本体で呼んでも `pending` が取れない）
- `useActionState`（`react`）は状態管理、`useFormStatus`（`react-dom`）は送信中ステータスの取得と、役割が異なる
- `SubmitButton` を切り出すことで `useFormStatus` が正しく動き、再利用もしやすくなる
