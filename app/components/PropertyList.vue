<script setup lang="ts">
import type { Property } from '~/types/property'

defineProps<{ properties: Property[] }>()
const { t } = useI18n()
</script>

<template>
  <div v-if="properties.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
    <PropertyCard v-for="property in properties" :key="property.id" :property="property" />
  </div>
  <p v-else class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
    {{ t('home.no_results') }}
  </p>
</template>
