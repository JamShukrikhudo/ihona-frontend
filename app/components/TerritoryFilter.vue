<script setup lang="ts">
import { territories, territoryName } from '~/data/territories'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'

// RadioGroupItem can't carry an actual empty-string value (reka-ui treats
// it as "no value"), so "all territories" is modeled as a sentinel here
// and mapped back to '' for the parent's filters object.
const ALL = '__all__'
const modelValue = defineModel<string>({ default: '' })
const radioValue = computed({
  get: () => modelValue.value || ALL,
  set: (v: string) => (modelValue.value = v === ALL ? '' : v),
})
const { t } = useI18n()
</script>

<template>
  <RadioGroup v-model="radioValue" class="flex flex-col gap-1.5">
    <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <RadioGroupItem :value="ALL" /> {{ t('search.all_territories') }}
    </label>
    <label v-for="territory in territories" :key="territory.slug" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <RadioGroupItem :value="territory.slug" /> {{ territoryName(territory.slug, t) }}
    </label>
  </RadioGroup>
</template>
