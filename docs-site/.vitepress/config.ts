import { defineConfig } from 'vitepress'

const enNav = [
  { text: 'Guide', link: '/getting-started' },
  { text: 'API Reference', link: '/api/' },
  { text: 'Examples', link: '/reference/examples' },
  { text: 'Contributing', link: '/contributing' },
]

const frNav = [
  { text: 'Guide', link: '/fr/getting-started' },
  { text: 'Référence API', link: '/api/' },
  { text: 'Exemples', link: '/fr/reference/examples' },
  { text: 'Contribuer', link: '/fr/contributing' },
]

const enSidebar = {
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
}

const frSidebar = {
  '/fr/guides/': [
    {
      text: 'Frameworks',
      items: [
        { text: 'React', link: '/fr/guides/react' },
        { text: 'Vue 3', link: '/fr/guides/vue' },
        { text: 'Angular', link: '/fr/guides/angular' },
        { text: 'Vanilla JS/TS', link: '/fr/guides/vanilla' },
      ],
    },
    {
      text: 'Avancé',
      items: [
        { text: 'Personnalisation des langues', link: '/fr/guides/language-customization' },
        { text: 'Accessibilité', link: '/fr/guides/accessibility' },
      ],
    },
  ],
  '/fr/reference/': [
    {
      text: 'Référence',
      items: [
        { text: "Galerie d'exemples", link: '/fr/reference/examples' },
        { text: 'Architecture', link: '/fr/reference/architecture' },
        { text: 'Dépannage', link: '/fr/reference/troubleshooting' },
        { text: 'FAQ', link: '/fr/reference/faq' },
        { text: 'Guide de migration', link: '/fr/reference/migration' },
      ],
    },
  ],
  '/api/': [{ text: 'Référence API', link: '/api/' }],
}

export default defineConfig({
  title: 'b-board',
  description: 'Framework-agnostic virtual keyboard for Beninese African languages',
  base: '/',

  head: [['link', { rel: 'icon', href: '/logo.svg' }]],

  ignoreDeadLinks: true,

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      title: 'b-board',
      description: 'Clavier virtuel framework-agnostic pour les langues africaines du Bénin',
      themeConfig: {
        nav: frNav,
        sidebar: frSidebar,
        footer: {
          message: 'Publié sous licence MIT.',
          copyright: 'Copyright © 2024-present Sadjad Ousmane',
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'b-board',
    langMenuLabel: 'Langue / Language',

    nav: enNav,
    sidebar: enSidebar,

    search: { provider: 'local' },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ousmanesadjad/b-board' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Sadjad Ousmane',
    },
  },
})
