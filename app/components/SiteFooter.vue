<script setup lang="ts">
import { territories } from '~/data/territories'

const { t } = useI18n()
</script>

<template>
  <footer class="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
        <div>
          <AppLogo class="mb-3 text-[56.7px]" />
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('footer.tagline') }}</p>
        </div>
        <div>
          <h3 class="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('footer.territories') }}</h3>
          <ul class="space-y-1 text-sm text-slate-500 dark:text-slate-400">
            <li v-for="territory in territories" :key="territory.slug">
              <NuxtLink :to="`/territories/${territory.slug}`" class="hover:text-brand-700 dark:hover:text-brand-400">
                {{ territory.nameRu }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('footer.company') }}</h3>
          <ul class="space-y-1 text-sm text-slate-500 dark:text-slate-400">
            <li><NuxtLink to="/" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('footer.about') }}</NuxtLink></li>
            <li><NuxtLink to="/" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('footer.contacts') }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h3 class="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('footer.currency') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">TJS — Сомони</p>
        </div>
      </div>
      <p class="mt-8 flex items-center gap-1.5 border-t border-slate-100 pt-6 text-xs text-slate-400 dark:border-slate-800">
        <AppMark class="h-3.5" /> © {{ new Date().getFullYear() }} ihona.tj
      </p>
    </div>
  </footer>
</template>
