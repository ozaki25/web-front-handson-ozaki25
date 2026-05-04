<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, useTemplateRef } from 'vue'
import type { Quiz } from '../../../quiz/types'
import { STORAGE_KEY } from '../../../quiz/types'
import type { StoredAnswer, StoredAnswers } from '../../../quiz/types'
import QuizCard from './QuizCard.vue'

const props = defineProps<{
  quizzes: Quiz[]
  title: string
  shuffle?: boolean
}>()

function loadAnswers(): StoredAnswers {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAnswer(quizId: string, correct: boolean, selectedIndex: number) {
  const data = loadAnswers()
  data[quizId] = { correct, ts: Date.now(), selectedIndex }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  storedAnswers.value = data
}

function renderText(s: string): string {
  const escaped = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>')
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const quizCardRef = useTemplateRef<{ focusFirstChoice: () => void }>('quizCard')

function focusCard() {
  nextTick(() => quizCardRef.value?.focusFirstChoice())
}

const orderedQuizzes = ref<Quiz[]>(
  props.shuffle ? shuffleArray(props.quizzes) : props.quizzes,
)

const currentIndex = ref(0)
const sessionAnswers = ref<Record<string, { correct: boolean; selectedIndex: number | null }>>({})
const finished = ref(false)

const currentQuiz = computed<Quiz | null>(() => orderedQuizzes.value[currentIndex.value] ?? null)

const correctCount = computed(
  () => Object.values(sessionAnswers.value).filter((v) => v.correct).length,
)

const answeredCount = computed(() => Object.keys(sessionAnswers.value).length)

const progress = computed(() =>
  orderedQuizzes.value.length > 0
    ? (answeredCount.value / orderedQuizzes.value.length) * 100
    : 0,
)

const isCurrentAnswered = computed(
  () => currentQuiz.value != null && sessionAnswers.value[currentQuiz.value.id] !== undefined,
)

const currentAnswer = computed(() =>
  currentQuiz.value != null ? sessionAnswers.value[currentQuiz.value.id] ?? null : null,
)

function onAnswered(quizId: string, correct: boolean, selectedIndex: number) {
  sessionAnswers.value[quizId] = { correct, selectedIndex }
  saveAnswer(quizId, correct, selectedIndex)
}

function onReset(quizId: string) {
  delete sessionAnswers.value[quizId]
  const data = loadAnswers()
  delete data[quizId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  storedAnswers.value = data
}

function next() {
  if (currentIndex.value + 1 >= orderedQuizzes.value.length) {
    finished.value = true
  } else {
    currentIndex.value++
    focusCard()
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    focusCard()
  }
}

function restart() {
  if (props.shuffle) orderedQuizzes.value = shuffleArray(props.quizzes)
  currentIndex.value = 0
  sessionAnswers.value = {}
  finished.value = false
}

const storedAnswers = ref<StoredAnswers>({})

onMounted(() => {
  window.addEventListener('keydown', handlePageKeydown)
  const stored = loadAnswers()
  storedAnswers.value = stored

  // シャッフルモード以外は途中から再開する
  if (!props.shuffle) {
    for (const q of orderedQuizzes.value) {
      if (stored[q.id] !== undefined) {
        sessionAnswers.value[q.id] = {
          correct: stored[q.id].correct,
          selectedIndex: stored[q.id].selectedIndex ?? null,
        }
      }
    }
    const firstUnanswered = orderedQuizzes.value.findIndex((q) => stored[q.id] === undefined)
    if (firstUnanswered === -1) {
      // 全問回答済み → 即結果画面
      finished.value = true
    } else {
      currentIndex.value = firstUnanswered
    }
  }
})

function handlePageKeydown(e: KeyboardEvent) {
  if (finished.value) return
  if (e.key === 'Enter' && isCurrentAnswered.value) next()
}

onUnmounted(() => window.removeEventListener('keydown', handlePageKeydown))

const previousResults = computed(() => {
  const total = props.quizzes.length
  if (total === 0) return null
  const answered = props.quizzes.filter((q) => storedAnswers.value[q.id] !== undefined).length
  if (answered === 0) return null
  const correct = props.quizzes.filter((q) => storedAnswers.value[q.id]?.correct).length
  return { total, answered, correct }
})
</script>

<template>
  <div class="quiz-page">
    <h2 class="quiz-page-title">{{ title }}</h2>

    <div v-if="!finished">
      <div class="quiz-progress-bar-wrap" role="progressbar" aria-valuemin="0" :aria-valuenow="answeredCount" :aria-valuemax="orderedQuizzes.length">
        <div class="quiz-progress-bar" :style="{ width: progress + '%' }" />
      </div>
      <p class="quiz-progress-text">
        {{ answeredCount }} / {{ orderedQuizzes.length }} 問回答済み
        <span v-if="orderedQuizzes.length - answeredCount > 0" class="quiz-remaining">
          （あと {{ orderedQuizzes.length - answeredCount }} 問）
        </span>
      </p>
      <p class="quiz-keyboard-hint">
        キーボード: <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd>で選択 / <kbd>Enter</kbd>で次へ
      </p>

      <QuizCard
        v-if="currentQuiz"
        ref="quizCard"
        :key="currentQuiz.id"
        :quiz="currentQuiz"
        :index="currentIndex"
        :total="orderedQuizzes.length"
        :initial-answered="currentAnswer != null"
        :initial-correct="currentAnswer?.correct ?? null"
        :initial-selected-index="currentAnswer?.selectedIndex ?? null"
        @answered="onAnswered"
        @reset="onReset"
      />

      <div class="quiz-nav">
        <div>
          <button
            v-if="currentIndex > 0"
            class="btn-prev"
            type="button"
            @click="prev"
          >
            前の問題
          </button>
        </div>
        <div>
          <button
            class="btn-next"
            type="button"
            :disabled="!isCurrentAnswered"
            @click="next"
          >
            {{ currentIndex + 1 < orderedQuizzes.length ? '次の問題' : '結果を見る' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="quiz-finish">
      <p class="finish-score">
        結果: <strong>{{ correctCount }} / {{ orderedQuizzes.length }}</strong> 問正解
      </p>
      <p class="finish-rate">
        正答率 {{ orderedQuizzes.length > 0 ? Math.round((correctCount / orderedQuizzes.length) * 100) : 0 }}%
      </p>

      <div v-if="correctCount < orderedQuizzes.length" class="finish-section">
        <p class="finish-section-heading finish-section-wrong">不正解 {{ orderedQuizzes.length - correctCount }} 問</p>
        <div class="finish-list">
          <div
            v-for="(q, i) in orderedQuizzes.filter(q => !sessionAnswers[q.id]?.correct)"
            :key="q.id"
            class="finish-row"
            data-correct="false"
          >
            <span class="finish-row-num">{{ orderedQuizzes.indexOf(q) + 1 }}</span>
            <span class="finish-row-mark">×</span>
            <span class="finish-row-body">
              <span class="finish-row-q" v-html="renderText(q.question)" />
              <span class="finish-row-answer" v-html="`正解: ${renderText(q.choices[q.answer])}`" />
            </span>
          </div>
        </div>
      </div>

      <div v-if="correctCount > 0" class="finish-section">
        <p class="finish-section-heading finish-section-correct">正解 {{ correctCount }} 問</p>
        <div class="finish-list">
          <div
            v-for="(q, i) in orderedQuizzes.filter(q => sessionAnswers[q.id]?.correct)"
            :key="q.id"
            class="finish-row"
            data-correct="true"
          >
            <span class="finish-row-num">{{ orderedQuizzes.indexOf(q) + 1 }}</span>
            <span class="finish-row-mark">○</span>
            <span class="finish-row-body">
              <span class="finish-row-q" v-html="renderText(q.question)" />
            </span>
          </div>
        </div>
      </div>

      <div class="finish-actions">
        <button class="btn-restart" type="button" @click="restart">もう一度挑戦</button>
        <a href="/quiz/" class="btn-list">ドリル一覧へ</a>
      </div>
    </div>

    <div v-if="previousResults && !finished" class="quiz-prev-results">
      <p>
        過去の結果: {{ previousResults.answered }} / {{ previousResults.total }} 問回答済み
        （正解 {{ previousResults.correct }} 問）
      </p>
    </div>
  </div>
</template>

<style scoped>
.quiz-page {
  max-width: 720px;
  margin: 0 auto;
}

.quiz-page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
}

.quiz-progress-bar-wrap {
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.quiz-progress-bar {
  height: 100%;
  background: var(--vp-c-brand-2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.quiz-progress-text {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.quiz-remaining {
  color: var(--vp-c-text-3);
}

.quiz-keyboard-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0 0 1rem;
}

.quiz-keyboard-hint kbd {
  display: inline-block;
  padding: 0.05rem 0.35rem;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.7rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 3px;
}

@media (hover: none) and (pointer: coarse) {
  .quiz-keyboard-hint {
    display: none;
  }
}

.quiz-nav {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 640px) {
  .quiz-nav {
    position: sticky;
    bottom: 0;
    z-index: 5;
    margin: 1rem -1rem 0;
    padding: 0.75rem 1rem;
    background: var(--vp-c-bg);
    border-top: 1px solid var(--vp-c-divider);
  }
}

.btn-prev {
  min-height: 44px;
  padding: 0.65rem 1.4rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.btn-prev:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-text-1);
}

.btn-prev:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.btn-next:focus-visible,
.btn-restart:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

.btn-next,
.btn-restart {
  min-height: 44px;
  padding: 0.65rem 1.4rem;
  background: #1e3a8a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.btn-next:disabled {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-3);
  cursor: default;
  opacity: 0.6;
}

.dark .btn-next:disabled {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-3);
}

.btn-next:hover,
.btn-restart:hover {
  background: #1e40af;
  color: #fff;
}

.dark .btn-next,
.dark .btn-restart {
  background: #2563eb;
}

.dark .btn-next:hover,
.dark .btn-restart:hover {
  background: #1d4ed8;
  color: #fff;
}

.quiz-finish {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}

.finish-score {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.finish-rate {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.25rem;
}

.finish-section {
  margin-bottom: 1.25rem;
}

.finish-section-heading {
  font-size: 0.82rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.finish-section-wrong {
  color: #dc2626;
}

.finish-section-correct {
  color: #16a34a;
}

.dark .finish-section-wrong {
  color: #fca5a5;
}

.dark .finish-section-correct {
  color: #86efac;
}

.finish-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 360px;
  overflow-y: auto;
}

.finish-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  background: var(--vp-c-bg);
}

.finish-row[data-correct='true'] .finish-row-mark {
  color: #16a34a;
  font-weight: 700;
}

.finish-row[data-correct='false'] .finish-row-mark {
  color: #dc2626;
  font-weight: 700;
}

.dark .finish-row[data-correct='true'] .finish-row-mark {
  color: #86efac;
}

.dark .finish-row[data-correct='false'] .finish-row-mark {
  color: #fca5a5;
}

.finish-row-num {
  color: var(--vp-c-text-2);
  min-width: 1.5em;
}

.finish-row-mark {
  min-width: 1em;
  text-align: center;
}

.finish-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-list {
  font-size: 0.9rem;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dark .btn-list {
  color: var(--vp-c-brand-1);
}

.quiz-prev-results {
  margin-top: 1.5rem;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.quiz-prev-results p {
  margin: 0;
}

.finish-row-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.finish-row-q {
  flex: 1;
  line-height: 1.5;
}

.finish-row-answer {
  font-size: 0.78rem;
  color: #b91c1c;
  line-height: 1.4;
}

.dark .finish-row-answer {
  color: #fca5a5;
}

.finish-row-q :deep(code),
.finish-row-answer :deep(code) {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.875em;
  background: var(--vp-c-bg-mute);
  padding: 0.15em 0.35em;
  border-radius: 3px;
  color: var(--vp-c-text-1);
}
</style>
