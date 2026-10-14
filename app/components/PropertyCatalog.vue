<script setup lang="ts">
import type { Property, PropertyFilters } from '~/types/property'
import type { DealTypeValue } from '~/data/territories'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

// Shared by /properties, /rent and /buy — the only difference between them
// is whether dealType is locked to one value (and, correspondingly, which
// bare path is this content's own canonical home). See the canonical/
// indexability comment near the bottom for why that matters.
const props = defineProps<{
  basePath: '/properties' | '/rent' | '/buy'
  lockedDealType?: DealTypeValue
  pageTitle: string
  pageDescription: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()

const filters = ref<PropertyFilters>({
  territorySlug: (route.query.territory as string) || undefined,
  propertyType: (route.query.type as any) || undefined,
  commercialSubtype: (route.query.commercialSubtype as any) || undefined,
  dealType: props.lockedDealType ?? ((route.query.deal as DealTypeValue) || undefined),
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  rooms: route.query.rooms ? String(route.query.rooms).split(',').map(Number) : undefined,
  hasGenerator: route.query.hasGenerator === '1',
  hasWifi: route.query.hasWifi === '1',
  sort: (route.query.sort as PropertyFilters['sort']) || 'newest',
})
const page = ref(route.query.page ? Number(route.query.page) : 1)
const PAGE_SIZE = 24

// Loaded once, filtered instantly on the client from then on — the same
// "no request per filter change" idea as ymaps v2.1's ObjectManager.setFilter(),
// adapted to our stack: v3 has no ObjectManager, so this is a plain reactive
// filter over an in-memory array instead. Only sane at our actual listing
// count (tens to low hundreds); useAllProperties() pages through the API's
// 60-per-page cap to fetch everything up front.
const { properties: allProperties, usingLiveData } = await useAllProperties()
const live = ref(usingLiveData)

const filteredSorted = computed(() => sortProperties(applyFilters(allProperties, filters.value), filters.value.sort))
const pagination = computed(() => ({
  currentPage: page.value,
  lastPage: Math.max(1, Math.ceil(filteredSorted.value.length / PAGE_SIZE)),
  total: filteredSorted.value.length,
}))
const results = computed(() => filteredSorted.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// Every filtered listing's pin, regardless of the current page — so panning/
// zooming the map isn't limited to whatever page the list happens to be on.
// Price is shown right on the pin, cian-style — the one thing worth knowing
// before a click. A bare "6 500 TJS" reads fine on /rent or /buy (every pin
// there is already the same deal type), but is genuinely ambiguous on
// /properties, where sale and rent pins sit side by side — so only there
// does a rental price get its "/мес"-or-"/ночь" suffix.
function pinPrice(p: Property): string {
  const amount = new Intl.NumberFormat('ru-RU', { notation: p.price >= 1_000_000 ? 'compact' : 'standard' }).format(p.price)
  const suffix =
    !props.lockedDealType && p.dealType === 'rent'
      ? t(p.rentPeriod === 'night' ? 'property.pin_suffix_night' : 'property.pin_suffix_month')
      : ''
  return `${amount} TJS${suffix}`
}
const mapPoints = computed(() =>
  filteredSorted.value.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    label: p.title,
    color: p.dealType === 'rent' ? '#2a80de' : '#37956E',
    price: pinPrice(p),
    image: p.images[0],
    subtitle: p.address,
  })),
)

function syncQuery() {
  router.replace({
    query: {
      ...(filters.value.territorySlug ? { territory: filters.value.territorySlug } : {}),
      ...(filters.value.propertyType ? { type: filters.value.propertyType } : {}),
      ...(filters.value.commercialSubtype ? { commercialSubtype: filters.value.commercialSubtype } : {}),
      // dealType isn't a query param at all on /rent or /buy — it's implicit
      // in the path there, and locked so the user can never change it away.
      ...(!props.lockedDealType && filters.value.dealType ? { deal: filters.value.dealType } : {}),
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

watch(
  filters,
  () => {
    page.value = 1
    syncQuery()
  },
  { deep: true },
)

function goToPage(target: number) {
  if (target < 1 || target > pagination.value.lastPage || target === page.value) return
  page.value = target
  syncQuery()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showMap = ref(false)
const dealTypeOrAny = computed<DealTypeValue>({
  get: () => filters.value.dealType || 'rent',
  set: (v) => (filters.value = { ...filters.value, dealType: v }),
})

// List <-> map hover/click sync (cian-style): hovering a card highlights its
// pin and vice versa; clicking a pin jumps to that listing.
const activePropertyId = ref<number | null>(null)

function onMarkerClick(id: number | string) {
  const property = allProperties.find((p) => p.id === id)
  router.push(localePath(`/properties/${property ? propertySlug(property) : id}`))
}

// "Search this area": the map reports its viewport once panning/zooming
// settles (Yandex's own actionend event — no manual debounce needed).
// Everything's already loaded client-side, so applying this is instant too
// (see applyFilters' bbox check) — the button is still opt-in rather than
// live-while-dragging so the list/pins don't jump around mid-pan.
const pendingBounds = ref<PropertyFilters['bbox']>(undefined)
const boundsChanged = ref(false)

function onBoundsChange(bounds: NonNullable<PropertyFilters['bbox']>) {
  pendingBounds.value = bounds
  boundsChanged.value = true
}

function searchThisArea() {
  if (!pendingBounds.value) return
  filters.value = { ...filters.value, bbox: pendingBounds.value }
  boundsChanged.value = false
}

useHead({ title: props.pageTitle })
useSeoMeta({
  description: props.pageDescription,
  ogTitle: props.pageTitle,
  ogDescription: props.pageDescription,
})

// /properties, /rent, /buy and /territories/{slug} are the only URLs in
// this "catalog" family worth ranking on their own — every other filter
// combination (type, price, rooms, amenities, a map viewport, or /properties
// reached with a manual ?deal=) is a real, crawlable, server-rendered URL
// but a duplicate *view* of one of those four, not a distinct page. Rather
// than letting them all compete with each other and with /territories/{slug}
// for the same searches, each one canonicalizes to whichever of the four
// actually matches its filters, and only indexes itself when it already
// *is* that match — e.g. /buy is indexable bare, but /properties?deal=sale
// canonicalizes to /buy and is noindexed, and /rent?territory=dushanbe
// canonicalizes to /territories/dushanbe (losing the deal-type facet — we
// have no page for that intersection yet) and is noindexed too.
const hasExtraFilters = computed(
  () =>
    Boolean(filters.value.propertyType) ||
    Boolean(filters.value.commercialSubtype) ||
    Boolean(filters.value.minPrice) ||
    Boolean(filters.value.maxPrice) ||
    Boolean(filters.value.rooms?.length) ||
    filters.value.hasGenerator ||
    filters.value.hasWifi ||
    Boolean(filters.value.bbox),
)
const dealTypePath = computed(() => (filters.value.dealType === 'sale' ? '/buy' : '/rent'))
const cleanPathForCurrentFilters = computed(() => {
  if (hasExtraFilters.value) {
    return filters.value.dealType ? dealTypePath.value : '/properties'
  }
  if (filters.value.territorySlug) {
    return `/territories/${filters.value.territorySlug}`
  }
  if (filters.value.dealType) {
    return dealTypePath.value
  }
  return '/properties'
})
const isIndexable = computed(() => !hasExtraFilters.value && cleanPathForCurrentFilters.value === props.basePath)

useHead({ link: [{ rel: 'canonical', href: computed(() => `https://ihona.tj${localePath(cleanPathForCurrentFilters.value)}`) }] })
useSeoMeta({ robots: computed(() => (isIndexable.value ? 'index, follow' : 'noindex, follow')) })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-4">
      <DealTypeTabs v-model="dealTypeOrAny" :nav="Boolean(lockedDealType)" />
    </div>

    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ pageTitle }}</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ t('properties.found', { count: pagination.total }) }}
          <span v-if="!live" class="ml-2 text-xs text-slate-400">{{ t('home.sample_data_note') }}</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Select v-model="filters.sort">
          <SelectTrigger class="h-auto w-auto py-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{{ t('properties.sort_newest') }}</SelectItem>
            <SelectItem value="price_asc">{{ t('properties.sort_price_asc') }}</SelectItem>
            <SelectItem value="price_desc">{{ t('properties.sort_price_desc') }}</SelectItem>
            <SelectItem value="area_desc">{{ t('properties.sort_area_desc') }}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" @click="showMap = !showMap">
          {{ showMap ? t('properties.hide_map') : t('properties.show_map') }}
        </Button>
      </div>
    </div>

    <div class="flex flex-col gap-6 sm:flex-row">
      <FilterSidebar v-model="filters" />

      <div class="flex-1">
        <!-- Single map element, always mounted with real dimensions — the -->
        <!-- earlier version toggled two separate PropertyMap instances -->
        <!-- with lg:hidden/hidden-lg:grid, which mounts the CSS-hidden one -->
        <!-- into a display:none (0×0) container; Yandex Maps measures its -->
        <!-- container at construction time, so that instance never renders -->
        <!-- pins even once it later becomes visible. `order` only changes -->
        <!-- position, never display:none, so this map is always properly -->
        <!-- sized: stacked above the list on mobile, sticky aside on lg+. -->
        <div v-if="showMap" class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="order-2 lg:order-1 lg:col-span-2">
            <PropertyList
              :properties="results"
              :active-id="activePropertyId"
              @card-hover="activePropertyId = $event"
              @card-leave="activePropertyId = null"
            />
          </div>
          <aside class="order-1 h-fit space-y-3 lg:order-2 lg:sticky lg:top-20">
            <PropertyMap
              :points="mapPoints"
              :active-id="activePropertyId"
              height="420px"
              @marker-click="onMarkerClick"
              @marker-hover="activePropertyId = Number($event)"
              @marker-leave="activePropertyId = null"
              @bounds-change="onBoundsChange"
            />
            <Button v-if="boundsChanged" size="lg" class="w-full bg-brand-600 text-white hover:bg-brand-700" @click="searchThisArea">
              {{ t('properties.search_this_area') }}
            </Button>
          </aside>
        </div>

        <PropertyList v-else :properties="results" />

        <nav v-if="pagination.lastPage > 1" class="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <Button variant="outline" size="icon" :disabled="pagination.currentPage <= 1" @click="goToPage(pagination.currentPage - 1)">
            ←
          </Button>
          <Button
            v-for="p in pagination.lastPage"
            :key="p"
            size="icon"
            :variant="p === pagination.currentPage ? 'default' : 'outline'"
            :class="p === pagination.currentPage ? 'bg-brand-600 hover:bg-brand-700' : ''"
            @click="goToPage(p)"
          >
            {{ p }}
          </Button>
          <Button variant="outline" size="icon" :disabled="pagination.currentPage >= pagination.lastPage" @click="goToPage(pagination.currentPage + 1)">
            →
          </Button>
        </nav>
      </div>
    </div>
  </div>
</template>
