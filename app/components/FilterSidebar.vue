<script setup lang="ts">
import { propertyTypes } from '~/data/territories'
import type { PropertyFilters } from '~/types/property'

const filters = defineModel<PropertyFilters>({ required: true })
const { t } = useI18n()

const territorySlug = computed({
  get: () => filters.value.territorySlug ?? '',
  set: (v: string) => (filters.value = { ...filters.value, territorySlug: v || undefined }),
})
</script>

<template>
  <aside class="flex w-full flex-col gap-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:w-64">
    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.territory') }}</h3>
      <TerritoryFilter v-model="territorySlug" />
    </div>

    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.type') }}</h3>
      <select
        v-model="filters.propertyType"
        class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">{{ t('search.all_types') }}</option>
        <option v-for="type in propertyTypes" :key="type.value" :value="type.value">{{ type.icon }} {{ type.label }}</option>
      </select>
    </div>

    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.price') }}, TJS</h3>
      <div class="flex items-center gap-2">
        <input
          v-model.number="filters.minPrice"
          type="number"
          min="0"
          :placeholder="t('filters.from')"
          class="w-1/2 rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          v-model.number="filters.maxPrice"
          type="number"
          min="0"
          :placeholder="t('filters.to')"
          class="w-1/2 rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
    </div>

    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.amenities') }}</h3>
      <label class="mb-1.5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input v-model="filters.hasGenerator" type="checkbox" class="accent-brand-600" />
        ⚡ {{ t('property.generator') }}
      </label>
      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input v-model="filters.hasWifi" type="checkbox" class="accent-brand-600" />
        📶 Wi-Fi
      </label>
    </div>
  </aside>
</template>
