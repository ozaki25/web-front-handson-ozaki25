# lesson07: CSS を当てる

## ゴール

- CSS（Cascading Style Sheets）がどういう役割のものか説明できる。
- 外部 CSS ファイルを `<link rel="stylesheet">` で読み込める。
- 要素セレクタ（`h1` / `p` など）と宣言（プロパティ: 値）の書き方がわかる。
- 文字色を `color` プロパティで指定できる。

## 解説

### CSS は「見た目のルール集」

HTML は「何が書いてあるか」を表す言語でした。CSS（Cascading Style Sheets）は「それをどう見せるか」を表す言語です。文字の色、背景色、余白、サイズ、並べ方、といった見た目のルールをまとめて書きます。

CSS は HTML とは別ファイルに書いて、HTML から読み込むのが基本の形です。役割が分離されているので、ページの構造はそのままに見た目を入れ替えられます。

### CSS ファイルを HTML に読み込む

CSS ファイル（たとえば `styles.css`）を HTML から読み込むには、`<head>` の中に `<link>` タグを書きます。

```html
<head>
  <meta charset="UTF-8" />
  <title>自己紹介</title>
  <link rel="stylesheet" href="styles.css" />
</head>
```

- `rel="stylesheet"` で「スタイルシートを読み込む」と伝える。
- `href` に CSS ファイルの場所を指定する。`index.html` と同じフォルダに `styles.css` を置いたなら、ファイル名だけで OK。
- `<link>` は `<img>` と同じく **中身を持たない（void 要素）ため終了タグを書かない** タグです。`<link rel="stylesheet" href="...">` でも `<link rel="stylesheet" href="..." />` でも動きます（`/` は HTML では無視され、好みで書ける）。
- `<head>` の中に書くのが基本です。`<body>` より先にスタイルが用意されることで、ページ表示時に「スタイル未適用のまま一瞬見える」現象を防げます。

### CSS の書き方

CSS ファイルの中身は「セレクタ + 宣言ブロック」の繰り返しです。

```css
h1 {
  color: steelblue;
}

p {
  color: #333333;
  line-height: 1.7;
}
```

構造を分解するとこうなります。

- `h1` / `p` の部分が **セレクタ**。「どの要素にルールを当てるか」を指定する。このレッスンで扱うのは **要素セレクタ**（HTML のタグ名をそのまま書く形）。
- `{ }` の中が **宣言ブロック**。複数の宣言をまとめて書ける。
- 1 行ごとの `color: steelblue;` が **宣言**。`プロパティ: 値;` の形。セミコロン `;` で区切る。

よく使うプロパティをいくつか紹介します。このレッスンでは色だけに絞り、他は「色と文字を整える」以降で扱います。

- `color`: 文字色。
- `background-color`: 背景色。
- `font-size`: 文字サイズ。
- `line-height`: 行の高さ（行間）。

### 色の書き方

CSS で色を指定する方法はいくつかあります。本コースで使う形は次の 3 つです。

- 色の名前: `red`、`steelblue`、`gray` など。覚えやすいが種類が限られる。
- 16 進数カラーコード: `#333333`（濃いグレー）、`#ffffff`（白）など。`#` の後に 6 桁の 16 進数。
- 関数形式: `rgb(51, 51, 51)`（赤・緑・青を 0〜255 で指定）、`hsl(210, 60%, 50%)`（色相・彩度・明度）など。

最初は色の名前と 16 進数を混ぜて使うことが多いです。カラーピッカーは DevTools の Styles パネルに付いており、プロパティの値の左に出る四角をクリックすると色を目で選べます。

下のデモで、同じ HTML に CSS があるとないとで見た目がどう変わるかを確認できます。`color` / `background-color` / `font-size` の効果が一目で分かります。

<LiveDemo
  height="240px"
  :html="`
<h1>プロフィール</h1>
<p>Web フロントエンドを学び中です。</p>
<p>HTML・CSS・JavaScript を順に手を動かして学んでいます。</p>
  `"
  :css="`
h1 {
  color: steelblue;
  font-size: 2rem;
  background-color: #f0f4f8;
  padding: 8px 16px;
  border-radius: 4px;
}
p {
  color: #333;
  font-size: 1rem;
  line-height: 1.8;
}
  `"
  :js="``"
/>

### 大事な原則: コントラストを保つ

「ページの骨格を組む」のアクセシビリティでも触れましたが、文字色と背景色の明暗差が弱いと文字が読めなくなります。このコースでは **ダークモードでも破綻しない色** を意識して書きます。

- 黒に近い文字（`#333` など）を白の背景に置くのは OK。
- 薄いグレーの文字を白の背景に置くと読みづらい。
- ボディの背景色を明るい色に決め打ちすると、OS のダークモードで文字が見えなくなる場合がある。このコースでは `body` に背景色を積極的には指定せず、要素ごとに必要なら指定していく方針を取る。

## 演習

### 途中から始める場合

これまでのレッスンで作った `index.html` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。このレッスンから `styles.css` を作るため、`styles.css` の出発点はまだありません（このレッスン内で新規作成します）。

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
    <header>
      <h1>オザキの自己紹介</h1>
      <nav>
        <ul>
          <li><a href="#profile">プロフィール</a></li>
          <li><a href="#likes">好きなもの</a></li>
          <li><a href="#goals">今年やりたいこと</a></li>
          <li><a href="#links">お気に入りサイト</a></li>
          <li><a href="#contact">お問い合わせ</a></li>
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
            <button type="submit">送信</button>
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

</details>

### これまで作ったプロジェクトを使う

これまでのレッスンで作った HTML を開きます。`<header>` / `<main>` / `<footer>` があり、`<main>` の中にセクションと問い合わせフォームが並んでいる状態です。

### CSS ファイルを作る

StackBlitz の左側のファイルツリーで、`index.html` と同じ階層に新しく `styles.css` を作ります。

1. ファイルツリーの「New File」ボタン（または右クリック → New file）を押す。
2. 名前を `styles.css` にして Enter。

### コピペで動かす

`styles.css` に次の内容を書きます。

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

/* ダークモード対応: OS やブラウザがダーク指定のとき色を上書きする */
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
}
```

`@media (prefers-color-scheme: dark)` のブロックは、OS やブラウザがダークテーマになっているときだけ適用されます。白背景前提で色を決めると、ダーク時に文字が見えなくなる事故を起こします。**色を指定するときは、必ずダーク時の対応もセットで書く** 習慣を付けておきましょう。

次に `index.html` の `<head>` を次のように変更し、`<link>` で CSS を読み込みます。

```html
<head>
  <meta charset="UTF-8" />
  <title>自己紹介</title>
  <link rel="stylesheet" href="styles.css" />
</head>
```

`<body>` の中はこれまでのレッスンで書いたそのままで構いません。全体像は次のような形になるはずです（変更点は `<head>` に `<link>` が増えただけ）。

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
        <ul>
          <li><a href="#profile">プロフィール</a></li>
          <li><a href="#likes">好きなもの</a></li>
          <li><a href="#goals">今年やりたいこと</a></li>
          <li><a href="#links">お気に入りサイト</a></li>
          <li><a href="#contact">お問い合わせ</a></li>
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
            <button type="submit">送信</button>
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

### 期待出力

- `<h1>`（オザキの自己紹介）が青系の色（steelblue）で表示される。
- `<h2>`（プロフィール、好きなもの、など）が濃いグレーで表示される。
- `<p>`（本文段落）が少し薄めの黒（`#333`）で、行間が少し広くなる。
- `<a>`（リンクテキスト）が青系（`#1a73e8`）に変わる。訪問済みのリンクの色は既定のままでも構わない。

### DevTools で確認

1. プレビューを新しいタブで開き、DevTools を開く。
2. Elements パネルで `<h1>` を選ぶ。
3. 右側の「Styles」パネルに、`h1 { color: steelblue; }` が表示される。`styles.css` の行番号も見える。
4. 試しに Styles パネルで `color` の値を `red` に書き換えてみると、プレビューの `<h1>` が即座に赤に変わる。これは DevTools 上の一時的な変更で、ファイルには保存されない。

### 変えてみる

1. `h1 { color: steelblue; }` の `steelblue` を `crimson`、`darkgreen`、`#d97706` などに変えて保存し、見た目が変わることを確認する。
2. `p` に `background-color: #f5f5f5;` を追加して、段落の背景だけ薄いグレーになるのを見る（ダークモードで確認すると、背景色決め打ちの弱さも体感できる）。確認後は削除。
3. 2 で体感したとおり、背景色を決め打ちするとダークモードで破綻します。このコースが `body` に固定の背景色を置かないのはこのためです。

### 自分で書く

`styles.css` に、`li`（リスト項目）の文字色を少し薄めのグレー（たとえば `#555`）に設定するルールを自分で書き足します。セレクタ・宣言・セミコロン・波かっこを正しく打てれば OK。

```css
li {
  color: #555555;
}
```

保存すると、リスト項目がグレーになります。

### CSS が効かないときのチェックリスト

- `<link rel="stylesheet" href="styles.css">` のパスが合っているか（`index.html` と同じ階層か）。
- セミコロン `;` や閉じかっこ `}` を忘れていないか（1 行忘れると以降のルール全部が効かなくなることがある）。
- セレクタのスペルミス（`h1` を `h 1` と書いていないか）。
- DevTools の Network パネルで `styles.css` が読み込まれているか確認する。

## まとめ

- CSS は見た目のルールを書く言語。HTML とは別ファイルにして `<link rel="stylesheet">` で読み込むのが基本。
- セレクタ（`h1` など）と宣言ブロック（`{ プロパティ: 値; }`）の形でルールを書く。
- 色は色名 / 16 進数で指定できる。コントラストに注意。
