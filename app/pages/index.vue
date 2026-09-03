<script setup lang="ts">
import { territories, cityPropertyTypes } from '~/data/territories'
import { mockProperties } from '~/data/mockProperties'
import type { DealTypeValue } from '~/data/territories'

const { t } = useI18n()

// Emphasis on rent first (long-term city housing — the stated #1 priority),
// buy second, tourism a distinct, smaller section further down — not a
// third tab here at all.
const dealType = ref<DealTypeValue>('rent')

const { properties: allFeatured } = await useProperties({ dealType: dealType.value })
const cityFeatured = computed(() =>
  allFeatured.filter((p) => cityPropertyTypes.some((t) => t.value === p.propertyType)).slice(0, 6),
)

const { properties: tourismStays } = await useProperties({ dealType: 'rent', propertyType: 'guesthouse' })
const { properties: tourismHostels } = await useProperties({ dealType: 'rent', propertyType: 'hostel' })
const tourismFeatured = computed(() => [...tourismStays, ...tourismHostels].slice(0, 3))

useHead({ title: t('home.title') })
useSeoMeta({
  description: t('home.hero_subtitle'),
  ogTitle: t('home.title'),
  ogDescription: t('home.hero_subtitle'),
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 py-16 text-white sm:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="max-w-2xl text-3xl font-bold sm:text-5xl">{{ t('home.hero_title') }}</h1>
        <p class="mt-4 max-w-xl text-brand-100">{{ t('home.hero_subtitle') }}</p>

        <div class="mt-8">
          <DealTypeTabs v-model="dealType" />
        </div>
        <div class="mt-3">
          <SearchBar :deal-type="dealType" />
        </div>

        <!-- City property-type shortcuts — the primary business (buy/rent -->
        <!-- flats, houses, land, cottages, commercial), always visible -->
        <!-- above the territory chips so it reads as the main path, not -->
        <!-- tourism. -->
        <div class="mt-6 flex flex-wrap gap-2">
          <NuxtLinkLocale
            v-for="type in cityPropertyTypes"
            :key="type.value"
            :to="{ path: '/properties', query: { deal: dealType, type: type.value } }"
            class="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-white/25"
          >
            <AppIcon :name="type.value" class="h-4 w-4" />{{ type.label }}
          </NuxtLinkLocale>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <NuxtLinkLocale
            v-for="territory in territories"
            :key="territory.slug"
            :to="`/territories/${territory.slug}`"
            class="rounded-full border border-white/30 px-3 py-1 text-sm text-white/90 hover:bg-white/10"
          >
            {{ territory.nameRu }}
          </NuxtLinkLocale>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('home.listings_title') }}</h2>
        <NuxtLinkLocale :to="{ path: '/properties', query: { deal: dealType } }" class="text-sm font-medium text-accent-600 hover:underline">
          {{ t('home.see_all') }}
        </NuxtLinkLocale>
      </div>

      <div v-if="cityFeatured.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PropertyCard v-for="property in cityFeatured" :key="property.id" :property="property" />
      </div>
      <p v-else class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {{ t('home.no_results') }}
      </p>
    </section>

    <!-- Tourism: a distinct, visually smaller section — not mixed into the -->
    <!-- primary Купить/Снять flow above. Second-priority business per -->
    <!-- product direction. -->
    <section v-if="tourismFeatured.length" class="border-t border-slate-200 bg-slate-100/60 py-10 dark:border-slate-800 dark:bg-slate-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="inline-flex items-center gap-1.5 text-lg font-bold text-slate-900 dark:text-slate-100">
              <AppIcon name="mountain-view" class="h-4.5 w-4.5" /> {{ t('home.tourism_title') }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('home.tourism_subtitle') }}</p>
          </div>
          <NuxtLinkLocale
            :to="{ path: '/properties', query: { deal: 'rent', type: 'guesthouse' } }"
            class="text-sm font-medium text-accent-600 hover:underline"
          >
            {{ t('home.see_all') }}
          </NuxtLinkLocale>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PropertyCard v-for="property in tourismFeatured" :key="property.id" :property="property" />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('home.map_title') }}</h2>
      <PropertyMap
        :points="mockProperties.map((p) => ({ lat: p.lat, lng: p.lng, label: p.title, color: p.dealType === 'rent' ? '#2a80de' : '#37956E' }))"
        :center-lat="38.5598"
        :center-lng="68.787"
        :zoom="6"
        height="420px"
      />
    </section>
  </div>
</template>
