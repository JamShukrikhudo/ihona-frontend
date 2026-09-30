<script setup lang="ts">
import { commercialSubtypes } from '~/data/commercial'
import type { CommercialStats } from '~/composables/useProperties'
import type { DealTypeValue } from '~/data/territories'

const { t } = useI18n()

const dealType = ref<DealTypeValue>('rent')

const stats = ref<CommercialStats>(Object.fromEntries(commercialSubtypes.map((s) => [s.value, { sale: 0, rent: 0 }])))
const { properties: popular } = await useProperties({ propertyType: 'commercial' })
stats.value = await useCommercialStats()

const popularCommercial = computed(() => popular.slice(0, 8))

function tileLink(subtype: string, deal: DealTypeValue) {
  return { path: '/properties', query: { type: 'commercial', commercialSubtype: subtype, deal } }
}

useHead({ title: t('commercial.title') })
useSeoMeta({
  description: t('commercial.hero_subtitle'),
  ogTitle: t('commercial.title'),
  ogDescription: t('commercial.hero_subtitle'),
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 py-16 text-white sm:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 class="max-w-2xl text-3xl font-bold sm:text-5xl">{{ t('commercial.title') }}</h1>
        <p class="mt-4 max-w-xl text-brand-100">{{ t('commercial.hero_subtitle') }}</p>

        <div class="mt-8">
          <DealTypeTabs v-model="dealType" />
        </div>

        <div class="mt-6">
          <NuxtLinkLocale
            :to="{ path: '/properties', query: { type: 'commercial', deal: dealType } }"
            class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            {{ t('commercial.see_all') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="subtype in commercialSubtypes"
          :key="subtype.value"
          class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="mb-3 flex items-center gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              <AppIcon :name="subtype.icon" class="h-5 w-5" />
            </span>
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ t(`commercial_subtype.${subtype.value}`) }}</h2>
          </div>

          <div class="flex gap-4 text-sm">
            <NuxtLinkLocale
              v-if="stats[subtype.value]?.rent"
              :to="tileLink(subtype.value, 'rent')"
              class="text-slate-600 hover:text-brand-700 hover:underline dark:text-slate-400 dark:hover:text-brand-400"
            >
              {{ t('commercial.rent_label') }} <span class="font-semibold">{{ stats[subtype.value]?.rent }}</span>
            </NuxtLinkLocale>
            <span v-else class="text-slate-300 dark:text-slate-700">{{ t('commercial.rent_label') }} 0</span>

            <NuxtLinkLocale
              v-if="stats[subtype.value]?.sale"
              :to="tileLink(subtype.value, 'sale')"
              class="text-slate-600 hover:text-brand-700 hover:underline dark:text-slate-400 dark:hover:text-brand-400"
            >
              {{ t('commercial.sale_label') }} <span class="font-semibold">{{ stats[subtype.value]?.sale }}</span>
            </NuxtLinkLocale>
            <span v-else class="text-slate-300 dark:text-slate-700">{{ t('commercial.sale_label') }} 0</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="popularCommercial.length" class="border-t border-slate-200 bg-slate-100/60 py-10 dark:border-slate-800 dark:bg-slate-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ t('commercial.popular_title') }}</h2>
          <NuxtLinkLocale :to="{ path: '/properties', query: { type: 'commercial' } }" class="text-sm font-medium text-accent-600 hover:underline">
            {{ t('commercial.see_all') }}
          </NuxtLinkLocale>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <PropertyCard v-for="property in popularCommercial" :key="property.id" :property="property" />
        </div>
      </div>
    </section>

    <p v-if="!popularCommercial.length" class="mx-auto max-w-7xl px-4 py-10 text-center text-sm text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
      {{ t('commercial.no_listings') }}
    </p>
  </div>
</template>
