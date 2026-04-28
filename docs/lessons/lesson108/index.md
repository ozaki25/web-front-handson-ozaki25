# lesson108: Git の基本操作

## ゴール

- Git が「ファイルの履歴を残す」道具であることを説明できる
- 基本コマンド（`init` / `add` / `commit` / `status` / `log` / `diff`）を使える
- ブランチ（`branch` / `checkout` / `switch` / `merge`）の概念を理解する
- リモート（`remote` / `push` / `pull` / `fetch`）の基本を使える
- `.gitignore` でコミットしないファイルを除外できる
- マージコンフリクトの解消手順を 1 度経験する

## 解説

### Git とは

**Git** は **分散型のバージョン管理システム** です。「ファイルの状態をスナップショットとして保存し、いつでも過去に戻れる」道具と思ってください。

なぜ必要か:

- **元に戻せる**: 「あ、消したけどやっぱり要る」「3 日前の状態に戻したい」が秒でできる
- **誰がいつ何を変えたか分かる**: バグの原因を「いつ入った？」で追跡できる
- **複数人で並行開発**: 各自が **ブランチ** で作業し、最後に合体できる
- **PR ベースの開発**: コードレビューを経てマージする現代的なフローの土台

2026 年現在、ほぼすべての開発現場で Git が使われています。「Git が分からない = 仕事ができない」と言って良いレベルの基本です。

### リポジトリ（repository）と作業ディレクトリ

- **リポジトリ**（repo）: Git が履歴を管理する単位。プロジェクトのルートディレクトリに `.git/` フォルダができ、ここにすべての履歴が入る
- **作業ディレクトリ**: あなたが今編集しているファイル群

### `git init` で履歴管理を開始

新規プロジェクトを Git 管理下に置くには:

```bash
mkdir my-project
cd my-project
git init
```

`.git/` ディレクトリが作られ、Git の世界に入ります。既存のプロジェクトを Git 管理下に置きたい時も同じです。

### 3 つのエリア（変更が辿る道）

Git では変更が次の 3 段階を辿ります。

```
作業ディレクトリ          ステージング         リポジトリ（履歴）
（編集中のファイル）  →  （add した変更）  →  （commit した変更）
       │                      │                      │
       └─ git add ─────────────                       │
       └─ git commit -m "..." ────────────────────────┘
```

- **作業ディレクトリ**: ファイルを編集しただけの状態。Git はまだ気にしない
- **ステージング**: `git add` で変更を「次の commit に含める」と予約した状態
- **リポジトリ**: `git commit` で履歴に固定された状態

### 基本コマンド

#### `git status`: 今の状態を確認

```bash
git status
```

未追跡ファイル（Untracked）/ 変更されたファイル（Modified）/ ステージングされたファイル（Staged）が表示されます。**迷ったらまず `git status`** が鉄則です。

#### `git add`: ステージングに追加

```bash
git add file.txt        # 1 ファイル
git add src/            # ディレクトリ全部
git add .               # 現在ディレクトリ以下全部（注意: 不要なファイルまで含めがち）
```

#### `git commit`: 履歴に固定

```bash
git commit -m "ボタンの色を変更"
```

`-m` でコミットメッセージを指定。**過去の人 + 未来の自分** が読めるよう、何のための変更か簡潔に書きます。

#### `git log`: 履歴を見る

```bash
git log              # 詳しく見る
git log --oneline    # 1 行ずつ簡潔に
git log --graph      # ブランチをグラフで
git log --oneline --graph --all   # 全ブランチを 1 行 + グラフ
```

#### `git diff`: 変更内容を見る

```bash
git diff              # 作業ディレクトリ vs ステージング
git diff --staged     # ステージング vs リポジトリ
git diff HEAD~1 HEAD  # 1 つ前のコミット vs 今のコミット
```

### `.gitignore` でコミット対象を絞る

`node_modules/` や `.env` のような **コミットしてはいけないファイル** をリストにします。

`.gitignore`（プロジェクトルート）:

```
# 依存パッケージ（巨大、再生成可能）
node_modules/

# ビルド成果物
dist/
build/

# 環境変数（秘匿）。.env* で派生形（.env.local, .env.production.local など）も含めて除外
.env
.env.*
!.env.example

# OS のメタファイル
.DS_Store
Thumbs.db

# エディタ
.vscode/
.idea/
```

`.gitignore` 自体は **コミットする** 必要があります。これをチームで共有することで全員の環境が揃います。`.env.example` はテンプレートとしてコミットしたいので `!.env.example` で除外を打ち消しています。

> **補足: `.env` を間違えて push したら revert ではなく secret rotation が先**: `.env` を 1 度でも push してしまうと、`git revert` で履歴を取り消しても **過去のコミットには値が残ったまま**で、git history を遡れば誰でも読めます。**まずやるべきは「漏れた値を無効化（rotation）すること」**: API キーは新しいキーに発行し直す、DB のパスワードを変える、トークンを revoke する。GitHub には自動で漏洩を検出する **secret scanning** や、push の時点で止める **push protection** がありますが、自分の責任範囲で値を rotate することが最優先です。履歴自体を消すには `git filter-repo` / `BFG Repo-Cleaner` などのツールが必要で、共有リポジトリでは全員に強制 push の調整が要るため、**「キーは漏れたものとして扱い、すぐ rotate する」のが現実的な初手**です。

### ブランチ: 並行作業の単位

**ブランチ**は「履歴の枝分かれ」です。デフォルトブランチは `main`（昔は `master`）。新機能やバグ修正は **別ブランチで作業 → 完成したら main にマージ** が現代の流儀です。

#### ブランチを作って切り替える

```bash
# 旧来の書き方
git branch feature/login
git checkout feature/login

# 現代の書き方（Git 2.23 以降推奨）
git switch -c feature/login   # -c は「create」
```

`feature/login` ブランチに切り替わり、ここでの commit は `main` には影響しません。

#### ブランチを切り替える

```bash
git switch main
git switch feature/login
```

`switch` は新しい専用コマンド。`checkout` でも同じことができますが、`checkout` は他の用途（ファイル復元など）も兼ねるので役割が分かれた `switch` の方が明確です。

#### ブランチを一覧

```bash
git branch          # ローカルブランチ
git branch -a       # リモート含む全部
```

### マージ: ブランチを統合

`feature/login` での作業が終わったら、main に統合します。

```bash
git switch main
git merge feature/login
```

これで `feature/login` の変更が `main` に取り込まれます。**競合がなければ 1 行で済む**、ある場合は次の節で説明します。

### マージコンフリクト

両方のブランチで **同じ行** を変更していると、Git は自動で統合できず **コンフリクト**（競合）として人間に判断を仰ぎます。

```
<<<<<<< HEAD
const message = "こんにちは";
=======
const message = "Hello";
>>>>>>> feature/login
```

このマーカーが入ったファイルを開き、**どちらを採用するか / 両方を組み合わせるか** を編集して保存します。マーカー（`<<<<<<<` / `=======` / `>>>>>>>`）も削除して、最終的に欲しい内容にします。

```js
const message = "Hello, こんにちは";  // 例: 両方を統合
```

その後:

```bash
git add path/to/conflicted-file.js
git commit                # メッセージは自動で生成されるので、エディタが開いたらそのまま保存
```

### リモートリポジトリ（GitHub / GitLab）

`git init` したリポジトリは、自分の PC だけにしかありません。**リモート**（GitHub などのサーバー）に置くと、複数人で共有・バックアップできます。

#### リモートを追加

GitHub で空の repo を作って、ローカルから紐付け:

```bash
git remote add origin https://github.com/your-name/your-repo.git
```

`origin` は **リモートの名前**。慣習でリモートは `origin` と呼ばれます。

#### push: ローカル → リモート

```bash
git push -u origin main
```

`-u` は upstream 設定で、初回のみ必要。次回以降は `git push` だけで OK。

#### pull: リモート → ローカル

```bash
git pull origin main
```

これは内部で `fetch`（取得）+ `merge`（統合）の 2 段階を 1 つで実行します。

#### fetch: リモートの内容だけ取得

```bash
git fetch origin
```

リモートの履歴をローカルに取り込むが、まだ自分のブランチには適用しません。中身を確認してから merge / rebase したい時に使います。

### よくある初学者のつまずき

1. **`git add .` で `node_modules/` までステージング**: `.gitignore` を最初に書いておく
2. **コミットメッセージが「修正」「更新」だけ**: 後から検索しても分からない。「なぜ」を 1 行で
3. **main で直接作業**: ブランチを切る習慣を最初から
4. **`.env` を push してしまう**: `.gitignore` の最重要項目。secrets が漏れる

### 設定の基本

最初の 1 回だけ:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

これがないと commit で「誰が」が記録できません。

## 演習

### ゴール

- ローカルで Git リポジトリを作って commit を 3 回打つ
- ブランチを作って別の変更を入れ、main にマージする
- わざとコンフリクトを起こして解消する

### 途中から始める場合

ローカル環境（StackBlitz の WebContainer 上でも可）で Git が使えれば OK。

### 手順 1: リポジトリを初期化

```bash
mkdir git-practice
cd git-practice
git init
```

### 手順 2: ファイルを作って 1 回目の commit

`README.md`:

```md
# Git 練習用リポジトリ
```

```bash
git add README.md
git commit -m "README を追加"
```

### 手順 3: ファイルを増やして 2 回目の commit

`hello.txt`:

```
Hello, Git!
```

```bash
git status              # 変更が見える
git add hello.txt
git commit -m "hello.txt を追加"
git log --oneline       # 2 件の履歴が見える
```

### 手順 4: ブランチで作業

```bash
git switch -c feature/greeting
# hello.txt を編集 → 「Hello, Git! こんにちは。」 に
git add hello.txt
git commit -m "挨拶を日本語追記"
```

### 手順 5: main に切り替えて、main 側でも変更

```bash
git switch main
# hello.txt を編集 → 「Hello, Git!! ビックリマーク追加」 に
git add hello.txt
git commit -m "ビックリマーク追加"
```

これで `main` と `feature/greeting` で **同じ行を別々に変更** した状態になりました。

### 手順 6: マージ → コンフリクト発生

```bash
git merge feature/greeting
```

エラーが出ます:

```
Auto-merging hello.txt
CONFLICT (content): Merge conflict in hello.txt
Automatic merge failed; fix conflicts and then commit the result.
```

`hello.txt` を開くと:

```
<<<<<<< HEAD
Hello, Git!! ビックリマーク追加
=======
Hello, Git! こんにちは。
>>>>>>> feature/greeting
```

両方を取り込むよう手動で編集:

```
Hello, Git!! こんにちは。ビックリマーク追加
```

```bash
git add hello.txt
git commit               # エディタが開く → 自動メッセージのまま保存
git log --oneline --graph
```

ログを見ると、ブランチが分かれて再合流するグラフが描かれます。

### 期待出力

```
*   1234567 (HEAD -> main) Merge branch 'feature/greeting'
|\
| * abcdef0 (feature/greeting) 挨拶を日本語追記
* | fedcba9 ビックリマーク追加
|/
* 7654321 hello.txt を追加
* 0987654 README を追加
```

### 変える

- `git log --oneline --graph` の出力を眺める。マージしないでブランチを残しておくと、`feature/greeting` ブランチの履歴も別レーンで見える
- `git diff HEAD~1 HEAD` で「直前の commit との差分」を見る
- `.gitignore` に `*.tmp` を書き、`a.tmp` を作って `git status` で除外されることを確認

### 自分で書く

- 新しいブランチ `feature/colors` を作り、`README.md` に「色を変えた」内容を加える。main にマージする
- `git revert HEAD` で **直前のコミットを打ち消す** コミットを作る（履歴は残しつつ変更を取り消す）

## まとめ

- Git はファイル履歴を残す道具。「元に戻せる」「誰が何を変えたか」「並行開発」を可能にする
- 3 つのエリア: 作業ディレクトリ → ステージング（`add`）→ リポジトリ（`commit`）
- 基本コマンド: `init` / `status` / `add` / `commit` / `log` / `diff`
- `.gitignore` で `node_modules` / `.env` 等を除外
- ブランチ（`switch -c name` で作成）→ コミット → main に `merge`
- コンフリクトは `<<<<<<<` / `=======` / `>>>>>>>` を消して解消
- リモート: `remote add origin URL` / `push` / `pull` / `fetch`
