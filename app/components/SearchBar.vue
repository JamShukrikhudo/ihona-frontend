<script setup lang="ts">
import { territories, territoryName, cityPropertyTypes, tourismPropertyTypes } from '~/data/territories'
import type { DealTypeValue } from '~/data/territories'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select'

const props = defineProps<{ dealType: DealTypeValue }>()
const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const query = ref('')
const showSuggestions = ref(false)
const propertyType = ref('')
const maxPrice = ref('')

const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return territories
  return territories.filter((territory) => territoryName(territory.slug, t).toLowerCase().includes(q))
})

const selectedTerritorySlug = ref('')

function selectTerritory(slug: string, label: string) {
  selectedTerritorySlug.value = slug
  query.value = label
  showSuggestions.value = false
}

function search() {
  router.push({
    path: localePath(props.dealType === 'sale' ? '/buy' : '/rent'),
    query: {
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
      <Input
        v-model="query"
        type="text"
        :placeholder="t('search.territory_placeholder')"
        class="h-auto py-2.5"
        @focus="showSuggestions = true"
        @blur="() => setTimeout(() => (showSuggestions = false), 150)"
      />
      <ul
        v-if="showSuggestions && suggestions.length"
        class="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      >
        <li
          v-for="territory in suggestions"
          :key="territory.slug"
          class="cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700"
          @mousedown.prevent="selectTerritory(territory.slug, territoryName(territory.slug, t))"
        >
          {{ territoryName(territory.slug, t) }}
        </li>
      </ul>
    </div>

    <Select v-model="propertyType">
      <SelectTrigger class="h-auto w-full py-2.5">
        <SelectValue :placeholder="t('search.all_types')" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{{ t('search.city_types') }}</SelectLabel>
          <SelectItem v-for="type in cityPropertyTypes" :key="type.value" :value="type.value">
            {{ type.icon }} {{ t(`property_type.${type.value}`) }}
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{{ t('search.tourism_types') }}</SelectLabel>
          <SelectItem v-for="type in tourismPropertyTypes" :key="type.value" :value="type.value">
            {{ type.icon }} {{ t(`property_type.${type.value}`) }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <Input v-model="maxPrice" type="number" min="0" :placeholder="t('search.max_price')" class="h-auto py-2.5" />

    <Button type="submit" size="lg" class="bg-accent-600 text-white hover:bg-accent-700">
      {{ t('search.submit') }}
    </Button>
  </form>
</template>
