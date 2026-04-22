# lesson56: React DevTools（Components / Profiler）

## ゴール

- React Developer Tools ブラウザ拡張をインストールできる
- Components パネルでツリーと state / props を観察できる
- Profiler パネルで再レンダリングの回数と所要時間を測定できる
- lesson54 で書いた `useMemo` が本当にスキップしているかを確認できる

## 解説

### React DevTools とは

React 公式の **ブラウザ拡張機能** です。Chrome / Firefox / Edge で使えます。インストールすると、ブラウザ標準の DevTools に **2 つのパネル** が追加されます。

- **Components**: React のコンポーネントツリーを可視化。各コンポーネントの state / props を見られる。値の書き換えもできる
- **Profiler**: 再レンダリングを記録して、どのコンポーネントが何回再描画され、何 ms かかったかを測定

素の JS のときは DevTools の Elements パネルで DOM を見れば十分でした。React では **JSX → DOM の間に「コンポーネントツリー」** があり、そのツリーを直接観察できるのが DevTools の強みです。

### インストール

1. Chrome ウェブストアで [React Developer Tools](https://chromewebstore.google.com/detail/fmkadmapgofadopljbjfkapdkoienihi) を検索してインストール（Firefox は Add-ons）
2. React を使うサイトを開くと、拡張アイコンが有効（青）になる
3. DevTools を開くと「Components」「Profiler」の 2 つのタブが現れる

### StackBlitz での制約（重要）

StackBlitz のプレビュー画面は **iframe の中で動いている** ため、DevTools が親ページ側を見てしまい、React ツリーが拾えないことがあります。

回避策:

- プレビュー右上の **「Open in New Tab」ボタン** をクリックしてプレビューを **別タブ** で開く
- 別タブで開いた画面で DevTools を起動すれば、React ツリーが正しく表示される

それでも拾えない場合の代替動線:

- **CodeSandbox** で同じコードを開く（こちらはプレビューが同一オリジンで動くことが多い）
- **ローカルで `npm run dev`** を走らせる（StackBlitz に HMR / DevTools が噛み合わない時の最終手段）

本コースはブラウザ完結を建前にしていますが、DevTools の挙動は環境差が出やすい領域です。うまく動かなければ本レッスンの演習はスキップしてもらって構いません（機能理解だけ押さえて先に進めます）。

### Components パネルの使い方

- 左に **コンポーネントツリー** が表示される（`<App>` → `<TodoInput>`、`<TodoList>` → ...）
- コンポーネントをクリックすると、右側に **props / hooks（state）** が展開される
- **state の値をその場で書き換え** もできる（デバッグに便利）
- ツールバーの歯車 → General で「Highlight updates when components render.」を有効にすると、**再レンダリングした要素の周囲が一瞬光る** ようになる。これが最初の観察ツール

### Profiler パネルの使い方

1. Profiler タブを開く
2. 左上の丸い **Record** ボタン（●）を押して記録開始
3. 画面で操作（ボタンクリック、入力など）を何回か行う
4. もう一度 Record ボタン（■）を押して記録停止
5. 記録された **Commit** が一覧で表示される。各 Commit をクリックすると、その瞬間に再レンダリングされたコンポーネントとそれぞれの所要時間が見える

Profiler のキーポイント:

- **灰色** のコンポーネント: 再レンダリングをスキップした
- **色付き**（黄色〜赤）: 再レンダリングした（濃いほど時間がかかった）
- 各コンポーネントにホバーすると「なぜ再レンダリングされたか」（props が変わった / state が変わった / 親が再レンダリングした など）も見える

## 演習

### ゴール

- lesson54 の `useMemo` を使った「1 万件の合計」アプリで、Profiler を使って再計算スキップを確認する

### 手順

1. lesson54 の StackBlitz プロジェクトを開く（もしくは新規に作って lesson54 のコードを貼る）
2. プレビューを「Open in New Tab」で別タブに開く
3. 別タブで DevTools を開き、Components と Profiler のタブが表示されていることを確認

### ステップ 1: Components パネルで観察

1. Components タブを選ぶ
2. 左に `<App>` のツリーが出る。クリックしてみる
3. 右に `State` 欄で `multiplier: 1` / `color: "blue"` のような値が見える
4. ツールバー歯車 → General → 「Highlight updates when components render.」を有効化
5. 画面の「multiplier +1」ボタンを押す → 該当エリアが一瞬枠で囲まれるのが見える
6. 「色を切り替え」を押す → これも枠で囲まれる。ただし実際には内部の計算は走っていない（次のステップで確認）

### ステップ 2: Profiler でスキップ確認

1. Profiler タブを選ぶ
2. 左上の Record ボタン（●）を押す（赤に変わる）
3. 画面で以下を 1 回ずつ押す:
   - 「multiplier +1」
   - 「色を切り替え」
   - 「色を切り替え」
4. 停止ボタン（■）を押す
5. Commit タブに 3 件の Commit が記録されているはず

各 Commit を見ると:

- 1 件目（multiplier +1）: `useMemo` の中身が再計算される
- 2 件目・3 件目（色切り替え）: `useMemo` は再計算されない（灰色表示になる / `total` の値が前回と同じ参照のまま）

### 期待出力

- Console に `computing total...` が **1 回目（multiplier +1）だけ** 出る
- Profiler で「色を切り替え」に対応する Commit では、`App` 全体の再レンダリング時間が小さい
- Components の state 欄で `multiplier` と `color` の値が変わっていくのが見える

これで「`useMemo` が本当に効いている」ことを視覚的に確認できます。

### 変える

- lesson54 の `useMemo` を外してみる → Profiler の同じ操作で、色切り替え時にも Console に `computing total...` が出るようになる
- 「色切り替え」を連打して Profiler で記録 → `useMemo` なしと `useMemo` あり で合計時間を比べる

### 自分で書く（挑戦）

- lesson55 で作った `useTodos` 版の TODO アプリに Profiler をかけ、TODO を 50 件ほど追加して削除ボタンを押したときに `TodoList` がどのくらい時間を使うかを観察する
- 必要なら `TodoItem` を `React.memo` で包み、`useCallback` で `onDelete` / `onToggle` を安定化して、Profiler で再度計測する

### 環境トラブル時

- DevTools に Components / Profiler が出ない → 拡張が無効、または別タブで開いていない
- Profiler が「No profiling data...」と出続ける → Record ボタンを押した **後** に操作しているか確認
- StackBlitz で動かない → CodeSandbox / ローカル実行に切り替え、または本レッスンをスキップ

## まとめ

- React DevTools はブラウザ拡張としてインストールする必要がある
- Components パネル: ツリー / state / props を直接観察できる
- Profiler パネル: 再レンダリングの回数・時間を測定できる
- `useMemo` が本当に効いているかは Profiler で確認するのが確実
- StackBlitz の iframe では動作が不安定。別タブ / CodeSandbox / ローカル実行で回避
- 以降のレッスンでも「DevTools で確認する」指示が自然に出せるようになる
