#!/bin/bash
set -e

HOOK_INPUT=$(cat)
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

block() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

# プロジェクト外のファイルはチェック対象外
PROJECT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -n "$PROJECT_DIR" ] && [[ "$FILE_PATH" != "$PROJECT_DIR"/* ]]; then
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# main 単独運用。draft / publish ワークフローは廃止済み。
if [ "$BRANCH" != "main" ]; then
  block "ブランチ運用違反: 現在のブランチ '$BRANCH' は許可されていません。main に切り替えてください"
fi

exit 0
