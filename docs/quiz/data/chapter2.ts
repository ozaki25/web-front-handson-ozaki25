import type { Quiz } from "../types";

export const chapter2: Quiz[] = [
  {
    id: "q038",
    lesson: "lesson18",
    difficulty: "easy",
    question: "JS を HTML に読み込む際に推奨される書き方はどれですか？",
    choices: [
      "<script defer src='./script.js'></script> を <head> に書く",
      "<script src='./script.js'></script> を <head> に書く",
      "<script src='./script.js'></script> を <body> の中ほどに書く",
      "<link rel='script' href='./script.js'> を <head> に書く",
    ],
    answer: 0,
    explanation:
      "defer 属性を付けると「HTML をすべて読み終えてから JS を実行」します。<head> に書いても DOM が揃った後に実行されるため、querySelector が null を返す事故を防げます。",
  },
  {
    id: "q039",
    lesson: "lesson18",
    difficulty: "easy",
    question: "console.log の役割はなんですか？",
    choices: [
      "ブラウザの DevTools Console パネルに値を出力する",
      "画面にテキストを表示する",
      "HTML 要素を作成する",
      "変数を削除する",
    ],
    answer: 0,
    explanation:
      "console.log は DevTools の Console パネルにログを表示します。画面には出力されませんが、開発中の確認に最も使う命令です。",
  },
  {
    id: "q040",
    lesson: "lesson18",
    difficulty: "normal",
    question: "let と const の違いを正しく説明しているものはどれですか？",
    choices: [
      "const は再代入禁止、let は再代入可能",
      "let は再代入禁止、const は再代入可能",
      "どちらも再代入できるが、const はブロックスコープを持たない",
      "let はグローバル変数、const はローカル変数を宣言する",
    ],
    answer: 0,
    explanation:
      "const は宣言後に再代入できません。let は再代入できます。両者ともブロックスコープを持ちます。基本は const を使い、再代入が必要なときだけ let を使うのが推奨スタイルです。",
  },
  {
    id: "q041",
    lesson: "lesson19",
    difficulty: "easy",
    question: "JavaScript でテンプレートリテラルを使うとき、使う記号はどれですか？",
    choices: [
      "バッククォート（`）で囲み、${変数名} で変数を埋め込む",
      "シングルクォート（'）で囲み、{変数名} で変数を埋め込む",
      "ダブルクォート（\"）で囲み、%変数名 で変数を埋め込む",
      "スラッシュ（/）で囲み、${変数名} で変数を埋め込む",
    ],
    answer: 0,
    explanation:
      "テンプレートリテラルはバッククォート（`）で囲み、`Hello, ${name}` のように ${} の中に式を書けます。文字列の連結より読みやすいのが特徴です。",
  },
  {
    id: "q042",
    lesson: "lesson19",
    difficulty: "normal",
    question: "null と undefined の違いを正しく説明しているものはどれですか？",
    choices: [
      "null はプログラマが明示的に「空」を入れたもの、undefined は値がまだ入っていない初期状態",
      "undefined はプログラマが明示的に「空」を入れたもの、null は初期状態",
      "両者に意味の違いはなく、どちらも同じ「空」を表す",
      "null は数値型の空、undefined は文字列型の空",
    ],
    answer: 0,
    explanation:
      "null は「意図的に空にした」という意味を持ちます。undefined は変数を宣言しただけで値を入れていないときに自動で付く初期状態です。",
  },
  {
    id: "q043",
    lesson: "lesson20",
    difficulty: "easy",
    question: "JavaScript で「等しい」を厳密に比較する演算子はどれですか？",
    choices: ["===", "==", "=", "!="],
    answer: 0,
    explanation:
      "=== は型も値も一致するときだけ true を返す厳密等値演算子です。== は型変換を行うため、意図しないマッチが起きることがあり、基本は === を使います。",
  },
  {
    id: "q044",
    lesson: "lesson20",
    difficulty: "normal",
    question: "「age が 20 以上かつ 60 未満」を正しく書いた条件式はどれですか？",
    choices: [
      "age >= 20 && age < 60",
      "age >= 20 || age < 60",
      "20 <= age <= 60",
      "age between 20 and 60",
    ],
    answer: 0,
    explanation:
      "&& は両方の条件が true のときに true を返す論理 AND です。「以上かつ未満」のように複数の条件を同時に満たすか調べるときに使います。",
  },
  {
    id: "q045",
    lesson: "lesson21",
    difficulty: "easy",
    question: "配列 const fruits = ['apple', 'banana', 'cherry'] の 1 番目の要素を取得するコードはどれですか？",
    choices: ["fruits[0]", "fruits[1]", "fruits.first", "fruits.get(1)"],
    answer: 0,
    explanation:
      "配列のインデックスは 0 から始まります。fruits[0] が最初の要素 'apple' を返します。fruits[1] は 2 番目の 'banana' です。",
  },
  {
    id: "q046",
    lesson: "lesson21",
    difficulty: "easy",
    question: "配列の末尾に要素を追加するメソッドはどれですか？",
    choices: ["push()", "pop()", "shift()", "unshift()"],
    answer: 0,
    explanation:
      "push() は配列の末尾に要素を追加します。pop() は末尾の要素を取り出して削除します。shift() は先頭削除、unshift() は先頭追加です。",
  },
  {
    id: "q047",
    lesson: "lesson22",
    difficulty: "easy",
    question: "配列のすべての要素を順に処理するための for...of の書き方として正しいものはどれですか？",
    choices: [
      "for (const item of array) { ... }",
      "for (item in array) { ... }",
      "array.forEach(item) { ... }",
      "for (let i = 0; i < array; i++) { ... }",
    ],
    answer: 0,
    explanation:
      "for...of は「各要素をそのまま受け取る」書き方です。const item of array と書くと、ループのたびに item に次の要素が入ります。",
  },
  {
    id: "q048",
    lesson: "lesson22",
    difficulty: "normal",
    question: "for...of と for...in の違いを正しく説明しているものはどれですか？",
    choices: [
      "for...of は要素の値を取り出す。for...in はオブジェクトのキー（プロパティ名）を列挙する",
      "for...of はオブジェクトに使う。for...in は配列に使う",
      "どちらも同じで使い分けは不要",
      "for...in のほうが高速なため、配列にも for...in を使うべき",
    ],
    answer: 0,
    explanation:
      "for...of は配列などの iterable から値を取り出します。for...in はオブジェクトの列挙可能なキーを取り出します。配列に for...in を使うと添字（文字列型）が返り意図しない動作になるため、配列には for...of が適切です。",
  },
  {
    id: "q049",
    lesson: "lesson23",
    difficulty: "easy",
    question: "function 宣言でアロー関数と同じ動作をする add 関数を書くと、どれになりますか？",
    choices: [
      "function add(a, b) { return a + b; }",
      "add = function(a, b) => a + b;",
      "const add = (a, b) { a + b };",
      "def add(a, b): return a + b",
    ],
    answer: 0,
    explanation:
      "function キーワードで宣言し、引数リストと return 文を書きます。アロー関数での同等の記述は const add = (a, b) => a + b; です。",
  },
  {
    id: "q050",
    lesson: "lesson23",
    difficulty: "normal",
    question: "アロー関数 const double = (n) => n * 2; と等価な function 宣言はどれですか？",
    choices: [
      "function double(n) { return n * 2; }",
      "function double(n) { n * 2; }",
      "function double => n * 2 {}",
      "const double = function n * 2;",
    ],
    answer: 0,
    explanation:
      "アロー関数の (n) => n * 2 は「n を受け取り n * 2 を return する関数」です。波かっこなしの場合は式の値が自動で return されます。",
  },
  {
    id: "q051",
    lesson: "lesson24",
    difficulty: "normal",
    question: "let と const で宣言した変数はブロックスコープを持ちます。これはどういう意味ですか？",
    choices: [
      "{ } で囲まれたブロックの外からは変数を参照できない",
      "変数をどこでも参照できる（グローバルスコープと同じ）",
      "関数の中でしか変数を宣言できない",
      "変数の値を変更できない",
    ],
    answer: 0,
    explanation:
      "ブロックスコープとは「{ } の中でのみ有効」な範囲のことです。ブロックの外に出るとその変数にはアクセスできず ReferenceError になります。",
  },
  {
    id: "q052",
    lesson: "lesson24",
    difficulty: "hard",
    question: "クロージャとはどんな仕組みですか？",
    choices: [
      "関数が作られた時点のスコープの変数を「閉じ込めて」記憶し続ける仕組み",
      "関数を呼ぶたびに変数が初期化される仕組み",
      "複数の関数が同じグローバル変数を共有する仕組み",
      "変数をブロックの外に持ち出す仕組み",
    ],
    answer: 0,
    explanation:
      "クロージャは、関数が宣言されたスコープの変数をキャプチャして保持する機能です。makeCounter() で count を内部に持ち、呼び出すたびにカウントアップする例が典型です。",
  },
  {
    id: "q053",
    lesson: "lesson24",
    difficulty: "hard",
    question: "makeCounter() を 2 回呼んで counterA と counterB を作ると、2 つのカウンターは独立して動きます。この理由はなんですか？",
    choices: [
      "呼び出すたびに新しいスコープが作られ、それぞれが独立した count を持つから",
      "JavaScript は関数を呼ぶたびにすべての変数をリセットするから",
      "const で宣言した変数は自動でコピーされるから",
      "makeCounter は副作用のない純粋関数だから",
    ],
    answer: 0,
    explanation:
      "makeCounter を呼ぶたびに新しい実行コンテキストと新しい count が作られます。counterA と counterB はそれぞれ別の count をクロージャで閉じ込めているため独立して動作します。",
  },
  {
    id: "q054",
    lesson: "lesson25",
    difficulty: "easy",
    question: "const user = { name: 'Alice', age: 20 } のとき、name の値を取り出すドット記法はどれですか？",
    choices: ["user.name", "user[name]", "user->name", "user::name"],
    answer: 0,
    explanation:
      "オブジェクトのプロパティはドット記法（obj.key）で読み書きできます。ブラケット記法（obj['key']）も同じですが、変数をキーに使うときに便利です。",
  },
  {
    id: "q055",
    lesson: "lesson25",
    difficulty: "normal",
    question: "オブジェクトのすべてのキーを配列で取得するメソッドはどれですか？",
    choices: ["Object.keys(obj)", "obj.keys()", "Object.getKeys(obj)", "obj.getProperties()"],
    answer: 0,
    explanation:
      "Object.keys(obj) はオブジェクトの列挙可能なキー（プロパティ名）の配列を返します。値が欲しい場合は Object.values()、キーと値のペアが欲しい場合は Object.entries() を使います。",
  },
  {
    id: "q056",
    lesson: "lesson26",
    difficulty: "normal",
    question: "オブジェクトの分割代入 const { name, age } = user; はどの操作に相当しますか？",
    choices: [
      "user.name と user.age を、それぞれ name と age という変数に取り出す",
      "user オブジェクトを 2 つのオブジェクトに分割する",
      "name と age という新しいプロパティを user に追加する",
      "user の中身をすべて削除する",
    ],
    answer: 0,
    explanation:
      "分割代入（destructuring）は、オブジェクトや配列から値を取り出して変数に代入する構文です。const { name, age } = user は user.name を name に、user.age を age にまとめて代入します。",
  },
  {
    id: "q057",
    lesson: "lesson26",
    difficulty: "normal",
    question: "スプレッド構文 { ...user, age: 21 } は何をするコードですか？",
    choices: [
      "user のすべてのプロパティをコピーした新しいオブジェクトを作り、age だけ 21 に上書きする",
      "user の age プロパティを直接 21 に変更する（元の user も変わる）",
      "user と { age: 21 } を並べた配列を作る",
      "user から age プロパティを削除する",
    ],
    answer: 0,
    explanation:
      "スプレッド {...user} は user のすべてのプロパティを展開します。後ろに age: 21 を書くと、同名プロパティは後者が上書きします。元の user は変更されません（イミュータブルな更新）。",
  },
  {
    id: "q058",
    lesson: "lesson26",
    difficulty: "normal",
    question: "配列の分割代入 const [first, ...rest] = colors; における ...rest はどんな値になりますか？",
    choices: [
      "first 以外の残りの要素をすべて含む配列",
      "colors 配列全体のコピー",
      "colors 配列の最後の要素のみ",
      "undefined",
    ],
    answer: 0,
    explanation:
      "レスト要素（...rest）は、分割代入で受け取られなかった残りの要素を配列としてまとめます。first = colors[0]、rest = colors.slice(1) と同等です。",
  },
  {
    id: "q059",
    lesson: "lesson27",
    difficulty: "normal",
    question: "配列の map() メソッドの説明として正しいものはどれですか？",
    choices: [
      "各要素に関数を適用し、結果を並べた新しい配列を返す（元の配列は変わらない）",
      "条件に合う要素だけを残した新しい配列を返す",
      "配列を文字列に結合する",
      "配列の要素数を返す",
    ],
    answer: 0,
    explanation:
      "map() は配列の各要素を変換した新しい配列を返します。元の配列は変更しません（非破壊）。filter() は条件に合う要素だけ残す、find() は最初の一致要素を返します。",
  },
  {
    id: "q060",
    lesson: "lesson27",
    difficulty: "normal",
    question: "配列の filter() と find() の違いはなんですか？",
    choices: [
      "filter() は条件に合う全要素の配列を返す。find() は最初の 1 件（または undefined）を返す",
      "find() は条件に合う全要素の配列を返す。filter() は最初の 1 件を返す",
      "どちらも同じ動作で、返す型だけ異なる",
      "filter() はオブジェクト配列に、find() は数値配列に使う",
    ],
    answer: 0,
    explanation:
      "filter() は条件を満たすすべての要素を含む新配列を返します。find() は条件を最初に満たした要素そのものを返し、見つからない場合は undefined を返します。",
  },
  {
    id: "q061",
    lesson: "lesson28",
    difficulty: "normal",
    question: "new Date() の getMonth() が返す値についての注意点はなんですか？",
    choices: [
      "0 から始まる（1 月が 0）ため、月を表示するには +1 が必要",
      "1 から始まる（1 月が 1）ため、そのまま使える",
      "曜日（0=日曜）を返す",
      "年の最初からの経過日数を返す",
    ],
    answer: 0,
    explanation:
      "JavaScript の getMonth() は 0 が 1 月、11 が 12 月を表す 0 インデックスです。実際の月番号を得るには getMonth() + 1 が必要です。これは JS の代表的な罠です。",
  },
  {
    id: "q062",
    lesson: "lesson28",
    difficulty: "normal",
    question: "Date.now() が返す値はなんですか？",
    choices: [
      "Unix エポック（1970-01-01 00:00:00 UTC）からのミリ秒数",
      "現在の日付を 'YYYY-MM-DD' 形式の文字列で返す",
      "現在の時刻を '時:分:秒' 形式で返す",
      "現在の年を 4 桁の数値で返す",
    ],
    answer: 0,
    explanation:
      "Date.now() は Unix エポックからの経過ミリ秒を返します。処理時間の計測や、2 つの Date の差分（何日経ったか）の計算に使います。",
  },
  {
    id: "q063",
    lesson: "lesson29",
    difficulty: "easy",
    question: "localStorage にデータを保存するメソッドはどれですか？",
    choices: [
      "localStorage.setItem('key', 'value')",
      "localStorage.save('key', 'value')",
      "localStorage.write('key', 'value')",
      "localStorage.put('key', 'value')",
    ],
    answer: 0,
    explanation:
      "localStorage.setItem(key, value) でキーと値を保存します。値は文字列のみ保存できます。オブジェクトを保存したい場合は JSON.stringify で文字列に変換してから保存します。",
  },
  {
    id: "q064",
    lesson: "lesson29",
    difficulty: "normal",
    question: "localStorage からデータを取り出すとき、キーが存在しない場合に返る値はなんですか？",
    choices: ["null", "undefined", "空文字（''）", "0"],
    answer: 0,
    explanation:
      "localStorage.getItem() は指定したキーが存在しないとき null を返します。値を読み込む際は null チェックが必要です。",
  },
  {
    id: "q065",
    lesson: "lesson30",
    difficulty: "normal",
    question: "ES モジュールの名前付き export と export default の違いはなんですか？",
    choices: [
      "名前付き export は { } で囲んで import する。export default は名前を自由に付けて import できる",
      "export default は複数の値を 1 ファイルから公開できる。名前付き export は 1 つだけ",
      "名前付き export は全ファイルで共有されるグローバル変数になる",
      "export default は import 時に大文字で始める必要がある",
    ],
    answer: 0,
    explanation:
      "名前付き export は import { add } from './math.js' のように {} で取り出します。export default は import myAdd from './math.js' のように好きな名前で受け取れます。1 ファイルに export default は 1 つだけです。",
  },
  {
    id: "q066",
    lesson: "lesson30",
    difficulty: "normal",
    question: "<script> タグで import / export を使うために必要な属性はどれですか？",
    choices: [
      'type="module"',
      'defer',
      'async',
      'module="true"',
    ],
    answer: 0,
    explanation:
      '<script type="module"> にするとそのファイルは ES モジュールとして扱われ、import / export が使えます。モジュールは自動的に defer 相当で遅延実行されます。',
  },
  {
    id: "q067",
    lesson: "lesson31",
    difficulty: "normal",
    question: "async/await を使った非同期処理で、await の役割はなんですか？",
    choices: [
      "Promise が解決（resolve）するまで処理を待ち、結果を変数に受け取る",
      "関数を非同期に変換する",
      "エラーを自動的に catch する",
      "処理を別スレッドで並列実行する",
    ],
    answer: 0,
    explanation:
      "await は Promise の完了を待ち、resolve した値を返します。async 関数の中でのみ使えます。処理がブロックされるのではなく、その関数の実行を中断して他の処理に制御を渡します。",
  },
  {
    id: "q068",
    lesson: "lesson31",
    difficulty: "normal",
    question: "Promise とは何ですか？",
    choices: [
      "まだ完了していない非同期処理の結果を表すオブジェクト",
      "エラーが起きたときだけ返されるオブジェクト",
      "setTimeout の別名",
      "ループを非同期に実行するための構文",
    ],
    answer: 0,
    explanation:
      "Promise は「まだ完了していない処理の結果」を表すオブジェクトです。fulfilled（成功）、rejected（失敗）、pending（保留）の 3 つの状態を持ちます。await で結果を取り出せます。",
  },
  {
    id: "q069",
    lesson: "lesson31",
    difficulty: "hard",
    question: "async 関数の return 値はどのような型になりますか？",
    choices: [
      "自動的に Promise でラップされる",
      "return に書いた値がそのまま同期的に返される",
      "常に undefined を返す",
      "return の型によって Promise になるかどうか変わる",
    ],
    answer: 0,
    explanation:
      "async 関数は常に Promise を返します。return 42 と書いた場合、呼び出し元は Promise<number> を受け取ります。await で呼び出すか .then() でチェーンして結果を受け取ります。",
  },
  {
    id: "q070",
    lesson: "lesson32",
    difficulty: "normal",
    question: "try / catch の finally ブロックはいつ実行されますか？",
    choices: [
      "try が成功でも catch が実行されても、必ず最後に実行される",
      "エラーが起きたときのみ実行される",
      "try ブロックが正常終了したときのみ実行される",
      "catch ブロックが catch したときのみ実行される",
    ],
    answer: 0,
    explanation:
      "finally は try の成功・失敗に関わらず必ず実行されます。リソースの解放やローディング状態のリセットなど「どちらの場合でも必要な後処理」に使います。",
  },
  {
    id: "q071",
    lesson: "lesson32",
    difficulty: "normal",
    question: "catch ブロックの引数 error から、エラーのメッセージを取り出すには何を参照しますか？",
    choices: ["error.message", "error.text", "error.description", "error.toString()"],
    answer: 0,
    explanation:
      "Error オブジェクトは message プロパティにエラーの説明文を持ちます。また error.name で 'TypeError' / 'ReferenceError' などの種類を、error.stack でスタックトレースを確認できます。",
  },
  {
    id: "q072",
    lesson: "lesson33",
    difficulty: "normal",
    question: "fetch でデータを取得するとき、await を 2 回書く必要があるのはなぜですか？",
    choices: [
      "fetch も response.json() も Promise を返すため、どちらも await が必要",
      "ブラウザのセキュリティ制限で 2 回 await しないと動かないため",
      "fetch が通信エラーを自動で再試行するため",
      "JSON の変換に時間がかかるため 2 回待つ必要があるため",
    ],
    answer: 0,
    explanation:
      "fetch(url) は Response の Promise を返します。さらに response.json() も Promise を返します。どちらも非同期なので両方に await が必要です。response.json() の await を忘れると Promise オブジェクトがそのまま変数に入ります。",
  },
  {
    id: "q073",
    lesson: "lesson33",
    difficulty: "normal",
    question: "fetch でデータを取得する際にエラーを catch する正しい書き方はどれですか？",
    choices: [
      "async/await の try { const res = await fetch(url); } catch (e) { } を使う",
      "fetch のコールバックに第 2 引数としてエラー関数を渡す",
      "fetch は絶対にエラーを投げないため catch は不要",
      "window.onerror でグローバルに catch する",
    ],
    answer: 0,
    explanation:
      "fetch をネットワークエラーで失敗すると Promise が reject されます。try/catch と async/await を組み合わせてエラーを受け取ります。なお HTTP エラー（404 など）は reject されないため、response.ok を確認する必要があります。",
  },
  {
    id: "q074",
    lesson: "lesson34",
    difficulty: "easy",
    question: "JavaScript のオブジェクトを JSON 文字列に変換するメソッドはどれですか？",
    choices: ["JSON.stringify()", "JSON.parse()", "JSON.encode()", "JSON.convert()"],
    answer: 0,
    explanation:
      "JSON.stringify(obj) はオブジェクトを JSON 形式の文字列に変換します。第 3 引数に数値を渡すと（例: JSON.stringify(obj, null, 2)）インデントが付いて読みやすい形式になります。",
  },
  {
    id: "q075",
    lesson: "lesson34",
    difficulty: "easy",
    question: "JSON 文字列を JavaScript のオブジェクトに変換するメソッドはどれですか？",
    choices: ["JSON.parse()", "JSON.stringify()", "JSON.decode()", "JSON.toObject()"],
    answer: 0,
    explanation:
      "JSON.parse(text) は JSON 文字列をオブジェクト / 配列 / 値に変換します。文字列の形式が正しくないと SyntaxError を投げるため try/catch で包むのが安全です。",
  },
  {
    id: "q076",
    lesson: "lesson35",
    difficulty: "easy",
    question: "document.querySelector('#title') はどの要素を取得しますか？",
    choices: [
      "id='title' を持つ最初の要素",
      "class='title' を持つすべての要素",
      "タグ名が title の要素",
      "title 属性を持つすべての要素",
    ],
    answer: 0,
    explanation:
      "querySelector は CSS セレクタを受け取り、最初に一致した要素を返します。#title は id='title' の要素を指す CSS セレクタです。見つからない場合は null を返します。",
  },
  {
    id: "q077",
    lesson: "lesson35",
    difficulty: "normal",
    question: "要素の CSS クラスをトグル（あれば削除・なければ追加）するメソッドはどれですか？",
    choices: [
      "element.classList.toggle('クラス名')",
      "element.classList.switch('クラス名')",
      "element.className = 'クラス名'",
      "element.toggleClass('クラス名')",
    ],
    answer: 0,
    explanation:
      "classList.toggle() はクラスがあれば削除、なければ追加します。classList.add() / remove() で明示的に付け外しすることもできます。",
  },
  {
    id: "q078",
    lesson: "lesson36",
    difficulty: "easy",
    question: "ボタンのクリックに反応するイベントリスナーを登録するコードはどれですか？",
    choices: [
      "btn.addEventListener('click', () => { ... })",
      "btn.onClick = () => { ... }",
      "btn.on('click', () => { ... })",
      "addEventListener(btn, 'click', () => { ... })",
    ],
    answer: 0,
    explanation:
      "addEventListener(イベント名, コールバック) を要素に対して呼び出します。btn.onclick = ... でも動作しますが、addEventListener は複数のリスナーを登録できるため推奨されます。",
  },
  {
    id: "q079",
    lesson: "lesson36",
    difficulty: "normal",
    question: "フォームの submit イベントでブラウザのデフォルト動作（ページリロード）を止めるには何を呼びますか？",
    choices: [
      "event.preventDefault()",
      "event.stopPropagation()",
      "event.cancel()",
      "form.noSubmit = true",
    ],
    answer: 0,
    explanation:
      "event.preventDefault() はそのイベントのブラウザ既定動作をキャンセルします。フォームなら送信とページリロード、リンクなら画面遷移を止められます。",
  },
  {
    id: "q080",
    lesson: "lesson37",
    difficulty: "normal",
    question: "URL オブジェクトを使って URL のクエリパラメータを安全に扱うときに使う API はどれですか？",
    choices: [
      "url.searchParams（URLSearchParams）",
      "url.query",
      "url.params",
      "url.getQueryString()",
    ],
    answer: 0,
    explanation:
      "URLSearchParams は url.searchParams でアクセスし、get() / set() / append() / forEach() などのメソッドでクエリ文字列を安全に操作できます。手動で文字列を分解するより安全でバグが少ないです。",
  },
  {
    id: "q081",
    lesson: "lesson37",
    difficulty: "normal",
    question: "ページをリロードせずに URL だけ書き換えるために使う History API のメソッドはどれですか？",
    choices: [
      "history.pushState(state, '', '/new-path')",
      "location.href = '/new-path'",
      "document.URL = '/new-path'",
      "window.navigate('/new-path')",
    ],
    answer: 0,
    explanation:
      "history.pushState() は URL をブラウザ履歴に追加しながらページ遷移なしに変更します。SPA がルーティングを実装する際の基盤となる API です。",
  },
  {
    id: "q082",
    lesson: "lesson38",
    difficulty: "easy",
    question: "console.table() はどんな場面で便利ですか？",
    choices: [
      "オブジェクトの配列をテーブル形式で見やすく表示したいとき",
      "HTML のテーブル要素を生成したいとき",
      "CSS のグリッドレイアウトを調整したいとき",
      "外部 API のレスポンスをキャッシュしたいとき",
    ],
    answer: 0,
    explanation:
      "console.table() にオブジェクトの配列を渡すと、DevTools がキーを列名にしたテーブル形式で表示します。ユーザー一覧など構造化データの確認に非常に便利です。",
  },
  {
    id: "q083",
    lesson: "lesson38",
    difficulty: "normal",
    question: "処理の実行時間を計測するための Console API の使い方として正しいものはどれですか？",
    choices: [
      "console.time('ラベル') と console.timeEnd('ラベル') で挟む",
      "console.measure('ラベル') を呼ぶ",
      "console.benchmark('ラベル') を呼ぶ",
      "Date.now() の差分を console.log で出力する（Console API に計測機能はない）",
    ],
    answer: 0,
    explanation:
      "console.time() で計測を開始し、console.timeEnd() で終了します。同じラベルを指定すると、その間の経過時間をミリ秒で表示してくれます。",
  },
  {
    id: "q084",
    lesson: "lesson39",
    difficulty: "normal",
    question: "Intersection Observer はどんなときに使いますか？",
    choices: [
      "要素がビューポートに入った・出たことを検知する（遅延読み込み・スクロールアニメーションなど）",
      "要素のサイズ変化を検知する",
      "DOM の子要素の追加・削除を監視する",
      "マウスカーソルが要素に重なったことを検知する",
    ],
    answer: 0,
    explanation:
      "Intersection Observer は要素の表示・非表示の切り替えを効率よく検知します。スクロールで画像を遅延読み込みしたり、要素が画面に入ったときにアニメーションを起動したりする用途に使います。",
  },
  {
    id: "q085",
    lesson: "lesson39",
    difficulty: "normal",
    question: "ResizeObserver が検知するのはどのような変化ですか？",
    choices: [
      "監視対象要素のサイズ（幅・高さ）の変化",
      "監視対象要素の可視状態の変化",
      "DOM 構造の変化（子要素の追加・削除）",
      "ウィンドウのリサイズ",
    ],
    answer: 0,
    explanation:
      "ResizeObserver は特定の要素のサイズ変化を監視します。window.resize と違い、ウィンドウではなく個別要素のサイズ変化を精確に検知でき、コンテナクエリの JS 版として使われます。",
  },
  {
    id: "q086",
    lesson: "lesson40",
    difficulty: "normal",
    question: "Intl.NumberFormat を使って数値を日本語ロケールで通貨表示する目的はなんですか？",
    choices: [
      "ロケールに合わせた数値フォーマット（桁区切り・通貨記号）を自動で処理するため",
      "数値を文字列に変換するため（toString() の代替）",
      "数値の計算精度を上げるため",
      "数値を暗号化するため",
    ],
    answer: 0,
    explanation:
      "Intl.NumberFormat は国際化対応の数値フォーマットを提供します。ロケール・通貨・小数点スタイルを指定するだけで各国のフォーマット（「¥1,234」など）が得られます。手動で実装するより正確です。",
  },
  {
    id: "q087",
    lesson: "lesson40",
    difficulty: "normal",
    question: "Intl.DateTimeFormat で日付を日本語形式にフォーマットするときに指定するロケール文字列はどれですか？",
    choices: [
      '"ja-JP"',
      '"jp"',
      '"japanese"',
      '"Asia/Tokyo"',
    ],
    answer: 0,
    explanation:
      "ロケール識別子は BCP 47 タグで指定します。日本語（日本）は \"ja-JP\" です。Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' }) のように書くと「2026年5月3日」形式で表示されます。",
  },
];
