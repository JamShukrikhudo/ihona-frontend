<script setup lang="ts">
import { territories } from '~/data/territories'
import { mockProperties } from '~/data/mockProperties'

const { t } = useI18n()

const { properties: featured } = await useProperties()
const featuredTop = computed(() => featured.slice(0, 6))

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
          <SearchBar />
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <NuxtLink
            v-for="territory in territories"
            :key="territory.slug"
            :to="`/territories/${territory.slug}`"
            class="rounded-full border border-white/30 px-3 py-1 text-sm text-white/90 hover:bg-white/10"
          >
            {{ territory.nameRu }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('home.listings_title') }}</h2>
        <NuxtLink to="/properties" class="text-sm font-medium text-accent-600 hover:underline">{{ t('home.see_all') }}</NuxtLink>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="property in featuredTop"
          :key="property.id"
          :to="`/properties/${property.id}`"
          class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="aspect-[4/3] overflow-hidden bg-slate-100">
            <img :src="property.images[0]" :alt="property.title" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
          </div>
          <div class="flex flex-1 flex-col gap-1 p-4">
            <p class="text-lg font-bold text-slate-900 dark:text-slate-50">
              {{ new Intl.NumberFormat('ru-RU').format(property.price) }} TJS<span v-if="property.rentPeriod">/{{ t(`property.rent_${property.rentPeriod}`) }}</span>
            </p>
            <h3 class="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ property.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ property.address }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('home.map_title') }}</h2>
      <PropertyMap
        :points="mockProperties.map((p) => ({ lat: p.lat, lng: p.lng, label: p.title, color: p.rentPeriod ? '#2a80de' : '#16a35c' }))"
        :center-lat="38.5598"
        :center-lng="68.787"
        :zoom="6"
        height="420px"
      />
    </section>
  </div>
</template>
