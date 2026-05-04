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
    const wrong = answered - correct
    return { ...ch, total, answered, correct, wrong }
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

const wrongCount = computed(() =>
  chapterStats.value.reduce((acc, c) => acc + (c.answered - c.correct), 0),
)

function resetProgress() {
  if (!confirm('回答履歴をすべて削除しますか？この操作は元に戻せません。')) return
  localStorage.removeItem(STORAGE_KEY)
  stored.value = {}
}
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

    <a v-if="wrongCount > 0" href="/quiz/review/" class="review-banner">
      <span class="review-banner-icon">✗</span>
      <span class="review-banner-text">
        間違えた問題が <strong>{{ wrongCount }} 問</strong> あります — 復習する
      </span>
      <span class="review-banner-arrow">→</span>
    </a>

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
          <span v-if="ch.wrong > 0" class="chapter-wrong">要復習 {{ ch.wrong }}</span>
          <span v-else-if="ch.answered > 0" class="chapter-rate">
            正解 {{ Math.round((ch.correct / ch.answered) * 100) }}%
          </span>
        </div>
      </a>
    </div>

    <div class="quiz-top-actions">
      <a href="/quiz/random/" class="btn-action">ランダム出題（全問）</a>
      <a href="/quiz/review/" class="btn-action btn-review">間違えた問題を復習</a>
    </div>

    <div v-if="totalAnswered > 0" class="quiz-top-reset">
      <button class="btn-reset-progress" type="button" @click="resetProgress">
        回答履歴をリセット
      </button>
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

.chapter-wrong {
  color: #dc2626;
  font-weight: 600;
}

.dark .chapter-wrong {
  color: #fca5a5;
}

.quiz-top-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.6rem 1.3rem;
  background: #1e3a8a;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-action:hover {
  background: #1e40af;
  color: #fff;
}

.dark .btn-action:not(.btn-review) {
  background: #2563eb;
  color: #fff;
}

.dark .btn-action:not(.btn-review):hover {
  background: #1d4ed8;
  color: #fff;
}

.btn-review {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-review:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-text-1);
}

.review-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  text-decoration: none;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s, border-color 0.15s;
}

.review-banner:hover {
  background: #fee2e2;
  border-color: #f87171;
  color: #b91c1c;
}

.review-banner-icon {
  font-weight: 900;
  font-size: 1rem;
  flex-shrink: 0;
}

.review-banner-text {
  flex: 1;
}

.review-banner-arrow {
  flex-shrink: 0;
  font-size: 1rem;
}

.dark .review-banner {
  background: #450a0a;
  border-color: #b91c1c;
  color: #fca5a5;
}

.dark .review-banner:hover {
  background: #5a0f0f;
  border-color: #dc2626;
  color: #fca5a5;
}

.quiz-top-reset {
  margin-top: 1.5rem;
  text-align: right;
}

.btn-reset-progress {
  padding: 0.35rem 0.8rem;
  font-size: 0.78rem;
  background: none;
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.btn-reset-progress:hover {
  color: #dc2626;
  border-color: #fca5a5;
}

.dark .btn-reset-progress:hover {
  color: #fca5a5;
  border-color: #b91c1c;
}
</style>
