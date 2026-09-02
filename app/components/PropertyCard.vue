<script setup lang="ts">
import { findTerritoryBySlug, propertyTypeLabel } from '~/data/territories'
import type { Property } from '~/types/property'

const props = withDefaults(defineProps<{ property: Property; initialFavorited?: boolean }>(), {
  initialFavorited: false,
})
const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const territory = computed(() => findTerritoryBySlug(props.property.territorySlug))
const favorited = ref(props.initialFavorited)
const togglingFavorite = ref(false)

const formattedPrice = computed(() => new Intl.NumberFormat('ru-RU').format(props.property.price))

// Land has no separate building — area_sqft *is* the plot, so a sotka
// (100 m², the unit Tajik land listings actually use) is a real, direct
// conversion. House/cottage area_sqft is the building only; we have no
// plot-size column for those, so no sotka figure is shown for them
// rather than making one up.
const isLandType = computed(() => props.property.propertyType === 'land')
const areaLabel = computed(() =>
  isLandType.value
    ? `${(props.property.area / 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ${t('property.sotka')}`
    : `${props.property.area} м²`,
)

const publishedLabel = computed(() => formatPublishedAgo(props.property.publishedAt, t))

async function onToggleFavorite() {
  if (!auth.isAuthenticated) {
    router.push({ path: '/account/login', query: { redirect: route.fullPath } })
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
  <NuxtLink
    :to="`/properties/${property.id}`"
    class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_24px_rgba(0,0,0,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,.06),0_12px_32px_rgba(0,0,0,.09)] dark:bg-slate-900"
  >
    <div class="relative aspect-[32/19] overflow-hidden bg-slate-100">
      <img
        :src="property.images[0]"
        :alt="property.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow">
          <AppIcon :name="property.propertyType" class="h-3.5 w-3.5 text-brand-600" /> {{ propertyTypeLabel(property.propertyType) }}
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

    <div class="flex flex-1 flex-col gap-2.5 p-4">
      <div class="flex flex-wrap items-baseline gap-2">
        <span class="text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-50">{{ formattedPrice }} TJS</span>
        <span v-if="property.rentPeriod" class="text-[13px] text-slate-500 dark:text-slate-400">/{{ t(`property.rent_${property.rentPeriod}`) }}</span>
      </div>

      <h3 class="line-clamp-2 text-[15px] font-medium leading-snug text-slate-800 dark:text-slate-200">{{ property.title }}</h3>

      <div class="flex flex-wrap gap-3 border-y border-slate-100 py-2.5 text-[13px] text-slate-600 dark:border-slate-800 dark:text-slate-300">
        <span v-if="property.rooms" class="inline-flex items-center gap-1.5">
          <AppIcon name="bedroom" class="h-3.5 w-3.5 text-slate-400" /> {{ property.rooms }} {{ t('property.rooms') }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <AppIcon name="area" class="h-3.5 w-3.5 text-slate-400" /> {{ areaLabel }}
        </span>
        <span v-if="property.maxGuests" class="inline-flex items-center gap-1.5">
          <AppIcon name="max-guests" class="h-3.5 w-3.5 text-slate-400" /> {{ property.maxGuests }}
        </span>
      </div>

      <p class="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
        <AppIcon name="location-pin" class="h-3.5 w-3.5 shrink-0" /> <span class="min-w-0 truncate">{{ territory?.nameRu }}, {{ property.address }}</span>
      </p>

      <p v-if="publishedLabel" class="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <AppIcon name="calendar" class="h-3.5 w-3.5 shrink-0" /> {{ publishedLabel }}
      </p>

      <div v-if="property.hasWifi || property.hasGenerator || property.hasParking || property.waterSource || property.altitude" class="mt-auto flex flex-wrap gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
        <span v-if="property.hasGenerator" class="inline-flex items-center gap-1"><AppIcon name="generator" class="h-3.5 w-3.5" /> {{ t('property.generator') }}</span>
        <span v-if="property.hasWifi" class="inline-flex items-center gap-1"><AppIcon name="wifi" class="h-3.5 w-3.5" /> Wi-Fi</span>
        <span v-if="property.hasParking" class="inline-flex items-center gap-1"><AppIcon name="parking" class="h-3.5 w-3.5" /> {{ t('property.parking') }}</span>
        <span v-if="property.waterSource" class="inline-flex items-center gap-1"><AppIcon name="water-source" class="h-3.5 w-3.5" /> {{ t(`property.water_${property.waterSource}`) }}</span>
        <span v-if="property.altitude">{{ property.altitude }} {{ t('property.meters_above_sea') }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
