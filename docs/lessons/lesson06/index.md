# lesson06: フォームを作る

## ゴール

このレッスンは HTML フォームの入り口です。**主役はこの 3 つ** です。

- `<form>` の中に `<input>` / `<textarea>` / `<button>` を並べて、名前・メール・メッセージを受け取れるフォームが書ける
- `<label for>` を使ってラベルと入力欄を紐付けられる（クリックでフォーカス移動）
- `name` 属性で「送信時にどのキーで値が出ていくか」を指定できる

主役を身につけたら、次の機能も使えるようになります（本文の **補足** で扱います）。

- `required` / `type="email"` などのブラウザネイティブバリデーション
- `<label for>` ではなく `<label>` で囲む 2 つ目の書き方（参考）
- `placeholder` の使い分け / `autocomplete`

**初回は主役の 3 つだけ覚えれば十分** です。バリデーションは React 章の React Hook Form や Zod で再訪します。

## 解説

### フォームは「ユーザーから値を受け取る入れ物」

これまでは読む一方のページでした。ユーザーから名前や問い合わせ内容を受け取りたいときは、入力欄やボタンを並べた **フォーム** を使います。

フォーム全体は `<form>` タグで囲みます。

```html
<form>
  <!-- 入力欄やボタンをここに並べる -->
</form>
```

`<form>` にはのちほど送信先（`action`）やメソッド（`method`）といった属性が付きますが、2 章 / 4 章 / 5 章 で段階的に使っていくので、このレッスンでは `<form>` の中に入力欄を並べる形だけ扱います。

### 主な入力要素

### `<input>`

もっとも基本の入力タグ。`type` 属性で種類が変わります。終了タグは書きません。

```html
<input type="text" />
<input type="email" />
<input type="password" />
```

- `type="text"`: ふつうの 1 行テキスト。
- `type="email"`: メールアドレス。スマホだと `@` キー付きのキーボードが出たり、送信時に「メール形式か」をブラウザがチェックしてくれる。
- 他にも `number`、`date`、`checkbox`、`radio` など多数あるが、本コースでは `text` と `email` を中心に使う。

### `<textarea>`

複数行のテキストを受け取る入力欄。`<input>` と違って **終了タグが必要**。

```html
<textarea></textarea>
```

行数や桁数は `rows` と `cols` 属性、または CSS で調整できます。

### `<button>`

ボタン。フォームの中に置いた `<button>` は、既定でフォームを送信する動きになります（後のレッスンで詳しく扱う）。

```html
<button type="submit">送信</button>
```

`type` には `submit`（送信、既定値）/ `reset`（入力をクリア）/ `button`（既定の送信動作を持たない、JS から使う用）の 3 つがあります。送信ボタンなら `type="submit"` を明示的に書くのが分かりやすいです。

### `name` 属性と送信の関係

フォームを送信すると、各入力欄の値は **`name` 属性** をキーとして送られます。`name` の付いていない入力欄は、値が送信されません。

```html
<input type="text" name="username" />
```

この欄に「オザキ」と入力して送ると、`username=オザキ` という形のデータが送信されます。2 章 / 4 章 / 5 章 で JavaScript や React から値を扱うときも、基本はこの `name` をキーに取り出します。いまは「**`name` を付けないと、その値は外に出ていかない**」と覚えておきます。

### 補足: `required` 属性

入力必須にしたい欄には `required` 属性を付けます。値は書かなくて構いません（属性名だけ）。

```html
<input type="text" name="username" required />
```

空のまま送信しようとすると、ブラウザが「この項目を入力してください」とメッセージを出して送信を止めます。これを **HTML ネイティブバリデーション** と呼びます。JavaScript を書かなくてもこの挙動になるのが HTML のうれしいところです。

`type="email"` と `required` を合わせると、「必須 + メール形式チェック」になります。

### `<label for>` で入力と紐付ける

入力欄には、そのすぐそばに「何を入れる欄か」を示すラベルを置くのが基本です。`<label>` タグをラベルとして使い、`for` 属性を対応する入力欄の `id` に合わせます。

```html
<label for="username">お名前</label>
<input type="text" id="username" name="username" required />
```

- `<label for="username">` の `for` は、対応する入力欄の `id` 属性と同じ値にする。
- 紐付けができていると、**ラベルの文字をクリックしただけで入力欄にフォーカス** が移る。小さなスマホ画面で効いてくる。
- スクリーンリーダーも「お名前 テキスト 必須」のようにまとめて読み上げてくれる。

### 補足: ラベルの書き方 2 種類（使うのは 1 つ目）

`<label>` には、`for` を使わず入力欄を **中に入れる** 書き方もあります。

```html
<!-- for を使う書き方（このコースではこちらを使う） -->
<label for="username">お名前</label>
<input type="text" id="username" name="username" />

<!-- 入力欄を包む書き方（参考） -->
<label>
  お名前
  <input type="text" name="username" />
</label>
```

包む書き方でも紐付けは成立しますが、CSS でスタイルを付けるときに `<label>` と `<input>` が兄弟関係のほうが扱いやすいので、このコースでは `for` を使う形で統一します。

下のデモは、`<label>` のテキストをクリックすると対応する入力欄にフォーカスが当たる挙動の確認です。`required` を付けた欄は、送信ボタンを押したときに空だとブラウザがエラーを出します。

<LiveDemo
  height="280px"
  :html="`
<form>
  <p>
    <label for='name'>お名前</label><br>
    <input type='text' id='name' name='name' required>
  </p>
  <p>
    <label for='email'>メール</label><br>
    <input type='email' id='email' name='email' required>
  </p>
  <p>
    <label for='message'>メッセージ</label><br>
    <textarea id='message' name='message' rows='3'></textarea>
  </p>
  <p>
    <button type='submit'>送信</button>
  </p>
</form>
  `"
  :css="`
body { padding: 12px; }
input, textarea { width: 260px; padding: 4px 6px; font: inherit; }
button { padding: 6px 14px; font: inherit; cursor: pointer; }
  `"
  :js="``"
/>

## 演習

### 途中から始める場合

これまでのレッスンで作った `index.html` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。

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
    </main>

    <footer>
      <p>&copy; 2026 オザキ</p>
    </footer>
  </body>
</html>
```

</details>

### 前レッスンの状態から始める

これまでのプロジェクトを開きます。`<main>` の中にセクションが 4 つ並び、`<header>` / `<footer>` が付いた状態です。

### コピペで動かす

`</main>` の直前に、問い合わせフォームのセクションを追加します。`<nav>` にも項目を足します。

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

### 期待出力

- ページの末尾近くに「お問い合わせ」というセクションが追加される。
- 「お名前」「メールアドレス」「メッセージ」の 3 つのラベルと入力欄、「送信」ボタンが縦に並ぶ。
- ラベル「お名前」の文字をクリックすると、カーソルが名前入力欄に移る（フォーカスが当たる）。同じくメール、メッセージでもラベルクリックでフォーカスが移る。
- どれかを空のまま「送信」を押すと、ブラウザが赤い吹き出しで「この項目を入力してください」などのエラーを出して送信を止める（`required` の効果）。
- メール欄に `abc` など不正な形式を入力して送信すると、「メールアドレスには `@` を含めてください」系のエラーが出る（`type="email"` の効果）。
- 送信処理自体はまだ書いていないので、正しく入力して送信するとページがリロードされる（これは後の章で正しく止める）。

### DevTools で確認

1. プレビューを新しいタブで開き、DevTools を開く。
2. Elements パネルでフォーム部分をクリックし、`<form>` / `<input>` / `<textarea>` / `<button>` の構造を確認。
3. `<label for="name">` をクリックし、右側の属性パネルで `for` の値を確認する。対応する `<input>` の `id` と一致していることを見る。

### 変えてみる

1. お名前欄の `required` を外して保存してみる。空のまま送信すると、赤いエラーが出なくなることを確認する。確認後は戻す。
2. メール欄の `type="email"` を `type="text"` に変えると、`abc` のような文字列でも送れてしまうことを確認する。確認後は戻す。
3. `<label for="email">` の `for` を「emal」のように間違って書くと、ラベルクリックで入力にフォーカスが移らなくなる。確認後は戻す。

### 自分で書く

フォームにもう 1 つ「件名」欄を追加してみます。位置はメールとメッセージのあいだが自然です。必要な要素は次の 3 つです。

- `<label for="subject">件名</label>`
- `<input type="text" id="subject" name="subject" required />`
- 全体を `<p>...</p>` で囲む（段落扱いにするとレイアウトが崩れにくい）

何も見ずに書いてみて、`id` と `for` の値が一致しているか、`name` を付け忘れていないかを確認します。

## まとめ

- フォームは `<form>` の中に `<input>` / `<textarea>` / `<button>` を並べて作る。
- `name` 属性は送信のキー、`required` はブラウザに必須チェックを頼む合図。
- `<label for>` を入力の `id` と合わせると、ラベルクリックで入力にフォーカスが移る。アクセシビリティにも効く。
- 送信処理そのものはまだ書いていない。2 章 の JavaScript で `<form>` の送信を止めて値を取り出し、4 章 / 5 章 で React / Next.js の形に進化させる。
- 別のレッスンで、ついに CSS でページに見た目を付けていく。
