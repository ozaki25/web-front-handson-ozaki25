import type { Quiz } from "../types";

export const chapter3: Quiz[] = [
  {
    id: "q088",
    lesson: "lesson41",
    difficulty: "easy",
    question: "TypeScript が JavaScript に追加する主な機能はなんですか？",
    choices: [
      "静的型付けにより、実行前にコードの型エラーを検出できる",
      "JavaScript より実行速度が速い",
      "ブラウザが TypeScript を直接実行できる",
      "データベースへの直接接続機能",
    ],
    answer: 0,
    explanation:
      "TypeScript は JavaScript に型の仕組みを追加した言語です。静的型付けにより、実行前（コンパイル時）に型の食い違いを検出できます。最終的に JavaScript にコンパイルして実行します。",
  },
  {
    id: "q089",
    lesson: "lesson41",
    difficulty: "normal",
    question: "TypeScript の型注釈（type annotation）の書き方として正しいものはどれですか？",
    choices: [
      "変数名の後ろに : 型名 を付ける（例: const age: number = 20）",
      "変数名の前に 型名 を付ける（例: number const age = 20）",
      "代入演算子の前に <型名> を付ける（例: const age <number> = 20）",
      "変数名の後ろに :: 型名 を付ける（例: const age:: number = 20）",
    ],
    answer: 0,
    explanation:
      "型注釈は変数名の後ろに ': 型名' を書きます。const age: number = 20 のように書くと、age に文字列などを代入しようとすると型エラーになります。",
  },
  {
    id: "q090",
    lesson: "lesson41",
    difficulty: "normal",
    question: "TypeScript のコンパイルについて正しく説明しているものはどれですか？",
    choices: [
      "TypeScript は最終的に JavaScript に変換（コンパイル）される。型情報は JS に残らない",
      "TypeScript はブラウザが直接解釈するため、コンパイルは不要",
      "コンパイルすると型情報が実行時チェックのコードとして JS に埋め込まれる",
      "TypeScript のコンパイルは実行速度を向上させる最適化を行う",
    ],
    answer: 0,
    explanation:
      "TypeScript は tsc コンパイラで JavaScript に変換されます。型注釈はコンパイル後の JS には残りません。型チェックはコンパイル時（実行前）にのみ行われ、実行時のオーバーヘッドはゼロです。",
  },
  {
    id: "q091",
    lesson: "lesson42",
    difficulty: "easy",
    question: "値を返さない関数の戻り値型として使う型はどれですか？",
    choices: ["void", "null", "undefined", "never"],
    answer: 0,
    explanation:
      "void は「値を返さない」関数の戻り値型です。console.log を呼ぶだけで何も return しない関数に使います。never は「絶対に到達しない」ことを表す型で、意味が異なります。",
  },
  {
    id: "q092",
    lesson: "lesson42",
    difficulty: "normal",
    question: "関数 function add(a: number, b: number): number の型注釈が意味することはなんですか？",
    choices: [
      "引数 a と b は数値型で、戻り値も数値型でなければならない",
      "a と b は任意の型で、戻り値が数値型でなければならない",
      "引数は 2 つ、戻り値の型は自動推論される",
      "a と b は文字列型（number は変数名）",
    ],
    answer: 0,
    explanation:
      "引数名の後ろの : number が引数の型、閉じ括弧の後ろの : number が戻り値の型を指定します。文字列を渡したり、文字列を return しようとすると型エラーになります。",
  },
  {
    id: "q093",
    lesson: "lesson43",
    difficulty: "normal",
    question: "TypeScript で type エイリアスを使ってオブジェクト型に名前を付けるとどんなメリットがありますか？",
    choices: [
      "同じ型を複数の場所で再利用でき、型定義の変更を一箇所で管理できる",
      "型チェックが厳しくなりエラーが減る",
      "コンパイルが速くなる",
      "JavaScript との互換性が失われる",
    ],
    answer: 0,
    explanation:
      "type User = { name: string; age: number } のように名前を付けると、変数や関数引数に : User と書くだけで同じ型を使い回せます。型を変更する場合も type 定義を 1 箇所直すだけで済みます。",
  },
  {
    id: "q094",
    lesson: "lesson43",
    difficulty: "normal",
    question: "TypeScript のオブジェクト型リテラルでプロパティを区切る記号はどれですか？",
    choices: [
      "セミコロン（;）が慣例（カンマも動くが TS では ; を使う）",
      "カンマ（,）のみ",
      "パイプ（|）",
      "コロン（:）",
    ],
    answer: 0,
    explanation:
      "TypeScript のオブジェクト型リテラル（{ name: string; age: number }）ではプロパティの区切りにセミコロン（;）を使うのが慣例です。なお値のオブジェクトリテラル（{ name: 'Alice', age: 20 }）の区切りはカンマ（,）です。",
  },
  {
    id: "q095",
    lesson: "lesson44",
    difficulty: "normal",
    question: "TypeScript の interface と type の大きな違いはなんですか？",
    choices: [
      "interface は extends で継承・拡張できる。type はユニオン型・インターセクション型など多様な型表現が得意",
      "interface はオブジェクト型を作れない",
      "type は再利用できないが interface は再利用できる",
      "interface の方が常に実行速度が速い",
    ],
    answer: 0,
    explanation:
      "interface は extends による継承が得意で、クラスの implements にも使えます。type はユニオン型（A | B）やインターセクション型（A & B）など幅広い型表現が書けます。本コースでは type を基本に使います。",
  },
  {
    id: "q096",
    lesson: "lesson45",
    difficulty: "easy",
    question: "TypeScript で「文字列または数値」を受け入れる型の書き方はどれですか？",
    choices: [
      "string | number",
      "string & number",
      "string + number",
      "Union<string, number>",
    ],
    answer: 0,
    explanation:
      "パイプ（|）で複数の型をつなぐとユニオン型になります。string | number は「文字列または数値」を表します。どちらの型でも代入できますが、共通して使えるメソッド以外は使えません。",
  },
  {
    id: "q097",
    lesson: "lesson45",
    difficulty: "normal",
    question: "型 status: 'open' | 'done' はどんな意味ですか？",
    choices: [
      "文字列 'open' または 'done' のどちらかしか代入できないリテラル型",
      "オブジェクトを 2 つ持つ配列型",
      "status が省略可能（optional）であることを示す",
      "開発環境と本番環境を切り替える型",
    ],
    answer: 0,
    explanation:
      "リテラル型は特定の値のみを許す型です。'open' | 'done' は文字列リテラル型のユニオンで、他の文字列（'pending' など）を代入しようとすると型エラーになります。",
  },
  {
    id: "q098",
    lesson: "lesson45",
    difficulty: "normal",
    question: "オブジェクト型で省略可能なプロパティを表す書き方はどれですか？",
    choices: [
      "プロパティ名の後ろに ? を付ける（例: memo?: string）",
      "型の後ろに | undefined を付ける（例: memo: string | undefined のみ）",
      "プロパティ名の前に optional を付ける（例: optional memo: string）",
      "デフォルト値を設定する（例: memo = ''）",
    ],
    answer: 0,
    explanation:
      "?: を付けると省略可能なプロパティになります。memo?: string は「存在する場合は string、存在しない場合は undefined」を意味します。なお memo: string | undefined も似ていますが、?: は「キー自体が存在しなくてもよい」のに対し後者は「キーは存在するが値が undefined でもよい」という違いがあります。",
  },
  {
    id: "q099",
    lesson: "lesson46",
    difficulty: "normal",
    question: "TypeScript で any を使うことの問題点はなんですか？",
    choices: [
      "any を付けた変数はすべての型チェックが無効化され、実行時エラーを事前に検出できなくなる",
      "any を使うとコンパイルエラーになる",
      "any はプリミティブ型にしか使えない",
      "any を使うとブラウザでの実行速度が下がる",
    ],
    answer: 0,
    explanation:
      "any はどんな値でも受け入れ、何でも呼び出せます。しかし型チェックが無効になるため、実行時エラーを防ぐという TypeScript の恩恵がなくなります。代わりに unknown を使い、型を絞り込んでから使うのが安全です。",
  },
  {
    id: "q100",
    lesson: "lesson46",
    difficulty: "hard",
    question: "unknown 型の変数をそのまま使おうとするとどうなりますか？",
    choices: [
      "型エラーになる。使う前に typeof などで型を絞り込む必要がある",
      "any と同じく何でも使える",
      "null として扱われる",
      "コンパイル時に自動で型推論される",
    ],
    answer: 0,
    explanation:
      "unknown はどんな値でも受け入れますが、そのままでは何もできません。プロパティアクセスやメソッド呼び出しはすべてエラーになります。typeof や instanceof で型を絞り込んでから使います。",
  },
  {
    id: "q101",
    lesson: "lesson47",
    difficulty: "normal",
    question: "TypeScript の型ガードとはなんですか？",
    choices: [
      "条件分岐の中で変数の型を絞り込むコードの仕組み",
      "型エラーを無視するキャスト演算子",
      "コンパイル後のコードに型チェックを埋め込む仕組み",
      "ジェネリクスの型パラメータを固定する仕組み",
    ],
    answer: 0,
    explanation:
      "型ガードは typeof / in / instanceof などを使った条件分岐によって、その分岐内での変数の型を絞り込む仕組みです。TypeScript がコードを解析して絞り込まれた型として扱います。",
  },
  {
    id: "q102",
    lesson: "lesson47",
    difficulty: "normal",
    question: "ユーザー定義型ガード関数の戻り値型の書き方として正しいものはどれですか？",
    choices: [
      "引数名 is 型名（例: x is Todo）",
      "typeof 型名（例: typeof Todo）",
      "boolean",
      "asserts 型名（例: asserts Todo）",
    ],
    answer: 0,
    explanation:
      "ユーザー定義型ガードは戻り値型に「引数名 is 型名」を書きます。function isTodo(x: unknown): x is Todo のように書くと、この関数が true を返したブロック内では x が Todo 型として扱われます。",
  },
  {
    id: "q103",
    lesson: "lesson48",
    difficulty: "normal",
    question: "判別共用体（discriminated union）の特徴はなんですか？",
    choices: [
      "すべてのケースに共通の「種類を表すリテラル型のプロパティ」を持ち、switch 文で自動的に型が絞り込まれる",
      "複数の型を & で結合した型",
      "配列の各要素が異なる型を持つタプル型",
      "型チェックを完全に無効化する特殊な型",
    ],
    answer: 0,
    explanation:
      "判別共用体は kind: 'circle' | kind: 'square' のような「種類を表す共通プロパティ（判別子）」を全ケースに持ちます。switch(shape.kind) で分岐すると TypeScript が自動的に型を絞り込んでくれます。",
  },
  {
    id: "q104",
    lesson: "lesson48",
    difficulty: "hard",
    question: "判別共用体で switch 文を使うとき、未処理のケースを検出する方法はなんですか？",
    choices: [
      "default ケースで never 型に代入し、新しいケースが追加されると型エラーになる",
      "throw new Error() を書いておく",
      "TypeScript が自動で警告を出す",
      "eslint-plugin-typescript で lint する",
    ],
    answer: 0,
    explanation:
      "全ケースを switch で処理した後に default で変数を never 型の変数に代入すると、新しいケースが union に追加されたとき「X は never に代入できない」という型エラーが出ます。これが判別共用体の網羅性チェックです。",
  },
  {
    id: "q105",
    lesson: "lesson49",
    difficulty: "normal",
    question: "ジェネリクスの型パラメータ <T> を使う目的はなんですか？",
    choices: [
      "「どんな型でも動く」汎用的な関数や型を、型安全を保ちながら作るため",
      "型チェックを無効化して any のように使うため",
      "関数の引数を省略可能にするため",
      "再帰的なデータ構造を定義するため",
    ],
    answer: 0,
    explanation:
      "ジェネリクスは「型を引数として受け取る」仕組みです。function first<T>(arr: T[]): T | undefined のように書くと、数値配列でも文字列配列でも同じ関数が使えます。呼び出し時に型推論で T が決まります。",
  },
  {
    id: "q106",
    lesson: "lesson49",
    difficulty: "normal",
    question: "first([1, 2, 3]) を呼んだとき、型パラメータ T はどの型に推論されますか？",
    choices: [
      "number（渡された配列の要素型から推論される）",
      "any（明示していないため不定）",
      "unknown（安全のため自動的に unknown になる）",
      "number[] （配列の型全体）",
    ],
    answer: 0,
    explanation:
      "TypeScript は引数 [1, 2, 3] から要素の型が number だと推論し、T = number と決定します。明示的に first<number>([1, 2, 3]) と書かなくても型推論が働きます。",
  },
  {
    id: "q107",
    lesson: "lesson50",
    difficulty: "normal",
    question: "TypeScript の Partial<T> Utility Type の効果はなんですか？",
    choices: [
      "T のすべてのプロパティを省略可能（?:）にした新しい型を作る",
      "T から特定のプロパティだけを取り出した型を作る",
      "T のプロパティをすべて readonly にした型を作る",
      "T のプロパティをすべて必須にした型を作る",
    ],
    answer: 0,
    explanation:
      "Partial<User> は User の全プロパティを optional（?:）にします。フォームの「編集中の下書き」や「更新時に変更したフィールドだけ送る」場面で便利です。",
  },
  {
    id: "q108",
    lesson: "lesson50",
    difficulty: "normal",
    question: "Pick<Todo, 'id' | 'text'> の結果はどんな型ですか？",
    choices: [
      "Todo から id と text だけを取り出した型",
      "Todo から id と text を削除した型",
      "Todo の id と text を省略可能にした型",
      "id と text という 2 つのプロパティを持つ新しい Todo 型",
    ],
    answer: 0,
    explanation:
      "Pick<T, K> は型 T から K に指定したキーのプロパティだけを取り出した型を作ります。一覧表示に必要な最小限のプロパティだけの型を派生させるときに使います。",
  },
  {
    id: "q109",
    lesson: "lesson51",
    difficulty: "normal",
    question: "tsconfig.json の \"strict\": true はどんな設定を有効にしますか？",
    choices: [
      "strictNullChecks など複数の厳格チェックをまとめて有効にする",
      "コンパイルエラーを無視して強制的に JS を出力する",
      "型注釈を必須にして、型推論を無効にする",
      "すべての変数に明示的な型注釈を要求する",
    ],
    answer: 0,
    explanation:
      "\"strict\": true は strictNullChecks（null/undefined の扱いを厳格化）や noImplicitAny（暗黙の any を禁止）などを一括で有効にします。新規プロジェクトでは常に true にするのが推奨です。",
  },
  {
    id: "q110",
    lesson: "lesson51",
    difficulty: "hard",
    question: "tsconfig.json の moduleResolution: 'bundler' はどんなときに使いますか？",
    choices: [
      "Vite / esbuild のようなバンドラーを使う環境で、バンドラーの解決アルゴリズムに合わせるため",
      "Node.js で直接 TypeScript を実行する最新の設定",
      "CommonJS（require）を使う Node.js 環境向けの設定",
      "モジュールを使わない（グローバルスクリプト）環境向けの設定",
    ],
    answer: 0,
    explanation:
      "moduleResolution: 'bundler' は Vite / esbuild などのバンドラーが拡張子を自動解決する動作に合わせた設定です。フロントエンドプロジェクトで推奨されます。Node.js のネイティブ実行には 'node16' や 'nodenext' が適切です。",
  },
  {
    id: "q111",
    lesson: "lesson51",
    difficulty: "hard",
    question: "tsconfig.json の verbatimModuleSyntax オプションを有効にすると何が制約されますか？",
    choices: [
      "型のみの import は import type を使って明示する必要がある",
      "すべての import を CommonJS の require() に書き換える必要がある",
      "型注釈を書かなくてよくなる",
      "外部ライブラリの型定義を自動でインストールする",
    ],
    answer: 0,
    explanation:
      "verbatimModuleSyntax は型だけを import するときに import type を使うよう強制します。これにより、実行時には不要な型 import が JS 出力に残らないことが保証されます。Node.js ネイティブ TypeScript 実行環境で推奨されます。",
  },
];
