# lesson39: 監視系 API（Intersection Observer / ResizeObserver / MutationObserver）

<script setup>
const resizeDemoJs = `
const target = document.getElementById('target');
const sizeInfo = document.getElementById('size-info');

const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    sizeInfo.textContent =
      'width: ' + Math.round(width) + 'px / height: ' + Math.round(height) + 'px';
    target.classList.toggle('wide', width > 360);
  }
});

observer.observe(target);
`

const fadeDemoJs = `
const items = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

items.forEach((el) => observer.observe(el));

const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', () => {
  items.forEach((el) => {
    el.classList.remove('visible');
    observer.observe(el);
  });
  document.getElementById('scroll-area').scrollTop = 0;
});
`
</script>

## ゴール

- Intersection Observer で「要素が画面に入った / 出た」を低コストで検知できる
- 遅延読み込み（lazy loading）と無限スクロールの基本パターンを書ける
- ResizeObserver で要素サイズ変化を検知できる（メディアクエリで届かない場面）
- MutationObserver の存在を知り、必要な時に思い出せる
- スクロールイベントで監視するアンチパターンを避けられる

## 解説

### 「監視系 API」とは

ブラウザには、**特定の状態変化を効率よく検知する** ための専用 API があります。代表は次の 3 つ。

| API | 監視対象 |
|---|---|
| Intersection Observer | 要素が **ビューポート / 親要素** と交差したかどうか |
| ResizeObserver | 要素の **サイズ** が変化したかどうか |
| MutationObserver | DOM ツリーの **構造 / 属性** が変化したかどうか |

これらが登場する前は、`scroll` / `resize` イベントに `setTimeout` を組み合わせて判定していました。けれど次の問題があります。

- イベントが **毎フレーム発火** する → CPU を消費する
- 「**画面に入った瞬間**」を取るには毎回 `getBoundingClientRect()` を呼ぶ → レイアウト再計算（reflow）が走る
- 結果としてスクロールがガクつく

監視系 API は **ブラウザ内部で効率よく判定** し、変化があった時だけ JS にコールバックを返します。**スクロールがスムーズになる** のが最大の利点です。

### Intersection Observer

「ある要素が **ビューポート（または親要素）に入ったか** を検知する」API です。

#### 基本形

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      console.log("画面に入った", entry.target);
    } else {
      console.log("画面から出た", entry.target);
    }
  });
});

const target = document.querySelector(".target");
observer.observe(target);
```

`IntersectionObserver` のコンストラクタにコールバックを渡し、`observe(element)` で監視対象を登録します。**何も起きないとコールバックは呼ばれない**（CPU 消費がない）のがポイント。

#### オプション

```js
const observer = new IntersectionObserver(callback, {
  root: null,           // 監視の基準。null = ビューポート
  rootMargin: "100px",  // 基準の周囲の余白。"100px" なら 100px 早めに反応
  threshold: 0.5,       // どれだけ重なったら発火するか。0〜1
});
```

- `rootMargin: "100px"` は「**画面の 100px 手前** で先読みしたい」時に便利
- `threshold: 0.5` は「**半分** 重なったら発火」
- 配列で `[0, 0.25, 0.5, 0.75, 1]` を渡すと、25% 刻みで発火する

#### 例 1: 画像の遅延読み込み（lazy loading）

```html
<img data-src="/images/heavy.jpg" alt="重い画像" />
<img data-src="/images/heavy2.jpg" alt="重い画像 2" />
```

```js
const lazyImages = document.querySelectorAll("img[data-src]");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
    observer.unobserve(img); // 一度読み込んだらもう監視しない
  });
}, { rootMargin: "200px" });

lazyImages.forEach((img) => observer.observe(img));
```

ビューポートの 200px 手前で `src` をセットして読み込みを開始します。読み込み済みの要素は `unobserve` で監視解除すると効率的。

::: tip ネイティブの loading="lazy" との関係
画像 / iframe には `loading="lazy"` 属性が標準です。**画像なら属性で十分**。Intersection Observer を使うのは **任意の DOM 要素** や **「画面に入ったらアニメーション」** など、属性では届かない場面です。
:::

#### 例 2: 無限スクロール

ページの最下部にセンチネル（番兵）要素を置き、それが画面に入ったら次のページを読み込みます。

```html
<ul id="list"></ul>
<div id="sentinel"></div>
```

```js
let page = 1;
let loading = false;

async function loadMore() {
  if (loading) return;
  loading = true;
  const res = await fetch(`/api/posts?page=${page}`);
  const items = await res.json();
  const list = document.getElementById("list");
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item.title;
    list.appendChild(li);
  }
  page++;
  loading = false;
}

const sentinel = document.getElementById("sentinel");
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMore();
  }
});
observer.observe(sentinel);
```

スクロールイベントで `scrollTop` を毎回計算するより、**圧倒的に軽く正確** です。

#### 例 3: 「画面に入ったらフェードイン」

```css
.fade-in { opacity: 0; transform: translateY(20px); transition: 0.6s; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
```

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
```

スクロールアニメーションの定番パターン。

下のデモでスクロール領域を下に動かしてください。各カードがビューポートに 30% 入ったタイミングでフェードインします。`unobserve` しているので一度フェードしたカードは再観測されません。

<!-- textlint-disable ja-technical-writing/sentence-length -->

<LiveDemo
  height="320px"
  :html="`
<button id='reset' type='button'>リセット</button>
<div id='scroll-area'>
  <div class='spacer'>↓ 下にスクロール ↓</div>
  <div class='fade-in'>カード 1</div>
  <div class='fade-in'>カード 2</div>
  <div class='fade-in'>カード 3</div>
  <div class='fade-in'>カード 4</div>
</div>
  `"
  :css="`
button { padding: 6px 12px; margin-bottom: 8px; }
#scroll-area { height: 220px; overflow-y: auto; border: 1px solid #ccc; border-radius: 4px; padding: 12px; background: #fafafa; }
.spacer { height: 200px; display: flex; align-items: flex-end; justify-content: center; color: #999; }
.fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.6s, transform 0.6s; padding: 32px; margin: 24px 0; background: #e0e7ff; color: #1e1b4b; border-radius: 8px; text-align: center; font-weight: 600; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
@media (prefers-color-scheme: dark) {
  #scroll-area { background: #1a1a1a; border-color: #555; }
  .spacer { color: #777; }
  .fade-in { background: #312e81; color: #e0e7ff; }
}
  `"
  :js="fadeDemoJs"
/>

<!-- textlint-enable ja-technical-writing/sentence-length -->

### ResizeObserver

「要素 **自身のサイズ変化** を検知する」API です。

メディアクエリは画面全体しか見ません。`@container`（「モダン CSS（:has / @layer / @scope / Container Queries / View Transitions）」）は CSS だけで分岐できますが、**JS 側で処理を変えたい** 場合は ResizeObserver の出番です。

```js
const observer = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const { width, height } = entry.contentRect;
    console.log(`サイズ: ${width} x ${height}`);
  });
});

const box = document.querySelector(".box");
observer.observe(box);
```

#### 用途の例

- canvas をリサイズに合わせて再描画
- 折りたたみ可能な textarea の高さを内容に合わせる
- 要素サイズに応じて class を切り替える（コンテナクエリの JS 版）
- chart ライブラリのリサイズ対応

```js
const card = document.querySelector(".card");
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const w = entry.contentRect.width;
    entry.target.classList.toggle("wide", w > 600);
  }
});
observer.observe(card);
```

::: warning 注意
ResizeObserver のコールバック内で **同じ要素のサイズを変える** と、無限ループに陥ります（次フレームでまたコールバックが呼ばれる）。`requestAnimationFrame` などで切る、または「変化量が一定以上の時だけ反応」とガードを入れます。
:::

下のデモは `contenteditable` の枠に文字を入れたり改行したりすると、`width` / `height` が即時に更新される最小例です。幅が 360px を超えると枠の色が変わります（`classList.toggle("wide", width > 360)` の効果）。

<!-- textlint-disable ja-technical-writing/sentence-length -->

<LiveDemo
  height="280px"
  :html="`
<p id='size-info'>width: - / height: -</p>
<div id='target' contenteditable='true'>ここに自由に書いて、改行を増やしたり文字を増やしたりしてください。サイズが即時に更新されます。</div>
  `"
  :css="`
#size-info { font-family: ui-monospace, monospace; color: #444; margin-bottom: 8px; }
#target { padding: 12px; min-height: 4em; background: #fef3c7; color: #1f2937; border: 2px dashed #d4a017; border-radius: 6px; outline: none; line-height: 1.6; }
#target.wide { background: #c7f3d0; border-color: #16a34a; }
@media (prefers-color-scheme: dark) {
  #size-info { color: #ccc; }
  #target { background: #3a2f0a; color: #f5f5f5; border-color: #b8860b; }
  #target.wide { background: #0a3a1f; border-color: #4ade80; }
}
  `"
  :js="resizeDemoJs"
/>

<!-- textlint-enable ja-technical-writing/sentence-length -->

### MutationObserver

「DOM の **構造変化** を検知する」API です。

- 子要素の追加 / 削除
- 属性の変化
- テキスト内容の変化

```js
const target = document.getElementById("target");
const observer = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    console.log(m.type, m.target);
  });
});

observer.observe(target, {
  childList: true,    // 子要素の追加削除
  attributes: true,   // 属性の変化
  characterData: true,// テキストの変化
  subtree: true,      // 子孫まで監視
});
```

#### 使い所

- 自前で書いていないライブラリの DOM を監視したい
- ブラウザ拡張で外部サイトの DOM を監視
- 古い jQuery ベースの管理画面に「新規行が追加されたら自動整形」を後付けする

普通のアプリ開発では出番が少ないですが、**「他人が触る DOM」** を相手にする時に重宝します。

### スクロールイベントを使うアンチパターン

昔よく書かれたコード:

```js
window.addEventListener("scroll", () => {
  const rect = element.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    // 画面に入った時の処理
  }
});
```

このコードの問題:

1. **毎フレーム発火** する。スクロール中に何度もコールバックが走る
2. `getBoundingClientRect()` は **レイアウト再計算** を強制する重い処理
3. `throttle` / `debounce` で対処できるが、**反応が遅れる**
4. メモリリークの温床（`removeEventListener` 忘れ）

Intersection Observer は **必要な時だけ** コールバックを呼ぶので、すべて解決します。**現代のコードでは Observer を選ぶ** が定石。

### React で使う

カスタムフックにすると再利用しやすいです。

```tsx
import { useEffect, useRef, useState } from "react";

export function useIntersection(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isIntersecting };
}
```

使う側:

```tsx
function FadeInSection({ children }: { children: React.ReactNode }) {
  const { ref, isIntersecting } = useIntersection({ threshold: 0.2 });
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={isIntersecting ? "visible" : ""}
    >
      {children}
    </section>
  );
}
```

> **`options` を毎レンダリング新しく作らない**: 上のフックの `useEffect` の依存配列に `options` を入れているため、**呼び出し側が `useIntersection({ threshold: 0.2 })` のようにオブジェクトリテラルを直書きすると、毎レンダリングで新参照になり Observer が再生成される無限ループ気味の挙動** に陥ります。実用するときは、呼び出し側で `useMemo(() => ({ threshold: 0.2 }), [])` で安定化するか、`threshold` などのプリミティブ値を引数として受け取って `useIntersection(0.2)` のようなシグネチャにする方が安全です。

`useEffect` のクリーンアップで `disconnect` するのを忘れないようにします（メモリリーク防止）。

## 演習

### ゴール

- Intersection Observer で「画面に入ったらフェードイン」を作る
- 無限スクロールの最小実装を体験する
- ResizeObserver でサイズ表示器を作る

### 手順 1: 新規プロジェクト（StackBlitz の Vanilla テンプレート）

これまでの 2 章 と同じく **StackBlitz の Vanilla（HTML + CSS + JS）テンプレート** で進めます。<https://stackblitz.com/fork/js> から新しいプロジェクトを開きます。

### 手順 2: index.html

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Observer Demo</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main>
      <h1>Observer Demo</h1>

      <section>
        <h2>1. フェードイン</h2>
        <div class="fade-in">セクション 1</div>
        <div class="fade-in">セクション 2</div>
        <div class="fade-in">セクション 3</div>
        <div class="fade-in">セクション 4</div>
      </section>

      <section>
        <h2>2. 無限スクロール</h2>
        <ul id="list"></ul>
        <div id="sentinel">読み込み中...</div>
      </section>

      <section>
        <h2>3. ResizeObserver</h2>
        <div id="resizable" contenteditable="true">
          ここに文字を入れて高さを変えてみる
        </div>
        <p id="size-info">サイズ: -</p>
      </section>
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

### 手順 3: style.css

```css
body { font-family: sans-serif; padding: 24px; line-height: 1.6; color: #1a1a1a; background: #fafafa; }
main { max-width: 700px; margin: 0 auto; }
section { margin-block: 80px; padding: 16px; border: 1px solid #ccc; border-radius: 8px; background: #fff; }

.fade-in {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s, transform 0.6s;
  padding: 80px;
  background: #f3f4f6;
  margin-bottom: 24px;
  border-radius: 8px;
}
.fade-in.visible { opacity: 1; transform: translateY(0); }

#list { list-style: none; padding: 0; }
#list li { padding: 12px; border-bottom: 1px solid #eee; }
#sentinel { padding: 16px; text-align: center; color: #999; }

#resizable {
  min-height: 80px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
  outline: none;
}
```

### 手順 4: script.js

```js
// 1. フェードイン
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);
document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

// 2. 無限スクロール（ダミーデータ）
const list = document.getElementById("list");
const sentinel = document.getElementById("sentinel");
let page = 1;

function loadMore() {
  for (let i = 0; i < 10; i++) {
    const li = document.createElement("li");
    li.textContent = `アイテム ${(page - 1) * 10 + i + 1}`;
    list.appendChild(li);
  }
  page++;
  if (page > 5) {
    sentinel.textContent = "終わり";
    scrollObserver.disconnect();
  }
}

const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMore();
  }
});
scrollObserver.observe(sentinel);

// 3. ResizeObserver
const resizable = document.getElementById("resizable");
const sizeInfo = document.getElementById("size-info");
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    sizeInfo.textContent = `サイズ: ${Math.round(width)} x ${Math.round(height)}`;
  }
});
resizeObserver.observe(resizable);
```

### 手順 5: ブラウザで確認

StackBlitz は保存と同時にプレビューが更新されます。以下を確認します。

1. ページを下にスクロールすると `.fade-in` セクションが **入ってきた瞬間にふわっと** 表示される
2. もっと下にスクロールするとアイテムが **自動で追加** される（5 ページまで）
3. 「ResizeObserver」セクションの黄色いボックスをクリックして文字を打ち込むと、**サイズ表示が即座に更新** される

### 期待出力

- スクロール時に各セクションがフェードイン
- 無限スクロールで合計 50 アイテムまで追加され、「終わり」と表示される
- contenteditable に文字を入れて改行するとサイズ表示の `height` が増える

### 変える

- `threshold: 0.2` を `1.0` にすると **完全に画面に収まらないと** 発火しなくなる
- `rootMargin: "200px"` を加えると **早めに** 発火する（先読み）
- `unobserve` を消すと、画面外に出てまた入った時にもう一度発火するようになる
- `loadMore` の中の `setTimeout` で遅延を入れて、ローディング状態を確認

### 自分で書く（任意）

- 「画面の上端に貼り付いたら header の影を濃くする」を Intersection Observer で実装（センチネルを header の上に置く）
- ResizeObserver で「カードの幅が 400px 未満なら縦並び、それ以上なら横並び」のクラス切り替えを書く
- React のカスタムフック `useResize` を作って、ボックスの幅をリアルタイム表示する

## まとめ

- **Intersection Observer** は要素の交差を **必要な時だけ** 通知する。スクロールがスムーズに保てる
- 遅延読み込み / 無限スクロール / 「画面に入ったらアニメ」が定番ユースケース
- 画像の遅延読み込みは `loading="lazy"` 属性で十分なことも多い
- **ResizeObserver** は要素自身のサイズ変化を検知。canvas / chart のリサイズや「コンテナクエリの JS 版」に
- **MutationObserver** は DOM の構造変化を検知。普通のアプリでは出番が少ないが「他人が触る DOM」相手で活躍
- スクロールイベントで `getBoundingClientRect()` を呼ぶ古いパターンは **Observer に置き換える**
- React では `useEffect` のクリーンアップで `disconnect` を忘れない
