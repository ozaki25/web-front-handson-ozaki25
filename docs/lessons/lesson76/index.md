# lesson76: `next/image` で画像最適化

## ゴール

- `next/image` の `<Image>` コンポーネントで、HTML の素の `<img>` より賢く画像を表示できます。
- `width` / `height` の扱いと、省略できる 2 パターン（静的 import と `fill`）を覚えます。
- 外部ホストの画像を使うには `next.config.ts` の `images.remotePatterns` に登録が必要なことを押さえます。
- 5 章 の「ページを増やしてリンクで移動する」で `/about` に貼った `<img>` を `<Image>` に置き換えて、自動最適化の恩恵を受けられます。

## 解説

### なぜ `<img>` のままでは駄目なのか

HTML の素の `<img>` タグは、書いたサイズそのまま・書いた形式そのままの画像をブラウザに配ります。実用アプリで問題になるのは次の点です。

- **画像が重い**: 3000×2000 の写真を 300×200 で表示していても、3000×2000 のファイルがそのまま転送されます。
- **形式が古い**: JPG / PNG のまま配ると、WebP や AVIF に対応するブラウザでもその恩恵を受けられません。
- **画面外の画像も全部読む**: スクロールしないと見えない画像まで、開いた瞬間に全部読みに行きます（CLS や LCP の悪化）。
- **縦横比で起きるガタつき**: 画像の読み込みが終わるとレイアウトがズレて、読んでいた本文がピョンと下に動きます（CLS）。

`next/image` の `<Image>` は、これらを **設定なしで** 自動で面倒を見てくれます。

- 表示サイズに応じた解像度を自動生成（`srcset`）
- WebP / AVIF に自動変換（ブラウザが対応していれば）
- 画面内に入ったときだけ読み込み（遅延読み込み）
- `width` / `height` 必須にすることでレイアウトのガタつきを防ぐ

### 最小の使い方

```tsx
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/coffee.jpg"
      alt="コーヒーの写真"
      width={300}
      height={200}
    />
  );
}
```

- `import Image from "next/image"` でコンポーネントを読み込みます。
- `src` はプロジェクト内の `public/` 直下のパス、または **登録済み** の外部 URL です。
- `alt` は必須です。読み上げソフトと、画像が読み込めなかったときの代替テキストになります。
- `width` と `height` はピクセル数を **数値** で書きます（CSS 単位の `px` は付けません）。

### `width` / `height` は原則必須。ただし省略できる 2 つのケース

`<Image>` は `width` / `height` を **原則必須** にします。レイアウトのガタつき（CLS）を防ぐためです。ただし、次の 2 ケースだけは省略できます。

1. **静的 import の場合**
   プロジェクト内の画像を `import` すると、Next.js がビルド時に画像のサイズを読み取って自動で埋めてくれます。
   ```tsx
   import heroImg from "./hero.png";

   <Image src={heroImg} alt="ヒーロー画像" />
   ```
2. **`fill` を使う場合**
   親要素いっぱいに広げる使い方です。親に `position: relative` と明示的なサイズが要ります。
   ```tsx
   <div style={{ position: "relative", width: 300, height: 200 }}>
     <Image src="/coffee.jpg" alt="コーヒー" fill />
   </div>
   ```

外部 URL を `src` に指定する場合は **静的 import できないので `width` / `height` を明示するか、`fill` で親サイズに従わせる** ことになります。

### 外部ホストを使うには `remotePatterns`

`<Image>` はセキュリティとキャッシュの都合で、**どの外部ホストからの画像を許可するか** を事前に宣言する必要があります。これが `next.config.ts` の `images.remotePatterns` です。

未登録のホストの画像を `<Image src="https://...">` で読むと、次のようなエラーになります。

```
Invalid src prop (https://placehold.co/...) on `next/image`,
hostname "placehold.co" is not configured under images in your `next.config.js`
```

書き方は次の通りです。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
```

Next.js 15 以降は **`{ protocol, hostname, pathname }` のオブジェクト配列** で書きます。`pathname: "/**"` は「そのホストの全パスを許可」の意味です。より狭く `"/300x200.png"` と書いて 1 ファイルだけ許可することもできます。

### `sizes` でレスポンシブ対応

`<Image>` は可変サイズ（`width` が CSS で `100%` のような動的な値）で使うときに `sizes` を付けると、もっとも賢く `srcset` を切り替えてくれます。詳細は本レッスンの範囲外ですが、1 行だけ雰囲気を見せておきます。

```tsx
<Image
  src="/coffee.jpg"
  alt="コーヒー"
  width={600}
  height={400}
  sizes="(max-width: 640px) 100vw, 300px"
/>
```

スマホ幅では 100vw、それ以外では 300px で表示される、という意味です。本演習では使いませんが、覚えておくと役立ちます。

## 演習

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあればそのまま使えます。手元に無ければ、新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開き、下の「出発点のファイル」を貼って揃えてください。`/about` の画像を差し替える演習なので、最低限 `/about` ページと `<img>` が存在すれば構いません。

<details>
<summary>出発点のファイル（`/about` 最小形）</summary>

**`app/about/page.tsx`**

```tsx
export default function AboutPage() {
  return (
    <>
      <section id="likes">
        <h2>好きなもの</h2>
        <div className="cards">
          <article className="card">
            <img src="https://placehold.co/300x200.png" alt="コーヒーのプレースホルダ画像" />
            <h3>コーヒー</h3>
            <p>朝の 1 杯が欠かせない。</p>
          </article>
          <article className="card">
            <img src="https://placehold.co/300x200.png" alt="本のプレースホルダ画像" />
            <h3>本</h3>
            <p>技術書からエッセイまで。</p>
          </article>
          <article className="card">
            <img src="https://placehold.co/300x200.png" alt="散歩のプレースホルダ画像" />
            <h3>散歩</h3>
            <p>行き先を決めずに歩く。</p>
          </article>
        </div>
      </section>
    </>
  );
}
```

Route Groups を使っていない出発点なので、本文中で `app/(public)/about/page.tsx` と書かれている箇所は `app/about/page.tsx` に読み替えてください。

</details>

### 前回のプロジェクトを開く

5 章 のここまで（「ページを増やしてリンクで移動する」〜「Server Component でデータを取得する」）で作ってきた StackBlitz プロジェクトを開き直しましょう。「Route Groups で整理する」の Route Groups 化を済ませていれば、`/about` のファイルは `app/(public)/about/page.tsx` にあります。

### 手順 1: `next.config.ts` に `remotePatterns` を追加

プロジェクト直下に `next.config.ts`（または `next.config.mjs`）があります。StackBlitz テンプレートでは既に存在するはずです。なければ新規作成します。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
```

保存すると、Next.js が設定を再読み込みします（StackBlitz ではターミナルに再起動のログが流れます）。

### 手順 2: `/about` の `<img>` を `<Image>` に置き換える

`app/(public)/about/page.tsx`（「Route Groups で整理する」以前のままなら `app/about/page.tsx`）を開きます。「ページを増やしてリンクで移動する」で貼った 3 枚のカードの `<img>` を、`<Image>` に置き換えます。

ファイル全体はこうなります。

```tsx
import Image from "next/image";
import "./about.css";

export default function AboutPage() {
  return (
    <>
      <section id="about">
        <h2>自己紹介</h2>
        <p>Web フロントエンドを学び中です。HTML / CSS / JavaScript から順に手を動かして進めています。</p>
      </section>

      <section id="likes">
        <h2>好きなもの</h2>
        <div className="cards">
          <article className="card">
            <Image
              src="https://placehold.co/300x200.png"
              alt="コーヒーのプレースホルダ画像"
              width={300}
              height={200}
            />
            <h3>コーヒー</h3>
            <p>朝の 1 杯が欠かせない。</p>
          </article>
          <article className="card">
            <Image
              src="https://placehold.co/300x200.png"
              alt="本のプレースホルダ画像"
              width={300}
              height={200}
            />
            <h3>本</h3>
            <p>技術書からエッセイまで。</p>
          </article>
          <article className="card">
            <Image
              src="https://placehold.co/300x200.png"
              alt="散歩のプレースホルダ画像"
              width={300}
              height={200}
            />
            <h3>散歩</h3>
            <p>行き先を決めずに歩く。</p>
          </article>
        </div>
      </section>

      <section id="contact">
        <h2>問い合わせ</h2>
        <form>
          <div>
            <label htmlFor="name">お名前</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div>
            <label htmlFor="email">メール</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="message">メッセージ</label>
            <textarea id="message" name="message" rows={4} required></textarea>
          </div>
          <button type="submit">送信</button>
        </form>
      </section>
    </>
  );
}
```

変更点:

- 1 行目に `import Image from "next/image";` を追加しました。
- `<img src="..." alt="..." />` を 3 箇所とも `<Image ... width={300} height={200} />` に置き換えました。
- `<Image>` は `width` と `height` を **数値**（中括弧） で書くことに注意してください（HTML の `<img width="300">` のような文字列ではありません）。

### 手順 3: 画像サイズの CSS を見直す

「ページを増やしてリンクで移動する」の `about.css` には次のような指定が入っていました。

```css
.card img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
```

`<Image>` も内部的には `<img>` を生成するので、このスタイルはそのまま効きます。`width: 100%` でカードの幅に合わせて縮みます。`height: auto` を入れておくと、縮んでも縦横比が崩れません。

ダークモードでの `filter` 調整などは不要です。「ページを増やしてリンクで移動する」時点の CSS のままで構いません。

### 期待出力

1. ブラウザで `/about` を開きます。見た目は「ページを増やしてリンクで移動する」時点とほぼ同じです（カード 3 枚にプレースホルダ画像）。
2. **DevTools → Network タブ** を開いて再読み込みします。
3. `placehold.co/300x200.png` がそのまま落ちてくるのではなく、`/_next/image?url=...&w=...&q=...` のような Next.js 内部の URL 経由で画像が配信されているのが見えます。これが自動最適化の証拠です。
4. Response の Content-Type が `image/webp` や `image/avif` になっているはずです（ブラウザが対応している場合）。
5. `next.config.ts` から `remotePatterns` を一時的に削除して保存すると、`/about` を開いたときにコンソールや画面に「hostname is not configured」のエラーが出ます（確認したら戻します）。

### 変えてみる

1. 3 枚目のカードの `<Image>` に `priority` プロパティを付けて、遅延読み込みを止めてみましょう（`<Image src="..." alt="..." width={300} height={200} priority />`）。ページ表示のタイミングが少しだけ速くなる可能性があります（体感差は小さい）。
2. `width={300} height={200}` を `width={600} height={400}` に変えると、同じ見た目のまま 2 倍の解像度のソースが配信されるようになります（ネットワークタブで URL の `w=` が変わるのを確認）。
3. `public/` フォルダに自分の PNG 画像を 1 枚置いて、`import myImg from "../../../../public/my.png"` のように静的 import で `<Image src={myImg} alt="..." />` を書いてみましょう。`width` / `height` を **省略しても** 動くはずです（静的 import なので Next.js が自動でサイズを取る）。

### スコープ外

- LCP 最適化の深掘り、`priority` の本格活用、`placeholder="blur"` の `blurDataURL` 自動生成は本コースでは扱いません。
- `localPatterns`（Next.js 15.3 で追加）などの発展設定は扱いません。
- カスタムローダー（CDN 連携）も扱いません。

### 自分で書く

`/gallery` という新しいページを `app/(public)/gallery/page.tsx` に作り、`https://placehold.co/400x300.png` のような別サイズの画像を 3 枚並べるページを組んでみましょう。`width={400} height={300}` を指定するだけで、自動最適化が効きます。ナビにも `/gallery` のリンクを足してみると良いでしょう。

## まとめ

- `import Image from "next/image"` で `<Image>` コンポーネントを使えます。素の `<img>` より賢い画像表示ができます。
- `width` と `height` は **原則必須**。省略できるのは静的 import と `fill` の 2 パターンだけです。
- 外部ホストを使うには `next.config.ts` の `images.remotePatterns` に `{ protocol, hostname, pathname }` のオブジェクトで登録します。
- `<img>` を `<Image>` に差し替えるだけで、WebP / AVIF 変換や遅延読み込みの恩恵を自動で受けられます。
