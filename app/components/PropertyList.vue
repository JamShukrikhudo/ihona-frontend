<script setup lang="ts">
import type { Property } from '~/types/property'

defineProps<{ properties: Property[]; activeId?: number | null }>()
defineEmits<{ 'card-hover': [id: number]; 'card-leave': [] }>()
const { t } = useI18n()
</script>

<template>
  <div v-if="properties.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
    <div
      v-for="property in properties"
      :key="property.id"
      class="rounded-2xl transition"
      :class="activeId === property.id ? 'ring-2 ring-brand-500' : ''"
      @mouseenter="$emit('card-hover', property.id)"
      @mouseleave="$emit('card-leave')"
    >
      <PropertyCard :property="property" />
    </div>
  </div>
  <p v-else class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
    {{ t('home.no_results') }}
  </p>
</template>
