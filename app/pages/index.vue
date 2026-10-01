<script setup lang="ts">
import { territories, territoryName, cityPropertyTypes, tourismPropertyTypes } from '~/data/territories'
import type { DealTypeValue } from '~/data/territories'

const { t } = useI18n()

// Emphasis on rent first (long-term city housing — the stated #1 priority),
// buy second, tourism a distinct, smaller section further down — not a
// third tab here at all.
const dealType = ref<DealTypeValue>('rent')

// Not filtered by the buy/rent toggle above: several city types in the
// current catalog only carry listings under one deal type (land/house/
// cottage are sale-only, no rentals exist yet), so gating this fetch by
// `dealType` was hiding whole property types from the homepage. The
// toggle still drives the search bar and the shortcut/see-all links below.
const { properties: allFeatured } = await useProperties({})
const cityFeatured = computed(() =>
  allFeatured.filter((p) => cityPropertyTypes.some((t) => t.value === p.propertyType)).slice(0, 8),
)

// Derived from the same allFeatured fetch above (no separate request) —
// covers every tourism type (guesthouse/hostel/hunting-lodge) automatically
// rather than needing a manual useProperties() call added per type.
const tourismFeatured = computed(() =>
  allFeatured.filter((p) => tourismPropertyTypes.some((t) => t.value === p.propertyType)).slice(0, 3),
)

// Off by default: loads the Yandex Maps script and renders a map, neither
// of which the landing page needs before someone's actually asked for it —
// same "don't pay for it until requested" toggle as the /rent, /buy and
// /properties catalogs already use.
const showHomeMap = ref(false)

// Sale and rent pins sit side by side here (unlike /rent or /buy, where
// every pin is already the same deal type) — "6 500 TJS" alone would be
// ambiguous, so a rental price gets its "/мес"-or-"/ночь" suffix.
function pinPrice(p: { price: number; dealType: DealTypeValue; rentPeriod?: 'night' | 'month' }): string {
  const amount = new Intl.NumberFormat('ru-RU', { notation: p.price >= 1_000_000 ? 'compact' : 'standard' }).format(p.price)
  const suffix = p.dealType === 'rent' ? t(p.rentPeriod === 'night' ? 'property.pin_suffix_night' : 'property.pin_suffix_month') : ''
  return `${amount} TJS${suffix}`
}

useHead({
  title: t('home.title'),
  // Belt-and-suspenders with the <img fetchpriority="high"> below: a
  // preload hint works even in browsers that don't honor fetchpriority.
  // Scoped to this page only (not nuxt.config's global head) — every
  // other page would otherwise preload a hero image it never renders.
  link: [{ rel: 'preload', as: 'image', href: '/images/hero-dushanbe-b654d33f-1243.webp', fetchpriority: 'high' }],
})
useSeoMeta({
  description: t('home.hero_subtitle'),
  ogTitle: t('home.title'),
  ogDescription: t('home.hero_subtitle'),
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden py-16 text-white sm:py-24">
      <!-- A real <img>, not a CSS background-image: this is the page's
           LCP element (first meaningful paint), and a background-image
           is invisible to the browser's preload scanner until it parses
           the CSS — a plain <img fetchpriority="high"> gets discovered
           and fetched immediately instead. srcset lets a phone pull the
           640w file instead of the full 1243w one. -->
      <img
        src="/images/hero-dushanbe-b654d33f-1243.webp"
        srcset="/images/hero-dushanbe-b654d33f-640.webp 640w, /images/hero-dushanbe-b654d33f-1024.webp 1024w, /images/hero-dushanbe-b654d33f-1243.webp 1243w"
        sizes="100vw"
        alt=""
        fetchpriority="high"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <!-- Dushanbe's own sunset-over-the-park photo, not a flat
           brand-color fill — a neutral dark scrim (not a green tint,
           which would fight the photo's warm gold tones and wash out the
           flag) just for text contrast, darkest at the bottom where the
           h1/search content sits. -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/50 to-brand-900/85" />
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            :to="{ path: dealType === 'sale' ? '/buy' : '/rent', query: { type: type.value } }"
            class="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-white/25"
          >
            <AppIcon :name="type.value" class="h-4 w-4" />{{ t(`property_type.${type.value}`) }}
          </NuxtLinkLocale>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <NuxtLinkLocale
            v-for="territory in territories"
            :key="territory.slug"
            :to="`/territories/${territory.slug}`"
            class="rounded-full border border-white/30 px-3 py-1 text-sm text-white/90 hover:bg-white/10"
          >
            {{ territoryName(territory.slug, t) }}
          </NuxtLinkLocale>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('home.listings_title') }}</h2>
        <NuxtLinkLocale :to="dealType === 'sale' ? '/buy' : '/rent'" class="text-sm font-medium text-accent-600 hover:underline">
          {{ t('home.see_all') }}
        </NuxtLinkLocale>
      </div>

      <div v-if="cityFeatured.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            :to="{ path: '/rent', query: { type: 'guesthouse' } }"
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
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('home.map_title') }}</h2>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="showHomeMap = !showHomeMap"
        >
          {{ showHomeMap ? t('properties.hide_map') : t('properties.show_map') }}
        </button>
      </div>
      <PropertyMap
        v-if="showHomeMap"
        :points="allFeatured.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.title, color: p.dealType === 'rent' ? '#2a80de' : '#37956E', price: pinPrice(p), image: p.images[0], subtitle: p.address }))"
        :center-lat="38.5598"
        :center-lng="68.787"
        :zoom="6"
        height="420px"
      />
    </section>
  </div>
</template>
