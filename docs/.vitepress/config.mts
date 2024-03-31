import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/rune/',
  description: 'Web API based Front-end SDK',
  title: 'Rune',
  lang: 'en-US',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/favicon.ico',
      },
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo.png',
      },
    ],
    ['meta', { property: 'og:description', content: 'Web API based Front-end SDK' }],
  ],
  themeConfig: {
    search: {
      provider: 'local',
    },
  },
  locales: {
    root: {
      label: 'English',
      title: 'Rune',
      description: 'Web API based Front-end SDK',
      lang: 'en-US',
      head: [
        [
          'link',
          {
            rel: 'icon',
            href: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/favicon.ico',
          },
        ],
        [
          'meta',
          {
            property: 'og:image',
            content: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo.png',
          },
        ],
        ['meta', { property: 'og:description', content: 'Web API based Front-end SDK' }],
      ],
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: {
          light: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo.png',
          dark: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo_dark.png',
          alt: 'rune',
        },
        siteTitle: false,
        nav: [
          { text: 'Tutorial', link: '/tutorial/view' },
          { text: 'Reference ', link: '/api/view' },
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'What is Rune?', link: '/guide/what-is-rune' },
              { text: 'Getting Started', link: '/guide/getting-started' },
            ],
          },
          {
            text: 'Tutorial',
            items: [
              { text: 'Creating a View', link: '/tutorial/view' },
              { text: 'Event Handling', link: '/tutorial/event' },
              { text: 'Type-safe Custom Event', link: '/tutorial/type-safe-event' },
              { text: 'Abstracting View', link: '/tutorial/abstract-view' },
              { text: 'Enable Pattern', link: '/tutorial/enable' },
              { text: 'Solo Component SSR', link: '/tutorial/solo-component-ssr' },
            ],
          },
          {
            text: 'Reference',
            items: [
              { text: 'View class', link: '/api/view' },
              { text: 'Template', link: '/api/template' },
              { text: 'Event handling', link: '/api/event' },
              { text: 'Enable class', link: '/api/enable' },
              { text: 'ListView class', link: '/api/list-view' },
              { text: 'DOM Manipulation', link: '/api/$element' },
            ],
          },
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/marpple/rune' }],
        footer: {
          copyright:
            'Copyright © 2024 <a href="https://www.marpplecorp.com/" target="_blank">Marpple Corporation ↗</a>',
        },
      },
    },
    ko: {
      label: '한국어',
      title: 'Rune',
      description: 'Web API based Front-end SDK',
      lang: 'ko-KR',
      head: [
        [
          'link',
          {
            rel: 'icon',
            href: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/favicon.ico',
          },
        ],
        [
          'meta',
          {
            property: 'og:image',
            content: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo.png',
          },
        ],
        ['meta', { property: 'og:description', content: 'Web API based Front-end SDK' }],
      ],
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: {
          light: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo.png',
          dark: 'https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo_dark.png',
          alt: 'rune',
        },
        siteTitle: false,
        nav: [
          { text: 'Tutorial', link: '/ko/tutorial/view' },
          { text: 'Reference ', link: '/ko/api/view' },
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'What is Rune?', link: '/ko/guide/what-is-rune' },
              { text: 'Getting Started', link: '/ko/guide/getting-started' },
            ],
          },
          {
            text: 'Tutorial',
            items: [
              { text: 'View 만들기', link: '/ko/tutorial/view' },
              { text: 'Event 다루기', link: '/ko/tutorial/event' },
              { text: '타입 안전한 커스텀 이벤트', link: '/tutorial/type-safe-event' },
              { text: 'View 추상화', link: '/ko/tutorial/abstract-view' },
              { text: 'Enable 패턴', link: '/ko/tutorial/enable' },
              { text: 'Solo Component SSR', link: '/ko/tutorial/solo-component-ssr' },
            ],
          },
          {
            text: 'Reference',
            items: [
              { text: 'View class', link: '/ko/api/view' },
              { text: 'Template', link: '/ko/api/template' },
              { text: 'Event handling', link: '/ko/api/event' },
              { text: 'Enable class', link: '/ko/api/enable' },
              { text: 'ListView class', link: '/ko/api/list-view' },
              { text: 'DOM Manipulation', link: '/ko/api/$element' },
            ],
          },
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/marpple/rune' }],
        footer: {
          copyright:
            'Copyright © 2024 <a href="https://www.marpplecorp.com/" target="_blank">Marpple Corporation ↗</a>',
        },
      },
    },
  },
});
