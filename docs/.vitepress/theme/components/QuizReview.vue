<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { STORAGE_KEY } from '../../../quiz/types'
import { allQuizzes } from '../../../quiz/data/index'
import QuizPage from './QuizPage.vue'

const loaded = ref(false)
const wrongQuizzes = ref<typeof allQuizzes>([])

onMounted(() => {
  if (typeof window === 'undefined') return
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    wrongQuizzes.value = allQuizzes.filter(
      (q) => stored[q.id] !== undefined && !stored[q.id].correct,
    )
  } catch {
    wrongQuizzes.value = []
  }
  loaded.value = true
})

const hasWrong = computed(() => wrongQuizzes.value.length > 0)
</script>

<template>
  <div v-if="!loaded" class="review-loading">読み込み中...</div>

  <div v-else-if="!hasWrong" class="review-empty">
    <p>間違えた問題はありません。</p>
    <p>
      各章のドリルを解くと、間違えた問題がここに集まります。
      <a href="/quiz/">ドリル一覧へ</a>
    </p>
  </div>

  <QuizPage
    v-else
    :quizzes="wrongQuizzes"
    :title="`間違えた問題を復習（${wrongQuizzes.length} 問）`"
    :shuffle="true"
  />
</template>

<style scoped>
.review-loading,
.review-empty {
  padding: 2rem 1rem;
  color: var(--vp-c-text-2);
}

.review-empty a {
  color: var(--vp-c-brand-1);
}
</style>
