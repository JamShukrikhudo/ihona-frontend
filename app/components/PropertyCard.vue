<script setup lang="ts">
import { findTerritoryBySlug, propertyTypeLabel } from '~/data/territories'
import type { Property } from '~/types/property'

const props = defineProps<{ property: Property }>()
const { t } = useI18n()

const territory = computed(() => findTerritoryBySlug(props.property.territorySlug))

const formattedPrice = computed(() => {
  const price = new Intl.NumberFormat('ru-RU').format(props.property.price)
  return props.property.rentPeriod
    ? `${price} TJS / ${t(`property.rent_${props.property.rentPeriod}`)}`
    : `${price} TJS`
})
</script>

<template>
  <NuxtLink
    :to="`/properties/${property.id}`"
    class="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-lg sm:flex-row dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-64">
      <img
        :src="property.images[0]"
        :alt="property.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <span
        v-if="property.mountainView"
        class="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-brand-700 shadow"
      >
        🏔️ {{ t('property.mountain_view') }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-1.5 py-1">
      <p class="text-xl font-bold text-slate-900 dark:text-slate-50">{{ formattedPrice }}</p>
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {{ propertyTypeLabel(property.propertyType) }}, {{ property.area }} м²{{ property.rooms ? `, ${property.rooms} ${t('property.rooms')}` : '' }}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">{{ territory?.nameRu }}, {{ property.address }}</p>

      <!-- No metro/transit chip here — Dushanbe and Tajikistan's other -->
      <!-- territories have no metro; cian.ru's proximity-to-station line -->
      <!-- has no local equivalent, so it's simply omitted. -->

      <p class="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{{ property.description }}</p>

      <div class="mt-auto flex flex-wrap gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <span v-if="property.hasGenerator">⚡ {{ t('property.generator') }}</span>
        <span v-if="property.hasWifi">📶 Wi-Fi</span>
        <span v-if="property.hasParking">🚗 {{ t('property.parking') }}</span>
        <span v-if="property.waterSource">💧 {{ t(`property.water_${property.waterSource}`) }}</span>
        <span v-if="property.maxGuests">👥 {{ property.maxGuests }}</span>
        <span v-if="property.altitude">{{ property.altitude }} {{ t('property.meters_above_sea') }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
