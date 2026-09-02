<script setup lang="ts">
// The small-size house pictogram (no second "peak", per docs/brand
// README.txt: "От 16 до 24 px использовать вариант без второго пика") —
// for spots too small/plain for the full AppLogo lockup, e.g. next to the
// footer's copyright line. currentColor, so it themes via text-color
// classes on the call site rather than swapping files like AppLogo does.
import mark from '~/assets/logo/ihona-mark-small-16px.svg?raw'
</script>

<template>
  <span class="inline-block w-auto [&>svg]:h-full [&>svg]:w-auto" v-html="mark" />
</template>
