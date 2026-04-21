import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ja-JP',
  title: 'Web フロントエンド入門',
  description: 'Web フロントエンドをこれから学ぶ人向けの学習コンテンツ',
  themeConfig: {
    sidebar: [
      { text: 'はじめに', link: '/introduction/' },
      {
        text: '1. Web の素材（HTML / CSS）',
        collapsed: true,
        items: [{ text: '(準備中)' }],
      },
      {
        text: '2. 動きをつける（JavaScript / DOM）',
        collapsed: true,
        items: [{ text: '(準備中)' }],
      },
      {
        text: '3. 型と道具（TypeScript / Vite / npm）',
        collapsed: true,
        items: [{ text: '(準備中)' }],
      },
      {
        text: '4. React',
        collapsed: true,
        items: [{ text: '(準備中)' }],
      },
      {
        text: '5. Next.js（App Router）',
        collapsed: true,
        items: [{ text: '(準備中)' }],
      },
      {
        text: '6. 仕上げ: 小さなアプリを作る',
        collapsed: true,
        items: [{ text: '(準備中)' }],
      },
    ],
  },
})
