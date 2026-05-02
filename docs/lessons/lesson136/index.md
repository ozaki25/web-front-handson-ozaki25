# lesson136: AI を前提にした開発（Claude Code / MCP / Hooks / Skills）

## ゴール

- Claude Code の主要な拡張機構（**MCP / Hooks / Skills / CLAUDE.md**）を説明できる
- MCP の仕組み（transport / サーバー構成 / 設定）を把握する
- Hooks でツール呼び出しの前後に任意のシェルコマンドを割り込ませられる
- Skills（スラッシュコマンド）を作成・呼び出しできる

## 解説

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

Hooks は **Claude Code のイベントに合わせてシェルコマンドを実行する** 仕組みです。

#### Hooks の種類

| イベント名 | タイミング |
|---|---|
| `PreToolUse` | Claude がツール（Bash / Edit / Write 等）を呼ぶ **直前** |
| `PostToolUse` | ツールが完了した **直後** |
| `Stop` | Claude が応答を終えた時 |
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

フックスクリプトが exit code `2` を返すと、Claude Code はそのツール呼び出しをブロックします（PreToolUse のみ）。exit code `1` はエラー通知のみで、ブロックはしません。

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
/review-curriculum docs/lessons/lesson83/index.md
→ $ARGUMENTS = "docs/lessons/lesson83/index.md"
```

#### ユースケース

- **コードレビュー**: `/review` でリポジトリ全体のコードを特定の観点でレビュー
- **ドキュメント生成**: `/gen-docs` でファイルから README を自動生成
- **テスト追加**: `/add-tests` でカバレッジが低いファイルにテストを追加
- **定型作業**: `/deploy` でデプロイ手順を自動実行

このコースの執筆プロセスでは `/review-curriculum`・`/new-lesson`・`/renumber-lessons` の 3 つを活用しています（実装は `.claude/commands/` を参照）。

## まとめ

- **CLAUDE.md** はプロジェクトのルール・規約を AI に伝える最も効果的な手段
- **MCP** は「AI と外部システムを繋ぐ標準プロトコル」。stdio（子プロセス）と Streamable HTTP（常駐サーバー）の 2 種類の transport がある
- MCP サーバーは **Tools / Resources / Prompts** の 3 種を提供できる
- **Hooks** は Claude Code のイベント（PreToolUse / PostToolUse / Stop など）に合わせてシェルコマンドを実行する仕組み。フォーマット自動化・セキュリティチェック・ログ収集に使う
- **Skills（スラッシュコマンド）** は `.claude/commands/*.md` に Markdown を置くだけで `/コマンド名` で呼び出せる再利用可能なプロンプト
