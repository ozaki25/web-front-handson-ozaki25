# lesson16: ネイティブ UI（details / dialog / popover）

## ゴール

- `<details>` / `<summary>` で JS なしに折りたたみを作れる
- `<dialog>` でモーダルを作り、`showModal()` / `close()` を使える
- Popover API（`popover` 属性）で非モーダルなポップアップが書ける
- ネイティブ UI が **アクセシビリティを自動で付けてくれる** ことを理解する
- 「なぜライブラリより HTML 単独を試すべきか」を説明できる

## 解説

### なぜ「ネイティブ UI」なのか

モーダルや折りたたみを作りたい時、いまは **HTML 単独で同じことができる** 要素が揃っています。JS を書かなくても、Tab キーや Escape キーが効き、スクリーンリーダーも正しく読み上げてくれます。

HTML 単独でできると嬉しいこと:

- **バンドルサイズが減る**（外部ライブラリを 1 つ削れる）
- **アクセシビリティが自動**（フォーカストラップ / Escape 閉じ / `role` / `aria-*` が組み込み）
- **学習コストが減る**（HTML の常識だけで読める）

> コラム: 同じ用途で HeadlessUI / Radix UI のような React 用ライブラリを使う流派もあります。複雑な UI（コンボボックスやスライダー等）はライブラリの方が手が早いですが、本レッスンで扱う「折りたたみ / モーダル / ポップアップ」程度なら **HTML 単独で十分** に書けるようになっているのが現代の前提です。

このレッスンでは代表的な 3 つを扱います。

| 要素 / 属性 | 用途 |
|---|---|
| `<details>` / `<summary>` | 折りたたみ |
| `<dialog>` | モーダル（裏側を操作不能に） |
| `popover` 属性 | 非モーダルなポップアップ（アクションメニュー / toast） |

### `<details>` と `<summary>` — 折りたたみ

FAQ / スポイラー / アコーディオンを **JS なし** で書けます。

```html
<details>
  <summary>答えを見る</summary>
  <p>正解は 42 です。</p>
</details>
```

<LiveDemo
  height="160px"
  :html="`
<details>
  <summary>答えを見る</summary>
  <p>正解は 42 です。</p>
</details>

<details open>
  <summary>最初から開いている例</summary>
  <p>open 属性で初期展開できます。</p>
</details>
  `"
  :css="`
body { font-family: sans-serif; }
details { border: 1px solid #ccc; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
summary { cursor: pointer; font-weight: bold; }
  `"
  :js="``"
/>

ポイント:

- `open` 属性で初期状態を制御（`<details open>`）
- クリックで開閉、Enter / Space でも動作する（キーボード対応は自動）
- `toggle` イベントで開閉を検知できる

```js
details.addEventListener("toggle", (e) => {
  console.log(details.open ? "開いた" : "閉じた");
});
```

::: details 発展（任意）: `::details-content` で中身をアニメーション

2024 年以降、`::details-content` 疑似要素と `interpolate-size` 機能で、高さ 0 → auto の **スムーズな開閉アニメーション** が CSS だけで書けるようになりました。本レッスンの本筋ではありませんが、興味があれば確認してみてください。

```css
details::details-content {
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: opacity 0.3s, height 0.3s, content-visibility 0.3s allow-discrete;
  content-visibility: hidden;
}
details[open]::details-content {
  opacity: 1;
  height: calc-size(auto);
  content-visibility: visible;
}
```

:::

### `<dialog>` — モーダル

以前は `position: fixed` の `<div>` に ARIA を付けてフォーカス管理を書いていました。`<dialog>` はそれを **1 つの要素** に置き換えます。

```html
<button id="open-btn">開く</button>

<dialog id="my-dialog">
  <form method="dialog">
    <p>本当に削除しますか？</p>
    <button value="cancel">キャンセル</button>
    <button value="confirm">削除</button>
  </form>
</dialog>

<script>
  const dialog = document.getElementById("my-dialog");
  document.getElementById("open-btn").addEventListener("click", () => {
    dialog.showModal();
  });
  dialog.addEventListener("close", () => {
    console.log("戻り値:", dialog.returnValue);
  });
</script>
```

#### 2 つの開き方

| メソッド | 挙動 |
|---|---|
| `dialog.showModal()` | **モーダル**。裏側の要素が `inert`（操作不能）になり、Escape で閉じる |
| `dialog.show()` | **非モーダル**。裏側も操作できる。Escape で閉じない |

普通の「確認ダイアログ」は `showModal()` を使います。

#### `<form method="dialog">` の便利さ

`<form method="dialog">` 内の送信ボタンを押すと、dialog が閉じて、押したボタンの `value` が `dialog.returnValue` に入ります。「キャンセル / 確定」の戻り値が **HTML だけで** 取れます。

#### CSS でスタイル

`<dialog>` がモーダル時に自動で出てくる背景（黒い覆い）は `::backdrop` 疑似要素で装飾できます。

```css
dialog {
  border: none;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

#### 自動で付いてくるアクセシビリティ

- `role="dialog"` が自動
- `aria-modal="true"` が `showModal()` 時に自動
- フォーカストラップ（Tab で外に出られない）が自動
- Escape で閉じる
- 開いた時にダイアログにフォーカスが入る

これを自前で書くと 100 行は超えます。

### Popover API — 非モーダルなポップアップ

アクションメニュー / ツールチップ / 通知トースト / 設定パネルのような「**モーダルじゃない** けれど出し入れしたい UI」のための API です。**2024 年に Baseline 入り**、2026 年現在は全主要ブラウザで使えます。

#### 最小形

```html
<button popovertarget="menu">メニュー</button>

<div id="menu" popover>
  <p>項目 1</p>
  <p>項目 2</p>
  <p>項目 3</p>
</div>
```

`popover` 属性が付いた要素は、**デフォルトで非表示**。`popovertarget` 属性を持つボタンを押すと開きます。**JS は一行も書きません**。

<LiveDemo
  height="280px"
  :html="`
<button popovertarget='menu'>メニューを開く</button>

<div id='menu' popover>
  <p><a href='#'>プロフィール</a></p>
  <p><a href='#'>設定</a></p>
  <p><a href='#'>ログアウト</a></p>
</div>
  `"
  :css="`
body { font-family: sans-serif; padding: 16px; }
button { padding: 8px 16px; }
[popover] { padding: 16px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
[popover] p { margin: 4px 0; }
  `"
  :js="``"
/>

#### 3 種類の popover 値

| 値 | 閉じる条件 |
|---|---|
| `popover` or `popover=\"auto\"` | **外側をクリック**、Escape、他の auto popover が開いた時に閉じる |
| `popover=\"manual\"` | **自分で close を呼ばない限り閉じない**。toast 向き |
| `popover=\"hint\"` | tooltip 用。ライトディスミスだが manual と auto の中間 |

#### JS から制御

```js
const menu = document.getElementById("menu");
menu.showPopover();  // 開く
menu.hidePopover();  // 閉じる
menu.togglePopover(); // トグル
```

#### `<dialog>` との違い

| | `<dialog>` | Popover |
|---|---|---|
| モーダル化 | `showModal()` でできる | できない（常に非モーダル） |
| 裏側の操作 | モーダル時は `inert` | 常に可能 |
| 外側クリックで閉じる | 自前実装が必要 | auto popover なら自動 |
| 用途 | 確認ダイアログ / フォーム | メニュー / tooltip / toast |

**「モーダル = `<dialog>`、非モーダル = popover」** と覚えると迷いません。両方を組み合わせることも可能で、`<dialog popover>` のように書けば「popover として動く dialog」になります。

::: details 発展（任意）: Anchor Positioning との組み合わせ

Popover API と相性が良いのが [Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)（2024 年以降 Chrome 系で対応）です。本レッスンの本筋ではありませんが、興味があれば確認してみてください。

```css
button { anchor-name: --menu-btn; }

#menu {
  position: absolute;
  position-anchor: --menu-btn;
  top: anchor(bottom);
  left: anchor(left);
}
```

「ボタンの真下に menu を自動配置」が **JS なし** で書けます。Safari / Firefox の対応はまだ進行中なので、フォールバックを用意するか polyfill を使います。

:::

## 演習

### ゴール

- `<details>` でアコーディオンを作る
- `<dialog>` で確認モーダルを作り、戻り値を取る
- Popover API でアクションメニューを作る

### 手順 1: StackBlitz の Vanilla テンプレートを開く

新規 StackBlitz の Vanilla（HTML / CSS / JS）テンプレート（<https://stackblitz.com/edit/web-platform>）を開きます。`index.html` / `style.css` / `script.js` の 3 ファイルが用意されています。

> このコースでは TypeScript はまだ導入していません（3 章 で扱います）。本レッスンは HTML + JS の素のブラウザ機能だけで完結させます。

### 手順 2: index.html

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Native UI Demo</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <main>
      <h1>ネイティブ UI のショーケース</h1>

      <section>
        <h2>1. details / summary</h2>
        <details>
          <summary>よくある質問 1</summary>
          <p>答えをここに書きます。</p>
        </details>
        <details>
          <summary>よくある質問 2</summary>
          <p>複数あっても OK。</p>
        </details>
      </section>

      <section>
        <h2>2. dialog</h2>
        <button id="open-dialog">削除する</button>
        <p id="dialog-result">結果: -</p>

        <dialog id="confirm">
          <form method="dialog">
            <p>本当に削除しますか？</p>
            <menu>
              <button value="cancel">キャンセル</button>
              <button value="confirm" autofocus>削除</button>
            </menu>
          </form>
        </dialog>
      </section>

      <section>
        <h2>3. Popover</h2>
        <button popovertarget="menu">メニュー</button>
        <div id="menu" popover>
          <button>アイテム 1</button>
          <button>アイテム 2</button>
          <button>アイテム 3</button>
        </div>
      </section>
    </main>
    <script defer src="./script.js"></script>
  </body>
</html>
```

### 手順 3: style.css

```css
body { font-family: sans-serif; padding: 24px; line-height: 1.6; }
main { max-width: 700px; margin: 0 auto; }
section { margin-block: 32px; padding: 16px; border: 1px solid #ccc; border-radius: 8px; }

details {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 8px;
}
summary { cursor: pointer; font-weight: bold; }

button { padding: 8px 16px; cursor: pointer; }

dialog {
  border: none;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  min-width: 300px;
}
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
menu { display: flex; gap: 8px; justify-content: flex-end; padding: 0; margin: 12px 0 0; }

[popover] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
[popover] button { text-align: left; background: none; border: none; padding: 8px; border-radius: 4px; }
[popover] button:hover { background: #f3f4f6; }
```

### 手順 4: script.js

```js
const openBtn = document.getElementById("open-dialog");
const dialog = document.getElementById("confirm");
const result = document.getElementById("dialog-result");

openBtn.addEventListener("click", () => {
  dialog.showModal();
});

dialog.addEventListener("close", () => {
  result.textContent = `結果: ${dialog.returnValue}`;
});
```

### 手順 5: 起動して確認

StackBlitz は保存と同時にプレビューが更新されます。プレビューを「Open in New Tab」で別タブに開き、ブラウザで以下を確認します。

1. **details**: タイトルをクリックで開閉。Tab でフォーカスが当たり Enter でも開閉する
2. **dialog**: 「削除する」→ モーダルが出る。Escape で閉じる。「キャンセル / 削除」で `結果: cancel` or `結果: confirm` が下に表示される
3. **popover**: 「メニュー」→ メニューが開く。**外側をクリック** で自動で閉じる（light dismiss）

### 期待出力

- details を開くとアイコンが回転しつつ中身が見える
- dialog 表示時に裏側がグレーアウトし、Escape で閉じられる
- dialog を「削除」で閉じると `結果: confirm` と表示
- popover は JS ゼロで開閉する（`popovertarget` 属性だけで動く）

### 変える

- `<dialog>` の中で `autofocus` を外すと、最初にフォーカスが当たる位置が変わる
- `popover` を `popover="manual"` に変えると、外側クリックでは閉じなくなる
- `details[open]` を CSS でデフォルト値にしたり、`::details-content` でアニメーションを付ける
- dialog の `::backdrop` の背景色 / blur を変える

### 自分で書く（任意）

- Todo アプリの「削除確認」を `<dialog>` で作る
- プロフィールメニュー（アバターをクリックでメニュー）を Popover API で作る
- FAQ ページを `<details>` で組み立てる

## まとめ

- `<details>` / `<summary>` は JS ゼロの折りたたみ。`toggle` イベントで検知、`::details-content` でアニメーション可能
- `<dialog>` はモーダル。`showModal()` / `close()` / `returnValue` の 3 点セットと `<form method="dialog">` で戻り値まで取れる
- **フォーカストラップ / Escape / ARIA** が自動で付く
- **Popover API** は非モーダル。アクションメニュー / tooltip / toast に使う
- 「モーダル = dialog、非モーダル = popover」の役割分担
- ネイティブ UI を使うと **バンドルが減り、アクセシビリティが自動** になる
- 別のレッスンでは **Web Components** に進み、「HTML で自作タグを作る」話へ
