<script setup lang="ts">
import { cityPropertyTypes, tourismPropertyTypes } from '~/data/territories'
import type { PropertyFilters } from '~/types/property'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select'

const filters = defineModel<PropertyFilters>({ required: true })
const { t } = useI18n()

const territorySlug = computed({
  get: () => filters.value.territorySlug ?? '',
  set: (v: string) => (filters.value = { ...filters.value, territorySlug: v || undefined }),
})
const rooms = computed({
  get: () => filters.value.rooms ?? [],
  set: (v: number[]) => (filters.value = { ...filters.value, rooms: v.length ? v : undefined }),
})
const showRooms = computed(() => filters.value.propertyType !== 'land' && filters.value.propertyType !== 'commercial')
</script>

<template>
  <aside class="flex w-full flex-col gap-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:w-64">
    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.territory') }}</h3>
      <TerritoryFilter v-model="territorySlug" />
    </div>

    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.type') }}</h3>
      <Select v-model="filters.propertyType">
        <SelectTrigger class="h-auto w-full py-2">
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
    </div>

    <div v-if="showRooms">
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.rooms') }}</h3>
      <RoomsFilter v-model="rooms" />
    </div>

    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.price') }}, TJS</h3>
      <div class="flex items-center gap-2">
        <Input v-model.number="filters.minPrice" type="number" min="0" :placeholder="t('filters.from')" class="w-1/2" />
        <Input v-model.number="filters.maxPrice" type="number" min="0" :placeholder="t('filters.to')" class="w-1/2" />
      </div>
    </div>

    <div>
      <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ t('filters.amenities') }}</h3>
      <label class="mb-1.5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Checkbox v-model="filters.hasGenerator" />
        <AppIcon name="generator" class="h-4 w-4" /> {{ t('property.generator') }}
      </label>
      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Checkbox v-model="filters.hasWifi" />
        <AppIcon name="wifi" class="h-4 w-4" /> Wi-Fi
      </label>
    </div>
  </aside>
</template>
