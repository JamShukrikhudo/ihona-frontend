<script setup lang="ts">
// POST /v1/auth/register (identity-core-api) reuses Fortify's own
// CreatesNewUsers action, so the same password policy the web registration
// form enforces applies here too: min 12 chars, upper+lower case, a number,
// a symbol (jetstream-bridge's FortifyServiceProvider).
import { toast } from 'vue-sonner'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

// Maps to a real Spatie role on the backend (identity-core-api's
// AuthTokenController::INTENT_TO_ROLE) — 'tourist' has no distinct
// permission role and resolves to 'buyer' there, but is kept as its own
// option here since it's a real, distinct persona for this market.
const SIGNUP_INTENTS = ['buyer', 'landlord', 'seller', 'tenant', 'tourist'] as const
const signupIntent = ref<(typeof SIGNUP_INTENTS)[number]>('buyer')

interface ValidationErrorBody {
  message?: string
  errors?: Record<string, string[]>
}
interface RegisterResponse {
  plainTextToken: string
  user: { id: number; name: string; email: string }
}

async function submit() {
  error.value = ''

  // Caught server-side too (password_confirmation validation), but that
  // round-trip is pure waste for a mismatch anyone can see before
  // submitting — check it here first.
  if (password.value !== passwordConfirmation.value) {
    error.value = t('auth.password_mismatch')
    return
  }

  loading.value = true
  try {
    const res = await apiFetch<RegisterResponse>('/v1/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
        signup_intent: signupIntent.value,
      },
    })
    auth.setSession(res.plainTextToken, res.user)
    toast(t('auth.toast_welcome_new', { name: res.user.name }))

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : localePath('/')
    router.push(redirect)
  } catch (err: unknown) {
    const body = (err as { data?: ValidationErrorBody })?.data
    const firstError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined
    error.value = firstError ?? body?.message ?? t('auth.error')
  } finally {
    loading.value = false
  }
}

useHead({ title: t('auth.register_title') })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ t('auth.register_title') }}</h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('auth.register_subtitle') }}</p>

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <Label>{{ t('auth.name') }}</Label>
        <Input v-model="name" type="text" autocomplete="name" required />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ t('auth.intent_label') }}</Label>
        <Select v-model="signupIntent">
          <SelectTrigger class="h-auto w-full py-2.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="intent in SIGNUP_INTENTS" :key="intent" :value="intent">{{ t(`auth.intent_${intent}`) }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ t('auth.email') }}</Label>
        <Input v-model="email" type="email" autocomplete="email" required />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ t('auth.password') }}</Label>
        <Input v-model="password" type="password" autocomplete="new-password" required minlength="12" />
        <p class="mt-1 text-xs text-slate-400">{{ t('auth.password_requirements') }}</p>
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ t('auth.password_confirmation') }}</Label>
        <Input v-model="passwordConfirmation" type="password" autocomplete="new-password" required />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <Button type="submit" size="lg" :disabled="loading" class="mt-2 bg-brand-600 text-white hover:bg-brand-700">
        {{ loading ? t('auth.loading') : t('auth.submit_register') }}
      </Button>
    </form>

    <SocialLogin />

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('auth.have_account') }}
      <NuxtLinkLocale to="/account/login" class="font-medium text-accent-700 hover:underline dark:text-accent-400">{{ t('auth.login_link') }}</NuxtLinkLocale>
    </p>
  </div>
</template>
