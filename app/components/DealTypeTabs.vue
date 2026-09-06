<script setup lang="ts">
import { dealTypes } from '~/data/territories'
import type { DealTypeValue } from '~/data/territories'

// `nav: true` renders real links to the indexable /rent and /buy pages
// instead of a local filter toggle — used on those two pages themselves so
// switching tabs is a real navigation (keeps SEO value on the destination
// page) rather than a client-side query-param change that would need to be
// noindexed like any other filter combination.
const props = withDefaults(defineProps<{ nav?: boolean }>(), { nav: false })
const modelValue = defineModel<DealTypeValue>({ required: true })
const { t } = useI18n()

// dealTypes only carries 'sale'/'rent' — same labels the nav already uses
// (nav.buy/nav.rent), so this reuses them rather than adding a duplicate key.
const dealTypeLabel = (value: DealTypeValue): string => t(value === 'sale' ? 'nav.buy' : 'nav.rent')
const dealTypePath = (value: DealTypeValue): string => (value === 'sale' ? '/buy' : '/rent')

function onClick(value: DealTypeValue) {
  if (!props.nav) modelValue.value = value
}
</script>

<template>
  <div class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
    <component
      :is="nav ? 'NuxtLinkLocale' : 'button'"
      v-for="deal in dealTypes"
      :key="deal.value"
      :type="nav ? undefined : 'button'"
      :to="nav ? dealTypePath(deal.value) : undefined"
      class="rounded-lg px-5 py-2 text-sm font-semibold transition"
      :class="modelValue === deal.value
        ? 'bg-white text-brand-700 shadow dark:bg-slate-950 dark:text-brand-400'
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
      @click="onClick(deal.value)"
    >
      {{ dealTypeLabel(deal.value) }}
    </component>
  </div>
</template>
