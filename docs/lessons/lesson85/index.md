# lesson85: DevTools の読み方

## ゴール

- Chrome DevTools の主要なタブ（Elements / Console / Network / Application / Performance / Sources）がそれぞれ何を見る場所か説明できる
- ページを開いたときに発生している全リクエストを Network タブで一覧できる
- Application タブで Cookie / Local Storage / Session Storage を確認できる
- Performance タブで録画したページロードを眺めて、どの段階が遅いか大まかに判断できる
- Sources タブで JS のブレークポイントを貼って止められる

## 解説

### DevTools はブラウザ付属の開発ツール

DevTools はブラウザ本体に組み込まれた、開発者向けの道具箱です。本コースで **最もよく使う 1 つの道具** と言えます。Chrome を例に説明しますが、Edge / Firefox / Safari にも同等の機能があります。名称が少し違うだけで考え方は同じです。

### 開き方

| 操作 | ショートカット |
|---|---|
| DevTools を開く / 閉じる | Windows / Linux: `F12` または `Ctrl+Shift+I` / Mac: `Cmd+Opt+I` |
| 直接 Elements タブを開く | ページで右クリック → 「検証」 |
| 直接 Console を開く | Windows / Linux: `Ctrl+Shift+J` / Mac: `Cmd+Opt+J` |
| デバイスモード（スマホ幅） | `Ctrl+Shift+M` / `Cmd+Shift+M` |

### Elements タブ: DOM と CSS を見る・いじる

「DOM を操作する」で扱った **DOM ツリー** の現在状態が、ここに展開されます。左側のタグをクリックすると、ページ内の対応要素がハイライトされます。右側には、その要素に当たっている **計算済みの CSS** と、どの CSS ファイルの何行目から来たかが表示されます。

覚えておきたい操作:

- タグをダブルクリックすると中身のテキストを編集できる（プレビュー確認用、保存されない）
- 右ペインの `Styles` でプロパティのチェックを外すと **その場で無効化** できる（どのスタイルが効いているかの切り分けに便利）
- `Computed` タブで、実際に当たっている最終値（ブラウザが計算した後のピクセル値など）を確認
- `Box Model` 図で margin / border / padding / content のサイズを数値で確認

本コースの 1 章（HTML / CSS）の演習中、画面が思った通りに並ばないときは、まずここで **どのスタイルが当たっているか** を目で確認するのが近道です。

### Console タブ: JS を打つ・ログを見る

「デバッグに効く Console API」で扱った `console.log` 系の出力がここに流れ込みます。さらに **その場で JS を打って実行できる** のが Console の強みです。

```js
// Console に直接打って Enter
document.title
> "lesson85: DevTools の読み方"

document.querySelectorAll("a").length
> 18
```

エラーが出たときは Console にスタックトレースが出ます。行番号をクリックすると、該当ファイルが Sources タブで開きます。

`console.log` をコードに書き足さなくても、Console に現在のページの値を問い合わせられる、というのは画面を書き換えずに調査できる大きな武器です。

### Network タブ: 通信を見る

「ブラウザと HTTP の基本」で触った、**リクエスト / レスポンスの実物** をここで観察します。

主な見どころ:

- **一覧**: ページを開いたときに発生した全リクエストが時系列に並ぶ
- **Method / Status / Type / Size / Time**: 各列で「どのメソッドでどのファイルをどう取ったか」がわかる
- **1 行クリック**: Headers / Payload / Preview / Response / Timing の 5 つのパネルで詳細
- **Preserve log**: チェックすると、ページ遷移しても過去のログが消えない（リダイレクトの追跡に便利）
- **Disable cache**: DevTools を開いているあいだ、ブラウザキャッシュを無効化する（キャッシュ確認用。通常はオフにしておく）
- **Throttling**: 「Slow 3G」などに切り替えて回線が遅い状況を再現できる

Network タブのフィルタ行（`All` / `Fetch/XHR` / `JS` / `CSS` / `Img` / `Doc` 等）を切り替えると種類ごとに絞り込めます。API のデバッグなら `Fetch/XHR` が便利です。

### Application タブ: 保存されているデータを見る

ブラウザ側に溜まっている各種ストレージの中身を確認・編集できます。

- **Local Storage / Session Storage**: 「Web Storage」で保存した値が、キーと値のペアで見られる。その場で編集・削除も可能
- **Cookies**: 現在のドメインに対する Cookie 一覧。`Name` / `Value` / `Domain` / `HttpOnly` / `Secure` / `SameSite` などの属性が一覧できる
- **IndexedDB**: より大容量のデータベース系 API。本コースでは扱わないが眺めるだけはしておく
- **Cache Storage**: Service Worker が保存しているキャッシュ
- **Service Workers**: 登録されている Service Worker（本サイトでも PWA で 1 つ登録されている）

「Web Storage」と「Cookie と Web セキュリティ」の内容を実地で確認する場所です。

### Performance タブ: ページロードと実行を録画する

`Record` ボタン（黒丸）を押して一連の操作 → `Stop` を押すと、その間のブラウザの挙動が細かく記録されます。

- **FPS**: 描画フレームレートの推移
- **Main**: メインスレッドが何をしていたか（JS 実行 / スタイル計算 / レイアウト / 描画）の時間軸
- **Network**: 各リクエストの発生と完了のタイミング
- **Frames**: 個々の描画フレームのスクリーンショット

「重くなるとこ」「レンダリングが遅い原因」を特定する大元の道具ですが、最初は `Performance insights` パネル（Chrome の新機能、自動で問題点を教えてくれる）を使うと敷居が下がります。

### Sources タブ: JS をデバッガで止める

ソースコードを眺めて、行番号をクリックすると **ブレークポイント** が貼れます。そこに実行が到達すると、その行で JS が一時停止し、変数の値を確認できます。

- **行番号クリック**: 基本のブレークポイント
- **右クリック → Conditional breakpoint**: 条件式が真のときだけ止まる
- **`debugger;` 文**: コード側に書いておけば、その行に来たときに止まる
- **Watch / Scope**: 止まっている時点での変数の値を確認

`console.log` で追うより一段深い調査が必要なときに使います。本コースでは軽く紹介するに留めますが、使えるようになるとバグ探しの速度が何倍にもなります。

### ショートカットで覚えておくと捗るもの

- **`Ctrl+Shift+F` / `Cmd+Opt+F`**: 全ソース横断検索（Sources タブ）。ライブラリ内を含めて grep できる
- **`Ctrl+P` / `Cmd+P`**: Sources でファイル名クイックオープン
- **`Ctrl+L` / `Cmd+K`**: Console を全消去
- **`$0`**: Elements タブで最後に選択した要素を Console から参照

### モバイル / レスポンシブ確認: デバイスモード

`Ctrl+Shift+M` / `Cmd+Shift+M` でツールバー上部にデバイス選択が出ます。`iPhone SE (375×667)` / `Pixel 7` / 任意サイズ（Responsive）で表示を切り替えられます。1 章 の「Flexbox とレスポンシブ」や「CSS Grid」の演習で使ったはずです。

「メディアを確認」（`more options` メニュー内）で `prefers-color-scheme: dark` / `prefers-reduced-motion` などを強制的にオン / オフできます。ダークモード対応の確認に便利です。

## 演習

### ゴール

- DevTools を 1 通り触って、本文で説明した各タブの役割を体感する
- Application タブで本サイトの localStorage を確認する
- Network タブで 1 リクエストを選び、ヘッダ・ボディ・Timing を読み取れる
- Performance タブでページロードを録画して眺める

### 手順

本サイト（この教材）のページを開いた状態で、以下を順に試します。

1. **Elements タブ**
   - F12 で DevTools を開く
   - 左のツリーで `<body>` を展開し、見出しや段落のタグを辿る
   - 右ペインの `Styles` で、見出しの `color` のチェックを外して色が消えることを確認（再度チェックで戻る）
2. **Console タブ**
   - `document.title` と打って Enter、ページタイトルが返ることを確認
   - `document.querySelectorAll("h2").length` で、このページの `<h2>` の個数を取得
3. **Network タブ**
   - ページをリロード（`F5` / `Cmd+R`）
   - 一覧のうち **`.js`** の 1 つをクリックし、`Headers` タブで `status: 200` と `content-type: application/javascript` を確認
   - `Timing` タブで TTFB（Time To First Byte）と Content Download の 2 つの時間を確認
4. **Application タブ**
   - 左ペインから `Local Storage` → `https://...`（このサイトの URL）を選択
   - `lesson-progress` 系のキーがあれば、それは「完了ボタン」を押した進捗データ
   - 試しに 1 つのキーを選んで **Delete ボタン** で消す → ページをリロード → 該当レッスンの完了マークが消えることを確認
5. **Performance タブ**
   - 左上の丸い `Record` ボタンを押す
   - ページを一度リロード
   - 5 秒ほど経ったら `Stop`
   - `Main` 行をドラッグで拡大して、どの時間帯に何が起きていたか（Loading / Scripting / Rendering 等の色分け）を眺める
6. **Sources タブ**
   - 左ペインで **Workers** / **Origin** を展開し、自分のサイトの `.js` ファイルを 1 つ開く
   - 行番号をクリックしてブレークポイントを貼る
   - ページをリロード → 該当行で停止することを確認（停止したら上部の再生ボタンで続行）

### 変える

- Network タブで `Disable cache` のチェックを入れて、もう一度リロードする。Size 列に `(memory cache)` や `(disk cache)` と出ていた行が **実サイズ** になることを確認
- Network タブの Throttling を `Slow 4G` に切り替え、ページをリロード。感覚として遅くなることと、Timing の値が伸びることを確認。元に戻す
- デバイスモード（`Ctrl+Shift+M` / `Cmd+Shift+M`）で iPhone SE を選び、本サイトのレイアウトがスマホ向けに切り替わることを確認

### 自分で書く

- 自分でよく開くサイト（SNS / ニュース / ポートフォリオなど）で Network タブを開き、**HTML 1 つ読むのに何個のリクエストが発生しているか** 数える
- そのうち Status が `304`（キャッシュ使用）になっているリクエストの数もメモしておく（別のレッスンでキャッシュの仕組みを扱う）

## まとめ

- DevTools は開発の生命線。`F12` や右クリック「検証」で常に開ける場所にしておく
- **Elements**: DOM と CSS を見る・いじる。スタイルのチェック外しで切り分け
- **Console**: ログ閲覧 + その場で JS 実行
- **Network**: 通信の全履歴。メソッド / ステータス / Timing / ヘッダ / ボディ
- **Application**: Web Storage / Cookie / IndexedDB / Service Worker
- **Performance**: 録画してページロードや JS 実行のボトルネックを可視化
- **Sources**: JS にブレークポイントを貼ってデバッガで止める
- デバイスモードで画面幅や prefers-color-scheme を強制切り替え
- 別のレッスンで、Network タブの `304 Not Modified` の正体、つまり **HTTP キャッシュ** の仕組みを扱う
