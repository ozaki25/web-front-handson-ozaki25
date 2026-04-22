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
  if [[ ! "$NEWBRANCH" =~ ^(main|draft|publish/lesson[0-9]{2})$ ]]; then
    block "ブランチ運用違反: 許可されたブランチは main, draft, publish/lessonXX のみです。'$NEWBRANCH' は作成できません"
  fi
fi

# --- 許可外ブランチへの push 禁止 ---
if [[ "$COMMAND" =~ ^git\ push ]] && [[ ! "$COMMAND" =~ --delete ]] && [[ "$COMMAND" =~ origin\ ([^ ]+) ]]; then
  PUSHBRANCH="${BASH_REMATCH[1]}"
  if [[ ! "$PUSHBRANCH" =~ ^(main|draft|publish/lesson[0-9]{2})$ ]]; then
    block "ブランチ運用違反: 許可されたブランチは main, draft, publish/lessonXX のみです。'$PUSHBRANCH' にはプッシュできません"
  fi

  # publish ブランチへの push 時にリマインダー
  if [[ "$PUSHBRANCH" =~ ^publish/lesson[0-9]{2}$ ]]; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        outputMessage: "リマインダー: publish ブランチにプッシュしました。PR の本文が最新の内容を反映しているか確認してください。"
      }
    }'
    exit 0
  fi
fi

# --- git commit の検証 ---
if [[ "$COMMAND" =~ git\ commit ]]; then
  STAGED=$(git diff --cached --name-only)

  # マージ中の場合はスキップ
  if [ -f .git/MERGE_HEAD ]; then
    exit 0
  fi

  # main にコンテンツファイルをコミットしようとしている
  if [ "$BRANCH" = "main" ]; then
    bad=$(echo "$STAGED" | grep -E '^docs/lessons/' || true)
    if [ -n "$bad" ]; then
      block "ブランチ運用違反: レッスンファイルは draft にコミットしてください。対象: $bad"
    fi

    # main の docs/index.md にレッスンリンクを追加しようとしている
    if echo "$STAGED" | grep -q '^docs/index.md$'; then
      lesson_links=$(git diff --cached -- docs/index.md | grep '^\+.*\/lessons\/lesson' || true)
      if [ -n "$lesson_links" ]; then
        block "ブランチ運用違反: main の docs/index.md に直接レッスンリンクを追加しないでください。publish/lessonXX ブランチから PR を作ってください"
      fi
    fi

    # main の config.mts にレッスンリンクを追加しようとしている
    if echo "$STAGED" | grep -q '^docs/\.vitepress/config\.mts$'; then
      lesson_links=$(git diff --cached -- docs/.vitepress/config.mts | grep '^\+.*\/lessons\/lesson' || true)
      if [ -n "$lesson_links" ]; then
        block "ブランチ運用違反: main の config.mts に直接レッスンリンクを追加しないでください。publish/lessonXX ブランチから PR を作ってください"
      fi
    fi

    # main の introduction にレッスンリンクを追加しようとしている
    if echo "$STAGED" | grep -q '^docs/introduction/'; then
      lesson_links=$(git diff --cached -- docs/introduction/ | grep '^\+.*\/lessons\/lesson' || true)
      if [ -n "$lesson_links" ]; then
        block "ブランチ運用違反: main の introduction に直接レッスンリンクを追加しないでください。publish/lessonXX ブランチから PR を作ってください"
      fi
    fi
  fi

  # draft に方針・設定・main 専用ファイルをコミットしようとしている
  if [ "$BRANCH" = "draft" ]; then
    bad=$(echo "$STAGED" | grep -E '^CLAUDE\.md$|^\.claude/|^docs/introduction/|^package\.json$' || true)
    if [ -n "$bad" ]; then
      block "ブランチ運用違反: このファイルは main にコミットしてください。対象: $bad"
    fi
  fi

  # publish ブランチのチェック
  if [[ "$BRANCH" =~ ^publish/lesson[0-9]{2}$ ]]; then
    # 許可外のファイルをコミットしようとしている
    bad=$(echo "$STAGED" | grep -vE '^docs/lessons/lesson[0-9]+/|^docs/\.vitepress/config\.mts$|^docs/index\.md$' | grep -v '^$' || true)
    if [ -n "$bad" ]; then
      block "ブランチ運用違反: publish ブランチでは該当レッスン、サイドバー、index.md のみコミットできます。対象: $bad"
    fi

    # デッドリンクチェック
    # 内容チェックは docs/ 配下の公開コンテンツに限定する。
  # .claude/ や .github/ のメタファイルは禁止パターンを教える目的で
  # それらを含むことがあるため対象外。
  staged_md=$(echo "$STAGED" | grep '^docs/.*\.md$' || true)
    if [ -n "$staged_md" ]; then
      dead_links=""
      for f in $staged_md; do
        links=$(git diff --cached -- "$f" | grep '^\+' | grep -oE '/lessons/lesson[0-9]+/' || true)
        for link in $links; do
          dir="docs${link}index.md"
          # main に存在するか
          git show "origin/main:$dir" >/dev/null 2>&1 && continue
          # 同じコミットにステージされているか
          echo "$STAGED" | grep -q "^${dir}$" && continue
          # ステージされたディレクトリ内か
          link_dir="docs${link}"
          echo "$STAGED" | grep -q "^${link_dir}" && continue
          dead_links="${dead_links}${link} (in ${f})\n"
        done
      done
      if [ -n "$dead_links" ]; then
        block "デッドリンク検出: 以下のリンク先が main に存在せず、このコミットにも含まれていません。\n${dead_links}draft のファイルは変更せず、publish ブランチ上でリンクを削除してください。"
      fi
    fi
  fi

  # --- Markdown 太字の描画チェック ---
  # 全角閉じ括弧の直後の ** は VitePress (markdown-it) で太字が閉じない
  # 例: **目次（アウトライン）**を → アスタリスクがそのまま表示される
  # 注: LC_ALL=C.UTF-8 を指定しないと grep -P がバイト単位で動作し、
  # 日本語文字の末尾バイトが全角括弧の一部と誤マッチする
  # 内容チェックは docs/ 配下の公開コンテンツに限定する。
  # .claude/ や .github/ のメタファイルは禁止パターンを教える目的で
  # それらを含むことがあるため対象外。
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
      block "Markdown 太字の描画不具合: 全角閉じ括弧の直後の ** は太字として描画されません。太字の範囲を変更してください（例: **目次（アウトライン）** → **目次**（アウトライン））。\n${broken_bold}"
    fi
  fi

  # --- Vue テンプレート補間との衝突チェック ---
  # VitePress は Vue ベースで、本文内の {{ ... }} を補間として解釈する。
  # inline code（バッククオート内）でも、行内で {{ が閉じられていない場合
  # 「Interpolation end sign was not found」のビルドエラーになる。
  # lesson25 の "{{ 壊れた JSON" で Vercel build が壊れた実績あり。
  if [ -n "$staged_md" ]; then
    unclosed_interp=""
    for f in $staged_md; do
      # 行ごとに {{ と }} の登場数をカウント。{{ の後に }} が同一行内に無ければ報告。
      # コードフェンス内は Shiki が v-pre 相当で保護するので対象外。
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
      block "Vue テンプレート補間との衝突: 行内で {{ が閉じられていません。VitePress のビルドが「Interpolation end sign was not found」で壊れます。文字列を書き換えるか、{{ を含む例は fenced code block で囲んでください。\n${unclosed_interp}"
    fi
  fi

  # --- 絵文字・装飾記号の検出 ---
  # CLAUDE.md 11 章「絵文字・過剰装飾を使わない」の自動適用。
  # lesson51 の ☾☀ や lesson42 旧版の ❌✅ のようなケースを防ぐ。
  if [ -n "$staged_md" ]; then
    emoji_hits=""
    for f in $staged_md; do
      # Unicode 絵文字ブロック、装飾記号 ❌ ✅ ⭐ など、太陽月アイコンを検出
      issues=$(git show ":$f" 2>/dev/null | LC_ALL=C.UTF-8 grep -Pn '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]|❌|✅|⭐|☾|☀' || true)
      if [ -n "$issues" ]; then
        emoji_hits="${emoji_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$emoji_hits" ]; then
      block "絵文字・装飾記号の混入: CLAUDE.md 11 章により本コースでは絵文字を使いません。NG/OK などの文字列ラベルに置き換えてください。\n${emoji_hits}"
    fi
  fi

  # --- 省略コード（…(省略)… / ...(省略)...）の検出 ---
  # CLAUDE.md 6 章 2「コードは省略しない」の違反を防ぐ。
  if [ -n "$staged_md" ]; then
    ellipsis_hits=""
    for f in $staged_md; do
      issues=$(git show ":$f" 2>/dev/null | LC_ALL=C.UTF-8 grep -Pn '…\s*\(省略\)\s*…|\.\.\.\s*\(省略\)\s*\.\.\.' || true)
      if [ -n "$issues" ]; then
        ellipsis_hits="${ellipsis_hits}${f}:\n${issues}\n"
      fi
    done
    if [ -n "$ellipsis_hits" ]; then
      block "省略コードの使用: CLAUDE.md 11 章により本コースでは …(省略)… を使いません。コードは全量掲載してください。\n${ellipsis_hits}"
    fi
  fi

  # --- 用語統一チェック（実証済みの揺れのみ） ---
  # 「プロップス」（カタカナ） → 英字 props に統一
  # 「疑似クラス」 → 「擬似クラス」（MDN 日本語版主流）
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

  # --- レッスンテンプレート 4 節チェック ---
  # docs/lessons/lessonXX/index.md の新規/編集時、ゴール/解説/演習/まとめ の 4 節が揃っているか確認。
  # CLAUDE.md 7 章「レッスン構成テンプレート」の自動適用。
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
      block "レッスンテンプレート違反: CLAUDE.md 7 章の 4 節構成（ゴール / 解説 / 演習 / まとめ）が揃っていません。\n${missing_sections}"
    fi
  fi

  # .claude/ ファイルの削除を禁止
  deleted=$(git diff --cached --diff-filter=D --name-only | grep '^\.claude/' || true)
  if [ -n "$deleted" ]; then
    block "安全違反: .claude/ 内のファイルを削除しないでください。対象: $deleted"
  fi
fi

exit 0
