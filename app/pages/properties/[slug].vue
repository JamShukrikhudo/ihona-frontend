<script setup lang="ts">
import { findTerritoryBySlug, propertyTypeLabel, territoryName, isTourismType } from '~/data/territories'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const localePath = useLocalePath()

const propertyId = extractPropertyId(String(route.params.slug))
if (propertyId === null) {
  throw createError({ statusCode: 404, statusMessage: 'Property not found' })
}

const property = await usePropertyById(propertyId)

if (!property.value) {
  throw createError({ statusCode: 404, statusMessage: 'Property not found' })
}

// The URL's slug text is decorative — only the trailing id above was ever
// trusted. If it doesn't match the current canonical slug (a stale link
// from before a title edit, or a bare /properties/{id} link from before
// this feature existed), 301 to the correct one so search engines and
// visitors converge on a single URL per listing instead of the site's own
// useLocaleHead() (app.vue) self-canonicalizing whatever slug happened to
// be in the address bar.
const canonicalSlug = propertySlug(property.value)
if (route.params.slug !== canonicalSlug) {
  await navigateTo(localePath(`/properties/${canonicalSlug}`), { redirectCode: 301 })
}

const territory = computed(() => findTerritoryBySlug(property.value!.territorySlug))
const activeImage = ref(0)
const lightboxOpen = ref(false)
const similar = property.value ? await useSimilarProperties(property.value) : []

function scrollToMap() {
  document.getElementById('location-map')?.scrollIntoView({ behavior: 'smooth' })
}

function nextImage() {
  if (!property.value) return
  activeImage.value = (activeImage.value + 1) % property.value.images.length
}
function prevImage() {
  if (!property.value) return
  activeImage.value = (activeImage.value - 1 + property.value.images.length) % property.value.images.length
}

// The hero photo is a single tile (no side-thumbnail grid — see the
// template's own comment), so it needs to be swipeable itself on touch
// devices, matching the lightbox's own arrow-key navigation.
const mainPhotoTouchStartX = ref<number | null>(null)
const mainPhotoTouchDeltaX = ref(0)
const mainPhotoSwiped = ref(false)

function onMainPhotoTouchStart(e: TouchEvent) {
  mainPhotoTouchStartX.value = e.touches[0]!.clientX
  mainPhotoTouchDeltaX.value = 0
}

function onMainPhotoTouchMove(e: TouchEvent) {
  if (mainPhotoTouchStartX.value === null) return
  mainPhotoTouchDeltaX.value = e.touches[0]!.clientX - mainPhotoTouchStartX.value
}

function onMainPhotoTouchEnd() {
  if (Math.abs(mainPhotoTouchDeltaX.value) > 40) {
    mainPhotoSwiped.value = true
    if (mainPhotoTouchDeltaX.value < 0) nextImage()
    else prevImage()
  }
  mainPhotoTouchStartX.value = null
  mainPhotoTouchDeltaX.value = 0
}

// A swipe shouldn't also open the lightbox as if it were a tap — only a
// plain tap (no preceding swipe) does that, and it opens on whichever
// photo the swipe just landed on.
function onMainPhotoClick() {
  if (mainPhotoSwiped.value) {
    mainPhotoSwiped.value = false
    return
  }
  openLightbox(activeImage.value)
}

function openLightbox(index: number) {
  activeImage.value = index
  lightboxOpen.value = true
}

function onLightboxKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') lightboxOpen.value = false
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

const lightboxEl = ref<HTMLElement | null>(null)
watch(lightboxOpen, (open) => {
  if (open) nextTick(() => lightboxEl.value?.focus())
})

const publishedLabel = computed(() => formatPublishedAgo(property.value?.publishedAt ?? null, t))

const shareCopied = ref(false)
async function onShare() {
  if (!property.value) return
  const shareData = { title: property.value.title, url: `https://ihona.tj/properties/${canonicalSlug}` }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch {
      // user cancelled the native share sheet — not an error
    }
    return
  }
  await navigator.clipboard.writeText(shareData.url)
  shareCopied.value = true
  setTimeout(() => (shareCopied.value = false), 2000)
}

const formattedPrice = computed(() => {
  if (!property.value) return ''
  const price = new Intl.NumberFormat('ru-RU').format(property.value.price)
  return property.value.rentPeriod
    ? `${price} TJS / ${t(`property.rent_${property.value.rentPeriod}`)}`
    : `${price} TJS`
})

const formattedPriceUsd = computed(() =>
  property.value?.priceUsd != null ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(property.value.priceUsd) : null,
)

// Price/m² only means something for a purchase (or a mortgage against one)
// — a rental rate divided by area isn't a figure anyone shops by, whether
// it's billed nightly (guesthouse/hostel) or monthly.
const pricePerSqm = computed(() => {
  if (!property.value || !property.value.area || property.value.dealType !== 'sale') return null
  return new Intl.NumberFormat('ru-RU').format(Math.round(property.value.price / property.value.area))
})

const dealTypeLabel = computed(() => (property.value?.dealType === 'rent' ? t('property.deal_rent') : t('property.deal_sale')))

// Primary "at a glance" facts — icon-card row shown right under the
// gallery, cian/avito-style. Living/kitchen area still has no column on
// the host (see docs/handoffs); ceiling height is apartment-only and
// mock-data-only for now (no column either, see useProperties.ts's
// mapApiProperty). Floor is real; area respects the authoritative
// area_unit field (sqm/sotka/hectare) instead of assuming м².
const vitals = computed(() => {
  if (!property.value) return []
  const p = property.value
  const isApartment = p.propertyType === 'apartment'
  const areaUnitLabel = p.areaUnit === 'sqm' ? 'м²' : t(`property.${p.areaUnit}`)
  return [
    { icon: 'area', label: t('property.area'), value: `${p.area.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ${areaUnitLabel}` },
    p.rooms ? { icon: 'bedroom', label: t('filters.rooms'), value: String(p.rooms) } : null,
    isApartment && p.bathrooms ? { icon: 'bathroom', label: t('property.bathrooms'), value: String(p.bathrooms) } : null,
    isApartment && p.floor ? { icon: 'floor', label: t('property.floor'), value: t('property.floor_of_total', { floor: p.floor, total: p.totalFloors ?? '—' }) } : null,
    isApartment && p.ceilingHeight ? { icon: 'ceiling-height', label: t('property.ceiling_height'), value: `${p.ceilingHeight} м` } : null,
    p.maxGuests ? { icon: 'max-guests', label: t('property.max_guests'), value: String(p.maxGuests) } : null,
    p.altitude ? { icon: 'altitude', label: t('property.altitude'), value: `${p.altitude} ${t('property.meters_above_sea')}` } : null,
    p.yearBuilt ? { icon: 'calendar', label: t('property.year_built'), value: String(p.yearBuilt) } : null,
  ].filter(Boolean) as { icon: string; label: string; value: string }[]
})

// Remaining metadata that doesn't fit the icon-card row above. Land-only
// fields (category/tenure/cadastral number/road/terrain/utilities) only
// render when propertyType === 'land' — every other type has them null.
const characteristics = computed(() => {
  if (!property.value) return []
  const p = property.value
  const isLand = p.propertyType === 'land'
  return [
    { label: t('property.deal_type_label'), value: dealTypeLabel.value },
    { label: t('filters.type'), value: propertyTypeLabel(p.propertyType, t) },
    territory.value ? { label: t('filters.territory'), value: territoryName(territory.value.slug, t) } : null,
    { label: t('property.id_label'), value: p.reference },
    isLand && p.landCategory ? { label: t('property.land_category_label'), value: t(`property.land_category_${p.landCategory}`) } : null,
    isLand && p.tenureType ? { label: t('property.tenure_type_label'), value: t(`property.tenure_${p.tenureType}`) } : null,
    isLand && p.cadastralNumber ? { label: t('property.cadastral_number'), value: p.cadastralNumber } : null,
    isLand && p.roadAccess
      ? {
          label: t('property.road_access_label'),
          value: p.roadSeasonal
            ? `${t(`property.road_access_${p.roadAccess}`)} (${t('property.road_seasonal')})`
            : t(`property.road_access_${p.roadAccess}`),
        }
      : null,
    isLand && p.terrain ? { label: t('property.terrain_label'), value: t(`property.terrain_${p.terrain}`) } : null,
    isLand && p.electricityStatus
      ? {
          label: t('property.electricity_label'),
          value:
            p.electricityStatus === 'nearby' && p.electricityDistanceM
              ? t('property.electricity_nearby', { distance: p.electricityDistanceM })
              : t(`property.electricity_${p.electricityStatus}`),
        }
      : null,
    isLand && p.sewage ? { label: t('property.sewage_label'), value: t(`property.sewage_${p.sewage}`) } : null,
  ].filter(Boolean) as { label: string; value: string }[]
})

const amenities = computed(() => {
  if (!property.value) return []
  const p = property.value
  const isLand = p.propertyType === 'land'
  return [
    p.hasWifi && { icon: 'wifi', label: 'Wi-Fi' },
    p.hasGenerator && { icon: 'generator', label: t('property.generator') },
    p.hasParking && { icon: 'parking', label: t('property.parking') },
    p.mountainView && { icon: 'mountain-view', label: t('property.mountain_view') },
    p.waterSource && { icon: 'water-source', label: t(`property.water_${p.waterSource}`) },
    isLand && p.hasGas && { icon: 'land', label: t('property.has_gas') },
    isLand && p.fenced && { icon: 'security', label: t('property.fenced') },
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

// Tourism types (guesthouse/hostel/hunting-lodge) book a night range +
// guest count instead of requesting a single viewing-appointment slot —
// same request/host-confirms flow underneath (POST .../viewings), just a
// different form shape. See useViewings.ts.
const isBooking = computed(() => (property.value ? isTourismType(property.value.propertyType) : false))

const showViewingForm = ref(false)
const viewingDate = ref('')
const viewingTime = ref('12:00')
const checkIn = ref('')
const checkOut = ref('')
const guestsCount = ref(1)
const viewingState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const viewingError = ref('')

function openViewingForm() {
  if (!auth.isAuthenticated) {
    router.push({ path: localePath('/account/login'), query: { redirect: route.fullPath } })
    return
  }
  showViewingForm.value = true
}

const contactCardEl = ref<HTMLElement | null>(null)
function onMobileBarCta() {
  openViewingForm()
  contactCardEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function submitViewingRequest() {
  if (!property.value) return
  viewingState.value = 'submitting'
  viewingError.value = ''
  try {
    if (isBooking.value) {
      if (!checkIn.value || !checkOut.value) return
      await requestViewing(
        property.value.id,
        `${checkIn.value}T14:00:00`,
        `Бронирование: ${property.value.title}`,
        `${checkOut.value}T12:00:00`,
        guestsCount.value,
      )
    } else {
      if (!viewingDate.value) return
      await requestViewing(
        property.value.id,
        `${viewingDate.value}T${viewingTime.value}:00`,
        `Просмотр: ${property.value.title}`,
      )
    }
    viewingState.value = 'success'
  } catch {
    viewingState.value = 'error'
    viewingError.value = t('property.viewing_error')
  }
}

// Reviews — GET is anonymous and only ever returns already-approved
// comments (see useComments.ts); a submitted one is pending until an
// agent moderates it, so it never appears in this same list right after
// posting — reviewSubmitted just swaps the form for a thank-you message.
const comments = await useComments(property.value.id)
const reviewBody = ref('')
const reviewRating = ref<number | null>(null)
const reviewState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

async function submitReview() {
  if (!property.value || !reviewBody.value.trim()) return
  reviewState.value = 'submitting'
  try {
    await submitComment(property.value.id, reviewBody.value.trim(), reviewRating.value ?? undefined)
    reviewState.value = 'success'
    reviewBody.value = ''
    reviewRating.value = null
  } catch {
    reviewState.value = 'error'
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
        url: `https://ihona.tj/properties/${canonicalSlug}`,
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
  <div v-if="property" class="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">
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

    <!-- Title + address first, photos below (cian-style: name → location →
    -->
    <!-- gallery, not the other way round) — the reader confirms this is the
    -->
    <!-- right listing before spending time on photos. -->
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
    <p class="mt-1 flex flex-wrap items-center gap-1 text-slate-500 dark:text-slate-400">
      <AppIcon name="location-pin" class="h-4 w-4" aria-hidden="true" /> {{ territoryName(territory?.slug, t) }}, {{ property.address }}
      <button
        type="button"
        class="ml-1 font-medium text-brand-700 hover:underline dark:text-brand-400"
        @click="scrollToMap"
      >
        {{ t('property.on_map') }}
      </button>
    </p>
    <p v-if="property.viewsCount > 0 || publishedLabel" class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 dark:text-slate-500">
      <span v-if="publishedLabel" class="flex items-center gap-1">
        <AppIcon name="calendar" class="h-4 w-4" aria-hidden="true" /> {{ publishedLabel }}
      </span>
      <span v-if="property.viewsCount > 0" class="flex items-center gap-1">
        <AppIcon name="eye" class="h-4 w-4" aria-hidden="true" /> {{ t('property.views_count', { count: property.viewsCount }) }}
      </span>
    </p>

    <!-- Gallery: one large hero photo with a horizontal thumbnail filmstrip -->
    <!-- below it (cian-style) rather than a side grid — a side grid forces -->
    <!-- mismatched tile proportions once the photo count isn't a clean -->
    <!-- multiple of the grid (5 photos left an oddly short bottom row). -->
    <!-- Clicking the hero opens the fullscreen lightbox; clicking a -->
    <!-- thumbnail just swaps the hero's photo in place. No floorplan/3D-tour -->
    <!-- tabs — those need real data (virtual_tour_url etc.) this listing set -->
    <!-- doesn't have. -->
    <div class="mt-6 overflow-hidden rounded-2xl bg-slate-100">
      <button
        type="button"
        class="group relative block w-full"
        @touchstart.passive="onMainPhotoTouchStart"
        @touchmove.passive="onMainPhotoTouchMove"
        @touchend="onMainPhotoTouchEnd"
        @click="onMainPhotoClick"
      >
        <img
          :src="property.images[activeImage] ?? property.images[0]"
          :alt="property.title"
          class="h-80 w-full object-cover transition group-hover:brightness-95 sm:h-[500px]"
        />
        <span
          v-if="property.images.length > 1"
          class="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white"
        >
          {{ t('property.gallery_counter', { current: activeImage + 1, total: property.images.length }) }}
        </span>
      </button>
    </div>
    <div v-if="property.images.length > 1" class="mt-2 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(img, i) in property.images"
        :key="img"
        type="button"
        class="h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-28"
        :class="i === activeImage ? 'border-brand-600' : 'border-transparent hover:border-slate-300'"
        @click="activeImage = i"
      >
        <img :src="img" class="h-full w-full object-cover" :alt="`${property.title} ${i + 1}`" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        ref="lightboxEl"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 outline-none"
        tabindex="0"
        @keydown="onLightboxKeydown"
        @click.self="lightboxOpen = false"
      >
        <button
          type="button"
          :aria-label="t('property.gallery_close')"
          class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          @click="lightboxOpen = false"
        >
          ×
        </button>
        <img :src="property.images[activeImage]" :alt="property.title" class="max-h-[85vh] max-w-full rounded-lg object-contain" />
        <template v-if="property.images.length > 1">
          <button
            type="button"
            :aria-label="t('property.gallery_prev')"
            class="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:left-6"
            @click="prevImage"
          >
            ‹
          </button>
          <button
            type="button"
            :aria-label="t('property.gallery_next')"
            class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:right-6"
            @click="nextImage"
          >
            ›
          </button>
          <span class="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white">
            {{ t('property.gallery_counter', { current: activeImage + 1, total: property.images.length }) }}
          </span>
        </template>
      </div>
    </Teleport>

    <div v-if="vitals.length" class="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="stat in vitals" :key="stat.label" class="flex items-center gap-3">
        <AppIcon :name="stat.icon" class="h-8 w-8 shrink-0 text-slate-400 dark:text-slate-500" />
        <div class="min-w-0">
          <p class="truncate text-sm text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
          <p class="truncate text-lg font-bold text-slate-900 dark:text-slate-100">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <!-- Price shown here too (not only in the sidebar) so it reads on -->
        <!-- mobile, where the sidebar renders below the fold. -->
        <div class="mt-4 flex items-baseline gap-3 lg:hidden">
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ formattedPrice }}</p>
          <p v-if="formattedPriceUsd" class="text-sm text-slate-400">≈ ${{ formattedPriceUsd }}</p>
          <p v-if="pricePerSqm" class="text-sm text-slate-400">{{ pricePerSqm }} TJS {{ t('property.price_per_sqm') }}</p>
        </div>

        <dl class="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
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

        <div id="location-map" class="mt-8 scroll-mt-20">
          <h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('property.location') }}</h2>
          <PropertyMap :points="[{ lat: property.lat, lng: property.lng, label: property.title }]" :zoom="14" height="280px" />
        </div>
      </div>

      <aside class="h-fit space-y-4 lg:sticky lg:top-20">
        <div ref="contactCardEl" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ formattedPrice }}</p>
              <p v-if="formattedPriceUsd" class="mt-0.5 text-sm text-slate-400">≈ ${{ formattedPriceUsd }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <div class="relative">
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  :aria-label="t('property.share')"
                  @click="onShare"
                >
                  <AppIcon name="share" class="h-5 w-5 text-slate-400" />
                </button>
                <span
                  v-if="shareCopied"
                  class="absolute right-0 top-12 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-white shadow dark:bg-slate-700"
                >
                  {{ t('property.share_copied') }}
                </span>
              </div>
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                :disabled="togglingFavorite"
                :aria-label="favorited ? t('property.unfavorite') : t('property.favorite')"
                @click="onToggleFavorite"
              >
                <AppIcon name="favorite" class="h-5 w-5" :class="favorited ? 'text-red-500 [&>svg]:fill-current' : 'text-slate-400'" />
              </button>
            </div>
          </div>

          <!-- Cian-style labeled stat row under the price — just price/m²,
          the only per-unit figure this listing set actually has (no VAT/tax
          field on a Property, unlike cian's "Налог" row, so it isn't faked
          here). -->
          <div v-if="pricePerSqm" class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
            <span class="text-slate-400">{{ t('property.price_per_sqm') }}</span>
            <span class="font-medium text-slate-700 dark:text-slate-200">{{ pricePerSqm }} TJS</span>
          </div>

          <template v-if="viewingState === 'success'">
            <p class="mt-4 flex items-center gap-1.5 rounded-lg bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <AppIcon name="verified" class="h-4 w-4" /> {{ isBooking ? t('property.booking_success') : t('property.viewing_success') }}
            </p>
          </template>

          <template v-else-if="showViewingForm">
            <form class="mt-4 flex flex-col gap-3" @submit.prevent="submitViewingRequest">
              <template v-if="isBooking">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('property.booking_checkin') }}</label>
                    <input
                      v-model="checkIn"
                      type="date"
                      required
                      :min="new Date().toISOString().split('T')[0]"
                      class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('property.booking_checkout') }}</label>
                    <input
                      v-model="checkOut"
                      type="date"
                      required
                      :min="checkIn || new Date().toISOString().split('T')[0]"
                      class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('property.booking_guests') }}</label>
                  <input
                    v-model.number="guestsCount"
                    type="number"
                    min="1"
                    :max="property.maxGuests ?? 100"
                    required
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </template>
              <template v-else>
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
              </template>
              <p v-if="viewingState === 'error'" class="text-sm text-red-600">{{ viewingError }}</p>
              <button
                type="submit"
                :disabled="viewingState === 'submitting'"
                class="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
              >
                {{ viewingState === 'submitting'
                  ? t('property.viewing_submitting')
                  : (isBooking ? t('property.booking_submit') : t('property.viewing_submit')) }}
              </button>
            </form>
          </template>

          <template v-else>
            <button
              class="mt-4 w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700"
              @click="openViewingForm"
            >
              {{ isBooking ? t('property.booking_cta') : t('property.contact_agent') }}
            </button>
            <p class="mt-3 text-center text-xs text-slate-400">{{ isBooking ? t('property.booking_note') : t('property.contact_note') }}</p>
          </template>
        </div>

        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          <p class="font-semibold">⚠️ {{ t('property.safety_title') }}</p>
          <p class="mt-1 leading-relaxed">{{ t('property.safety_note') }}</p>
        </div>
      </aside>
    </div>

    <!-- Mobile-only sticky bar: the sidebar CTA above renders below the fold -->
    <!-- on small screens, so price + primary action stay reachable while -->
    <!-- scrolling, cian/avito-style. pb-20 on the page root leaves room for it. -->
    <div class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <p class="truncate text-base font-bold text-slate-900 dark:text-slate-50">{{ formattedPrice }}</p>
      <button
        type="button"
        class="shrink-0 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700"
        @click="onMobileBarCta"
      >
        {{ isBooking ? t('property.booking_cta') : t('property.contact_agent') }}
      </button>
    </div>

    <section class="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
      <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('property.reviews') }}</h2>

      <ul v-if="comments && comments.length" class="mb-6 space-y-4">
        <li
          v-for="comment in comments"
          :key="comment.id"
          class="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ comment.author ?? '—' }}</span>
            <span v-if="comment.rating" class="text-amber-500" aria-hidden="true">{{ '★'.repeat(comment.rating) }}{{ '☆'.repeat(5 - comment.rating) }}</span>
          </div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ comment.body }}</p>
        </li>
      </ul>
      <p v-else class="mb-6 text-sm text-slate-500 dark:text-slate-400">{{ t('property.reviews_empty') }}</p>

      <div v-if="!auth.isAuthenticated" class="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
        <NuxtLinkLocale :to="{ path: '/account/login', query: { redirect: route.fullPath } }" class="font-medium text-accent-600 hover:underline">
          {{ t('property.review_login_required') }}
        </NuxtLinkLocale>
      </div>
      <form v-else-if="reviewState !== 'success'" class="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800" @submit.prevent="submitReview">
        <div class="flex items-center gap-1" role="radiogroup" :aria-label="t('property.review_rating')">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="text-2xl leading-none"
            :class="reviewRating && star <= reviewRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'"
            :aria-pressed="reviewRating === star"
            @click="reviewRating = reviewRating === star ? null : star"
          >
            ★
          </button>
        </div>
        <textarea
          v-model="reviewBody"
          rows="3"
          required
          :placeholder="t('property.review_placeholder')"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <p v-if="reviewState === 'error'" class="text-sm text-red-600">{{ t('property.review_error') }}</p>
        <button
          type="submit"
          :disabled="reviewState === 'submitting' || !reviewBody.trim()"
          class="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
        >
          {{ reviewState === 'submitting' ? t('property.review_submitting') : t('property.review_submit') }}
        </button>
      </form>
      <p v-else class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
        {{ t('property.review_success') }}
      </p>
    </section>

    <section v-if="similar.length" class="mt-12">
      <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('property.similar') }}</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PropertyCard v-for="p in similar" :key="p.id" :property="p" />
      </div>
    </section>
  </div>
</template>
