import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'b-board',
  description: 'Framework-agnostic virtual keyboard for Beninese African languages',
  base: '/',

  ignoreDeadLinks: [
    '/api/',
    '/api/index',
    '/guides/language-customization',
    '/reference/troubleshooting',
    '/reference/examples',
    '/reference/architecture',
    '/reference/faq',
    '/reference/migration',
    '/guides/accessibility',
  ],

  head: [['link', { rel: 'icon', href: '/logo.svg' }]],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'b-board',

    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/reference/examples' },
    ],

    sidebar: {
      '/guides/': [
        {
          text: 'Frameworks',
          items: [
            { text: 'React', link: '/guides/react' },
            { text: 'Vue 3', link: '/guides/vue' },
            { text: 'Angular', link: '/guides/angular' },
            { text: 'Vanilla JS/TS', link: '/guides/vanilla' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Language Customization', link: '/guides/language-customization' },
            { text: 'Accessibility', link: '/guides/accessibility' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Examples Gallery', link: '/reference/examples' },
            { text: 'Architecture', link: '/reference/architecture' },
            { text: 'Troubleshooting', link: '/reference/troubleshooting' },
            { text: 'FAQ', link: '/reference/faq' },
            { text: 'Migration Guide', link: '/reference/migration' },
          ],
        },
      ],
      '/api/': [{ text: 'API Reference', link: '/api/' }],
    },

    search: { provider: 'local' },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ousmanesadjad/b-board' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Sadjad Ousmane',
    },
  },
});
