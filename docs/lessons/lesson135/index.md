# lesson135: AI を前提にした開発（Claude Code / MCP / Hooks / Skills）

## ゴール

- 2026 年の AI コーディングツールの位置付けを理解する
- Claude Code の主要な拡張機構（**MCP / Hooks / Skills / CLAUDE.md**）を説明できる
- MCP の仕組み（transport / サーバー構成 / 設定）を把握する
- AI 生成コードの典型的な落とし穴を見抜けるようになる
- 「AI に任せる仕事 / 人間がやる仕事」の境界を持てる

## 解説

### 2026 年の前提

「AI を使うか / 使わないか」の議論は 2024〜2025 年で終わりました。**使うのが前提** で、その上で **どう付き合うか** が問われる時代です。

新人エンジニアがコードを書く時、隣に「**経験 10 年の同僚が常時付いている**」状態が AI ツールの実態に近い。

### 主要な AI コーディングツール

| ツール | 形態 | 強み |
|---|---|---|
| **GitHub Copilot** | エディタプラグイン | Tab 補完・PR レビュー統合 |
| **Cursor** | VS Code フォーク IDE | マルチファイルリファクタ・エージェント |
| **Claude Code** | CLI / IDE / Web / API | 長いコンテキスト・MCP / Hooks / Skills |
| **Aider** | CLI | Git ベースの差分管理 |
| **Replit Agent** | ブラウザ完結 | MVP プロトタイプ |

このコース自体も **Claude Code を使って書かれています**（このリポジトリの `CLAUDE.md` がそのコンテキスト）。

### コンテキストを渡す仕組み: `CLAUDE.md`

リポジトリのルートに置く `CLAUDE.md` は、プロジェクトの方針を Claude に伝える定型ファイルです。「読んでいないと分からないこと」を書きます。

```markdown
# CLAUDE.md

## プロジェクト概要
- Next.js 16 (App Router) + TypeScript strict
- パッケージマネージャ: pnpm

## コーディング規約
- React Server Components を優先
- `any` は禁止
- API は tRPC（公開 API は OpenAPI）

## してはいけない
- グローバル CSS の追加
- `git push --force` を main に
- `useMemo` の手動記述（React Compiler に任せる）
```

他のツールにも同等のファイルがあります:

- **`.cursor/rules/`**: Cursor 用（YAML / Markdown 形式）
- **`.github/copilot-instructions.md`**: GitHub Copilot 用

「**良いプロンプト** ではなく、**良いコンテキスト**」が結果を決めます。

---

### MCP（Model Context Protocol）

[MCP](https://modelcontextprotocol.io/) は Anthropic が公開した「**AI に外部ツールを繋ぐ標準プロトコル**」。OpenAI / Google などが採用し、2025〜2026 年で共通規格として定着しました。

#### 全体構造

```
[ Claude Code / Cursor / VS Code Copilot ]
          ↕ MCP プロトコル
  [ MCP サーバー（外部システムごとに 1 つ）]
          ↕
    [ GitHub / Slack / Datadog / 自社 DB / API ]
```

Claude Code などのクライアントと外部システムの間に **MCP サーバーが橋渡し** します。クライアント側は「どんな外部システムか」を知らず、MCP の API だけを呼びます。

#### MCP が提供するもの

| 種類 | 内容 |
|---|---|
| **Tools** | 外部サービスを呼ぶ関数（例: `github__create_pull_request`） |
| **Resources** | コンテキストとして読み込めるデータ（ファイル / DB 行） |
| **Prompts** | 再利用可能なプロンプトテンプレート |

#### transport（通信方式）

MCP の通信路は 2 種類あります。

| transport | 起動形態 | 向いている用途 |
|---|---|---|
| **stdio** | クライアントが `npm exec` や `uvx` で子プロセスとして起動 | ローカル完結のツール（ファイルシステム / Git / DB） |
| **Streamable HTTP** | HTTP サーバーとして常駐 | リモート API・複数クライアントで共有するサーバー |

stdio が最も単純で「コマンドを叩くと JSON を返す」だけの実装で済みます。

#### 設定ファイル: `settings.json`（Claude Code）

Claude Code では `~/.claude/settings.json`（グローバル）またはプロジェクト直下の `.claude/settings.json`（ローカル）に MCP サーバーを登録します。

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    }
  }
}
```

#### 設定ファイル: `claude_desktop_config.json`（Claude Desktop）

デスクトップアプリ版は `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）に書きます。フォーマットは Claude Code と同じ。

#### MCP サーバーを自作する

最小の stdio MCP サーバーは Node.js で次のように書けます。

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.tool(
  "get_weather",
  "現在の天気を取得する",
  { city: z.string() },
  async ({ city }) => ({
    content: [{ type: "text", text: `${city} は晴れです` }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

Claude Code がこの MCP サーバーを使えるように `settings.json` に登録します。以降、`get_weather` ツールを自然言語で呼べるようになります。

---

### Hooks（フック）

Hooks は **Claude Code のイベントに合わせてシェルコマンドを実行する** 仕組みです。「AI が特定の操作をした前後で何かを自動化したい」ときに使います。

#### Hooks の種類

| イベント名 | タイミング |
|---|---|
| `PreToolUse` | Claude がツール（Bash / Edit / Write 等）を呼ぶ **直前** |
| `PostToolUse` | ツールが完了した **直後** |
| `Stop` | Claude が応答を終えた時（turn が終わるたびに） |
| `Notification` | Claude Code からの通知イベント |
| `SessionStart` | セッションが開始した時 |
| `SubagentStop` | サブエージェントが停止した時 |

#### 設定（`settings.json`）

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Bash tool used' >> /tmp/claude.log"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/my-stop-hook.sh"
          }
        ]
      }
    ]
  }
}
```

`matcher` にツール名や正規表現を指定してフィルタリングできます。

#### Hooks のユースケース

- **コミット漏れ検知**: Stop フックで `git status` を走らせ、未コミットがあれば Claude に通知
- **フォーマット自動適用**: PostToolUse(Edit) で `prettier --write` を実行
- **セキュリティチェック**: PreToolUse(Bash) で危険なコマンドを検出してブロック
- **ログ収集**: 各ツール呼び出しを監査ログに記録

フックスクリプトが exit code `1` を返すと、Claude Code はそのツール呼び出しを拒否できます（PreToolUse のみ）。

---

### Skills（スラッシュコマンド）

Skills（スキル）は **`/コマンド名` で呼び出せる再利用可能なプロンプト** です。`.claude/commands/` ディレクトリに Markdown ファイルを置くだけで使えます。

```
.claude/
└── commands/
    ├── review-curriculum.md   → /review-curriculum
    ├── new-lesson.md          → /new-lesson
    └── renumber-lessons.md    → /renumber-lessons
```

#### スキルファイルの構造

```markdown
---
description: このスキルが何をするかの 1 行説明
---

# スキルのタイトル

引数: `$ARGUMENTS`

## 起動手順

1. やること 1
2. やること 2（エージェントを起動する場合など）

## 出力フォーマット

- 箇条書きで何を返すか説明
```

`$ARGUMENTS` プレースホルダーにはスラッシュコマンド呼び出し時の引数が入ります。

```
/review-curriculum docs/lessons/lesson82/index.md
→ $ARGUMENTS = "docs/lessons/lesson82/index.md"
```

#### ユースケース

- **コードレビュー**: `/review` でリポジトリ全体のコードを特定の観点でレビュー
- **ドキュメント生成**: `/gen-docs` でファイルから README を自動生成
- **テスト追加**: `/add-tests` でカバレッジが低いファイルにテストを追加
- **定型作業**: `/deploy` でデプロイ手順を自動実行

このコースの執筆プロセスでは `/review-curriculum`・`/new-lesson`・`/renumber-lessons` の 3 つを活用しています（実装は `.claude/commands/` を参照）。

---

### AI 生成コードの落とし穴

#### 1. 存在しない API を呼ぶ（ハルシネーション）

例: 「Next.js の `getServerSideProps` を App Router で…」のような古い API の混入、またはまったく実在しない関数。

対策: TypeScript の型エラーを信じる / 公式ドキュメントで確認 / テストを走らせる

#### 2. 古い慣習で書く

学習データのカットオフが原因で、Pages Router 時代や React 17 時代のコードを出すことがある。

対策: `CLAUDE.md` に「Next.js 16 / React 19 を前提に」と明記する

#### 3. 過度な抽象化

「使いまわせるように」と早すぎる抽象化をしがち。

対策: 「この関数は今 1 回しか使わない、シンプルに」と明示する

#### 4. エラーハンドリングが過剰

存在しないエラーケースに `try / catch` を撒く。

対策: 「入力は信頼してよい」「バリデーションは別レイヤで」と伝える

#### 5. セキュリティの抜け

`.env` の値をログ出力 / SQL インジェクション可能な文字列連結など。

対策: コードレビューで人間が必ず見る / セキュリティ Lint を CI に入れる

### 「AI に任せる / 人間がやる」の境界

#### AI が得意

- 定型的なコード（CRUD / フォーム / バリデーション）
- テストの追加（既存仕様から想定）
- リファクタリング（変数名一括 / 抽象化候補）
- エラーメッセージの読み解き
- 学習補助（「`Promise.allSettled` って何？」）

#### 人間が必須

- 要件の合意（顧客と話してスコープを決める）
- アーキテクチャの選択（Server Component を使うか / DB を選ぶか）
- セキュリティ設計（権限 / 認証フロー）
- パフォーマンス計測 → 改善（実測しないと分からない）
- 倫理 / コンプライアンス

「**AI が下書き、人間が最終判断**」は今後も変わりません。

### 学習者としての AI 活用

#### 良い使い方

- 「これは何？」を聞く（古い記事を読むより速い）
- コードを写経 → AI に解説してもらう
- エラーメッセージを貼って原因を尋ねる
- 逆方向の質問「この設計の弱点は？」

#### 避けたい使い方

- 「全部書いて」で投げる（学びがゼロ）
- 理解せずコピペ（動いていてもバグの種）
- AI のコードを「公式」と扱う（間違いはある）

「自分で 7 割書く → AI で 3 割補強 → 全部読んで理解」のサイクルが学びを最大化します。

## 演習（任意）

### `CLAUDE.md` を書いてみる

任意の既存プロジェクトに `CLAUDE.md` を追加します。「技術スタック」「コーディング規約」「してはいけないこと」の 3 セクションを書き、Claude Code に読み込ませてタスクを依頼してみましょう。

`CLAUDE.md` を読んだ後の出力と、読まない状態の出力を比較すると、コンテキストの効果が分かります。

### MCP サーバーを 1 つ追加してみる

Claude Code の `settings.json` に GitHub MCP サーバーを登録してみます。

```bash
# 設定ファイルを確認
cat ~/.claude/settings.json
```

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```

登録後、「現在開いているリポジトリの最新 PR を教えて」と依頼すると、MCP を通じて GitHub API を呼んで結果を返してくれます。

## まとめ

- **CLAUDE.md** はプロジェクトのルール・規約を AI に伝える最も効果的な手段
- **MCP** は「AI と外部システムを繋ぐ標準プロトコル」。stdio（子プロセス）と Streamable HTTP（常駐サーバー）の 2 種類の transport がある
- MCP サーバーは **Tools / Resources / Prompts** の 3 種を提供できる
- **Hooks** は Claude Code のイベント（PreToolUse / PostToolUse / Stop など）に合わせてシェルコマンドを実行する仕組み。フォーマット自動化・セキュリティチェック・ログ収集に使う
- **Skills（スラッシュコマンド）** は `.claude/commands/*.md` に Markdown を置くだけで `/コマンド名` で呼び出せる再利用可能なプロンプト
- AI 生成コードの落とし穴: ハルシネーション / 古い API / 過度な抽象化 / テスト抜け / セキュリティ抜け
- 「AI が下書き、人間が最終判断」は変わらない
