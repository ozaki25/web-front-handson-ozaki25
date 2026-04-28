# lesson117: フィーチャーフラグ

## ゴール

- フィーチャーフラグが「**デプロイ** と **機能公開** を分離する」考え方であることを説明できる
- 環境変数ベースの最小実装ができる
- ロールアウト（10% → 50% → 100%）の意義を理解する
- LaunchDarkly / GrowthBook / Vercel Edge Config / Statsig の位置付けが分かる
- A/B テストとフィーチャーフラグの違いと重なりを説明できる

## 解説

### 背景: 「リリース」と「公開」を切り離したい

新機能をリリースすると、次の不安が常に付きまといます。

- **本番で初めて壊れたら？**
- **想定外のトラフィックで重くなったら？**
- **特定ユーザーだけが踏むバグがあったら？**

従来の「**ビルドして本番にデプロイ → 全ユーザーに公開**」は、不具合が出た瞬間に **ロールバックしか選択肢がない** という弱さがあります。

フィーチャーフラグ（Feature Flag、Feature Toggle）は **「コードはデプロイ済み、機能は OFF」の状態を作る** 仕組みです。

```
[ デプロイ ]──────────────[ 機能公開 ]
     │                         │
     ↓                         ↓
  GitHub で merge          管理画面で ON
   = 全ユーザーに            = 特定の人 / %
     コードが届く              に出す
```

これによって:

- **5% に出してから様子を見る**
- **問題が出たら 1 クリックで戻す**（ビルド不要）
- **社内ユーザーだけ先行公開**
- **A/B テスト**（バリアント A と B の効果を比較）

### 最小実装: 環境変数で

「とりあえず ON / OFF を切り替えたい」だけなら、**環境変数 1 つ** で十分です。Server Component で評価する形がもっとも安全です。

```ts
// .env.production
NEW_CHECKOUT=false
```

```tsx
// app/checkout/page.tsx (Server Component)
export default function CheckoutPage() {
  if (process.env.NEW_CHECKOUT === "true") {
    return <NewCheckout />;
  }
  return <LegacyCheckout />;
}
```

> **補足: `NEXT_PUBLIC_` プレフィックスはクライアントに丸見え**: `NEXT_PUBLIC_` で始まる環境変数は **ビルド時にクライアントバンドルに埋め込まれます**。ブラウザの DevTools で JS を眺めれば値も変数名もそのまま見えます。`NEXT_PUBLIC_NEW_CHECKOUT` のようにフラグ名を `NEXT_PUBLIC_` で出すと「未公開機能の存在」「フラグ名の命名規則」がエンドユーザーに漏れる事故になります。**Server Component で評価できる場合はプレフィックスなしの `process.env.NEW_CHECKOUT`** を使い、どうしても Client Component で参照したい場合だけ `NEXT_PUBLIC_` を付けます。

メリット:

- 何も足さずに始められる
- ビルド時に値が **インライン** されるので実行時オーバーヘッドゼロ

デメリット:

- 切り替えに **再ビルド + デプロイ** が必要（瞬時には変えられない）
- ユーザー単位で出し分けできない
- A/B テストには使えない

「**動作確認用 / 開発中の機能を本番に隠す**」程度なら環境変数で十分。**運用で柔軟に切り替えたい** なら次のステップへ。

### 中規模実装: 設定をリモート管理

ビルドし直さずに切り替えたいなら、**フラグの値を外部から取得** します。

```ts
// utils/flags.ts
type Flags = { newCheckout: boolean; aiSummary: boolean };

let cached: Flags | null = null;

export async function getFlags(): Promise<Flags> {
  if (cached) return cached;
  const res = await fetch("https://api.example.com/flags", { cache: "no-store" });
  cached = await res.json();
  return cached!;
}
```

```tsx
// app/page.tsx
import { getFlags } from "@/utils/flags";

export default async function Home() {
  const flags = await getFlags();
  return flags.newCheckout ? <NewCheckout /> : <LegacyCheckout />;
}
```

API のバックエンドは:

- 自前のテーブル（Postgres / Redis）
- **Vercel Edge Config**（Vercel 公式の超低遅延 KV）
- Cloudflare KV / R2

Vercel Edge Config の例:

```ts
import { get } from "@vercel/edge-config";

const newCheckout = await get<boolean>("newCheckout");
```

**ms 単位で読める** ので、ページレンダリングの先頭で読んでも遅くなりません。

### ユーザーに紐付くロールアウト

「10% に出す」「特定の社員だけに出す」を実現するには **ユーザー識別子** が要ります。

```ts
function isFeatureEnabled(userId: string, percent: number): boolean {
  // ユーザー ID をハッシュ → 0〜99 にマップ
  const hash = simpleHash(userId) % 100;
  return hash < percent;
}

const enabled = isFeatureEnabled(currentUser.id, 10); // 10% の人だけ true
```

ハッシュベースだと、**同じユーザーは毎回同じ結果**（再現性）が得られます。「今回は ON、次回は OFF」を防げる。

### SaaS の選択肢

機能が複雑になると自前は辛いので SaaS を使います。

| サービス | 特徴 |
|---|---|
| **LaunchDarkly** | エンタープライズ標準。機能フラグ + 実験機能 + 監査ログ。価格は高め |
| **GrowthBook** | OSS + クラウド。**A/B テスト統計が強い**。コスパ良し |
| **Statsig** | フラグ + 実験 + プロダクト分析統合。Meta 出身チーム |
| **Flagsmith** | OSS / セルフホスト可能 |
| **Vercel Edge Config + Vercel Toolbar** | Vercel 内製の軽量フラグ |
| **PostHog Feature Flags** | Analytics と統合 |

#### LaunchDarkly の最小例

```bash
npm install launchdarkly-react-client-sdk
```

```tsx
import { withLDProvider, useFlags } from "launchdarkly-react-client-sdk";

function App() {
  const flags = useFlags();
  return flags.newCheckout ? <NewCheckout /> : <LegacyCheckout />;
}

export default withLDProvider({
  clientSideID: process.env.NEXT_PUBLIC_LD_CLIENT_ID!,
  context: { kind: "user", key: "user-123", email: "user@example.com" },
})(App);
```

管理画面で「`newCheckout` を 5% に」と設定すれば、再デプロイなしで反映。

> **補足: 環境ごとに SDK key を分ける**: フラグ SaaS では **Production / Preview / Development それぞれに別の SDK key を発行** できます。同じ key を全環境で使い回すと、Preview デプロイの動作確認が **本番フラグの評価ログを汚す**、A/B テストの母数に開発者の挙動が混ざる、本番フラグを誤って Preview から ON にしてしまう、といった事故になります。Vercel なら `Settings → Environment Variables` で `NEXT_PUBLIC_LD_CLIENT_ID` を **Production / Preview / Development の 3 つに分けて設定する** のが定石です。

#### GrowthBook の最小例

```bash
npm install @growthbook/growthbook-react
```

```tsx
import { GrowthBook, GrowthBookProvider, useFeatureIsOn } from "@growthbook/growthbook-react";

const gb = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: process.env.NEXT_PUBLIC_GB_CLIENT_KEY,
  attributes: { id: currentUser.id },
});

await gb.loadFeatures();

function NewCheckoutGuard() {
  const enabled = useFeatureIsOn("new-checkout");
  return enabled ? <NewCheckout /> : <LegacyCheckout />;
}

<GrowthBookProvider growthbook={gb}>
  <NewCheckoutGuard />
</GrowthBookProvider>
```

### A/B テストとの関係

フィーチャーフラグは「**ON か OFF か**」、A/B テストは「**A 案と B 案、どちらの効果が高いか**」を測るもの。

実装は近く、フラグ系 SaaS は両方こなします。

```ts
// バリアント割当
const variant = useExperiment("checkout-flow"); // "control" or "v2"

return variant === "v2" ? <NewCheckout /> : <LegacyCheckout />;
```

A/B テストは **統計的な有意差** の判定が必要なので、SaaS の機能（Bayesian / Frequentist のテスト統計）を活用します。

### Kill Switch（緊急停止）

フィーチャーフラグの **大きな価値** がこれ。本番で問題が起きた時に **コードを巻き戻さず** に機能を即 OFF にできる。

- 「決済 v2 を ON にしたら障害」→ 管理画面で OFF に
- 「新検索が API を叩きすぎ」→ OFF に

ロールバック（git revert + 再デプロイ）が **数分** かかるのに対し、フラグ OFF は **数秒**。これが本番運用の安心感に直結します。

### フラグの寿命管理

フラグは増えると **コードが if 地獄** になります。**寿命を管理** する習慣が大事。

| フラグの種類 | 寿命の目安 |
|---|---|
| Release flag（新機能の段階公開） | 公開完了後すぐ削除 |
| Experiment flag（A/B テスト） | 結果が出たら削除 |
| Ops flag（緊急停止用） | 長期保存 |
| Permission flag（権限による出し分け） | 永続 |

「**Release flag は公開後 2 週間で削除**」のようなルールを決めて、定期清掃します。

#### lint で検出

GrowthBook / LaunchDarkly などの SaaS は「**コードに残っているフラグ一覧**」を検出する CLI を提供しています。CI で「3 ヶ月使われていないフラグ」を warning 出力するのが有効。

### サーバー / クライアント / Edge

Next.js のような SSR / RSC 環境では「**フラグをどこで評価するか**」が重要です。

| 場所 | 例 |
|---|---|
| **Server Component** | `await getFlag()` を直接呼ぶ。SSR でフラグ反映 |
| **Edge Middleware** | リクエストヘッダで分岐し、A/B 用に URL を書き換え |
| **Client Component** | `useFlag()` フックでクライアントサイド分岐。**ハイドレーション後の表示揺れ** に注意 |

クライアント側だけで分岐すると、ハイドレーションの瞬間に「**ON → OFF のチラつき**」が出ることがあります。なるべく **サーバー側で確定** させて RSC として配るのが安全。

### よくある失敗

#### 1. フラグの ON / OFF が複雑になりすぎる

`if (flag1 && (flag2 || flag3) && !flag4) { ... }` のような状態は **テスト不可能**。フラグは独立に動かす設計を。

#### 2. デフォルト値の事故

ネットワークが落ちた時 / API 失敗時の **fallback 値** を必ず決める。

```ts
const enabled = (await getFlag("newCheckout")) ?? false; // 失敗時は OFF
```

#### 3. クライアント露出

「管理画面用フラグ」をクライアントから読めるようにすると、**敵対的なユーザーが ON にしてしまう** 可能性がある。**サーバー側で評価** が原則。

#### 4. 削除されないフラグ

書いたまま忘れて、**コードが永遠に if で分岐**。定期的な清掃を。

## 演習

### ゴール

- 環境変数ベースのフラグから始め、リモート管理ベースに育てる
- ユーザー ID ベースの 10% ロールアウトを実装する

### 手順 1: 新規プロジェクト

```bash
npx create-next-app@latest flags-sample --ts --app
cd flags-sample
```

### 手順 2: 環境変数フラグ

`.env.local`:

```
NEXT_PUBLIC_NEW_HOMEPAGE=true
```

`app/page.tsx`:

```tsx
export default function Home() {
  const newHomepage = process.env.NEXT_PUBLIC_NEW_HOMEPAGE === "true";
  return (
    <main style={{ padding: 24 }}>
      <h1>{newHomepage ? "新ホーム" : "旧ホーム"}</h1>
    </main>
  );
}
```

`.env.local` の値を `false` に変えて再起動すると、表示が切り替わります。

### 手順 3: ユーザー ID ベースのロールアウト

`utils/rollout.ts`:

```ts
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function isInRollout(userId: string, percent: number): boolean {
  return hash(userId) % 100 < percent;
}
```

`app/page.tsx`:

```tsx
import { isInRollout } from "@/utils/rollout";

const FAKE_USERS = ["user-1", "user-2", "user-3", "user-4", "user-5"];

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>10% ロールアウトのデモ</h1>
      <ul>
        {FAKE_USERS.map((id) => (
          <li key={id}>
            {id}: {isInRollout(id, 10) ? "ON" : "OFF"}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

10% に絞ると **ほとんどの user が OFF**、50% にすると半々、と **再現性** を持って分かれることを確認します。

### 手順 4: フラグを集約する

`utils/flags.ts`:

```ts
import { isInRollout } from "./rollout";

export type Flags = {
  newCheckout: boolean;
  aiSummary: boolean;
};

export function getFlags(userId: string): Flags {
  return {
    newCheckout: process.env.NEXT_PUBLIC_NEW_CHECKOUT === "true" && isInRollout(userId, 10),
    aiSummary: process.env.NEXT_PUBLIC_AI_SUMMARY === "true",
  };
}
```

`app/dashboard/page.tsx`:

```tsx
import { getFlags } from "@/utils/flags";

export default function Dashboard() {
  const flags = getFlags("user-current");
  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      {flags.newCheckout && <p>新チェックアウト ON</p>}
      {flags.aiSummary && <p>AI 要約 ON</p>}
    </main>
  );
}
```

### 期待出力

- `.env.local` の値を変えて再起動すると、`new` / `old` が切り替わる
- ユーザー ID 別に ON / OFF が **再現性** を持って決まる
- フラグを集約すると、ページごとの分岐が読みやすくなる

### 変える

- 5%、25%、50%、100% に変えて、ロールアウトの比率を実感する
- ハッシュ関数を `Math.random()` に変えると **同じユーザーで結果がバラつく** ことを確認（NG パターン）
- フラグ評価を Server Component に閉じ込めて、クライアントには結果だけ渡す

### 自分で書く（任意）

- Vercel Edge Config を使ってフラグをリモート管理にする
- GrowthBook の SDK を入れて、UI で % を変えて即時反映を体験する
- A/B テスト用の variant 割当を実装し、analytics に variant をタグ付けして送る

## まとめ

- フィーチャーフラグは **デプロイと機能公開を分離** する仕組み
- 最小実装は **環境変数 1 つ**。柔軟性を上げたければリモート管理（Edge Config / DB）
- **ハッシュベース** のロールアウトで再現性を保つ
- SaaS は LaunchDarkly / **GrowthBook** / Statsig / Flagsmith / Vercel + PostHog など
- **Kill Switch** で本番障害をビルドなしに止められる価値が大きい
- A/B テストはフラグの仲間。SaaS は両方こなす
- フラグは増える → **寿命を管理して定期清掃**
- Server / Edge で評価して **クライアントのチラつき** を避ける
