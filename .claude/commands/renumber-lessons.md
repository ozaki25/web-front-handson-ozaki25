---
description: レッスン番号を一括書き換える（scripts/renumber.py を呼ぶだけ）
---

# レッスン番号の一括書き換え

引数: `$ARGUMENTS`（旧:新 のペア空白区切り、または `--map ファイル`）

## 実行

リポジトリには専用スクリプト `scripts/renumber.py` があります。これを呼ぶだけで、ディレクトリ mv + 本文相互参照 + 整合性チェック + ビルド検証 まで一括で行えます。

```bash
# 例: lesson106 → 15、lesson108 → 16 にリネーム
python3 scripts/renumber.py 106:15 108:16

# 大量の場合はマップファイル経由
cat > /tmp/renumber.txt <<'EOF'
106 15
108 16
15 17
16 18
EOF
python3 scripts/renumber.py --map /tmp/renumber.txt
```

## オプション

- `--dry-run`: 計画だけ表示（実行しない）。引数が正しいか確認したい時に
- `--no-build`: 最後の `npm run docs:build` をスキップ
- `--no-commit`: 自動 commit をスキップ（このスクリプトは現状自動 commit しないので念のため）

## 安全策

スクリプトは内部で次を保証します:
- **dst の重複チェック**（dst が衝突していたら停止）
- **2 段階リネーム**（一時ディレクトリ `__renumber_tmp/` 経由で衝突回避）
- **UTF-8 安全な置換**（Python の re で日本語のマルチバイト境界も問題なし）
- **整合性チェック**（H1 のレッスン番号がディレクトリと一致しているか）
- **build 検証**（`npm run docs:build` 通過を最後に確認）

## サイドバー（config.mts）

lessonNN の **数値だけ** の差し替えはスクリプトで完了します。**章の境界を変える場合**（章間移動 / 順序入れ替え）は config.mts の `sidebar` の `text:` と `link:` を別途手動で並び替えてください。

判断軸: 「章 N の `items: [ ... ]` の **順番**」を変えるなら手動、「番号だけ変更」ならスクリプトで完結。

## commit

スクリプトは **commit しません**。ユーザーが内容を確認して、適切なメッセージで `git add -A && git commit -m "..."` してください。
