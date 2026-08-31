<script setup lang="ts">
import type { PropertyFilters } from '~/types/property'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const filters = ref<PropertyFilters>({
  territorySlug: (route.query.territory as string) || undefined,
  propertyType: (route.query.type as any) || undefined,
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  hasGenerator: route.query.hasGenerator === '1',
  hasWifi: route.query.hasWifi === '1',
})

const { properties, usingLiveData } = await useProperties(filters.value)
const results = ref(properties)
const live = ref(usingLiveData)

watch(
  filters,
  async (value) => {
    router.replace({
      query: {
        ...(value.territorySlug ? { territory: value.territorySlug } : {}),
        ...(value.propertyType ? { type: value.propertyType } : {}),
        ...(value.minPrice ? { minPrice: String(value.minPrice) } : {}),
        ...(value.maxPrice ? { maxPrice: String(value.maxPrice) } : {}),
        ...(value.hasGenerator ? { hasGenerator: '1' } : {}),
        ...(value.hasWifi ? { hasWifi: '1' } : {}),
      },
    })
    const result = await useProperties(value)
    results.value = result.properties
    live.value = result.usingLiveData
  },
  { deep: true },
)

const showMap = ref(false)

useHead({ title: t('properties.title') })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('properties.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ t('properties.found', { count: results.length }) }}
          <span v-if="!live" class="ml-2 text-xs text-slate-400">{{ t('home.sample_data_note') }}</span>
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        @click="showMap = !showMap"
      >
        {{ showMap ? t('properties.hide_map') : t('properties.show_map') }}
      </button>
    </div>

    <div class="flex flex-col gap-6 sm:flex-row">
      <FilterSidebar v-model="filters" />

      <div class="flex-1">
        <PropertyMap
          v-if="showMap"
          class="mb-6"
          :points="results.map((p) => ({ lat: p.lat, lng: p.lng, label: p.title, color: p.rentPeriod ? '#2a80de' : '#16a35c' }))"
          height="360px"
        />
        <PropertyList :properties="results" />
      </div>
    </div>
  </div>
</template>
