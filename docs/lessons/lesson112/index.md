# lesson112: React Hook Form の基本

## ゴール

- 制御コンポーネント（`useState` で都度更新）と React Hook Form（RHF）の違いを説明できる
- RHF を `npm install` してフォームに導入できる
- `useForm` / `register` / `handleSubmit` の最小パターンを書ける
- バリデーション（必須 / 最大長 / パターン）を `register` のオプションで書ける
- `formState.errors` でエラーメッセージを表示できる
- `defaultValues` で初期値を入れる
- `watch` / `setValue` / `reset` の使い分けを知る

## 解説

### 制御コンポーネントの限界

これまでのレッスンでは、入力欄ごとに `useState` を持って `onChange` で更新する **制御コンポーネント** を書いてきました。

```tsx
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");
// ...
<input value={name} onChange={(e) => setName(e.target.value)} />
<input value={email} onChange={(e) => setEmail(e.target.value)} />
<textarea value={message} onChange={(e) => setMessage(e.target.value)} />
```

シンプルなフォームならこれで十分ですが、フィールドが 5〜10 個になると次の問題が出ます。

- **キーストロークごとに全コンポーネント再レンダリング**: 大きなフォームだと体感の遅延が出る
- **コードが冗長**: state と setter の宣言が増える
- **バリデーションが分散**: 各 onChange に if 文を書くと見通しが悪い
- **エラー状態の管理が手作業**: 「送信したらエラーを表示、入力したら消す」を自前で

これらを根本的に解決するのが **React Hook Form**（以下 RHF）です。

### React Hook Form とは

RHF は **非制御** ベースのフォームライブラリで、内部で `ref` を使って DOM の値を直接読みます。React の状態に閉じ込めないので:

- **入力中の再レンダリングがほぼゼロ**（パフォーマンスが良い）
- **少ないコード** で大きなフォームを書ける
- **バリデーション + エラー管理** が組み込み

2026 年現在、React のフォームライブラリのデファクトです。サードパーティ UI（Material UI / Mantine / shadcn/ui 等）との統合も豊富。

### インストール

```bash
npm install react-hook-form
```

### 最小のフォーム

`useForm` でフォームインスタンスを作り、`register` で各 input を登録します。

```tsx
import { useForm } from "react-hook-form";

type FormValues = {
  name: string;
  email: string;
};

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  function onSubmit(data: FormValues) {
    console.log(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">お名前</label>
        <input
          id="name"
          aria-required="true"
          aria-invalid={errors.name ? "true" : "false"}
          {...register("name", { required: "必須です" })}
        />
        {errors.name && <p role="alert">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">メール</label>
        <input
          id="email"
          type="email"
          aria-required="true"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email", { required: "必須です" })}
        />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        送信
      </button>
    </form>
  );
}
```

主な要素:

- **`useForm<FormValues>()`**: ジェネリクスでフォームの型を渡す
- **`register("name", options)`**: input を RHF に登録。スプレッド `{...register(...)}` で `ref` / `onChange` / `onBlur` / `name` がまとめて適用される
- **`handleSubmit(onSubmit)`**: フォーム全体のバリデーションが通ったら `onSubmit(data)` を呼ぶ
- **`formState.errors`**: バリデーションエラーが格納される
- **`formState.isSubmitting`**: 送信中フラグ（`onSubmit` が async なら自動で true）

### バリデーションオプション

`register` の第 2 引数で各種ルールを指定できます。

```tsx
{...register("password", {
  required: "パスワードは必須です",
  minLength: { value: 8, message: "8 文字以上で入力してください" },
  maxLength: { value: 100, message: "100 文字以内で入力してください" },
  pattern: {
    value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
    message: "英字と数字を混ぜてください",
  },
})}
```

`required` / `minLength` / `maxLength` / `pattern` / `validate`（カスタム関数）が代表的です。

```tsx
{...register("age", {
  validate: (value) => {
    if (value < 18) return "18 歳以上である必要があります";
    if (value > 120) return "値が大きすぎます";
    return true; // OK
  },
})}
```

### `defaultValues` で初期値

編集画面のように **既存値をプリセット** したい場合は `defaultValues` を使います。

```tsx
const { register, handleSubmit } = useForm<FormValues>({
  defaultValues: {
    name: "Alice",
    email: "alice@example.com",
  },
});
```

非同期で取得した値を初期値にしたい場合は `reset(...)` で後から差し替え:

```tsx
const { register, handleSubmit, reset } = useForm<FormValues>();

useEffect(() => {
  fetch("/api/me")
    .then((r) => r.json())
    .then((user) => reset(user));
}, [reset]);
```

### `watch` で値を購読

特定フィールドの値を **監視して再レンダリング** したい場合は `watch`:

```tsx
const { watch, register } = useForm<FormValues>();
const subscribe = watch("subscribe");

return (
  <>
    <label>
      <input type="checkbox" {...register("subscribe")} />
      購読する
    </label>

    {subscribe && (
      <div>
        <label>頻度</label>
        <select {...register("frequency")}>
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
        </select>
      </div>
    )}
  </>
);
```

`watch` は **その field が変わるたび** にコンポーネントを再レンダリングします。RHF が「再レンダリングを最小化する」設計なので、`watch` を使う箇所だけ反応する形です。

### `setValue` でプログラム的に値を設定

```tsx
const { setValue } = useForm<FormValues>();

// 別のボタンや非同期処理から値を入れる
setValue("name", "Bob");
```

「住所オートコンプリートで郵便番号から市区町村を埋める」のような場面で使います。

### `reset` でフォームを初期化

送信成功後にフォームを空にする:

```tsx
async function onSubmit(data: FormValues) {
  await fetch("/api/contact", { method: "POST", body: JSON.stringify(data) });
  reset();  // 入力をクリア
}
```

### 送信中の表示

`isSubmitting` で送信中フラグが取れます。これでボタン無効化・「送信中...」表示が簡単。

```tsx
const { handleSubmit, formState: { isSubmitting } } = useForm<FormValues>();

return (
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "送信中..." : "送信"}
  </button>
);
```

`onSubmit` が async（`Promise` を返す）なら、その完了まで `isSubmitting` が true に保たれます。

### アクセシブルなエラー表示

「アクセシビリティの自動チェック」で扱った `aria-invalid` / `aria-describedby` と組み合わせると a11y 対応になります。

```tsx
<input
  id="email"
  type="email"
  aria-invalid={errors.email ? "true" : "false"}
  aria-describedby={errors.email ? "email-error" : undefined}
  {...register("email", { required: "メールは必須です" })}
/>
{errors.email && (
  <p id="email-error" role="alert">
    {errors.email.message}
  </p>
)}
```

これでスクリーンリーダーが「メール、必須、エラー: メールは必須です」と読み上げてくれます。

### エラー表示は色だけに頼らない

フォームのエラー文を **赤色だけ** で知らせる UI は、**色覚特性を持つ人** や **コントラストが低いディスプレイ** で見落としやすくなります。次の 3 点を組み合わせるのが堅い書き方です。

1. **AA 基準のコントラスト**: `color: red` は環境によって背景とのコントラスト比が 4.5:1 を割ります。`#b91c1c`（ライト背景向け）/ `#fca5a5`（ダーク背景向け）のような **AA を満たす色** に置き換え、CSS で定義します
2. **テキストでも知らせる**: 「エラー: 」という接頭辞、`!` アイコン、`<strong>` などの強調を併用すると、色が見えなくても伝わります
3. **`role="alert"` で読み上げ**: スクリーンリーダーには `role="alert"` を付けた要素が即座に通知される（既に上の例で実施済み）

CSS 例:

```css
.form-error {
  color: #b91c1c;
}
@media (prefers-color-scheme: dark) {
  .form-error {
    color: #fca5a5;
  }
}
```

## 演習

### ゴール

- React + TS プロジェクトに RHF を導入する
- 「お問い合わせフォーム」を作る（名前 / メール / メッセージ）
- 必須 / メールパターン / 最大長 のバリデーションを実装
- 送信時に「送信中...」、成功で「送信しました！」を表示

### 途中から始める場合

これまでに作ったフォーム関連レッスン（**フォームと制御コンポーネント** など）のプロジェクトを継ぐか、新規に Vite + React + TS テンプレートを作成。

```bash
npm create vite@latest rhf-sample -- --template react-ts
cd rhf-sample
npm install
npm install react-hook-form
```

### `src/ContactForm.tsx`

> **`form-error` クラス**: 下のテンプレでは `<p className="form-error">` を使っています。`src/index.css`（または `App.css`）に上の「補足: エラー表示は色だけに頼らない」の CSS スニペットを追加してから動かしてください。

```tsx
import { useForm } from "react-hook-form";
import { useState } from "react";

type FormValues = {
  name: string;
  email: string;
  message: string;
};

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit(data: FormValues) {
    // 実際は fetch で送信。ここでは 1 秒待つだけ
    await new Promise((r) => setTimeout(r, 1000));
    console.log("送信:", data);
    setSubmitted(true);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1>お問い合わせ</h1>

      <div>
        <label htmlFor="name">お名前</label>
        <input
          id="name"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name", {
            required: "お名前は必須です",
            maxLength: { value: 50, message: "50 文字以内で入力してください" },
          })}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="form-error">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">メール</label>
        <input
          id="email"
          type="email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email", {
            required: "メールは必須です",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "メールアドレスの形式が正しくありません",
            },
          })}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="form-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message">メッセージ</label>
        <textarea
          id="message"
          rows={4}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message", {
            required: "メッセージは必須です",
            minLength: { value: 10, message: "10 文字以上で入力してください" },
          })}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="form-error">
            {errors.message.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "送信"}
      </button>

      {submitted && <p style={{ color: "green" }}>送信しました！</p>}
    </form>
  );
}
```

### `src/App.tsx`

```tsx
import { ContactForm } from "./ContactForm";

export default function App() {
  return <ContactForm />;
}
```

### 期待出力

- 何も入れずに送信 → 全フィールドにエラーが赤字で出る
- メールに `abc` を入れて送信 → メール形式エラー
- 全部正しく入れて送信 → ボタンが「送信中...」になり、1 秒後に「送信しました！」表示 + 入力欄がクリア
- DevTools の Console に送信値が出る

`noValidate` を `<form>` に付けているのは、ブラウザ標準のバリデーション UI を抑制し、RHF + 自前のメッセージ表示に統一するためです。

### 変える

- `register` の `required: true`（メッセージなし）に変えてみる。エラーは出るが `errors.name.message` が `undefined` になり、デフォルトメッセージが表示されない
- 入力欄を `{...register("phone")}` で 1 つ追加し、バリデーションなしで動かす
- `defaultValues` を `useForm` に渡して、初期値「お名前: Anonymous」を入れてみる

### 自分で書く

- 「住所」フィールド（郵便番号 / 都道府県 / 市区町村）を追加し、`watch` で郵便番号の入力を監視。7 桁入力したら（mock として）固定の都道府県・市区町村を `setValue` で埋める
- `useFieldArray` で「複数の電話番号を追加できる」フォームに発展させる（公式ドキュメント参照: <https://react-hook-form.com/docs/usefieldarray>）

## まとめ

- 制御コンポーネント（useState）はキーストロークごとに再レンダリング → 大きいフォームで遅くなる
- **React Hook Form**（RHF） は ref ベースの非制御で軽量。大規模フォームの定番
- 基本: `useForm()` で取った `register` / `handleSubmit` / `formState`
- バリデーションは `register` の第 2 引数で `required` / `minLength` / `maxLength` / `pattern` / `validate`
- エラー表示は `formState.errors.field.message`、a11y 用の `aria-invalid` / `aria-describedby` と組み合わせる
- `defaultValues` / `reset` / `watch` / `setValue` で実用的な操作
- `isSubmitting` で送信中の UI 制御
- 別のレッスンでは **Zod** で型安全な複雑バリデーションに進み、サーバーとの連携も統一する
