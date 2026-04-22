#!/bin/bash
set -e

HOOK_INPUT=$(cat)
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // ""')
BODY=$(echo "$HOOK_INPUT" | jq -r '.tool_input.body // ""')

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

# PR 作成時: body が空ならブロック
if [ "$TOOL_NAME" = "mcp__github__create_pull_request" ]; then
  if [ -z "$BODY" ] || [ "$BODY" = "null" ]; then
    block "PR 作成エラー: 本文（body）が空です。レッスンの概要を含む本文を指定してください"
  fi
fi

# body に作業メモや内部的な注意事項が含まれていたらブロック
if [ -n "$BODY" ] && [ "$BODY" != "null" ]; then
  if echo "$BODY" | grep -qiE '(TODO|FIXME|HACK|XXX|作業メモ|内部メモ|注意事項|作業ミス|修正メモ|反省点)'; then
    block "PR 本文エラー: 作業メモや内部的な注意事項が含まれています。レビューに必要な情報だけを記載してください"
  fi
fi

exit 0
