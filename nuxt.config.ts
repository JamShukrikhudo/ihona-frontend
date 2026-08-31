import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],

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
})
