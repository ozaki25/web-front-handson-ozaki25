---
title: クイズ — ランダム出題
---

# ランダム出題

全問からランダムに出題します。

<script setup>
import { allQuizzes } from '../data/index'
</script>

<QuizPage :quizzes="allQuizzes" title="ランダム出題（全問）" :shuffle="true" />
