# lesson120: Web Components 入門

## ゴール

- Custom Elements（`class extends HTMLElement`）で自作 HTML タグを定義できる
- Shadow DOM でスタイルと DOM を外から隔離できる
- ライフサイクル（`connectedCallback` / `attributeChangedCallback` 等）を使える
- `<slot>` で外側から中身を差し込める
- React との使い分けを判断できる

## 解説

### Web Components とは

**フレームワーク非依存で、ブラウザ標準** の仕組みだけで再利用可能な UI 部品を作る技術の総称です。3 つの柱で構成されます。

| 柱 | 役割 |
|---|---|
| Custom Elements | 自作の HTML タグを定義 |
| Shadow DOM | スタイルと DOM を隔離 |
| HTML Templates（`<template>`） | クローンして使えるインライン HTML |

作った部品は `<my-button>` のように普通の HTML タグとして使え、**React / Vue / Next.js / 素の HTML** どこからでも同じように呼び出せます。

### なぜ今 Web Components を知るか

2026 年の現場では「フレームワークを跨いだ共通部品」を作る場面が増えています。たとえば:

- 複数プロダクト（Next.js アプリと WordPress サイト）で同じヘッダー / ボタンを使いたい
- 会社共通のデザインシステムを **React 依存にせず** 配布したい
- マイクロフロントエンドで、各アプリが違うフレームワークでも統一 UI を持ちたい

React コンポーネントは React の中でしか動きません。Web Components は **どこでも動く**。Shopify / Microsoft / Google の各デザインシステムが Web Components 採用しているのもこの理由です。

### Custom Elements の最小形

```js
class HelloWorld extends HTMLElement {
  connectedCallback() {
    this.innerHTML = "<p>Hello, Web Components!</p>";
  }
}

customElements.define("hello-world", HelloWorld);
```

HTML で使う:

```html
<hello-world></hello-world>
```

ルール:

- クラスは **`HTMLElement` を継承** する
- `customElements.define(タグ名, クラス)` で登録
- **タグ名はハイフンを含む**（`hello-world` OK、`helloworld` NG）— ブラウザ標準タグとの衝突を防ぐため

### ライフサイクル

Custom Elements には決まったタイミングで呼ばれるメソッドがあります。

```js
class MyCounter extends HTMLElement {
  connectedCallback() {
    // DOM に追加された時
    this.render();
  }

  disconnectedCallback() {
    // DOM から外された時。リスナー解除などのクリーンアップ
  }

  static observedAttributes = ["count"];

  attributeChangedCallback(name, oldValue, newValue) {
    // 監視対象の属性が変わった時
    if (name === "count") this.render();
  }

  render() {
    const count = this.getAttribute("count") ?? "0";
    this.innerHTML = `<strong>Count: ${count}</strong>`;
  }
}

customElements.define("my-counter", MyCounter);
```

```html
<my-counter count="3"></my-counter>
```

`observedAttributes` に列挙した属性だけが `attributeChangedCallback` で通知されます。

### Shadow DOM でスタイルを隔離

普通の `<style>` はページ全体に効きます。部品を配布する時に困るのは「**外側の CSS が入り込んできて壊れる** / 内側の CSS が外に漏れる」こと。Shadow DOM はこの両方を遮断します。

```js
class MyCard extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        /* ここの CSS は外に漏れない、外の CSS も入ってこない */
        :host {
          display: block;
          padding: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        h2 { color: #2563eb; margin: 0 0 8px; }
      </style>
      <h2>カードタイトル</h2>
      <p>カードの中身</p>
    `;
  }
}
customElements.define("my-card", MyCard);
```

```html
<my-card></my-card>
```

- `attachShadow({ mode: "open" })` で shadow tree を作る
- `:host` は **このカスタム要素自身** を指すセレクタ
- 内側で `h2 { color: red }` と書いても外側の `h2` には影響しない

`mode: "closed"` もありますが、テストや DevTools から覗けなくなるので **ほぼ常に `open`** を使います。

### `<slot>` で外から中身を差し込む

React の `children` に相当するのが `<slot>` です。

```js
class FancyBox extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display: block; padding: 16px; border: 2px dashed #2563eb; }
        header { font-weight: bold; margin-bottom: 8px; }
      </style>
      <header><slot name="title">デフォルトタイトル</slot></header>
      <div><slot>本文が入ります</slot></div>
    `;
  }
}
customElements.define("fancy-box", FancyBox);
```

使う側:

```html
<fancy-box>
  <span slot="title">カスタムタイトル</span>
  <p>ここが本文です。</p>
</fancy-box>
```

- `<slot>` は **名前なし** のデフォルトスロット
- `<slot name="title">` は **名前付き** スロット
- 外から `slot="title"` 属性を持つ要素がそのスロットに入る

### プロパティ / イベント

ボタンや入力のような値を持つ部品には、**プロパティ** と **カスタムイベント** を使います。

```js
class MyToggle extends HTMLElement {
  #checked = false;

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.render();
  }

  get checked() { return this.#checked; }
  set checked(value) {
    this.#checked = Boolean(value);
    this.render();
    this.dispatchEvent(new CustomEvent("change", { detail: { checked: this.#checked } }));
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <button>${this.#checked ? "ON" : "OFF"}</button>
    `;
    // render() で innerHTML を書き換えるたびに古い button は消えるので、
    // クリックリスナーは render() 内で「新しい button」に対してだけ付ける
    this.shadowRoot.querySelector("button").addEventListener("click", () => {
      this.checked = !this.checked;
    });
  }
}
customElements.define("my-toggle", MyToggle);
```

使う側:

```html
<my-toggle></my-toggle>

<script>
  const toggle = document.querySelector("my-toggle");
  toggle.addEventListener("change", (e) => {
    console.log("ON/OFF:", e.detail.checked);
  });
</script>
```

- プロパティは **クラスの getter / setter** として定義
- イベントは `new CustomEvent(名前, { detail: 任意のデータ })` を `dispatchEvent` する

### `<template>` で DOM のクローン元を用意

大きめの部品は `<template>` を HTML に置いておくと読みやすくなります。

```html
<template id="card-template">
  <style>
    :host { display: block; border: 1px solid #ccc; padding: 12px; }
  </style>
  <slot name="title"></slot>
  <slot></slot>
</template>

<script>
  const tpl = document.getElementById("card-template");
  class MyCardTpl extends HTMLElement {
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(tpl.content.cloneNode(true));
    }
  }
  customElements.define("my-card-tpl", MyCardTpl);
</script>
```

`tpl.content` は **DocumentFragment**。`cloneNode(true)` で毎回コピーして使います。

### React との使い分け

「React があるのに Web Components を学ぶ意味は？」という疑問への答え。

| | Web Components | React |
|---|---|---|
| 動く場所 | どの HTML ページでも | React アプリの中だけ |
| 状態管理 | 手書き（setter / event） | `useState` / hooks で簡潔 |
| 型 | TypeScript と相性が微妙 | 強い |
| エコシステム | Lit / Stencil がある | 圧倒的に大きい |
| 学習コスト | ブラウザの知識で済む | React 固有の思考 |

**原則**:

- **アプリ内部** の UI → React で書く（DX が圧倒的）
- **配布するデザインシステム / 横断的な共通部品** → Web Components（Lit 使用が多い）
- 両者を組み合わせることも一般的。React の中で `<my-card>` を呼ぶのも OK

React 19 以降は **Custom Elements を扱いやすく** なりました。具体的には、props がプリミティブ以外でも **DOM プロパティとして** Custom Element に渡るようになり、文字列以外（オブジェクトや関数）を素直に渡せます。

ただし、Custom Element が `dispatchEvent` で投げる **CustomEvent**（例: `change` / `select`）を `onChange` のような JSX プロパティで受ける機能は **入っていません**。React のイベントシステムは標準 DOM イベントを合成イベントに繋ぐ仕組みで、Custom Element の独自 CustomEvent は対象外です。CustomEvent を購読したい場合は **`ref` + `addEventListener`** が現実解です。

```tsx
import { useEffect, useRef } from "react";

function ToggleHost() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ checked: boolean }>).detail;
      console.log(detail);
    };
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, []);

  return <my-toggle ref={ref} />;
}
```

::: warning TypeScript で使うときは型宣言が必要
JSX で `<my-toggle>` のような自作タグを書くと、TS は **未知のタグ** としてエラーを出します。React 19 では `react` モジュールの `JSX` 名前空間を拡張する形が公式の作法です。

```ts
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "my-toggle": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
```

`Lit` を使うとデコレータ経由で型が付くので、TypeScript と組み合わせるなら Lit が現実解です。
:::

### Lit の存在

Custom Elements を生で書くと `innerHTML` / `attachShadow` / `render()` が冗長です。[Lit](https://lit.dev/) は Google 製の **薄いラッパー** で、宣言的に書けます。

```js
import { LitElement, html, css } from "lit";

class MyCard extends LitElement {
  static styles = css`
    :host { display: block; padding: 16px; border: 1px solid #ccc; }
  `;
  render() {
    return html`<h2>タイトル</h2><slot></slot>`;
  }
}
customElements.define("my-card", MyCard);
```

Web Components を本格的に書くなら Lit が現在のデファクト。Google / Adobe / Shopify も使っています。

## 演習

### ゴール

- Counter の Web Component を作る
- Shadow DOM でスタイル隔離を確認する
- `<slot>` で外から中身を差し込む

### 手順 1: 新規プロジェクト

```bash
npm create vite@latest web-components-sample -- --template vanilla-ts
cd web-components-sample
npm install
```

### 手順 2: index.html

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Web Components Demo</title>
    <style>
      /* 外側の CSS（Shadow DOM で隔離されるはず） */
      h2 { color: red; }
      body { font-family: sans-serif; padding: 24px; }
    </style>
  </head>
  <body>
    <h2>外側の h2（赤いはず）</h2>

    <my-card>
      <span slot="title">内側のタイトル</span>
      <p>スロットに入る本文</p>
    </my-card>

    <my-counter start="5"></my-counter>
    <p id="log">イベントログ: -</p>

    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### 手順 3: src/main.ts

```ts
// my-card
class MyCard extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display: block; margin: 16px 0; padding: 16px; border: 1px solid #ccc; border-radius: 8px; }
        h2 { color: #2563eb; margin: 0 0 8px; }
      </style>
      <h2><slot name="title">デフォルトタイトル</slot></h2>
      <div><slot></slot></div>
    `;
  }
}
customElements.define("my-card", MyCard);

// my-counter
class MyCounter extends HTMLElement {
  #count = 0;

  static observedAttributes = ["start"];

  attributeChangedCallback(name: string, _old: string, value: string) {
    if (name === "start") {
      this.#count = Number(value);
      this.render();
    }
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.#count = Number(this.getAttribute("start") ?? "0");
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; gap: 8px; align-items: center; padding: 8px; border: 1px solid #ccc; border-radius: 8px; }
        button { padding: 4px 12px; }
        strong { min-width: 40px; text-align: center; }
      </style>
      <button id="dec">-</button>
      <strong>${this.#count}</strong>
      <button id="inc">+</button>
    `;
    this.shadowRoot.getElementById("inc")!.addEventListener("click", () => {
      this.#count++;
      this.render();
      this.dispatchEvent(new CustomEvent("change", { detail: { count: this.#count } }));
    });
    this.shadowRoot.getElementById("dec")!.addEventListener("click", () => {
      this.#count--;
      this.render();
      this.dispatchEvent(new CustomEvent("change", { detail: { count: this.#count } }));
    });
  }
}
customElements.define("my-counter", MyCounter);

// ログ
const log = document.getElementById("log")!;
document.querySelector("my-counter")!.addEventListener("change", (e: Event) => {
  const ce = e as CustomEvent<{ count: number }>;
  log.textContent = `イベントログ: count = ${ce.detail.count}`;
});
```

### 手順 4: 起動して確認

```bash
npm run dev
```

ブラウザで以下を確認します。

1. 外側の `<h2>外側の h2（赤いはず）</h2>` は **赤字**
2. `<my-card>` の中の `<h2>` は **青字**（内側の `color: #2563eb` が効く。外側の `color: red` は入ってこない）
3. `<my-card>` のスロットに外から渡した「内側のタイトル」と段落が表示される
4. `<my-counter>` の `+` / `-` ボタンで数字が変わり、**イベントログ** が更新される

### 期待出力

- Shadow DOM の中の h2 は青、外側の h2 は赤
- カウンターを操作すると「イベントログ: count = 6」のように表示が追随する

### 変える

- `attachShadow({ mode: "open" })` を `mode: "closed"` に変える → `document.querySelector('my-counter').shadowRoot` が `null` になることを確認。**注意**: `closed` のままだと `this.shadowRoot!.getElementById(...)` が null 参照で実行時エラーになるため、観察できたら `open` に戻してから他の手順に進む
- `<my-card>` の内側に `<style> h2 { color: red; }` を書き足して、それは効くが外からの CSS は入ってこないことを確認
- `observedAttributes` から `"start"` を外すと、HTML 側で `start` を後から変えても反応しなくなる
- `CustomEvent` の `bubbles: true, composed: true` を付けて、イベントが Shadow 境界を越えて伝播することを確認

### 自分で書く（任意）

- `<my-alert type="error">エラーメッセージ</my-alert>` のように `type` 属性で配色を変える alert コンポーネントを作る
- Lit を `npm install lit` で入れて、上の Counter を Lit で書き直す
- 作った Web Component を React プロジェクトに持ち込んで `<my-counter start={5} />` で使ってみる（React 19 なら `oncount` のようなイベントも自然に書ける）

## まとめ

- **Web Components** は「フレームワーク非依存の UI 部品」を作るための Web 標準
- **Custom Elements**（class extends HTMLElement）、**Shadow DOM**、**HTML Templates** の 3 本柱
- `connectedCallback` / `disconnectedCallback` / `attributeChangedCallback` のライフサイクル
- `:host` で要素自身にスタイル、`<slot>` で外側から中身を挿入
- プロパティは getter / setter、通知は `CustomEvent` で
- 本格運用するなら **Lit** が今のデファクト
- React のアプリ内部は React で、**横断的に配布する共通部品** は Web Components が合う
- React 19 以降は Custom Elements の props / event 受け渡しが自然
