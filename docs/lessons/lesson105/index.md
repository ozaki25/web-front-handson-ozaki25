# lesson104: Core Web Vitals の 3 つの指標と Lighthouse

## ゴール

- Core Web Vitals（CWV）の 3 つの指標 **LCP / INP / CLS** が何を測るかを説明できる
- それぞれの「Good」しきい値（2.5s / 200ms / 0.1）を覚える
- Lighthouse と Real User Monitoring（実ユーザーデータ）の違いを理解する
- 75 パーセンタイル評価の意味を説明できる
- DevTools の Performance パネルで CWV を計測できる
- web-vitals ライブラリで自分のサイトに RUM を仕込める基礎を知る

## 解説

### Core Web Vitals とは

**Core Web Vitals**（CWV）は Google が定義した、Web ページの **ユーザー体験の質** を数値化する 3 つの指標です。検索順位にも影響するため、SEO 観点でも 2020 年以降の標準になりました。2024 年 3 月に **INP**（Interaction to Next Paint）が **FID** を置き換え、現在は次の 3 つです。

| 指標 | 何を測る | Good | Needs Improvement | Poor |
|---|---|---|---|---|
| **LCP**（Largest Contentful Paint） | 最大コンテンツが表示されるまでの時間 | ≤ 2.5s | 2.5-4.0s | > 4.0s |
| **INP**（Interaction to Next Paint） | クリック / タップ / キー入力への反応の遅さ | ≤ 200ms | 200-500ms | > 500ms |
| **CLS**（Cumulative Layout Shift） | レイアウトのガタつきの蓄積 | ≤ 0.1 | 0.1-0.25 | > 0.25 |

「3 つすべて Good」が合格ラインです。1 つでも Poor だとユーザー体験は確実に悪いと判断されます。

### LCP: 最大コンテンツが見えるまで

LCP は **ページを開いてから、画面の中で一番大きな要素が表示されるまで** の時間です。「一番大きな要素」は通常、メイン画像 / ヒーロー画像 / 大見出しの `<h1>` などです。

LCP が遅くなる主な原因:

1. **画像の遅延**: 大きすぎる画像、未圧縮、`loading="lazy"` を first view に付けている
2. **サーバーレスポンスが遅い**（TTFB が長い）
3. **JS のブロッキング**: 大きな JS バンドルで描画が止まる
4. **`<link rel="preload">` の不在**: クリティカルなフォントや画像を予告していない

主な対策:

- 画像最適化（`next/image` 系のレッスン参照）
- Next.js / Vercel のような **CDN + 圧縮済み配信** を使う
- JS のコード分割（バンドルサイズ最適化のレッスン参照）
- 重要な画像 / フォントを `<link rel="preload">` で先読み

### INP: 反応の遅さ

INP は **ユーザーが操作してから、次の描画が出るまで** の遅延を測ります。「ボタンをクリックしたが何も反応しない」体験を数値化したものです。2024 年に FID（最初のクリック専用）から INP（全インタラクションの中で最も悪いもの）に変わりました。

INP が悪くなる主な原因:

1. **重い JS イベントハンドラ**: クリック時に大量の計算をしている
2. **過剰な再レンダリング**: React の useState を密に呼んで、毎回 1000 件再描画
3. **メインスレッドのブロック**: `for` ループで重い処理を同期実行

対策:

- イベントハンドラ内の処理を軽くする
- React の `useMemo` / `React.memo`（自動最適化は React Compiler に任せる方向）
- 重い処理を **Web Worker** に逃がす
- リスト描画は **仮想スクロール**（`react-window` 等）
- `requestIdleCallback` で空き時間に処理

### CLS: レイアウトのガタつき

CLS は **要素が突然移動したり、押そうとしたボタンが別の場所に飛んだり** する累積量です。「フォームに入力中、画像が読み込まれて入力欄が下にズレ、押そうと思ったボタンの位置に広告が割り込んで誤クリック」のような UX 障害を防ぎます。

CLS が悪くなる主な原因:

1. **画像 / iframe のサイズ未指定**: `<img>` に `width` / `height` がなく、読み込み後に枠が確定する
2. **動的に挿入される要素**: バナー / 広告がページ上部に後から差し込まれる
3. **Web フォントの読み込みでテキストが re-layout**（FOIT / FOUT）

対策:

- すべての画像 / 動画 / iframe に `width` と `height` を指定する（または CSS の `aspect-ratio`）
- 動的挿入は **下から** か、placeholder で確保したスペースに収める
- フォントは `next/font` のようなツールで先読み・サブセット化
- 5 章 で扱った `next/image` は `width` / `height` 必須にすることで CLS を構造的に防ぐ

### しきい値は「75 パーセンタイル」で評価する

Google の評価は **75% のページ訪問** がしきい値を満たしているかで判定します。つまり、最速の 75% のユーザーが「Good」体験を得られればパスです。残り 25%（遅い回線・古い端末）はやや遅くてもよい、という現実的な指標です。

評価データは **CrUX**（Chrome User Experience Report） という Google が集めている実ユーザーの匿名データから計算されます。

### Lighthouse vs Real User Monitoring（RUM）

CWV を計測する方法は 2 系統あります。

#### Lighthouse（ラボデータ）

Chrome DevTools 内蔵の Lighthouse（7 章「アクセシビリティの自動チェック」で触れた）は、**自分の手元のブラウザで** CWV を 1 回だけ計測します。

- 利点: その場ですぐ計測できる、デプロイ前に確認できる
- 欠点: 自分の手元の環境（速い回線・最新端末）に偏る。実ユーザーの体感とは違うことが多い

主に **開発時のデバッグ** に向きます。

#### RUM（フィールドデータ / 実ユーザー測定）

実際にページを訪れたユーザーのブラウザから CWV を **匿名で集める** 仕組みです。

- 利点: 本物のユーザー体験を反映
- 欠点: 実際にユーザーが訪問しないとデータが集まらない、PII（個人情報）への配慮が必要

代表的なツール:

- **PageSpeed Insights**（<https://pagespeed.web.dev/>）— CrUX データを表示
- **Google Search Console** — Core Web Vitals レポート
- **Vercel Speed Insights**（本コースの教材サイトでも導入済み）
- **web-vitals ライブラリ** + 任意の解析サービスへ送信

Google が SEO で見るのは **RUM データ**（CrUX） です。Lighthouse のスコアが高くても、実ユーザーが遅いと SEO は改善しません。

### web-vitals ライブラリで RUM を仕込む

自分のサイトで RUM データを集めるには、`web-vitals` ライブラリ（Google 公式）を使うのが定番です。

```bash
npm install web-vitals
```

```ts
// src/web-vitals.ts
import { onLCP, onINP, onCLS } from "web-vitals";

function sendToAnalytics(metric: { name: string; value: number; id: string }) {
  // Vercel Analytics / Google Analytics / 自前のサーバーに送る
  console.log(metric);
  // 例: navigator.sendBeacon('/_vitals', JSON.stringify(metric));
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

本コースの教材サイトは **`@vercel/speed-insights`** を使っており、内部で同じ仕組みが動いています。Vercel ホスティングなら追加設定なしで RUM が見られます（Vercel ダッシュボード → Analytics → Speed Insights）。

### DevTools の Performance パネルで計測

Chrome DevTools の **Performance** タブを使うと、その場で詳細な CWV プロファイルが取れます。

1. F12 → **Performance** タブ
2. **Record** ボタン（黒丸）→ ページをリロード → 数秒待つ → **Stop**
3. レポートが表示される
   - 上部に **LCP** / **CLS** などのマーカーが時系列で出る
   - **Main**（メインスレッド）に長時間ブロックしているタスクが赤く表示される
   - INP 計測には「Interactions」レーンに各クリックの遅延が出る

DevTools の **Performance Insights**（新パネル）も同様の情報を簡素化して提示してくれます。

## 演習

### ゴール

- 本教材サイト or 任意のサイトの CWV を Lighthouse で計測する
- DevTools Performance パネルで LCP / CLS が時系列に発生するのを観察する
- web-vitals の存在を知り、最小サンプルを動かしてみる（任意）

### 手順 1: Lighthouse で CWV を計測

1. Chrome で本教材サイト（<https://web-front-handson-ozaki25.vercel.app/>）を開きます
2. F12 → **Lighthouse** タブ → **Performance** だけにチェック → Mobile / Desktop どちらかで **Analyze**
3. レポートを確認:
   - 全体スコア
   - **Largest Contentful Paint**（LCP の値）
   - **Cumulative Layout Shift**（CLS の値）
   - **Interaction to Next Paint**（条件次第で出る）

### 手順 2: PageSpeed Insights で RUM を見る

1. <https://pagespeed.web.dev/> にアクセス
2. URL を入れて Analyze
3. 上部に **「実際のユーザーの体験」** セクションが出る（CrUX データがあれば）。これが RUM
4. 下部の **「パフォーマンスの問題を診断」** が Lighthouse のラボデータ

実ユーザーデータがある場合は **「実際のユーザーの体験」が判定の主軸** です。Lighthouse は補助。

### 手順 3: DevTools Performance で観察

1. Chrome で対象ページを開く
2. F12 → **Performance** タブ
3. 左上の **Record**（黒丸） を押す
4. ページをリロード（`Ctrl + R`）
5. ページが落ち着いたら **Stop**
6. タイムラインで:
   - **LCP** マーカー（緑）の位置を確認 → 何ミリ秒目に出ているか
   - **CLS** が起きていれば、shift のたびに警告マーカーが出る
   - **Main** レーンで赤く長いブロックがないか確認（あれば INP 悪化要因）

### 期待出力

Lighthouse:

- **Performance** スコアが 90 以上なら良好
- LCP が 2.5s 以下、CLS が 0.1 以下なら CWV パス

PageSpeed Insights:

- 「実際のユーザーの体験」セクションが緑（合格）/ 黄（要改善）/ 赤（不合格）で判定される

### 変える

- Lighthouse の **デバイスモード** を Desktop と Mobile で切り替える。Mobile の方が厳しめのスコアになる
- DevTools の Network タブの **Throttling** を「Slow 4G」にして再計測 → LCP が大幅に悪化する。実ユーザーの遅い回線環境を再現
- 自分が運営しているサイト（ブログ・ポートフォリオ）で同じ手順を試す

### 自分で書く（任意）

新規 Vite プロジェクトに `web-vitals` を入れて、コンソールに値を出す最小サンプルを動かす:

```bash
npm create vite@latest cwv-sample -- --template vanilla-ts
cd cwv-sample
npm install web-vitals
```

`src/main.ts`:

```ts
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP(console.log);
onINP(console.log);
onCLS(console.log);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `<h1>web-vitals サンプル</h1>`;
```

`npm run dev` で開いて DevTools の Console を確認すると、ページ滞在中に LCP / CLS の値が、操作するたびに INP の値がログ出力されます。

## まとめ

- Core Web Vitals は 3 指標: **LCP（2.5s）/ INP（200ms）/ CLS**（0.1）
- 2024 年 3 月に **FID は INP に置き換わった**
- 評価は **75 パーセンタイル** + **CrUX**（実ユーザーデータ） で行われる
- **Lighthouse はラボデータ**（開発時の確認）、**RUM はフィールドデータ**（SEO の本命）
- **PageSpeed Insights** が両方を一覧表示してくれる
- DevTools の **Performance パネル** で詳細を時系列に見る
- `web-vitals` ライブラリで自前 RUM、Vercel Speed Insights で外部委託
