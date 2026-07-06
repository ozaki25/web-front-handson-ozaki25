# lesson09: セレクタの組み合わせと詳細度

## ゴール

- 子孫セレクタ（`a b`）/ 子セレクタ（`a > b`）/ 隣接セレクタ（`a + b`）を使い分けられる。
- 属性セレクタ（`[type="email"]`）が書ける。
- **詳細度** の基本ルール（id > class > 要素 / 同じなら後勝ち）を説明できる。
- `!important` がなぜ最後の手段なのかを理解する。

## 解説

「クラスと状態」までで、要素セレクタとクラスセレクタを使い分けられるようになりました。これらを **組み合わせる** と、もう少し細かい指定ができます。あわせて、新しいセレクタ（id セレクタと属性セレクタ）と、複数のルールが衝突したときに勝敗を決める **詳細度** も学びます。

### id セレクタ: `#名前`

「ページの骨格を組む」で `id` 属性を使い、`<section id="profile">` のように書きました。CSS からは `#profile { ... }` の形でその要素だけを狙えます。これが **id セレクタ** です。

```css
#main-content {
  max-width: 800px;
  margin: 0 auto;
}
```

クラスとの違いは「使える数」です。

- **クラス** (`.btn`): 同じクラスをページ内の **複数の要素** に付けられる。「種類」のラベル
- **id** (`#main-content`): ページ内に **1 つだけ**。「固有の名前」

ヘッダーやメインコンテンツのように **ページ内に 1 個しかないもの** に使います。

> **実務では id をスタイル指定に使わない** のが主流です。後述の詳細度の節で扱う通り「強すぎて上書きしにくい」ためで、見た目はクラスで当てるのが定番です。本レッスンでは詳細度を体感するために id セレクタも書きますが、普段使いはクラスで十分です。

### 子孫セレクタ: `a b`（半角スペース）

セレクタを **半角スペース** でつなげると、「`a` の中にある `b`」を意味します。間に他の要素が挟まっていても OK です。

```css
.card p {
  color: crimson;
}
```

これは「`.card` の中にある `<p>` すべて」に色を付けます。直接の子でなくても、`.card` の子孫であれば対象になります。

```html
<div class="card">
  <h2>タイトル</h2>
  <div class="body">
    <p>本文</p>  <!-- 対象 -->
  </div>
</div>
<p>これは外側</p>  <!-- 対象外 -->
```

下のデモで、`.card` の中の段落だけが赤くなり、外の段落は黒のままになるのが見えます。

<LiveDemo
  height="180px"
  :html="`
<div class='card'>
  <h2>タイトル</h2>
  <p>card の中の段落（赤くなる）</p>
  <div class='body'>
    <p>さらに入れ子の段落（赤くなる）</p>
  </div>
</div>
<p>外側の段落（黒のまま）</p>
  `"
  :css="`
body { padding: 12px; font-family: system-ui; color: #111; background: #fff; }
.card { border: 1px solid #d1d5db; padding: 12px; margin-bottom: 12px; }
.card p { color: crimson; font-weight: bold; }
@media (prefers-color-scheme: dark) {
  body { color: #eaeaea; background: #1a1a1a; }
  .card { border-color: #555; }
  .card p { color: #ff6b6b; }
}
  `"
  :js="``"
/>

### 子セレクタ: `a > b`

`>` を挟むと「**直接の子**」だけに限定できます。孫より下は対象外です。

```css
.card > p {
  background-color: lightyellow;
}
```

```html
<div class="card">
  <p>直接の子</p>       <!-- 対象 -->
  <div>
    <p>孫の p</p>      <!-- 対象外 -->
  </div>
</div>
```

下のデモは、`.card` の **直接の子** の段落だけ黄色背景になります。`<div>` でくるんだ孫の段落は背景色が付きません。

<LiveDemo
  height="200px"
  :html="`
<div class='card'>
  <p>直接の子（黄色背景）</p>
  <div class='inner'>
    <p>孫の段落（背景なし）</p>
  </div>
  <p>もう 1 つ直接の子（黄色背景）</p>
</div>
  `"
  :css="`
body { padding: 12px; font-family: system-ui; color: #111; background: #fff; }
.card { border: 1px solid #d1d5db; padding: 12px; }
.card > p { background-color: lightyellow; padding: 4px 8px; }
.inner { padding: 8px; border-left: 3px solid #d1d5db; margin: 8px 0; }
@media (prefers-color-scheme: dark) {
  body { color: #eaeaea; background: #1a1a1a; }
  .card { border-color: #555; }
  .card > p { background-color: #4a4500; color: #fff5b3; }
  .inner { border-left-color: #555; }
}
  `"
  :js="``"
/>

「ナビゲーションの直下のリンクだけ装飾したい」のように、ネストの深い箇所まで巻き込みたくないときに使います。

### 隣接セレクタ: `a + b`

`+` を挟むと「**`a` の直後にある `b`**」だけに当たります。1 つだけです。

```css
h2 + p {
  color: dodgerblue;
  font-weight: bold;
}
```

下のデモは、見出し直後の段落だけ青く太字になります。同じ `<h2>` 配下でも 2 つ目以降の段落には当たりません。

<LiveDemo
  height="220px"
  :html="`
<h2>タイトル A</h2>
<p>見出し直後の段落（青、太字）</p>
<p>2 つ目の段落（普通）</p>

<h2>タイトル B</h2>
<p>見出し直後の段落（青、太字）</p>
  `"
  :css="`
body { padding: 12px; font-family: system-ui; color: #111; background: #fff; }
h2 + p { color: dodgerblue; font-weight: bold; }
@media (prefers-color-scheme: dark) {
  body { color: #eaeaea; background: #1a1a1a; }
  h2 + p { color: #6cb4ff; }
}
  `"
  :js="``"
/>

「見出しの直後の段落だけ余白を詰める」「リストの最初の項目だけ強調」のような微調整で使います。

### 属性セレクタ: `[属性名="値"]`

属性とその値で要素を選べます。

```css
input[type="email"] {
  background-color: #dbeafe;
}

a[href^="https://"] {
  color: #16a34a;
}
```

- `[type="email"]`: `type` 属性が `"email"` の入力欄
- `[href^="https://"]`: `href` が `https://` で **始まる** リンク（`^=` は前方一致）

下のデモは、同じ `<input>` でも `type="email"` のものだけ青背景になります。`type="text"` の方は背景が付きません。

<LiveDemo
  height="180px"
  :html="`
<p><label>名前: <input type='text' placeholder='テキスト入力'></label></p>
<p><label>メール: <input type='email' placeholder='email 入力'></label></p>
  `"
  :css="`
body { padding: 12px; font-family: system-ui; color: #111; background: #fff; }
input { padding: 4px 8px; font: inherit; }
input[type='email'] { background-color: #dbeafe; border: 1px solid #2563eb; }
@media (prefers-color-scheme: dark) {
  body { color: #eaeaea; background: #1a1a1a; }
  input { background-color: #2a2a2a; color: #eaeaea; border-color: #555; }
  input[type='email'] { background-color: #1e3a5f; border-color: #6cb4ff; color: #fff; }
}
  `"
  :js="``"
/>

`type="checkbox"` だけ装飾を変えたい、外部リンクだけ色を変えたい、など `<input>` 周りで重宝します。

### 詳細度（specificity）

複数のルールが同じ要素にマッチしたとき、**どれが勝つか** を決めるのが **詳細度** です。

セレクタを次の 3 種類に分けて数えます。

- **id セレクタ** (`#main`) → **重み 100**
- **クラス / 属性 / 擬似クラス** (`.btn` / `[type="email"]` / `:hover`) → **重み 10**
- **要素 / 擬似要素** (`p` / `::before`) → **重み 1**

セレクタを `(id の個数, class の個数, 要素の個数)` の **3 つ組** で表記します。比較は **左から順**: id の数が多い方が勝ち、同じなら class、それも同じなら要素の数で比較します。

#### 数え方の例

| セレクタ | id | class | 要素 | 表記 | 数え方の説明 |
|---|---|---|---|---|---|
| `p` | 0 | 0 | 1 | (0, 0, 1) | 要素 1 つ |
| `.card p` | 0 | 1 | 1 | (0, 1, 1) | クラス `.card` 1 つ + 要素 `p` 1 つ |
| `.card > p` | 0 | 1 | 1 | (0, 1, 1) | `>` は数えない。class 1 + 要素 1 |
| `.card .body p` | 0 | 2 | 1 | (0, 2, 1) | クラス 2 つ（`.card` `.body`）+ 要素 1 つ |
| `#main .card p` | 1 | 1 | 1 | (1, 1, 1) | id 1 + class 1 + 要素 1 |
| `#submit` | 1 | 0 | 0 | (1, 0, 0) | id 1 つだけ |

「セレクタの中の `#`、`.`、要素名 を数える」と覚えれば計算できます。`>` `+` `(空白)` のような **連結子** は数えません。

#### 比較ルール

**左から順に比較** します。先頭の数字が大きい方の勝ち。

- `(1, 0, 0)` vs `(0, 99, 0)` → **(1, 0, 0) の勝ち**（クラス 99 個でも id 1 個には勝てない）
- `(0, 2, 0)` vs `(0, 1, 5)` → **(0, 2, 0) の勝ち**（要素 5 個でも class 2 個には勝てない）
- `(0, 1, 1)` vs `(0, 1, 1)` → **同点**（後述: 後勝ち）

### 同じ詳細度なら後勝ち

詳細度が完全に同じなら、**後から書かれた方** が勝ちます。

```css
.btn { color: blue; }
.btn { color: red; }   /* これが勝つ。ボタンは赤色 */
```

詳細度が **同じ** なので、書かれた順で後の方が採用されます。

### デモ: 詳細度が高い方が勝つ

下のデモでは、3 つのルールが同じ `<p>` にマッチしますが、詳細度の高いルールが勝ちます。

<LiveDemo
  height="180px"
  :html="`
<div id='main'>
  <p class='note'>3 つのルールが当たるが、勝つのは 1 つだけ</p>
</div>
  `"
  :css="`
body { padding: 16px; font-family: system-ui; color: #111; background: #fff; }
/* (0, 0, 1) */
p { color: gray; }
/* (0, 1, 1) */
.note { color: blue; }
/* (1, 0, 1)  ← これが勝つ */
#main p { color: crimson; font-weight: bold; }
@media (prefers-color-scheme: dark) {
  body { color: #eaeaea; background: #1a1a1a; }
}
  `"
  :js="``"
/>

詳細度の比較は **左から** 行うので、id が 1 のものは class だけのものに勝ち、class が 1 のものは要素だけのものに勝ちます。

### `!important` は最後の手段

ルールの末尾に `!important` を付けると、**詳細度を無視して最強** になります。

```css
.btn { color: blue !important; }
```

これは強力すぎて、後でスタイルを上書きしたくなったときに **更に `!important` を重ねる** という悪循環を生みます。本コースでは原則 `!important` を書きません。

例外的に許される場面:
- フレームワークのスタイルを上書きする最終手段
- ユーザースタイルシート（個人設定）

普段の CSS では使わない、と覚えておけば十分です。

### `:hover` などの擬似クラスは詳細度 (0, 1, 0)

「クラスと状態」で扱った `:hover` / `:focus` などは、**クラスと同じ重み** です。

| セレクタ | 詳細度 |
|---|---|
| `a` | (0, 0, 1) |
| `a:hover` | (0, 1, 1) |
| `.link` | (0, 1, 0) |
| `.link:hover` | (0, 2, 0) |

「`.link:hover` が `.link` に勝つ」と覚えれば、ホバーのときだけ色が変わるのが当然だと納得できます。

## 演習

### 途中から始める場合

これまでのレッスンで作った `index.html` / `styles.css` を続けて使うのが理想ですが、手元に無ければ、新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開き、下の「出発点のコード」をそのまま貼って始めてください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>セレクタと詳細度</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header>
      <h1>セレクタの組み合わせと詳細度</h1>
      <nav>
        <ul class="nav-list">
          <li><a class="nav-link" href="#a">A</a></li>
          <li><a class="nav-link" href="#b">B</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <section id="card-area">
        <article class="card">
          <h2>タイトル A</h2>
          <p>子セレクタの対象になる段落。</p>
          <div class="body">
            <p>子孫だが直接の子ではない段落。</p>
          </div>
        </article>

        <article class="card">
          <h2>タイトル B</h2>
          <p>2 つ目のカード。</p>
        </article>
      </section>

      <section id="form-area">
        <h2>フォーム</h2>
        <form>
          <p>
            <label for="name">お名前</label>
            <input type="text" id="name" name="name" />
          </p>
          <p>
            <label for="email">メール</label>
            <input type="email" id="email" name="email" />
          </p>
        </form>
      </section>
    </main>
  </body>
</html>
```

**`styles.css`**

```css
body {
  font-family: system-ui, sans-serif;
  color: #333333;
  line-height: 1.7;
  padding: 16px;
}

@media (prefers-color-scheme: dark) {
  body {
    color: #eaeaea;
    background-color: #1a1a1a;
  }
}
```

</details>

### これまで作ったプロジェクトを使う

これまでのレッスンで作った `index.html` と `styles.css` を開きます。

### コピペで動かす

`styles.css` の末尾に、次のルールを **そのままの順** で追加します。

```css
/* (1) 子孫セレクタ: card の中の p すべて */
.card p {
  color: #555;
}

/* (2) 子セレクタ: card の直接の子の p だけ太字 */
.card > p {
  font-weight: bold;
}

/* (3) 隣接セレクタ: h2 の直後の p の上余白を詰める */
h2 + p {
  margin-top: 0;
}

/* (4) 属性セレクタ: type="email" だけ背景を変える */
input[type="email"] {
  background-color: #f0f9ff;
  border: 1px solid #2563eb;
}

/* (5) 詳細度のデモ: 3 つのルールが同じ p に当たる */
.card p { color: #555; }                 /* (0, 1, 1) */
.card .body p { color: #c2410c; }        /* (0, 2, 1) ← 勝つ */
#card-area .card p { color: #16a34a; }   /* (1, 1, 1) ← さらに勝つ */
```

### 期待出力

- 1 枚目のカードの 1 段落目: **太字**（`.card > p` が当たる）
- 1 枚目のカードの `.body` 内の段落: **緑色**（`#card-area .card p` が最強）
- 2 枚目のカードの段落: **太字**（`.card > p` が当たる）
- メール欄: **薄い水色の背景に青枠**
- 名前欄: 何も装飾されていない

### DevTools で確認

DevTools の Elements パネルで `.body` の中の `<p>` をクリックします。右の Styles パネルに当てはまるルールが **詳細度の高い順に** 並びます。一番上が「実際に効いているルール」、下のほうは「上書きされたルール」（取り消し線で表示されます）。

色のルールが 3 つ並んでいて、上の `#card-area .card p` だけ生きていて、下の 2 つが取り消し線になっていることを確認します。

### 変えてみる

1. `(5)` のブロックの 3 行目（`#card-area .card p`）を **コメントアウト** すると、`.body` 内の段落が **オレンジ**（`.card .body p`）に変わる。さらに 2 行目もコメントアウトすると **灰色**（`.card p`）に戻る。詳細度の階層が逆向きに崩れていく様子を確認。
2. `(2)` の `.card > p` を `.card p` に変えると、`.body` 内の段落も太字になる。`>` の有無で範囲が変わることを確認。
3. `input[type="email"]` を `input[type="text"]` に変えると、装飾が名前欄に移る。

### 自分で書く

- `.nav-list > a` というセレクタで `<a>` に下線を付けようとして、**当たらない** ことを確認する（HTML は `.nav-list` → `<li>` → `<a>` の構造なので、`<a>` は `.nav-list` の **直接の子ではない** のが理由）。次に `.nav-list a`（子孫セレクタ）にすれば下線が付くことを確認する。「子セレクタは 1 段だけ」を体感する課題。
- `<a>` の中で **`href` が `https://` で始まる外部リンクだけ** 色を `#16a34a` にするルールを書く（属性セレクタ + 前方一致 `^=`）。

### よくあるつまずき

- **子孫セレクタと子セレクタを混同**: `.card p` と `.card > p` で挙動が違う。階層深く当てたければ前者、直下だけなら後者。
- **詳細度が低くて効かない**: 「書いたのに反映されない」場合、DevTools の Styles で取り消し線が付いていないか確認。付いていれば詳細度が他のルールに負けている。
- **`!important` に頼りたくなる誘惑**: 詳細度が低いだけなら、セレクタを少し詳しく書く（クラスを 1 つ足す等）方が健全。

## まとめ

- id セレクタは `#名前 { ... }`。ページに 1 つだけ。実務ではスタイルにはクラスを使うのが主流。
- セレクタは組み合わせられる。子孫（`a b`）/ 子（`a > p`）/ 隣接（`a + b`）/ 属性（`[type="email"]`）。
- 詳細度は **(id の数, class の数, 要素の数)** で数えて、左から比較。大きい方が勝つ。
- 同じ詳細度なら **後勝ち**。
- `!important` は最強だが、上書き合戦の温床なので原則使わない。
- DevTools の Styles パネルで取り消し線を見ると、どのルールが勝っているかを目で確認できる。
