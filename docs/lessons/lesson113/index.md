# lesson113: Zod でスキーマバリデーション

## ゴール

- なぜ TS の型だけでは不十分かを説明できる（外部入力の検証）
- Zod のスキーマ定義（`z.object` / `z.string` / `z.number` / `z.array`）が書ける
- `parse` / `safeParse` の違いと使いどころを知る
- `z.infer<typeof schema>` で型を自動導出できる
- React Hook Form と組み合わせて型安全なフォームを作れる
- API レスポンスの検証や Server Actions の入力検証にも応用できる
- Valibot / Arktype など代替ライブラリの存在を知る

## 解説

### TypeScript の型だけでは足りない

TypeScript の型は **コンパイル時** にしか効きません。**実行時には消えます**。

```ts
type User = { id: number; name: string };

async function getUser(): Promise<User> {
  const res = await fetch("/api/user");
  return res.json();   // 本当に User 型？
}
```

`.json()` の戻り値は `any` で、サーバーが何を返してきたかは TS には分かりません。型を信じて使うと、想定外のレスポンスでアプリが落ちます。

実行時に検証できる仕組みが要ります。これが **ランタイムバリデーション**。代表が **Zod** です。

### Zod とは

Zod は **TypeScript 第一** のスキーマ宣言・検証ライブラリです。スキーマを書くと:

1. **実行時バリデーション**: 不正な値を弾く
2. **TypeScript 型を自動生成**: `z.infer<typeof schema>` で取れる

「型定義 + バリデーション」を 1 箇所に集約できるのが最大の強みです。

### インストール

```bash
npm install zod
```

### 基本のスキーマ

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  age: z.number().int().min(0).max(150),
  isAdmin: z.boolean(),
});

type User = z.infer<typeof UserSchema>;
// 上の type は { id: number; name: string; email: string; age: number; isAdmin: boolean } と等価
```

`z.string()` / `z.number()` / `z.boolean()` のような **プリミティブ** から始め、`z.object` でまとめます。

### 組み込み修飾メソッド

```ts
z.string().min(1, "必須です").max(100, "100 文字以内")  // 文字数制限
z.email("メール形式で")                                 // メール（v4 から top-level）
z.url("URL 形式で")                                    // URL（v4 から top-level）
z.string().regex(/^\d{3}-\d{4}$/, "郵便番号の形式で")    // 正規表現
z.number().int("整数で").positive("正の数で")           // 整数 + 正
z.number().min(0).max(100)                             // 範囲
z.string().optional()                                   // string | undefined
z.string().nullable()                                   // string | null
z.string().default("デフォルト")                        // デフォルト値
```

> **Zod v4（2025 リリース）の変更点**: `z.string().email()` / `.url()` / `.uuid()` / `.datetime()` は v4 で **top-level の `z.email()` / `z.url()` / `z.uuid()` / `z.iso.datetime()` に再編** されました。v3 系の書き方も互換のため動きますが、新規コードは v4 形式が推奨です。

### 配列とユニオン

```ts
const TodoSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  status: z.enum(["open", "doing", "done"]),  // 文字列リテラルのユニオン
  tags: z.array(z.string()),
  createdAt: z.iso.datetime(),                // ISO 8601
});

type Todo = z.infer<typeof TodoSchema>;
```

### `parse` と `safeParse`

スキーマで値を検証する 2 つの方法:

#### `parse`: 失敗時に例外を投げる

```ts
try {
  const user = UserSchema.parse(data);
  console.log(user.name);  // 型は User
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log(err.issues);  // どこで失敗したかの詳細
  }
}
```

#### `safeParse`: 失敗時にも値を返す

```ts
const result = UserSchema.safeParse(data);
if (result.success) {
  console.log(result.data.name);
} else {
  console.log(result.error.issues);
}
```

`safeParse` の方が `try / catch` を書かなくて済むので、フォームバリデーションには向いています。

### React Hook Form と統合

`@hookform/resolvers` を入れると、Zod スキーマがそのまま RHF のバリデーションに使えます。

```bash
npm install @hookform/resolvers
```

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1, "お名前は必須です").max(50, "50 文字以内"),
  email: z.email("メールアドレスの形式が正しくありません"),
  age: z.coerce.number().int("整数で").min(18, "18 歳以上"),
  message: z.string().min(10, "10 文字以上で入力してください"),
});

type ContactFormValues = z.infer<typeof ContactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
  });

  function onSubmit(data: ContactFormValues) {
    console.log("検証済みデータ:", data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input {...register("name")} />
      {errors.name && <p>{errors.name.message}</p>}

      <input type="email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="number" {...register("age")} />
      {errors.age && <p>{errors.age.message}</p>}

      <textarea {...register("message")} />
      {errors.message && <p>{errors.message.message}</p>}

      <button type="submit" disabled={isSubmitting}>送信</button>
    </form>
  );
}
```

利点:

- **スキーマ 1 箇所で定義** すれば型もバリデーションも揃う
- **`age` のような数値** も `z.coerce.number()` で `<input type="number">` の文字列を自動変換
- **エラーメッセージ** が日本語で出せる

### `z.coerce` で型変換

`<input>` の値はすべて文字列です。数値や日付として扱うには変換が必要。

```ts
z.coerce.number()       // 文字列 → 数値
z.coerce.boolean()      // 文字列 / 数値 → boolean
z.coerce.date()         // 文字列 → Date
```

### API レスポンスの検証

サーバーから返ってきたデータが想定通りかを検証します。

```ts
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("取得失敗");
  const data = await res.json();
  return UserSchema.parse(data);   // スキーマに合わなければ ZodError
}
```

これで API 仕様変更による不正レスポンスを早期に検知できます。

### Server Actions / Route Handlers の入力検証

**「Server Actions の最小形」「Route Handlers」** で扱った Server Actions / Route Handlers の引数は外部入力なので、必ず検証すべきです。

```ts
"use server";

import { z } from "zod";

const AddTodoSchema = z.object({
  text: z.string().min(1).max(200),
});

export async function addTodo(formData: FormData) {
  const result = AddTodoSchema.safeParse({
    text: formData.get("text"),
  });
  if (!result.success) {
    return { ok: false as const, error: result.error.issues[0].message };
  }
  // 検証済みの result.data.text を使う
  await db.insertTodo(result.data.text);
  return { ok: true as const };
}
```

### よくあるパターン

#### refine: 複数フィールド間のチェック

```ts
const SignupSchema = z.object({
  password: z.string().min(8),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "パスワードが一致しません",
  path: ["passwordConfirm"],  // エラーをこのフィールドに紐付け
});
```

#### transform: 値を加工

```ts
const TrimmedString = z.string().transform((s) => s.trim());

TrimmedString.parse("  hello  "); // "hello"
```

### 代替ライブラリ

| ライブラリ | 特徴 |
|---|---|
| **Zod** | デファクト。エコシステム最大 |
| **Valibot** | バンドルサイズが小さい（10x 軽量）。書き味も似ている |
| **ArkType** | TypeScript 風の構文（`"string"` ではなく `string`）。型推論が強力 |
| **Yup** | 古参。React Hook Form 公式の最初のサンプルが Yup だった |

新規プロジェクトでは **Zod が第一候補**、バンドルサイズが厳しいなら **Valibot** を検討。

## 演習

### ゴール

- 「React Hook Form の基本」の演習で作った `ContactForm` を Zod ベースに書き換える
- スキーマから型を自動導出する
- フォーム外の利用例として、`fetch` のレスポンスを Zod で検証する

### 手順 1: 依存追加

```bash
npm install zod @hookform/resolvers
```

### 手順 2: スキーマ + 型を定義

`src/contact-schema.ts`:

```ts
import { z } from "zod";

export const ContactSchema = z.object({
  name: z
    .string()
    .min(1, "お名前は必須です")
    .max(50, "50 文字以内で入力してください"),
  email: z
    .string()
    .min(1, "メールは必須です")
    .email("メールアドレスの形式が正しくありません"),
  message: z
    .string()
    .min(10, "10 文字以上で入力してください")
    .max(1000, "1000 文字以内で入力してください"),
});

export type ContactFormValues = z.infer<typeof ContactSchema>;
```

### 手順 3: フォームを書き換え

`src/ContactForm.tsx`:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ContactSchema, type ContactFormValues } from "./contact-schema";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
  });

  async function onSubmit(data: ContactFormValues) {
    await new Promise((r) => setTimeout(r, 500));
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
          {...register("name")}
        />
        {errors.name && <p role="alert" style={{ color: "red" }}>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">メール</label>
        <input
          id="email"
          type="email"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email")}
        />
        {errors.email && <p role="alert" style={{ color: "red" }}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="message">メッセージ</label>
        <textarea
          id="message"
          rows={4}
          aria-invalid={errors.message ? "true" : "false"}
          {...register("message")}
        />
        {errors.message && <p role="alert" style={{ color: "red" }}>{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "送信"}
      </button>

      {submitted && <p style={{ color: "green" }}>送信しました！</p>}
    </form>
  );
}
```

### 手順 4: API レスポンス検証の例

`src/api.ts`:

```ts
import { z } from "zod";

const PostSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  body: z.string(),
  userId: z.number().int(),
});

export type Post = z.infer<typeof PostSchema>;

const PostListSchema = z.array(PostSchema);

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!res.ok) throw new Error("取得失敗");
  const data = await res.json();
  return PostListSchema.parse(data);   // 不正な構造なら ZodError
}
```

これで API レスポンスの構造が変わってもすぐ気付けます。

### 期待出力

- フォームのバリデーションが Zod ベースで動く（手書きの `register("name", { required, ... })` を書かない）
- 「メール形式エラー」「10 文字以上」「50 文字以内」が日本語で表示される
- `ContactFormValues` 型は `z.infer<typeof ContactSchema>` から自動生成され、IDE の補完も効く
- API 検証で `parse` が成功すれば型付きデータ、失敗すれば例外

### 変える

- `ContactSchema` に `tel: z.string().regex(/^\d{2,4}-\d{2,4}-\d{3,4}$/, "電話番号の形式で")` を追加して、電話番号フィールドを足す
- `z.email()` を `z.string().regex(/.../)` に書き換えて、独自パターンを使う
- `safeParse` で書き換えてみる（fetchPosts を `try / catch` 不要にする）

### 自分で書く

- `password` と `passwordConfirm` の一致チェックを `refine` で書く
- 18 歳以上に限定する `birthday: z.coerce.date()` フィールドを追加し、`refine` で「今日から 18 年前以前」を検証

### 自分で書く（既存の TODO アプリを継承する）

**「小さなアプリを統合する」** で書いた `addTodo` / `deleteTodo`（`actions.ts`）に Zod を導入してみましょう。これは **本コースの螺旋反復で「同じ TODO アプリの安全性を一段上げる」** 演習です。

1. `actions.ts` の冒頭に Zod スキーマを定義:

   ```ts
   import { z } from "zod";

   const AddTodoSchema = z.object({
     text: z.string().min(1, "内容を入力してください").max(200, "200 文字以内"),
   });
   ```

2. `addTodo` の中で `safeParse` する形に書き換える（既存の `if (!text) ...` 検証を Zod に置き換え）:

   ```ts
   export async function addTodo(prev: AddTodoResult, formData: FormData): Promise<AddTodoResult> {
     const result = AddTodoSchema.safeParse({ text: formData.get("text") });
     if (!result.success) {
       return { ok: false, error: result.error.issues[0].message };
     }
     // result.data.text を使う
     ...
   }
   ```

3. `useActionState` で受けるエラー表示はそのまま動きます（型 `AddTodoResult` を変えていないため）。

4. 削除 (`deleteTodo`) も同じ流れで Zod 化できます（`id: z.uuid()` などが書けます）。

これで「フォーム → Server Action → Zod 検証 → DB」の現代的なパイプラインが完成します。

## まとめ

- TS の型は実行時に消える。外部入力（API / フォーム）には **ランタイムバリデーション** が必要
- **Zod** はスキーマで型と検証を 1 箇所にまとめる現代の定番
- 基本: `z.object` / `z.string` / `z.number` / `z.array` / `z.enum`
- 修飾: `min` / `max` / `email` / `regex` / `optional` / `default`
- `parse`（例外）/ `safeParse`（戻り値）の使い分け
- **`z.infer<typeof schema>`** で型を自動導出
- **`zodResolver`** で React Hook Form と統合し、スキーマ 1 つでフォーム + 型が完成
- API レスポンス検証 / Server Actions 入力検証 にも同じスキーマを再利用
- 代替: Valibot（軽量）/ ArkType（型推論強力）/ Yup（古参）
- 別のレッスンで **状態管理の地図（TanStack Query / Zustand / Jotai）** に進み、サーバー状態とクライアント状態の選択肢を整理する
