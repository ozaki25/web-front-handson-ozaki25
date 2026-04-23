# lesson10: ボックスモデルで余白を作る

## ゴール

- すべての要素が「コンテンツ + padding + border + margin」でできていることを、ボックスモデルとして説明できる。
- `margin` / `padding` / `border` / `width` を使い分けて、要素のまわりに余白と枠を作れる。
- `box-sizing: border-box` の意味と、なぜ必要なのかを説明できる。
- 自己紹介ページの各セクションをカード風の見た目にできる。

## 解説

### すべての要素は「四角い箱」

HTML の各要素は、画面上では四角い箱として配置されます。その箱には、内側から順に 4 つの層があります。これを **ボックスモデル** と呼びます。

<div style="display:inline-block; padding:20px 28px; background:#fde68a; color:#7c2d12; border-radius:6px; font-family:system-ui, sans-serif; margin:8px 0;">
  <div style="font-size:0.8em; margin-bottom:8px;">margin</div>
  <div style="padding:20px 28px; background:#fff; border:4px solid #1f2937; border-radius:4px;">
    <div style="font-size:0.8em; color:#1f2937; margin-bottom:8px;">border</div>
    <div style="padding:20px 28px; background:#bbf7d0; color:#065f46; border-radius:4px;">
      <div style="font-size:0.8em; margin-bottom:8px;">padding</div>
      <div style="padding:16px 32px; background:#dbeafe; color:#1e3a8a; text-align:center; border-radius:4px;">コンテンツ</div>
    </div>
  </div>
</div>

- **コンテンツ**: 中身（文字や画像）そのもの。
- **padding**: コンテンツと枠線（border）のあいだの余白。**内側の余白**。
- **border**: 要素の枠線。太さ・種類・色を指定できる。
- **margin**: 枠線の外側の余白。他の要素とのあいだを空ける **外側の余白**。

この 4 つを組み合わせて「要素の大きさ」と「要素同士の距離」が決まります。

### プロパティの書き方

#### `padding` / `margin`

1 方向だけ指定する書き方と、まとめて指定する書き方（ショートハンド）があります。

```css
/* 1 方向ずつ */
.card {
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
}

/* まとめて: すべての方向に同じ値 */
.card {
  padding: 16px;
}

/* まとめて: 上下 / 左右 */
.card {
  padding: 16px 24px; /* 上下 16px、左右 24px */
}

/* まとめて: 上 / 右 / 下 / 左（時計回り） */
.card {
  padding: 8px 16px 12px 16px;
}
```

`margin` も書き方は同じです。値にマイナスを指定することもできますが、使い所は限られるので本コースでは正の値のみ扱います。

#### `border`

`border` は「太さ 種類 色」の 3 つをまとめて書くのが基本です。

```css
.card {
  border: 1px solid #e0e0e0;
}
```

- 太さ: `1px` / `2px` など。
- 種類: `solid`（実線）/ `dashed`（破線）/ `dotted`（点線）など。普段は `solid`。
- 色: 「CSS を当てる」で扱ったのと同じ色の書き方。

1 方向だけ指定するなら `border-top` / `border-right` / `border-bottom` / `border-left` を使います。

### `width` と `height`

要素の幅・高さは `width` / `height` で指定します。指定しなければ、`<p>` や `<div>` など **ブロック要素** は親の幅いっぱいに広がる（幅 100%）のが既定の挙動です。

```css
.card {
  width: 300px;
}
```

`height` は中身の分だけ縦に伸びるので、普段は指定しません。指定すると中身が溢れたときに切れたりはみ出したりするためです。

### 落とし穴: `width` は「どこまでの幅」？

既定の CSS では、`width: 300px` と書いたとき、この `300px` は **コンテンツ部分の幅** だけを指します。`padding` や `border` はその外側に追加されるため、実際に画面上で占める幅は「300 + padding + border」になります。

```
width: 300px
padding: 16px
border: 1px

実際の画面上の幅: 300 + 16 + 16 + 1 + 1 = 334px
```

これは直感に反するので、レイアウトの計算がすぐ狂います。

### 解決策: `box-sizing: border-box`

これを解決するのが `box-sizing: border-box` です。`border-box` を指定すると、`width` は **border までを含んだ幅** として扱われます。

```
box-sizing: border-box
width: 300px
padding: 16px
border: 1px

実際の画面上の幅: 300px（内側を padding と border が食っていく）
```

ほとんどすべてのモダンな CSS プロジェクトで、**すべての要素に `border-box` を適用する** のが標準作法になっています。本コースでも冒頭で次のルールを入れておきます。

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

`*` は全要素にマッチする特殊なセレクタです。`*::before` / `*::after` は CSS で生成する擬似要素を指します（詳しい使い方はコース外）。とりあえず「このおまじないは必ず入れる」と覚えておけば十分です。

下のデモで、同じ `width: 200px` のカードが `box-sizing: content-box`（既定）と `border-box` でどう違うかを見比べてください。左は padding と border の分だけ実寸が膨らんでしまうのに対し、右は 200px ぴったりに収まります。

<LiveDemo
  height="200px"
  :html="`
<div class='card content-box'>content-box（既定）</div>
<div class='card border-box'>border-box</div>
  `"
  :css="`
body { padding: 16px; }
.card {
  width: 200px;
  padding: 16px;
  border: 4px solid #1f4e79;
  background: #e3f2fd;
  margin-bottom: 16px;
}
.content-box { box-sizing: content-box; }
.border-box  { box-sizing: border-box; }
  `"
  :js="``"
/>

### `margin` の重なり

縦方向に並んだ要素の上下 `margin` は **重なって大きい方だけ** が有効になる、というクセがあります（マージン相殺）。たとえば `<p>` 同士を縦に並べて、両方に `margin-bottom: 16px` / `margin-top: 16px` を指定しても、合計 32px ではなく 16px 分しか空きません。

本コースでは深追いしませんが、「縦に並んだ要素の `margin-top` と `margin-bottom` は重なる」と頭の片隅に置いておくと、後でレイアウトが崩れたときの原因に気付けます。

## 演習

### 途中から始める場合

前のレッスンまでで作った `index.html` / `styles.css` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。`styles.css` は新規作成してください。

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

    <main>
      <section id="profile">
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

      <section id="likes">
        <h2>好きなもの</h2>
        <ul>
          <li>コーヒー</li>
          <li>散歩</li>
          <li>本</li>
        </ul>
      </section>

      <section id="goals">
        <h2>今年やりたいこと</h2>
        <ol>
          <li>Next.js で小さなアプリを作る</li>
          <li>毎週 1 本ブログを書く</li>
          <li>早起きする</li>
        </ol>
      </section>

      <section id="links">
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

      <section id="contact">
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
body {
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
}
```

</details>

### 前レッスンの状態から始める

前のレッスンまでで作った `index.html` と `styles.css` を開きます。HTML はフォーム含む自己紹介ページ、CSS には文字まわりと色のルールが入っている状態です。

### HTML の変更: `<section>` にクラスを付ける

カード風にしたいので、`<main>` 内の各 `<section>` に `card` クラスを付け、`<main>` 自体にもクラスを付けます。変更するのは `<main>` 開始タグと各 `<section>` 開始タグだけ。

```html
<main class="main">
  <section id="profile" class="card">
    <h2>自己紹介</h2>
    <p>Web フロントエンドを学び中です。HTML / CSS / JavaScript から順に進めています。</p>
  </section>
  <section id="likes" class="card">
    <h2>好きなもの</h2>
    <ul>
      <li>コーヒー</li>
      <li>本</li>
      <li>散歩</li>
    </ul>
  </section>
  <section id="goals" class="card">
    <h2>目標</h2>
    <p>小さな Next.js アプリを自分で作れるようになる。</p>
  </section>
  <section id="links" class="card">
    <h2>リンク</h2>
    <p><a href="https://example.com">お気に入りのサイト</a></p>
  </section>
  <section id="contact" class="card">
    <h2>問い合わせ</h2>
    <form>
      <label for="name">お名前</label>
      <input id="name" name="name" type="text" required />
      <button type="submit">送信</button>
    </form>
  </section>
</main>
```

（前のレッスンまでで書いた各 `<section>` の中身をそのまま維持すれば OK です。上は中身の一例として掲載しています。）

### CSS の変更

`styles.css` の **先頭** に次の 2 ルールを追加します。全体リセットの `*` セレクタと、ページ全体のレイアウト整えです。

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
```

（前のレッスンの `body` ルールは上で置き換えました。`margin: 0` と `padding: 24px` が追加されている点に注意。）

そしてファイルの末尾に、`main` と `card` のルールを追加します。

```css
.main {
  max-width: 800px;
  margin: 0 auto; /* 左右 auto で水平方向に中央寄せ */
}

.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
}

.card h2 {
  margin-top: 0; /* カード上端との余白がダブらないように */
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

/* ダークモード対応: カードの白背景・枠色を上書き */
@media (prefers-color-scheme: dark) {
  .card {
    background-color: #202020;
    border-color: #3a3a3a;
    color: #e0e0e0;
  }
  footer {
    color: #999999;
  }
}
```

補足:

- `max-width: 800px;`: 要素の幅の上限を 800px にする。画面が狭ければそれより小さくなる（伸縮する）。「Flexbox とレスポンシブ」のレスポンシブに繋がる考え方。
- `margin: 0 auto;`: 上下 0、左右 auto。親の幅が要素より広ければ、左右の余白が均等に振り分けられて中央寄せになる。
- `border-radius: 8px;`: 角を少し丸くする。カードらしさが出る。
- `.card h2` は「`.card` の中にある `<h2>`」を指すセレクタ（**子孫セレクタ**）。セレクタをスペースで区切ると「この中の」の意味になる。

### 期待出力

- ページ全体の左右に 24px の余白が付き、中身が画面中央寄り（最大 800px 幅）に整列する。
- `<header>`、各 `<section>`（カード）、`<footer>` がそれぞれ独立した箱のように見える。
- カードは白背景、薄いグレーの枠、少し丸い角で、内側に 24px の余白がある。
- カード同士は 16px の隙間が空いて縦に並ぶ。
- `<footer>` は中央揃えで表示される。
- DevTools の Elements パネルで `.card` を選ぶと、右側「Computed」タブの下に **ボックスモデル図** が表示される。content / padding / border / margin の大きさが数値付きで確認できる。

### DevTools のボックスモデル図

1. Elements で `<section class="card">` を 1 つ選ぶ。
2. Styles パネルを下までスクロール、または「Computed」タブを開く。
3. ボックスモデル図（青・緑・黄色・オレンジの入れ子の四角）が見える。
4. 一番外がオレンジの `margin`、黄色が `border`、緑が `padding`、青が `content` の領域。それぞれの値が数値で書かれている。
5. カードのなかをクリックすると、プレビュー側にも同じ配色でレイアウトオーバーレイが出る。

### 変えてみる

1. `.card` の `padding` を `8px` に下げて保存すると、文字が枠に近づいて窮屈に見える。`40px` に上げると中身がゆったりする。好みの値を探す。
2. `.card` の `margin-bottom` を `0` にするとカード同士がくっつく。`32px` にするとゆとりが出る。
3. 試しに、ファイル先頭の `box-sizing: border-box;` のルールを **一時的に削除** して保存する。`.card` の `padding: 24px` が加算されて、800px の制限を超える幅になる（横スクロールが出る場合あり）。確認後は必ず戻す。これが `border-box` の効果を体感する瞬間。
4. `.card` の `border-radius` を `0` / `24px` / `50px` と変えて、カードの角の表情が変わるのを楽しむ。

### 自分で書く

`<header>` にもカード風の装飾を付けてみます。`header` ルールを追加してください。

ヒント:

```css
header {
  max-width: 800px;
  margin: 0 auto 24px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}
```

保存すると、`<header>` も白いカードとして表示されます。

また、`header h1` に `margin-top: 0;` を追加して、見出しがカードの上に張り付くようにしてもよいでしょう。

```css
header h1 {
  margin-top: 0;
}
```

## まとめ

- 要素は「content + padding + border + margin」の 4 層の箱（ボックスモデル）で構成される。
- `padding` は内側の余白、`margin` は外側の余白、`border` は枠線。ショートハンドで上下左右を一度に指定できる。
- `width` の既定の計算方式は直感に反するので、`box-sizing: border-box` を全要素に適用する。
- `margin: 0 auto;` と `max-width` の組み合わせで、要素を水平方向に中央寄せしつつ画面幅に合わせて縮められる。
- 次のレッスンはいよいよ1 章 のミニ統合。Flexbox とメディアクエリを使い、自己紹介ページをカード 3 枚横並び・スマホで縦並びにして完成させる。
