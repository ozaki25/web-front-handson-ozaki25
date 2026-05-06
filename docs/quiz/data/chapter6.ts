import type { Quiz } from "../types";

export const chapter6: Quiz[] = [
  // lesson92: ブラウザと HTTP の基本
  {
    id: "q200",
    lesson: "lesson92",
    difficulty: "easy",
    question: "HTTP リクエストメソッドで、サーバーからデータを取得するときに使うメソッドはどれですか？",
    choices: ["POST", "PUT", "GET", "DELETE"],
    answer: 2,
    explanation:
      "GET はサーバーからリソースを取得するためのメソッドです。POST は新規作成、PUT は更新、DELETE は削除に使います。",
  },
  {
    id: "q201",
    lesson: "lesson92",
    difficulty: "easy",
    question: "HTTP ステータスコード 404 は何を意味しますか？",
    choices: [
      "リクエスト成功",
      "リダイレクト",
      "リソースが見つからない（Not Found）",
      "サーバーエラー",
    ],
    answer: 2,
    explanation:
      "404 は「Not Found」で、リクエストされたリソースがサーバーに存在しないことを示します。4xx はクライアントエラー、5xx はサーバーエラーです。",
  },
  {
    id: "q202",
    lesson: "lesson92",
    difficulty: "normal",
    question: "HTTP ステータスコードの 5xx 番台が示す意味はどれですか？",
    choices: [
      "クライアントのリクエストに問題がある",
      "リダイレクト処理",
      "サーバー側でエラーが発生した",
      "認証が必要",
    ],
    answer: 2,
    explanation:
      "5xx はサーバーエラーを示します。4xx はクライアントエラー、3xx はリダイレクト、2xx は成功を示します。",
  },

  // lesson93: DevTools の読み方
  {
    id: "q203",
    lesson: "lesson93",
    difficulty: "easy",
    question: "Chrome DevTools でページのすべての HTTP リクエストを確認できるタブはどれですか？",
    choices: ["Elements", "Console", "Network", "Sources"],
    answer: 2,
    explanation:
      "Network タブでは、ページが発行した全リクエストのステータス・ヘッダー・タイミングなどを確認できます。",
  },
  {
    id: "q204",
    lesson: "lesson93",
    difficulty: "normal",
    question: "Chrome DevTools の Application タブで確認できないものはどれですか？",
    choices: ["LocalStorage の中身", "Cookie の一覧", "HTTP リクエストのレスポンスタイム", "SessionStorage の中身"],
    answer: 2,
    explanation:
      "HTTP リクエストのレスポンスタイムは Network タブで確認します。Application タブは Cookie / LocalStorage / SessionStorage / IndexedDB などのストレージ管理画面です。",
  },

  // lesson94: HTTP キャッシュ
  {
    id: "q205",
    lesson: "lesson94",
    difficulty: "normal",
    question: "`Cache-Control: no-store` の意味はどれですか？",
    choices: [
      "毎回サーバーに確認するが、変わっていなければキャッシュを使う",
      "一切キャッシュに保存しない",
      "中間キャッシュ（CDN など）のみ禁止",
      "1 分間だけキャッシュする",
    ],
    answer: 1,
    explanation:
      "`no-store` はレスポンスをどこにも保存しないよう指示します。毎回サーバーから取得が必要です。`no-cache` とは異なり、`no-cache` は保存はするがサーバー確認が必要です。",
  },
  {
    id: "q206",
    lesson: "lesson94",
    difficulty: "hard",
    question: "ブラウザが `ETag` を使って **キャッシュの再検証（条件付きリクエスト）** をするとき、送るリクエストヘッダーはどれですか？",
    choices: [
      "Cache-Control: no-cache",
      "If-None-Match: <ETagの値>",
      "If-Modified-Since: <日時>",
      "Vary: Accept",
    ],
    answer: 1,
    explanation:
      "ETag を使った再検証では、ブラウザは `If-None-Match` ヘッダーに前回受け取った ETag 値を付けてリクエストします。サーバー側のリソースが変わっていなければ `304 Not Modified` が返り、ボディは送られません。",
  },

  // lesson95: CDN
  {
    id: "q207",
    lesson: "lesson95",
    difficulty: "normal",
    question: "CDN がページ配信を高速にできる理由として最も正しいのはどれですか？",
    choices: [
      "サーバーのコード実行を最適化するから",
      "ユーザーに地理的に近いエッジサーバーにコンテンツをキャッシュして配信するから",
      "HTML を圧縮するから",
      "DNS 解決を不要にするから",
    ],
    answer: 1,
    explanation:
      "CDN は世界各地のエッジサーバーにコンテンツをキャッシュし、ユーザーに最も近いサーバーから配信することでレイテンシを下げます。",
  },
  {
    id: "q208",
    lesson: "lesson95",
    difficulty: "hard",
    question: "`Cache-Control: s-maxage=3600` の `s-maxage` は何を意味しますか？",
    choices: [
      "ブラウザのキャッシュ有効期限（秒）",
      "CDN などの共有キャッシュの有効期限（秒）",
      "Service Worker のキャッシュ有効期限",
      "セッションの最大継続時間",
    ],
    answer: 1,
    explanation:
      "`s-maxage` は共有キャッシュ（CDN など）専用の有効期限です。ブラウザキャッシュには `max-age` が使われ、`s-maxage` はそれを上書きします。",
  },

  // lesson96: HTTP/2 / HTTP/3
  {
    id: "q209",
    lesson: "lesson96",
    difficulty: "normal",
    question: "HTTP/2 が HTTP/1.1 と比べて改善した点として最も正しいのはどれですか？",
    choices: [
      "暗号化（HTTPS）が必須になった",
      "1 接続で複数のリクエストを同時に処理できる多重化を導入した",
      "UDP を使うようになった",
      "HTML の構文を変更した",
    ],
    answer: 1,
    explanation:
      "HTTP/2 の多重化（multiplexing）により、1 つの TCP 接続で複数リクエストを同時に処理できます。HTTP/1.1 のHead-of-Line ブロッキング問題を解消しました。",
  },
  {
    id: "q210",
    lesson: "lesson96",
    difficulty: "hard",
    question: "HTTP/3 が HTTP/2 と比べて異なる特徴はどれですか？",
    choices: [
      "多重化を廃止した",
      "UDP ベースの QUIC プロトコルを使い、パケットロスへの耐性を高めた",
      "暗号化をオプションにした",
      "ヘッダー圧縮を廃止した",
    ],
    answer: 1,
    explanation:
      "HTTP/3 は TCP の代わりに UDP 上の QUIC プロトコルを使います。TCP の Head-of-Line ブロッキングを根本から解消し、パケットロスが起きても他のストリームへの影響を最小化します。",
  },

  // lesson97: Cookie と Web セキュリティ
  {
    id: "q211",
    lesson: "lesson97",
    difficulty: "normal",
    question: "Cookie の `HttpOnly` 属性の役割はどれですか？",
    choices: [
      "HTTPS 接続のみで Cookie を送信する",
      "JavaScript から Cookie にアクセスできないようにする（XSS 対策）",
      "同一サイトからのリクエストにのみ Cookie を送信する",
      "Cookie の有効期限を設定する",
    ],
    answer: 1,
    explanation:
      "`HttpOnly` を付けた Cookie は `document.cookie` で読めなくなります。XSS でスクリプトが実行されても Cookie が盗まれにくくなります。",
  },
  {
    id: "q212",
    lesson: "lesson97",
    difficulty: "hard",
    question: "CSRF（Cross-Site Request Forgery）攻撃への有効な対策はどれですか？",
    choices: [
      "Cookie に `HttpOnly` を付ける",
      "Content Security Policy を設定する",
      "`SameSite=Strict` または `SameSite=Lax` を Cookie に付ける",
      "HTTPS を使う",
    ],
    answer: 2,
    explanation:
      "CSRF は別サイトからのリクエストに Cookie が付与されることを悪用します。`SameSite` 属性を設定すると、クロスサイトリクエストへの Cookie 送信を制限でき CSRF を防げます。",
  },
];
