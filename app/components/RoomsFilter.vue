<script setup lang="ts">
// Discrete room-count chips, cian.ru-style: 1 / 2 / 3 / 4 / 5+, multi-select.
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

const modelValue = defineModel<number[]>({ default: () => [] })

const options = [1, 2, 3, 4, 5]

// ToggleGroup works with string values internally; map back to numbers.
const stringModel = computed({
  get: () => modelValue.value.map(String),
  set: (v: string[]) => (modelValue.value = v.map(Number)),
})
</script>

<template>
  <ToggleGroup v-model="stringModel" type="multiple" variant="outline" class="flex-wrap justify-start gap-1.5">
    <ToggleGroupItem
      v-for="n in options"
      :key="n"
      :value="String(n)"
      class="h-9 min-w-9 rounded-lg border-slate-200 text-sm font-medium data-[state=on]:border-brand-600 data-[state=on]:bg-brand-600 data-[state=on]:text-white dark:border-slate-700"
    >
      {{ n === 5 ? '5+' : n }}
    </ToggleGroupItem>
  </ToggleGroup>
</template>
