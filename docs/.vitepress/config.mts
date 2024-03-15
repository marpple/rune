import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Rune",
  description: "Hello, Rune!",
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
          { text: 'View', link: '/tutorial/view' },
          { text: 'View 추상화하기', link: '/tutorial/view-abstract' },
          { text: 'Enable', link: '/tutorial/enable' },
          { text: 'Markdown Examples', link: '/markdown-examples' },
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'API name', link: '/api/examples' },
        ]
      }
    ],



    socialLinks: [
      { icon: 'github', link: 'https://github.com/marpple/rune' }
    ]
  }
})
