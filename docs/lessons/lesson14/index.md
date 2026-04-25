# lesson14: Transition と hover アニメーション

これまで作ってきた自己紹介ページに、**マウスを乗せたとき（hover）になめらかに変化する動き** を足します。また、動きが苦手な人への配慮として **`prefers-reduced-motion`** で動きを抑える書き方も学びます。

## ゴール

- `transition` プロパティで、CSS の値の変化をなめらかに補間できる。
- `transition-property` / `transition-duration` / `transition-timing-function` の役割を説明できる。
- `transform: translate` で要素を動かし、`transform: scale` で拡大縮小できる。
- `@media (prefers-reduced-motion: reduce)` で動きを OFF にできる。
- DevTools の Rendering タブで `prefers-reduced-motion: reduce` をエミュレートして動作確認できる。

## 解説

### `transition` は「値の変化をなめらかにつなぐ」

通常、CSS の値が変わると **一瞬で** 切り替わります。たとえば `:hover` で色を変えると、マウスを乗せた瞬間にパッと色が変わります。

`transition` プロパティを付けると、**値の変化に時間をかけて** くれます。結果として「ふわっと色が変わる」「じわっと位置が動く」ような演出ができます。

```css
.button {
  background-color: #2563eb;
  transition: background-color 200ms ease;
}

.button:hover {
  background-color: #1d4ed8;
}
```

この例では「`background-color` が変化するときだけ、200ms（= 0.2 秒）かけて `ease`（ゆっくり始まってゆっくり終わる）でつなぐ」という意味になります。

### `transition` の 4 つのパーツ

`transition` は 4 つのサブプロパティをまとめたショートハンドです。

| プロパティ | 意味 | 例 |
|---|---|---|
| `transition-property` | どのプロパティに掛けるか | `background-color`、`all`（全部） |
| `transition-duration` | 何 ms / 何 s かけるか | `200ms`、`0.3s` |
| `transition-timing-function` | 変化の緩急 | `ease`、`linear`、`ease-in-out` |
| `transition-delay` | 変化が始まるまでの待ち時間 | `0s`、`100ms` |

ショートハンドで書くと次のようになります（`delay` は省略可）。

```css
.button {
  transition: background-color 200ms ease;
}
```

複数のプロパティに別々の時間を掛けたいときはカンマ区切りで並べられます。

```css
.card {
  transition:
    transform 200ms ease,
    box-shadow 200ms ease;
}
```

最初のうちは、**`all 200ms ease`** と書いて「変化する全プロパティに同じ時間をかける」くらいで十分実用になります。

```css
.card {
  transition: all 200ms ease;
}
```

### `transform` で位置・拡大を変える

`transition` と組み合わせるとよく使うのが `transform` です。

- `transform: translateY(-4px)` → 要素を 4px 上に動かす。
- `transform: scale(1.05)` → 要素を 1.05 倍（5% 大きく）に拡大する。
- `transform: translateY(-4px) scale(1.05)` → 両方同時。

`transform` の利点は、**レイアウトを壊さない** ことです。`margin-top: -4px` でも似た動きに見えますが、こちらは周囲の要素の位置計算に影響を与えます。`transform` は描画だけをズラすのでパフォーマンスもよく、アニメーションに向いています。

下のデモで、カードにマウスを乗せると `transform` と `box-shadow` が `transition` でなめらかに変化します。ホバーを外すと元の状態に戻るところまで、目で追えます。

<LiveDemo
  height="220px"
  :html="`
<div class='card'>
  <h3>ホバーしてみて</h3>
  <p>transform と box-shadow が 250ms でなめらかに動きます。</p>
</div>
  `"
  :css="`
body { padding: 24px; background: #f5f7fa; }
.card {
  max-width: 320px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 250ms ease, box-shadow 250ms ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.card h3 { margin: 0 0 8px; }
.card p { margin: 0; color: #555; }
  `"
  :js="``"
/>

### `prefers-reduced-motion` で動きを抑える

動きのあるアニメーションは楽しい一方で、**乗り物酔い** のように画面の動きで気分が悪くなる人がいます。OS 側に「動きを減らす」設定があり（macOS の「視差効果を減らす」、Windows の「アニメーションを表示」OFF など）、この設定は CSS から **`@media (prefers-reduced-motion: reduce)`** で検出できます。

```css
.card {
  transition: all 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
```

この書き方で「動きを減らす設定の人にはアニメーションを OFF」にできます。CSS だけで配慮できるので、足しておく価値が十分にあります。

### DevTools で `prefers-reduced-motion` をエミュレート

自分の OS 設定を変えなくても、ブラウザの DevTools 側で「動きを減らす」状態を一時的に再現できます。Chrome の手順:

1. DevTools を開く（`F12` / `Ctrl+Shift+I` / `Cmd+Option+I`）。
2. DevTools の右上の **3 点メニュー**（縦の `⋮`）→ **More tools** → **Rendering** を選ぶ。
3. 出てきた Rendering パネル（下部か横に並ぶ）をスクロールして **Emulate CSS media feature prefers-reduced-motion** を探す。
4. ドロップダウンで `reduce` を選ぶ。

以降、その DevTools が開いているページでは `prefers-reduced-motion: reduce` が有効化された状態になります。戻したいときは同じドロップダウンで `no-preference`（= 初期値）に戻します。

### このレッスンで揃うもの

1 章 で扱ってきた HTML の基本タグ、CSS 基礎、Flexbox、Grid、Position に、今回の Transition を加えると、**静的なページに「動き」を足す** という現代的な CSS の基本が組み合わせられます。残りの「モダン CSS」「ネイティブ UI」と合わせると 1 章 が完成します。

## 演習

### 途中から始める場合

これまでのレッスンで作った `index.html` / `style.css` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。`style.css` は新規作成してください。

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
          <article class="card card-new">
            <span class="badge">NEW</span>
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

    <a class="to-top" href="#">ページトップへ</a>

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
  position: relative;
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

</details>

### やること

自己紹介ページの「好きなもの」カードに、以下のアニメーションを付けます。

1. `:hover` で **カードが少し上に浮く**（`translateY(-4px)`）。
2. 同時に **影が少し濃くなる**（`box-shadow` の変化）。
3. `transition: all 200ms ease` で滑らかに補間する。
4. `prefers-reduced-motion: reduce` の環境では `transition: none` に切り替え、動きを OFF にする。

### ステップ 1: カードにデフォルトの影を付ける

`style.css` の `.card` を次のように書き換えます（これまでのレッスンで既に背景色や padding は指定済みの前提）。

```css
.card {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  position: relative;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 200ms ease;
}

@media (prefers-color-scheme: dark) {
  .card {
    background-color: #111827;
    border-color: #374151;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  }
}
```

ポイント:

- 先ほど追加した `position: relative`（バッジの基準用）はそのまま残す。
- `box-shadow` で薄い影を付ける（ダークモードでは影を濃く）。
- `transition: all 200ms ease` を書いておく。`all` にしておけば、`:hover` で変わる全プロパティに同じ補間が掛かる。

### ステップ 2: `:hover` で浮き上がらせる

`style.css` に次を追加します。

```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

@media (prefers-color-scheme: dark) {
  .card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8);
  }
}
```

`translateY(-4px)` で 4px 上に、`box-shadow` を濃く大きくして「浮いている」印象を強めます。

### ステップ 3: `prefers-reduced-motion` で動きを OFF

`style.css` の末尾に次を追加します。

```css
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }

  .card:hover {
    transform: none;
  }
}
```

これで、OS やブラウザが「動きを減らす」設定のときは、カードはパッと切り替わるだけで、浮き上がるアニメーションは発生しません。影の変化も瞬時になるので気分を悪くしにくくなります。

### 期待出力

- プレビューのカードにマウスを乗せると、**約 200ms かけてカードが 4px 上に浮き**、同時に **影が濃く大きく** なる。
- マウスを外すと、また約 200ms かけて元の位置と影に戻る。
- DevTools の **Rendering タブで `prefers-reduced-motion: reduce` をエミュレート** した状態にすると、マウスを乗せた瞬間にパッと位置と影が変わり、動きが無くなる。戻すと（`no-preference`）また滑らかに動く。
- Chrome で `Ctrl+Shift+P`（macOS は `Cmd+Shift+P`）でコマンドパレットを開き、「Show Rendering」と入力しても Rendering タブを呼び出せる。

### 変えてみる

1. `transition: all 200ms ease` の `200ms` を `500ms` や `1000ms` に変えてみる。動きが「ゆっくり」になることを確認する。
2. `ease` を `linear` に変えてみる。緩急が無くなり機械的な動きになる。`ease-in-out` にすると、始まりと終わりが特にゆっくりになる。
3. `transform: translateY(-4px)` に `scale(1.03)` を足す（`transform: translateY(-4px) scale(1.03);`）。浮きながら少し拡大される効果になる。

### 自分で書く

「ページトップに戻る」ボタン（先ほど追加した `.to-top`）にも、hover 時のアニメーションを付けてみます。条件:

- hover で背景色が濃い青（`#1d4ed8`）に変わる
- hover で 1.05 倍に拡大する（`transform: scale(1.05)`）
- `transition: all 200ms ease` で補間
- `prefers-reduced-motion: reduce` のときは `transition: none` と `transform: none`

ヒントは `.card` のコードを真似すること。完成したら、DevTools の Rendering タブで `prefers-reduced-motion` を切り替え、動きの有無を確認します。

### よくあるつまずき

- `transition` を `:hover` の側に書いてしまう。`transition` は **通常状態** に書きます。そうしないと「マウスを離すとき」の戻りが補間されません（厳密には `:hover` 側にも書く書き方もありますが、最初は通常状態に付けるのが素直です）。
- `transform` を使わず `margin-top: -4px` で浮かせる → 周囲のレイアウトがガタつく。`transform` を使う。
- `transition: all` が効かない → そもそも変化するプロパティが書かれていない（`:hover` で色も位置も変わっていないなど）。まず何を変えたいかを決めて、`:hover` 側に書く。

## まとめ

### このレッスンのまとめ

- `transition` で値の変化をなめらかに補間できる。最初は `transition: all 200ms ease` で十分。
- `transform: translateY()` / `scale()` はレイアウトを壊さずに位置・大きさを変えられる。
- `@media (prefers-reduced-motion: reduce)` で動きを OFF にできる。動きが苦手な人への最低限の配慮として覚えておく。
- DevTools の Rendering タブで `prefers-reduced-motion` をエミュレートして動作確認できる。

### ここまでで揃ったもの

このレッスンまでで、次のことができるようになりました。

- HTML の基本タグ（見出し・段落・リスト・リンク・画像・フォーム・セマンティックタグ）で文書を組み立てられる
- CSS を外部ファイルで読み込み、セレクタ・擬似クラス・色や文字・余白を指定できる
- Flexbox（一次元）と Grid（二次元）でモダンなレイアウトを組める
- `position` で要素を通常の流れから切り離して配置し、`z-index` で前後関係を制御できる
- `transition` と `transform` で動きを足し、`prefers-reduced-motion` で配慮できる
- `@media` メディアクエリで画面幅やダークモード、動きの設定に応じてスタイルを変えられる

ここで作った **自己紹介ページ** は、5 章 の「ページを増やしてリンクで移動する」で Next.js の `/about` ページとしてもう一度登場します。HTML と CSS のファイルはそのまま保存しておきましょう。`class` を `className` に、`<label for>` を `<label htmlFor>` に、`<img>` の自己閉じタグに `/` を足すだけで、ほぼそのまま Next.js の JSX になります。

このあと **「モダン CSS」** で `:has()` / `@container` 等の最新機能、**「ネイティブ UI」** で `<dialog>` / popover を扱い、1 章 を仕上げます。JS 側は 2 章 の「最初の JavaScript」から始めます。
