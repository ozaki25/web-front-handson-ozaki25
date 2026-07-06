# lesson115: GitHub の PR とコードレビュー

## ゴール

- GitHub と Git の関係を区別して説明できる
- リモートリポジトリを作成し、ローカル → GitHub に push できる
- ブランチで作業 → Pull Request（PR）作成 → レビュー → マージの流れを理解する
- 良いコミットメッセージと PR タイトルの書き方を知る
- マージ戦略（merge / squash / rebase）の違いを 1 行で言える
- ブランチ保護ルールの目的を説明できる
- `gh` CLI でコマンドラインから PR を操作できることを知る

## 解説

### Git と GitHub は別物

混同されがちですが:

- **Git**: バージョン管理ツール（`git` コマンド本体）
- **GitHub**: Git リポジトリをホスティングする SaaS。PR / Issue / Actions / Projects 等の協業機能付き

似たサービスに **GitLab** / **Bitbucket** / **Codeberg** などがありますが、2026 年時点でデファクトは GitHub です。本コースも GitHub を前提にします。

### リモートリポジトリを作る

#### 1. GitHub で空の repo を作成

1. <https://github.com/new> にアクセス
2. **Repository name** を入力（例: `my-todo-app`）
3. **Public / Private** を選択
4. **Initialize this repository** のチェックは **すべて外す**（後でローカルから push するため）
5. **Create repository**

#### 2. ローカルから push

GitHub の repo 作成後の画面に表示される手順をそのまま実行:

```bash
git remote add origin https://github.com/your-name/my-todo-app.git
git branch -M main
git push -u origin main
```

これでローカルのコミットが GitHub に上がります。`-u`（upstream）はそのブランチの追跡先を記録するので、次回からは `git push` だけで OK。

### Pull Request（PR）の流れ

PR は「**このブランチの変更を main に取り込みたい**、レビューしてください」という依頼書です。現代の開発フローでは **直接 main に push する代わりに** PR を経由するのが基本です。

#### 典型的なフロー

```
1. ローカルでブランチ作成: git switch -c feature/add-login
2. 変更してコミット (1 件 or 複数件)
3. ブランチを GitHub に push: git push -u origin feature/add-login
4. GitHub で PR を作成（main ← feature/add-login）
5. レビュアーがコードをチェック、コメント、修正依頼
6. 必要に応じて修正コミットを追加 push（PR は自動更新）
7. レビュー承認（Approve）
8. main にマージ
9. ブランチを削除（GitHub の UI からワンクリック）
```

#### PR の作り方

`git push` 後に GitHub のリポジトリページを開くと、**「Compare & pull request」** ボタンが出ます。または:

- リポジトリの **Pull requests** タブ → **New pull request**
- ベースブランチ（マージ先）= `main`、比較ブランチ（変更元）= `feature/add-login`
- タイトルと説明を書く → **Create pull request**

### 良いコミットメッセージ・PR タイトル

#### コミットメッセージ

**Why**（なぜ）を中心に書きます。**What**（何）はコードを見れば分かるので最小限で。

NG:

```
修正
変更
fix
```

OK:

```
Login ボタンの色をブランドカラーに統一
useEffect のクリーンアップ漏れで起きていたメモリリークを修正
ヘッダーのレスポンシブ対応（600px 以下で縦並び）
```

書式は **1 行目 50 文字以内** + **空行** + 詳細。最近は **Conventional Commits**（`feat:` / `fix:` / `docs:` などの prefix）も人気です。

```
feat(auth): magic link ログインを追加

メール経由のワンタイム URL でログインできるようにする。
パスワード認証は次のリリースで非推奨化する予定。
```

#### PR タイトル

PR タイトルもコミットメッセージと同じ書き方が良いです。マージ後のコミット履歴に残るので、後から検索できる文言を選びます。

PR 説明（本文）は **「何を変えたか」「なぜ」「どうテストしたか」** の 3 つを書くのが定番です。テンプレート（`.github/pull_request_template.md`）を用意するチームも多いです。

### コードレビュー

#### レビュアーの観点

- **動くか**: ローカルで動かして確認できれば理想
- **読めるか**: 半年後の自分が読んで意味が通るか
- **テストがあるか**: 重要なロジックに自動テストが付いているか
- **影響範囲**: 既存機能を壊していないか
- **セキュリティ**: 入力値検証 / シークレット漏洩 / XSS / SQL インジェクション
- **パフォーマンス**: 明らかに遅くなる書き方をしていないか

#### コメントの書き方

GitHub の **Files changed** タブで、行ごとに `+` ボタンを押すとインラインコメントが書けます。

良いコメント:

```
suggestion: ここは Array.from よりも展開構文の方が読みやすそうです
question: なぜ条件を反転させているか教えてもらえますか？
nit: 命名は `users` より `userList` の方がチームの規約に合いそうです
blocking: ここで input をエスケープしないと XSS の余地があります
```

`suggestion` / `question` / `nit`（nitpick = 些細な指摘）/ `blocking`（マージブロッカー）のような **接頭辞** を使うと、レビュアーの意図が明確で議論が早くなります。

GitHub の **Suggested change** 機能を使うと、コードを直接書き換える提案も送れます。レビュイーは 1 クリックで取り込めます。

### マージ戦略の 3 種類

PR の **Merge** ボタンには 3 つのオプションがあります（リポジトリ設定で許可されているものだけ表示）。

#### 1. Merge commit（既定）

```
*   Merge pull request #42 from feature/login
|\
| * a (feature/login)
| * b
|/
* c (main)
```

ブランチの履歴が残り、マージ用の追加コミット（`Merge pull request ...`）が作られます。

- 利点: 履歴が完全に残る、PR と main の関係が分かりやすい
- 欠点: 履歴グラフが複雑になりやすい

#### 2. Squash and merge

```
* squashed (main) ← feature/login の全 commit を 1 つに圧縮
* c (main)
```

PR の全コミットを **1 つに圧縮** して main に合流させます。

- 利点: main の履歴が線形 + クリーン、1 PR = 1 commit でリバートしやすい
- 欠点: PR 内の細かい履歴が失われる

最近のチームでは **Squash が既定** になることが多いです。本コースの教材サイトもこの方針です。

#### 3. Rebase and merge

PR のコミットを **そのまま順番に** main の上に積みます。マージコミットは作られません。

- 利点: 完全に線形な履歴
- 欠点: PR 中のコミットが個別に main に並ぶので、ノイズが多い場合は読みづらい

### ブランチ保護ルール

GitHub の **Settings → Branches → Branch protection rules** で main ブランチに守りを入れます。

典型的な設定:

- **Require a pull request before merging**: main への直接 push を禁止
- **Require approvals: 1 人以上**: 最低 1 人の Approve を必須化
- **Require status checks to pass**: CI（Lint / Test / Build）が通らないとマージできない
- **Require branches to be up to date**: main の最新を取り込んでから merge
- **Require linear history**: Squash / Rebase 限定にする
- **Restrict pushes that create matching branches**: 特定ブランチ名の作成を制限

これでチームの誰かがうっかり main に push しても、ブロックしてくれます。

### Issue / Discussions / Projects

GitHub には PR 以外にも協業ツールがあります。

- **Issues**: バグ報告 / 機能要望 / TODO の管理
- **Discussions**: Q&A / アイデア共有（Issue より柔らかい場）
- **Projects**: カンバン / ロードマップで Issue / PR を整理
- **Milestones**: リリース単位で Issue / PR をまとめる

本コースでも、機能追加要望や軽微な修正は Issue → PR の流れで管理しています（過去の commit メッセージにも issue 番号が付いている例があります）。

### `gh` CLI

GitHub の操作をコマンドラインからやる公式ツールです。

```bash
# インストール（macOS）
brew install gh

# ログイン（1 回だけ）
gh auth login

# PR を作成
gh pr create --title "feat: login を追加" --body "..."

# PR 一覧
gh pr list

# PR をマージ
gh pr merge --squash
```

ブラウザを開かずに操作できるので、慣れると圧倒的に速いです。

## 演習

### ゴール

- ローカルの Git リポジトリを GitHub に push する
- ブランチで作業 → PR 作成 → 自分でセルフレビュー → マージする
- ブランチ保護ルールを 1 つ設定する

### 手順 1: GitHub アカウント準備

GitHub アカウントを持っていない場合は <https://github.com/> で作成します。SSH キーや Personal Access Token も設定しておきます（公式ガイド: <https://docs.github.com/ja/authentication>）。

### 手順 2: 「Git の基本操作」で作ったリポジトリを push

```bash
cd git-practice    # 「Git の基本操作」で作ったディレクトリ
```

GitHub で空 repo（例: `git-practice`）を作成後:

```bash
git remote add origin https://github.com/your-name/git-practice.git
git branch -M main
git push -u origin main
```

### 手順 3: ブランチで変更 → PR

```bash
git switch -c feature/colors
echo "色を変える予定" >> README.md
git add README.md
git commit -m "docs: 色変更の予定をメモに追加"
git push -u origin feature/colors
```

GitHub のリポジトリページに **「Compare & pull request」** ボタンが出るのでクリック → タイトルと説明を書いて **Create pull request**。

### 手順 4: セルフレビュー

自分で PR の **Files changed** タブを開き、変更を眺めます。気になった行に `+` ボタンでコメントを 1 つ書いてみる（例: `nit: 「予定」より「TODO」の方が一般的かも`）。

### 手順 5: マージ

PR ページ下部の **Merge pull request** → **Squash and merge** を試します。マージ後、`feature/colors` ブランチを削除（**Delete branch** ボタン）。

ローカルでも:

```bash
git switch main
git pull origin main
git branch -d feature/colors    # ローカルブランチも削除
```

### 手順 6: ブランチ保護を 1 つ設定

リポジトリの **Settings** → **Branches** → **Add rule** で:

- **Branch name pattern**: `main`
- **Require a pull request before merging** にチェック
- 保存

これで、これ以降 `main` に直接 push できなくなります。試しに `git push origin main` を直接やろうとすると拒否されます（ブランチ保護を一時解除するか、PR 経由で取り込む必要がある）。

### 期待出力

- GitHub にローカルの履歴がそのまま反映される
- PR 画面で行単位の差分とコメントが表示される
- Squash でマージすると、main の履歴が線形になる（PR の複数 commit が 1 つに圧縮）
- main への直接 push が「Branch protection rules: protected branch」のエラーで拒否される

### 変える

- マージ戦略を **Merge commit** に変えてみる（リポジトリ設定で許可）。グラフが分岐 + 合流の形になる
- PR をマージせず **Close** してみる（後から消したい時の操作）
- Issues タブで Issue を作り、コミットメッセージに `Closes #1` と書いて push してみる。マージ時に Issue が自動で閉じる

### 自分で書く

- リポジトリに `.github/pull_request_template.md` を追加し、PR の説明テンプレートを作る:

  ```md
  ## 概要

  ## 変更内容
  -
  -

  ## テスト
  - [ ] ローカルで動作確認
  - [ ] 単体テスト追加 / 更新
  ```

- `gh` CLI をインストールして、`gh pr create` でブラウザを開かずに PR を作る

## まとめ

- **Git** はバージョン管理ツール、**GitHub** はそれをホスティングする SaaS という別物
- 現代の開発は **PR ベース**: ブランチ作業 → push → PR → レビュー → マージ
- コミットメッセージは **Why を中心に** 1 行 50 文字以内 + 詳細。Conventional Commits も人気
- マージ戦略 3 種: **Merge commit（履歴残す） / Squash（1 commit に圧縮、現代の主流） / Rebase**（線形）
- ブランチ保護ルールで **main への直接 push を禁止 + レビュー必須 + CI 必須**
- `gh` CLI でコマンドラインからほぼ全操作が可能
