# lesson87: Vercel にデプロイする

これまでに作った Next.js プロジェクトを、SNS で共有できる本番 URL として公開します。本レッスンは「自分が StackBlitz で動かしている Next.js アプリを Vercel に乗せる」という **公開フロー** を体験するのが目的で、特定のアプリ内容は前提にしません（過去レッスンの完成品でも、シンプルな Hello World でも構いません）。

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

### 途中から始める場合

これまでのレッスンで作った Next.js プロジェクトがあれば、それをそのまま使えます。手元に無くても問題ありません。新規 StackBlitz の Next.js テンプレート（<https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/hello-world>）を開けば、Hello World レベルのプロジェクトでも公開フロー自体は同じように体験できます。

Vercel デプロイの手順（GitHub 連携・Import・Deploy ボタン）はプロジェクトの中身に依存しません。本レッスンの目的は **「自分の Next.js プロジェクトを Vercel に乗せる流れ」を一度通すこと** なので、画面の中身は何でも構いません。

### 自分の Next.js プロジェクトを開く

公開したい Next.js プロジェクトを StackBlitz で開きます。これまでのレッスンで作った成果物でも、新規の Hello World テンプレートでも構いません。

### 手順 1: GitHub アカウントを用意

1. <https://github.com/> にアクセスします。
2. 既にアカウントがあればログインします。なければ右上「Sign up」から作成します。メール認証まで済ませましょう。

### 手順 2: StackBlitz から GitHub に保存

1. StackBlitz 画面の上部（プロジェクト名の右あたり）にある **「Connect Repository」** または **「Fork to GitHub」** というボタンを探します（UI は時期によって少し変わります）。見つからない場合は左サイドバーの「Share」や「...」メニュー内を確認しましょう。
2. 初回は GitHub との接続許可を求められます。「Authorize StackBlitz」で許可します。
3. 保存先のリポジトリ名を指定します。例: `my-next-app`。
4. 「Create Repository」または「Push」で確定すると、GitHub に新しいリポジトリが作られ、現在のコードがコミット・プッシュされます。
5. <https://github.com/> の自分のダッシュボードに戻ると、`my-next-app` が出ているはずです。

> うまく行かないとき: StackBlitz の Fork 機能が使えない場合は、ローカルにダウンロード（「Download」ボタン）→ ローカルで `git init` & `git push` する手動ルートもある。本コース想定は前者。

### 手順 3: Vercel アカウントを作る

1. <https://vercel.com/> にアクセスします。
2. 「Sign Up」→ **「Continue with GitHub」** を選びます。GitHub アカウントで Vercel にログインします。
3. 必要なら Vercel にメール認証を済ませましょう。

### 手順 4: Vercel で新しいプロジェクトを作る

1. Vercel のダッシュボードで **「Add New...」→「Project」** をクリックします。
2. GitHub リポジトリの一覧が出ます。手順 2 で作った `my-next-app` を **「Import」** します。
   - 初回は Vercel が GitHub のどのリポジトリにアクセスして良いか聞いてきます。対象リポジトリだけを許可すれば十分です（「Only select repositories」で `my-next-app` のみ選択）。
3. 設定画面が出ます。
   - **Framework Preset**: 自動で `Next.js` と判定されているはずです。そのままにします。
   - **Root Directory**: デフォルトのままにします。
   - **Build and Output Settings**: デフォルトのままにします（`next build` で動きます）。
   - **Environment Variables**: 本コースでは使いません。空で OK です。
4. 画面下の **「Deploy」** をクリックします。
5. 数十秒〜1 分ほど、ビルドログが流れます。成功すると「Congratulations!」画面が表示されます。

### 手順 5: 公開 URL を確認

1. Vercel の「Dashboard」→ プロジェクト名（`my-next-app`）をクリックします。
2. 画面上部に **`https://my-next-app-xxxx.vercel.app`** のような URL が出ています。
3. クリックして開きます。

### 期待出力

- `https://<project>.vercel.app` にアクセスすると、StackBlitz で見ていたのと同じ画面が表示されます。
- 自分のプロジェクトに含まれる機能（ページ遷移、フォーム、データ表示など）がそのまま動きます。
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
- 投稿系の機能でデータがリロード後に消える → 次項の通り、サーバーレス環境ではモジュールトップレベルの配列が保持されません。

### 注意: 本番ではメモリ上のデータが保持されない

学習中のコードで「Server Actions の最小形」のように `const items: Item[] = []` のような **モジュール先頭の配列** でデータを持っていた場合、Vercel に乗せると挙動が変わります。

- **StackBlitz**: 開発サーバーがプロセスを継続するので、リロードしても保持されます。プロジェクトを閉じ直したら消えます。
- **Vercel**: Vercel の Next.js は **サーバーレス関数** として実行されます。リクエストが来るたびに別のプロセスで動く可能性があり、**配列の中身は呼び出しをまたいで保持されない** ことが多いです。インスタンスが複数並行で動くと、ユーザー A が追加したデータがユーザー B のインスタンスには見えません。コールドスタートでインスタンスが落ちると配列ごと消えます。

本物のアプリでは **データベース** を使って永続化します。例: Vercel Postgres、Supabase、PlanetScale、Neon など。ユーザー単位なら `cookies()` 経由のセッションに永続化する手もあります。本コースでは扱いませんが、次のステップとして「サーバー側のメモリ配列を DB 呼び出しに置き換えていけば本物のアプリになる」と覚えておきましょう。

### 自分で書く

1. トップページ `app/page.tsx` を、現在のアプリの簡単な説明ページに書き換えましょう。
2. StackBlitz で変更 → GitHub へ Push → Vercel の自動デプロイ、の一連の流れをもう 1 回踏んで、URL 先の変化を確認しましょう。
3. 公開 URL を自分の別端末（スマホなど）で開いてみましょう。

## まとめ

- StackBlitz → GitHub → Vercel の 3 ステップで、作った Next.js アプリを世界に公開できます。
- 初回の接続だけ手数がかかりますが、以後は Git に push すれば自動デプロイです。
- サーバー側のモジュールトップレベル配列など、メモリで保持していたデータは Vercel では保持されません。本番の永続化には DB が必要です（本コースでは扱いません）。
- 次に進みたい学習者へのおすすめ:
  - データベース連携（Vercel Postgres、Supabase など）で永続化を本物にする
  - 認証（NextAuth、Clerk など）を足してログインできるアプリにする
  - スタイリングを Tailwind CSS や CSS Modules に寄せる
  - React の他のフック（`useReducer`、`useContext`、`useMemo`）を触る
