<script setup lang="ts">
import { findTerritoryBySlug, propertyTypeLabel, territoryName } from '~/data/territories'
import type { Property } from '~/types/property'
import { Badge } from '~/components/ui/badge'

const props = withDefaults(defineProps<{ property: Property; initialFavorited?: boolean }>(), {
  initialFavorited: false,
})
const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const territory = computed(() => findTerritoryBySlug(props.property.territorySlug))
const favorited = ref(props.initialFavorited)
const togglingFavorite = ref(false)

const formattedPrice = computed(() => new Intl.NumberFormat('ru-RU').format(props.property.price))
const formattedPriceUsd = computed(() =>
  props.property.priceUsd !== null ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(props.property.priceUsd) : null,
)

// area_unit is authoritative from the backend now (an agent picks it when
// entering the listing) — no more guessing sotka-vs-m² from propertyType.
const areaLabel = computed(() => {
  const unit = props.property.areaUnit === 'sqm' ? 'м²' : t(`property.${props.property.areaUnit}`)
  return `${props.property.area.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ${unit}`
})

const publishedLabel = computed(() => formatPublishedAgo(props.property.publishedAt, t))

// cian/avito-style gallery scrubbing: hovering and moving the mouse across
// the photo scrubs proportionally through the gallery (no click needed) —
// arrows and a counter badge are there for discoverability/precision, and
// a finger swipe does the same job on touch devices.
const imageWrapper = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const displayedImage = computed(() => props.property.images[activeIndex.value] ?? props.property.images[0])
const hasGallery = computed(() => props.property.images.length > 1)
// Beyond ~8 photos, one dot per photo turns into visual noise — the counter
// badge already carries that information precisely.
const dotCount = computed(() => (props.property.images.length <= 8 ? props.property.images.length : 0))

function scrubToPointer(clientX: number) {
  if (!hasGallery.value || !imageWrapper.value) return
  const rect = imageWrapper.value.getBoundingClientRect()
  const ratio = (clientX - rect.left) / rect.width
  const count = props.property.images.length
  activeIndex.value = Math.min(count - 1, Math.max(0, Math.floor(ratio * count)))
}

function resetActiveImage() {
  activeIndex.value = 0
}

function showPrevImage(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  activeIndex.value = (activeIndex.value - 1 + props.property.images.length) % props.property.images.length
}

function showNextImage(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  activeIndex.value = (activeIndex.value + 1) % props.property.images.length
}

// Touch swipe reuses the same activeIndex — but a swipe gesture must not
// also register as the tap that follows the card's NuxtLinkLocale through
// to the property page, so a swipe past the threshold suppresses the next
// click once.
const touchStartX = ref<number | null>(null)
const touchDeltaX = ref(0)
const suppressNextClick = ref(false)

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0]!.clientX
  touchDeltaX.value = 0
}

function onTouchMove(e: TouchEvent) {
  if (touchStartX.value === null) return
  touchDeltaX.value = e.touches[0]!.clientX - touchStartX.value
}

function onTouchEnd() {
  if (Math.abs(touchDeltaX.value) > 30) {
    suppressNextClick.value = true
    if (touchDeltaX.value < 0) activeIndex.value = Math.min(props.property.images.length - 1, activeIndex.value + 1)
    else activeIndex.value = Math.max(0, activeIndex.value - 1)
  }
  touchStartX.value = null
  touchDeltaX.value = 0
}

function onCardClick(e: MouseEvent) {
  if (suppressNextClick.value) {
    e.preventDefault()
    suppressNextClick.value = false
  }
}

// cian-style single compact line ("1-комн. · 36,5 м² · 4/11 этаж") instead
// of one icon+label badge per fact — with several of these stacked in a
// catalog grid, the repeated icons read as clutter rather than as useful
// affordances (the property-type icon on the photo already establishes
// what kind of listing this is, so it isn't repeated here as text).
const specsLine = computed(() => {
  const parts: string[] = []
  if (props.property.rooms) parts.push(`${props.property.rooms}-${t('property.rooms')}`)
  parts.push(areaLabel.value)
  if (props.property.propertyType === 'apartment' && props.property.floor && props.property.totalFloors) {
    parts.push(t('property.floor_slash', { floor: props.property.floor, total: props.property.totalFloors }))
  }
  if (props.property.maxGuests) parts.push(`${props.property.maxGuests} ${t('property.max_guests_short')}`)
  return parts
})

async function onToggleFavorite() {
  if (!auth.isAuthenticated) {
    router.push({ path: localePath('/account/login'), query: { redirect: route.fullPath } })
    return
  }
  if (togglingFavorite.value) return
  togglingFavorite.value = true
  try {
    favorited.value = await toggleFavorite(props.property.id)
  } catch {
    // leave the optimistic state untouched — a transient failure here isn't worth a toast
  } finally {
    togglingFavorite.value = false
  }
}
</script>

<template>
  <NuxtLinkLocale
    :to="`/properties/${propertySlug(property)}`"
    class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_24px_rgba(0,0,0,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,.06),0_12px_32px_rgba(0,0,0,.09)] dark:bg-slate-900"
    @click="onCardClick"
  >
    <div
      ref="imageWrapper"
      class="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800"
      @mousemove="hasGallery && scrubToPointer($event.clientX)"
      @mouseleave="resetActiveImage"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <img
        :src="displayedImage"
        :alt="property.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <template v-if="hasGallery">
        <button
          type="button"
          class="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
          :aria-label="t('property.gallery_prev')"
          @click="showPrevImage"
        >
          <AppIcon name="chevron-left" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
          :aria-label="t('property.gallery_next')"
          @click="showNextImage"
        >
          <AppIcon name="chevron-right" class="h-4 w-4" />
        </button>
        <span class="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {{ activeIndex + 1 }}/{{ property.images.length }}
        </span>
        <div v-if="dotCount" class="absolute bottom-2 left-2 flex gap-1">
          <span
            v-for="i in dotCount"
            :key="i"
            class="h-1.5 w-1.5 rounded-full transition-colors"
            :class="i - 1 === activeIndex ? 'bg-white' : 'bg-white/50'"
          />
        </div>
      </template>
      <div class="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
        <Badge variant="secondary" class="gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-white/95">
          <AppIcon :name="property.propertyType" class="h-3.5 w-3.5 text-brand-600" /> {{ propertyTypeLabel(property.propertyType, t) }}
        </Badge>
        <Badge
          v-if="property.mountainView"
          variant="secondary"
          class="gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-medium text-brand-700 shadow hover:bg-white/95"
        >
          <AppIcon name="mountain-view" class="h-3.5 w-3.5" /> {{ t('property.mountain_view') }}
        </Badge>
      </div>
      <button
        type="button"
        class="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white disabled:opacity-60"
        :disabled="togglingFavorite"
        :aria-label="favorited ? t('property.unfavorite') : t('property.favorite')"
        @click.prevent.stop="onToggleFavorite"
      >
        <AppIcon name="favorite" class="h-4.5 w-4.5" :class="favorited ? 'text-red-500 [&>svg]:fill-current' : 'text-slate-400'" />
      </button>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex flex-wrap items-baseline gap-2">
        <span class="text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-50">{{ formattedPrice }} TJS</span>
        <span v-if="property.rentPeriod" class="text-[13px] text-slate-500 dark:text-slate-400">/{{ t(`property.rent_${property.rentPeriod}`) }}</span>
      </div>
      <p v-if="formattedPriceUsd" class="-mt-1.5 text-[13px] text-slate-400 dark:text-slate-500">≈ ${{ formattedPriceUsd }}</p>

      <h3 class="line-clamp-2 text-[15px] font-medium leading-snug text-slate-800 dark:text-slate-200">{{ property.title }}</h3>

      <p class="border-y border-slate-100 py-2.5 text-[13px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
        <template v-for="(part, index) in specsLine" :key="index">
          <span v-if="index > 0" class="px-1.5 text-slate-300 dark:text-slate-600">·</span>{{ part }}
        </template>
      </p>

      <!-- Location/published/views grouped tightly as one "meta" cluster,
           distinct from the sections around it, instead of every line
           carrying the same gap as if they were unrelated facts. -->
      <div class="flex flex-col gap-1">
        <p class="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
          <AppIcon name="location-pin" class="h-3.5 w-3.5 shrink-0" /> <span class="min-w-0 truncate">{{ territoryName(territory?.slug, t) }}, {{ property.address }}</span>
        </p>
        <div v-if="publishedLabel || property.viewsCount > 0" class="flex items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
          <p v-if="publishedLabel" class="flex items-center gap-1.5">
            <AppIcon name="calendar" class="h-3.5 w-3.5 shrink-0" /> {{ publishedLabel }}
          </p>
          <p v-if="property.viewsCount > 0" class="flex items-center gap-1.5">
            <AppIcon name="eye" class="h-3.5 w-3.5 shrink-0" /> {{ t('property.views_count', { count: property.viewsCount }) }}
          </p>
        </div>
      </div>

      <div v-if="property.hasWifi || property.hasGenerator || property.hasParking || property.waterSource || property.altitude" class="mt-auto flex flex-wrap gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
        <span v-if="property.hasGenerator" class="inline-flex items-center gap-1"><AppIcon name="generator" class="h-3.5 w-3.5" /> {{ t('property.generator') }}</span>
        <span v-if="property.hasWifi" class="inline-flex items-center gap-1"><AppIcon name="wifi" class="h-3.5 w-3.5" /> Wi-Fi</span>
        <span v-if="property.hasParking" class="inline-flex items-center gap-1"><AppIcon name="parking" class="h-3.5 w-3.5" /> {{ t('property.parking') }}</span>
        <span v-if="property.waterSource" class="inline-flex items-center gap-1"><AppIcon name="water-source" class="h-3.5 w-3.5" /> {{ t(`property.water_${property.waterSource}`) }}</span>
        <span v-if="property.altitude">{{ property.altitude }} {{ t('property.meters_above_sea') }}</span>
      </div>
    </div>
  </NuxtLinkLocale>
</template>
