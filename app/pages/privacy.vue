<script setup lang="ts">
const { t } = useI18n()

const sections = [1, 2, 3, 4] as const

useHead({ title: t('legal.privacy.title') })
useSeoMeta({
  description: t('legal.privacy.intro'),
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('legal.privacy.title') }}</h1>
    <p class="mt-1 text-xs text-slate-400">{{ t('legal.privacy.updated') }}</p>
    <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ t('legal.privacy.intro') }}</p>

    <div class="mt-6 space-y-5">
      <section v-for="n in sections" :key="n">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t(`legal.privacy.s${n}_title`) }}</h2>
        <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {{ t(`legal.privacy.s${n}_body`, { email: 'info@ihona.tj' }) }}
        </p>
      </section>
    </div>

    <p class="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-800">{{ t('legal.privacy.disclaimer') }}</p>
  </div>
</template>
