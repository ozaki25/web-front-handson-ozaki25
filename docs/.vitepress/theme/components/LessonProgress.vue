<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { lessonIdFromTitle } from '../lesson-id'

type SidebarItem = {
  text?: string
  link?: string
  items?: SidebarItem[]
}

type FlatLesson = { text: string; link: string; group: string; id: string }

const { theme } = useData()
const storageKey = 'lesson-completions'
const completions = ref<Record<string, string>>({})

function read(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

function sync() {
  completions.value = read()
}

function flatten(items: SidebarItem[] | undefined, groupText = ''): FlatLesson[] {
  if (!items) return []
  const out: FlatLesson[] = []
  for (const item of items) {
    if (item.link && item.link.startsWith('/lessons/')) {
      const text = item.text ?? ''
      out.push({ text, link: item.link, group: groupText, id: lessonIdFromTitle(text) })
    }
    if (item.items) {
      out.push(...flatten(item.items, item.text ?? groupText))
    }
  }
  return out
}

const lessons = computed<FlatLesson[]>(() => {
  const sidebar = theme.value.sidebar
  if (Array.isArray(sidebar)) return flatten(sidebar)
  return []
})

const doneCount = computed(() => lessons.value.filter((l) => completions.value[l.id]).length)

onMounted(() => {
  sync()
  window.addEventListener('lesson-completion-changed', sync)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('lesson-completion-changed', sync)
  }
})
</script>

<template>
  <div class="lesson-progress" v-if="lessons.length > 0">
    <div class="lesson-progress-summary">完了: {{ doneCount }} / {{ lessons.length }}</div>
    <ul class="lesson-progress-list">
      <li v-for="l in lessons" :key="l.link" :class="{ done: completions[l.id] }">
        <span class="mark" aria-hidden="true">{{ completions[l.id] ? '✓' : '・' }}</span>
        <a :href="l.link">{{ l.text }}</a>
        <span class="group" v-if="l.group">（{{ l.group }}）</span>
      </li>
    </ul>
  </div>
  <div v-else class="lesson-progress empty">
    まだレッスンがありません。
  </div>
</template>

<style scoped>
.lesson-progress {
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.lesson-progress-summary {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.lesson-progress-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lesson-progress-list li {
  padding: 0.25rem 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.lesson-progress-list li.done .mark {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.lesson-progress-list .mark {
  color: var(--vp-c-text-2);
  width: 1em;
  display: inline-block;
  text-align: center;
}

.lesson-progress-list .group {
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}

.lesson-progress.empty {
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}
</style>
