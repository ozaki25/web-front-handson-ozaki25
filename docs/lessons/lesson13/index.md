# lesson13: CSS Grid で 2 次元レイアウト

「Flexbox とレスポンシブ」で Flexbox を使って要素を横並びにしました。Flexbox は「一方向」に並べるのが得意な仕組みです。今回は、**行と列を同時に扱う「2 次元レイアウト」** を書くための **CSS Grid** を学びます。

## ゴール

- Flexbox（1 次元）と Grid（2 次元）の使い分けを説明できる。
- `display: grid` と `grid-template-columns` / `grid-template-rows` で列と行を定義できる。
- `fr` 単位と `repeat()` で列の並びを簡潔に書ける。
- `minmax()` と `auto-fit` を組み合わせて、画面幅に応じてカード数が自動で折り返すレイアウトを作れる。

## 解説

### Flexbox と Grid の使い分け

どちらも「子要素を並べる」ための仕組みですが、得意分野が違います。

| 仕組み | 得意な形 | 典型例 |
|---|---|---|
| Flexbox | 1 次元（横 **または** 縦） | ヘッダーの左右配置、ナビのリンク並び |
| Grid | 2 次元（横 **かつ** 縦） | カードを N 列 × M 行に敷き詰める、ページ全体のレイアウト |

「行と列の両方を同時に考えたい」ときは Grid が向きます。「Flexbox とレスポンシブ」でカード 3 枚を横並びにしたのは 1 次元なので Flexbox で十分でしたが、**画面幅が狭くなったら 2 列、もっと狭くなったら 1 列に自動で折り返したい**、というのは Grid の方が自然に書けます。

### 今どきの使い分けの目安

現代の CSS の実務では、おおまかに次のような役割分担が主流です。

- **レイアウト（ページ骨格、カード一覧、ギャラリー、ダッシュボード）は Grid**
- **コンポーネント内の整列（ロゴとナビの左右、ボタン列、アイコン+テキスト、中央寄せ 1 つ）は Flex**

カードを画面幅に応じて綺麗に敷き詰めたいような「行と列の両方」を扱う場面では、Flex を無理に使うより Grid の `repeat(auto-fit, minmax(...))` の方が記述も挙動も素直です。迷ったら **レイアウト → Grid、部品内の整列 → Flex** を最初の選択肢にしてください。

### Grid の最小形

並べたい要素たちを包む親要素に `display: grid` を付け、`grid-template-columns` で列の並びを定義します。

```html
<div class="grid">
  <div class="cell">A</div>
  <div class="cell">B</div>
  <div class="cell">C</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  gap: 16px;
}
```

`grid-template-columns: 100px 100px 100px` は「100px の列を 3 つ並べる」という意味です。`gap` で子要素同士の間隔を指定できます（Flexbox と同じ `gap` が使えます）。

### `fr` 単位

ピクセルで固定すると画面幅に合いません。Grid では **`fr`**（fraction。余っている幅を分け合う比率の単位）という便利な単位が使えます。

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
```

これは「親の幅を 3 等分する 3 列」という意味です。`1fr 2fr 1fr` と書けば「左:中央:右 = 1:2:1 の比率で分ける」になります。

### `repeat()` で繰り返し

同じ幅の列を何個も並べたいとき、毎回書くのは面倒です。`repeat()` を使うとまとめられます。

```css
.grid {
  grid-template-columns: repeat(3, 1fr);
}
```

`repeat(3, 1fr)` は `1fr 1fr 1fr` と同じ意味です。

### `minmax()` で最小幅と最大幅を指定

`minmax(最小, 最大)` は「この範囲の中で幅を決める」という関数です。

```css
.grid {
  grid-template-columns: repeat(3, minmax(200px, 1fr));
}
```

これは「200px を下回らないようにしつつ、余った幅は均等に伸ばす 3 列」です。親が狭すぎて 200px × 3 に収まらないときは、子要素が親からはみ出すこともあります。

### `auto-fit` でカード数を自動調整

ここまで「3 列」「4 列」と数を決めていましたが、画面幅に応じて列数そのものを自動で増減させたい場合があります。その用途に作られたのが **`auto-fit`** です。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
```

意味を分解します。

- `auto-fit`: 列数をブラウザに任せる。
- `minmax(250px, 1fr)`: 1 列の幅は最低 250px、余った幅は均等配分。

これで画面が広ければ多くの列、狭ければ少ない列に自動で切り替わります。**`@media` を書かなくてもレスポンシブになる** のが強みです。

下のデモは `repeat(auto-fit, minmax(120px, 1fr))` の典型です。プレビューの幅を広げ狭めする（右上の Open in New Tab で試すと変化が分かりやすい）と、列数が自動で変わります。

<LiveDemo
  height="220px"
  :html="`
<div class='grid'>
  <div>1</div><div>2</div><div>3</div>
  <div>4</div><div>5</div><div>6</div>
</div>
  `"
  :css="`
body { padding: 16px; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.grid > div {
  background: #1f4e79;
  color: white;
  padding: 24px 0;
  text-align: center;
  border-radius: 4px;
}
  `"
  :js="``"
/>

### `grid-template-rows` と行の指定

行を明示したい場合は `grid-template-rows` を使います。

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 100px 200px;
  gap: 16px;
}
```

ただし、今回の演習のように「カードを敷き詰める」ときは、行の高さは中身に任せるのが普通なので `grid-template-rows` を省くことが多いです。

### 特定のセルをまたぐ（発展、今回は使わない）

`grid-column: span 2` で「このセルは 2 列ぶんの幅を取る」のように、個別のセルを大きくもできます。ページ全体のレイアウトで「サイドバーは 1 列、メインは 3 列ぶん」のような指定に便利ですが、今回の演習では使いません。

## 演習

### 途中から始める場合

これまでのレッスンで作った `index.html` / `style.css` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。`style.css` は新規作成してください（このレッスン以降は `style.css` というファイル名で進めます）。

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
            <img src="https://placehold.co/300x200.png" alt="コーヒーのプレースホルダ画像" />
            <h3>コーヒー</h3>
            <p>朝の 1 杯が欠かせない。</p>
          </article>
          <article class="card">
            <img src="https://placehold.co/300x200.png" alt="本のプレースホルダ画像" />
            <h3>本</h3>
            <p>技術書からエッセイまで。</p>
          </article>
          <article class="card">
            <img src="https://placehold.co/300x200.png" alt="散歩のプレースホルダ画像" />
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
  display: flex;
  gap: 16px;
}

.cards .card {
  flex: 1;
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

  .cards {
    flex-direction: column;
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

これまでのレッスンで作った自己紹介ページの「好きなもの」カード部分を、**Flexbox から Grid に書き換え**、画面幅に応じて 3 列 → 2 列 → 1 列と **自動で折り返す** ようにします。`@media` を自分で書く必要はありません。

### ステップ 1: これまでのプロジェクトを開く

StackBlitz でこれまでのプロジェクトを開きます。`index.html` と `style.css` があり、カード 3 枚が Flexbox で横並びに表示されている状態です。

### ステップ 2: HTML を少し増やす

Grid の効果が分かりやすいよう、カードを 3 枚から 6 枚に増やします。`index.html` の `<section id="likes">` を次のように書き換えます。

```html
<section id="likes">
  <h2>好きなもの</h2>
  <div class="cards">
    <article class="card">
      <img src="https://placehold.co/300x200.png" alt="コーヒーのプレースホルダ画像" />
      <h3>コーヒー</h3>
      <p>朝の 1 杯が欠かせない。</p>
    </article>
    <article class="card">
      <img src="https://placehold.co/300x200.png" alt="本のプレースホルダ画像" />
      <h3>本</h3>
      <p>技術書からエッセイまで。</p>
    </article>
    <article class="card">
      <img src="https://placehold.co/300x200.png" alt="散歩のプレースホルダ画像" />
      <h3>散歩</h3>
      <p>行き先を決めずに歩く。</p>
    </article>
    <article class="card">
      <img src="https://placehold.co/300x200.png" alt="音楽のプレースホルダ画像" />
      <h3>音楽</h3>
      <p>作業中はインストゥルメンタル。</p>
    </article>
    <article class="card">
      <img src="https://placehold.co/300x200.png" alt="写真のプレースホルダ画像" />
      <h3>写真</h3>
      <p>スマホで散歩の途中に。</p>
    </article>
    <article class="card">
      <img src="https://placehold.co/300x200.png" alt="料理のプレースホルダ画像" />
      <h3>料理</h3>
      <p>凝らない、続ける。</p>
    </article>
  </div>
</section>
```

### ステップ 3: `.cards` を Grid に書き換える

`style.css` の `.cards` と `.cards .card` の 2 つのブロックを、次のように書き換えます。「Flexbox とレスポンシブ」で追加した `@media (max-width: 600px)` 内の `.cards { flex-direction: column; }` は **削除** してください（Grid 側で自動折り返しを扱うため不要になります）。

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
```

`.cards .card` の `flex: 1` は **削除** します。Grid では列幅を `grid-template-columns` 側で決めるので、子要素に個別の幅指定は不要です。

### 期待出力

- プレビューを広く表示: カード 6 枚が **3 列 × 2 行** に並ぶ。
- プレビューを中くらいに縮める: カードが **2 列 × 3 行** になる。
- プレビューをスマホ幅まで縮める: カードが **1 列 × 6 行** になる。
- DevTools の「デバイスツールバー」（Chrome では `Ctrl+Shift+M` / `Cmd+Shift+M`）で iPhone SE（375px）などに切り替えても、カードが 1 列に並ぶことを確認できる。
- `@media` を書いていないのにレスポンシブになっていることに注目する。

### Flexbox 版と見比べる

「Flexbox とレスポンシブ」では Flexbox で 3 枚を `flex: 1` で等分していました。あのやり方だと、**カードを 10 枚に増やしても 1 行に 10 枚並んでしまい**（それぞれが細くなる）、手動で `flex-wrap: wrap` と個々の `flex-basis` を調整する必要がありました。

Grid の `auto-fit + minmax()` は、この「折り返しと列幅の調整」をまとめて面倒見てくれるので、**カードが増えても減ってもコードを変える必要がありません**。

### 変えてみる

1. `minmax(250px, 1fr)` の `250px` を `180px` や `320px` に変えてみる。それぞれ「1 列の最小幅」が変わり、結果として折り返すタイミングが変わることを確認する。
2. `repeat(auto-fit, ...)` を `repeat(3, 1fr)` に変えてみる。これだとカード 6 枚が **常に 3 列** になり、スマホ幅に縮めるとはみ出してしまう（自動折り返ししない）ことを確認する。その後、元の `auto-fit` に戻す。
3. `gap: 16px` を `gap: 4px` / `gap: 32px` に変えて、見た目の印象の変化を確認する。

### 自分で書く

手元の `<section id="contact">` の下に、新しい `<section id="gallery">` を追加します。

```html
<section id="gallery">
  <h2>ギャラリー</h2>
  <div class="gallery">
    <img src="https://placehold.co/300x200.png" alt="ギャラリー画像 1" />
    <img src="https://placehold.co/300x200.png" alt="ギャラリー画像 2" />
    <img src="https://placehold.co/300x200.png" alt="ギャラリー画像 3" />
    <img src="https://placehold.co/300x200.png" alt="ギャラリー画像 4" />
  </div>
</section>
```

そして `style.css` に、`.gallery` を Grid で組むスタイルを **自分で書いて** みます。条件:

- 画像が幅 200px を下回らないようにする
- `gap` は 12px
- `auto-fit` で列数は自動

ヒントは `.cards` のコードをなぞること。完成したら、`.gallery` 内の画像が画面幅に応じて 4 列 → 3 列 → 2 列 → 1 列と折り返されることを確認します。

### よくあるつまずき

- `grid-template-columns` を親ではなく子要素に書いてしまう。Grid の指定は **並べたい要素を包む親** に付けます。
- `auto-fit` と `auto-fill` を混同する。今回は `auto-fit`（余った幅を既存の列で分け合う）を使います。`auto-fill` だと「空の列を作って詰める」挙動になり、1〜2 個しかカードがないときに妙に細く見えることがあります。
- `gap` が効かない → 親に `display: grid` が付いていない。まず親のセレクタに `display: grid` があるか確認する。

## まとめ

- Flexbox は 1 次元、Grid は 2 次元のレイアウトに向く。**レイアウトは Grid、コンポーネント内の整列は Flex** が現代の目安。
- `display: grid` と `grid-template-columns` で列を定義する。`fr` 単位で比率、`repeat()` で繰り返し、`minmax()` で最小幅を指定できる。
- `repeat(auto-fit, minmax(250px, 1fr))` は「画面幅に応じて列数が自動で切り替わる」定番パターン。`@media` なしでレスポンシブになる。
