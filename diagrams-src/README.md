# diagrams-src

レッスン本文で使う図の **Mermaid ソース**。ここから書き出した SVG が `docs/public/diagrams/*.svg` に置かれている。

## 再生成

```bash
# Linux でルートで動かす場合は --no-sandbox を渡す
npx -p @mermaid-js/mermaid-cli mmdc \
  -p <(echo '{"args":["--no-sandbox"]}') \
  --backgroundColor transparent \
  -i diagrams-src/<name>.mmd \
  -o docs/public/diagrams/<name>.svg
```

`<name>` 例:

- `route-groups-layout`（4 章 ルートグループのレイアウト構造）
- `server-client-tree`（4 章 Server / Client の境界）
- `server-action-flow`（4 章 Server Actions のシーケンス）

## なぜ Mermaid プラグインを外して SVG にしているか

`vitepress-plugin-mermaid` を使うと、3 つしか使っていない図のために mermaid 本体（Cytoscape / Wardley / KaTeX 等の全図種が同梱）がバンドルに混ざり、ビルドが約 7 秒（17%）遅くなり、未使用チャンクが 1MB 以上生成される。本コースでは **Mermaid プラグインを外し、必要な図だけ SVG として静的ホスト** する運用を取る。詳細は CLAUDE.md を参照。
