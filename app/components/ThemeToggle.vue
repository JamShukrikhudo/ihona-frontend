<script setup lang="ts">
const theme = useThemeStore()

onMounted(() => theme.restore())
</script>

<template>
  <button
    type="button"
    class="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    :aria-label="theme.dark ? 'Светлая тема' : 'Тёмная тема'"
    @click="theme.toggle()"
  >
    <span v-if="theme.dark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>
