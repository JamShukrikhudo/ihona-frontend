import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    async login(email: string, password: string) {
      const { plainTextToken } = await apiFetch<{ plainTextToken: string }>('/v1/auth/token', {
        method: 'POST',
        body: { email, password },
      })
      this.token = plainTextToken
      if (import.meta.client) {
        localStorage.setItem('ihona_token', plainTextToken)
      }
    },

    async logout() {
      if (this.token) {
        await apiFetch('/v1/auth/token', { method: 'DELETE' }).catch(() => null)
      }
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('ihona_token')
      }
    },

    restore() {
      if (import.meta.client) {
        this.token = localStorage.getItem('ihona_token')
      }
    },
  },
})
