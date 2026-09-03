import { defineStore } from 'pinia'

// Cookie (not localStorage): localStorage is client-only, so the server
// always rendered light on first paint and only flipped to dark after
// hydration ran ThemeToggle's onMounted restore() — a visible flash on
// every load for anyone who'd chosen dark. A cookie is readable during SSR,
// so the very first response already carries the right class.
function themeCookie() {
  return useCookie<'dark' | 'light' | null>('ihona_theme', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}

export const useThemeStore = defineStore('theme', {
  state: () => {
    const cookie = themeCookie()
    const dark = cookie.value
      ? cookie.value === 'dark'
      // No cookie yet (first-ever visit): fall back to the OS preference.
      // Only resolvable client-side, so SSR still renders light this one
      // time — the client sets the cookie below, so it's correct on every
      // request after.
      : import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches

    return { dark }
  },

  actions: {
    toggle() {
      this.dark = !this.dark
      this.persist()
    },

    // Writes a first-ever visitor's resolved OS-preference into the
    // cookie so subsequent SSR requests render the right theme too.
    restore() {
      if (import.meta.client && themeCookie().value === null) {
        this.persist()
      }
    },

    persist() {
      themeCookie().value = this.dark ? 'dark' : 'light'
    },
  },
})
