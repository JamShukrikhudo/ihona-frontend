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
    <AppIcon name="dark-mode" class="h-4.5 w-4.5" />
  </button>
</template>
