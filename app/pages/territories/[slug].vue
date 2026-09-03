<script setup lang="ts">
import { territoryName } from '~/data/territories'

const route = useRoute()
const { t } = useI18n()

const territory = useTerritoryBySlug(route.params.slug as string)

if (!territory.value) {
  throw createError({ statusCode: 404, statusMessage: 'Territory not found' })
}

const { properties, usingLiveData } = await useProperties({ territorySlug: territory.value.slug })

const name = territoryName(territory.value.slug, t)
const metaDescription = t('territory.meta_description', { name })
useHead({ title: name })
useSeoMeta({
  description: metaDescription,
  ogTitle: name,
  ogDescription: metaDescription,
})
</script>

<template>
  <div v-if="territory" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
      {{ t('territory.listings_in', { name: territoryName(territory.slug, t) }) }}
    </h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {{ t('properties.found', { count: properties.length }) }}
      <span v-if="!usingLiveData" class="ml-2 text-xs text-slate-400">{{ t('home.sample_data_note') }}</span>
    </p>

    <div class="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <PropertyList :properties="properties" />
      </div>
      <div>
        <PropertyMap
          :points="properties.map((p) => ({ lat: p.lat, lng: p.lng, label: p.title }))"
          :center-lat="territory.lat"
          :center-lng="territory.lng"
          :zoom="11"
          height="360px"
        />
      </div>
    </div>
  </div>
</template>
