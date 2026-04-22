<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

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
// - script 終了タグを文字列として書くと Vue SFC の script ブロックが
//   早期終了する罠を避けるため、'<' + '/script>' のように連結して生成する
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
    '.__live-demo-console { margin-top: 12px; padding: 8px 12px; background: #1a1a1a; color: #e5e7eb; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; border-radius: 4px; white-space: pre-wrap; line-height: 1.5; }',
    '.__live-demo-console .__error { color: #fca5a5; }',
    '.__live-demo-console .__warn  { color: #fde68a; }',
    props.css,
    '</style>',
    '</head>',
    '<body>',
    props.html,
    '<' + 'script>',
    // console.log / error / warn を iframe 内の表示領域にミラーする。
    // 初回の出力時だけ <div class="__live-demo-console"> を作って追記するので、
    // ログが無いデモでは何も表示されない。
    '(function () {',
    '  var out = null;',
    '  function ensureOut() {',
    '    if (out) return out;',
    '    out = document.createElement("div");',
    '    out.className = "__live-demo-console";',
    '    document.body.appendChild(out);',
    '    return out;',
    '  }',
    '  function append(args, kind) {',
    '    var line = document.createElement("div");',
    '    if (kind) line.className = "__" + kind;',
    '    line.textContent = Array.prototype.map.call(args, function (a) {',
    '      if (typeof a === "string") return a;',
    '      try { return JSON.stringify(a); } catch (_) { return String(a); }',
    '    }).join(" ");',
    '    ensureOut().appendChild(line);',
    '  }',
    '  ["log", "info", "error", "warn"].forEach(function (m) {',
    '    var orig = console[m];',
    '    console[m] = function () { try { orig.apply(console, arguments); } catch (_) {} append(arguments, m === "log" || m === "info" ? null : m); };',
    '  });',
    '})();',
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

// <details> が最初に開かれた瞬間だけ Shiki を動的 import してコードを
// ハイライトする。ハイライト結果は <pre class="shiki"> ... </pre> 形式の
// HTML を返すので、そのまま v-html で差し込む。
// - VitePress 本体が既に shiki を依存に持っているため、追加の install 不要
// - 開かれていない details では 1 バイトも取りに行かない（lazy）
// - ライト/ダーク両対応のため shiki の dual theme 機能を使う
const highlightedHtml = shallowRef<string | null>(null)
const highlightedCss = shallowRef<string | null>(null)
const highlightedJs = shallowRef<string | null>(null)
const isHighlighting = ref(false)
let highlightTriggered = false

async function ensureHighlighted() {
  if (highlightTriggered) return
  highlightTriggered = true
  isHighlighting.value = true
  try {
    const { createHighlighter } = await import('shiki/bundle/web')
    const highlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['html', 'css', 'js'],
    })
    const opts = {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    } as const
    if (props.html) {
      highlightedHtml.value = highlighter.codeToHtml(props.html, { lang: 'html', ...opts })
    }
    if (props.css) {
      highlightedCss.value = highlighter.codeToHtml(props.css, { lang: 'css', ...opts })
    }
    if (props.js) {
      highlightedJs.value = highlighter.codeToHtml(props.js, { lang: 'js', ...opts })
    }
  } catch (_) {
    // ハイライト失敗時は素のコード表示にフォールバック（初期表示と同じ）
  } finally {
    isHighlighting.value = false
  }
}
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
    <details v-if="showCode" class="live-demo-source" @toggle="ensureHighlighted">
      <summary>このデモのソース（HTML / CSS / JS）</summary>
      <div v-if="html" class="live-demo-block">
        <div class="live-demo-label">HTML</div>
        <div v-if="highlightedHtml" class="live-demo-highlight" v-html="highlightedHtml" />
        <pre v-else><code class="language-html">{{ html }}</code></pre>
      </div>
      <div v-if="css" class="live-demo-block">
        <div class="live-demo-label">CSS</div>
        <div v-if="highlightedCss" class="live-demo-highlight" v-html="highlightedCss" />
        <pre v-else><code class="language-css">{{ css }}</code></pre>
      </div>
      <div v-if="js" class="live-demo-block">
        <div class="live-demo-label">JavaScript</div>
        <div v-if="highlightedJs" class="live-demo-highlight" v-html="highlightedJs" />
        <pre v-else><code class="language-js">{{ js }}</code></pre>
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

/* Shiki が生成する <pre class="shiki"> に同じ余白・背景を当てる。
   Shiki の dual theme モードは各トークンに --shiki-light / --shiki-dark の
   CSS 変数を仕込み、html.dark で切り替える。 */
.live-demo-highlight :deep(pre.shiki) {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  background-color: var(--shiki-light-bg, #ffffff);
  color: var(--shiki-light, inherit);
}

.live-demo-highlight :deep(pre.shiki code) {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  white-space: pre;
}

.live-demo-highlight :deep(pre.shiki span) {
  color: var(--shiki-light);
}

html.dark .live-demo-highlight :deep(pre.shiki) {
  background-color: var(--shiki-dark-bg, #0b1220);
  color: var(--shiki-dark, inherit);
}

html.dark .live-demo-highlight :deep(pre.shiki span) {
  color: var(--shiki-dark);
}
</style>
