<script setup lang="ts">
import { computed } from 'vue'

// HTML / CSS / JS を iframe srcdoc で隔離実行するコンポーネント。
// レッスン本文に直接 <script> や <style> を書くと他ページに影響が漏れるため、
// 演習デモは必ずこのコンポーネント経由で書いてください。
//
// 隔離の保証:
// - iframe の srcdoc は独立した document として処理されるので、親ページの
//   CSS セレクタや JS のグローバルスコープを汚染しない
// - sandbox 属性で権限を最小化（スクリプトのみ許可、親への同一オリジン
//   アクセス・トップレベル遷移・外部フォーム送信は禁止）
// - 実行中の JS は try/catch で包み、エラー時は画面に赤字で表示
//
// 使い方:
//
// <LiveDemo
//   :html="`<button id='btn'>押してね</button>`"
//   :css="`button { padding: 8px 16px; font-size: 1rem; }`"
//   :js="`document.getElementById('btn').onclick = () => alert('押された')`"
// />
//
// 複数行の場合はテンプレートリテラルで改行可能。show-code=false で
// ソース折りたたみを非表示にできる。

const props = withDefaults(
  defineProps<{
    html?: string
    css?: string
    js?: string
    height?: string
    showCode?: boolean
  }>(),
  {
    html: '',
    css: '',
    js: '',
    height: '240px',
    showCode: true,
  },
)

// iframe srcdoc に埋め込む HTML ドキュメントを組み立てる。
// - 見た目の下地（margin なし / 最低限の padding / システムフォント）を与える
// - ダークモードの見栄えは親ページに任せず iframe 内で prefers-color-scheme を拾う
// - ユーザー JS は IIFE + try/catch で包んで、グローバル汚染とエラーの画面暴走を抑える
// - </script> と書くと Vue SFC の script ブロックが早期終了する罠を避けるため
//   文字列内では `<${'/script'}>` にせず、閉じタグは配列 join で構築する
const srcdoc = computed(() => {
  const parts = [
    '<!DOCTYPE html>',
    '<html lang="ja">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<style>',
    'html, body { margin: 0; }',
    'body { padding: 16px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #1f2937; background: #ffffff; line-height: 1.6; }',
    '@media (prefers-color-scheme: dark) { body { color: #e5e7eb; background: #0b1220; } }',
    '.__live-demo-error { color: #b91c1c; background: #fee2e2; padding: 8px 12px; border-radius: 4px; margin-top: 12px; white-space: pre-wrap; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; }',
    '@media (prefers-color-scheme: dark) { .__live-demo-error { color: #fecaca; background: #4a1d1d; } }',
    props.css,
    '</style>',
    '</head>',
    '<body>',
    props.html,
    '<' + 'script>',
    '(function () {',
    '  try {',
    props.js,
    '  } catch (e) {',
    '    var el = document.createElement("pre");',
    '    el.className = "__live-demo-error";',
    '    el.textContent = (e && e.message) ? e.message : String(e);',
    '    document.body.appendChild(el);',
    '  }',
    '})();',
    '</' + 'script>',
    '</body>',
    '</html>',
  ]
  return parts.join('\n')
})
</script>

<template>
  <div class="live-demo">
    <iframe
      class="live-demo-frame"
      :srcdoc="srcdoc"
      :style="{ height }"
      sandbox="allow-scripts allow-modals allow-forms"
      title="Live demo"
      loading="lazy"
    />
    <details v-if="showCode" class="live-demo-source">
      <summary>このデモのソース（HTML / CSS / JS）</summary>
      <div v-if="html" class="live-demo-block">
        <div class="live-demo-label">HTML</div>
        <pre><code class="language-html">{{ html }}</code></pre>
      </div>
      <div v-if="css" class="live-demo-block">
        <div class="live-demo-label">CSS</div>
        <pre><code class="language-css">{{ css }}</code></pre>
      </div>
      <div v-if="js" class="live-demo-block">
        <div class="live-demo-label">JavaScript</div>
        <pre><code class="language-js">{{ js }}</code></pre>
      </div>
    </details>
  </div>
</template>

<style scoped>
.live-demo {
  margin: 1rem 0 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.live-demo-frame {
  width: 100%;
  border: 0;
  display: block;
  background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  .live-demo-frame {
    background: #0b1220;
  }
}

.live-demo-source {
  border-top: 1px solid var(--vp-c-divider);
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
}

.live-demo-source summary {
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  padding: 0.25rem 0;
}

.live-demo-source summary:hover {
  color: var(--vp-c-text-1);
}

.live-demo-block {
  margin-top: 0.75rem;
}

.live-demo-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.live-demo-source pre {
  margin: 0;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-alt);
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
}

.live-demo-source code {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  color: var(--vp-c-text-1);
  white-space: pre;
}
</style>
