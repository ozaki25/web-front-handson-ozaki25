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

function sync() {
  const id = lessonIdFromH1()
  if (!id) {
    completed.value = false
    return
  }
  completed.value = !!read()[id]
}

function markComplete() {
  const id = lessonIdFromH1()
  if (!id) return
  const data = read()
  data[id] = new Date().toISOString()
  write(data)
  sync()
}

function toggle() {
  const id = lessonIdFromH1()
  if (!id) return
  const data = read()
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
