# lesson11: Flexbox とレスポンシブ

1 章 の総仕上げです。これまで学んだ HTML / CSS をすべて使い、**自己紹介ページをカードが横並びに並ぶ形まで完成させます**。さらに、画面幅によって横並びと縦並びが切り替わる「レスポンシブ」対応も入れます。

想定時間は **60 分** です（1 章 の総仕上げなので通常より長めに取っています）。じっくり手を動かしてください。

## ゴール

- Flexbox（`display: flex`）で要素を横並びにできる。
- `gap` / `justify-content` / `align-items` で間隔や揃え方を指定できる。
- `@media` メディアクエリで「画面幅が狭いときだけ別のスタイルを当てる」ができる。
- これまでのレッスンの知識を統合して、自己紹介ページを完成させる。
- **最終成果物（HTML と CSS）を保存しておき、5 章 の「ページを増やしてリンクで移動する」で Next.js の `/about` ページとして再利用する準備ができている**。

## 解説

### Flexbox とは何か

ブロック要素は上から下に縦に積まれます。横に並べたいときには、昔はいろいろな技（`float`、`display: inline-block`）が使われていましたが、現代の CSS では **Flexbox**（フレックスボックス）が標準です。

Flexbox の使い方は、**並べたい要素たちを包む親要素に `display: flex` を付ける** だけです。これだけで子要素が自動で横並びになります。

```html
<div class="row">
  <div class="card">A</div>
  <div class="card">B</div>
  <div class="card">C</div>
</div>
```

```css
.row {
  display: flex;
}
```

`.row` に `display: flex` を付けると、`.card` 3 つが横に並びます。並びの主軸（デフォルトは左から右）と、主軸に直交する方向（交差軸、デフォルトは上から下）があります。

### 間隔を空ける: `gap`

子要素同士に間隔を空けたいときは、親に `gap` を指定します。

```css
.row {
  display: flex;
  gap: 16px;
}
```

これで `.card` 同士の間に 16px の空間が入ります。`margin` でも同じことはできますが、端に余分な余白ができないので Flexbox では `gap` が基本です。

下のデモで、親の `display: flex` と `gap` の効果を確認できます。`display: flex` を外すと子要素が縦積みに戻り、`gap` を増減すると隙間が変わります。

<LiveDemo
  height="180px"
  :html="`
<div class='row'>
  <div class='item'>A</div>
  <div class='item'>B</div>
  <div class='item'>C</div>
</div>
  `"
  :css="`
body { padding: 16px; }
.row { display: flex; gap: 16px; }
.item {
  flex: 1;
  padding: 24px;
  background: #1f4e79;
  color: white;
  text-align: center;
  border-radius: 4px;
}
  `"
  :js="``"
/>

### 主軸の揃え方: `justify-content`

```css
.row {
  display: flex;
  justify-content: center;
}
```

主な値:

| 値 | 意味 |
|---|---|
| `flex-start` | 左寄せ（デフォルト） |
| `center` | 中央寄せ |
| `flex-end` | 右寄せ |
| `space-between` | 両端ぴったり、間を均等 |
| `space-around` | 両端にも半分の余白、間は均等 |

### 交差軸の揃え方: `align-items`

子要素の高さが違うとき、縦方向の揃え方を指定します。

```css
.row {
  display: flex;
  align-items: center;
}
```

主な値:

| 値 | 意味 |
|---|---|
| `stretch` | 親の高さまで引き伸ばす（デフォルト） |
| `flex-start` | 上揃え |
| `center` | 中央揃え |
| `flex-end` | 下揃え |

### メディアクエリで画面幅に応じて変える

スマホでも PC でも同じ HTML を使いますが、見た目は画面幅によって変えたい場合があります。例えば **「PC では横並び、スマホでは縦並び」** と切り替えたい、といったケースです。これを実現するのが **メディアクエリ**（`@media`）です。

```css
/* 画面幅 600px 以下のときだけ適用される */
@media (max-width: 600px) {
  .row {
    flex-direction: column;
  }
}
```

`flex-direction: column` は「主軸を縦方向にする」という指定です。これで子要素が縦に積まれます。

メディアクエリは CSS ファイルのどこにでも書けますが、**同じ要素のスタイルは `@media` より前（= PC 用）に書き、`@media` 内に上書きを書く**（= スマホ用）の順にすると読みやすくなります。

### 配置をうまくやる 3 つの質問

Flexbox で迷ったら自分に 3 つ聞いてみましょう。

1. **何を並べたい？** → 親要素をどれにするか決める（例: カードを包む `.cards`）
2. **横並び？ 縦並び？** → `flex-direction: row`（デフォルト）か `column` か
3. **主軸のどの位置に寄せる？** → `justify-content`
4. **交差軸のどの位置に寄せる？** → `align-items`

最初は `display: flex` と `gap` だけで十分です。`justify-content` / `align-items` は必要になったときに足してください。

### 最低限のアクセシビリティ（再確認）

1 章 の「ページの骨格を組む」で「色のコントラスト」「フォーカスリングを消さない」「見出し階層を飛ばさない」に触れました。今回の完成版でもこの 3 点を意識します。特に:

- リンクやボタンに `:focus` を当てるとき、太いアウトラインを消さない（キーボード操作の人に必要）
- カードの背景色と文字色のコントラストを十分取る（淡い色同士は読みにくい）
- ヘッダーが `<h1>`、各カードのタイトルは `<h2>` という階層を守る

## 演習

### 途中から始める場合

これまでのレッスンで作った `index.html` / `styles.css` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。なお、このレッスンでは HTML と CSS を大きく書き直すため、ステップ 1 以降で示す新しいコードで上書きして進めます。手元が無い場合はこの出発点を貼った上でステップ 1 に進んでください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>自己紹介</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header>
      <h1>オザキの自己紹介</h1>
      <nav>
        <ul class="nav-list">
          <li><a class="nav-link" href="#profile">プロフィール</a></li>
          <li><a class="nav-link" href="#likes">好きなもの</a></li>
          <li><a class="nav-link" href="#goals">今年やりたいこと</a></li>
          <li><a class="nav-link" href="#links">お気に入りサイト</a></li>
          <li><a class="nav-link" href="#contact">お問い合わせ</a></li>
        </ul>
      </nav>
    </header>

    <main class="main">
      <section id="profile" class="card">
        <h2>プロフィール</h2>
        <img
          src="https://placehold.jp/200x200.png"
          alt="オザキのプロフィール画像(仮)"
          width="200"
          height="200"
        />
        <p>はじめまして。Web フロントエンドを勉強中です。</p>
        <p>
          いまは <strong>HTML の基礎</strong> を学んでいます。読むだけでなく、<em>自分でも手を動かして</em> 覚えていきたいです。
        </p>
      </section>

      <section id="likes" class="card">
        <h2>好きなもの</h2>
        <ul>
          <li>コーヒー</li>
          <li>散歩</li>
          <li>本</li>
        </ul>
      </section>

      <section id="goals" class="card">
        <h2>今年やりたいこと</h2>
        <ol>
          <li>Next.js で小さなアプリを作る</li>
          <li>毎週 1 本ブログを書く</li>
          <li>早起きする</li>
        </ol>
      </section>

      <section id="links" class="card">
        <h2>お気に入りサイト</h2>
        <ul>
          <li>
            <a href="https://developer.mozilla.org/ja/" target="_blank" rel="noopener">MDN Web Docs（日本語）</a>
          </li>
          <li>
            <a href="https://ja.react.dev/" target="_blank" rel="noopener">React 公式（日本語）</a>
          </li>
          <li>
            <a href="https://nextjs.org/" target="_blank" rel="noopener">Next.js 公式</a>
          </li>
        </ul>
      </section>

      <section id="contact" class="card">
        <h2>お問い合わせ</h2>
        <p>ご連絡はこちらのフォームから。</p>
        <form>
          <p>
            <label for="name">お名前</label>
            <input type="text" id="name" name="name" required />
          </p>
          <p>
            <label for="email">メールアドレス</label>
            <input type="email" id="email" name="email" required />
          </p>
          <p>
            <label for="message">メッセージ</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </p>
          <p>
            <button class="btn primary" type="submit">送信</button>
          </p>
        </form>
      </section>
    </main>

    <footer>
      <p>&copy; 2026 オザキ</p>
    </footer>
  </body>
</html>
```

**`styles.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 24px;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    "Hiragino Sans",
    "Yu Gothic",
    sans-serif;
  color: #333333;
  line-height: 1.7;
}

h1 {
  font-size: 2.25rem;
  color: #0d47a1;
}

h2 {
  font-size: 1.5rem;
  color: #333333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 4px;
}

p {
  font-size: 1rem;
}

a {
  color: #1a73e8;
}

li {
  color: #555555;
}

.nav-list {
  list-style: none;
  padding: 0;
}

.nav-link {
  color: #1a73e8;
  text-decoration: none;
}

.nav-link:hover {
  text-decoration: underline;
  color: #0d47a1;
}

.nav-link:focus {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
  border-radius: 2px;
}

.nav-link.active {
  font-weight: bold;
  color: #0d47a1;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 1rem;
}

.primary {
  color: #ffffff;
  background-color: steelblue;
}

.primary:hover {
  background-color: #3a6ea5;
}

.btn:focus {
  outline: 2px solid #ffa726;
  outline-offset: 2px;
}

footer {
  color: #666666;
  font-size: 0.875rem;
}

.main {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
}

.card h2 {
  margin-top: 0;
}

header {
  max-width: 800px;
  margin: 0 auto 24px;
}

footer {
  max-width: 800px;
  margin: 24px auto 0;
  color: #666666;
  font-size: 0.875rem;
  text-align: center;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  body {
    color: #dddddd;
    background-color: #1a1a1a;
  }
  h1 {
    color: #e0e0e0;
  }
  h2 {
    color: #c0c0c0;
  }
  p {
    color: #d0d0d0;
  }
  a {
    color: #8ab4f8;
  }
  footer {
    color: #999999;
  }
  .card {
    background-color: #202020;
    border-color: #3a3a3a;
    color: #e0e0e0;
  }
}
```

</details>

### 到達する完成形のイメージ

PC 幅（600px より広い）:

<div style="font-family:system-ui, sans-serif; max-width:520px; margin:8px 0;">
  <div style="border:1px solid #64748b; padding:10px 14px; background:#f1f5f9; display:flex; justify-content:space-between;">
    <span>ヘッダー: 私の名前</span>
    <span>ナビゲーション</span>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin:12px 0;">
    <div style="border:1px solid #64748b; padding:12px; background:#fff;">
      <div style="font-size:0.85em; color:#475569;">カード 1</div>
      <div>画像 / 見出し / 本文</div>
    </div>
    <div style="border:1px solid #64748b; padding:12px; background:#fff;">
      <div style="font-size:0.85em; color:#475569;">カード 2</div>
      <div>画像 / 見出し / 本文</div>
    </div>
    <div style="border:1px solid #64748b; padding:12px; background:#fff;">
      <div style="font-size:0.85em; color:#475569;">カード 3</div>
      <div>画像 / 見出し / 本文</div>
    </div>
  </div>
  <div style="border:1px solid #64748b; padding:10px 14px; background:#f1f5f9;">
    フッター: © 私の名前
  </div>
</div>

スマホ幅（600px 以下）:

<div style="font-family:system-ui, sans-serif; max-width:220px; margin:8px 0;">
  <div style="border:1px solid #64748b; padding:10px 14px; background:#f1f5f9;">
    <div>私の名前</div>
    <div>ナビゲーション</div>
  </div>
  <div style="border:1px solid #64748b; padding:12px; background:#fff; margin-top:8px;">カード 1</div>
  <div style="border:1px solid #64748b; padding:12px; background:#fff; margin-top:8px;">カード 2</div>
  <div style="border:1px solid #64748b; padding:12px; background:#fff; margin-top:8px;">カード 3</div>
  <div style="border:1px solid #64748b; padding:10px 14px; background:#f1f5f9; margin-top:8px;">© 私の名前</div>
</div>

### ステップ 1: HTML の骨格を作る

StackBlitz で新しい Vanilla プロジェクトを作ります（これまでのプロジェクトの続きでも構いません）。`index.html` を以下の内容にしてください。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>私の自己紹介</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="site-header">
      <h1>私の名前</h1>
      <nav class="site-nav">
        <a href="#about">自己紹介</a>
        <a href="#likes">好きなもの</a>
        <a href="#contact">問い合わせ</a>
      </nav>
    </header>

    <main>
      <section id="about">
        <h2>自己紹介</h2>
        <p>Web フロントエンドを学び中です。HTML / CSS / JavaScript から順に手を動かして進めています。</p>
      </section>

      <section id="likes">
        <h2>好きなもの</h2>
        <div class="cards">
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="コーヒーのプレースホルダ画像" />
            <h3>コーヒー</h3>
            <p>朝の 1 杯が欠かせない。</p>
          </article>
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="本のプレースホルダ画像" />
            <h3>本</h3>
            <p>技術書からエッセイまで。</p>
          </article>
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="散歩のプレースホルダ画像" />
            <h3>散歩</h3>
            <p>行き先を決めずに歩く。</p>
          </article>
        </div>
      </section>

      <section id="contact">
        <h2>問い合わせ</h2>
        <form>
          <div>
            <label for="name">お名前</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div>
            <label for="email">メール</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label for="message">メッセージ</label>
            <textarea id="message" name="message" rows="4" required></textarea>
          </div>
          <button type="submit">送信</button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <p>&copy; 私の名前</p>
    </footer>
  </body>
</html>
```

ポイント:

- `<section>` を `<main>` の中に 3 つ並べています（`about` / `likes` / `contact`）。
- `<nav>` にはアンカー `#about` などで同一ページ内移動を入れています。
- カード 3 枚は `<div class="cards">` で包み、各カードは `<article class="card">` にしています（意味的に「独立した記事のかたまり」なので `<article>` が向いています）。
- 画像は [placehold.jp](https://placehold.jp) のプレースホルダを使っています。自分の好きな画像に差し替えても構いません。

### ステップ 2: ベースの CSS を書く

`style.css` を新規作成し、次の内容を書きます。Flexbox はまだ使わず、文字色・背景色・余白だけを整えます。

```css
/* リセットに近い最低限の初期化 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.6;
  color: #1f2937; /* ダークグレー、白背景との対比で読みやすい */
  background-color: #f9fafb;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #e5e7eb; /* ライトグレー */
    background-color: #0b1220; /* ダークネイビー */
  }
}

a {
  color: #2563eb;
}

a:focus {
  outline: 3px solid #60a5fa; /* フォーカスリングは消さない */
  outline-offset: 2px;
}

h1,
h2,
h3 {
  margin-top: 0;
}

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

.site-header {
  padding: 16px 24px;
  background-color: #1e3a8a;
  color: #f9fafb;
}

.site-header h1 {
  margin: 0;
}

.site-nav a {
  color: #f9fafb;
  margin-right: 16px;
}

.card {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
}

@media (prefers-color-scheme: dark) {
  .card {
    background-color: #111827;
    border-color: #374151;
  }
}

.card img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.site-footer {
  padding: 16px 24px;
  background-color: #1e3a8a;
  color: #f9fafb;
  text-align: center;
}
```

ここまでの **期待出力**: 自己紹介ページが、カードも含めて「縦に積まれた」状態で表示されます。ヘッダーとフッターはダークブルー背景、本文は薄いグレー背景です。ダークモードでも読めることを DevTools の「デバイスツールバー」→「メディアを確認」で確認できます。

### ステップ 3: ヘッダーを Flexbox で左右に分ける

`.site-header` に `display: flex` を付け、`<h1>` を左、`<nav>` を右に配置します。`style.css` の `.site-header` のブロックを次のように書き換えます。

```css
.site-header {
  padding: 16px 24px;
  background-color: #1e3a8a;
  color: #f9fafb;

  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

**期待出力**: ヘッダーの `<h1>` が左端、`<nav>` の 3 リンクが右端に寄ります。中央は空きます。`align-items: center` のおかげで縦中央で揃います。

### ステップ 4: カード 3 枚を Flexbox で横並びにする

`.cards` に `display: flex` と `gap` を付けます。

```css
.cards {
  display: flex;
  gap: 16px;
}

.cards .card {
  flex: 1;
}
```

`flex: 1` は「利用可能な幅を子要素で等分する」という指定です。これで 3 枚のカードが同じ幅で並びます。

**期待出力**: カード 3 枚が横並び、間に 16px の隙間、幅は均等になります。

::: tip 補足: 「カードを敷き詰める」レイアウトは本来 Grid が自然
本レッスンではまず Flexbox の使い方を体験するために、カードも Flex で横並びにしています。ただし「カードを画面幅に応じて折り返しながら敷き詰める」のは **2 次元レイアウト** なので、実務では CSS Grid を使うのが自然です。次のレッスン「CSS Grid で二次元レイアウト」で、この `.cards` 部分を Grid に書き換え、`@media` を書かなくても自動で折り返す形に育てます。
:::

### ステップ 5: スマホ幅で縦並びに切り替える

`style.css` の末尾に次を追加します。

```css
@media (max-width: 600px) {
  .site-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .site-nav a {
    margin-right: 0;
    margin-top: 4px;
    display: inline-block;
  }

  .cards {
    flex-direction: column;
  }
}
```

- ヘッダーも `flex-direction: column` で縦並びにします（`<h1>` の下にナビが並びます）。
- カードも縦並びにします。

StackBlitz のプレビュー画面を左右に縮めて、幅が 600px を切った瞬間にレイアウトが切り替わることを確認してください。DevTools の「デバイスツールバー」（Chrome では `Ctrl+Shift+M` / `Cmd+Shift+M`）でスマホサイズに切り替えても同じ挙動になります。

### ステップ 6: フォーム欄を少し整える

最後に、`<form>` の入力欄を見やすく整えます。`style.css` に次を足してください。

```css
form div {
  margin-bottom: 12px;
}

form label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

form input,
form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #9ca3af;
  border-radius: 4px;
  font: inherit;
}

form input:focus,
form textarea:focus {
  outline: 3px solid #60a5fa;
  outline-offset: 1px;
}

form button {
  padding: 8px 16px;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

form button:focus {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
```

ここまでで自己紹介ページが完成します。

### ステップ 7: 完成形を保存する

このレッスンの最終成果物は **5 章 の「ページを増やしてリンクで移動する」で再び使います**。StackBlitz のプロジェクトは URL でいつでも開けます（アカウントを作って保存しておけばさらに安心です）。開いたタブをブックマークしておくか、自分の GitHub に Fork しておいてください。

HTML と CSS の全量をローカルにコピーして保存しておいても構いません。「ページを増やしてリンクで移動する」では、この HTML の **`class` を `className` に、`<label for>` を `<label htmlFor>` に、自己閉じタグに `/` を足すだけ** でほぼそのまま Next.js の JSX になります。今の完成形がそのまま生きるので、満足いくまで細部を調整してから先に進んでください。

## まとめ

1 章 の到達点は次のとおりです。

- HTML の基本タグ（見出し・段落・リスト・リンク・画像・フォーム・セマンティックタグ）で文書を組み立てられる
- CSS を外部ファイルで読み込み、要素セレクタ・クラスセレクタ・擬似クラス（`:hover` / `:focus`）でスタイルを当てられる
- ボックスモデル（`margin` / `padding` / `border`）で余白を設計できる
- Flexbox と `@media` で PC / スマホの両方に耐えるレイアウトを作れる
- 最低限のアクセシビリティ（見出し階層・コントラスト・フォーカスリング）を意識できる

次のレッスンでは、この `.cards` 部分を **CSS Grid** に書き換えます。2 次元レイアウトが本来の Grid の得意分野で、`@media` を書かなくても画面幅に応じて自動で折り返す形にできます。

次章の「最初の JavaScript」からは **JavaScript** に入ります。これまで作った自己紹介ページには動きがありませんでしたが、JS を使うとページに動きを付けられます。2 章 の山場は「TODO アプリを作る」です。HTML + CSS + JS だけで 1 つの小さなアプリを完成させます。そしてこの TODO アプリは 4 章 で React に、5 章 で Next.js + Server Actions 版に育っていきます。

5 章 の「ページを増やしてリンクで移動する」で、今作った自己紹介ページが Next.js の `/about` として復活します。それまで一旦忘れても構いませんが、今のプロジェクトは消さずに取っておいてください。
