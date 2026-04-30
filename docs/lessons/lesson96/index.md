# lesson96: セマンティック HTML とアクセシビリティの基礎

## ゴール

- なぜアクセシビリティ（a11y）に配慮するかを自分の言葉で説明できる
- セマンティック HTML が a11y の土台になる理由を理解する
- ランドマーク要素（`<header>` / `<nav>` / `<main>` / `<aside>` / `<footer>`）の役割を説明できる
- 見出し階層（`<h1>`〜`<h6>`）を正しく並べられる
- 画像の `alt` 属性とフォームの `<label>` の役割を説明できる
- WCAG の **コントラスト比** の基準（AA / AAA）を知っている

## 解説

### なぜアクセシビリティ（a11y）に配慮するか

アクセシビリティ（accessibility、略して **a11y**）は「**すべてのユーザーがウェブを使える状態** にする」取り組みです。対象は次のような利用者です。

- **視覚に関するもの**: 全盲 / 弱視 / 色覚特性のある人（スクリーンリーダーを使う、拡大表示する、コントラストが低いと読めない）
- **聴覚に関するもの**: 聴覚を使いにくい人（動画の字幕が必要）
- **運動に関するもの**: マウスを使いにくい人（キーボードや音声コマンドで操作する）
- **認知に関するもの**: 複雑な UI や素早い動きが苦手な人

さらに **誰にとっても役立つ** 場面も多くあります。

- スマホを片手で操作する状況（大きなタップ領域が欲しい）
- 日差しの強い屋外（高コントラストが欲しい）
- 満員電車で音が出せない（字幕が欲しい）
- キーボード派の開発者（Tab で操作したい）

2026 年現在、**WCAG 2.2**（Web Content Accessibility Guidelines 2.2）が国際標準で、政府・公共機関や大企業のサイトでは AA 準拠が事実上の必須になっています。開発者の側でも「動くだけ」ではなく「みんなが使える」を最低ラインとして出荷するのが当たり前になってきました。

### セマンティック HTML が土台

**セマンティック HTML** とは「見た目ではなく **意味** を表す HTML を書く」ことです。タイトルには `<h1>`、本文の段落には `<p>`、ナビゲーションには `<nav>` のように、タグに役割を持たせます。

見た目だけなら `<div>` と CSS だけでも作れますが、**機械（ブラウザ / スクリーンリーダー / 検索エンジン / AI エージェント）には意味が伝わりません**。

NG（見た目だけ）:

```html
<div class="big-text">記事タイトル</div>
<div class="paragraph">本文...</div>
<div class="link" onclick="go()">続きを読む</div>
```

OK（意味を持たせる）:

```html
<h1>記事タイトル</h1>
<p>本文...</p>
<a href="/next">続きを読む</a>
```

スクリーンリーダーは `<h1>` を「見出しレベル 1」と読み上げます。`<a>` を「リンク」と説明します。`<div>` ではそれが起きません。

**「a11y のために ARIA を足す」より前に、「セマンティック HTML を正しく書く」ことが 7〜8 割を占める** と覚えてください。

### ランドマーク要素でページを 5 つの場所に分ける

ページは大きく次の 5 つの **ランドマーク**（目印）に分けられます。スクリーンリーダーはこれらの要素を「ランドマーク一覧」で見せてくれるので、「ヘッダーに飛ぶ」「メイン本文に飛ぶ」が即座にできます。

| タグ | 役割 |
|---|---|
| `<header>` | ページ上部。サイトロゴやナビが入る |
| `<nav>` | ナビゲーション。主要リンクをまとめる場所 |
| `<main>` | ページの **メインコンテンツ**。1 ページに 1 つだけ |
| `<aside>` | 補足情報・サイドバー |
| `<footer>` | ページ下部。コピーライト・連絡先など |

典型的な構成:

```html
<body>
  <header>
    <h1>私のブログ</h1>
    <nav>
      <a href="/">ホーム</a>
      <a href="/posts">記事一覧</a>
      <a href="/about">自己紹介</a>
    </nav>
  </header>

  <main>
    <h2>今日の記事</h2>
    <p>本文...</p>
  </main>

  <aside>
    <h2>関連記事</h2>
    <ul>
      <li><a href="/posts/1">別の記事</a></li>
    </ul>
  </aside>

  <footer>
    <p>&copy; 2026 オザキ</p>
  </footer>
</body>
```

`<header>` と `<footer>` はページ全体のもの以外に、`<article>` や `<section>` の中にも置けます（そのブロックのヘッダー / フッターになる）。

### 見出し階層は飛ばさない

`<h1>`〜`<h6>` は **必ず 1 つずつ降りていく** のが原則です。`<h1>` の次に急に `<h3>` を使うと、スクリーンリーダーの読み上げで「2 段下がった！何か抜けた？」と混乱します。

```html
<!-- NG: h1 → h3 で h2 が飛んでいる -->
<h1>記事タイトル</h1>
<h3>サブセクション</h3>

<!-- OK: h1 → h2 → h3 の順 -->
<h1>記事タイトル</h1>
<h2>章</h2>
<h3>サブセクション</h3>
```

また `<h1>` は **1 ページに 1 つ** が基本です（HTML5 の `<section>` 内でも `<h1>` を使える仕様はありますが、対応のばらつきがあるので本コースでは 1 ページ 1 個に統一します）。

### 画像には `alt`、フォーム入力には `<label>`

スクリーンリーダーは画像の中身を「見る」ことはできません。代わりに **`alt` 属性** のテキストを読み上げます。

```html
<!-- 情報を持つ画像: 内容を説明 -->
<img src="/graph.png" alt="2026 年の売上グラフ。4 月で前年比 20% 増" />

<!-- 装飾だけの画像: 空文字で OK（読み飛ばされる） -->
<img src="/decoration.png" alt="" />
```

`alt` を書かないと、スクリーンリーダーはファイル名（`graph.png`）を読み上げてしまい、意味を伝えられません。**飾りなら空文字、情報を持つなら説明文** が原則です。

フォームも同じで、`<input>` には **`<label>`** を必ず紐付けます。

```html
<!-- NG: input 単独はラベルなし -->
<p>お名前</p>
<input type="text" />

<!-- OK: label と for / id で紐付ける -->
<label for="name">お名前</label>
<input id="name" type="text" />

<!-- OK: label で input を包む -->
<label>
  お名前
  <input type="text" />
</label>
```

`<label>` があると、スクリーンリーダーは「お名前、テキスト入力、空」のように読み上げます。ラベル部分をクリックすると入力欄にフォーカスが移るので、晴眼者にも扱いやすくなります。

### コントラスト比: 見える色の組み合わせを選ぶ

文字色と背景色のコントラストが低いと、弱視の人や日差しの強い環境では読めません。WCAG は **数値の基準** を定めています。

| 対象 | AA（実用レベル） | AAA（高水準） |
|---|---|---|
| 通常のテキスト（〜18px） | 4.5:1 以上 | 7:1 以上 |
| 大きなテキスト（18pt 太字 or 24px 以上） | 3:1 以上 | 4.5:1 以上 |
| UI 部品の境界線・アイコン | 3:1 以上 | — |

コントラスト比は **Chrome DevTools の Elements タブ** で確認できます。スタイルペインで色をクリックすると、自動で計算してくれます。Lighthouse の Accessibility スコアも 4.5:1 未満を警告してくれます。

数字を自分で計算する必要はありません。実務では次のような定番ツールを使います。

- Chrome DevTools（CSS の color プロパティをクリック）
- WebAIM Contrast Checker（<https://webaim.org/resources/contrastchecker/>）
- Figma のコントラストチェッカープラグイン

ダークモードで `color: #808080` のような中間色を使うと、背景がダーク（`#1a1a1a`）でもライト（`#ffffff`）でもギリギリ読めない、という事故が起きがちです。ライト / ダーク双方でチェックする習慣をつけてください。

### `lang` 属性で言語を明示する

ページの言語を `<html lang="ja">` で指定します。スクリーンリーダーが適切な発音（日本語 / 英語）で読み上げるのに使われます。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    ...
```

本コースのこれまでの演習でもすべて `lang="ja"` を付けてきました。**サイトごとに 1 回設定するだけで良い** 基本です。

## 演習

::: tip この3レッスンについて
「セマンティック HTML とアクセシビリティの基礎」（このレッスン）・「ARIA 属性とキーボード操作」・「アクセシビリティの自動チェック」は **3部構成**で設計されています。順番に進めると理解が積み上がります。
:::

### ゴール

- `<div>` だらけのページをセマンティック HTML に書き換える
- 見出し階層を正しく並べ直す
- 画像に適切な `alt` 属性を付ける
- フォームに `<label>` を付ける
- DevTools でコントラスト比を確認する

### 途中から始める場合

このレッスンは独立しています。新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開いて、下の出発点のコードを貼ってください。

<details>
<summary>出発点のコード（<code>div</code> だらけの NG パターン）</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>a11y の練習</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <div class="top">
      <div class="logo">私のブログ</div>
      <div class="menu">
        <div onclick="location.href='/'">ホーム</div>
        <div onclick="location.href='/posts'">記事一覧</div>
      </div>
    </div>

    <div class="body">
      <div class="title">今日の記事</div>
      <div class="para">本文です。本文です。本文です。</div>

      <div class="sub">サブセクション</div>
      <div class="para">サブ本文です。</div>

      <img src="https://placehold.co/300x200.png" />

      <div class="form">
        <div>お名前</div>
        <input type="text" />
        <div>メール</div>
        <input type="email" />
        <div onclick="submit()">送信</div>
      </div>
    </div>

    <div class="bottom">
      <div>&copy; 2026 オザキ</div>
    </div>
  </body>
</html>
```

**`style.css`**

```css
body {
  font-family: sans-serif;
  color: #cccccc;
  background: #ffffff;
  margin: 0;
}
.top, .bottom { background: #e0e0e0; padding: 16px; }
.menu div { display: inline-block; margin-right: 12px; cursor: pointer; color: #4da6ff; }
.title { font-size: 24px; font-weight: bold; }
.sub { font-size: 18px; font-weight: bold; }
.para { margin: 8px 0; }
.body { padding: 16px; }
.form div[onclick] { display: inline-block; background: #eeeeee; color: #aaaaaa; padding: 6px 12px; cursor: pointer; }
```

</details>

### 手順

1. `index.html` を **セマンティック HTML** に書き換えます（下の完成形を参照）。
2. `style.css` の **コントラスト比** を上げて、文字が読みやすくなるよう修正します。
3. DevTools で確認します。

### `index.html` の完成形

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>a11y の練習</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <header>
      <h1>私のブログ</h1>
      <nav>
        <a href="/">ホーム</a>
        <a href="/posts">記事一覧</a>
      </nav>
    </header>

    <main>
      <article>
        <h2>今日の記事</h2>
        <p>本文です。本文です。本文です。</p>

        <h3>サブセクション</h3>
        <p>サブ本文です。</p>

        <img
          src="https://placehold.co/300x200.png"
          alt="記事の挿絵（プレースホルダ画像）"
          width="300"
          height="200"
        />
      </article>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">お問い合わせ</h2>
        <form>
          <p>
            <label for="name">お名前</label>
            <input id="name" type="text" />
          </p>
          <p>
            <label for="email">メール</label>
            <input id="email" type="email" />
          </p>
          <button type="submit">送信</button>
        </form>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 オザキ</p>
    </footer>
  </body>
</html>
```

変更点の理由:

- `<div class="top">` → `<header>`、`<div class="menu">` → `<nav>`、`<div class="body">` → `<main>`、`<div class="bottom">` → `<footer>` にしてランドマーク化
- `<div class="title">` → `<h2>`、`<div class="sub">` → `<h3>` で見出し階層を明示（`<h1>` はサイトタイトルで使っている）
- クリック可能な `<div>` を `<a>` / `<button type="submit">` に変更（キーボードで操作できるようになる）
- `<img>` に `alt` / `width` / `height` を付与
- `<input>` に `<label>` を紐付け
- `<html lang="ja">` で言語を明示

### `style.css` の完成形

```css
body {
  font-family: sans-serif;
  color: #1a1a1a;        /* #cccccc → #1a1a1a（コントラスト比を大幅に改善）*/
  background: #ffffff;
  margin: 0;
}

header, footer {
  background: #1e3a8a;   /* #e0e0e0 → #1e3a8a */
  color: #ffffff;
  padding: 16px;
}

header h1 {
  margin: 0 0 8px 0;
}

nav a {
  color: #ffffff;        /* #4da6ff → #ffffff（青背景に白文字）*/
  margin-right: 16px;
}

main {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

button[type="submit"] {
  background: #1e3a8a;   /* #eeeeee → 濃い青 */
  color: #ffffff;        /* #aaaaaa → 白 */
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"]:focus {
  outline: 3px solid #60a5fa;  /* フォーカスリングを明示 */
  outline-offset: 2px;
}
```

### 期待出力

- ページ上部の見出しが大きく表示され、下のナビが横に並ぶ
- 本文の見出しが 2 段階に階層化されて表示される
- 画像が表示される（`alt` はマウスオーバーで一部のブラウザで表示される）
- フォームの「お名前」「メール」をクリックすると入力欄にフォーカスが移る
- Tab キーで「ホーム」リンク → 「記事一覧」リンク → お名前入力 → メール入力 → 送信ボタンと順に移動できる
- 送信ボタンにフォーカスを移すと、太い青のフォーカスリングが見える

### 確認ポイント（DevTools）

Chrome の DevTools で以下を確認します。

1. **Elements タブ**: `<h1>` `<h2>` `<h3>` が見出し階層として並んでいる。`<main>` `<header>` `<footer>` `<nav>` がランドマークとして使われている
2. **Lighthouse タブ**: 「Accessibility」を単独で選んでレポートを生成。スコアが 90 以上になる
3. **コントラスト比**: Elements で `body` の `color` をクリックすると、自動で計算された `Contrast ratio` が右側に出る。AA（4.5:1 以上）を満たしていることを確認

### 変える

- `body` の `color` を `#808080` に変えてみる。Lighthouse で「Background and foreground colors do not have a sufficient contrast ratio」の警告が出ることを確認
- `<h2>` を削って、いきなり `<h3>` から始めてみる。Lighthouse が「Heading elements are not in a sequentially-descending order」と警告する
- `<img>` の `alt` を消してみる。Lighthouse が「Image elements do not have `[alt]` attributes」と警告する

### 自分で書く

- `<main>` の下に「記事一覧」セクションを追加し、`<section>` でくるむ。各記事は `<article>` にして、`<h3>` のタイトル + `<p>` の要約を 3 件並べる
- フォームの `<input>` に `required` を付け、送信ボタンにキーボードで Tab → Enter で送信できることを確認する

## まとめ

- アクセシビリティは「誰でも使える」状態を目指すこと。WCAG 2.2 が 2026 年の国際標準
- **セマンティック HTML が a11y の土台**。`<div>` + `role=...` より `<nav>` / `<main>` / `<h1>` のような意味のあるタグを優先
- ランドマーク要素（`<header>` / `<nav>` / `<main>` / `<aside>` / `<footer>`）でページを整理
- 見出しは `<h1>` → `<h2>` → `<h3>` の順に飛ばさず降りる。`<h1>` はページに 1 つ
- 画像には `alt`、フォームには `<label>` を必ず
- コントラスト比は本文 **4.5:1** 以上が AA（実用レベル）
- `<html lang="ja">` で言語を明示
