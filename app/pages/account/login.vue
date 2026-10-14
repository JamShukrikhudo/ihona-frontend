<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast(t('auth.toast_welcome_back', { name: auth.user?.name ?? email.value }))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : localePath('/')
    router.push(redirect)
  } catch {
    error.value = t('auth.error')
  } finally {
    loading.value = false
  }
}

useHead({ title: t('auth.login_title') })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('auth.login_title') }}</h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('auth.login_subtitle') }}</p>

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <Label>{{ t('auth.email') }}</Label>
        <Input v-model="email" type="email" autocomplete="email" required />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ t('auth.password') }}</Label>
        <Input v-model="password" type="password" autocomplete="current-password" required />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <Button type="submit" size="lg" :disabled="loading" class="mt-2 bg-brand-600 text-white hover:bg-brand-700">
        {{ loading ? t('auth.loading') : t('auth.submit_login') }}
      </Button>
    </form>

    <SocialLogin />

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('auth.no_account') }}
      <NuxtLinkLocale to="/account/register" class="font-medium text-accent-700 hover:underline dark:text-accent-400">{{ t('auth.register_link') }}</NuxtLinkLocale>
    </p>
  </div>
</template>
