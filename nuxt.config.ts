import tailwindcss from '@tailwindcss/vite'
import { ofetch } from 'ofetch'
import { territories } from './app/data/territories'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/sitemap'],

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
          const res = await ofetch<{ data: { id: number }[]; meta: { last_page: number } }>(
            `${apiBase}/v1/public/properties`,
            { query: { page, page_size: 60 } },
          )
          propertyUrls.push(...res.data.map((p) => ({ loc: `/properties/${p.id}` })))
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
