---
title: ドリル — ランダム 5 問
prev: false
next: false
---

# ランダム 5 問

全問からランダムに 5 問だけ出題します。最初に試したいときや、すきま時間にどうぞ。

<script setup>
import { ref } from 'vue'
import { allQuizzes } from '../data/index'

const sample = ref(
  [...allQuizzes]
    .map((q) => ({ q, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, 5)
    .map((x) => x.q),
)
</script>

<QuizPage :quizzes="sample" title="ランダム 5 問" :shuffle="false" />
