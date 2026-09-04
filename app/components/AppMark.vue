<script setup lang="ts">
// The small-size brand mark, for spots too small/plain for the full
// AppLogo lockup, e.g. next to the footer's copyright line. Baked-in
// colours (not currentColor) — the mark's own palette carries multiple
// opacity-layered tones that don't reduce to a single themeable colour.
import mark from '~/assets/logo/ihona-mark-small-16px.svg?raw'
</script>

<template>
  <span class="inline-block w-auto [&>svg]:h-full [&>svg]:w-auto" v-html="mark" />
</template>
