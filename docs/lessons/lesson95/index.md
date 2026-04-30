# lesson95: ARIA 属性とキーボード操作

## ゴール

- ARIA の **5 つの原則**（特にセマンティック HTML を優先）を理解する
- よく使う ARIA 属性（`aria-label` / `aria-labelledby` / `aria-describedby` / `aria-expanded` / `aria-hidden` / `aria-live`）を使い分けられる
- `role` 属性をどんな時に使うかを説明できる
- キーボード操作（Tab / Shift+Tab / Enter / Space / Esc / 矢印キー）の標準パターンを知る
- `tabindex` の 3 つの値（`0` / `-1` / 正の数値）の意味を説明できる
- モーダルでのフォーカストラップ・フォーカスリングを消さない原則を守れる

## 解説

### ARIA の原則: セマンティック HTML を優先する

ARIA（Accessible Rich Internet Applications）は、HTML だけでは表現しきれない意味をスクリーンリーダーに伝えるための **追加の属性** です。W3C が **ARIA の 5 つの原則** として次の「使うべきでない条件」を示しています（抜粋）。

1. **HTML 要素で表現できるなら、ARIA を使わない**。`<button>` が使えるなら `<div role="button">` は書かない
2. **HTML の意味を ARIA で上書きしない**。`<h1 role="button">` のように `<h1>` を無理にボタンにしない
3. **ARIA 付きの要素もキーボード操作可能に**。role を付けたら Tab で到達でき、Enter や Space で反応する必要がある
4. **フォーカス可能な要素に `role="presentation"` や `aria-hidden="true"` を付けない**（触れなくなる）
5. **インタラクティブな要素には、アクセシブルな名前を付ける**（画像ボタンなら `aria-label` を）

つまり「**ARIA は最後の手段**」です。まずは `<button>` / `<nav>` / `<h1>` / `<label>` のような意味あるタグを使い、それでも足りないとき（複雑なウィジェット・動的更新・ネイティブ要素がないもの）だけ ARIA を足します。

### よく使う ARIA 属性

実務でよく書くのは以下です。全部を覚える必要はありません。

#### 1. `aria-label`: テキストが無い要素に名前を付ける

アイコンだけのボタンにラベルを与えます。

```html
<!-- 検索アイコンだけのボタン -->
<button aria-label="検索">
  <svg>...</svg>
</button>
```

スクリーンリーダーは「検索、ボタン」と読み上げます。`aria-label` がないと「ボタン」としか読まれず、何のボタンか分かりません。

#### 2. `aria-labelledby`: 他の要素をラベルにする

すでに画面に表示されている見出しをラベルとして流用します。

```html
<section aria-labelledby="contact-heading">
  <h2 id="contact-heading">お問い合わせ</h2>
  <p>...</p>
</section>
```

この `<section>` は「お問い合わせ」というセクションだとスクリーンリーダーが認識します。「セマンティック HTML とアクセシビリティの基礎」の演習でも同じパターンを使いました。

#### 3. `aria-describedby`: 追加の説明を関連付ける

入力欄にエラーメッセージや補足説明を結びつけます。

```html
<label for="password">パスワード</label>
<input
  id="password"
  type="password"
  aria-describedby="password-hint password-error"
  aria-invalid="true"
/>
<p id="password-hint">8 文字以上、英数字混在</p>
<p id="password-error">英字が含まれていません</p>
```

スクリーンリーダーはラベルに続いて hint と error も読み上げます。フォームのアクセシビリティで定番のパターンです。

#### 4. `aria-expanded`: 開閉状態を伝える

折りたたみ式 UI（アコーディオン / ドロップダウン）で、現在開いているかを伝えます。

```html
<button aria-expanded="false" aria-controls="menu">メニュー</button>
<ul id="menu" hidden>
  <li>項目 1</li>
  <li>項目 2</li>
</ul>
```

クリックで `aria-expanded` を `true` に切り替え、`hidden` 属性も外します。`aria-controls` は「このボタンがどの要素を操作するか」の関連付けです。

#### 5. `aria-hidden`: スクリーンリーダーから隠す

装飾的な要素（アイコン画像など）を読み上げから除外します。

```html
<button>
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
    <path d="M3 3h8v9H3z" fill="currentColor" />
  </svg>
  削除
</button>
```

アイコンを画像的に添えるだけで、隣に「削除」というテキストがある場合、アイコンは読ませずテキストだけ読ませたい、というケースです。

> 注意: **フォーカス可能な要素** に `aria-hidden="true"` を付けてはいけません（原則 4）。フォーカスは当たるのに読み上げられない、という矛盾状態が起きます。

#### 6. `aria-live`: 動的に変化する場所を伝える

JS で中身が変わる領域を、スクリーンリーダーに「変化があったら読み上げてね」と伝えます。

```html
<div aria-live="polite" id="status"></div>

<script>
  // ボタン押下で「保存しました」に差し替えると、
  // スクリーンリーダーが自動でその変化を読み上げる
  document.getElementById('status').textContent = '保存しました';
</script>
```

値は 3 種類:

- `polite`: 今の読み上げが終わってから通知。普通はこれ
- `assertive`: 今の読み上げを割り込んで即通知。緊急通知のみ
- `off`: 通知しない（省略と同じ）

チャットの新着通知や、フォーム送信後の成功メッセージで使います。

### `role` 属性: 要素に別の役割を与える

HTML にぴったりの要素がないとき、`role` で役割を付与します。ただし **HTML で書けるものは HTML を優先** です。

```html
<!-- OK: HTML にタブを表す要素がないので role で補う -->
<div role="tablist">
  <button role="tab" aria-selected="true">タブ 1</button>
  <button role="tab" aria-selected="false">タブ 2</button>
</div>

<!-- NG: button があるのに div + role -->
<div role="button" tabindex="0" onclick="handleClick()">送信</div>
<!-- → 素直に <button>送信</button> で良い -->
```

よく使う role:

- `role="button"` / `role="link"` / `role="checkbox"` など（**原則 HTML 要素を優先**）
- `role="tablist"` / `role="tab"` / `role="tabpanel"`（タブ UI）
- `role="dialog"` / `role="alertdialog"`（モーダル。後述）
- `role="alert"`（`aria-live="assertive"` 相当、即時通知）
- `role="status"`（`aria-live="polite"` 相当、穏やかな通知）

最近は `<dialog>` タグ（HTML 標準）で済むケースも増えたので、まず `<dialog>` を検討するのが正攻法です。

### キーボード操作の標準パターン

マウスを使わずに操作できるのは、スクリーンリーダー利用者だけでなく **効率重視の開発者や、運動機能に制約のあるユーザー** にとっても重要です。ブラウザと OS が標準で提供している挙動を壊さないのが基本です。

| キー | 標準の挙動 |
|---|---|
| **Tab** | フォーカスを次の操作可能要素へ |
| **Shift + Tab** | フォーカスを前の操作可能要素へ |
| **Enter** | リンクならページ遷移、ボタンなら実行 |
| **Space** | ボタンを実行（チェックボックスのトグル、スクロール） |
| **Esc** | モーダル・メニュー・ドロップダウンを閉じる |
| **矢印キー** | ラジオグループ内の移動、タブの切り替え、メニュー内の移動 |

これらを **自分で実装する必要は普通ありません**。`<button>` や `<a>` を使えばブラウザが自動でやってくれます。**独自コンポーネントを作るときだけ** 自分で実装します（ARIA Authoring Practices（<https://www.w3.org/WAI/ARIA/apg/patterns/>）に各パターンが載っています）。

### `tabindex` の 3 つの値

`tabindex` 属性で Tab 順序を制御できます。覚えるのは 3 パターンだけです。

```html
<!-- 1. tabindex="0": Tab 順序に加える。通常の順番で到達可能に -->
<div tabindex="0" role="button">カスタムボタン</div>

<!-- 2. tabindex="-1": プログラムから focus() できるが、Tab ではスキップ -->
<div tabindex="-1" id="modal">...</div>
<!-- JS で modal.focus() は可能。Tab 巡回には入らない -->

<!-- 3. 正の数値（tabindex="1", "2" ...）: 使わない -->
<button tabindex="5">...</button>
<!-- NG: 自然な順序を壊すので避ける -->
```

**`tabindex` の正の数値は原則使わない** のが鉄則です。DOM の登場順に従うのが一番自然で、壊れにくいからです。

### フォーカスを「見えるようにする」

キーボード操作でフォーカスがどこにあるか分からないと、ユーザーは迷子になります。ブラウザはデフォルトでフォーカス時に枠（フォーカスリング）を表示します。**これを CSS で消してはいけません**。

```css
/* NG: フォーカスリングを完全に消す */
button:focus {
  outline: none;  /* 絶対にダメ */
}

/* OK: デフォルトより目立つリングに差し替える */
button:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
```

`:focus-visible` は「キーボード操作でフォーカスが来た時だけ」反応する擬似クラスで、マウスクリック時には出ません。これで「マウス派にはリングが見えず邪魔にならない」「キーボード派には明確に見える」を両立できます。

### モーダルのフォーカストラップ

モーダル（ダイアログ）を開いたら、**モーダルの中だけで Tab が巡回する** ようにします。背景のボタンに Tab で飛べてしまうと、スクリーンリーダー利用者は「モーダルを開いたはずが、なぜか元のページに戻っている」という混乱が起きます。

手動で実装するのは煩雑なので、**`<dialog>` タグの `showModal()` を使う** のが最も簡単です（ブラウザがフォーカストラップを自動で行います）。

```html
<dialog id="my-dialog">
  <h2>確認</h2>
  <p>削除しますか？</p>
  <button type="button" onclick="this.closest('dialog').close()">キャンセル</button>
  <button type="button" onclick="handleConfirm()">OK</button>
</dialog>

<button onclick="document.getElementById('my-dialog').showModal()">
  開く
</button>
```

`<dialog>.showModal()` を呼ぶと:

- モーダルが表示される
- フォーカスがモーダル内に入り、Tab で外に出られなくなる
- Esc キーで自動的に閉じる
- 閉じるとフォーカスが元のトリガー要素に戻る

React のモーダルライブラリ（Radix UI の Dialog、Headless UI など）も内部的に同じ作法を守っています。自作する前に既存実装を検討するのがおすすめです。

## 演習

### ゴール

- アイコンボタンに `aria-label` を付ける
- 折りたたみ式メニューに `aria-expanded` / `aria-controls` を付ける
- 動的メッセージに `aria-live` を付ける
- フォーカスリングを明示的にスタイル（`:focus-visible` で）
- `<dialog>` で最小のモーダルを作り、フォーカストラップを体験する

### 途中から始める場合

独立したレッスンです。新規 StackBlitz の Vanilla テンプレートを開いて、下のコードを貼ってください。

<details>
<summary>出発点のコード</summary>

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>ARIA とキーボード操作</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <h1>ARIA 演習</h1>
    <p>Tab キーで操作してみてください。</p>
  </body>
</html>
```

**`style.css`**

```css
body { font-family: sans-serif; padding: 16px; color: #1a1a1a; background: #fff; }
```

</details>

### 手順

1. `index.html` を下の完成形にします
2. `style.css` を下の完成形にします
3. プレビューでキーボードの Tab と Enter だけで全操作ができるか確認します

### `index.html` の完成形

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>ARIA とキーボード操作</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <h1>ARIA 演習</h1>

    <section aria-labelledby="toolbar-heading">
      <h2 id="toolbar-heading">ツールバー</h2>
      <button aria-label="保存" id="save">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" />
          <rect x="5" y="2" width="6" height="4" fill="currentColor" />
        </svg>
      </button>
      <button aria-label="削除" id="delete">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 6h8v7H4z M6 3h4v2H6z" fill="currentColor" />
        </svg>
      </button>
    </section>

    <section aria-labelledby="menu-heading">
      <h2 id="menu-heading">折りたたみメニュー</h2>
      <button id="menu-toggle" aria-expanded="false" aria-controls="menu">
        メニューを開く
      </button>
      <ul id="menu" hidden>
        <li><a href="#">項目 1</a></li>
        <li><a href="#">項目 2</a></li>
        <li><a href="#">項目 3</a></li>
      </ul>
    </section>

    <section aria-labelledby="status-heading">
      <h2 id="status-heading">保存の通知</h2>
      <button id="save-btn">保存する</button>
      <div id="status" aria-live="polite"></div>
    </section>

    <section aria-labelledby="dialog-heading">
      <h2 id="dialog-heading">モーダル</h2>
      <button id="open-dialog">確認ダイアログを開く</button>
      <dialog id="confirm-dialog" aria-labelledby="dialog-title">
        <h3 id="dialog-title">削除の確認</h3>
        <p>本当に削除してもよろしいですか？</p>
        <button type="button" id="cancel-btn">キャンセル</button>
        <button type="button" id="confirm-btn">削除する</button>
      </dialog>
    </section>

    <script>
      // 折りたたみメニュー
      const toggle = document.getElementById('menu-toggle');
      const menu = document.getElementById('menu');
      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        toggle.textContent = isOpen ? 'メニューを開く' : 'メニューを閉じる';
        if (isOpen) {
          menu.setAttribute('hidden', '');
        } else {
          menu.removeAttribute('hidden');
        }
      });

      // ツールバーボタン（デモなのでログだけ）
      document.getElementById('save').addEventListener('click', () => {
        console.log('保存ボタンが押されました');
      });
      document.getElementById('delete').addEventListener('click', () => {
        console.log('削除ボタンが押されました');
      });

      // 動的ステータス通知
      document.getElementById('save-btn').addEventListener('click', () => {
        const status = document.getElementById('status');
        status.textContent = '保存しました (' + new Date().toLocaleTimeString() + ')';
      });

      // モーダル
      const dialog = document.getElementById('confirm-dialog');
      document.getElementById('open-dialog').addEventListener('click', () => {
        dialog.showModal();
      });
      document.getElementById('cancel-btn').addEventListener('click', () => {
        dialog.close();
      });
      document.getElementById('confirm-btn').addEventListener('click', () => {
        console.log('削除を実行しました');
        dialog.close();
      });
    </script>
  </body>
</html>
```

### `style.css` の完成形

```css
body {
  font-family: sans-serif;
  padding: 16px;
  color: #1a1a1a;
  background: #ffffff;
}

section {
  margin: 24px 0;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

h1 {
  margin-top: 0;
}

button {
  padding: 8px 16px;
  margin-right: 8px;
  background: #1e3a8a;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* フォーカスリング: キーボード操作時だけ目立たせる */
button:focus-visible,
a:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}

/* マウスクリック時は既定のアウトラインを消してもよい（:focus ではなく :focus-visible を使うため、マウス時は自動で出ない） */

ul {
  margin-top: 8px;
  padding-left: 20px;
}

/* モーダル */
dialog[open] {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

#status {
  margin-top: 8px;
  color: #1e3a8a;
  font-weight: bold;
}
```

### 期待出力

- アイコンボタン（保存 / 削除の SVG アイコン）が画面に並び、マウスホバーで tooltip 的に `aria-label` が出るブラウザもある
- Tab キーで「保存」ボタン → 「削除」ボタン → 「メニューを開く」ボタン → （メニュー展開後は）項目リンク → 「保存する」ボタン → 「確認ダイアログを開く」ボタン と順に移動する
- 「メニューを開く」を Enter で押すと、メニューが展開されボタンのラベルが「メニューを閉じる」に切り替わる
- 「保存する」を押すと、下の `aria-live` 領域に時刻付きメッセージが追加される
- 「確認ダイアログを開く」を押すと、モーダルが表示されフォーカスがモーダル内に移動する。Tab はモーダル内だけを巡回する
- Esc キーでモーダルが閉じ、フォーカスが元のトリガーボタンに戻る

### スクリーンリーダーで確認（任意）

macOS なら **VoiceOver**（`Cmd + F5` で起動）、Windows なら **NVDA**（無料、<https://www.nvaccess.org/>）を使います。それぞれ:

- アイコンボタンが「保存、ボタン」「削除、ボタン」と読み上げられる
- 折りたたみボタンが「メニューを開く、ボタン、折りたたみ済み」（展開後は「展開済み」）と状態付きで読まれる
- 「保存する」を押した瞬間、「保存しました（時刻）」と自動で読み上げられる（`aria-live` のおかげ）
- モーダル内のコンテンツが「削除の確認、ダイアログ」と読み上げられる

### 変える

- `aria-label="保存"` を削除してみる。スクリーンリーダーでは「ボタン」とだけ読まれ、何のボタンか分からなくなる
- `aria-expanded="false"` を削除してみる。Lighthouse が「Some elements have no accessible name」と警告する
- `aria-live="polite"` を `aria-live="assertive"` に変えてみる。保存を連打すると、読み上げが即時割り込みで切り替わる
- `button:focus-visible` のアウトラインを `outline: none` にしてみる（**試したらすぐ戻す**）。キーボード操作でどこにフォーカスがあるか全く見えなくなる恐ろしさを体感できる

### 自分で書く

- 「コピーする」ボタンを追加する。クリックで `navigator.clipboard.writeText('...')` を呼び、`aria-live` 領域に「コピーしました」と出す
- モーダル内の最初のフォーカス可能要素に **最初から** フォーカスが当たることを確認。`showModal()` が自動でやってくれるので特に追記コードは不要

## まとめ

- ARIA の原則の第一は **「HTML で書けるなら ARIA を使わない」**
- よく使う ARIA 属性: `aria-label` / `aria-labelledby` / `aria-describedby` / `aria-expanded` / `aria-hidden` / `aria-live`
- `role` 属性は HTML で表現できない複雑ウィジェット（タブ / アコーディオン）で使う
- キーボードの標準操作（Tab / Enter / Space / Esc / 矢印）はブラウザがやってくれる。自分で実装するのは独自コンポーネントだけ
- `tabindex` は `0` / `-1` の 2 種類だけを使う。正の数値は使わない
- フォーカスリングは **`outline: none` で消さない**。`:focus-visible` で目立たせる
- モーダルは `<dialog>.showModal()` でフォーカストラップを自動入手
