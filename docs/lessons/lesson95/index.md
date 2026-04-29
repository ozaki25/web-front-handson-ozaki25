# lesson95: アクセシビリティの自動チェック（axe / Lighthouse / スクリーンリーダー）

## ゴール

- Chrome DevTools 内蔵の **Lighthouse** で a11y スコアを計測できる
- **axe DevTools** 拡張で詳細な違反をチェックできる
- 自動チェックでは拾えない領域（文脈・操作感）を **スクリーンリーダー**（VoiceOver / NVDA）で確認できる
- CI に **axe-core**（`@axe-core/playwright` など）を組み込む発想を理解する
- 「自動チェック + 手動チェック + 実ユーザー」の 3 段構えが必要な理由を説明できる

## 解説

### チェックの 3 段構え

a11y は「自動化で 100% は担保できない」領域です。色のコントラスト比や `alt` の有無のような **機械的にチェックできる項目** は 3〜4 割で、残りは **文脈** に依存します。たとえば:

- `alt="画像"` と書いてあっても、画像の本当の内容を表していなければ機械は気づけない
- ボタンラベルが `aria-label="保存"` でも、「何を保存するのか」が文脈に合ってなければ機械は気づけない
- キーボードで Tab 順序が「技術的に通る」でも、論理的な順序として使いづらい場合がある

実務では次の 3 段階でチェックします。

1. **自動**: Lighthouse / axe DevTools → 開発中の基本ラインを自動検知
2. **手動**: キーボードだけで操作してみる / スクリーンリーダーで読み上げる → 体験として正しいか
3. **実ユーザー**: 可能ならアクセシビリティ利用者に触ってもらう → リアルなフィードバック

本レッスンでは 1 と 2 を一通り触ります。

### 1. Lighthouse: 基本ラインを自動で

Chrome DevTools 内蔵の **Lighthouse** タブは、その場でページを監査して 4 つのカテゴリ（Performance / Accessibility / Best Practices / SEO）を 0〜100 の点数で返します。

手順:

1. Chrome でチェックしたいページを開く
2. DevTools（`F12`）→ **Lighthouse** タブ
3. Categories で **Accessibility** だけ選択（他もまとめて出しても良い）
4. Device は Desktop / Mobile どちらかを選び、**Analyze page load** をクリック
5. レポートが出る。Accessibility のスコアが 100 / 90 / 80 ... のように点数化される

典型的な違反の例:

- Background and foreground colors do not have a sufficient contrast ratio（コントラスト不足）
- Image elements do not have `[alt]` attributes（alt 欠落）
- Form elements do not have associated labels（label 欠落）
- Heading elements are not in a sequentially-descending order（見出し階層の飛び）
- Buttons do not have an accessible name（アクセシブルネーム欠落）
- `[aria-*]` attributes do not match their roles（ARIA の誤用）

Lighthouse は **違反ごとに該当の DOM ノード** を示してくれるので、クリックすれば Elements タブにジャンプして直すだけです。

**スコア 100 が目標ですが、それが a11y 完璧の意味ではない** 点に注意してください。Lighthouse が拾うのは機械的な項目だけです。

### 2. axe DevTools: より細かく診断

Lighthouse より **詳細な違反情報** が欲しいときは、Chrome 拡張の **axe DevTools**（<https://www.deque.com/axe/devtools/>）を使います。無料版でも十分に使えます。

インストール後:

1. Chrome 拡張からインストール
2. DevTools に **axe DevTools** タブが追加される
3. **Scan ALL of my page** を押す
4. Critical / Serious / Moderate / Minor の優先度別に違反が一覧される
5. 各違反に「なぜ違反か」「どう直すか」のガイドリンク付き

Lighthouse との違い:

- axe DevTools は **Deque**（a11y 専門会社）が提供。業界標準の axe-core エンジンを使う
- 違反の説明が詳しく、**修正方法のコード例** まで載っている
- Lighthouse は axe-core の一部を内蔵している。つまり **axe DevTools の方が厳しめ**

両方回して、Lighthouse で基本を見て、axe で細部を詰めるのが定番です。

### 3. キーボード手動チェック

ここからは **人間の目と手でしか分からない** 領域です。次を試してください。

1. マウスから手を離す
2. Tab キーだけでページを最初から最後まで操作する
3. 次を確認する:
   - **フォーカスリングが常に見える** か（どこにフォーカスがあるか分かるか）
   - **Tab の順序が論理的** か（画面上の自然な流れと一致しているか）
   - すべての **操作可能な要素** に Tab で到達できるか（マウスでしかクリックできない部分はないか）
   - **モーダル**が開いたとき、Tab がモーダル内で巡回し、Esc で閉じられるか
   - **キーボードの罠** がないか（Tab を押してもフォーカスが進まない場所はないか）

「フォーカスが見えない」は最頻発の違反です。CSS で `outline: none` を書いていないか、`:focus-visible` で代替を用意しているか、再確認しましょう。

### 4. スクリーンリーダー手動チェック

スクリーンリーダーは **OS 付属（VoiceOver）や無料**（NVDA） が使えます。自分で触ってみると、文章だけでは分からない体験が一気に分かります。

#### macOS: VoiceOver

- 起動: `Cmd + F5`（または `Touch ID` を 3 回連打）
- 停止: もう一度 `Cmd + F5`
- ページ読み上げ: `Ctrl + Option + A`
- 次の見出しへ移動: `Ctrl + Option + Cmd + H`
- ランドマーク一覧: `Ctrl + Option + U`（ローター）

初めての場合、読み上げスピードが速すぎると感じます。システム設定 → アクセシビリティ → VoiceOver で速度を遅くできます。

#### Windows: NVDA（無料）

- <https://www.nvaccess.org/download/> からダウンロード
- 起動後、Web ページを開くと自動で読み上げ開始
- 次の見出しへ: `H`
- 次のランドマークへ: `D`
- 読み上げ停止: `Ctrl`

#### 何を確認するか

- **ページを開いた瞬間に何が読まれるか**（最初の見出しか、関係ないテキストか）
- ナビゲーションで **「メインコンテンツにスキップ」** できるか（`<main>` ランドマークがあるか）
- フォームで **ラベルと入力欄が正しく紐付いている** か
- **アイコンボタンの名前** が読まれるか（`aria-label` 未設定だと「ボタン」としか読まれない）
- **動的更新**（通知メッセージなど）が `aria-live` で自動通知されるか

「セマンティック HTML とアクセシビリティの基礎」「ARIA 属性とキーボード操作」で作った演習ページで試してみると、これまで配置した属性が効いているのが体感できます。

### 5. CI に組み込む: `@axe-core/playwright`

手動チェックだけでは、**デグレ**（一度直した違反が再発すること）を防げません。E2E テストで axe を回して CI に組み込むと、PR の段階で自動検知できます。

```ts
// e2e/a11y.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("トップページに a11y 違反がない", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  const results = await new AxeBuilder({ page })
    // 既知の現状割れているチェックは disable する（後で順次解消）
    .disableRules(["color-contrast"])
    // 最初は WCAG A / AA だけに絞ると現実的
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

「テスト入門」で Playwright を導入するレッスンがあるので、そこと組み合わせて CI に足せます。E2E テストは書かれた通りに再現するので、`aria-label` や `alt` の欠落が PR で気付けるようになります。`expect(results.violations).toEqual([])` をいきなり全ルールで通すと、新しいルールが追加されたときに **無関係の PR が落ちる** ので、`withTags` でスコープを絞り、`disableRules` で既知の課題を一旦よけてから順次解消するのが定石です。

> React のユニットテストレベルなら `jest-axe` や `vitest-axe` が使えます。コンポーネント単体の違反チェックに向きます。

### まとめの「チェックリスト」

デプロイ前に以下を確認すれば、機械的には OK ラインに届きます（最低限）。

- [ ] Lighthouse Accessibility スコアが 90 以上
- [ ] axe DevTools の Critical / Serious が 0
- [ ] マウスを使わず Tab だけで全機能を操作できる
- [ ] Tab を押したときに常にフォーカスリングが見える
- [ ] モーダルが Esc で閉じ、フォーカスが元に戻る
- [ ] スクリーンリーダーでページを開いた最初の読み上げが自然

## 演習

### ゴール

- ローカル or 公開 Web サイト 1 ページに対して Lighthouse を実行する
- axe DevTools をインストールして違反を眺める
- キーボードだけで 1 つのサイトを操作する体験をする
- （任意）スクリーンリーダーを起動してページを読み上げさせる

### 手順 1: Lighthouse を回す

1. Chrome で本コースの教材サイト、または自分が作ったポートフォリオを開きます
2. DevTools（`F12`）→ **Lighthouse** タブ
3. Categories で **Accessibility** だけチェックを残し、**Analyze page load** をクリック
4. スコアが出るまで 10〜30 秒待ちます
5. スコアと、違反があれば内容をメモします

### 手順 2: axe DevTools を使う

1. Chrome Web Store で「axe DevTools」を検索してインストール
2. DevTools に **axe DevTools** タブが出る
3. **Scan ALL of my page** をクリック
4. 結果ペインで違反一覧を眺めます。各違反をクリックすると詳細と該当 DOM が出ます

### 手順 3: キーボードだけで操作する

1. マウスをデスクから**物理的に離して** みる（誘惑を断つため）
2. Tab キーだけで全リンク・全ボタンを順に通過する
3. 「ここに行きたいが Tab で辿り着けない」ポイントがないか確認
4. 見つかったら、Tab 順序の修正候補をメモ（原因は `tabindex` 誤設定 / 非インタラクティブな `<div>` をボタン代わりにしている、など）

### 手順 4（任意）: スクリーンリーダー

Mac なら VoiceOver（`Cmd + F5`）、Windows なら NVDA をインストールして起動し、同じページを読ませてみます。

「何が読まれるか」より「何が読まれないか」に注目すると、見えてないラベルやランドマークが炙り出されます。

### 期待出力

- Lighthouse の Accessibility スコアが数字で出る（教材サイトは 90+ のはず）
- axe DevTools の違反リストが 0 件 or Critical が 0 件
- Tab だけで迷子にならずに全操作ができる
- スクリーンリーダー体験で「どう読まれるか」の感覚が掴める

### 変える

- 自分のポートフォリオやブログ（あれば）で同じ手順を試してみる。違反が出たら、「セマンティック HTML とアクセシビリティの基礎」と「ARIA 属性とキーボード操作」のレッスンに戻って該当 HTML を直す
- Lighthouse の **Device** を Mobile に切り替えてみる。タップ領域の不足など、モバイル固有の違反が出る場合がある
- `axe DevTools` の **Intelligent Guided Tests**（有料版機能）の存在を認識しておく。無料版の自動チェックで拾えないものを、人間をガイドしながら問診してくれる

### 自分で書く

- `@axe-core/playwright` を使った E2E a11y テストのサンプルを読んで、雰囲気を掴む（実装は「テスト入門」で Playwright を導入するレッスンと合わせて）
- `eslint-plugin-jsx-a11y` の存在を知っておく。React の JSX で書いた時点で a11y 違反を警告してくれるリンタープラグイン

## まとめ

- a11y チェックは **自動 + 手動 + 実ユーザー** の 3 段構え。自動だけでは 3〜4 割しかカバーできない
- **Lighthouse**: Chrome 内蔵。a11y スコアと違反一覧を即出せる
- **axe DevTools**: Chrome 拡張。より詳細・厳しめ。Deque 提供の業界標準
- 手動チェック: キーボードだけで操作 / スクリーンリーダーで読ませる
- **VoiceOver**（macOS）/ **NVDA**（Windows 無料）でスクリーンリーダー体験
- CI に `@axe-core/playwright` や `jest-axe` / `vitest-axe` を組み込むと、デグレ検知が自動化できる
- `eslint-plugin-jsx-a11y` も併用すると書く段階で違反を捕まえられる
- これで a11y の 3 レッスン（セマンティック HTML / ARIA とキーボード / 自動チェック）が完結。次のテーマに進んで、実務の周辺知識を積み上げる
