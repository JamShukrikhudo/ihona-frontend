<script setup lang="ts">
import { findTerritoryBySlug, propertyTypeLabel } from '~/data/territories'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

const property = await usePropertyById(Number(route.params.id))

if (!property.value) {
  throw createError({ statusCode: 404, statusMessage: 'Property not found' })
}

const territory = computed(() => findTerritoryBySlug(property.value!.territorySlug))
const activeImage = ref(0)
const similar = property.value ? useSimilarProperties(property.value) : []

const formattedPrice = computed(() => {
  if (!property.value) return ''
  const price = new Intl.NumberFormat('ru-RU').format(property.value.price)
  return property.value.rentPeriod
    ? `${price} TJS / ${t(`property.rent_${property.value.rentPeriod}`)}`
    : `${price} TJS`
})

const amenities = computed(() => {
  if (!property.value) return []
  const p = property.value
  return [
    p.hasWifi && { icon: '📶', label: 'Wi-Fi' },
    p.hasGenerator && { icon: '⚡', label: t('property.generator') },
    p.hasParking && { icon: '🚗', label: t('property.parking') },
    p.mountainView && { icon: '🏔️', label: t('property.mountain_view') },
    p.waterSource && { icon: '💧', label: t(`property.water_${p.waterSource}`) },
  ].filter(Boolean) as { icon: string; label: string }[]
})

const showViewingForm = ref(false)
const viewingDate = ref('')
const viewingTime = ref('12:00')
const viewingState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const viewingError = ref('')

function openViewingForm() {
  if (!auth.isAuthenticated) {
    router.push({ path: '/account/login', query: { redirect: route.fullPath } })
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
          addressLocality: territory.value?.nameRu,
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
  <div v-if="property" class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <NuxtLink to="/properties" class="mb-4 inline-flex items-center gap-1 text-sm text-accent-700 hover:underline dark:text-accent-400">
      ← {{ t('property.back_to_listings') }}
    </NuxtLink>

    <!-- Simplified gallery: main photo + thumbnail strip, no lightbox — -->
    <!-- matches aura.tj's plainer property page rather than cian's dense -->
    <!-- multi-tab gallery/floorplan/3D-tour layout. -->
    <div class="overflow-hidden rounded-2xl bg-slate-100">
      <img :src="property.images[activeImage]" :alt="property.title" class="h-80 w-full object-cover sm:h-[420px]" />
    </div>
    <div v-if="property.images.length > 1" class="mt-2 flex gap-2">
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
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {{ propertyTypeLabel(property.propertyType) }}<span v-if="property.rooms">, {{ property.rooms }} {{ t('property.rooms') }}</span>, {{ property.area }} м²
        </h1>
        <p class="mt-1 text-slate-500 dark:text-slate-400">{{ territory?.nameRu }}, {{ property.address }}</p>

        <div class="mt-6 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <div><span class="text-slate-400">{{ t('property.area') }}: </span>{{ property.area }} м²</div>
          <div v-if="property.rooms"><span class="text-slate-400">{{ t('property.rooms') }}: </span>{{ property.rooms }}</div>
          <div v-if="property.maxGuests"><span class="text-slate-400">{{ t('property.max_guests') }}: </span>{{ property.maxGuests }}</div>
          <div v-if="property.altitude"><span class="text-slate-400">{{ t('property.altitude') }}: </span>{{ property.altitude }} м</div>
        </div>

        <p class="mt-6 leading-relaxed text-slate-700 dark:text-slate-300">{{ property.description }}</p>

        <div v-if="amenities.length" class="mt-6 flex flex-wrap gap-3">
          <span
            v-for="amenity in amenities"
            :key="amenity.label"
            class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
          >
            {{ amenity.icon }} {{ amenity.label }}
          </span>
        </div>

        <div class="mt-8">
          <h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('property.location') }}</h2>
          <PropertyMap :points="[{ lat: property.lat, lng: property.lng, label: property.title }]" :zoom="14" height="280px" />
        </div>
      </div>

      <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ formattedPrice }}</p>

        <template v-if="viewingState === 'success'">
          <p class="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            ✓ {{ t('property.viewing_success') }}
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
