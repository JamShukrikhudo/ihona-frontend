<script setup lang="ts">
const { t } = useI18n()

// Was 7 numbered sections — read as a wall of legalese and made the first
// item alone enough to make a visitor uneasy. Three short paragraphs say
// the same substance without the enumerated-clauses feel.
const paragraphs = [1, 2, 3] as const

useHead({ title: t('legal.privacy.title') })
useSeoMeta({
  description: t('legal.privacy.intro'),
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('legal.privacy.title') }}</h1>
    <p class="mt-1 text-xs text-slate-400">{{ t('legal.privacy.updated') }}</p>

    <div class="mt-6 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
      <p class="font-medium text-slate-800 dark:text-slate-100">{{ t('legal.privacy.intro') }}</p>
      <p v-for="n in paragraphs" :key="n">{{ t(`legal.privacy.body${n}`) }}</p>
    </div>

    <p class="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-800">{{ t('legal.privacy.disclaimer') }}</p>
  </div>
</template>
