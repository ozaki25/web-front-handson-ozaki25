import type { Quiz } from "../types";

export const chapter1: Quiz[] = [
  {
    id: "q001",
    lesson: "lesson01",
    difficulty: "easy",
    question: "HTML の略称として正しいものはどれですか？",
    choices: [
      "HyperText Markup Language",
      "HighText Making Language",
      "HyperTransfer Markup Language",
      "Hyperlink Text Model Language",
    ],
    answer: 0,
    explanation:
      "HTML は HyperText Markup Language の略です。タグを使って文書に意味付けをする（マークアップする）言語です。",
  },
  {
    id: "q002",
    lesson: "lesson01",
    difficulty: "easy",
    question: "<!DOCTYPE html> を HTML ファイルの先頭に書く目的はなんですか？",
    choices: [
      "このファイルが HTML5 であることをブラウザに宣言するため",
      "文字コードを UTF-8 に指定するため",
      "外部 CSS ファイルを読み込むため",
      "ページの言語を日本語に設定するため",
    ],
    answer: 0,
    explanation:
      "<!DOCTYPE html> は「このファイルは HTML5 である」という宣言です。ブラウザが正しいモードで HTML を解釈するために必ず先頭に書きます。",
  },
  {
    id: "q003",
    lesson: "lesson01",
    difficulty: "normal",
    question: "<meta name='viewport'> を書かない場合、スマートフォンでどんな問題が起きますか？",
    choices: [
      "PC 画面を縮小表示するため、文字が極小になって読めなくなる",
      "ページが完全に表示されなくなる",
      "CSS が読み込まれなくなる",
      "JavaScript が実行できなくなる",
    ],
    answer: 0,
    explanation:
      "<meta name='viewport'> がないとモバイル端末は「PC 画面を縮めて表示」する挙動になり、文字が極小になります。等倍表示にするために必ず書く定型です。",
  },
  {
    id: "q004",
    lesson: "lesson02",
    difficulty: "easy",
    question: "HTML の見出しタグ（h1〜h6）についての説明として正しいものはどれですか？",
    choices: [
      "数字が小さいほど重要度が高く、h1 がもっとも重要な見出し",
      "h6 がもっとも重要な見出し",
      "1 つのページに h1 を何個置いても問題ない",
      "h1〜h6 は純粋に文字サイズを変えるためだけのタグ",
    ],
    answer: 0,
    explanation:
      "見出しは h1 が最も重要で、h6 が最も軽い見出しです。見た目ではなく「意味の階層」を表します。h1 は原則ページに 1 つです。",
  },
  {
    id: "q005",
    lesson: "lesson02",
    difficulty: "normal",
    question: "<strong> と <em> の違いを正しく説明しているものはどれですか？",
    choices: [
      "<strong> は強い重要度（太字）、<em> は軽い強調（斜体）を表す",
      "両者に意味の違いはなく、見た目が異なるだけ",
      "<strong> は斜体、<em> は太字を表す",
      "<em> が強い重要度、<strong> が軽い強調を表す",
    ],
    answer: 0,
    explanation:
      "<strong> は「強い重要度」を意味しブラウザ既定で太字に、<em> は「軽い強調」を意味し斜体で表示されます。見た目ではなく意味で使い分けます。",
  },
  {
    id: "q006",
    lesson: "lesson03",
    difficulty: "easy",
    question: "順序なしリストを作るタグはどれですか？",
    choices: ["<ul>", "<ol>", "<li>", "<dl>"],
    answer: 0,
    explanation:
      "<ul>（unordered list）は順序なしリストです。項目の順番に意味がないとき（好きなものの列挙など）に使います。各項目は <li> で囲みます。",
  },
  {
    id: "q007",
    lesson: "lesson03",
    difficulty: "easy",
    question: "「1. 卵を割る / 2. 混ぜる / 3. 焼く」のような手順を書くとき、どのタグが適切ですか？",
    choices: [
      "<ol>（順序付きリスト）",
      "<ul>（順序なしリスト）",
      "<dl>（定義リスト）",
      "どちらでも同じなので気にしなくてよい",
    ],
    answer: 0,
    explanation:
      "手順やランキングのように順番に意味があるときは <ol>（ordered list）を使います。番号はブラウザが自動で付けます。",
  },
  {
    id: "q008",
    lesson: "lesson04",
    difficulty: "normal",
    question: '<a target="_blank"> に rel="noopener" を付ける理由は何ですか？',
    choices: [
      "新しく開いたタブから元のタブを window.opener 経由で操作されるのを防ぐため",
      "ブラウザにリンク先をプリロードさせないようにするため",
      "リンクが外部サイトであることを示してスタイルを変えるため",
      "これがないと target='_blank' が機能しないため",
    ],
    answer: 0,
    explanation:
      'rel="noopener" は、新しく開いたページが window.opener を使って元ページを別 URL へ誘導する乗っ取りを防ぐセキュリティ対策です。現代のブラウザは自動で保護しますが、明示しておくのが安全です。',
  },
  {
    id: "q009",
    lesson: "lesson04",
    difficulty: "normal",
    question: "<img> タグの alt 属性を省略してはいけない理由として正しいものはどれですか？",
    choices: [
      "スクリーンリーダーが読み上げる代替テキストであり、画像が表示できないときにも内容を伝えるため",
      "alt がないと画像が一切表示されないため",
      "外部ドメインの画像にのみ必要なため",
      "alt は SEO にだけ影響し、ユーザー体験には無関係なため",
    ],
    answer: 0,
    explanation:
      "alt 属性はスクリーンリーダーが画像の内容を読み上げるために使い、画像が読み込めないときにも代替テキストとして表示されます。アクセシビリティ上必須です。",
  },
  {
    id: "q010",
    lesson: "lesson05",
    difficulty: "easy",
    question: "ページの「主要コンテンツ」を示すセマンティックタグはどれですか？原則 1 ページに 1 つです。",
    choices: ["<main>", "<section>", "<header>", "<article>"],
    answer: 0,
    explanation:
      "<main> はページの主要コンテンツを囲むタグで、原則として 1 ページに 1 つ配置します。スクリーンリーダーはこの領域にスキップできます。",
  },
  {
    id: "q011",
    lesson: "lesson05",
    difficulty: "normal",
    question: "単なる <div> ではなく <header> / <nav> / <main> などのセマンティックタグを使うメリットはどれですか？",
    choices: [
      "ブラウザ・スクリーンリーダー・検索エンジンがページ構造を理解しやすくなる",
      "<div> よりレンダリングが高速になる",
      "CSS が <div> では機能しないため",
      "セマンティックタグだけが CSS のスタイリング対象になるため",
    ],
    answer: 0,
    explanation:
      "セマンティックタグは意味的な情報を持ち、スクリーンリーダーでのナビゲーション向上や検索エンジンの構造理解に役立ちます。見た目だけなら <div> と同じです。",
  },
  {
    id: "q012",
    lesson: "lesson06",
    difficulty: "normal",
    question: "フォームの <input> における name 属性の役割はなんですか？",
    choices: [
      "送信時にその値がどのキー名で送られるかを指定する",
      "入力欄の横に表示されるラベルテキストを指定する",
      "入力欄に適用する CSS クラス名を指定する",
      "入力欄内に表示されるプレースホルダーテキストを指定する",
    ],
    answer: 0,
    explanation:
      "name 属性はフォーム送信時のキー名を指定します。たとえば name='email' なら、サーバーは email というキーで値を受け取ります。",
  },
  {
    id: "q013",
    lesson: "lesson06",
    difficulty: "easy",
    question: "メールアドレスの形式をブラウザネイティブで検証する <input> の type 値はどれですか？",
    choices: ['type="email"', 'type="text"', 'type="validate"', 'type="format"'],
    answer: 0,
    explanation:
      'type="email" を使うと、送信時にブラウザがメール形式かどうかを自動チェックします。スマートフォンでは @ キー付きのキーボードも表示されます。',
  },
  {
    id: "q014",
    lesson: "lesson06",
    difficulty: "easy",
    question: "<label for='name'> のラベルをクリックしたとき、どんな動作が起きますか？",
    choices: [
      "for に対応する id を持つ入力欄にフォーカスが移動する",
      "フォームが送信される",
      "入力欄の値がクリアされる",
      "入力欄の内容がバリデーションされる",
    ],
    answer: 0,
    explanation:
      "<label for='xxx'> は id='xxx' を持つ入力欄と紐付きます。ラベルをクリックすると対応する入力欄にフォーカスが移り、入力しやすくなります。",
  },
  {
    id: "q015",
    lesson: "lesson07",
    difficulty: "easy",
    question: "HTML に外部 CSS ファイルを読み込む正しい書き方はどれですか？",
    choices: [
      "<link rel='stylesheet' href='styles.css'> を <head> 内に書く",
      "<css src='styles.css'> を <body> 内に書く",
      "<script src='styles.css'> を <head> 内に書く",
      "<style href='styles.css'> を <body> 内に書く",
    ],
    answer: 0,
    explanation:
      "CSS ファイルは <head> 内に <link rel='stylesheet' href='ファイル名'> で読み込みます。rel='stylesheet' で「スタイルシートである」と指定します。",
  },
  {
    id: "q016",
    lesson: "lesson07",
    difficulty: "easy",
    question: "CSS の宣言「color: red;」を構成するものはなんですか？",
    choices: [
      "プロパティ（color）と値（red）",
      "セレクタとルール",
      "タグ名とクラス",
      "変数と代入",
    ],
    answer: 0,
    explanation:
      "CSS の宣言は「プロパティ: 値;」という形です。color がプロパティ、red が値になります。宣言をまとめたブロックがルールセットです。",
  },
  {
    id: "q017",
    lesson: "lesson08",
    difficulty: "easy",
    question: "CSS で「btn」というクラス名の要素に適用するクラスセレクタの書き方はどれですか？",
    choices: [".btn { }", "#btn { }", "btn { }", "*btn { }"],
    answer: 0,
    explanation:
      "クラスセレクタはクラス名の前にドット（.）を付けます。.btn { } は class='btn' を持つすべての要素に適用されます。",
  },
  {
    id: "q018",
    lesson: "lesson08",
    difficulty: "normal",
    question: "インタラクティブ要素のフォーカスリング（outline）を CSS で消してはいけない理由はなんですか？",
    choices: [
      "キーボードや支援技術のユーザーが、どの要素にフォーカスがあるか分からなくなるため",
      "フォーカスリングを消すとブラウザがエラーを出すため",
      "フォーカスリングを消すとタッチ操作に影響するため",
      "フォーカスリングは自動的に再表示されるため問題ない",
    ],
    answer: 0,
    explanation:
      "フォーカスリングはキーボードナビゲーションや支援技術の利用者が現在地を確認するための視覚的な手がかりです。消すとアクセシビリティが大きく損なわれます。",
  },
  {
    id: "q019",
    lesson: "lesson09",
    difficulty: "normal",
    question: "CSS の詳細度（specificity）において、優先度が高い順に並んでいるものはどれですか？",
    choices: [
      "id セレクタ > クラスセレクタ > 要素セレクタ",
      "要素セレクタ > クラスセレクタ > id セレクタ",
      "後に書いたルールが常に優先される",
      "インラインスタイルとクラスセレクタは同等",
    ],
    answer: 0,
    explanation:
      "CSS の詳細度は id（100）> クラス/擬似クラス（10）> 要素（1）の順です。同じ詳細度なら後に書いたルールが勝ちます。",
  },
  {
    id: "q020",
    lesson: "lesson09",
    difficulty: "normal",
    question: "CSS の「.card > p」セレクタが選択する要素はどれですか？",
    choices: [
      ".card の直接の子要素である <p> だけ（深い階層の <p> は対象外）",
      ".card の中に含まれるすべての <p>（深さに関わらず）",
      ".card の直後に続く <p>",
      ".card と同じ親を持つ <p>",
    ],
    answer: 0,
    explanation:
      "子セレクタ「>」は直接の子要素だけを対象にします。.card > p は .card の直下にある <p> のみ対象で、入れ子の深い <p> は含みません。",
  },
  {
    id: "q021",
    lesson: "lesson10",
    difficulty: "normal",
    question: "font-size に rem 単位を使うと、px と比べてどんなメリットがありますか？",
    choices: [
      "ユーザーがブラウザの文字サイズ設定を変えたとき、それに合わせて拡大縮小される",
      "rem はすべての環境で必ず 16px になる固定単位",
      "rem を使うと CSS の計算が不要になる",
      "rem は em より親要素の影響を強く受ける",
    ],
    answer: 0,
    explanation:
      "rem（root em）はルート要素の font-size を基準にします。px は固定ですが rem はブラウザのフォントサイズ設定に追従するため、アクセシビリティに優れています。",
  },
  {
    id: "q022",
    lesson: "lesson10",
    difficulty: "easy",
    question: "本文テキストの読みやすさのために推奨される line-height の目安はどれですか？",
    choices: ["1.5 〜 1.8", "0.8 〜 1.0", "3.0 〜 4.0", "ちょうど 1.0"],
    answer: 0,
    explanation:
      "本文の読みやすい行間は line-height: 1.5〜1.8 が目安です。狭すぎると行が詰まって読みづらく、広すぎると段落がバラバラに見えます。",
  },
  {
    id: "q023",
    lesson: "lesson11",
    difficulty: "easy",
    question: "CSS のボックスモデルで、内側から数えて最初の層はどれですか？",
    choices: ["コンテンツ（content）", "パディング（padding）", "ボーダー（border）", "マージン（margin）"],
    answer: 0,
    explanation:
      "ボックスモデルは内側から「コンテンツ → padding → border → margin」の 4 層構造です。コンテンツが中心にあり、その外側に padding が包みます。",
  },
  {
    id: "q024",
    lesson: "lesson11",
    difficulty: "normal",
    question: "box-sizing: border-box を設定するとどんな効果がありますか？",
    choices: [
      "width / height に padding と border が含まれるようになり、指定した数値がそのまま要素の合計サイズになる",
      "すべてのブロック要素のデフォルトマージンが 0 になる",
      "border が隣の要素に重ならないようになる",
      "すべての要素が同じ高さに揃う",
    ],
    answer: 0,
    explanation:
      "デフォルトの box-sizing: content-box では width は中身だけを指します。border-box にすると width が padding と border を含む合計サイズになり、直感的にレイアウトできます。",
  },
  {
    id: "q025",
    lesson: "lesson12",
    difficulty: "easy",
    question: "Flexbox で子要素を横並びにするために必要な最小限の CSS はどれですか？",
    choices: [
      "親要素に display: flex を指定する",
      "各子要素に float: left を指定する",
      "各子要素に display: inline を指定する",
      "親要素に position: relative を指定する",
    ],
    answer: 0,
    explanation:
      "Flexbox は並べたい要素を包む親要素に display: flex を付けるだけで子要素が横並びになります。子要素側への変更は不要です。",
  },
  {
    id: "q026",
    lesson: "lesson12",
    difficulty: "normal",
    question: "Flexbox の justify-content プロパティは何を制御しますか？",
    choices: [
      "主軸（メイン軸）方向の配置や間隔（左右の揃え・均等配置など）",
      "交差軸（クロス軸）方向の配置（上下の揃え）",
      "Flex コンテナ間の余白",
      "Flex アイテムの折り返し動作",
    ],
    answer: 0,
    explanation:
      "justify-content は主軸方向（デフォルトは横方向）のアイテム配置を制御します。flex-start / center / space-between / space-around などが指定できます。",
  },
  {
    id: "q027",
    lesson: "lesson13",
    difficulty: "normal",
    question: "CSS Grid の fr 単位はどんな意味を持ちますか？",
    choices: [
      "利用可能なスペースを比率で分配する単位（1fr 2fr なら 1:2 の比率）",
      "固定ピクセルを分数で表す単位",
      "ビューポート幅を分数で表す単位",
      "フォントサイズを基準にした相対単位",
    ],
    answer: 0,
    explanation:
      "fr（fraction）は「残り空間の何割を使うか」を表す単位です。1fr 1fr 1fr なら 3 等分、1fr 2fr なら 1:2 の比率になります。",
  },
  {
    id: "q028",
    lesson: "lesson13",
    difficulty: "hard",
    question: "画面幅に応じてカード列数が自動で折り返す Grid レイアウトの書き方として正しいものはどれですか？",
    choices: [
      "grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))",
      "grid-template-columns: repeat(3, 1fr)",
      "grid-template-rows: auto",
      "display: grid-wrap",
    ],
    answer: 0,
    explanation:
      "repeat(auto-fit, minmax(最小値, 最大値)) を使うと、利用可能な幅に合わせて列数が自動計算されます。レスポンシブなカードレイアウトに最適です。",
  },
  {
    id: "q029",
    lesson: "lesson14",
    difficulty: "easy",
    question: "スクロールしても画面右下に「ページトップへ」ボタンを固定表示したい。使う position の値はどれですか？",
    choices: ["fixed", "sticky", "absolute", "relative"],
    answer: 0,
    explanation:
      "position: fixed はビューポート（画面）を基準に要素を固定します。スクロールしても位置が変わりません。ナビゲーションバーや「戻るボタン」に使います。",
  },
  {
    id: "q030",
    lesson: "lesson14",
    difficulty: "normal",
    question: "子要素に position: absolute を使うとき、親要素に position: relative を指定する理由はなんですか？",
    choices: [
      "absolute な子の基準点（親）を明示的に設定するため",
      "子要素のオーバーフローを親内に収めるため",
      "子が親の z-index を継承するため",
      "子要素が通常の文書フローに空間を確保するため",
    ],
    answer: 0,
    explanation:
      "position: absolute の基準は「最も近い position: static 以外の祖先要素」です。親に relative を付けることで子の絶対配置の基準が親になり、意図した位置に配置できます。",
  },
  {
    id: "q031",
    lesson: "lesson15",
    difficulty: "easy",
    question: "ホバー時の色変化を滑らかにアニメーションさせるために使う CSS プロパティはどれですか？",
    choices: ["transition", "animation", "transform", "keyframes"],
    answer: 0,
    explanation:
      "transition はプロパティの値変化を指定した時間で補間します。例：transition: color 0.2s ease と書くと色変化が 0.2 秒かけて滑らかになります。",
  },
  {
    id: "q032",
    lesson: "lesson15",
    difficulty: "normal",
    question: "CSS の transition で「0.3 秒かけて background-color を変化させる」指定として正しいものはどれですか？",
    choices: [
      "transition: background-color 0.3s",
      "@keyframes { background-color: 0.3s }",
      "animation: background-color 0.3s",
      "animation-delay: 0.3s",
    ],
    answer: 0,
    explanation:
      "transition プロパティに「変化させるプロパティ名 継続時間」を指定します。transition: background-color 0.3s と書くと 0.3 秒かけて背景色が変化します。",
  },
  {
    id: "q033",
    lesson: "lesson16",
    difficulty: "hard",
    question: "CSS の :has() 擬似クラスでできることはどれですか？",
    choices: [
      "子孫要素の状態を元に親要素にスタイルを当てる（親セレクタ）",
      "クラス属性を持つ要素だけを選択する",
      "n 番目の子要素を選択する",
      "JavaScript が無効なときだけスタイルを適用する",
    ],
    answer: 0,
    explanation:
      ":has() はその要素が特定の子孫を持つ場合にマッチします。例：.card:has(img) は img を含む .card だけに適用。長年 CSS に欠けていた「親セレクタ」機能です。",
  },
  {
    id: "q034",
    lesson: "lesson16",
    difficulty: "hard",
    question: "CSS の @layer の主な目的はなんですか？",
    choices: [
      "スタイルルールのカスケード順を制御し、詳細度の衝突を解消する",
      "CSS ファイルを非同期に読み込んでパフォーマンスを改善する",
      "フレームごとに制御できる CSS アニメーションを作る",
      "コンポーネント内でコンテナクエリのブレークポイントを有効にする",
    ],
    answer: 0,
    explanation:
      "@layer はスタイルをレイヤー（層）に分類し、後から追加するスタイルでも詳細度に関係なく上書きできる仕組みです。サードパーティ CSS との競合解消に有効です。",
  },
  {
    id: "q035",
    lesson: "lesson17",
    difficulty: "easy",
    question: "JavaScript なしで折りたたみ（アコーディオン）コンテンツを作れる HTML 要素はどれですか？",
    choices: [
      "<details> と <summary>",
      "<collapse>",
      "<accordion>",
      "<toggle>",
    ],
    answer: 0,
    explanation:
      "<details> 要素はクリックで展開・折りたたみができる UI を HTML だけで実現します。<summary> がクリックできるヘッダー部分になります。",
  },
  {
    id: "q036",
    lesson: "lesson17",
    difficulty: "normal",
    question: "<dialog> 要素をページ読み込み時から表示状態にするための属性はどれですか？",
    choices: ["open", "visible", "show", 'display="block"'],
    answer: 0,
    explanation:
      "<dialog> はデフォルトで非表示です。open 属性を付けると表示状態になります。JavaScript では showModal() / close() メソッドで制御できます。",
  },
  {
    id: "q037",
    lesson: "lesson17",
    difficulty: "hard",
    question: "HTML の Popover API を使ってポップオーバーを表示するとき、トリガーボタンに指定する属性はどれですか？",
    choices: [
      "popovertarget（表示するポップオーバーの id を指定）",
      "tooltip='true'",
      "data-popup",
      "onclick='showPopover()'",
    ],
    answer: 0,
    explanation:
      "Popover API ではポップオーバー要素に popover 属性を付け、トリガーの <button> に popovertarget='ポップオーバーのid' を付けます。JavaScript なしで動作します。",
  },
];
