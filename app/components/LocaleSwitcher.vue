<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const available = computed(() => locales.value as { code: string; name: string }[])
</script>

<template>
  <select
    :value="locale"
    class="cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    @change="setLocale(($event.target as HTMLSelectElement).value)"
  >
    <option v-for="l in available" :key="l.code" :value="l.code" :title="l.name">{{ l.code.toUpperCase() }}</option>
  </select>
</template>
