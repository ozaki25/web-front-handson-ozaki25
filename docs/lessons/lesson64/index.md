# lesson64: `useMemo` で計算のメモ化

## ゴール

- `useMemo` で重い計算の結果をメモ化できる
- 依存配列 `[deps]` の意味を理解する
- 「まず普通に書き、計測してから最適化する」という原則を持つ
- `useCallback` / `React.memo` / React Compiler との関係を俯瞰できる

## 解説

### 再レンダリングのたびに走る計算

React は state や props が変わるたびにコンポーネント関数を再実行します。関数の中で書いた計算も、**毎回やり直し** です。

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  const [keyword, setKeyword] = useState("");

  // 毎回のレンダリングでフィルタリングが走る
  const filtered = todos.filter((t) => t.text.includes(keyword));

  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <ul>
        {filtered.map((t) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </ul>
    </>
  );
}
```

`todos` が 100 件くらいならこのまま書いても全く問題ありません。ただ、1 万件以上の配列で毎回フィルタするような場面では、再計算をスキップしたくなります。

そのための仕組みが **`useMemo`** です。

### `useMemo` の形

```tsx
import { useMemo } from "react";

const filtered = useMemo(() => {
  return todos.filter((t) => t.text.includes(keyword));
}, [todos, keyword]);
```

- 第 1 引数: 値を返す関数
- 第 2 引数: **依存配列**。この中の値が前回と同じなら、関数を呼び直さず前回の結果を使い回す
- 戻り値: 第 1 引数の関数の戻り値

「`todos` か `keyword` が変わったときだけ再計算する」という書き方になります。

### 依存配列を忘れるとどうなるか

依存配列を `[]`（空配列）にすると、初回レンダリングの結果がずっと使い回されます。`keyword` を変えても `filtered` が更新されないバグになります。

```tsx
// NG: keyword が変わっても filtered が更新されない
const filtered = useMemo(() => {
  return todos.filter((t) => t.text.includes(keyword));
}, []);
```

依存配列は **関数の中で参照している「外の値」すべて** を入れるのが原則です。忘れると静かなバグになります。

### まず普通に書く、計測してから最適化

`useMemo` は便利そうに見えますが、**乱用すると逆にコードが読みにくくなり、メモ化自体のコスト（依存配列のチェック、前回値の保持）で遅くなる** こともあります。

原則:

1. まず **`useMemo` なし** で書く
2. 「画面がカクつく」「数千〜数万件の配列を扱う」など、**実際に遅いと感じたときだけ** `useMemo` を検討する
3. React DevTools Profiler（「React DevTools」）で **本当に速くなったか計測** してから採用する

「念のため」で書いた `useMemo` は、ほとんどの場合で邪魔になります。

### コラム（折りたたみ）: `useCallback` と `React.memo`

`useMemo` は **値** のメモ化ですが、関連する仕組みがもう 2 つあります。

:::details useCallback / React.memo / React Compiler

**`useCallback`**: 関数のメモ化。毎回のレンダリングで新しく作られる関数の参照を安定させます。

```tsx
const handleDelete = useCallback(
  (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  },
  [], // 依存なし、常に同じ関数参照を返す
);
```

**`React.memo`**: コンポーネントのメモ化。props が変わらなければ再レンダリングをスキップします。

```tsx
import { memo } from "react";

export const TodoItem = memo(function TodoItem({ todo, onDelete }: Props) {
  return <li>{todo.text}</li>;
});
```

`React.memo` で包んだ子コンポーネントに `useCallback` で関数 props を渡すと、親の再レンダリングで子がスキップされるようになります。

**React Compiler** は React チームが進めている自動最適化ツールで、2025 年に 1.0 が出て、Next.js 16 でも組み込みオプションとして安定化が進んでいます（experimental フラグが不要になった環境が増加）。Compiler が有効な環境では、**`useMemo` / `useCallback` / `React.memo` の手動メモ化は原則不要** になる方向です。とはいえ既存コードや Compiler 未対応の状況では手動メモ化が現役なので、本コースでは **手動を学んだ上で、Compiler が成熟したら不要になる** という二段構えで覚えます。

本コースのスタンスは明確です。

- **今**: 手動メモ化（`useMemo`）の意味を押さえる
- **将来**: Compiler が成熟したら自動で済むようになる。その時は道具の使い方が変わる
- **読者がやるべきこと**: 手動メモ化を押さえたうえで、「Compiler がある」ことを知識として頭の端に置くだけでよい

:::

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の React + Vite + TypeScript テンプレート（<https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-react-ts>）から始められます。

### ゴール

- 大きな配列の合計を `useMemo` でメモ化する
- 別の state を変えても、依存配列にその値が入っていなければ再計算されないことを確認する

### 手順

1. StackBlitz の React + Vite（TS）テンプレートを開く
2. `src/App.tsx` を以下に書き換える
3. プレビューを確認する

### `src/App.tsx`

```tsx
import { useMemo, useState } from "react";
import "./App.css";

const BIG_NUMBERS = Array.from({ length: 10000 }, (_, i) => i + 1);

function App() {
  const [multiplier, setMultiplier] = useState(1);
  const [color, setColor] = useState<"red" | "blue">("blue");

  // 重い計算（ここでは 1 万件の合計）
  const total = useMemo(() => {
    console.log("computing total...");
    return BIG_NUMBERS.reduce((a, b) => a + b, 0) * multiplier;
  }, [multiplier]);

  return (
    <>
      <h1>useMemo のデモ</h1>

      <section className="box">
        <h2>合計</h2>
        <p style={{ color }}>total = {total.toLocaleString()}</p>
        <button onClick={() => setMultiplier((m) => m + 1)}>
          multiplier +1（合計が再計算される）
        </button>
      </section>

      <section className="box">
        <h2>無関係な state</h2>
        <p>現在の色: {color}</p>
        <button onClick={() => setColor((c) => (c === "blue" ? "red" : "blue"))}>
          色を切り替え（合計は再計算されないはず）
        </button>
      </section>
    </>
  );
}

export default App;
```

### `src/App.css`

```css
.box {
  border: 1px solid #ccc;
  padding: 12px;
  margin: 12px 0;
  border-radius: 4px;
  color: #222;
  background-color: #fff;
}

.box button {
  padding: 6px 10px;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .box {
    color: #eee;
    background-color: #202020;
    border-color: #555;
  }
}
```

### 期待出力

- 画面に「合計」と「無関係な state」の 2 つのボックス
- 初回に Console に `computing total...` が 1 回出る
- 「multiplier +1」ボタンを押すたびに Console に `computing total...` が出る（依存配列に `multiplier` が入っているため）
- 「色を切り替え」ボタンを何度押しても Console には `computing total...` が **出ない**（依存配列に `color` は入っていないため）

これが `useMemo` の効果です。`color` の変更では再レンダリングは起きますが、`total` の計算はスキップされます。

### 変える

- 依存配列を `[]` に変える → `multiplier` を増やしても `total` が更新されなくなる（バグ）。確認したら戻す
- `useMemo` を外して `const total = ... * multiplier` に戻す → 色を切り替えるだけでも `computing total...` が出るようになる。1 万件程度なら体感差はほぼないが、再計算が走っていることは Console から確認できる

### 自分で書く

- 「偶数だけを取り出す」処理を `useMemo` で書く
- ヒント: `const evens = useMemo(() => BIG_NUMBERS.filter((n) => n % 2 === 0), []);`
- `BIG_NUMBERS` は固定なので依存配列は `[]` で OK

### 「React DevTools」への前振り

「本当にスキップされているか」を React DevTools Profiler で計測する方法は、「React DevTools」で扱います。

## まとめ

- `useMemo(() => 計算, [deps])` で重い計算をメモ化できる
- 依存配列の値が変わらなければ、前回の結果を使い回す
- 依存配列を忘れると静かなバグの原因になる
- まず普通に書き、本当に遅いときだけ `useMemo` を検討する
- `useCallback` / `React.memo` / React Compiler は発展的な話題として頭の端に置く
