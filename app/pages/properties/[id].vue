<script setup lang="ts">
import { findTerritoryBySlug, propertyTypeLabel, territoryName } from '~/data/territories'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const localePath = useLocalePath()

const property = await usePropertyById(Number(route.params.id))

if (!property.value) {
  throw createError({ statusCode: 404, statusMessage: 'Property not found' })
}

const territory = computed(() => findTerritoryBySlug(property.value!.territorySlug))
const activeImage = ref(0)
const similar = property.value ? await useSimilarProperties(property.value) : []

function nextImage() {
  if (!property.value) return
  activeImage.value = (activeImage.value + 1) % property.value.images.length
}
function prevImage() {
  if (!property.value) return
  activeImage.value = (activeImage.value - 1 + property.value.images.length) % property.value.images.length
}

const formattedPrice = computed(() => {
  if (!property.value) return ''
  const price = new Intl.NumberFormat('ru-RU').format(property.value.price)
  return property.value.rentPeriod
    ? `${price} TJS / ${t(`property.rent_${property.value.rentPeriod}`)}`
    : `${price} TJS`
})

// Price/m² reads oddly for a nightly rate (guesthouse/hostel), so it's
// shown only for sale and monthly-rent listings, and only when area is known.
const pricePerSqm = computed(() => {
  if (!property.value || !property.value.area || property.value.rentPeriod === 'night') return null
  return new Intl.NumberFormat('ru-RU').format(Math.round(property.value.price / property.value.area))
})

const dealTypeLabel = computed(() => (property.value?.dealType === 'rent' ? t('property.deal_rent') : t('property.deal_sale')))

const characteristics = computed(() => {
  if (!property.value) return []
  const p = property.value
  return [
    { label: t('property.deal_type_label'), value: dealTypeLabel.value },
    { label: t('filters.type'), value: propertyTypeLabel(p.propertyType, t) },
    { label: t('property.area'), value: `${p.area} м²` },
    p.rooms ? { label: t('filters.rooms'), value: String(p.rooms) } : null,
    p.bathrooms ? { label: t('property.bathrooms'), value: String(p.bathrooms) } : null,
    p.maxGuests ? { label: t('property.max_guests'), value: String(p.maxGuests) } : null,
    p.altitude ? { label: t('property.altitude'), value: `${p.altitude} ${t('property.meters_above_sea')}` } : null,
    territory.value ? { label: t('filters.territory'), value: territoryName(territory.value.slug, t) } : null,
    { label: t('property.id_label'), value: `№ ${p.id}` },
  ].filter(Boolean) as { label: string; value: string }[]
})

const amenities = computed(() => {
  if (!property.value) return []
  const p = property.value
  return [
    p.hasWifi && { icon: 'wifi', label: 'Wi-Fi' },
    p.hasGenerator && { icon: 'generator', label: t('property.generator') },
    p.hasParking && { icon: 'parking', label: t('property.parking') },
    p.mountainView && { icon: 'mountain-view', label: t('property.mountain_view') },
    p.waterSource && { icon: 'water-source', label: t(`property.water_${p.waterSource}`) },
  ].filter(Boolean) as { icon: string; label: string }[]
})

const favorited = ref(false)
const togglingFavorite = ref(false)

async function onToggleFavorite() {
  if (!auth.isAuthenticated) {
    router.push({ path: localePath('/account/login'), query: { redirect: route.fullPath } })
    return
  }
  if (togglingFavorite.value || !property.value) return
  togglingFavorite.value = true
  try {
    favorited.value = await toggleFavorite(property.value.id)
  } catch {
    // transient failure — not worth interrupting the page for
  } finally {
    togglingFavorite.value = false
  }
}

const showViewingForm = ref(false)
const viewingDate = ref('')
const viewingTime = ref('12:00')
const viewingState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const viewingError = ref('')

function openViewingForm() {
  if (!auth.isAuthenticated) {
    router.push({ path: localePath('/account/login'), query: { redirect: route.fullPath } })
    return
  }
  showViewingForm.value = true
}

async function submitViewingRequest() {
  if (!property.value || !viewingDate.value) return
  viewingState.value = 'submitting'
  viewingError.value = ''
  try {
    await requestViewing(
      property.value.id,
      `${viewingDate.value}T${viewingTime.value}:00`,
      `Просмотр: ${property.value.title}`,
    )
    viewingState.value = 'success'
  } catch {
    viewingState.value = 'error'
    viewingError.value = t('property.viewing_error')
  }
}

useHead({ title: property.value?.title })
useSeoMeta({
  description: property.value?.description,
  ogTitle: property.value?.title,
  ogImage: property.value?.images[0],
})

// JSON-LD (schema.org/RealEstateListing) via a plain useHead script tag —
// no dedicated schema module wired up yet, this covers the one page that
// needs it for now.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.value?.title,
        description: property.value?.description,
        url: `https://ihona.tj/properties/${property.value?.id}`,
        image: property.value?.images,
        address: {
          '@type': 'PostalAddress',
          streetAddress: property.value?.address,
          addressLocality: territoryName(territory.value?.slug, t),
          addressCountry: 'TJ',
        },
        offers: {
          '@type': 'Offer',
          price: property.value?.price,
          priceCurrency: 'TJS',
        },
      }),
    },
  ],
})
</script>

<template>
  <div v-if="property" class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <nav class="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
      <NuxtLinkLocale to="/" class="hover:text-brand-700 dark:hover:text-brand-400">{{ t('property.breadcrumb_home') }}</NuxtLinkLocale>
      <span>/</span>
      <NuxtLinkLocale
        v-if="territory"
        :to="`/territories/${territory.slug}`"
        class="hover:text-brand-700 dark:hover:text-brand-400"
      >
        {{ territoryName(territory.slug, t) }}
      </NuxtLinkLocale>
      <span v-if="territory">/</span>
      <span class="truncate text-slate-400 dark:text-slate-500">{{ propertyTypeLabel(property.propertyType, t) }}</span>
    </nav>

    <!-- Gallery: main photo with counter + prev/next controls, thumbnail -->
    <!-- strip below. No lightbox/floorplan/3D-tour tabs — those need real -->
    <!-- data (virtual_tour_url etc.) this listing set doesn't have. -->
    <div class="group relative overflow-hidden rounded-2xl bg-slate-100">
      <img :src="property.images[activeImage]" :alt="property.title" class="h-80 w-full object-cover sm:h-[460px]" />
      <template v-if="property.images.length > 1">
        <button
          type="button"
          :aria-label="t('property.gallery_prev')"
          class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
          @click="prevImage"
        >
          ‹
        </button>
        <button
          type="button"
          :aria-label="t('property.gallery_next')"
          class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-slate-700 opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
          @click="nextImage"
        >
          ›
        </button>
        <span class="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {{ t('property.gallery_counter', { current: activeImage + 1, total: property.images.length }) }}
        </span>
      </template>
    </div>
    <div v-if="property.images.length > 1" class="mt-2 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(img, i) in property.images"
        :key="img"
        type="button"
        class="h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2"
        :class="i === activeImage ? 'border-brand-600' : 'border-transparent'"
        @click="activeImage = i"
      >
        <img :src="img" class="h-full w-full object-cover" :alt="`${property.title} ${i + 1}`" />
      </button>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="property.dealType === 'rent'
              ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
              : 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'"
          >
            {{ dealTypeLabel }}
          </span>
          <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {{ propertyTypeLabel(property.propertyType, t) }}
          </span>
        </div>

        <h1 class="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {{ propertyTypeLabel(property.propertyType, t) }}<span v-if="property.rooms">, {{ property.rooms }} {{ t('property.rooms') }}</span>, {{ property.area }} м²
        </h1>
        <p class="mt-1 flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <AppIcon name="location-pin" class="h-4 w-4" aria-hidden="true" /> {{ territoryName(territory?.slug, t) }}, {{ property.address }}
        </p>
        <p v-if="property.viewsCount > 0" class="mt-1 flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500">
          <AppIcon name="eye" class="h-4 w-4" aria-hidden="true" /> {{ t('property.views_count', { count: property.viewsCount }) }}
        </p>

        <!-- Price shown here too (not only in the sidebar) so it reads on -->
        <!-- mobile, where the sidebar renders below the fold. -->
        <div class="mt-4 flex items-baseline gap-3 lg:hidden">
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ formattedPrice }}</p>
          <p v-if="pricePerSqm" class="text-sm text-slate-400">{{ pricePerSqm }} TJS {{ t('property.price_per_sqm') }}</p>
        </div>

        <h2 class="mb-3 mt-8 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('property.characteristics_title') }}</h2>
        <dl class="grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
          <div v-for="item in characteristics" :key="item.label" class="flex items-baseline justify-between gap-4 border-b border-dashed border-slate-100 pb-2 sm:border-none sm:pb-0 dark:border-slate-800">
            <dt class="text-slate-400">{{ item.label }}</dt>
            <dd class="font-medium text-slate-800 dark:text-slate-200">{{ item.value }}</dd>
          </div>
        </dl>

        <template v-if="property.description">
          <h2 class="mb-3 mt-8 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('property.description_title') }}</h2>
          <p class="leading-relaxed text-slate-700 dark:text-slate-300">{{ property.description }}</p>
        </template>

        <template v-if="amenities.length">
          <h2 class="mb-3 mt-8 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('property.amenities_title') }}</h2>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="amenity in amenities"
              :key="amenity.label"
              class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              <AppIcon :name="amenity.icon" class="h-4 w-4" /> {{ amenity.label }}
            </span>
          </div>
        </template>

        <div class="mt-8">
          <h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('property.location') }}</h2>
          <PropertyMap :points="[{ lat: property.lat, lng: property.lng, label: property.title }]" :zoom="14" height="280px" />
        </div>
      </div>

      <aside class="h-fit space-y-4 lg:sticky lg:top-20">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ formattedPrice }}</p>
              <p v-if="pricePerSqm" class="mt-0.5 text-sm text-slate-400">{{ pricePerSqm }} TJS {{ t('property.price_per_sqm') }}</p>
            </div>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
              :disabled="togglingFavorite"
              :aria-label="favorited ? t('property.unfavorite') : t('property.favorite')"
              @click="onToggleFavorite"
            >
              <AppIcon name="favorite" class="h-5 w-5" :class="favorited ? 'text-red-500 [&>svg]:fill-current' : 'text-slate-400'" />
            </button>
          </div>

          <template v-if="viewingState === 'success'">
            <p class="mt-4 flex items-center gap-1.5 rounded-lg bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <AppIcon name="verified" class="h-4 w-4" /> {{ t('property.viewing_success') }}
            </p>
          </template>

          <template v-else-if="showViewingForm">
            <form class="mt-4 flex flex-col gap-3" @submit.prevent="submitViewingRequest">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('property.viewing_date') }}</label>
                <input
                  v-model="viewingDate"
                  type="date"
                  required
                  :min="new Date().toISOString().split('T')[0]"
                  class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('property.viewing_time') }}</label>
                <input
                  v-model="viewingTime"
                  type="time"
                  required
                  class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <p v-if="viewingState === 'error'" class="text-sm text-red-600">{{ viewingError }}</p>
              <button
                type="submit"
                :disabled="viewingState === 'submitting'"
                class="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
              >
                {{ viewingState === 'submitting' ? t('property.viewing_submitting') : t('property.viewing_submit') }}
              </button>
            </form>
          </template>

          <template v-else>
            <button
              class="mt-4 w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700"
              @click="openViewingForm"
            >
              {{ t('property.contact_agent') }}
            </button>
            <p class="mt-3 text-center text-xs text-slate-400">{{ t('property.contact_note') }}</p>
          </template>
        </div>

        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          <p class="font-semibold">⚠️ {{ t('property.safety_title') }}</p>
          <p class="mt-1 leading-relaxed">{{ t('property.safety_note') }}</p>
        </div>
      </aside>
    </div>

    <section v-if="similar.length" class="mt-12">
      <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('property.similar') }}</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PropertyCard v-for="p in similar" :key="p.id" :property="p" />
      </div>
    </section>
  </div>
</template>
