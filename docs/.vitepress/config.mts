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
          { text: 'View', link: '/tutorial/view' },
          { text: 'View 추상화하기', link: '/tutorial/view-abstract' },
          { text: 'Enable', link: '/tutorial/enable' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/marpple/rune' }
    ]
  }
})
