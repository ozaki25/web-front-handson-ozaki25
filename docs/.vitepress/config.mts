import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

export default withMermaid(
  defineConfig({
    lang: 'ja-JP',
    title: 'Web フロントエンド入門',
    description: 'Web フロントエンドをこれから学ぶ人向けの学習コンテンツ',
    markdown: {
      codeTransformers: [transformerTwoslash()],
      config(md) {
        md.use(tabsMarkdownPlugin)
      },
    },
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'selectedcontent',
        },
      },
    },
    themeConfig: {
      nav: [{ text: 'ホーム', link: '/' }],
      sidebar: [
        { text: 'はじめに', link: '/introduction/' },
        {
          text: '1. HTML / CSS',
          collapsed: true,
          items: [{ text: '(準備中)' }],
        },
        {
          text: '2. JavaScript',
          collapsed: true,
          items: [{ text: '(準備中)' }],
        },
        {
          text: '3. TypeScript',
          collapsed: true,
          items: [{ text: '(準備中)' }],
        },
        {
          text: '4. React',
          collapsed: true,
          items: [{ text: '(準備中)' }],
        },
        {
          text: '5. Next.js',
          collapsed: true,
          items: [{ text: '(準備中)' }],
        },
      ],
      outline: {
        label: '目次',
      },
      docFooter: {
        prev: '前のレッスン',
        next: '次のレッスン',
      },
      search: {
        provider: 'local',
        options: {
          translations: {
            button: { buttonText: '検索' },
            modal: {
              noResultsText: '見つかりませんでした',
              resetButtonTitle: 'リセット',
            },
          },
        },
      },
    },
  })
)
