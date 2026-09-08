import tailwindcss from '@tailwindcss/vite'
import { ofetch } from 'ofetch'
import { territories } from './app/data/territories'
import { propertySlug } from './app/utils/slug'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/sitemap', 'nuxt-gtag'],

  // GA4 pageview/session tracking. nuxt-gtag already tracks SPA route
  // changes automatically (Nuxt's client-side navigation wouldn't otherwise
  // fire a pageview per page). Loads only when an ID is actually set, so a
  // dev checkout with no NUXT_PUBLIC_GA4_ID env var doesn't send anything.
  gtag: {
    id: process.env.NUXT_PUBLIC_GA4_ID || '',
    enabled: Boolean(process.env.NUXT_PUBLIC_GA4_ID),
  },

  site: {
    url: 'https://ihona.tj',
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      // Backend REST API. No public/anonymous browse endpoint exists there
      // yet — composables fall back to mock data until it does (see README).
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://ihona.tj/api',
      // Yandex Maps JS API v3 key (https://developer.tech.yandex.ru/services).
      // PropertyMap renders a static placeholder when this is unset.
      yandexMapsApiKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY || '',
      // Yandex Metrika counter id (https://metrika.yandex.ru). See
      // app/plugins/yandex-metrika.client.ts — loads only when set.
      yandexMetrikaId: process.env.NUXT_PUBLIC_YANDEX_METRIKA_ID || '',
      // Pre-launch guard: unset/false means the catalog isn't ready for
      // search traffic yet — every response gets a noindex header and
      // robots.txt disallows crawling entirely (see server/routes/robots.txt.ts
      // and the routeRules block below). Flip with
      // `Environment=NUXT_PUBLIC_LAUNCHED=true` in the systemd unit + restart
      // once the site is ready to be found.
      launched: process.env.NUXT_PUBLIC_LAUNCHED === 'true',
      // Telegram Login Widget bot username (@BotFather). Unset hides the
      // widget in SocialLogin.vue — the backend's identity-socialstream
      // module verifies the callback independently of this.
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME || '',
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Robots-Tag': process.env.NUXT_PUBLIC_LAUNCHED === 'true' ? 'all' : 'noindex, nofollow',
      },
    },
  },

  i18n: {
    baseUrl: 'https://ihona.tj',
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'tg', language: 'tg-TJ', name: 'Тоҷикӣ', file: 'tg.json' },
      { code: 'uz', language: 'uz-UZ', name: 'O‘zbekcha', file: 'uz.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    lazy: true,
  },

  app: {
    head: {
      titleTemplate: '%s — ihona.tj',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        // Poppins SemiBold (600) — the "ıhona" wordmark's own font-family
        // attribute (docs/brand assets) needs it loaded page-wide since the
        // logo SVG is inlined, not a separate <img> resource.
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // display=block (not swap): the wordmark's dot is a separately
        // positioned <rect>, calibrated against Poppins' own glyph metrics —
        // with swap, the fallback font paints first at different metrics and
        // the fixed-position dot doesn't move with the later glyph swap, so
        // it visibly drifts off the "ı" until the real font loads.
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=block' },
        // SVG favicon is primary; prefers-color-scheme swaps in the dark-bg
        // variant automatically. PNGs are the fallback for browsers/clients
        // that don't support SVG favicons.
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', media: '(prefers-color-scheme: light)' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon-dark-bg.svg', media: '(prefers-color-scheme: dark)' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon-180.png' },
      ],
    },
  },

  // Private/utility routes (auth forms, the per-visitor favorites list) carry
  // no indexable content and are excluded rather than crawled and ignored.
  sitemap: {
    exclude: ['/account/login', '/account/register', '/favorites'],
    urls: async () => {
      const territoryUrls = territories.map((t) => ({ loc: `/territories/${t.slug}` }))

      // Live listings come from the public, unauthenticated properties
      // endpoint — same one the catalog page itself queries. Paginated
      // through in full so every current listing gets a sitemap entry.
      const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://ihona.tj/api'
      const propertyUrls: { loc: string }[] = []
      try {
        let page = 1
        let lastPage = 1
        do {
          const res = await ofetch<{ data: { id: number; title: string }[]; meta: { last_page: number } }>(
            `${apiBase}/v1/public/properties`,
            { query: { page, page_size: 60 } },
          )
          propertyUrls.push(...res.data.map((p) => ({ loc: `/properties/${propertySlug(p)}` })))
          lastPage = res.meta.last_page
          page += 1
        } while (page <= lastPage)
      } catch (error) {
        // API unreachable when the sitemap route is hit — ship the static/
        // territory routes rather than fail the whole sitemap.
        console.warn('[sitemap] could not fetch live properties:', error)
      }

      return [...territoryUrls, ...propertyUrls]
    },
  },
})
