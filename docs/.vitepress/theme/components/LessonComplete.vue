<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'
import { lessonIdFromH1 } from '../lesson-id'

const route = useRoute()
const completed = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const storageKey = 'lesson-completions'
let observer: IntersectionObserver | null = null

function read(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

function write(data: Record<string, string>) {
  localStorage.setItem(storageKey, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent('lesson-completion-changed'))
}

function currentId(): string {
  // 最新の DOM から H1 を拾ってトピック ID を作る。
  // ページ遷移直後の MutationObserver 等は使わず、onMounted / sync の呼び出しタイミングで取得する。
  return lessonIdFromH1()
}

function migrate(data: Record<string, string>, id: string): boolean {
  // 旧キー（パス形式）を保持している場合、現行のトピック ID に引き継ぐ。
  // ユーザーが同じレッスンを再訪問したタイミングで自然に移行する。
  if (!id) return false
  const oldKey = route.path
  if (data[oldKey] && !data[id]) {
    data[id] = data[oldKey]
    delete data[oldKey]
    return true
  }
  // 旧キーと新キーが両方あれば、旧キーを掃除する（トピック ID 側を正とする）。
  if (data[oldKey] && data[id]) {
    delete data[oldKey]
    return true
  }
  return false
}

function sync() {
  const id = currentId()
  if (!id) {
    completed.value = false
    return
  }
  const data = read()
  const migrated = migrate(data, id)
  if (migrated) write(data)
  completed.value = !!data[id]
}

function markComplete() {
  const id = currentId()
  if (!id) return
  const data = read()
  migrate(data, id)
  data[id] = new Date().toISOString()
  write(data)
  sync()
}

function toggle() {
  const id = currentId()
  if (!id) return
  const data = read()
  migrate(data, id)
  if (data[id]) {
    delete data[id]
  } else {
    data[id] = new Date().toISOString()
  }
  write(data)
  sync()
}

onMounted(() => {
  sync()
  window.addEventListener('lesson-completion-changed', sync)

  if (
    rootEl.value &&
    route.path.startsWith('/lessons/') &&
    'IntersectionObserver' in window
  ) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!completed.value) markComplete()
            observer?.disconnect()
            observer = null
            break
          }
        }
      },
      { threshold: 0 },
    )
    observer.observe(rootEl.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  if (typeof window !== 'undefined') {
    window.removeEventListener('lesson-completion-changed', sync)
  }
})
</script>

<template>
  <div
    ref="rootEl"
    class="lesson-complete"
    v-if="route.path.startsWith('/lessons/')"
  >
    <button type="button" :class="{ completed }" @click="toggle">
      <span v-if="completed">✓ このレッスンは完了済み（クリックで未完了に戻す）</span>
      <span v-else>末尾までスクロールすると自動で完了になります</span>
    </button>
  </div>
</template>

<style scoped>
.lesson-complete {
  margin: 2rem 0 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.lesson-complete button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.lesson-complete button:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
}

.lesson-complete button.completed {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}
</style>
