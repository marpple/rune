import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Rune",
  description: "Hello, Rune!",
  base: '/rune/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Rune?', link: '/guide/what-is-rune' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ]
      },
      {
        text: 'Tutorial',
        items: [
          { text: 'View 만들기', link: '/tutorial/view' },
          { text: 'Event 다루기', link: '/tutorial/event' },
          { text: 'View 추상화', link: '/tutorial/abstract-view' },
          { text: 'Enable 패턴', link: '/tutorial/enable' },
          { text: 'Solo Component SSR', link: '/tutorial/solo-component-ssr' },
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'View', link: '/api/view' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/marpple/rune' }
    ]
  }
})
