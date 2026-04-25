# lesson41: 関数の型

## ゴール

- 関数の **引数** と **戻り値** に型を付けられる。
- 戻り値を返さない関数の型 `void` を理解し、使い分けられる。
- 「関数そのものの型」（関数型）を書き、変数に代入できる。

## 解説

### 2 章 の関数を TS 化する

2 章 の「関数」では、数値を合計する関数を書きました。

```js
function add(a, b) {
  return a + b;
}
```

この関数は `add(1, 2)` なら `3` を返しますが、`add("1", "2")` と呼ぶと `"12"` を返します（文字列結合になる）。引数に何を渡してよいかは、呼ぶ側の「気持ち」だけが頼りです。

TS では、引数と戻り値に型を付けてこの「気持ち」を明文化できます。

### 引数と戻り値の型注釈

関数宣言で、各引数の名前のあとに `: 型名`、引数リストの閉じ括弧の後ろに `: 戻り値の型` を書きます。

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

- `a: number` / `b: number`: 引数はどちらも数値。
- `: number`: 戻り値は数値。
- 体の中で `return` する値がこの型と合っていないとエラーになる。

アロー関数でも同じ場所に書きます。

```ts
const add = (a: number, b: number): number => {
  return a + b;
};
```

### 戻り値の型は推論に任せてもよい

戻り値の型は、`return` している値から TS が自動で決めてくれます（型推論）。普段は省略することが多いです。

```ts
function add(a: number, b: number) {
  return a + b; // 戻り値は number と推論される
}
```

このレッスンでは学習目的で、あえて戻り値の型も書きます。関数がどんな型を返すのかを **意図として** 書き残すと、実装が意図とずれたときに TS が止めてくれるからです。

### 戻り値がない関数は `void`

`console.log` のように、何かを実行するだけで **値を返さない** 関数があります。この「値を返さない」を表す型が `void` です。

```ts
function greet(name: string): void {
  console.log(`Hello, ${name}`);
}

greet("Alice"); // 呼び出すだけ。戻り値は使わない
```

- `void` 型の関数を `return` 付きで書くと、`return;`（値なし）か、そもそも `return` を書かないかのどちらか。
- `void` と書いた関数の戻り値を使おうとすると、TS は警告する。

### 関数そのものの型（関数型）

「この変数には、数値 2 つを受け取って数値を返す関数が入る」と書きたい場面があります。関数の型は次のように書きます。

```ts
const add: (a: number, b: number) => number = (a, b) => a + b;
```

左辺の `: (a: number, b: number) => number` が **関数型** です。

- `(a: number, b: number)`: 引数の型。名前は何でもよいが、書く必要がある。
- `=>`: この矢印は「関数の型を表す矢印」。アロー関数の `=>` と見た目は同じだが、文法上の位置が違う。
- `number`: 戻り値の型。

左辺で型を決めてしまっているので、右辺のアロー関数では引数の型注釈を省略できます（型推論が働く）。

関数を **引数として受け取る関数** でも同じ書き方が使えます。

```ts
function twice(fn: (n: number) => number, value: number): number {
  return fn(fn(value));
}

twice((n) => n + 1, 10); // 12
```

関数型を使うと「関数を受け渡すときの契約」を型で書けるようになります。2 章 の「配列の変換」の `map` / `filter` に渡す関数も、実は TS のライブラリ側で関数型が定義されています。

### 引数の数が合わないのもエラー

TS は「宣言した数と違う数の引数で呼び出す」こともエラーにします。

```ts
function add(a: number, b: number): number {
  return a + b;
}

add(1);       // エラー: 引数が足りない
add(1, 2, 3); // エラー: 引数が多い
```

典型的なメッセージはこうなります。

```
Expected 2 arguments, but got 1.
Expected 2 arguments, but got 3.
```

省略できる引数を作る方法は「配列・ユニオン・リテラル型・オプショナル」でオプショナルプロパティと合わせて扱います。

## 演習

### 途中から始める場合

このレッスンは独立した演習です。新規 StackBlitz の TypeScript（Vanilla TS）テンプレート（<https://stackblitz.com/fork/github/stackblitz/starters/tree/main/typescript>）から始められます。

### 手順 1: `add` を TS 化する

`src/main.ts` の中身を以下に置き換える。

```ts
function add(a: number, b: number): number {
  return a + b;
}

console.log(add(1, 2));
console.log(add(10, 20));
```

#### 期待出力

Console に次のように出る。

```
3
30
```

### 手順 2: わざと間違えてエラーを見る

次のように呼び出しを変えて、それぞれのエラーを確認する。確認したら元に戻すこと。

```ts
console.log(add("1", "2"));
```

期待されるメッセージ:

```
Argument of type 'string' is not assignable to parameter of type 'number'.
```

```ts
console.log(add(1));
```

期待されるメッセージ:

```
Expected 2 arguments, but got 1.
```

```ts
function add(a: number, b: number): number {
  return `${a}${b}`; // 文字列を返してしまう
}
```

期待されるメッセージ:

```
Type 'string' is not assignable to type 'number'.
```

最後のパターンは「戻り値の型注釈が、実装のミスを捕まえてくれる」例です。

### 手順 3: `void` 型の関数

次のコードを追記して動かす。

```ts
function greet(name: string): void {
  console.log(`Hello, ${name}`);
}

greet("Alice");
greet("Bob");
```

#### 期待出力

```
Hello, Alice
Hello, Bob
```

次に、戻り値を使おうとしてみる。

```ts
const result = greet("Alice");
console.log(result.toUpperCase());
```

`result` は `void` 型なので、`.toUpperCase()` を呼ぶと次のようなメッセージが出る。

```
Property 'toUpperCase' does not exist on type 'void'.
```

「`void` 型に `toUpperCase` というプロパティは存在しない」という意味。`void` は「値が無いことを表す型」なので、そもそも値として使ってはいけない、と TS が教えてくれている。

### 手順 4: 関数型を書いてみる

次のコードを書く。

```ts
const multiply: (a: number, b: number) => number = (a, b) => a * b;

function twice(fn: (n: number) => number, value: number): number {
  return fn(fn(value));
}

console.log(multiply(3, 4));
console.log(twice((n) => n + 1, 10));
console.log(twice((n) => n * 2, 5));
```

#### 期待出力

```
12
12
20
```

- `multiply(3, 4)` は `12`。
- `twice((n) => n + 1, 10)` は「10 に 1 を足す」を 2 回で `12`。
- `twice((n) => n * 2, 5)` は「5 を 2 倍」を 2 回で `20`。

### 変えてみる

`twice` に、数値ではなく文字列を返す関数を渡してみる。

```ts
twice((n) => `number: ${n}`, 10);
```

期待されるメッセージ:

```
Type 'string' is not assignable to type 'number'.
```

`twice` の引数 `fn` は `(n: number) => number` 型なので、文字列を返す関数は渡せない、と教えてくれる。

### 自分で書く

次の条件を満たす関数を何も見ずに書く。

1. `subtract(a: number, b: number): number` — 引き算して返す関数。
2. `printUser(name: string, age: number): void` — `"Alice (20)"` のように Console に出すだけの関数。
3. 関数型 `(s: string) => string` を持つ変数 `shout` に、「文字列を受け取って大文字にして `!` を足して返す関数」を代入する。

書けたら、それぞれを 1 回ずつ呼び出して期待通りに動くことを確認する。

## まとめ

- 関数の引数と戻り値に型を付けると、呼び出し側と実装の両方のミスを TS が事前に止めてくれる。
- 値を返さない関数は `void` を戻り値の型として使う。`void` の戻り値は値として使えない。
- 関数そのものの型は `(引数名: 型) => 戻り値の型` で書ける。関数を受け渡すときの「契約」になる。
- 別のレッスンで、複数のプロパティをまとめた **オブジェクト型** と、型に名前を付ける `type` エイリアスを学ぶ。2 章 の TODO の 1 件を表す `Todo` 型を作っていく。
