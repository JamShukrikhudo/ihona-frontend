<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const available = computed(() => locales.value as { code: string; name: string }[])

// Display only — the i18n locale code ('tg', matching tg.json and the
// /tg/... URL prefix) stays untouched. "TG" is the ISO language code for
// Tajik, but reads as unfamiliar next to the .tj domain; shown as "TJ" here
// to match how the market actually recognises it.
function displayCode(code: string): string {
  return code === 'tg' ? 'TJ' : code.toUpperCase()
}

// Flags are per-country, not per-language — ru/en don't map to a single
// "correct" country, but a Russian/English flag next to the code is the
// convention readers already recognise from other sites' language pickers.
const FLAGS: Record<string, string> = {
  ru: '🇷🇺',
  tg: '🇹🇯',
  uz: '🇺🇿',
  en: '🇬🇧',
}
function flag(code: string): string {
  return FLAGS[code] ?? ''
}
</script>

<template>
  <select
    :value="locale"
    class="cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    @change="setLocale(($event.target as HTMLSelectElement).value)"
  >
    <option v-for="l in available" :key="l.code" :value="l.code" :title="l.name">{{ flag(l.code) }} {{ displayCode(l.code) }}</option>
  </select>
</template>
