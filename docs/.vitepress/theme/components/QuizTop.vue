<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { chapters, STORAGE_KEY } from '../../../quiz/types'
import type { StoredAnswers } from '../../../quiz/types'
import { quizzesByChapter } from '../../../quiz/data/index'

const stored = ref<StoredAnswers>({})

onMounted(() => {
  if (typeof window === 'undefined') return
  try {
    stored.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    stored.value = {}
  }
})

const chapterStats = computed(() =>
  chapters.map((ch) => {
    const quizzes = quizzesByChapter[ch.id] ?? []
    const total = quizzes.length
    const answered = quizzes.filter((q) => stored.value[q.id] !== undefined).length
    const correct = quizzes.filter((q) => stored.value[q.id]?.correct).length
    return { ...ch, total, answered, correct }
  }),
)

const totalAnswered = computed(() =>
  chapterStats.value.reduce((acc, c) => acc + c.answered, 0),
)
const totalQuestions = computed(() =>
  chapterStats.value.reduce((acc, c) => acc + c.total, 0),
)
const totalCorrect = computed(() =>
  chapterStats.value.reduce((acc, c) => acc + c.correct, 0),
)
</script>

<template>
  <div class="quiz-top">
    <div class="quiz-top-summary">
      <div class="summary-item">
        <span class="summary-label">回答済み</span>
        <span class="summary-value">{{ totalAnswered }} / {{ totalQuestions }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">正解数</span>
        <span class="summary-value">{{ totalCorrect }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">正答率</span>
        <span class="summary-value">
          {{ totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0 }}%
        </span>
      </div>
    </div>

    <div class="chapter-grid">
      <a
        v-for="ch in chapterStats"
        :key="ch.id"
        :href="`/quiz/chapter${ch.id}/`"
        class="chapter-card"
      >
        <div class="chapter-card-header">
          <span class="chapter-num">{{ ch.id }}</span>
          <span class="chapter-title">{{ ch.title }}</span>
        </div>
        <div class="chapter-bar-wrap">
          <div
            class="chapter-bar"
            :style="{ width: ch.total > 0 ? (ch.answered / ch.total) * 100 + '%' : '0%' }"
          />
        </div>
        <div class="chapter-stats">
          <span>{{ ch.answered }} / {{ ch.total }} 問</span>
          <span v-if="ch.answered > 0" class="chapter-rate">
            正解 {{ Math.round((ch.correct / ch.answered) * 100) }}%
          </span>
        </div>
      </a>
    </div>

    <div class="quiz-top-actions">
      <a href="/quiz/random/" class="btn-action">ランダム出題（全問）</a>
      <a href="/quiz/review/" class="btn-action btn-review">間違えた問題を復習</a>
    </div>
  </div>
</template>

<style scoped>
.quiz-top {
  max-width: 760px;
  margin: 0 auto;
}

.quiz-top-summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.summary-item {
  flex: 1;
  min-width: 120px;
  padding: 0.9rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.summary-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.summary-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.chapter-card {
  display: block;
  padding: 0.9rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.chapter-card:hover {
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chapter-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.chapter-num {
  width: 1.6em;
  height: 1.6em;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.chapter-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.chapter-bar-wrap {
  height: 5px;
  background: var(--vp-c-bg-mute);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.chapter-bar {
  height: 100%;
  background: var(--vp-c-brand-2);
  border-radius: 3px;
}

.chapter-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.chapter-rate {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.quiz-top-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.6rem 1.3rem;
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-action:hover {
  background: var(--vp-c-brand-2);
}

.btn-review {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-review:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-2);
}
</style>
