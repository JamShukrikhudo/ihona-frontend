<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const available = computed(() => locales.value as { code: string; name: string }[])
const open = ref(false)
const root = ref<HTMLElement | null>(null)

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
// SVG icons (app/assets/icons/flag-*.svg), not emoji: a native <option>
// can only hold text, and flag emoji rendered fine in Firefox there but
// silently fell back to plain "RU"/"TJ" text in Chrome on Windows, which
// renders <select>/<option> content through the OS's own font stack
// rather than the page's — SVG sidesteps that entirely.
const FLAGS: Record<string, string> = {
  ru: 'flag-ru',
  tg: 'flag-tg',
  uz: 'flag-uz',
  en: 'flag-gb',
}
function flagIcon(code: string): string {
  return FLAGS[code] ?? ''
}

function select(code: string) {
  setLocale(code)
  open.value = false
}

function onClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      :aria-expanded="open"
      @click="open = !open"
    >
      <AppIcon :name="flagIcon(locale)" class="h-3.5 w-5 shrink-0 overflow-hidden rounded-sm" />
      {{ displayCode(locale) }}
      <svg class="h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
    </button>

    <ul
      v-if="open"
      class="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <li v-for="l in available" :key="l.code">
        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-slate-800"
          :class="l.code === locale ? 'font-semibold text-brand-700 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'"
          @click="select(l.code)"
        >
          <AppIcon :name="flagIcon(l.code)" class="h-3.5 w-5 shrink-0 overflow-hidden rounded-sm" />
          {{ l.name }}
        </button>
      </li>
    </ul>
  </div>
</template>
