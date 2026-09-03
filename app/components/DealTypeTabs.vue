<script setup lang="ts">
import { dealTypes } from '~/data/territories'
import type { DealTypeValue } from '~/data/territories'

const modelValue = defineModel<DealTypeValue>({ required: true })
const { t } = useI18n()

// dealTypes only carries 'sale'/'rent' — same labels the nav already uses
// (nav.buy/nav.rent), so this reuses them rather than adding a duplicate key.
const dealTypeLabel = (value: DealTypeValue): string => t(value === 'sale' ? 'nav.buy' : 'nav.rent')
</script>

<template>
  <div class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
    <button
      v-for="deal in dealTypes"
      :key="deal.value"
      type="button"
      class="rounded-lg px-5 py-2 text-sm font-semibold transition"
      :class="modelValue === deal.value
        ? 'bg-white text-brand-700 shadow dark:bg-slate-950 dark:text-brand-400'
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
      @click="modelValue = deal.value"
    >
      {{ dealTypeLabel(deal.value) }}
    </button>
  </div>
</template>
