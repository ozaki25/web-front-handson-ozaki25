# lesson26: TypeScript ってなに？

## ゴール

- TypeScript（以下 TS）が何を解決する言語なのか、JavaScript（以下 JS）との違いを自分の言葉で説明できる。
- プリミティブ型（`string` / `number` / `boolean`）の変数に **型注釈** を付けられる。
- わざと間違った値を入れて、エディタの赤線と `tsc` の型エラーを自分の目で確認できる。

## 解説

### この章で使う環境

この章は StackBlitz の TypeScript（Vanilla）テンプレートで進めます。「Create new project」→「Vanilla」グループの中から **TypeScript** と書かれたテンプレートを選んでください（lesson01 で使った HTML / CSS / JS 版ではなく、TypeScript 版）。

テンプレートには最初から `index.html` と `src/main.ts` が用意されています。以降の章 3 のレッスンでは、この `main.ts` を書き換えていきます。

### JS だけだと何が困るのか

章 2 までに書いてきた JS では、変数にどんな値でも入れられました。

```js
let age = 20;
age = "二十歳"; // 何の警告もなく通る
```

小さなファイルなら困りません。しかし人数やファイルが増え、関数が関数を呼ぶようになると、次のような事故が起き始めます。

- 数値を期待している関数に、うっかり文字列を渡してしまう。
- オブジェクトのプロパティ名を typo したのに、そのまま `undefined` が流れて画面が壊れる。
- 自分以外の人が書いた関数に、何を渡せばよいか分からない。

これらは **実行してみるまで分からない** 種類のバグです。しかもブラウザで動かしてはじめて「`undefined is not a function`」のようなメッセージに出会うので、原因の追跡に時間がかかります。

### TS は「書いた瞬間にチェックしてくれる JS」

TypeScript は、JavaScript に **型（かた）** の仕組みを足した言語です。値や変数に「これは文字列」「これは数値」というラベルを付けておくと、コンパイラ（`tsc`）やエディタが、書いた直後に「その操作はラベルに合っていない」と教えてくれます。

- 型のチェックは **実行する前** に行われる。これを **静的型付け** と呼ぶ。
- 型のチェックを通った TS コードは、最終的に JS に変換（コンパイル）されてブラウザで動く。ブラウザは TS を直接は読めない。
- 型の情報はコンパイル後の JS には残らない。**実行時の速度は JS と変わらない**。

ざっくり言うと、TS は「書いた直後に typo と型の食い違いを指摘してくれる JS」です。

### 型注釈の書き方

変数を宣言するときに、変数名の後ろに `: 型名` を付けます。これを **型注釈（type annotation）** と呼びます。

```ts
const name: string = "Alice";
const age: number = 20;
const isAdmin: boolean = false;
```

- `string`: 文字列（`"hello"`、`` `template` ``、`'single'` すべて含む）
- `number`: 数値（整数も小数も区別しない）
- `boolean`: 真偽値（`true` / `false`）

型注釈は **変数名の直後にコロン**、そのあとに型名、という順番です。JS の代入 (`=`) とは位置が違うので混同しないようにします。

### 書かなくても型は付く（型推論）

毎回型を書くのは面倒です。TS は右辺を見て型を自動で決めてくれます。これを **型推論（type inference）** と呼びます。

```ts
const name = "Alice"; // name は string 型と推論される
const age = 20;        // age は number 型と推論される
```

型推論で十分なときは型注釈を省略するのが普通です。このレッスンでは学習目的であえて型注釈を書き、間違った値を入れたらどうなるかを体験します。

### エラーの出方は 2 段階

型が合っていないとき、TS は次の 2 か所でエラーを教えてくれます。

1. **エディタ上の赤い波線**: StackBlitz のコード画面で該当箇所に赤線が出る。マウスを乗せるとメッセージが出る。
2. **`tsc` のコンパイルエラー**: ターミナルで `tsc` を実行する（テンプレートでは通常自動で走る）と、ファイル名・行番号付きでエラーが一覧表示される。

どちらも同じ内容です。エディタの赤線は「書いている最中に教えてくれる」、`tsc` は「保存 / ビルドのタイミングで全ファイルまとめて確認してくれる」くらいの違いです。

典型的なエラーメッセージは例えばこうなります。

```
Type 'string' is not assignable to type 'number'.
```

「文字列型は数値型には代入できない」という意味です。実際に出してみるのは演習で行います。

## 演習

### 手順 1: テンプレートを開く

1. <https://stackblitz.com/> を開き、「Create new project」から **TypeScript**（Vanilla TS）テンプレートを選ぶ。
2. `src/main.ts` を開く。中身はサンプルが入っているので、すべて消す。
3. プレビュー横のコンソールも見えるようにしておく（DevTools の Console、または StackBlitz 下部のターミナル）。

### 手順 2: 型注釈付きの変数を書く

`src/main.ts` の中身を以下に置き換える。

```ts
const name: string = "Alice";
const age: number = 20;
const isAdmin: boolean = false;

console.log(`${name} は ${age} 歳です。管理者: ${isAdmin}`);
```

保存するとプレビューが再読み込みされる。ブラウザの DevTools の Console に次のように出れば成功。

```
Alice は 20 歳です。管理者: false
```

### 手順 3: わざと型を間違えてエラーを見る

次のコードに書き換える。

```ts
const name: string = "Alice";
const age: number = "二十歳"; // わざと文字列を入れる
const isAdmin: boolean = false;

console.log(`${name} は ${age} 歳です。管理者: ${isAdmin}`);
```

#### 期待出力

- `"二十歳"` の下に **赤い波線** が引かれる。
- マウスを乗せると次のようなメッセージが出る。

```
Type 'string' is not assignable to type 'number'.
```

- StackBlitz 下部のターミナル（または Problems タブ）にも同じエラーが出る。

これが **静的型付けが実行前にエラーを教えてくれる** 体験です。章 2 の JS ならこのコードはそのまま実行され、`age` は文字列の `"二十歳"` として流れていき、数値として扱う場面で初めて壊れました。TS は書いた瞬間に止めてくれます。

### 手順 4: 変えてみる

次の 3 つをそれぞれ試し、どんなメッセージが出るか見比べる。エラーを確認したら元に戻すこと。

1. `const isAdmin: boolean = "yes";`
2. `const age: number = true;`
3. `const name: string = 123;`

期待される代表的なメッセージは次の通り。

```
Type 'string' is not assignable to type 'boolean'.
Type 'boolean' is not assignable to type 'number'.
Type 'number' is not assignable to type 'string'.
```

型名のところだけ入れ替わっているのが分かる。

### 手順 5: 型推論に任せてみる

型注釈を消しても、右辺から型が決まることを確認する。

```ts
const name = "Alice";
const age = 20;
const isAdmin = false;

age = "二十歳"; // ここで赤線が出るはず
```

`age` に型注釈は書いていないが、`20` が入っていたので TS は `number` 型と推論している。そこに文字列を入れようとすると、やはり次のようなメッセージが出る。

```
Type 'string' is not assignable to type 'number'.
```

（`const` なので「そもそも再代入できない」というエラーも同時に出る場合がある。その場合は `let age = 20;` に変えてから試す。）

### 自分で書く

何も見ずに、次の条件を満たすコードを `src/main.ts` に書く。

- `string` 型の変数 `city` に自分が住んでいる都市名を入れる。
- `number` 型の変数 `population` に適当な人口を入れる。
- `boolean` 型の変数 `hasSea` に「海に面しているか」を入れる。
- 3 つをテンプレートリテラルで繋げて `console.log` する。

書き終わったら、わざとどれか 1 つの型注釈と値を食い違わせ、どんなエラーメッセージが出るかを確認してから元に戻す。

## まとめ

- TypeScript は JS に型を足した言語で、**実行する前に** 型の食い違いを教えてくれる。
- 型注釈は `const 変数名: 型名 = 値` の形で書く。プリミティブ型は `string` / `number` / `boolean` の 3 つから。
- 右辺から型が自動で決まる **型推論** もあるので、実務では型注釈を省略する場面も多い。
- 型が合わないと、エディタの赤線と `tsc` の両方が `Type 'X' is not assignable to type 'Y'.` のような形で教えてくれる。
- 次のレッスンでは、関数の引数と戻り値に型を付ける。章 2 で書いた関数を TS 化していく。
