# lesson13: Position と z-index

ここまでは要素を「通常の流れ」の中で並べてきました。上から順に積まれたり、Flexbox や Grid で行・列に整列したりする並びです。今回は、**通常の流れから要素を切り離して、画面の好きな位置に配置する** ための `position` プロパティを学びます。

## ゴール

- `position: static` / `relative` / `absolute` / `fixed` / `sticky` の違いを説明できる。
- `top` / `right` / `bottom` / `left` で位置を指定できる。
- `z-index` で要素の前後の重なりを制御できる。
- 「ページトップに戻る」ボタンを画面右下に固定表示できる。
- カードの右上に「NEW」バッジを重ねて表示できる。

## 解説

### `position` とは何か

要素の配置方法を決めるプロパティです。値は 5 つ覚えれば十分です。

| 値 | 意味 |
|---|---|
| `static` | 初期値。通常の流れで配置される（`top` などは効かない） |
| `relative` | 通常の位置を基準にズラせる。子の `absolute` の基準にもなる |
| `absolute` | **親で最も近い `relative` / `absolute` / `fixed`** を基準に浮く |
| `fixed` | **画面（ビューポート）** を基準に固定。スクロールしても動かない |
| `sticky` | 親の中で、スクロール位置に応じて `relative` ↔ 固定を切り替わる |

### 位置指定の 4 つ: `top` / `right` / `bottom` / `left`

`position` を `static` 以外にすると、`top` / `right` / `bottom` / `left` で **基準からの距離** を指定できます。

```css
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

「基準の上端から 8px、右端から 8px」の位置に配置されます。値は負の数も OK です（`top: -10px` で基準の外にはみ出す）。

### `relative`: 通常の位置を基準にズラす

```css
.note {
  position: relative;
  top: 10px;
  left: 20px;
}
```

通常の位置から下に 10px、右に 20px ズレて表示されます。周囲のレイアウトには影響を与えず（元の場所は空けたまま）、見た目だけズレるのが特徴です。

**より重要な使い方**: 子要素の `absolute` の基準点になる、という役割です。次の `absolute` で解説します。

### `absolute`: 親を基準に浮かせる

```html
<div class="card">
  <span class="badge">NEW</span>
  <h3>カードのタイトル</h3>
</div>
```

```css
.card {
  position: relative;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

`.badge` は通常の流れから抜けて、**最も近い `position: relative` / `absolute` / `fixed` の祖先を基準に** 浮きます。この例では親の `.card` が基準なので、カードの右上に重なります。

ここで **親に `position: relative` を書き忘れると**、`.badge` は更に上の祖先（もしくは `<body>`）を基準にしてしまい、カードの右上ではなくページ全体の右上に飛んでしまいます。これは非常によく起きる事故なので、「絶対配置の子がいる親には `position: relative`」と覚えます。

また、`absolute` の要素は通常の流れから抜けるため、**元の場所は詰められる**（他の兄弟要素が詰めて配置される）点が `relative` と違います。

下のデモは、カードの右上に「NEW」バッジを `absolute` で重ねた例です。親に `position: relative` を入れてあるので、バッジはカードの角を基準にきれいに配置されます。CSS から `.card` の `position: relative` を外すと、バッジがページの角へ飛んでいく挙動も確認できます。

<LiveDemo
  height="200px"
  :html="`
<div class='card'>
  <span class='badge'>NEW</span>
  <h3>カードのタイトル</h3>
  <p>本文のテキスト</p>
</div>
  `"
  :css="`
body { padding: 16px; }
.card {
  position: relative;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  max-width: 320px;
}
.card h3 { margin: 0 0 8px; }
.card p { margin: 0; color: #555; }
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: crimson;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
  `"
  :js="``"
/>

### `fixed`: 画面に固定

```css
.to-top {
  position: fixed;
  right: 16px;
  bottom: 16px;
}
```

親が何であっても **ビューポート（ブラウザの表示領域）** を基準に固定されます。ページをスクロールしても、画面内の同じ位置に居続けます。「ページトップに戻る」ボタン、チャットの吹き出し、Cookie バナーなどの定番の使い方です。

### `sticky`: 途中までは普通、そこから固定

```css
.section-title {
  position: sticky;
  top: 0;
  background-color: #ffffff;
}
```

最初は通常の流れで配置されますが、スクロールして指定位置（`top: 0`）に達すると、そこから固定されます。親要素をはみ出ると、また元の流れに戻ります。本のインデックスや表のヘッダーで使われます。今回の演習では使いませんが、存在だけ覚えます。

### `z-index` で重なりを制御

要素同士が重なったとき、**どちらが前か** を `z-index` で決めます。

```css
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}
```

- `z-index` は **数字が大きいほど前** に出る。
- `z-index` が効くのは **`position` が `static` 以外の要素だけ**。
- 負の値（`-1` など）も使えるが、思わぬ要素の裏に回るので最初は正の値だけでよい。

### stacking context（重なりの文脈）の最小知識

「`z-index: 9999` を付けたのに何故か前に出ない」場面に将来出会います。原因は **stacking context** という仕組みです。ざっくり言うと、**ある要素に `position` + `z-index` を指定すると、その要素の内部で「独立した重なりの世界」が作られ、外側の `z-index` と直接比較できなくなる** というものです。

今回の演習では起きないので、「いつか `z-index` が効かないことがあるらしい」とだけ頭の隅に置いておきます。

## 演習

### 途中から始める場合

前のレッスンまでで作った `index.html` / `style.css` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。`style.css` は新規作成してください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

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
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="音楽のプレースホルダ画像" />
            <h3>音楽</h3>
            <p>作業中はインストゥルメンタル。</p>
          </article>
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="写真のプレースホルダ画像" />
            <h3>写真</h3>
            <p>スマホで散歩の途中に。</p>
          </article>
          <article class="card">
            <img src="https://placehold.jp/300x200.png" alt="料理のプレースホルダ画像" />
            <h3>料理</h3>
            <p>凝らない、続ける。</p>
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

      <section id="gallery">
        <h2>ギャラリー</h2>
        <div class="gallery">
          <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 1" />
          <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 2" />
          <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 3" />
          <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 4" />
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p>&copy; 私の名前</p>
    </footer>
  </body>
</html>
```

**`style.css`**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #f9fafb;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #e5e7eb;
    background-color: #0b1220;
  }
}

a {
  color: #2563eb;
}

a:focus {
  outline: 3px solid #60a5fa;
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

  display: flex;
  align-items: center;
  justify-content: space-between;
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

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.gallery img {
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
}

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

</details>

### やること

これまでのレッスンで作った自己紹介ページに、次の 2 つを追加します。

1. 画面右下に **「ページトップに戻る」ボタン** を `position: fixed` で常時表示する。
2. 「好きなもの」の最初のカードの右上に **「NEW」バッジ** を `position: absolute` で重ねる。

### ステップ 1: 「ページトップに戻る」ボタンを追加

`index.html` の `</main>` の直後、`<footer>` の直前に、次のリンクを追加します。

```html
<a class="to-top" href="#">ページトップへ</a>
```

`href="#"` はページの先頭へのアンカーです。これで、クリックするとページ先頭にジャンプします。

次に、ボタンの位置を `style.css` の末尾に追加します。

```css
.to-top {
  position: fixed;
  right: 16px;
  bottom: 16px;

  padding: 12px 16px;
  background-color: #2563eb;
  color: #ffffff;
  text-decoration: none;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.to-top:focus {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}

@media (prefers-color-scheme: dark) {
  .to-top {
    background-color: #3b82f6;
    color: #ffffff;
  }
}
```

### 期待出力（ステップ 1）

- プレビュー画面の **右下** に青い丸いボタンが常に見える。
- ページをスクロールしても、ボタンはその場に留まる。
- ボタンをクリックすると、ページの一番上に戻る。
- Tab キーでフォーカスを当てると、青い太いアウトライン（フォーカスリング）が出る。

### ステップ 2: 「NEW」バッジを重ねる

`index.html` の「好きなもの」セクションの **最初のカード**（コーヒー）に、`<span class="badge">` を追加します。

```html
<article class="card card-new">
  <span class="badge">NEW</span>
  <img src="https://placehold.jp/300x200.png" alt="コーヒーのプレースホルダ画像" />
  <h3>コーヒー</h3>
  <p>朝の 1 杯が欠かせない。</p>
</article>
```

`<article>` に `card-new` クラスを追加しているのは、後で「親に `position: relative` が効く目印」として使うためです。ただし `.card` 自体に `position: relative` を付けても同じ効果になります（今回はシンプルにカード全体に付ける書き方にします）。

`style.css` の末尾に以下を追加します。

```css
.card {
  position: relative;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;

  padding: 2px 8px;
  background-color: #dc2626;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  z-index: 1;
}

@media (prefers-color-scheme: dark) {
  .badge {
    background-color: #ef4444;
    color: #ffffff;
  }
}
```

`.card` に `position: relative` を付けるのがポイントです。これで、子の `.badge` の `absolute` が **親カードを基準に** 浮くようになります。

### 期待出力（ステップ 2）

- 最初のカード（コーヒー）の **右上** に赤い「NEW」バッジが乗っている。
- バッジの位置は、カードの上端から 8px、右端から 8px。
- カードの幅を変えてもバッジは常にカードの右上に追従する。
- DevTools の Elements パネルで `.badge` をクリックすると、カード右上の小さな領域がハイライトされる。

### 失敗を体験する（重要）

`.card { position: relative; }` の 1 行を **一時的に削除** してみてください。`.badge` はカードを基準にできなくなり、**ページ全体の右上**（ビューポートではなく `<body>` の端）に飛びます。これが `absolute` の親基準ルールです。確認できたら、`position: relative` を戻します。

### 変えてみる

1. `.to-top` の `bottom: 16px` を `bottom: 100px` に変えて、ボタンの位置が上に動くことを確認する。
2. `.badge` の `top: 8px; right: 8px;` を `top: -8px; right: -8px;` に変えて、バッジがカードから「はみ出す」位置に重なることを確認する（負の値が使えるのが `position` の強み）。
3. `z-index: 10` と `z-index: 1` を入れ替えてみる。`.to-top` が `.badge` より後ろに行ってもページ上では重ならないが、スクロールして重なる瞬間があれば前後関係の違いが分かる。

### 自分で書く

自己紹介ページの `<header>` を **画面上部に固定**（`position: fixed`）して、スクロールしても常にヘッダーが見える状態にしてみます。

ヒント:

- `.site-header` に `position: fixed; top: 0; left: 0; right: 0;` を足す
- ヘッダーが固定されると `<main>` の一部が裏に隠れるので、`main` に `padding-top: 80px` などを足して、ヘッダーぶんの隙間を作る
- `.site-header` には `z-index: 20`（`.to-top` より前）を足して、スクロール中に他の要素の前に出るようにする

やってみて、動作を確認できたら、ヘッダー固定は **次のレッスンで使わない** ので元に戻しておきます（`.site-header` から `position: fixed` 系の指定を削除、`main` の `padding-top` も元に戻す）。練習のため一度試すだけです。

### よくあるつまずき

- 子要素を `absolute` で浮かせたのに、親ではなく `<body>` 基準になる → 親に `position: relative` を付け忘れている。
- `z-index` が効かない → そもそも `position` が `static`（初期値）のまま。`z-index` は `position` が `static` 以外でないと効かない。
- `fixed` したボタンがスクロールすると動いてしまう → 祖先要素のどこかに `transform` や `filter` が指定されていると、`fixed` の基準がその祖先に変わる仕様がある。今回の演習では起きないが、将来遭遇したら思い出す。

## まとめ

- `position` は要素を「通常の流れ」から切り離して配置するプロパティ。
- `relative` は通常の位置を基準にズラし、子の `absolute` の基準点にもなる。
- `absolute` は最も近い `relative` / `absolute` / `fixed` の祖先を基準に浮く。
- `fixed` は画面（ビューポート）を基準に固定。スクロールしても動かない。
- `z-index` で前後の重なりを制御できる（`position` が `static` 以外のときだけ効く）。
- 次のレッスンでは、`:hover` で色や位置をなめらかに変化させる `transition` を学ぶ。1 章 の締めで、自己紹介ページに動きを足す。
