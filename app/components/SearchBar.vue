<script setup lang="ts">
import { territories, cityPropertyTypes, tourismPropertyTypes } from '~/data/territories'
import type { DealTypeValue } from '~/data/territories'

const props = defineProps<{ dealType: DealTypeValue }>()
const { t } = useI18n()
const router = useRouter()

const query = ref('')
const showSuggestions = ref(false)
const propertyType = ref('')
const maxPrice = ref('')

const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return territories
  return territories.filter((t) => t.nameRu.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
})

const selectedTerritorySlug = ref('')

function selectTerritory(slug: string, label: string) {
  selectedTerritorySlug.value = slug
  query.value = label
  showSuggestions.value = false
}

function search() {
  router.push({
    path: '/properties',
    query: {
      deal: props.dealType,
      ...(selectedTerritorySlug.value ? { territory: selectedTerritorySlug.value } : {}),
      ...(propertyType.value ? { type: propertyType.value } : {}),
      ...(maxPrice.value ? { maxPrice: maxPrice.value } : {}),
    },
  })
}
</script>

<template>
  <form
    class="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:grid-cols-4 sm:p-5 dark:bg-slate-900 dark:ring-white/10"
    @submit.prevent="search"
  >
    <div class="relative">
      <input
        v-model="query"
        type="text"
        :placeholder="t('search.territory_placeholder')"
        class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        @focus="showSuggestions = true"
        @blur="() => setTimeout(() => (showSuggestions = false), 150)"
      />
      <ul
        v-if="showSuggestions && suggestions.length"
        class="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      >
        <li
          v-for="t2 in suggestions"
          :key="t2.slug"
          class="cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700"
          @mousedown.prevent="selectTerritory(t2.slug, t2.nameRu)"
        >
          {{ t2.nameRu }}
        </li>
      </ul>
    </div>

    <select
      v-model="propertyType"
      class="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      <option value="">{{ t('search.all_types') }}</option>
      <optgroup :label="t('search.city_types')">
        <option v-for="type in cityPropertyTypes" :key="type.value" :value="type.value">{{ type.icon }} {{ type.label }}</option>
      </optgroup>
      <optgroup :label="t('search.tourism_types')">
        <option v-for="type in tourismPropertyTypes" :key="type.value" :value="type.value">{{ type.icon }} {{ type.label }}</option>
      </optgroup>
    </select>

    <input
      v-model="maxPrice"
      type="number"
      min="0"
      :placeholder="t('search.max_price')"
      class="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    />

    <button
      type="submit"
      class="rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700"
    >
      {{ t('search.submit') }}
    </button>
  </form>
</template>
