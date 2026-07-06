# lesson04: リンクと画像

<script setup>
const demoHtml = `<p>下の画像とリンクは、どちらも HTML タグだけで作っています。</p>
<img src="https://placehold.co/88x88.png" alt="プロフィール画像(仮)" width="88" height="88" />
<ul>
  <li><a href="https://developer.mozilla.org/ja/" target="_blank" rel="noopener">MDN Web Docs</a></li>
  <li><a href="https://ja.react.dev/" target="_blank" rel="noopener">React 公式</a></li>
</ul>`

const demoCss = `img { border-radius: 8px; margin: 8px 0; }
a { color: #1d4ed8; text-decoration: underline; }
a:hover { color: #b91c1c; }`
</script>

## ゴール

- 他のページへのリンクを `<a href>` で作れる。
- 画像を `<img src alt>` でページに埋め込める。
- `alt` 属性の意味と、なぜ省略してはいけないのかを説明できる。

## 解説

### リンクは `<a href>`

別のページへ移動するリンクは `<a>` タグで作ります。a は anchor（錨）の頭文字で、`href` 属性に移動先の URL を書きます。

```html
<a href="https://example.com">example のサイト</a>
```

- タグの中に書いた文字（ここでは「example のサイト」）がリンクテキストになり、クリックできる青い文字として表示される。
- URL は絶対 URL（`https://` で始まる）でも、同じサイト内の相対パス（`about.html` など）でも書ける。
- `target="_blank"` を付けると新しいタブで開く。
- `rel="noopener"` は、開いた先のページから元のタブを操作されないようにする安全策。いまのブラウザは自動で守ってくれますが、古い環境でも安全なように、`target="_blank"` とセットで書く癖をつけておきます。

```html
<a href="https://example.com" target="_blank" rel="noopener">外部サイト（新しいタブで開く）</a>
```

### 属性の書き方

ここで新しく **属性** という言葉が出てきました。属性はタグに追加情報を渡すための仕組みで、`名前="値"` の形で開始タグの中に書きます。

```html
<a href="https://example.com">リンクのテキスト</a>
```

`href` が属性名、`https://example.com` が属性値です。属性は同じタグに複数書けます（`href` と `target` を並べて書くなど）。

### 画像は `<img>`

画像は `<img>` タグで埋め込みます。`<img>` は **終了タグを書きません**（中身を持たない特殊なタグ）。必須の属性は次の 2 つです。

- `src`: 画像ファイルの URL またはパス。
- `alt`: 代替テキスト。画像の内容を説明する文字列。

```html
<img src="https://placehold.co/200x200.png" alt="仮のプロフィール画像" />
```

### `alt` を書く理由

`alt` は飾りではなく、次のような場面で実際に使われます。

- 画像が読み込めなかったとき、ブラウザはその場所に `alt` の文字を表示する。
- 目が見えない / 見えにくいユーザーが使うスクリーンリーダーは、画像の代わりに `alt` を読み上げる。
- 検索エンジンは画像の内容を `alt` から把握する。

「装飾だけの画像」の場合は `alt=""`（空の文字列）を指定して、スクリーンリーダーに無視させるのが作法です。省略するのと空にするのは別の意味を持ちます。

- `alt="プロフィール写真"`: 意味のある画像。読み上げられる。
- `alt=""`: 装飾画像。読み上げられない（飛ばされる）。
- `alt` 属性そのものを書かない: 本来は非推奨。ブラウザの挙動が統一されない。

画像が意味を持つものなら、必ず `alt` に内容を書きます。

<details>
<summary>参考: 外部サービスに頼らないダミー画像（SVG data URI）</summary>

`placehold.co` のような外部サービスはたいてい安定していますが、教材を **オフラインで開く / 外部 CDN を遮断した環境** で動かしたい場合に備えて、`data:` スキームを使う書き方も知っておくと安心です。

```html
<img
  src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%25' height='100%25' fill='%23ddd'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='sans-serif' fill='%23666'>200x200</text></svg>"
  alt="ダミー画像"
  width="200"
  height="200"
/>
```

長くて読みづらいので、本コースの本文ではプレースホルダ画像 CDN を使いますが、**ネット非依存にしたい場面** では SVG data URI が選択肢になります。

</details>

### 画像のサイズ

画像は `width` と `height` の属性、または CSS で大きさを調整できます。後の「ボックスモデルで余白を作る」で CSS を使ったサイズ指定を扱うので、今回は大きな画像をそのまま貼るとレイアウトが崩れる点だけ頭に入れておきます。演習では小さめのプレースホルダ画像を使います。

> **`width` と `height`** は「予約席」: HTML 属性として書いておくと、画像が読み込まれる前から **その大きさのスペースをブラウザが確保** します。書かないと、画像が遅れて読み込まれた瞬間に他の要素がガタッとずれる **レイアウトシフト** が起きます。これはページを見る人にとって読みづらいうえ、後の章で扱う Core Web Vitals の CLS という指標にも響きます。`width` / `height` を書くのは、それを防ぐための大事な習慣です。

下のデモは、ここまでで学んだ `<img>` と `<a>` を使って、画像とリンク 2 つを並べた最小例です。リンクにカーソルを重ねると色が変わるので、`a:hover` の挙動も合わせて確認できます。

<LiveDemo
  height="260px"
  :html="demoHtml"
  :css="demoCss"
/>

## 演習

### 出発点

これまでのレッスンで作った StackBlitz のプロジェクトを開きます。手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>自己紹介</title>
  </head>
  <body>
    <h1>オザキの自己紹介</h1>
    <p>はじめまして。Web フロントエンドを勉強中です。</p>
    <h2>ひとこと</h2>
    <p>
      いまは <strong>HTML の基礎</strong> を学んでいます。読むだけでなく、<em>自分でも手を動かして</em> 覚えていきたいです。
    </p>
    <h2>好きなもの</h2>
    <ul>
      <li>コーヒー</li>
      <li>散歩</li>
      <li>本</li>
    </ul>
    <h2>今年やりたいこと</h2>
    <ol>
      <li>Next.js で小さなアプリを作る</li>
      <li>毎週 1 本ブログを書く</li>
      <li>早起きする</li>
    </ol>
  </body>
</html>
```

</details>

### コピペで動かす

プロフィール画像と「お気に入りサイト」のリンク集を追加します。以下のコードに置き換えてください。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>自己紹介</title>
  </head>
  <body>
    <h1>オザキの自己紹介</h1>
    <img
      src="https://placehold.co/200x200.png"
      alt="オザキのプロフィール画像(仮)"
      width="200"
      height="200"
    />
    <p>はじめまして。Web フロントエンドを勉強中です。</p>
    <h2>ひとこと</h2>
    <p>
      いまは <strong>HTML の基礎</strong> を学んでいます。読むだけでなく、<em>自分でも手を動かして</em> 覚えていきたいです。
    </p>
    <h2>好きなもの</h2>
    <ul>
      <li>コーヒー</li>
      <li>散歩</li>
      <li>本</li>
    </ul>
    <h2>今年やりたいこと</h2>
    <ol>
      <li>Next.js で小さなアプリを作る</li>
      <li>毎週 1 本ブログを書く</li>
      <li>早起きする</li>
    </ol>
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
  </body>
</html>
```

### 期待出力

- プレビューの見出し「オザキの自己紹介」の下に、200×200 のグレーのプレースホルダ画像が表示される。
- 下の方に「お気に入りサイト」という見出し、その下に 3 つの青いリンクが縦に並ぶ。
- リンクをクリックすると、それぞれのサイトが新しいタブで開く。
- DevTools の Elements パネルで `<img>` 要素をクリックすると、プレビュー上の画像がハイライトされる。`<a>` 要素をクリックすると、対応するリンクテキストがハイライトされる。

### 変えてみる

1. `<img>` の `src` を別のプレースホルダ URL に変えてみる（例: `https://placehold.co/300x150.png`）。画像のサイズが変わることを確認する。
2. `alt` をわざと「xxxxx」のような内容と関係ない文字列に変えてみる。そのあと、`src` を存在しない URL（例: `https://example.com/nonexistent.png`）に変えて保存し、画像が読み込めなくなったとき、そこに `alt` の文字が表示されることを確認する。確認後は `src` と `alt` を元に戻す。
3. 「お気に入りサイト」のリンク 1 つを、自分がよく使うサイトに書き換える。

### 自分で書く

`<h2>お気に入りサイト</h2>` の下のリストに、自分で項目をもう 1 つ追加してみます。コピペせずに `<li><a href="..." target="_blank" rel="noopener">...</a></li>` の形を自分で書いてください。URL を書き間違えると（例: `htps://`）、リンクをクリックしても意図したページに飛びません。注意深く入力します。

### よくあるつまずき

- `<img>` に終了タグを書いてしまう（`<img>...</img>`）→ 不要。`<img ... />` か `<img ...>` のどちらでも OK。
- `href` の URL が相対パスになっていて、意図した場所に飛ばない（`href="example.com"` だと同じサイト内の `example.com` というフォルダを探してしまう）→ 外部サイトに飛ばすなら `https://` から書く。
- `alt` を書き忘れる → 画像の意味が伝わらなくなる。必ず書く。

## まとめ

- リンクは `<a href="URL">リンクテキスト</a>`。新しいタブで開くなら `target="_blank" rel="noopener"` を足す。
- 画像は `<img src="..." alt="...">`。`alt` は代替テキストで、省略しない。装飾画像なら `alt=""` と空にする。
- 属性は `名前="値"` の形でタグに情報を足す仕組み。同じタグに複数書ける。
