---
title: ドリル — ランダム 10 問
prev: false
next: false
---

# ランダム 10 問

全問からランダムに 10 問だけ出題します。少しまとまった時間で、章をまたいで力試ししたいときに。

<script setup>
import { ref } from 'vue'
import { allQuizzes } from '../data/index'

const sample = ref(
  [...allQuizzes]
    .map((q) => ({ q, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, 10)
    .map((x) => x.q),
)
</script>

<QuizPage :quizzes="sample" title="ランダム 10 問" :shuffle="false" />
