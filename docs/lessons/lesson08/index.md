# lesson08: クラスと状態

## ゴール

- `class` 属性で要素に名前を付けられる。
- クラスセレクタ（`.クラス名`）で一部の要素だけにスタイルを当てられる。
- `:hover`（マウスオーバー）と `:focus`（フォーカス中）の擬似クラスで、状態に応じた見た目を作れる。
- フォーカスリングを消してはいけない理由を説明できる。

## 解説

### 「同じタグだけど扱いを分けたい」のためのクラス

「CSS を当てる」で使った要素セレクタ（`h1 { ... }`）は、ページ上のすべての `<h1>` に同じスタイルを当てます。でも実際のページでは「このボタンだけ赤くしたい」「このリンクは強調して目立たせたい」のように、同じタグでも一部だけ扱いを変えたい場面が多いです。

そのために使うのが **クラス属性** と **クラスセレクタ** です。

### `class` 属性

HTML の要素には、`class` 属性で好きな名前（クラス名）を付けられます。

```html
<button class="primary">送信</button>
<button class="secondary">キャンセル</button>
```

1 つの要素に複数のクラスを付けるときは、**半角スペース** で区切って並べます。

```html
<button class="btn primary">送信</button>
```

クラス名のルール:

- 英字・数字・ハイフン（`-`）・アンダースコア（`_`）が使える。数字から始めるのは避ける。
- 大文字小文字は区別される（`Primary` と `primary` は別のクラス）。
- 役割を表す名前を付けると後から読みやすい（`btn`、`card`、`nav-item` など）。

### クラスセレクタ

CSS で「クラス名の付いた要素」を指すには、クラス名の前に **ドット `.`** を付けます。

```css
.primary {
  color: white;
  background-color: steelblue;
}

.secondary {
  color: #333;
  background-color: #eeeeee;
}
```

タグ名と組み合わせれば「`<button>` かつ `primary` クラス」のように絞り込めます。

```css
button.primary {
  /* <button class="primary"> だけに当たる */
}
```

本コースでは、読みやすさのためにクラスセレクタ単独（`.primary { ... }`）を中心に使っていきます。

### 状態に応じて見た目を変える「擬似クラス」

リンクやボタンは、状況に応じて少し見た目が変わると使いやすくなります。

- マウスカーソルが乗ったとき → 色を濃くする、背景色を変える
- キーボードや画面タッチでフォーカスが当たったとき → 枠線や太字で目印を付ける

このような「状態」をセレクタに書く仕組みが **擬似クラス（pseudo-class）** です。セレクタの後ろに `:状態名` を付けます。

```css
a:hover {
  color: crimson;
}

button:focus {
  outline: 2px solid steelblue;
  outline-offset: 2px;
}
```

- `:hover`: マウスカーソルが要素の上にあるときに適用。スマホなど hover の概念がない環境では効かない。
- `:focus`: 要素にフォーカスが当たっているとき（クリック直後、Tab キーで移動してきた直後、入力欄にカーソルがあるとき）に適用。

下のデモでマウスをボタンに乗せたり、Tab キーでボタンからリンクへフォーカスを移したりすると、見た目が変わるのを確認できます。

<LiveDemo
  height="180px"
  :html="`
<button class='primary'>ホバー / フォーカス</button>
&nbsp;
<a href='#'>リンク（Tab で移動）</a>
  `"
  :css="`
body { padding: 24px; }
.primary {
  padding: 8px 16px;
  border: 1px solid transparent;
  background: #1f4e79;
  color: white;
  cursor: pointer;
  transition: background 0.15s;
}
.primary:hover { background: #2b6cb0; }
.primary:focus { outline: 3px solid #ffa726; outline-offset: 2px; }
a:focus { outline: 3px solid #ffa726; outline-offset: 2px; }
  `"
  :js="``"
/>

### フォーカスリングを消さない

ブラウザは、`<button>` / `<a>` / `<input>` などにフォーカスが当たると、既定で青っぽい枠線（フォーカスリング）を表示します。これは **キーボードだけで操作する人** にとって「いまここが選ばれている」を示す大切な目印です。

CSS でよく見かける `outline: none;` という書き方は、このフォーカスリングを消してしまいます。デザイン上の理由で消したくなっても、**完全に消しっぱなしにしてはいけません**。消すなら、代わりの目印（太い下線、背景色の変化、明確な枠線）を必ず付けます。

このコースでは、`:focus` を使うときに **フォーカスリングを「デザインし直す」** 方針を取ります。消さず、見やすく上書きします。

```css
button:focus {
  outline: 2px solid steelblue;
  outline-offset: 2px;
}
```

`outline-offset` は枠線と要素のあいだに余白を空けるプロパティで、枠線が要素にぴったりくっついて見づらくなるのを防ぎます。

### 補足: `:focus-visible`

現代のブラウザは `:focus-visible` という擬似クラスも用意しています。こちらは「キーボード操作でフォーカスが来たときだけ」枠線を付ける書き方で、マウスクリック時の余計な枠線を抑えるのに便利です。本コースでは 1 つの概念に絞るため `:focus` のみ扱いますが、「`:focus-visible` というものもある」と覚えておくと、後で役立ちます。

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

</details>

### 前レッスンの状態から始める

これまでのレッスンで作った HTML と `styles.css` を開きます。HTML はフォームまで書かれた状態、CSS には要素セレクタ（`h1` / `h2` / `p` / `a` / `li`）のルールが入っています。

### コピペで動かす: ナビとボタンにクラスを付ける

まず HTML を変更します。`<nav>` のリンクとフォームの送信ボタンにクラスを追加します。差し替えるのは `<header>` の `<nav>` 部分と、フォーム末尾の `<button>` です。

`<nav>` を次の形に置き換えます。

```html
<nav>
  <ul class="nav-list">
    <li><a class="nav-link" href="#profile">プロフィール</a></li>
    <li><a class="nav-link" href="#likes">好きなもの</a></li>
    <li><a class="nav-link" href="#goals">今年やりたいこと</a></li>
    <li><a class="nav-link" href="#links">お気に入りサイト</a></li>
    <li><a class="nav-link" href="#contact">お問い合わせ</a></li>
  </ul>
</nav>
```

フォームの送信ボタンを次の形に置き換えます。

```html
<p>
  <button class="btn primary" type="submit">送信</button>
</p>
```

次に `styles.css` にルールを追加します。既存のルールはそのままに、ファイルの末尾に以下を足します。

```css
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
  background-color: steelblue;
}

.primary:hover {
  background-color: #3a6ea5;
}

.btn:focus {
  outline: 2px solid #ffa726;
  outline-offset: 2px;
}

/* ダークモード対応: 文字色やボタン色が読めなくなる事故を防ぐ */
@media (prefers-color-scheme: dark) {
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

補足:

- `text-decoration: none;` でリンクの下線を消し、`:hover` のときだけ下線が出る形にしている。
- `padding` / `border-radius` / `cursor` はまだ詳しく扱っていないが、ボタンらしく見せるためのおまじないとして今回は受け入れておく。「ボックスモデルで余白を作る」で余白と枠の話を詳しくやる。

### 期待出力

- `<nav>` のリンクは既定では下線なし。マウスカーソルを乗せると下線が付き、色が少し濃くなる。
- Tab キーでナビのリンクを順にフォーカスしていくと、青い枠線（`outline`）が出る。
- フォームの「送信」ボタンは青背景に白文字。マウスカーソルを乗せると背景が少し暗めの青に変わる。
- ボタンをクリックした直後、またはマウスから離して Tab でフォーカスを戻したとき、ボタンの周りにオレンジ色の枠線が出る（`:focus`）。
- DevTools の「Styles」パネルで `<a class="nav-link">` を選ぶと、`:hov` というボタンがあり、そこで `:hover` / `:focus` の状態を **強制的にオン** にできる。これで状態スタイルを確認するのが楽になる。

### DevTools の `:hov` 機能

1. Elements パネルで `<a class="nav-link">プロフィール</a>` を選ぶ。
2. 右側 Styles パネルの上に `:hov` というボタンがある（環境によっては `:hov` と表示、あるいは `Toggle Element State`）。
3. クリックすると `:hover` `:focus` などのチェックボックスが出る。
4. `:hover` にチェックを入れると、プレビューでそのリンクが常時 `:hover` の見た目になる。確認後はチェックを外す。

### 変えてみる

1. `.primary` の背景色を `#d32f2f`（赤系）に変えて、ボタンの見た目を赤ベースにしてみる。
2. `.nav-link:focus` の `outline` を `outline: none;` に書き換えて保存する。Tab でナビを移動すると、選択中の項目が **どこにあるのか分からなくなる**。これがアクセシビリティ的に NG な書き方だと体感する。確認後は必ず戻す。
3. `.nav-link:hover` の `color` を削除して、`:hover` 時に下線だけが付く形にしてみる。

### 自分で書く

ナビの現在位置を示す目印として、`nav-link` に加えて `active` クラスを 1 つだけ手動で付けられるようにしてみます。

1. `<li><a class="nav-link active" href="#profile">プロフィール</a></li>` のように `active` を追加する（プロフィールだけで OK）。
2. `styles.css` の末尾に、`.active` が付いたナビリンクだけ太字にするルールを書く。

書く内容のヒント:

```css
.nav-link.active {
  font-weight: bold;
  color: #0d47a1;
}
```

`.nav-link.active` は「`nav-link` と `active` の **両方** が付いた要素」を指すセレクタ。ドットを連続で書くと「両方のクラスを持つもの」になる（スペースで区切ると意味が変わるので注意）。

## まとめ

- `class` 属性で要素に名前を付け、CSS では `.クラス名` で指定する。複数クラスは HTML ではスペース区切り、CSS ではドットを連続。
- 状態に応じた見た目は擬似クラス（`:hover` / `:focus`）で書ける。
- フォーカスリングは消さない。消すなら代わりの目印を必ず用意する。
- 次のレッスンでは、色・文字サイズ・行間・フォントなど、文字まわりのプロパティをまとめて扱う。
