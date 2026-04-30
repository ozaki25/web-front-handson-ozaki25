# CLAUDE.md

このリポジトリを Claude Code などの AI アシスタントと一緒に書き続けるためのガイドです。
レッスンを追加・改訂する前に必ず読み込んでください。

## 1. プロジェクト概要

- 名前: `web-front-handson-ozaki25`
- 一言で: **Web フロントエンドをこれから学ぶ人が、手を動かしながら基礎をゼロから積み上げられる学習コンテンツ。**
- スタイル: 座学を軸に、要所で手を動かす演習を入れる。

## 2. 読者像

- Web 開発の初心者を対象とする。HTML / CSS / JavaScript、React、Next.js をほとんど触ったことがない人でも、手を動かしながら読み進められるようにする。
- プログラミング自体がはじめてとは限らず、授業や他分野で少しコードを書いた経験がある人も読者に含む。

## 3. 完走ゴール

- Next.js (App Router) で**小さなアプリ**を自力で作れる。
- 例: フォーム付きページ / データを表示するページ / ルーティングのあるページ。

## 4. カリキュラム

以下の構成で進める。途中での再編はあり。

1. HTML / CSS
2. JavaScript
3. TypeScript
4. React
5. Next.js
6. ブラウザの仕組み
7. 実務で使う周辺知識

- レッスン単位は `lessonXX`（`dayXX` は使わない）。
  - 毎日 1 レッスンに縛らない。1 日で一気に複数レッスン進める使い方も想定する。
- 全体ボリュームの上限は決めない。書きながら増やす。

## 5. 配信・実行環境

- VitePress で生成し、Vercel で公開する。
- 学習者のコード実行環境は StackBlitz を基本とする。
  - 理由: ブラウザで即起動でき、WebContainers で Next.js まで動く。アカウントなしでも試せるが、実用的には GitHub ログインを推奨（保存・Fork・共有 URL が使えるようになる）。
  - 各レッスンから「StackBlitz で開く」リンク or 埋め込みを貼って、読みながら即試せる状態にする。
- ローカル環境構築にページを割かない。独立した「準備章」は設けない。

## 6. 執筆原則

1. **座学 → 演習** の順。レッスンではまず仕組みや背景を言葉と図で説明し、そのあとに手を動かして確認する。
2. **コードは省略しない**。import も閉じタグも全部書く。
3. **知らない用語を前提にしない**。初出時、文脈に合わせて簡潔に補足する。
4. **期待出力を必ず示す**。スクショ or 「ここで画面に 〜 と出るはず」。
5. **コピペ → 変える → 自分で書く** の 3 段階を各レッスンで回す。
6. **最新版を前提にする**。ただしデファクトになる見込みがある新機能は、先取りして扱うことがある。
7. **ライブラリ API は必ず Context7 で確認してから書く**。Next.js / React / TypeScript など任意のライブラリについて API・設定・挙動を本文に書く前に、Context7 MCP の `resolve-library-id` → `get-library-docs` で最新ドキュメントを取得し、内容と照合すること。トレーニングデータの知識だけで書いてはならない。

## 7. レッスン構成テンプレート

各 `lessonXX.md` は以下の固定順で書く。

```
# lessonXX: タイトル

## ゴール
## 解説
## 演習
## まとめ
```

- 「演習」は**到達ゴールと期待出力を必ず書く**。
- 解答例は折りたたみ、または別ファイルに置く。

## 8. ディレクトリ構成

```
docs/
├── .vitepress/
├── index.md
├── introduction/
└── lessons/
    ├── lesson01/
    │   └── index.md
    └── ...
docs/rejected/       ← 却下したレッスン案
```

## 9. ブランチ運用

`main` 単独運用。レッスン追加・改訂も含めてすべて main に直接コミットする。draft や publish ブランチは使わない。

- 公開前にビルドを壊さないため、コミット前に `npm run docs:build` を通すこと。
- 大きな変更はローカルで一度プレビュー（`npm run docs:dev`）してから push する。

## 10. レッスン追加手順

1. `docs/lessons/` を見て、内容の重複や順序の破綻がないか確認する。
2. **追加先の章を決め、その章の中で「読者がどんな順で学ぶと一番素直に入るか」を考える**。トピックの依存関係（前提のレッスン）と難易度カーブを基準に **最適な位置** を決める。**章末に append する前提で考えてはいけない**。
3. 挿入位置によって既存番号がずれる場合は、**この時点で `/renumber-lessons` を回して全体を章内連番に戻す**。「とりあえず章末に飛び番号で追加」は禁止。**`/renumber-lessons` は `scripts/renumber.py` を呼ぶだけ**（旧→新 ペアを引数で渡す）。
4. **Context7 で対象ライブラリの最新ドキュメントを取得し、本文に書くすべての API・設定・挙動を照合する**。手順: `resolve-library-id`（ライブラリ名 → ID）→ `get-library-docs`（該当トピックでフィルタ）。バージョン表記もこの時点で確認して合わせる。
5. 「レッスン構成テンプレート」に従って構造を作る。
6. コードはそのまま動く完全なものだけを置く(抜粋にしない)。
7. 必要に応じて VitePress のタブ / Mermaid / 折りたたみを使う。
8. ダークモード色指定を忘れない(白背景だけ指定して文字が読めなくなる事故を防ぐ)。
9. `npm run docs:build` を通してから main にコミットする。
10. 後述の「§ 14 過去指摘の checklist」を毎レッスン commit 前に必ず通す。

## 11. 避けたい書き方（方針）

- 長い前置き（「〜について詳しく説明します」等）。
- 読者の前提知識を当てにした省略（「ご存知の通り」等）。
- 古い API / 非推奨のやり方（旧 `pages/` ルーター、クラスコンポーネント、`forwardRef` 等）。
- 1 レッスン内でのレベル跳ね上がり。
- `…(省略)…` を使ったコード片（コードは全量掲載）。

> **次のパターンは commit 時に hook が自動検出するので意識不要**: 絵文字・装飾記号 / 位置依存の cross-lesson 参照（「次のレッスン」「前章」など、位置を表す語 + レッスン/章）/「章 N」表記 / 省略コード / 用語揺れ（「プロップス」「疑似クラス」）/ 素の `<script>` `<style>` / 太字の閉じが全角閉じ括弧の直後。詳細は `.claude/hooks/validate-branch-commit.sh` を参照。

## 12. インラインデモ（`LiveDemo`）

効果的な場面では、本文中で HTML / CSS / JS を動かして見せる **インラインデモ** を積極的に使ってよい。以下のルールを守る。

### 必ず `<LiveDemo>` コンポーネントを使う

本文に直接 `<script>` や `<style>` を書かない。理由は、VitePress は単一の SPA でありグローバルスコープが全レッスンで共有されるため、素の `<script>` / `<style>` は **他レッスンに影響を漏らす**。

`<LiveDemo>` は iframe `srcdoc` + sandbox でデモを隔離し、以下を保証する。

- CSS セレクタは iframe 内部に閉じる（他レッスンの `.card` 等と衝突しない）
- JS グローバルは iframe 内に閉じる（親ページの `window` には出ない）
- 親ページの `localStorage` / `cookie` / `document` にアクセス不可（`sandbox` に `allow-same-origin` を渡していない）
- `alert` / `confirm` / `<form>` は許可（`allow-modals` / `allow-forms`）
- ユーザー JS は `try`/`catch` で包まれ、エラー時は iframe 内に赤字で表示される

### 使い方

```md
<LiveDemo
  :html="`<button id='btn'>押してね</button>`"
  :css="`button { padding: 8px 16px; font-size: 1rem; }`"
  :js="`document.getElementById('btn').onclick = () => alert('押された')`"
/>
```

複数行はテンプレートリテラルで改行する。ソースは自動で `<details>` で畳まれて表示される（`show-code="false"` で非表示にできる）。高さは `height="320px"` で調整可能。

### 効果的な場面の目安

- **使う**: CSS hover / フォーカス / Flexbox / Grid の見た目の変化、クリックで表示が変わる最小例、イベント動作の確認、transition の動き
- **使わない**: ミニ統合レッスンのような長い演習（StackBlitz で手を動かすほうが学びが深い）、サーバー側 API が必要なもの、ローカルファイル読み込みが必要なもの

### してはいけないこと

- `<LiveDemo>` を介さずに本文に `<script>` / `<style>` を書くこと
- 親ページの DOM や `window` を触るデモ（sandbox で遮断されるが、そもそも書かない）
- `:js` に外部 URL の `fetch` を書くこと（CORS で失敗する。外部 API 連携は StackBlitz で扱う）
- `:html` 等の値で **HTML 属性を `&quot;` のような HTML エンティティでエスケープする**こと。テンプレートリテラル内では **シングルクォート** を使う（`<input type='text'>`）。エンティティを使うと VitePress の build で実体に展開されて壊れる。

## 13. 図は SVG で置く（Mermaid プラグインは使わない）

本文に図を入れたいときは、**`docs/public/diagrams/*.svg`** に静的 SVG を置いて `<img src="/diagrams/<name>.svg" alt="..." class="diagram" />` で参照する。

```md
<img src="/diagrams/server-client-tree.svg" alt="RootLayout(Server) → page.tsx(Server) → Nav(Server) / Counter(Client) / TodoForm(Client) のツリー" class="diagram" />
```

ルール:

- **新規に ` ```mermaid ` フェンスを書かない**。`vitepress-plugin-mermaid` は 1 つの図のために mermaid 本体（Cytoscape / Wardley / KaTeX など全図種）をバンドルに巻き込み、ビルドが遅くチャンクが肥大する。**本コースは Mermaid プラグインを使わない方針** に固定する。
- 図のソース（mermaid 記法 `.mmd` ファイル）は **`diagrams-src/`** に置く。再生成手順は `diagrams-src/README.md` を参照。書き出した SVG だけを `docs/public/diagrams/` にコミットする。
- ファイル名は **トピック名**（例: `server-action-flow.svg`）。`lessonNN` を含めない（章再編で破綻するため）。
- `alt` 属性は **省略しない**。スクリーンリーダーで意味が伝わる、図の主旨を 1〜2 文で書く。`alt="図"` のような無情報文字列は禁止。
- `class="diagram"` を付ける（`docs/.vitepress/theme/custom.css` で `max-width` などを定義済み）。
- 単純な木構造や箇条書きで足りる場合は、図ではなく **箇条書きや表** で表現する方が保守性が高い。SVG 化は「図でないと伝わらない」場面に限る。

## 14. 過去指摘の checklist（hook で拾えない判断項目）

ここに列挙したのは **目視で確認するしかない項目**。機械的に検出できるパターン（絵文字・位置依存参照・章 N・省略コード・用語揺れ・素の `<script>` `<style>`・太字+全角閉じ括弧・Vue 補間未閉・レッスン 4 節の存在）は `.claude/hooks/validate-branch-commit.sh` が commit 時に自動で弾く。

### A. 番号管理

- [ ] 追加先の章で **連番** になっているか（例: 1 章 が lesson01-17 のところに lesson100 を追加してはいけない）
- [ ] 章をまたぐ追加 / 章順の入れ替えを行ったら、**`/renumber-lessons` で再採番済み** か
- [ ] サイドバー（`docs/.vitepress/config.mts`）のレッスン順と、ディレクトリ番号が一致しているか

### B. 配置判断（章末への安直な append を避ける）

- [ ] 新レッスンは章末への append ではなく、**読者の学習順序として自然な位置** に配置されているか
- [ ] **章末 capstone（synthesis）は作らない**。「集大成」「到達点」「全体のまとめ」のような章末を主張する構造は、後から章を再編すると壊れるため採用しない
- [ ] 章末を主張する文言は本文に書かない
- [ ] **使う前に導入する** 原則: 概念 X を実演習で使うレッスンは、X 単独の解説レッスンより **後** に配置

### C. 参照の書き方（hook 補助）

- [ ] 削除した呼称（例: 「ミニ統合」）が他レッスンに残っていないか（`grep -rn '<削除した語>' docs/lessons/`）

### D. VitePress / Vue parser の罠（hook 補助）

- [ ] inline backtick 内に `${{ ... }}` を書いていないか（Vue template が変数として解釈し build エラー）
- [ ] `<LiveDemo>` の `:html` で `&quot;` を使っていないか（シングルクォートで書く）

### E. ダーク / ライトモード

- [ ] `style=` や CSS で **白背景固定 / 黒文字固定** していないか
- [ ] LiveDemo 内の CSS にダークモード対応が入っているか（`@media (prefers-color-scheme: dark)`）

### F. ビルド

- [ ] `npm run docs:build` が通る
- [ ] サイドバー（`config.mts`）に新レッスンを追記済み

### G. レッスン内容

- [ ] 章 / 順序 / 既存レッスンとの依存関係が破綻していない
- [ ] 期待出力が書かれている

### H. ライブラリ API の正確性（Context7 必須）

- [ ] 本文に登場するすべてのライブラリ API・設定・挙動を、**Context7 MCP（`resolve-library-id` → `get-library-docs`）で最新ドキュメントと照合した**か
- [ ] 以下の項目は特に注意（過去に誤りが見つかった箇所）:
  - Next.js: `fetch` のキャッシュデフォルト / `"use cache"` ディレクティブ / `cacheComponents` の配置場所 / `updateTag` vs `revalidateTag` / async Request APIs（`cookies()` / `headers()` / `params`）の await 必須化
  - React: フック名と import 元（`useActionState` は `react` から、`useFormStatus` は `react-dom` から）
  - Next.js config: `experimental` に移ったと思い込んでいる設定がトップレベルになっていないか確認する
