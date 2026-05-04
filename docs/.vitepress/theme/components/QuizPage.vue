<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

function saveAnswer(quizId: string, correct: boolean) {
  const data = loadAnswers()
  data[quizId] = { correct, ts: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const orderedQuizzes = ref<Quiz[]>(
  props.shuffle ? shuffleArray(props.quizzes) : props.quizzes,
)

const currentIndex = ref(0)
const sessionAnswers = ref<Record<string, boolean>>({})
const finished = ref(false)

const currentQuiz = computed<Quiz | null>(() => orderedQuizzes.value[currentIndex.value] ?? null)

const correctCount = computed(
  () => Object.values(sessionAnswers.value).filter((v) => v).length,
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

function onAnswered(quizId: string, correct: boolean) {
  sessionAnswers.value[quizId] = correct
  saveAnswer(quizId, correct)
}

function next() {
  if (currentIndex.value + 1 >= orderedQuizzes.value.length) {
    finished.value = true
  } else {
    currentIndex.value++
  }
}

function restart() {
  currentIndex.value = 0
  sessionAnswers.value = {}
  finished.value = false
}

const storedAnswers = ref<StoredAnswers>({})

onMounted(() => {
  storedAnswers.value = loadAnswers()
})

const previousResults = computed(() => {
  const total = props.quizzes.length
  if (total === 0) return null
  const answered = props.quizzes.filter((q) => storedAnswers.value[q.id] !== undefined).length
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
      <p class="quiz-progress-text">{{ answeredCount }} / {{ orderedQuizzes.length }} 問回答済み</p>

      <QuizCard
        v-if="currentQuiz"
        :key="currentQuiz.id"
        :quiz="currentQuiz"
        :index="currentIndex"
        :total="orderedQuizzes.length"
        @answered="onAnswered"
      />

      <div class="quiz-nav">
        <button
          v-if="isCurrentAnswered"
          class="btn-next"
          type="button"
          @click="next"
        >
          {{ currentIndex + 1 < orderedQuizzes.length ? '次の問題' : '結果を見る' }}
        </button>
      </div>
    </div>

    <div v-else class="quiz-finish">
      <p class="finish-score">
        結果: <strong>{{ correctCount }} / {{ orderedQuizzes.length }}</strong> 問正解
      </p>
      <p class="finish-rate">
        正答率 {{ orderedQuizzes.length > 0 ? Math.round((correctCount / orderedQuizzes.length) * 100) : 0 }}%
      </p>

      <div class="finish-list">
        <div
          v-for="(q, i) in orderedQuizzes"
          :key="q.id"
          class="finish-row"
          :data-correct="sessionAnswers[q.id]"
        >
          <span class="finish-row-num">{{ i + 1 }}</span>
          <span class="finish-row-mark">{{ sessionAnswers[q.id] ? '○' : '×' }}</span>
          <span class="finish-row-q">{{ q.question }}</span>
        </div>
      </div>

      <button class="btn-restart" type="button" @click="restart">もう一度挑戦</button>
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

.quiz-nav {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.btn-next,
.btn-restart {
  padding: 0.55rem 1.4rem;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-next:hover,
.btn-restart:hover {
  background: var(--vp-c-brand-2);
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

.finish-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
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

.finish-row-q {
  flex: 1;
  line-height: 1.5;
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
</style>
