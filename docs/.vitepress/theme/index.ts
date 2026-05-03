import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import { useRoute, type EnhanceAppContext } from 'vitepress'
import { inject as injectVercelAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import LessonComplete from './components/LessonComplete.vue'
import LessonProgress from './components/LessonProgress.vue'
import LiveDemo from './components/LiveDemo.vue'
import QuizCard from './components/QuizCard.vue'
import QuizPage from './components/QuizPage.vue'
import QuizTop from './components/QuizTop.vue'
import QuizReview from './components/QuizReview.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    const route = useRoute()
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h(LessonComplete, { key: route.path }),
    })
  },
  enhanceApp({ app }: EnhanceAppContext) {
    enhanceAppWithTabs(app)
    app.component('LessonProgress', LessonProgress)
    app.component('LiveDemo', LiveDemo)
    app.component('QuizCard', QuizCard)
    app.component('QuizPage', QuizPage)
    app.component('QuizTop', QuizTop)
    app.component('QuizReview', QuizReview)
    if (typeof window !== 'undefined') {
      injectVercelAnalytics()
      injectSpeedInsights()
    }
  },
}
