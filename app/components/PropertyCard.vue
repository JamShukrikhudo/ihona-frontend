<script setup lang="ts">
import { findTerritoryBySlug, propertyTypeLabel, territoryName } from '~/data/territories'
import type { Property } from '~/types/property'

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

// Land has no separate building — area_sqft *is* the plot, so a sotka
// (100 m², the unit Tajik land listings actually use) is a real, direct
// conversion. House/cottage area_sqft is the building only; we have no
// plot-size column for those, so no sotka figure is shown for them
// rather than making one up.
const isLandType = computed(() => props.property.propertyType === 'land')
const areaLabel = computed(() =>
  isLandType.value
    ? `${(props.property.area / 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ${t('property.sotka')}`
    : `${props.property.area.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} м²`,
)

const publishedLabel = computed(() => formatPublishedAgo(props.property.publishedAt, t))

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
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
      <img
        :src="property.images[0]"
        :alt="property.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow">
          <AppIcon :name="property.propertyType" class="h-3.5 w-3.5 text-brand-600" /> {{ propertyTypeLabel(property.propertyType, t) }}
        </span>
        <span
          v-if="property.mountainView"
          class="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-medium text-brand-700 shadow"
        >
          <AppIcon name="mountain-view" class="h-3.5 w-3.5" /> {{ t('property.mountain_view') }}
        </span>
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
