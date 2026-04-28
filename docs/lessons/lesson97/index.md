# lesson97: テスト入門 — Vitest でユニットテスト

## ゴール

- なぜテストを書くか、何が報われるかを自分の言葉で説明できる
- Vitest をプロジェクトにセットアップできる
- `describe` / `it` / `expect` の基本構文を読める・書ける
- 純粋関数（純関数）のユニットテストを書ける
- watch モードで「コードを直したらテストが即走る」体験を得る
- テストピラミッド（ユニット 70% / 結合 20% / E2E 10%）の考え方を知る

## 解説

### なぜテストを書くか

「テストは時間の無駄」と思うかもしれません。しかし実務では次のリターンがあります。

1. **デグレ防止**: 一度直したバグが、別の修正でまた壊れることを自動検知
2. **リファクタリングの安心感**: テストが通っていれば、内部実装を大胆に書き換えられる
3. **設計のフィードバック**: テストが書きにくいコードは、責務が混ざっている兆候。設計改善のシグナル
4. **ドキュメント代わり**: テストが「この関数はこう動く」の生きた説明になる

逆にテストが要らない / 後回しでよいケース:

- 試作で捨てる前提のコード
- 1 度だけ使うスクリプト
- UI のピクセル単位の見た目（人間の目で確認する方が速い）

本コースは学習教材なのでテストは書いていませんが、**実務に出るときの必修科目** です。

### テストピラミッド

テストには規模の違いがあります。

| 種類 | 速度 | 安定 | 範囲 | 比率の目安 |
|---|---|---|---|---|
| ユニット | 速い（ms） | 安定 | 関数 1 つ | 70% |
| コンポーネント / 結合 | 中間 | 中間 | コンポーネント / 複数モジュール | 20% |
| E2E | 遅い（秒） | 不安定 | アプリ全体 | 10% |

ピラミッドの考え方は **「下が広く、上が狭い」** です。ユニットを多く書き、E2E は最重要パスだけに絞ります。E2E は「ログイン → 商品購入」のような **失敗するとビジネス的に致命的な経路** に投資する、というのが 2026 年の定番です。

本レッスンでは **Vitest でユニットテスト**（純粋関数のテスト）を扱います。コンポーネントテスト（Testing Library）、API モック（MSW）、E2E（Playwright）はそれぞれ別の章で扱います。

### Vitest とは

**Vitest** は Vite の上で動くテストランナーです。Jest（昔からある定番）と同じ書き方で、**Vite と同じ設定（TypeScript / JSX / 環境変数 / プラグイン）が自動で効く** のが大きな利点です。冷起動が Jest より一桁速いと言われています。

2026 年現在、新規プロジェクトでは **Vitest が第一候補** です。Jest は既存資産との互換のために残るケースが多いです。

### Vitest のセットアップ

新規 Vite プロジェクトに Vitest を入れるとき:

```bash
npm install -D vitest @vitejs/plugin-react jsdom
```

`vitest.config.ts` を作成:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",  // ブラウザ風 DOM を提供（コンポーネントテスト用）
    globals: true,         // describe / it / expect を import なしで使える
    setupFiles: ["./vitest.setup.ts"], // 共通の前処理を書く場合
  },
});
```

`package.json` に scripts を足す:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- `npm run test`: **watch モード** で起動。ファイル変更を検知して再実行
- `npm run test:run`: 1 回だけ実行（CI 用）

> **CI で動かす最小例**: GitHub Actions なら `.github/workflows/test.yml` に下記を置くだけで PR / push 時に毎回テストが走ります。
>
> ```yaml
> name: test
> on: [push, pull_request]
> jobs:
>   test:
>     runs-on: ubuntu-latest
>     steps:
>       - uses: actions/checkout@v4
>       - uses: actions/setup-node@v4
>         with:
>           node-version: 22
>           cache: npm
>       - run: npm ci
>       - run: npm run test:run
> ```

### 最小のテスト

テストファイルは `*.test.ts` / `*.test.tsx` / `*.spec.ts` の命名で書きます。Vitest が自動で見つけて実行します。

```ts
// src/math.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

```ts
// src/math.test.ts
import { describe, it, expect } from "vitest";
import { add } from "./math";

describe("add", () => {
  it("正の数を 2 つ足す", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("負の数も足せる", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("0 を足すと変わらない", () => {
    expect(add(10, 0)).toBe(10);
  });
});
```

3 つの基本構造:

- **`describe(名前, () => {...})`**: テストをグループ化
- **`it(条件, () => {...})`**: 1 つのテストケース。`test(...)` でも同じ
- **`expect(値).toBe(期待値)`**: アサーション（期待を表明）

`globals: true` を有効にしているので、`import` を省いてもエラーにはなりませんが、**明示的に import するのが推奨** です（IDE の補完が効くため）。

### よく使うアサーション

```ts
expect(value).toBe(5);              // === で比較（プリミティブ）
expect(obj).toEqual({ a: 1 });      // 構造比較（オブジェクト / 配列）
expect(arr).toContain("apple");     // 配列が要素を含むか
expect(str).toMatch(/hello/);       // 文字列が正規表現にマッチするか
expect(value).toBeNull();           // null かどうか
expect(value).toBeUndefined();      // undefined かどうか
expect(value).toBeTruthy();         // truthy（真値）か
expect(value).toBeFalsy();          // falsy（偽値）か
expect(fn).toThrow("エラーメッセージ"); // 関数が例外を投げるか
expect(arr).toHaveLength(3);        // 配列 / 文字列の長さ
```

`toBe` と `toEqual` の使い分けは要注意。

```ts
expect({ a: 1 }).toBe({ a: 1 });    // NG: 別オブジェクトなので fail
expect({ a: 1 }).toEqual({ a: 1 }); // OK: 構造が同じなので pass
```

オブジェクト / 配列は `toEqual`、それ以外は `toBe` と覚えてください。

### `beforeEach` と `afterEach`

各テストの前後に共通処理を入れたい場合に使います。

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Counter", () => {
  let count: number;

  beforeEach(() => {
    count = 0;  // 各テスト前にリセット
  });

  it("増やすと 1 になる", () => {
    count++;
    expect(count).toBe(1);
  });

  it("リセット後も 0 から始まる", () => {
    expect(count).toBe(0);  // beforeEach のおかげで毎回 0 から
  });
});
```

### 非同期コードのテスト

`async / await` で書くと自然に通ります。

```ts
import { describe, it, expect } from "vitest";

async function fetchUser(id: number) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ id, name: "Alice" }), 10)
  );
}

describe("fetchUser", () => {
  it("ユーザーを取得する", async () => {
    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: "Alice" });
  });
});
```

「Promise のテスト」を意識しなくても、関数を `async` にして `await` を書くだけで OK です。

### watch モードで開発する

`npm run test` で立ち上がる watch モードでは、

- ファイル変更を検知して自動再実行
- 失敗したテストを表示しっぱなしにして、対応するファイルを直すと即パス確認
- キーボード操作で **filter**（特定のテストだけ実行）/ **rerun**（全部再実行）/ **quit** ができる

開発しながらテストを書く / 直す体験は、watch モードがあるとないとで雲泥の差です。

## 演習

### ゴール

- Vitest をセットアップできる
- 「文字列を処理する関数」のユニットテストを 5 件書ける
- watch モードで「直したら即通る」を体感する

### 途中から始める場合

新規 StackBlitz の Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-vanilla-ts>）を開きます。テンプレートには Vitest が入っていないので追加します。

### 手順 1: Vitest をインストール

ターミナル（StackBlitz の場合は下部の Terminal タブ）で:

```bash
npm install -D vitest
```

> 注: 本レッスンはコンポーネントテストではないので `@vitejs/plugin-react` / `jsdom` は不要です。React Testing Library のレッスンで足します。

### 手順 2: 設定ファイルを作る

プロジェクトルートに `vitest.config.ts` を作成:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

`package.json` の `scripts` に以下を追加:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

### 手順 3: テスト対象のコードを書く

`src/string-utils.ts` を作成:

```ts
export function reverse(s: string): string {
  return s.split("").reverse().join("");
}

export function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === reverse(cleaned);
}

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "...";
}
```

### 手順 4: テストを書く

`src/string-utils.test.ts` を作成:

```ts
import { describe, it, expect } from "vitest";
import { reverse, isPalindrome, truncate } from "./string-utils";

describe("reverse", () => {
  it("文字列を反転する", () => {
    expect(reverse("hello")).toBe("olleh");
  });

  it("空文字は空文字のまま", () => {
    expect(reverse("")).toBe("");
  });
});

describe("isPalindrome", () => {
  it("回文は true", () => {
    expect(isPalindrome("racecar")).toBe(true);
    expect(isPalindrome("level")).toBe(true);
  });

  it("回文でなければ false", () => {
    expect(isPalindrome("hello")).toBe(false);
  });

  it("大文字小文字を無視する", () => {
    expect(isPalindrome("RaceCar")).toBe(true);
  });

  it("記号と空白を無視する", () => {
    expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
  });
});

describe("truncate", () => {
  it("最大長以内なら変えない", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("超えたら切り詰めて ... を付ける", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("ちょうどなら変えない", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});
```

### 手順 5: 実行

```bash
npm run test
```

Vitest が起動し、watch モードで全テストが走ります。すべて緑のチェックで pass すれば成功です。

### 期待出力

```
 PASS  src/string-utils.test.ts (10)
   PASS  reverse (2)
     PASS  文字列を反転する
     PASS  空文字は空文字のまま
   PASS  isPalindrome (4)
     PASS  回文は true
     PASS  回文でなければ false
     PASS  大文字小文字を無視する
     PASS  記号と空白を無視する
   PASS  truncate (3)
     PASS  最大長以内なら変えない
     PASS  超えたら切り詰めて ... を付ける
     PASS  ちょうどなら変えない

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

実際の Vitest 出力では緑のチェックマーク記号がそれぞれの行頭に付きます。すべて緑になれば OK です。

### 変える

- `truncate("hello world", 5)` の期待値を `"hello world"` に変えてみる。fail することを確認（fail 表示で「実際は何が返ったか」が示される）。元に戻す
- `string-utils.ts` の `truncate` の `+ "..."` を消してみる。watch モードが即座に該当テストの fail を表示する。元に戻す
- 新しい関数 `wordCount(s: string): number`（空白で区切った単語数を返す）を `string-utils.ts` に足し、テストも 3 件書く

### 自分で書く

- 配列を扱う関数を作ってテストを書く
  - `unique<T>(arr: T[]): T[]`（重複を除いた配列）
  - `chunk<T>(arr: T[], size: number): T[][]`（配列を size ごとに分割）
- 各関数で **境界値**（空配列 / 1 要素 / size より小さい配列）も忘れずテストする

## まとめ

- テストはデグレ防止 / リファクタリング安心 / 設計フィードバック / ドキュメント代わりの 4 つで報われる
- テストピラミッド: ユニット 70% / 結合 20% / E2E 10% を目安
- **Vitest** は Vite の上で動くテストランナー。Jest 互換の書き味で 10x 速い
- 基本構造: `describe(名前, () => { it(条件, () => { expect(値).toBe(期待値) }) })`
- アサーション: `toBe` はプリミティブ / `toEqual` はオブジェクト・配列
- watch モードでファイル変更検知 → 即再実行で開発体験が大きく向上
