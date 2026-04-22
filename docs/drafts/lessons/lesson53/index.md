# lesson53: Vercel にデプロイする

## ゴール

- StackBlitz で作ったプロジェクトを GitHub リポジトリに保存できる。
- そのリポジトリを Vercel に接続して、数十秒でデプロイできる。
- 発行された `https://<project>.vercel.app` の URL をブラウザで開き、動作確認できる。
- 本番の永続化には DB が必要であることを理解し、本コース範囲の割り切りを押さえる。

## 解説

### 今までは「自分のブラウザでしか見えない」状態

StackBlitz のプレビュー URL は、自分が開いているブラウザ内で動いているもの。他の人に送っても見られない（厳密には StackBlitz の共有 URL で見せることもできるが、ログインやプロジェクトのセットアップが要る）。

Web アプリを他人に見せるには、**サーバーに置いて公開する** 必要がある。このサーバーを用意するサービスとして、Next.js を最もスムーズに扱えるのが **Vercel**。Next.js を作っている会社でもあるので、設定項目はほぼゼロで済む。

### 3 ステップの全体像

以下の 3 つのサービスを繋ぐ。

1. **StackBlitz**: コードを書いている場所。
2. **GitHub**: コードを保存する「倉庫」。バージョン管理と共有のハブ。
3. **Vercel**: GitHub の倉庫を見張って、変更があると自動でビルド・公開してくれる。

流れはこう。

```
StackBlitz → GitHub → Vercel → https://<project>.vercel.app
```

一度繋いでしまえば、以後はコードを更新するたびに自動で反映される。

### アカウントが 2 つ必要

- **GitHub アカウント**: 無料。既に持っていれば再利用。
- **Vercel アカウント**: GitHub でログインできるので、実質 GitHub アカウントだけあれば OK。

## 演習

### 前回のプロジェクトを開く

lesson52 で仕上げた StackBlitz の Next.js プロジェクトを開く。

### 手順 1: GitHub アカウントを用意

1. <https://github.com/> にアクセス。
2. 既にアカウントがあればログイン。なければ右上「Sign up」から作成。メール認証まで済ませる。

### 手順 2: StackBlitz から GitHub に保存

1. StackBlitz 画面の上部（プロジェクト名の右あたり）にある **「Connect Repository」** または **「Fork to GitHub」** というボタンを探す（UI は時期によって少し変わる）。見つからない場合は左サイドバーの「Share」や「...」メニュー内を確認する。
2. 初回は GitHub との接続許可を求められる。「Authorize StackBlitz」で許可する。
3. 保存先のリポジトリ名を指定する。例: `my-next-todo`。
4. 「Create Repository」または「Push」で確定すると、GitHub に新しいリポジトリが作られ、現在のコードがコミット・プッシュされる。
5. <https://github.com/> の自分のダッシュボードに戻ると、`my-next-todo` が出ているはず。

> うまく行かないとき: StackBlitz の Fork 機能が使えない場合は、ローカルにダウンロード（「Download」ボタン）→ ローカルで `git init` & `git push` する手動ルートもある。本コース想定は前者。

### 手順 3: Vercel アカウントを作る

1. <https://vercel.com/> にアクセス。
2. 「Sign Up」→ **「Continue with GitHub」** を選ぶ。GitHub アカウントで Vercel にログイン。
3. 必要なら Vercel にメール認証を済ませる。

### 手順 4: Vercel で新しいプロジェクトを作る

1. Vercel のダッシュボードで **「Add New...」→「Project」** をクリック。
2. GitHub リポジトリの一覧が出る。手順 2 で作った `my-next-todo` を **「Import」**。
   - 初回は Vercel が GitHub のどのリポジトリにアクセスして良いか聞いてくる。対象リポジトリだけを許可すれば十分（「Only select repositories」で `my-next-todo` のみ選択）。
3. 設定画面が出る。
   - **Framework Preset**: 自動で `Next.js` と判定されているはず。そのまま。
   - **Root Directory**: デフォルトのまま。
   - **Build and Output Settings**: デフォルトのまま（`next build` で動く）。
   - **Environment Variables**: 本コースでは使わない。空で OK。
4. 画面下の **「Deploy」** をクリック。
5. 数十秒〜1 分ほど、ビルドログが流れる。成功すると「Congratulations!」画面が表示される。

### 手順 5: 公開 URL を確認

1. Vercel の「Dashboard」→ プロジェクト名（`my-next-todo`）をクリック。
2. 画面上部に **`https://my-next-todo-xxxx.vercel.app`** のような URL が出ている。
3. クリックして開く。

### 期待出力

- `https://<project>.vercel.app` にアクセスすると、StackBlitz で見ていたのと同じ TODO アプリが表示される。
- 「TODO 一覧」で追加・削除・詳細遷移が動く。
- `/about` にアクセスすると自己紹介ページが出る。
- ナビの `<Link>` でページ遷移ができる。
- URL を別のブラウザや友人に送っても、同じアプリが見える。

### 更新を反映する

GitHub にプッシュするだけで、Vercel が自動で検知して再デプロイしてくれる。

1. StackBlitz でコードを少し変える（例: トップページの `<h1>` の文言を変える）。
2. StackBlitz の「Commit & Push」または「Sync」ボタンで GitHub に反映。
3. 数十秒待つ。
4. Vercel のダッシュボードで「Deployments」タブを見ると、新しいビルドが走っている。
5. 完了するとブラウザで公開 URL を再読み込み → 変更が反映されている。

### よくある躓き

- ビルドが `Error: Module not found` で落ちる → StackBlitz 上で見えていないファイル（大文字小文字の違いなど）が原因のことが多い。ローカルのファイル名と import 文の大文字小文字を揃える。
- 「Authorization required」と出る → GitHub 連携で「Only select repositories」で該当リポジトリを許可する。
- デプロイは成功するがページが真っ白 → ブラウザの DevTools Console にエラーが出ていないか確認。本コース範囲なら `"use client"` の付け忘れが多い。
- TODO を追加してもリロードすると消える → 次項の通り、サーバーレス環境ではインメモリ配列が保持されない。

### 注意: 本番ではデータが保持されない

本コースでは `app/actions.ts` の `const todos: Todo[] = []` という **メモリ上の配列** でデータを持っていた。

- **StackBlitz**: 開発サーバーがプロセスを継続するので、リロードしても保持される。プロジェクトを閉じ直したら消える。
- **Vercel**: Vercel の Next.js は **サーバーレス関数** として実行される。リクエストが来るたびに別のプロセスで動く可能性があり、**配列の中身は呼び出しをまたいで保持されない** ことが多い。結果として、追加した直後は見えてもしばらく経つと消えて見える、といった動きになる。

本物のアプリでは **データベース** を使って永続化する。例: Vercel Postgres、Supabase、PlanetScale、Neon など。本コースでは扱わないが、次のステップとして「`actions.ts` の配列を DB 呼び出しに置き換えていけば本物のアプリになる」と覚えておく。

### 自分で書く

1. トップページ `app/page.tsx` を、現在のアプリの簡単な説明ページに書き換える。例: 「自己紹介 + TODO メモの練習アプリ」。
2. StackBlitz で変更 → GitHub へ Push → Vercel の自動デプロイ、の一連の流れをもう 1 回踏んで、URL 先の変化を確認する。
3. 公開 URL を自分の別端末（スマホなど）で開いてみる。

## まとめ

- StackBlitz → GitHub → Vercel の 3 ステップで、作った Next.js アプリを世界に公開できる。
- 初回の接続だけ手数がかかるが、以後は Git に push すれば自動デプロイ。
- 本コースの擬似永続化（インメモリ配列）は Vercel では保持されない。本番の永続化には DB が必要（本コースでは扱わない）。
- ここでコースは終わり。Next.js（App Router）で「フォーム + データ表示 + ルーティング」の小さなアプリを自分で作り、公開するところまで辿り着いた。
- 次に進みたい学習者へのおすすめ:
  - データベース連携（Vercel Postgres、Supabase など）で永続化を本物にする。
  - 認証（NextAuth、Clerk など）を足して「自分の TODO」を作る。
  - スタイリングを Tailwind CSS や CSS Modules に寄せる。
  - React の他のフック（`useReducer`、`useContext`、`useMemo`）を触る。
