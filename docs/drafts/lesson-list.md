# レッスン一覧（ドラフト v6、拡張版）

v4 → v5（+22、75 レッスン）→ v6（75 のまま、スコープ洗練）。

## v5 → v6 の主な変更（サイクル 1 レビュー 3 視点を反映）

- **章 3 並び替え**: `lesson36 unknown / never` → `lesson37 型ガード` → `lesson38 判別共用体` の順に変更（型ガードのカスタム関数が `unknown` を受ける前提にするため）
- **lesson34 `interface` スコープ縮小**: 宣言マージを新概念から除去、「使い分け指針」に集中
- **lesson47 `useReducer`**: 網羅性チェックは「発展」枠へ、冒頭で lesson38 判別共用体への再接続を明示
- **lesson51 Context**: テーマ切替に絞る（TODO Context 化は lesson57 の発展へ）
- **lesson52 `useRef`**: 自動 focus に絞り、デバウンス例は「変える」枠へ。React 19 の `ref` が props 化した仕様に言及
- **lesson54 `useMemo` のみ**: `useCallback` / `React.memo` / React Compiler はコラム扱い
- **lesson55 カスタムフック**: 抽出のみに絞り、localStorage 内蔵は lesson57 へ。lesson21 クロージャへの逆参照を明示
- **lesson56 React DevTools**: Profiler で lesson54 のメモ化を計測する演習に集中
- **lesson57 TODO ミニ統合**: **必修スコープを「`useTodos` + localStorage + バグあり版→修正版」に限定**、Context / `useReducer` 化は「発展」折りたたみ
- **lesson64 `next/image`**: `remotePatterns` の正しい書式（`{ protocol, hostname, pathname }` のオブジェクト配列）を明示
- **lesson70 Route Handlers**: 演習で `isTodo` 型ガード（lesson37）を再登場させる。`NextResponse` を基本に統一
- **lesson71 Middleware**: `/login` 疑似ページからワンクリックで Cookie を立てる動線
- **lesson72 環境変数**: `.env.local` を必修、Vercel 側は lesson75 で回収
- **lesson73 最終統合**: **主役は `searchParams` / `generateMetadata`**。Route Groups / 画像 / フォントは「すでに導入済みなので完成形でそのまま使う」扱い
- **lesson74 Tailwind**: **Tailwind v4（2025 GA）準拠** に書き換え（`@import "tailwindcss";`、`init` 不要）。紹介のみ
- **既存本文への追記（番号振り替え時に実施）**: lesson59 に「lesson64 で `<Image>` に差し替える」予告、lesson55 解説に lesson21 `makeCounter` への逆参照、lesson47 冒頭に lesson38 判別共用体の再接続文、lesson68 戻り値を判別共用体で明示
- **時間見積もりの現実化**: 通常 20〜40 分 × 75 + 統合 60〜120 分 × 4 で **45〜60 時間** とトップに明記

## v4 からの拡張方針（変化なし）

## 追加の方針

- 章 1（HTML / CSS）: +3（Grid / Position / Transition）で現代レイアウトを網羅
- 章 2（JavaScript）: +2（スコープとクロージャ / モジュール）でコアの穴埋め
- 章 3（TypeScript）: +4（`interface` vs `type` / 型ガード / `unknown`・`never` / 判別共用体）で実務級まで引き上げ
- 章 4（React）: +6（`useReducer` / Context / `useRef` / `useMemo`・`useCallback` / カスタムフック / React DevTools）でフック総ざらい
- 章 5（Next.js）: +7（Route Groups / `next/image` / `next/font` / Route Handlers / Middleware / 環境変数 / Tailwind 紹介）で公開運用まで
- 番号体系は **連番 01〜75** に再配置（既存レッスンの番号をずらし、内部相互参照も更新）

## 設計方針（v4 から継承）

- 読者: Web 開発の初心者。授業で少しコードを触ったことがある程度
- 1 レッスンで新しく導入する概念は原則 1 つ（統合レッスンを除く）
- 座学 → 演習。StackBlitz で即動かす
- 通常 20〜40 分、統合レッスンは 60〜120 分を明記
- 章をまたぐ共通題材: 章 1 自己紹介ページ / 章 2 以降 TODO アプリ / 章 5 lesson59 で `/about` 再訪

## 章構成（v5）

| 章 | テーマ | レッスン数 | 範囲 |
|---|---|---|---|
| 1 | HTML / CSS | 14 | lesson01 〜 lesson14 |
| 2 | JavaScript | 16 | lesson15 〜 lesson30 |
| 3 | TypeScript | 10 | lesson31 〜 lesson40 |
| 4 | React | 17 | lesson41 〜 lesson57 |
| 5 | Next.js | 18 | lesson58 〜 lesson75 |

合計 **75 レッスン**。

## 既存レッスンの番号対応表

### 章 1（11 → 14）

| v4 | v5 | テーマ | 備考 |
|---|---|---|---|
| lesson01 | lesson01 | HTML ってなに？ | |
| lesson02 | lesson02 | テキストを書く | |
| lesson03 | lesson03 | リストで並べる | |
| lesson04 | lesson04 | リンクと画像 | |
| lesson05 | lesson05 | ページの骨格を組む | |
| lesson06 | lesson06 | フォームを作る | |
| lesson07 | lesson07 | CSS を当てる | |
| lesson08 | lesson08 | クラスと状態 | |
| lesson09 | lesson09 | 色と文字を整える | |
| lesson10 | lesson10 | ボックスモデルで余白を作る | |
| lesson11 | lesson11 | Flexbox とレスポンシブ（ミニ統合） | |
| - | **lesson12** | **CSS Grid で二次元レイアウト** | **新規** |
| - | **lesson13** | **Position と z-index** | **新規** |
| - | **lesson14** | **Transition と hover アニメーション** | **新規、自己紹介の仕上げ** |

### 章 2（14 → 16）

| v4 | v5 | テーマ | 備考 |
|---|---|---|---|
| lesson12 | lesson15 | 最初の JavaScript | |
| lesson13 | lesson16 | 値の種類 | |
| lesson14 | lesson17 | 条件で分岐する | |
| lesson15 | lesson18 | 配列を扱う | |
| lesson16 | lesson19 | 繰り返し処理 | |
| lesson17 | lesson20 | 関数 | |
| - | **lesson21** | **スコープとクロージャ** | **新規** |
| lesson18 | lesson22 | オブジェクト | |
| lesson19 | lesson23 | 分割代入とスプレッド | |
| lesson20 | lesson24 | 配列の変換 | |
| - | **lesson25** | **import / export でモジュール化** | **新規** |
| lesson21 | lesson26 | 非同期処理の基本 | |
| lesson22 | lesson27 | fetch で API から取得する | |
| lesson23 | lesson28 | DOM を操作する | |
| lesson24 | lesson29 | イベントで画面を動かす | |
| lesson25 | lesson30 | TODO アプリを作る（ミニ統合） | |

### 章 3（6 → 10）

| v4 | v5 | テーマ | 備考 |
|---|---|---|---|
| lesson26 | lesson31 | TypeScript ってなに？ | |
| lesson27 | lesson32 | 関数の型 | |
| lesson28 | lesson33 | オブジェクトの型と type エイリアス | |
| - | **lesson34** | **`interface` と `type` の使い分け** | **新規** |
| lesson29 | lesson35 | 配列・ユニオン・リテラル型・オプショナル | |
| - | **lesson36** | **`unknown` と `never`** | **新規、型ガードの前に** |
| - | **lesson37** | **型ガード（`typeof` / `in` / カスタム）** | **新規、`unknown` を受けて絞り込む** |
| - | **lesson38** | **判別共用体（discriminated union）** | **新規** |
| lesson30 | lesson39 | ジェネリクス入門 | |
| lesson31 | lesson40 | Utility Types で仕上げる | |

### 章 4（11 → 17）

| v4 | v5 | テーマ | 備考 |
|---|---|---|---|
| lesson32 | lesson41 | React ってなに？ | |
| lesson33 | lesson42 | JSX を書く | |
| lesson34 | lesson43 | コンポーネントと props | |
| lesson35 | lesson44 | 配列を描画する | |
| lesson36 | lesson45 | state で状態を持つ | |
| lesson37 | lesson46 | イベントと配列のイミュータブル更新 | |
| - | **lesson47** | **`useReducer` で複雑な state** | **新規** |
| lesson38 | lesson48 | フォームと制御コンポーネント | |
| lesson39 | lesson49 | 条件で出し分ける | |
| lesson40 | lesson50 | 親子コンポーネントの連携 | |
| - | **lesson51** | **Context API で多層バケツリレー回避** | **新規** |
| - | **lesson52** | **`useRef`（DOM 参照と値保持）** | **新規** |
| lesson41 | lesson53 | `useEffect` の基本 | |
| - | **lesson54** | **`useMemo` と `useCallback`** | **新規** |
| - | **lesson55** | **カスタムフック（`useTodos` に抽出）** | **新規** |
| - | **lesson56** | **React DevTools（Components / Profiler）** | **新規** |
| lesson42 | lesson57 | TODO アプリを React で作る（ミニ統合） | **必修: `useTodos` + localStorage 内蔵 + バグあり版→修正版。発展: Context / `useReducer` 化** |

### 章 5（11 → 18）

| v4 | v5 | テーマ | 備考 |
|---|---|---|---|
| lesson43 | lesson58 | Next.js ってなに？ | |
| lesson44 | lesson59 | ページを増やしてリンクで移動する | |
| lesson45 | lesson60 | 共通レイアウトを作る | |
| - | **lesson61** | **Route Groups で整理する** | **新規** |
| lesson46 | lesson62 | Server Component と Client Component | |
| lesson47 | lesson63 | Server Component でデータを取得する | |
| - | **lesson64** | **`next/image` で画像最適化** | **新規** |
| - | **lesson65** | **`next/font` でフォント** | **新規** |
| lesson48 | lesson66 | 動的ルート | |
| lesson49 | lesson67 | エラーと見つからないページ | |
| lesson50 | lesson68 | Server Actions の最小形 | |
| lesson51 | lesson69 | 送信状態とエラー表示 | |
| - | **lesson70** | **Route Handlers（`app/api/.../route.ts`）** | **新規** |
| - | **lesson71** | **Middleware で認証前処理** | **新規** |
| - | **lesson72** | **環境変数と Vercel の設定** | **新規** |
| lesson52 | lesson73 | 小さなアプリを仕上げる（統合） | **主役: `searchParams` / `generateMetadata`。Route Groups / 画像 / フォントは既習の復習扱い** |
| - | **lesson74** | **Tailwind CSS の紹介（実務の現場で多い書き方）** | **新規** |
| lesson53 | lesson75 | Vercel にデプロイする | |

---

## 新規レッスンの詳細仕様

### 章 1 HTML / CSS（新規 3 本）

#### lesson12: CSS Grid で二次元レイアウト

- **ゴール**: 行と列を同時に指定する二次元レイアウトを CSS Grid で組めるようになる。Flexbox（一次元）との使い分けを理解する。
- **新概念**: `display: grid` / `grid-template-columns` / `grid-template-rows` / `gap` / `grid-column` / `grid-row` / `fr` 単位 / `repeat()` / `minmax()` / `auto-fit` + `minmax()`。
- **演習**: 自己紹介ページの「好きなもの」カードを Grid で 3 列 → 2 列 → 1 列と画面幅に応じて自動折り返しさせる（`repeat(auto-fit, minmax(250px, 1fr))`）。Flexbox 版（lesson11）と見比べる。
- **螺旋**: lesson11 Flexbox の直後に位置。章 5 lesson60 のレイアウトで再登場可能性あり。

#### lesson13: Position と z-index

- **ゴール**: 要素を「通常の流れから切り離して」任意の位置に配置できる。前後の重なりを `z-index` で制御できる。
- **新概念**: `position: static` / `relative` / `absolute` / `fixed` / `sticky` / `top` / `right` / `bottom` / `left` / `z-index` / stacking context（最小限、親に `position` があると基準になる点）。
- **演習**: 自己紹介ページに「ページトップに戻る」ボタンを `position: fixed` で右下に固定。スクロールしても常に見えることを確認。さらに、カードの右上に「NEW」バッジを `position: absolute` で重ねる（親カードに `position: relative` を指定）。
- **螺旋**: lesson14 のモーダル風表示に繋がる。章 4 の条件表示（lesson49）で重なり表示を React で作るときに役立つ。

#### lesson14: Transition と hover アニメーション

- **ゴール**: CSS だけでマウスオーバーの色・影・移動をなめらかに変化させられる。`prefers-reduced-motion` で動きを抑える配慮ができる。
- **新概念**: `transition` プロパティ / `transition-property` / `transition-duration` / `transition-timing-function` / `transform: translate` / `transform: scale` / `@media (prefers-reduced-motion: reduce)`。
- **演習**: 自己紹介カードに `:hover` で「少し浮く（`translateY(-4px)`）+ 影が濃くなる」アニメーションを追加。`transition: all 200ms ease` で補間。`prefers-reduced-motion` 対応で `transition: none` に切り替える。
- **螺旋**: 章 1 の締め。lesson11〜14 で「現代的な CSS の基礎」が揃う。

---

### 章 2 JavaScript（新規 2 本）

#### lesson21: スコープとクロージャ

- **ゴール**: `let` / `const` のブロックスコープ、関数スコープを区別できる。関数が「作られた場所の変数を覚えている」クロージャの挙動を説明できる。
- **新概念**: ブロックスコープ / 関数スコープ / レキシカルスコープ / クロージャ（`makeCounter()` などの古典例）/ `var` の巻き上げとの違い（軽く対比のみ）。
- **演習**: `makeCounter()` で「呼ばれるたびに 1 増える関数」を作る。同じ関数を 2 つ `counterA` / `counterB` で作ると、それぞれ独立したカウンタになることを確認。TODO アプリの「フィルタ関数を動的に作る」演習（`makeFilter(status)` が `(todo) => todo.status === status` を返す）も追加。
- **螺旋**: 章 4 lesson55 カスタムフック（`useTodos` が内部で state を閉じ込める）の理解の土台。

#### lesson25: import / export でモジュール化

- **ゴール**: JS ファイルを分割して `import` / `export` で繋げられる。名前付き export とデフォルト export を使い分けられる。`<script type="module">` を理解する。
- **新概念**: `<script type="module" src="...">` / `export`（名前付き）/ `export default` / `import { name } from "..."` / `import Default from "..."` / `.js` 拡張子の記述。
- **演習**: TODO アプリ（lesson30 の前準備として）を 3 ファイルに分割: `storage.js`（localStorage ラッパ）/ `render.js`（DOM 描画）/ `main.js`（エントリ）。`<script type="module" src="./main.js">` で読み込む。
- **螺旋**: 章 3 の `import type` と章 4 のコンポーネント分割の土台を提供する。

---

### 章 3 TypeScript（新規 4 本）

#### lesson34: `interface` と `type` の使い分け

- **ゴール**: `interface` と `type` の両方で似たことが書けることを理解し、使い分けの指針を持てる。
- **新概念**: `interface` 宣言 / `extends` によるインターフェース継承 / `type` との違い（ユニオン・交差・Utility は `type` のみ）。
- **演習**: 章 3 の `types.ts` にある `Todo` を一度 `interface Todo` で書き直してみる。さらに `interface AdminUser extends User` の継承例を書く。本コースでは `type` を基本に使う方針を末尾で明示。
- **スコープ外**: 宣言マージ、高度な条件型、`infer` は扱わない（存在だけ一言触れて本編から外す）。

#### lesson36: `unknown` と `never`

- **ゴール**: `any` を使わずに「型が分からない値」を `unknown` で受けられる。`never` を「起こり得ない」を表す型として理解する。
- **新概念**: `any` の問題点 / `unknown` 型（扱うには必ず型で絞り込む必要がある）/ `never` 型 / 網羅性チェック（`switch` + `never` で「全ケース処理したこと」を TS に検証させる）。
- **演習**: `unknown` 型で受けた値を直接使おうとするとエラーになる様子を体験。`never` を用いた網羅性チェックの最小例を書く。具体的な型ガードで絞り込む話は次の lesson37 に委ねる。
- **スコープ外**: `any` は原則禁止、という方針を明記。
- **位置の意図**: lesson37 型ガードのカスタム関数 `function isTodo(x: unknown): x is Todo` が `unknown` を受ける前提で動くため、`unknown` を先に教える。

#### lesson37: 型ガード（`typeof` / `in` / カスタム）

- **ゴール**: ユニオン型の中から 1 つの型に絞り込む書き方を身に付ける。直前の lesson36 で学んだ `unknown` を、カスタム型ガードで具体的な型に変えられる。
- **新概念**: `typeof` 型ガード（プリミティブ）/ `in` 演算子（オブジェクトのプロパティ有無）/ ユーザー定義型ガード（`function isTodo(x: unknown): x is Todo`）/ `Array.isArray`。
- **演習**: `string | number` のユニオンを `typeof` で分岐する関数。`{ kind: "todo", text: string } | { kind: "note", body: string }` を `in` 演算子で分岐。`unknown` から `Todo` に絞り込むカスタム型ガードを書く。
- **螺旋**: lesson38 判別共用体の `switch` 分岐の土台。lesson70 Route Handlers で受信 JSON の `isTodo` 検証に再登場。

#### lesson38: 判別共用体（discriminated union）

- **ゴール**: オブジェクトのユニオンに「種類を見分けるためのプロパティ」を付けて、型ガードなしで自然に分岐できる。
- **新概念**: タグ付きユニオン（`kind` や `type` などの文字列リテラルを持つ）/ `switch (state.kind) { ... }` による絞り込み。
- **演習**: `type TodoState = { kind: "loading" } | { kind: "success", todos: Todo[] } | { kind: "error", message: string }` を作り、`switch` で出し分ける関数を書く。章 4 lesson47 `useReducer` の action 型（`type Action = { type: "add", text: string } | { type: "delete", id: string }`）の下準備。
- **螺旋**: 章 4 `useReducer` の action 型、章 5 Server Actions の戻り値型（`{ ok: true } | { ok: false, error: string }`）で再登場。

---

### 章 4 React（新規 6 本）

#### lesson47: `useReducer` で複雑な state

- **ゴール**: 状態の更新が複雑になってきたら `useReducer` に切り替えられる。action の種類を判別共用体で型付けできる。
- **冒頭で明示**: 「この `Action` 型は章 3 lesson38 で学んだ **判別共用体** そのものです」と再接続文を入れる。
- **新概念**: `useReducer(reducer, initialState)` / reducer 関数の形 `(state, action) => newState` / dispatch / action の型（判別共用体）/ 純粋関数の原則（reducer 内で副作用を起こさない）。
- **演習**: lesson46 で `useState` + イミュータブル更新で作った TODO を、`useReducer` に書き換える。`type Action = { type: "add", text: string } | { type: "delete", id: string } | { type: "toggle", id: string }` を定義。`switch (action.type)` で分岐。
- **発展（折りたたみ）**: `never` による網羅性チェックを入れる演習（章 3 lesson36 の回収）。本編は reducer + dispatch + 3 種 action に絞る。
- **螺旋**: 章 3 lesson38 判別共用体がここで実用される。lesson57 ミニ統合で発展課題として `useReducer` + カスタムフックを組み合わせる選択肢を示す。

#### lesson51: Context API で多層バケツリレー回避

- **ゴール**: props の多段階リレー（prop drilling）を Context で避けられる。小規模の Context の使い方を身に付ける。
- **新概念**: `createContext` / Provider（`<MyContext.Provider value={...}>`）/ `useContext` / Context の型（`createContext<Theme | null>(null)`）/ Context を使うべきでないケース（頻繁に変わる値、大規模 state）。
- **演習**: **題材はテーマ切替に絞る**。`"light" | "dark"` を Context で提供し、トップの `App` で Provider、深い子の `ThemeToggle` で `useContext` して切り替え。props を渡さずに済むことを実感する。
- **スコープ外**: Zustand / Redux など外部ライブラリは扱わない。TODO を Context 化する案は lesson57 の **発展課題** に集約（本レッスンでは扱わない）。

#### lesson52: `useRef`（DOM 参照と値保持）

- **ゴール**: フォームに focus を当てるなど、DOM を直接触る必要がある場面で `useRef` を使える。再レンダリングを挟まずに値を保持する用途も理解する。
- **新概念**: `useRef<HTMLInputElement>(null)` / `ref={inputRef}` / `inputRef.current?.focus()` / 値保持用途（`useRef<number>(0)` で再レンダリング時も値が残る）/ `useState` との違い（`useRef` を変えても再レンダリングは起きない）/ **React 19 から `ref` は通常の props として渡せる**（`forwardRef` 不要）という仕様に 1 段落触れる。
- **演習**: TODO 追加フォームで、「追加」ボタンを押した直後に入力欄に自動 focus する（`inputRef.current?.focus()`）に絞る。
- **「変える」枠**: 「前回のクリック時刻を `useRef` で記憶して 1 秒以内の連打を無視するデバウンスもどき」を挑戦課題として折りたたみに配置。
- **螺旋**: lesson55 カスタムフックで `useFocus` を抽出する案にも繋がる（紹介のみ）。

#### lesson54: `useMemo` で計算のメモ化

- **ゴール**: 再レンダリングのたびに走る重い計算を `useMemo` でメモ化できる。乱用しない指針を持てる。
- **新概念**: `useMemo(() => expensive(deps), [deps])` / 「まず普通に書き、計測してから最適化する」原則。
- **演習**: 大きな配列の合計を計算する処理を `useMemo` でメモ化して、別の state 変更で再レンダリングしても再計算されないことを確認する（計測は lesson56 で行う前振り）。
- **コラム（発展、折りたたみ）**:
  - `useCallback` で関数をメモ化する例（`React.memo` と組み合わせた子コンポーネント最適化）を紹介
  - **React Compiler** が 2025 以降 Next.js 15 に段階統合されており、**有効な環境では `useMemo` / `useCallback` / `React.memo` の手動メモ化は原則不要** になりつつある旨を 1 段落で明記
  - 本コースでは「今は手動メモ化の意味を押さえる。Compiler に任せる時代が来たら道具の使い方が変わる」というスタンス
- **スコープ外**: `React.memo` は独立演習にしない。`useSyncExternalStore` などの発展フックは扱わない。
- **螺旋**: lesson56 React DevTools Profiler で計測する前振り。

#### lesson55: カスタムフック（`useTodos` に抽出）

- **ゴール**: 複数のフックを組み合わせたロジックを、再利用可能なカスタムフックに切り出せる。命名規則（`use` プレフィックス）を守れる。
- **冒頭で明示**: 「章 2 lesson21 の `makeCounter` / `makeFilter` が『関数が state を閉じ込める』形でした。カスタムフックは **同じ仕組みを React の文脈で使う** 形です」と逆参照を入れる。
- **新概念**: カスタムフックの形（`function useX() { ... return { ... } }`）/ `use` で始める命名 / 既存フック（`useState`, `useEffect` 等）を中に持てる / 状態とロジックを 1 つの関数にまとめる利点 / フックのルール（他のフックの中でだけ呼ぶ、トップレベルでのみ呼ぶ）。
- **演習**: lesson46-50 で作った `TodoInput` / `TodoList` まわりのロジックを、`useTodos()` カスタムフックに **抽出するだけ** を行う。戻り値は `{ todos, addTodo, deleteTodo, toggleTodo }`。
- **スコープ限定**: localStorage 連携を `useTodos` に畳み込む拡張は lesson57 ミニ統合で行う（本レッスンでは抽出のみに集中）。
- **螺旋**: lesson21 クロージャの再接続がここ。lesson57 で完全版を組む。

#### lesson56: React DevTools（Components / Profiler）

- **ゴール**: React DevTools のインストール方法を知り、Components パネルでコンポーネントツリーと state / props を観察できる。Profiler で再レンダリングの回数と所要時間を測定できる。
- **新概念**: React Developer Tools ブラウザ拡張 / Components パネル（ツリー、state 表示、編集）/ Profiler パネル（Record → 操作 → Stop で測定）/ 「なぜ再レンダリングされたか？」の観察。
- **演習**: DevTools をインストール（Chrome / Firefox 拡張）。lesson54 で作ったメモ化が本当に効いているかを **Profiler で計測する** 演習に集中。Record → state 変更を数回 → Stop で再レンダリングがスキップされていることを確認。
- **StackBlitz の制約注記**: StackBlitz プレビューは iframe 内で動くため、DevTools が React ツリーを拾えないことがある。プレビューを別タブで開く手順（「Open in New Tab」ボタン）を冒頭で案内。
- **スコープ外**: Hooks のステップ実行、Concurrent Mode デバッグなど発展機能は扱わない。
- **螺旋**: 以降のレッスンで「DevTools で確認する」指示が自然に出せる。

---

### 章 5 Next.js（新規 7 本）

#### lesson61: Route Groups で整理する

- **ゴール**: 見た目は同じ URL 体系のまま、ファイル側だけを意味のあるグループに整理できる。レイアウトを一部のページだけに適用できる。
- **新概念**: `(group)/` の命名規則（`()` で囲むと URL に出ない）/ グループ内の `layout.tsx` / 認証後ページだけ共通レイアウト、など典型的な使いどころ。
- **演習**: `app/(public)/page.tsx`、`app/(public)/about/page.tsx`（公開側）と `app/(app)/todos/page.tsx`（アプリ側）に分け、`app/(app)/layout.tsx` に「アプリ用サイドバー」を置く。URL は `/` `/about` `/todos` のままで変わらないことを確認する。
- **スコープ外**: 並列ルート（`@slot/page.tsx`）、インターセプトルートは本コースで扱わない。
- **螺旋**: lesson60 共通レイアウトの拡張として自然に入る。

#### lesson64: `next/image` で画像最適化

- **ゴール**: `<Image>` コンポーネントで画像の自動最適化（遅延読み込み、サイズ最適化、WebP 変換）を使える。外部 URL のホストを `next.config.ts` に登録できる。
- **新概念**: `import Image from "next/image"` / `<Image src width height alt>` / 必須の `width` / `height` / ローカル画像のインポート（`import heroImg from "./hero.png"`）/ `next.config.ts` の `images.remotePatterns`。
- **`remotePatterns` の正しい書式**（本文で明示）:
  ```ts
  // next.config.ts
  const nextConfig: NextConfig = {
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "placehold.jp", pathname: "/**" },
      ],
    },
  };
  ```
  Next.js 15 では `{ protocol, hostname, pathname }` のオブジェクト配列。`hostname` だけの書き方は非推奨。
- **演習**: lesson59 で作った `/about` の `<img src="https://placehold.jp/300x200.png" />` を `<Image>` に差し替え、上記 `remotePatterns` を追加。レスポンシブ表示（`sizes` 属性）も紹介。
- **スコープ外**: `priority` や LCP 最適化の深掘り、`localPatterns`（Next.js 15.3 以降）は扱わない。

#### lesson65: `next/font` でフォント

- **ゴール**: Web フォントを FOIT / FOUT なく読み込める。ローカルフォントと Google Fonts を扱える。
- **新概念**: `next/font/google`（`import { Inter } from "next/font/google"`）/ `next/font/local`（`import localFont from "next/font/local"`）/ `font.className` を `<body>` や `<html>` に付与 / 自動で最適化（self-host、サブセット）される仕組み。
- **演習**: `Inter` を読み込んで `app/layout.tsx` で `<html className={inter.className}>` に適用。日本語対応の `Noto Sans JP` も使い分ける。
- **スコープ外**: `variable` font / `display: "swap"` の細部は紹介だけ。

#### lesson70: Route Handlers（`app/api/.../route.ts`）

- **ゴール**: Server Actions ではなく、HTTP API として JSON を返すエンドポイントを作れる。`GET` / `POST` の使い分けができる。Server Actions との使い分けの指針を持てる。
- **新概念**: `app/api/xxx/route.ts` / `export async function GET(request: Request)` / `NextResponse.json(...)`（`next/server` からの import を基本とする）/ リクエストボディ（`await request.json()`）。
- **Server Actions との使い分け（本文で表を必ず掲載）**:
  | 用途 | Server Actions | Route Handlers |
  |---|---|---|
  | 同一 Next.js 内のフォーム送信 | 主役 | サブ |
  | 外部クライアント（モバイル / 他サイト）が叩く | 不可 | 主役 |
  | 戻り値を UI に結合 | `useActionState` で楽 | 手動で fetch + state |
  | 認証ヘッダや CORS が必要 | 向かない | 向く |
- **演習**:
  1. `app/api/todos/route.ts` で `GET`（一覧 JSON を返す）と `POST`（JSON ボディから 1 件追加）を実装
  2. ブラウザの DevTools Console から `fetch('/api/todos')` して動作確認
  3. **型ガード回収**: 受信した JSON を `isTodoArray(data)` で検証し、失敗時はエラー表示する小さな Client Component を書く（章 3 lesson37 の `isTodo` を import して使う）
- **螺旋**: 章 2 lesson27 `fetch` が章 5 で「自分のサーバーを叩く」形で再登場。章 3 lesson37 型ガードが受信検証で使われる。
- **Edge ランタイムの注記**: Route Handlers はデフォルトで Node.js ランタイム。Edge ランタイム（lesson71 Middleware で触れる）では使えない Node API がある旨を 1 段落で紹介。
- **スコープ外**: OpenAPI / REST 設計論 / Zod 等のバリデーションライブラリは扱わない（実務では Zod が多いことだけ一言紹介）。

#### lesson71: Middleware で認証前処理

- **ゴール**: `middleware.ts` を使ってリクエストに割り込み、認証状態に応じてリダイレクトなどの前処理ができる。Edge ランタイムの制約を理解する。
- **新概念**: `middleware.ts`（プロジェクトルート直下）/ `export function middleware(request: NextRequest)` / `NextResponse.redirect` / `NextResponse.next` / `matcher` で適用範囲を絞る / Edge ランタイムで動くため `fs` 等の Node API が使えない点。
- **演習**:
  1. `/todos` にアクセスしたとき、Cookie `auth` が無ければ `/login` にリダイレクトする最小の例を作る
  2. **`/login` 疑似ページ** を作成し、「ログイン」ボタンクリックで `document.cookie = "auth=1"` を実行して `/todos` に遷移する動線を用意（DevTools から手動で Cookie を足す代わりに、ワンクリックで試せるようにする）
- **スコープ外**: 本格的な認証（NextAuth など）、JWT 検証、セッション管理は扱わない。
- **螺旋**: lesson70 Route Handlers でも Cookie を読めること、認証済みユーザーだけが叩けるエンドポイントの発展に繋がる。

#### lesson72: 環境変数の基本

- **ゴール**: ローカル開発で環境変数を読める。`NEXT_PUBLIC_` プレフィックスの意味を理解する。シークレット（サーバー専用）と公開値（クライアント露出）の違いを区別できる。
- **新概念**: `.env.local` / `process.env.MY_VAR` / `NEXT_PUBLIC_` プレフィックス（付けないとクライアントには届かない）/ `.env.local` は `.gitignore` に入っている前提 / サーバー側コード vs クライアント側コードでの読み取りの違い。
- **演習**: `NEXT_PUBLIC_APP_NAME` を `.env.local` に書き、`app/page.tsx` で `process.env.NEXT_PUBLIC_APP_NAME` として表示。サーバー側（Server Component や Route Handlers）では `NEXT_PUBLIC_` なしの変数も読めることを確認。
- **スコープ外**: Vercel ダッシュボードでの設定は lesson75（Vercel デプロイ）でまとめて扱う。シークレット管理ベストプラクティス（Vault など）は扱わない。
- **螺旋**: lesson75 でローカルの `.env.local` を Vercel の Environment Variables に持っていく手順に自然に繋がる。

#### lesson74: Tailwind CSS の紹介（次のステップとしての実務用 CSS）

- **ゴール**: Tailwind CSS v4 のユーティリティクラスで CSS を書く方式を理解する。本コースの「自分で CSS を書く」方式との違いを説明できる。Next.js プロジェクトに Tailwind v4 を導入する手順を知る。
- **新概念（Tailwind v4 準拠）**:
  - ユーティリティファースト CSS / クラス名として `p-4 text-lg text-blue-500` を重ねる書き方
  - **Tailwind v4 の導入は `@import "tailwindcss";` の 1 行で済む**（v3 の `@tailwind base/components/utilities` の 3 行や `tailwind.config.ts` / `init` コマンドは廃止）
  - PostCSS 設定の変化（`@tailwindcss/postcss` プラグインを入れるだけ）
  - `create-next-app` の `--tailwind` オプション（デフォルトで v4 がセットアップされる）
- **演習**: `create-next-app` で `--tailwind` 付きの新規プロジェクトを試しに作り、デフォルトで設定されている Tailwind v4 の `@import "tailwindcss";` を観察する。`/about` のカード 1 枚を Tailwind のクラスで書き直す（任意）。
- **本コースのスタンス**: 「実務では Tailwind（または CSS Modules / CSS-in-JS）が多いが、本コースでは CSS の本質を理解するために素の CSS で書いてきた。Tailwind は **次のステップ** として学ぶ選択肢」と明記。
- **スコープ外**: Tailwind v4 の `@theme` / CSS 変数連携 / `@apply` / プラグインなど深掘りは扱わない。

---

## 既存レッスンの番号振り替え時のタスク

### 作業手順

1. `docs/lessons/lessonXX/` を新しい番号にディレクトリリネームする（`git mv`）
2. 各レッスン本文の「lessonXX で学んだ」「次の lessonXX で扱う」等のクロスリファレンスを新番号に置換
3. サイドバー `docs/.vitepress/config.mts` を 75 レッスンに更新
4. ミニ統合レッスン（lesson11 / lesson30 / lesson57 / lesson73）内の依存関係を再確認
5. 新規 22 レッスンを追記

### クロスリファレンス置換の対応表（代表例）

| 旧 | 新 |
|---|---|
| lesson11 | lesson11（変化なし） |
| lesson12-25 | lesson15-30（+3） |
| lesson26-31 | lesson31-36-40（挿入を挟むため不連続）|
| lesson32-42 | lesson41-57（挿入を挟むため不連続）|
| lesson43-53 | lesson58-75（挿入を挟むため不連続）|

実際の番号変換は後続の作業で正確に対応させる（スクリプト化する価値がある）。

## レビュー観点（自己チェック）

- [ ] 各レッスンで導入概念が実質 1 つ（統合は例外）
- [ ] 前レッスンで未説明の概念を突然使っていない
- [ ] 演習が「ゴール + 期待出力」で書ける粒度
- [ ] 統合レッスン（11 / 30 / 57 / 73）は前章までの知識だけで解ける
- [ ] React 19 / Next.js 15 最新 API 準拠
- [ ] 螺旋構造: 章 1 自己紹介 → lesson59 / lesson64（画像）, 章 2 TODO → lesson57 / lesson68-73, 章 3 判別共用体 → lesson47 useReducer, 章 3 型ガード → lesson70 Route Handlers
- [ ] ダークモード色指定、絵文字なし、体言止め
