---
title: クイズ — 2章 JavaScript
---

# 2章 JavaScript

<script setup>
import { quizzesByChapter } from '../data/index'
const quizzes = quizzesByChapter[2]
</script>

<QuizPage :quizzes="quizzes" title="2章 JavaScript" />
