<script setup lang="ts">
// Discrete room-count chips, cian.ru-style: 1 / 2 / 3 / 4 / 5+, multi-select.
const modelValue = defineModel<number[]>({ default: () => [] })

const options = [1, 2, 3, 4, 5]

function toggle(n: number) {
  modelValue.value = modelValue.value.includes(n)
    ? modelValue.value.filter((v) => v !== n)
    : [...modelValue.value, n]
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="n in options"
      :key="n"
      type="button"
      class="flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition"
      :class="modelValue.includes(n)
        ? 'border-brand-600 bg-brand-600 text-white'
        : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-300'"
      @click="toggle(n)"
    >
      {{ n === 5 ? '5+' : n }}
    </button>
  </div>
</template>
