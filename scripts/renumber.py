#!/usr/bin/env python3
"""
レッスン番号一括書き換えスクリプト

入力: 旧→新マップ（コマンドライン引数 または マップファイル）

  例: scripts/renumber.py 106:15 108:16 15:17 ...
  例: scripts/renumber.py --map /tmp/renumber.txt

  マップファイル形式（1 行 1 ペア、空白区切り）:
    106 15
    108 16
    15 17

処理:
  1. ディレクトリを 2 段階 mv（衝突回避）
  2. docs 配下の .md と config.mts 内の lessonNN 参照を 2 段階 replace
  3. config.mts のサイドバーは別途手動更新が必要（章の境界は人間が判断）

オプション:
  --dry-run   何が起きるかだけ表示
  --no-build  build をスキップ
  --no-commit commit をスキップ
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
LESSONS_DIR = REPO_ROOT / "docs" / "lessons"
TARGETS_GLOB = ["docs/**/*.md", "docs/.vitepress/config.mts"]


def lesson_str(n: int) -> str:
    """lesson 番号 → ディレクトリ名（lesson01 / lesson100 など）"""
    return f"lesson{n:02d}" if n < 100 else f"lesson{n}"


def parse_args() -> tuple[dict[int, int], argparse.Namespace]:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("pairs", nargs="*", help="旧:新 のペア（例: 106:15 108:16）")
    p.add_argument("--map", type=Path, help="マップファイルのパス（1 行 1 ペア、空白区切り）")
    p.add_argument("--dry-run", action="store_true", help="実行せず計画だけ表示")
    p.add_argument("--no-build", action="store_true")
    p.add_argument("--no-commit", action="store_true")
    args = p.parse_args()

    mapping: dict[int, int] = {}

    if args.map:
        for line in args.map.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.replace(":", " ").split()
            if len(parts) != 2:
                sys.exit(f"map 形式エラー: {line!r}")
            mapping[int(parts[0])] = int(parts[1])

    for pair in args.pairs:
        parts = pair.replace(":", " ").split()
        if len(parts) != 2:
            sys.exit(f"pair 形式エラー: {pair!r}")
        mapping[int(parts[0])] = int(parts[1])

    if not mapping:
        sys.exit("マップが空です")

    # 衝突チェック
    if len(set(mapping.values())) != len(mapping):
        sys.exit("dst に重複があります")

    # no-op を除く
    mapping = {s: d for s, d in mapping.items() if s != d}

    return mapping, args


def run(cmd: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    print(f"$ {' '.join(cmd)}")
    return subprocess.run(cmd, check=check, capture_output=True, text=True, cwd=REPO_ROOT)


def rename_dirs(mapping: dict[int, int], dry: bool) -> None:
    """2-phase mv: 全 src → __renumber_/<dst> → <dst>"""
    print(f"\n=== ディレクトリリネーム（{len(mapping)} 件） ===")
    tmp_root = LESSONS_DIR / "__renumber_tmp"

    if dry:
        for src, dst in mapping.items():
            print(f"  {lesson_str(src)} → {lesson_str(dst)}")
        return

    tmp_root.mkdir(exist_ok=True)
    try:
        # Phase 1
        for src, dst in mapping.items():
            src_path = LESSONS_DIR / lesson_str(src)
            tmp_path = tmp_root / lesson_str(dst)
            if not src_path.is_dir():
                sys.exit(f"src ディレクトリなし: {src_path}")
            run(["git", "mv", str(src_path), str(tmp_path)])

        # Phase 2
        for src, dst in mapping.items():
            tmp_path = tmp_root / lesson_str(dst)
            dst_path = LESSONS_DIR / lesson_str(dst)
            if dst_path.exists():
                sys.exit(f"dst が既に存在（衝突）: {dst_path}")
            run(["git", "mv", str(tmp_path), str(dst_path)])
    finally:
        if tmp_root.exists() and not any(tmp_root.iterdir()):
            tmp_root.rmdir()


def replace_refs(mapping: dict[int, int], dry: bool) -> None:
    """本文中の lessonNN 参照を 2-phase で書き換え"""
    print(f"\n=== 本文相互参照の書き換え ===")
    files: list[Path] = []
    for pat in TARGETS_GLOB:
        files.extend(REPO_ROOT.glob(pat))

    placeholder = lambda dst: f"__RENUM_{dst:03d}__"
    total = 0

    for path in files:
        content = path.read_text(encoding="utf-8")
        new_content = content

        # Phase 1: lessonNN(旧) → placeholder(dst3桁)
        for src, dst in mapping.items():
            old_str = lesson_str(src)
            pat = re.compile(r"\b" + re.escape(old_str) + r"(?=\D|$)")
            new_content, n = pat.subn(placeholder(dst), new_content)
            total += n

        # Phase 2: placeholder → lessonNN(新)
        for src, dst in mapping.items():
            new_content = new_content.replace(placeholder(dst), lesson_str(dst))

        if new_content != content:
            if dry:
                print(f"  {path.relative_to(REPO_ROOT)}: 変更あり")
            else:
                path.write_text(new_content, encoding="utf-8")

    print(f"  置換: {total} 件")


def verify(mapping: dict[int, int]) -> None:
    """整合性チェック: H1 とディレクトリ番号が一致するか"""
    print("\n=== 整合性チェック ===")
    mismatch = 0
    for d in sorted(LESSONS_DIR.glob("lesson*")):
        if not d.is_dir():
            continue
        num_str = d.name.replace("lesson", "")
        try:
            num = int(num_str)
        except ValueError:
            continue
        index_md = d / "index.md"
        if not index_md.exists():
            continue
        h1 = index_md.read_text(encoding="utf-8").splitlines()[0]
        m = re.match(r"^# lesson(\d+):", h1)
        if not m:
            print(f"  H1 形式不正: {d.name} → {h1}")
            mismatch += 1
            continue
        if int(m.group(1)) != num:
            print(f"  H1 とディレクトリ不一致: {d.name} → {h1}")
            mismatch += 1
    if mismatch == 0:
        print("  全 lesson H1 一致")
    else:
        sys.exit(f"  不一致 {mismatch} 件")


def build(dry: bool) -> None:
    print("\n=== build 検証（npm run docs:build） ===")
    if dry:
        print("  (dry-run: skip)")
        return
    r = subprocess.run(["npm", "run", "docs:build"], cwd=REPO_ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-2000:])
        print(r.stderr[-2000:])
        sys.exit("build 失敗")
    # 末尾だけ表示
    print("\n".join(r.stdout.splitlines()[-5:]))


def main() -> None:
    mapping, args = parse_args()
    print(f"renumber 件数: {len(mapping)}")

    rename_dirs(mapping, args.dry_run)
    replace_refs(mapping, args.dry_run)

    if args.dry_run:
        print("\n(dry-run 終了。実行は --dry-run 抜きで)")
        return

    verify(mapping)

    if not args.no_build:
        build(False)

    print("\n=== 完了 ===")
    print("note: docs/.vitepress/config.mts のサイドバー（lessonNN: タイトル）は")
    print("      章境界を変更した場合のみ手動で更新してください。")
    print("      lessonNN 数値だけの差し替えは本スクリプトで完了しています。")


if __name__ == "__main__":
    main()
