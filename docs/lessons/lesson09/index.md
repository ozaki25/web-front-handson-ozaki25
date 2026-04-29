# lesson09: セレクタの組み合わせと詳細度

## ゴール

- 子孫セレクタ（`a b`）/ 子セレクタ（`a > b`）/ 隣接セレクタ（`a + b`）を使い分けられる。
- 属性セレクタ（`[type="email"]`）が書ける。
- **詳細度** の基本ルール（id > class > 要素 / 同じなら後勝ち）を説明できる。
- `!important` がなぜ最後の手段なのかを理解する。

## 解説

「クラスと状態」までで、要素セレクタとクラスセレクタを使い分けられるようになりました。これらを **組み合わせる** と、もう少し細かい指定ができます。

### 子孫セレクタ: `a b`（半角スペース)

セレクタを **半角スペースで** つなげると、「`a` の中にある `b`」を意味します。間に他の要素が挟まっていても OK です。

```css
.card p {
  color: #555;
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

### 子セレクタ: `a > b`

`>` を挟むと「**直接の子**」だけに限定できます。孫より下は対象外です。

```css
.card > p {
  font-weight: bold;
}
```

```html
<div class="card">
  <p>直接の子</p>      <!-- 対象 -->
  <div>
    <p>孫の p</p>     <!-- 対象外 -->
  </div>
</div>
```

「ナビゲーションの直下のリンクだけ装飾したい」のように、ネストの深い箇所まで巻き込みたくないときに使います。

### 隣接セレクタ: `a + b`

`+` を挟むと「**`a` の直後にある `b`**」だけに当たります。1 つだけです。

```css
h2 + p {
  margin-top: 0;
}
```

「見出しの直後の段落だけ余白を詰める」のような微調整に使います。

### 属性セレクタ: `[属性名="値"]`

属性とその値で要素を選べます。

```css
input[type="email"] {
  background-color: #f0f9ff;
}

a[href^="https://"] {
  color: #16a34a;
}
```

- `[type="email"]`: `type` 属性が `"email"` の入力欄
- `[href^="https://"]`: `href` が `https://` で **始まる** リンク（`^=` は前方一致）

`type="checkbox"` だけ装飾を変えたい、外部リンクだけ色を変えたい、など `<input>` 周りで重宝します。

### デモ: 組み合わせを目で見比べる

下のデモは、同じ `<p>` でも置かれる場所によって当たるルールが変わる様子を確認できます。`.card` 直下と入れ子の中で見た目が違うのが見えます。

<LiveDemo
  height="240px"
  :html="`
<div class='card'>
  <h2>タイトル</h2>
  <p>子セレクタが当たる: 太字</p>
  <div class='inner'>
    <p>子孫セレクタだけ: 灰色のまま、太字にはならない</p>
  </div>
</div>
<p>外側の p（どのルールも当たらない）</p>
  `"
  :css="`
body { padding: 16px; font-family: system-ui; color: #111; background: #fff; }
.card { border: 1px solid #d1d5db; padding: 16px; }
.card p { color: #555; }
.card > p { font-weight: bold; }
  `"
  :js="``"
/>

### 詳細度（specificity）

複数のルールが同じ要素にマッチしたとき、**どれが勝つか** を決めるのが **詳細度** です。

セレクタの種類を 3 つの数字 `(id, class, element)` で数えます。数字が大きいほど強いです。

| セレクタ | 例 | 数え方 |
|---|---|---|
| ID セレクタ | `#submit` | (1, 0, 0) |
| クラス / 属性 / 擬似クラス | `.btn` / `[type="email"]` / `:hover` | (0, 1, 0) |
| 要素 / 擬似要素 | `p` / `::before` | (0, 0, 1) |

複合セレクタは、それぞれを **足し算** します。

| セレクタ | 詳細度 |
|---|---|
| `p` | (0, 0, 1) |
| `.card p` | (0, 1, 1) |
| `.card > p` | (0, 1, 1) |
| `.card .body p` | (0, 2, 1) |
| `#main .card p` | (1, 1, 1) |

**比較は左から順** に行われます。`(1, 0, 0)` は `(0, 99, 0)` より強いです。クラスを 99 個並べても、id 1 個には勝てません。

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
  `"
  :js="``"
/>

詳細度の比較順は **左から**: id が 1 のものが、class 1 のものに勝つ。class 1 のものが、要素のみに勝つ。

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

- ナビのリンク（`.nav-link`）の **直接の子の `<a>`** だけに `text-decoration: underline` を当てる（実際は `<li>` の中の `<a>` なので、子セレクタを使うと当たらない。これは「子セレクタが直下にしか当たらない」を体感する課題）。
- `<a>` の中で **`href` が `https://` で始まる外部リンクだけ** 色を `#16a34a` にするルールを書く（属性セレクタ + 前方一致 `^=`）。

### よくあるつまずき

- **子孫セレクタと子セレクタを混同**: `.card p` と `.card > p` で挙動が違う。階層深く当てたければ前者、直下だけなら後者。
- **詳細度が低くて効かない**: 「書いたのに反映されない」場合、DevTools の Styles で取り消し線が付いていないか確認。付いていれば詳細度が他のルールに負けている。
- **`!important` で殴る誘惑**: 詳細度が低いだけなら、セレクタを少し詳しく書く（クラスを 1 つ足す等）方が健全。

## まとめ

- セレクタは組み合わせられる。子孫（`a b`）/ 子（`a > b`）/ 隣接（`a + b`）/ 属性（`[type="email"]`）。
- 詳細度は **(id, class, element)** の 3 つで数える。左から比較して大きい方が勝つ。
- 同じ詳細度なら **後勝ち**。
- `!important` は最強だが、上書き合戦の温床なので原則使わない。
- DevTools の Styles パネルで取り消し線を見ると、どのルールが勝っているかを目で確認できる。
