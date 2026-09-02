<script setup lang="ts">
// Inlines the brand kit's lockup (docs/brand/README.txt) — emerald mark on
// light backgrounds, white mark on dark, swapped from the same theme store
// ThemeToggle uses. Inlined (not <img>) so the "ıhona" wordmark's own
// font-family="Poppins…" resolves against the page's loaded Poppins
// instead of falling back silently the way an external SVG resource would.
import emeraldLockup from '~/assets/logo/ihona-lockup-emerald.svg?raw'
import whiteLockup from '~/assets/logo/ihona-lockup-white.svg?raw'

const theme = useThemeStore()
const markup = computed(() => (theme.dark ? whiteLockup : emeraldLockup))
</script>

<template>
  <span class="inline-block h-8 w-auto [&>svg]:h-full [&>svg]:w-auto" v-html="markup" />
</template>
