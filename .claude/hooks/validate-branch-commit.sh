#!/bin/bash
set -e

HOOK_INPUT=$(cat)
COMMAND=$(echo "$HOOK_INPUT" | jq -r '.tool_input.command // ""')

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

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# --- ブランチ作成の検証 ---
if [[ "$COMMAND" =~ git\ checkout\ -b\ ([^ ]+) ]] || [[ "$COMMAND" =~ git\ switch\ -c\ ([^ ]+) ]]; then
  NEWBRANCH="${BASH_REMATCH[1]}"
  if [[ "$NEWBRANCH" != "main" ]]; then
    block "ブランチ運用違反: main 単独運用です。新しいブランチ '$NEWBRANCH' は作成できません"
  fi
fi

# --- 許可外ブランチへの push 禁止 ---
if [[ "$COMMAND" =~ ^git\ push ]] && [[ ! "$COMMAND" =~ --delete ]] && [[ "$COMMAND" =~ origin\ ([^ ]+) ]]; then
  PUSHBRANCH="${BASH_REMATCH[1]}"
  if [[ "$PUSHBRANCH" != "main" ]]; then
    block "ブランチ運用違反: main 単独運用です。'$PUSHBRANCH' にはプッシュできません"
  fi
fi

# --- git commit の検証 ---
if [[ "$COMMAND" =~ git\ commit ]]; then
  STAGED=$(git diff --cached --name-only)

  # マージ中の場合はスキップ
  if [ -f .git/MERGE_HEAD ]; then
    exit 0
  fi

  # --- Markdown 太字の描画チェック ---
  staged_md=$(echo "$STAGED" | grep '^docs/.*\.md$' || true)
  if [ -n "$staged_md" ]; then
    broken_bold=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | LC_ALL=C.UTF-8 grep -Pn '[）」】〉》]\*\*[^ *]' || true)
      if [ -n "$issues" ]; then
        broken_bold="${broken_bold}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$broken_bold" ]; then
      block "Markdown 太字の描画不具合: 全角閉じ括弧の直後の ** は太字として描画されません。太字の範囲を変更してください。\n${broken_bold}"
    fi
  fi

  # --- Vue テンプレート補間との衝突チェック ---
  if [ -n "$staged_md" ]; then
    unclosed_interp=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | awk '
        /^```/ { in_code = !in_code; next }
        in_code { next }
        {
          line = $0
          while (match(line, /\{\{/)) {
            rest = substr(line, RSTART + 2)
            if (!match(rest, /\}\}/)) {
              print NR ": " $0
              break
            }
            line = substr(rest, RSTART + 2)
          }
        }
      ')
      if [ -n "$issues" ]; then
        unclosed_interp="${unclosed_interp}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$unclosed_interp" ]; then
      block "Vue テンプレート補間との衝突: 行内で {{ が閉じられていません。\n${unclosed_interp}"
    fi
  fi

  # --- 絵文字・装飾記号の検出 ---
  if [ -n "$staged_md" ]; then
    emoji_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | LC_ALL=C.UTF-8 grep -Pn '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]|❌|✅|⭐|☾|☀' || true)
      if [ -n "$issues" ]; then
        emoji_hits="${emoji_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$emoji_hits" ]; then
      block "絵文字・装飾記号の混入: CLAUDE.md 11 章により本コースでは絵文字を使いません。\n${emoji_hits}"
    fi
  fi

  # --- 省略コードの検出 ---
  if [ -n "$staged_md" ]; then
    ellipsis_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | LC_ALL=C.UTF-8 grep -Pn '…\s*\(省略\)\s*…|\.\.\.\s*\(省略\)\s*\.\.\.' || true)
      if [ -n "$issues" ]; then
        ellipsis_hits="${ellipsis_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$ellipsis_hits" ]; then
      block "省略コードの使用: コードは全量掲載してください。\n${ellipsis_hits}"
    fi
  fi

  # --- 用語統一チェック ---
  if [ -n "$staged_md" ]; then
    terminology_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | LC_ALL=C.UTF-8 grep -Pn 'プロップス|疑似クラス' || true)
      if [ -n "$issues" ]; then
        terminology_hits="${terminology_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$terminology_hits" ]; then
      block "用語の揺れ: 「プロップス」→「props」、「疑似クラス」→「擬似クラス」に統一してください。\n${terminology_hits}"
    fi
  fi

  # --- 位置依存参照の検出（コードブロック除外）---
  # 章再編・レッスン入替で意味が壊れる cross-lesson / cross-chapter の位置参照だけを狙う。
  # 「位置を表す語（次/前/先/あと/後ろ/先ほど）+ レッスン or 章」と「前章 / 次章」が対象。
  # within-document の「先ほど書いた」「先ほどのデモ」は同じ文書内なので拾わない。
  if [ -n "$staged_md" ]; then
    pos_dep_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | awk '
        /^```/ { in_code = !in_code; next }
        in_code { next }
        /(次の|前の|先の|あとの|後ろの|先ほどの)(レッスン|章)|前章|次章/ { print NR ": " $0 }
      ')
      if [ -n "$issues" ]; then
        pos_dep_hits="${pos_dep_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$pos_dep_hits" ]; then
      block "位置依存の参照: cross-lesson / cross-chapter の参照は章順が変わると壊れます。topic-name 参照（「○○のレッスン」「N 章」）に置き換えてください。\n${pos_dep_hits}"
    fi
  fi

  # --- 「章 N」表記の検出（コードブロック除外）---
  # 日本語として正しいのは「N 章」。「章 N」は NG。
  if [ -n "$staged_md" ]; then
    chapter_n_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | awk '
        /^```/ { in_code = !in_code; next }
        in_code { next }
        /章 [0-9]/ { print NR ": " $0 }
      ')
      if [ -n "$issues" ]; then
        chapter_n_hits="${chapter_n_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$chapter_n_hits" ]; then
      block "「章 N」NG パターン: 日本語として正しいのは「N 章」です（例: 「章 1」→「1 章」）。\n${chapter_n_hits}"
    fi
  fi

  # --- 素の <script> / <style> の検出 ---
  if [ -n "$staged_md" ]; then
    raw_tag_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | awk '
        /^```/ { in_code = !in_code; next }
        in_code { next }
        {
          line = $0
          # バッククォート / 単引用符 / 二重引用符で囲まれた文字列中の <script> は
          # JS / HTML リテラルの一部（LiveDemo の iframe 用など）なので対象外にする
          gsub(/`[^`]*`/, "", line)
          gsub(/"[^"]*"/, "", line)
          gsub(/'"'"'[^'"'"']*'"'"'/, "", line)
          if (line ~ /<script[> ]/ && line !~ /<script[[:space:]]+setup/) {
            print NR ": " $0
          } else if (line ~ /<style[> ]/) {
            print NR ": " $0
          }
        }
      ')
      if [ -n "$issues" ]; then
        raw_tag_hits="${raw_tag_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$raw_tag_hits" ]; then
      block "本文に素の <script> / <style> を書かないでください。インラインデモは <LiveDemo> を使ってください。\n${raw_tag_hits}"
    fi
  fi

  # --- 多行テンプレートリテラルで JS 的な < や && を含むものだけ検出 ---
  # 多行テンプレート自体は Vue で動くが、内部に JS の比較演算子 < や論理演算子 && が
  # 入ると HTML パーサが誤認する。そのため「多行 + JS 的な < / && 含む」組み合わせのみ検出する。
  if [ -n "$staged_md" ]; then
    multi_attr_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | awk '
        /^```/ { in_code = !in_code; next }
        in_code { next }
        in_multi {
          if ($0 ~ /`"[[:space:]]*\/?[[:space:]]*>?[[:space:]]*$/) {
            in_multi = 0
          } else if ($0 ~ / < [a-zA-Z0-9]| <= | >= |&&|\|\|/) {
            print NR ": " $0
          }
          next
        }
        /:[a-zA-Z][a-zA-Z0-9-]*="`/ {
          if ($0 !~ /`"[[:space:]]*\/?[[:space:]]*>?[[:space:]]*$/) {
            in_multi = 1
          }
        }
      ')
      if [ -n "$issues" ]; then
        multi_attr_hits="${multi_attr_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$multi_attr_hits" ]; then
      block "Vue 多行テンプレート内の JS 的な <比較 / && / || 検出: <script setup> に demoJs = \`...\` として切り出し :js=\"demoJs\" で参照してください。\n${multi_attr_hits}"
    fi
  fi

  # --- Vue SFC の不正な </script> 検出 ---
  staged_vue=$(echo "$STAGED" | grep '\.vue$' || true)
  if [ -n "$staged_vue" ]; then
    stray_close_hits=""
    for f in $staged_vue; do
      issues=$(git show ":$f" 2>/dev/null | awk '
        /<\/script>/ {
          if ($0 !~ /^[[:space:]]*<\/script>[[:space:]]*$/) {
            print NR ": " $0
          }
        }
      ')
      if [ -n "$issues" ]; then
        stray_close_hits="${stray_close_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$stray_close_hits" ]; then
      block "Vue SFC の不正な </script>: コメント/文字列内でも SFC パーサが script 終了と判定します。\n${stray_close_hits}"
    fi
  fi

  # --- textlint（日本語表現の lint） ---
  # 冗長表現 / 弱い表現 / 文長など、構造的な日本語の癖を検出する。
  # 設定は .textlintrc.json。staged の docs/**/*.md だけ対象にする。
  if [ -n "$staged_md" ]; then
    if [ -x "node_modules/.bin/textlint" ]; then
      textlint_out=$(node_modules/.bin/textlint -f compact $staged_md 2>&1 | grep ': line' || true)
      if [ -n "$textlint_out" ]; then
        block "textlint の指摘: 冗長表現 / 弱い表現 / 文長などを直してください。\n${textlint_out}"
      fi
    fi
  fi

  # --- レッスンテンプレート 4 節チェック ---
  lesson_md=$(echo "$STAGED" | grep -E '^docs/lessons/lesson[0-9]+/index\.md$' || true)
  if [ -n "$lesson_md" ]; then
    missing_sections=""
    for f in $lesson_md; do
      content=$(git show ":$f" 2>/dev/null)
      missing=""
      echo "$content" | grep -q '^## ゴール$' || missing="${missing}ゴール "
      echo "$content" | grep -q '^## 解説$' || missing="${missing}解説 "
      echo "$content" | grep -q '^## 演習$' || missing="${missing}演習 "
      echo "$content" | grep -q '^## まとめ$' || missing="${missing}まとめ "
      if [ -n "$missing" ]; then
        missing_sections="${missing_sections}${f}: 欠落セクション = ${missing}\n"
      fi
    done
    if [ -n "$missing_sections" ]; then
      block "レッスンテンプレート違反: 4 節（ゴール / 解説 / 演習 / まとめ）が揃っていません。\n${missing_sections}"
    fi
  fi

  # --- クイズデータの検証 ---
  staged_quiz=$(echo "$STAGED" | grep '^docs/quiz/data/.*\.ts$' || true)
  if [ -n "$staged_quiz" ]; then
    quiz_out=$(npm run -s quiz:validate 2>&1 || true)
    if echo "$quiz_out" | grep -q '✗'; then
      block "クイズデータの検証に失敗しました。\n${quiz_out}"
    fi
  fi

  # .claude/ ファイルの削除を禁止
  deleted=$(git diff --cached --diff-filter=D --name-only | grep '^\.claude/' || true)
  if [ -n "$deleted" ]; then
    block "安全違反: .claude/ 内のファイルを削除しないでください。対象: $deleted"
  fi
fi

exit 0
