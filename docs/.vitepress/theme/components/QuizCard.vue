<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Quiz } from '../../../quiz/types'

const props = defineProps<{
  quiz: Quiz
  index: number
  total: number
  initialAnswered?: boolean
  initialCorrect?: boolean | null
  initialSelectedIndex?: number | null
}>()

const emit = defineEmits<{
  answered: [quizId: string, correct: boolean, selectedIndex: number]
}>()

const selectedIndex = ref<number | null>(props.initialSelectedIndex ?? null)
const answered = ref(props.initialAnswered ?? false)

function select(i: number) {
  if (answered.value) return
  selectedIndex.value = i
  answered.value = true
  emit('answered', props.quiz.id, i === props.quiz.answer, i)
}

function choiceClass(i: number): string {
  if (!answered.value) return 'choice'
  if (i === props.quiz.answer) return 'choice correct'
  if (selectedIndex.value !== null && i === selectedIndex.value) return 'choice wrong'
  return 'choice dim'
}

const difficultyLabel: Record<string, string> = {
  easy: '易',
  normal: '普',
  hard: '難',
}

// `` `foo` `` → <code>foo</code>（クイズデータは固定値なので v-html で安全）
function renderText(s: string): string {
  const escaped = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>')
}

const effectiveCorrect = computed(() => {
  if (!answered.value) return null
  if (selectedIndex.value !== null) return selectedIndex.value === props.quiz.answer
  return props.initialCorrect ?? null
})
</script>

<template>
  <div class="quiz-card">
    <div class="quiz-meta">
      <span class="quiz-num">{{ index + 1 }} / {{ total }}</span>
      <span class="quiz-difficulty" :data-level="quiz.difficulty">
        {{ difficultyLabel[quiz.difficulty] ?? quiz.difficulty }}
      </span>
    </div>

    <p class="quiz-question" v-html="renderText(quiz.question)" />

    <ol class="quiz-choices" aria-label="選択肢">
      <li v-for="(choice, i) in quiz.choices" :key="i">
        <button
          :class="choiceClass(i)"
          :disabled="answered"
          @click="select(i)"
          type="button"
        >
          <span class="choice-label" aria-hidden="true">{{ String.fromCharCode(65 + i) }}</span>
          <span class="choice-text" v-html="renderText(choice)" />
          <span v-if="answered && i === quiz.answer" class="choice-check" aria-hidden="true">正</span>
        </button>
      </li>
    </ol>

    <div v-if="answered" class="quiz-result" role="status" aria-live="polite">
      <p class="result-badge" :data-correct="effectiveCorrect ?? undefined">
        {{ effectiveCorrect ? '正解' : '不正解' }}
      </p>
      <p class="quiz-explanation" v-html="renderText(quiz.explanation)" />
    </div>
  </div>
</template>

<style scoped>
.quiz-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  background: var(--vp-c-bg);
}

.quiz-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.quiz-difficulty {
  padding: 0.15em 0.5em;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
}

.quiz-difficulty[data-level='easy'] {
  background: #dcfce7;
  color: #15803d;
}
.quiz-difficulty[data-level='normal'] {
  background: #fef9c3;
  color: #a16207;
}
.quiz-difficulty[data-level='hard'] {
  background: #fee2e2;
  color: #b91c1c;
}

.dark .quiz-difficulty[data-level='easy'] {
  background: #14532d;
  color: #86efac;
}
.dark .quiz-difficulty[data-level='normal'] {
  background: #422006;
  color: #fde047;
}
.dark .quiz-difficulty[data-level='hard'] {
  background: #450a0a;
  color: #fca5a5;
}

.quiz-question {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.6;
  margin: 0 0 1rem;
  color: var(--vp-c-text-1);
}

.quiz-choices {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.choice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.9rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  transition: background 0.15s, border-color 0.15s;
}

.choice:not(:disabled):hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-2);
}

.choice:disabled {
  cursor: default;
}

.choice.correct {
  background: #f0fdf4;
  border-color: #16a34a;
  color: #15803d;
}

.choice.wrong {
  background: #fef2f2;
  border-color: #dc2626;
  color: #b91c1c;
}

.choice.dim {
  opacity: 0.5;
}

.dark .choice.correct {
  background: #052e16;
  border-color: #16a34a;
  color: #86efac;
}

.dark .choice.wrong {
  background: #450a0a;
  border-color: #dc2626;
  color: #fca5a5;
}

.choice-label {
  font-weight: 700;
  min-width: 1.2em;
  text-align: center;
  flex-shrink: 0;
}

.choice-text {
  flex: 1;
}

.choice-check {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.1em 0.4em;
  background: #16a34a;
  color: #fff;
  border-radius: 3px;
  flex-shrink: 0;
  align-self: center;
}

.quiz-result {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.result-badge {
  font-weight: 700;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.result-badge[data-correct='true'] {
  color: #16a34a;
}

.result-badge[data-correct='false'] {
  color: #dc2626;
}

.dark .result-badge[data-correct='true'] {
  color: #86efac;
}

.dark .result-badge[data-correct='false'] {
  color: #fca5a5;
}

.quiz-explanation {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  margin: 0;
}

/* v-html で挿入される <code> のスタイル */
.quiz-card :deep(code) {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.875em;
  background: var(--vp-c-bg-mute);
  padding: 0.15em 0.35em;
  border-radius: 3px;
  color: var(--vp-c-text-1);
}
</style>
