# lesson12: CSS Grid で二次元レイアウト

lesson11 で Flexbox を使って要素を横並びにしました。Flexbox は「一方向」に並べるのが得意な仕組みです。今回は、**行と列を同時に扱う「二次元レイアウト」** を書くための **CSS Grid** を学びます。

## ゴール

- Flexbox（一次元）と Grid（二次元）の使い分けを説明できる。
- `display: grid` と `grid-template-columns` / `grid-template-rows` で列と行を定義できる。
- `fr` 単位と `repeat()` で列の並びを簡潔に書ける。
- `minmax()` と `auto-fit` を組み合わせて、画面幅に応じてカード数が自動で折り返すレイアウトを作れる。
- lesson11 で作った自己紹介ページの「好きなもの」カード部分を Grid で書き直せる。

## 解説

### Flexbox と Grid の使い分け

どちらも「子要素を並べる」ための仕組みですが、得意分野が違います。

| 仕組み | 得意な形 | 典型例 |
|---|---|---|
| Flexbox | 一次元（横 **または** 縦） | ヘッダーの左右配置、ナビのリンク並び |
| Grid | 二次元（横 **かつ** 縦） | カードを N 列 × M 行に敷き詰める、ページ全体のレイアウト |

「行と列の両方を同時に考えたい」ときは Grid が向きます。lesson11 でカード 3 枚を横並びにしたのは一次元なので Flexbox で十分でしたが、**画面幅が狭くなったら 2 列、もっと狭くなったら 1 列に自動で折り返したい**、というのは Grid の方が自然に書けます。

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

ピクセルで固定すると画面幅に合いません。Grid では **`fr`（fraction、利用可能な幅を何分の何で分け合うか）** という便利な単位が使えます。

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

### やること

lesson11 で作った自己紹介ページの「好きなもの」カード部分を、**Flexbox から Grid に書き換え**、画面幅に応じて 3 列 → 2 列 → 1 列と **自動で折り返す** ようにします。`@media` を自分で書く必要はありません。

### ステップ 1: lesson11 のプロジェクトを開く

StackBlitz で lesson11 のプロジェクトを開きます。`index.html` と `style.css` があり、カード 3 枚が Flexbox で横並びに表示されている状態です。

### ステップ 2: HTML を少し増やす

Grid の効果が分かりやすいよう、カードを 3 枚から 6 枚に増やします。`index.html` の `<section id="likes">` を次のように書き換えます。

```html
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
```

### ステップ 3: `.cards` を Grid に書き換える

`style.css` の `.cards` と `.cards .card` の 2 つのブロックを、次のように書き換えます。lesson11 の `@media (max-width: 600px)` 内にあった `.cards { flex-direction: column; }` は **削除** してください（Grid 側で自動折り返しを扱うため不要になります）。

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

lesson11 では Flexbox で 3 枚を `flex: 1` で等分していました。あのやり方だと、**カードを 10 枚に増やしても 1 行に 10 枚並んでしまい**（それぞれが細くなる）、手動で `flex-wrap: wrap` と個々の `flex-basis` を調整する必要がありました。

Grid の `auto-fit + minmax()` は、この「折り返しと列幅の調整」をまとめて面倒見てくれるので、**カードが増えても減ってもコードを変える必要がありません**。

### 変えてみる

1. `minmax(250px, 1fr)` の `250px` を `180px` や `320px` に変えてみる。それぞれ「1 列の最小幅」が変わり、結果として折り返すタイミングが変わることを確認する。
2. `repeat(auto-fit, ...)` を `repeat(3, 1fr)` に変えてみる。これだとカード 6 枚が **常に 3 列** になり、スマホ幅に縮めるとはみ出してしまう（自動折り返ししない）ことを確認する。その後、元の `auto-fit` に戻す。
3. `gap: 16px` を `gap: 4px` / `gap: 32px` に変えて、見た目の印象の変化を確認する。

### 自分で書く

lesson11 の `<section id="contact">` の下に、新しい `<section id="gallery">` を追加します。

```html
<section id="gallery">
  <h2>ギャラリー</h2>
  <div class="gallery">
    <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 1" />
    <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 2" />
    <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 3" />
    <img src="https://placehold.jp/300x200.png" alt="ギャラリー画像 4" />
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

- Flexbox は一次元、Grid は二次元のレイアウトに向く。カードを敷き詰めたいときは Grid が楽。
- `display: grid` と `grid-template-columns` で列を定義する。`fr` 単位で比率、`repeat()` で繰り返し、`minmax()` で最小幅を指定できる。
- `repeat(auto-fit, minmax(250px, 1fr))` は「画面幅に応じて列数が自動で切り替わる」定番パターン。`@media` なしでレスポンシブになる。
- 次の lesson13 では、`position` を使って要素を「通常の流れから切り離して」任意の位置に配置する方法を学ぶ。
