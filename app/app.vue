<script setup lang="ts">
// Emits canonical + hreflang alternate <link> tags on every page from the
// current route and the 4 configured locales (ru/tg/uz/en) — needs
// i18n.baseUrl set in nuxt.config.ts to produce absolute URLs.
const localeHead = useLocaleHead({ addSeoAttributes: true })
useHead(localeHead)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
