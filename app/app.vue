<script setup lang="ts">
// Emits canonical + hreflang alternate <link> tags on every page from the
// current route and the 4 configured locales (ru/tg/uz/en) — needs
// i18n.baseUrl set in nuxt.config.ts to produce absolute URLs.
const localeHead = useLocaleHead({ addSeoAttributes: true })
useHead(localeHead)

// Reactive so it's part of the actual SSR'd <html> tag (theme's cookie is
// readable server-side) rather than a client-only classList.toggle() after
// hydration, which is what used to cause a flash of the wrong theme.
const theme = useThemeStore()
useHead({ htmlAttrs: { class: computed(() => (theme.dark ? 'dark' : '')) } })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToast />
  <CookieNotice />
</template>
