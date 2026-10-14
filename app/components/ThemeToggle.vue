<script setup lang="ts">
import { Button } from '~/components/ui/button'

const theme = useThemeStore()
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    class="border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    :aria-label="theme.dark ? 'Светлая тема' : 'Тёмная тема'"
    @click="theme.toggle()"
  >
    <AppIcon :name="theme.dark ? 'light-mode' : 'dark-mode'" class="h-4.5 w-4.5" />
  </Button>
</template>
