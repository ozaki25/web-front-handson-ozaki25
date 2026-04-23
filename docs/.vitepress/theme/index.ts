import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import '@shikijs/vitepress-twoslash/style.css'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import { useRoute, type EnhanceAppContext } from 'vitepress'
import { inject as injectVercelAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import LessonComplete from './components/LessonComplete.vue'
import LessonProgress from './components/LessonProgress.vue'
import LiveDemo from './components/LiveDemo.vue'
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
    app.use(TwoslashFloatingVue)
    enhanceAppWithTabs(app)
    app.component('LessonProgress', LessonProgress)
    app.component('LiveDemo', LiveDemo)
    if (typeof window !== 'undefined') {
      injectVercelAnalytics()
      injectSpeedInsights()
    }
  },
}
