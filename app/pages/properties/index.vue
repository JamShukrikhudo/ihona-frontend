<script setup lang="ts">
import type { PropertyFilters } from '~/types/property'
import type { DealTypeValue } from '~/data/territories'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const filters = ref<PropertyFilters>({
  territorySlug: (route.query.territory as string) || undefined,
  propertyType: (route.query.type as any) || undefined,
  dealType: (route.query.deal as DealTypeValue) || undefined,
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  rooms: route.query.rooms ? String(route.query.rooms).split(',').map(Number) : undefined,
  hasGenerator: route.query.hasGenerator === '1',
  hasWifi: route.query.hasWifi === '1',
  sort: (route.query.sort as PropertyFilters['sort']) || 'newest',
})
const page = ref(route.query.page ? Number(route.query.page) : 1)

const { properties, usingLiveData, meta } = await useProperties({ ...filters.value, page: page.value })
const results = ref(properties)
const live = ref(usingLiveData)
const pagination = ref(meta)

function syncQuery() {
  router.replace({
    query: {
      ...(filters.value.territorySlug ? { territory: filters.value.territorySlug } : {}),
      ...(filters.value.propertyType ? { type: filters.value.propertyType } : {}),
      ...(filters.value.dealType ? { deal: filters.value.dealType } : {}),
      ...(filters.value.minPrice ? { minPrice: String(filters.value.minPrice) } : {}),
      ...(filters.value.maxPrice ? { maxPrice: String(filters.value.maxPrice) } : {}),
      ...(filters.value.rooms?.length ? { rooms: filters.value.rooms.join(',') } : {}),
      ...(filters.value.hasGenerator ? { hasGenerator: '1' } : {}),
      ...(filters.value.hasWifi ? { hasWifi: '1' } : {}),
      ...(filters.value.sort && filters.value.sort !== 'newest' ? { sort: filters.value.sort } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
    },
  })
}

async function reload() {
  syncQuery()
  const result = await useProperties({ ...filters.value, page: page.value })
  results.value = result.properties
  live.value = result.usingLiveData
  pagination.value = result.meta
}

watch(
  filters,
  () => {
    page.value = 1
    reload()
  },
  { deep: true },
)

function goToPage(target: number) {
  if (target < 1 || target > pagination.value.lastPage || target === page.value) return
  page.value = target
  reload()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showMap = ref(false)
const dealTypeOrAny = computed<DealTypeValue>({
  get: () => filters.value.dealType || 'rent',
  set: (v) => (filters.value = { ...filters.value, dealType: v }),
})

useHead({ title: t('properties.title') })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-4">
      <DealTypeTabs v-model="dealTypeOrAny" />
    </div>

    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('properties.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ t('properties.found', { count: pagination.total }) }}
          <span v-if="!live" class="ml-2 text-xs text-slate-400">{{ t('home.sample_data_note') }}</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="filters.sort"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="newest">{{ t('properties.sort_newest') }}</option>
          <option value="price_asc">{{ t('properties.sort_price_asc') }}</option>
          <option value="price_desc">{{ t('properties.sort_price_desc') }}</option>
          <option value="area_desc">{{ t('properties.sort_area_desc') }}</option>
        </select>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="showMap = !showMap"
        >
          {{ showMap ? t('properties.hide_map') : t('properties.show_map') }}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-6 sm:flex-row">
      <FilterSidebar v-model="filters" />

      <div class="flex-1">
        <PropertyMap
          v-if="showMap"
          class="mb-6"
          :points="results.map((p) => ({ lat: p.lat, lng: p.lng, label: p.title, color: p.dealType === 'rent' ? '#2a80de' : '#16a35c' }))"
          height="360px"
        />
        <PropertyList :properties="results" />

        <nav v-if="pagination.lastPage > 1" class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            :disabled="pagination.currentPage <= 1"
            @click="goToPage(pagination.currentPage - 1)"
          >
            ←
          </button>
          <button
            v-for="p in pagination.lastPage"
            :key="p"
            type="button"
            class="h-9 w-9 rounded-lg text-sm"
            :class="p === pagination.currentPage
              ? 'bg-brand-600 font-semibold text-white'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="goToPage(pagination.currentPage + 1)"
          >
            →
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
