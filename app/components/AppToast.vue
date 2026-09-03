<script setup lang="ts">
const toast = useToastStore()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="toast.message"
        role="status"
        aria-live="polite"
        class="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        <p class="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {{ toast.message }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>
