---
title: クイズ — 1章 HTML / CSS
---

# 1章 HTML / CSS

<script setup>
import { quizzesByChapter } from '../data/index'
const quizzes = quizzesByChapter[1]
</script>

<QuizPage :quizzes="quizzes" title="1章 HTML / CSS" />
