---
description: レッスン番号を一括書き換える（ディレクトリ mv + 本文内相互参照 + サイドバー）
---

# レッスン番号の一括書き換え

引数: `$ARGUMENTS`（例: `12:15 13:16 14:17 ...` のような `旧:新` ペアの空白区切り。またはマップを書いたテキストファイルのパス）

## 事前確認

1. ユーザーから受け取った旧→新のマッピングを確認する
2. **衝突チェック**: 新番号の中に、まだ変換されていない旧番号と重複するものがないか検証（降順処理で安全か確認）
3. 現在のブランチが `main` であること（main 単独運用）

## 実行手順

### 1. 降順にディレクトリを `git mv`

旧番号の **降順** に処理する（最大番号から）。これで新番号が既存の旧番号と衝突しない。

```bash
# 例: 12→15, 13→16, ... の場合、src=53, 52, ..., 12 の順で処理
for src in $(echo "$pairs" | awk -F: '{print $1}' | sort -rn); do
  dst=$(echo "$pairs" | grep "^${src}:" | cut -d: -f2)
  src_pad=$(printf "%02d" $src)
  dst_pad=$(printf "%02d" $dst)
  if [ -d "docs/lessons/lesson$src_pad" ]; then
    git mv "docs/lessons/lesson$src_pad" "docs/lessons/lesson$dst_pad"
  fi
done
```

### 2. 本文内 `lessonXX` 参照を sed で更新

降順で処理して衝突を避ける。

```bash
for src in $(echo "$pairs" | awk -F: '{print $1}' | sort -rn); do
  dst=$(echo "$pairs" | grep "^${src}:" | cut -d: -f2)
  src_pad=$(printf "%02d" $src)
  dst_pad=$(printf "%02d" $dst)
  find docs/lessons docs/index.md -name "*.md" -exec sed -i "s/lesson${src_pad}/lesson${dst_pad}/g" {} \;
done
```

### 3. サイドバー `docs/.vitepress/config.mts` を更新

ディレクトリ構成からレッスンタイトルを抽出し、章別に並べ直す。

```bash
for i in $(seq -f "%02g" 1 99); do
  [ -f "docs/lessons/lesson$i/index.md" ] && head -1 "docs/lessons/lesson$i/index.md"
done
```

から章ごとのリンクリストを組み立てて、config.mts の `sidebar` を書き換える。章の切り目（lesson11 で章 1 終わり、lesson25 で章 2 終わり等）はユーザーに確認する。

### 4. 検証

- 各 `lesson<src>` ディレクトリが消え、`lesson<dst>` ディレクトリが存在することを確認
- `grep -rn "lesson[0-9]\+" docs/lessons docs/index.md` で旧番号が残っていないかスポットチェック
- config.mts の link とディレクトリが一致していることを確認

### 5. コミット

```
git add -A
git commit -m "レッスン番号を新体系に書き換え（ディレクトリ mv + 本文相互参照 + サイドバー）"
```

push はユーザー指示に従う。

## 安全策

- **dry-run モード**: 引数に `--dry-run` があれば、実行せず「何を mv するか / 何行 sed 置換が発生するか」を報告するだけにする
- **コミット前確認**: sed 置換後、`git diff --stat` の規模が想定を超えていたら必ずユーザーに確認する
- **ビルド確認**: 最後に `npm run docs:build` を通してから commit する
