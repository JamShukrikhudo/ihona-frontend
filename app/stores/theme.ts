import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: false,
  }),

  actions: {
    restore() {
      if (!import.meta.client) return
      const saved = localStorage.getItem('ihona_theme')
      this.dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
      this.apply()
    },

    toggle() {
      this.dark = !this.dark
      if (import.meta.client) {
        localStorage.setItem('ihona_theme', this.dark ? 'dark' : 'light')
      }
      this.apply()
    },

    apply() {
      if (!import.meta.client) return
      document.documentElement.classList.toggle('dark', this.dark)
    },
  },
})
