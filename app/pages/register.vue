<script setup lang="ts">
// NOTE: identity-core-api only defines POST/DELETE /v1/auth/token (login,
// logout) so far — no registration endpoint exists yet. UI-complete, submit
// is a placeholder until that endpoint is designed on the host.
const { t } = useI18n()

const name = ref('')
const email = ref('')
const password = ref('')
const submitted = ref(false)

function submit() {
  submitted.value = true
}

useHead({ title: t('auth.register_title') })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('auth.register_title') }}</h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('auth.register_subtitle') }}</p>

    <form v-if="!submitted" class="mt-8 flex flex-col gap-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.name') }}</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.email') }}</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('auth.password') }}</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <button
        type="submit"
        class="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {{ t('auth.submit_register') }}
      </button>
    </form>

    <p v-else class="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
      {{ t('auth.register_pending') }}
    </p>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('auth.have_account') }}
      <NuxtLink to="/login" class="font-medium text-accent-700 hover:underline dark:text-accent-400">{{ t('auth.login_link') }}</NuxtLink>
    </p>
  </div>
</template>
