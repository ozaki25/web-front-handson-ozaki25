# lesson09: 色と文字を整える

## ゴール

- 文字色（`color`）・背景色（`background-color`）を指定できる。
- 文字サイズ（`font-size`）・行間（`line-height`）を指定できる。
- `font-family` で使用フォントの優先順位を指定できる。
- 自己紹介ページの配色とフォントを、読みやすく整えられる。

## 解説

### このレッスンで扱うプロパティ

| プロパティ | 役割 |
| --- | --- |
| `color` | 文字色 |
| `background-color` | 背景色 |
| `font-size` | 文字サイズ |
| `line-height` | 行の高さ（実質的な行間） |
| `font-family` | 使用するフォントの優先順位リスト |

「CSS を当てる」で `color` と `line-height` は先出ししていましたが、ここでまとめて扱います。

### 色の指定（復習 + 少し追加）

「CSS を当てる」で色名（`steelblue`）と 16 進数（`#333333`）を使いました。16 進数は 6 桁のほかに 3 桁の短縮形も書けます。

```css
.example {
  color: #333; /* #333333 と同じ */
  background-color: #fff; /* #ffffff と同じ */
}
```

見やすさのため、本コースでは 6 桁で統一することが多いです。

### `font-size` の単位

文字サイズには複数の単位があります。覚えておきたいのは次の 3 つ。

- `px`（ピクセル）: 絶対的な大きさ。ブラウザの文字サイズ設定に影響されない。ピッタリ合わせたいときに使う。
- `rem`: ルート要素（`<html>`）の `font-size` を基準にした相対値。`1rem` がふつう `16px`。ユーザーがブラウザの文字サイズを変えたとき、一緒に拡大縮小されるので親切。
- `em`: 親要素の `font-size` を基準にした相対値。入れ子で影響が連鎖するため、使い所が難しい。

本コースでは、基本は `rem` を推奨しつつ、小さな調整には `px` も使っていきます。

```css
h1 {
  font-size: 2rem; /* 通常 32px */
}

p {
  font-size: 1rem; /* 16px */
}
```

### `line-height`（行間）

`line-height` は、その要素の 1 行分の高さを指定します。数字だけ書く書き方（単位なし）がよく使われます。

```css
p {
  line-height: 1.7;
}
```

`1.7` は「その要素の `font-size` の 1.7 倍」の意味。本文の読みやすさは 1.5〜1.8 くらいが目安です。狭すぎると行同士がくっついて読みづらく、広すぎると段落がまとまって見えません。

下のデモで `line-height: 1.2`（狭い）と `line-height: 1.8`（読みやすい）を並べて比べられます。3 行以上の段落ほど差が大きいのが分かります。

<LiveDemo
  height="300px"
  :html="`
<h3>line-height: 1.2（狭い）</h3>
<p class='tight'>
  Web フロントエンドを学んでいます。まずは HTML と CSS から始めて、
  次に JavaScript、それから React、Next.js の順に進めていきます。
  1 日 1 レッスンを目安にのんびり進めます。
</p>

<h3>line-height: 1.8（読みやすい）</h3>
<p class='loose'>
  Web フロントエンドを学んでいます。まずは HTML と CSS から始めて、
  次に JavaScript、それから React、Next.js の順に進めていきます。
  1 日 1 レッスンを目安にのんびり進めます。
</p>
  `"
  :css="`
.tight { line-height: 1.2; }
.loose { line-height: 1.8; }
  `"
  :js="``"
/>

### `font-family`（フォントの優先順位）

使うフォントは `font-family` で指定します。「OS によって入っているフォントが違う」ので、**カンマで区切って優先順位リスト** を書くのが定石です。左から順に「このフォントがあればこれ、なければ次」とブラウザが探します。

```css
body {
  font-family: "Hiragino Sans", "Yu Gothic", sans-serif;
}
```

- フォント名にスペースが入るものは `" "` で囲む（`"Hiragino Sans"` など）。
- 最後に必ず **汎用フォント名**（`sans-serif` / `serif` / `monospace` のいずれか）を置く。どれもなければシステム既定のフォントが使われる。

汎用フォント名の意味:

- `sans-serif`: ゴシック体。サイト本文に使われることが多い。
- `serif`: 明朝体。
- `monospace`: 等幅フォント。プログラムコード表示に使う。

### システムフォントスタック

最近はどの OS でも読みやすい既定のフォントが入っているので、「各 OS の既定フォントを使う」という指定もよく見ます。本コースではシンプルに行きますが、参考として紹介します。

```css
body {
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    "Hiragino Sans",
    "Yu Gothic",
    sans-serif;
}
```

`system-ui` はそのシステムが「UI 用」に用意している既定フォントを使う指定です。

### 継承

`color` や `font-size`、`font-family` は **子要素に継承** されます。つまり `body` にフォントを設定すれば、その中のすべてのテキストにも同じフォントが（上書きしない限り）適用されます。便利な性質ですが、「あれ？ 効いているのに見た目が違う」と感じたら、親から継承されたスタイルがあるかを DevTools の Styles パネルで確認してみます。

## 演習

### 途中から始める場合

これまでのレッスンで作った `index.html` / `styles.css` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。`styles.css` は新規作成してください。

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
          src="https://placehold.co/200x200.png"
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
h1 {
  color: steelblue;
}

h2 {
  color: #555555;
}

p {
  color: #333333;
  line-height: 1.7;
}

a {
  color: #1a73e8;
}

li {
  color: #555555;
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

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 16px;
}

.primary {
  color: white;
  background-color: #0d47a1;
}

.primary:hover {
  background-color: #3a6ea5;
}

.btn:focus {
  outline: 2px solid #ffa726;
  outline-offset: 2px;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  h2 {
    color: #cccccc;
  }
  p {
    color: #dddddd;
  }
  a {
    color: #8ab4f8;
  }
  .nav-link {
    color: #8ab4f8;
  }
  .nav-link:hover {
    color: #c7d7ff;
  }
  .primary {
    background-color: #3e6fb5;
    color: #ffffff;
  }
  .primary:hover {
    background-color: #5780c4;
  }
}
```

</details>

### これまで作ったプロジェクトを使う

これまでのレッスンで作った `index.html` と `styles.css` を開きます。HTML はナビとボタンにクラスが付いた状態、CSS はリンク・ボタンの擬似クラスを含んだ状態です。

### コピペで動かす

`styles.css` を次のように書き換えます（既存ルールの一部を変更 + 追加）。HTML 側は変更なしで進めます。

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
  background-color: #0d47a1;
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

追加・変更点の解説:

- `body` にフォント・文字色・行間を設定。ここに書けばページ全体に継承される。
- `h1` のサイズを `2.25rem`（通常 36px）に、色を深い青 `#0d47a1` に。
- `h2` に下線風の装飾を `border-bottom` で追加（border については「ボックスモデルで余白を作る」で詳しく扱う。ここでは「下に 2px の薄いグレーの線」くらいの認識で OK）。
- `li` を少し薄いグレーに。
- `.nav-list` の `list-style: none;` で `<ul>` のマーカー（黒丸）を消す。ナビはリストだが、黒丸は見た目上邪魔なので消すことが多い。`padding: 0;` は「ボックスモデルで余白を作る」で詳しく説明する。
- `footer` 内の文字を少し小さく、少し薄いグレーに。

### 期待出力

- ページ全体のフォントが、OS のシステムフォント（Mac なら San Francisco、Windows なら Segoe UI、日本語は Hiragino Sans / Yu Gothic）に切り替わり、本文が前より読みやすくなる。
- `<h1>` が大きく深い青で表示される。
- 各 `<h2>` の下に薄いグレーの水平線が入る。
- `<nav>` のリストから黒丸マーカーが消え、リンクだけが並ぶ見た目になる（並びは縦のまま。横並びは「Flexbox とレスポンシブ」で扱う）。
- ページ末尾のフッター（`© 2026 オザキ`）が、本文より小さく・薄めのグレーで表示される。

### DevTools で確認

1. Elements で `<p>` を選び、Styles パネルで「Computed」タブを開く。
2. `font-family` の欄に、実際に採用されているフォント（OS によって違う）が太字で示される。ここで「優先順位のうち自分の環境ではどれが当たっているか」が分かる。
3. 同じ `<p>` で `line-height` の欄を見て、`1.7` と表示される（または実際のピクセル値）ことを確認。
4. 親要素から継承されているスタイルは、Styles パネルで「Inherited from ...」の見出しで区切られて表示される。

### 変えてみる

1. `h1` の `font-size` を `3rem` / `1.5rem` に変えて、見出しの大きさが変わることを確認する。
2. `body` の `line-height` を `1.2` に下げてみると、本文が詰まって読みづらくなるのを体感する。確認後は `1.7` に戻す。
3. `body` の `font-family` の先頭を `serif` に書き換えると、本文が明朝体になる。確認後は元に戻す。
4. `footer` の `color` を `#222` に戻してみると、文字が濃くなって「フッター感」が減ることを確認する。

### 自分で書く

自分の好みの 1 色を選び、`h2` の色と `h2` の `border-bottom` の色を、統一感のある配色に書き換えてみます。たとえば緑系でまとめたい場合:

```css
h2 {
  font-size: 1.5rem;
  color: #1b5e20;
  border-bottom: 2px solid #c8e6c9;
  padding-bottom: 4px;
}
```

選んだ色が白背景で読めるか、DevTools のカラーピッカー（Styles パネルで `color` の値の左の四角をクリック）でコントラスト比を確認してみます。カラーピッカー下部にコントラスト比（`Contrast ratio`）が表示されます。4.5 以上が本文向けの目安です。

## まとめ

- `color` / `background-color` / `font-size` / `line-height` / `font-family` は文字まわりの基本。
- フォントは優先順位のリストで指定し、最後に汎用名（`sans-serif` など）を置く。
- `font-size` は `rem` を基本に、必要に応じて `px`。`line-height` は数値だけの指定で OK（1.5〜1.8 が目安）。
- `color` や `font-family` は子要素に継承されるので、`body` にまとめて書いておくと見通しが良い。
