<script setup lang="ts">
import { territories } from '~/data/territories'

const modelValue = defineModel<string>({ default: '' })
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <input type="radio" :checked="modelValue === ''" class="accent-brand-600" @change="modelValue = ''" />
      {{ t('search.all_territories') }}
    </label>
    <label v-for="territory in territories" :key="territory.slug" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <input
        type="radio"
        :checked="modelValue === territory.slug"
        class="accent-brand-600"
        @change="modelValue = territory.slug"
      />
      {{ territory.nameRu }}
    </label>
  </div>
</template>
