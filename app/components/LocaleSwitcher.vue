<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

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
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        class="h-auto gap-1.5 border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <AppIcon :name="flagIcon(locale)" class="h-3.5 w-5 shrink-0 overflow-hidden rounded-sm" />
        {{ displayCode(locale) }}
        <svg class="h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-40">
      <DropdownMenuItem
        v-for="l in available"
        :key="l.code"
        :class="l.code === locale ? 'font-semibold text-brand-700 dark:text-brand-400' : ''"
        @click="select(l.code)"
      >
        <AppIcon :name="flagIcon(l.code)" class="h-3.5 w-5 shrink-0 overflow-hidden rounded-sm" />
        {{ l.name }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
