# lesson53: Vercel にデプロイする

## ゴール

- StackBlitz で作ったプロジェクトを GitHub リポジトリに保存できます。
- そのリポジトリを Vercel に接続して、数十秒でデプロイできます。
- 発行された `https://<project>.vercel.app` の URL をブラウザで開き、動作確認できます。
- 本番の永続化には DB が必要であることを理解し、本コース範囲の割り切りを押さえます。

## 解説

### 今までは「自分のブラウザでしか見えない」状態

StackBlitz のプレビュー URL は、自分が開いているブラウザ内で動いているものです。他の人に送っても見られません（厳密には StackBlitz の共有 URL で見せることもできますが、ログインやプロジェクトのセットアップが要ります）。

Web アプリを他人に見せるには、**サーバーに置いて公開する** 必要があります。このサーバーを用意するサービスとして、Next.js を最もスムーズに扱えるのが **Vercel** です。Next.js を作っている会社でもあるので、設定項目はほぼゼロで済みます。

### 3 ステップの全体像

以下の 3 つのサービスを繋ぎます。

1. **StackBlitz**: コードを書いている場所です。
2. **GitHub**: コードを保存する「倉庫」です。バージョン管理と共有のハブです。
3. **Vercel**: GitHub の倉庫を見張って、変更があると自動でビルド・公開してくれます。

流れはこうです。

```
StackBlitz → GitHub → Vercel → https://<project>.vercel.app
```

一度繋いでしまえば、以後はコードを更新するたびに自動で反映されます。

### アカウントが 2 つ必要

- **GitHub アカウント**: 無料です。既に持っていれば再利用します。
- **Vercel アカウント**: GitHub でログインできるので、実質 GitHub アカウントだけあれば OK です。

## 演習

### 前回のプロジェクトを開く

lesson52 で仕上げた StackBlitz の Next.js プロジェクトを開きましょう。

### 手順 1: GitHub アカウントを用意

1. <https://github.com/> にアクセスします。
2. 既にアカウントがあればログインします。なければ右上「Sign up」から作成します。メール認証まで済ませましょう。

### 手順 2: StackBlitz から GitHub に保存

1. StackBlitz 画面の上部（プロジェクト名の右あたり）にある **「Connect Repository」** または **「Fork to GitHub」** というボタンを探します（UI は時期によって少し変わります）。見つからない場合は左サイドバーの「Share」や「...」メニュー内を確認しましょう。
2. 初回は GitHub との接続許可を求められます。「Authorize StackBlitz」で許可します。
3. 保存先のリポジトリ名を指定します。例: `my-next-todo`。
4. 「Create Repository」または「Push」で確定すると、GitHub に新しいリポジトリが作られ、現在のコードがコミット・プッシュされます。
5. <https://github.com/> の自分のダッシュボードに戻ると、`my-next-todo` が出ているはずです。

> うまく行かないとき: StackBlitz の Fork 機能が使えない場合は、ローカルにダウンロード（「Download」ボタン）→ ローカルで `git init` & `git push` する手動ルートもある。本コース想定は前者。

### 手順 3: Vercel アカウントを作る

1. <https://vercel.com/> にアクセスします。
2. 「Sign Up」→ **「Continue with GitHub」** を選びます。GitHub アカウントで Vercel にログインします。
3. 必要なら Vercel にメール認証を済ませましょう。

### 手順 4: Vercel で新しいプロジェクトを作る

1. Vercel のダッシュボードで **「Add New...」→「Project」** をクリックします。
2. GitHub リポジトリの一覧が出ます。手順 2 で作った `my-next-todo` を **「Import」** します。
   - 初回は Vercel が GitHub のどのリポジトリにアクセスして良いか聞いてきます。対象リポジトリだけを許可すれば十分です（「Only select repositories」で `my-next-todo` のみ選択）。
3. 設定画面が出ます。
   - **Framework Preset**: 自動で `Next.js` と判定されているはずです。そのままにします。
   - **Root Directory**: デフォルトのままにします。
   - **Build and Output Settings**: デフォルトのままにします（`next build` で動きます）。
   - **Environment Variables**: 本コースでは使いません。空で OK です。
4. 画面下の **「Deploy」** をクリックします。
5. 数十秒〜1 分ほど、ビルドログが流れます。成功すると「Congratulations!」画面が表示されます。

### 手順 5: 公開 URL を確認

1. Vercel の「Dashboard」→ プロジェクト名（`my-next-todo`）をクリックします。
2. 画面上部に **`https://my-next-todo-xxxx.vercel.app`** のような URL が出ています。
3. クリックして開きます。

### 期待出力

- `https://<project>.vercel.app` にアクセスすると、StackBlitz で見ていたのと同じ TODO アプリが表示されます。
- 「TODO 一覧」で追加・削除・詳細遷移が動きます。
- `/about` にアクセスすると自己紹介ページが出ます。
- ナビの `<Link>` でページ遷移ができます。
- URL を別のブラウザや友人に送っても、同じアプリが見えます。

### 更新を反映する

GitHub にプッシュするだけで、Vercel が自動で検知して再デプロイしてくれます。

1. StackBlitz でコードを少し変えます（例: トップページの `<h1>` の文言を変える）。
2. StackBlitz の「Commit & Push」または「Sync」ボタンで GitHub に反映します。
3. 数十秒待ちます。
4. Vercel のダッシュボードで「Deployments」タブを見ると、新しいビルドが走っています。
5. 完了するとブラウザで公開 URL を再読み込み → 変更が反映されています。

### よくある躓き

- ビルドが `Error: Module not found` で落ちる → StackBlitz 上で見えていないファイル（大文字小文字の違いなど）が原因のことが多いです。ローカルのファイル名と import 文の大文字小文字を揃えましょう。
- 「Authorization required」と出る → GitHub 連携で「Only select repositories」で該当リポジトリを許可します。
- デプロイは成功するがページが真っ白 → ブラウザの DevTools Console にエラーが出ていないか確認しましょう。本コース範囲なら `"use client"` の付け忘れが多いです。
- TODO を追加してもリロードすると消える → 次項の通り、サーバーレス環境ではインメモリ配列が保持されません。

### 注意: 本番ではデータが保持されない

本コースでは `app/actions.ts` の `const todos: Todo[] = []` という **メモリ上の配列** でデータを持っていました。

- **StackBlitz**: 開発サーバーがプロセスを継続するので、リロードしても保持されます。プロジェクトを閉じ直したら消えます。
- **Vercel**: Vercel の Next.js は **サーバーレス関数** として実行されます。リクエストが来るたびに別のプロセスで動く可能性があり、**配列の中身は呼び出しをまたいで保持されない** ことが多いです。結果として、追加した直後は見えてもしばらく経つと消えて見える、といった動きになります。

本物のアプリでは **データベース** を使って永続化します。例: Vercel Postgres、Supabase、PlanetScale、Neon など。本コースでは扱いませんが、次のステップとして「`actions.ts` の配列を DB 呼び出しに置き換えていけば本物のアプリになる」と覚えておきましょう。

### 自分で書く

1. トップページ `app/page.tsx` を、現在のアプリの簡単な説明ページに書き換えましょう。例: 「自己紹介 + TODO メモの練習アプリ」。
2. StackBlitz で変更 → GitHub へ Push → Vercel の自動デプロイ、の一連の流れをもう 1 回踏んで、URL 先の変化を確認しましょう。
3. 公開 URL を自分の別端末（スマホなど）で開いてみましょう。

## まとめ

- StackBlitz → GitHub → Vercel の 3 ステップで、作った Next.js アプリを世界に公開できます。
- 初回の接続だけ手数がかかりますが、以後は Git に push すれば自動デプロイです。
- 本コースの擬似永続化（インメモリ配列）は Vercel では保持されません。本番の永続化には DB が必要です（本コースでは扱いません）。
- ここでコースは終わりです。Next.js（App Router）で「フォーム + データ表示 + ルーティング」の小さなアプリを自分で作り、公開するところまで辿り着きました。
- 次に進みたい学習者へのおすすめ:
  - データベース連携（Vercel Postgres、Supabase など）で永続化を本物にする
  - 認証（NextAuth、Clerk など）を足して「自分の TODO」を作る
  - スタイリングを Tailwind CSS や CSS Modules に寄せる
  - React の他のフック（`useReducer`、`useContext`、`useMemo`）を触る
