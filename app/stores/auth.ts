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
      const res = await apiFetch<{ plainTextToken: string; user: User }>('/v1/auth/token', {
        method: 'POST',
        body: { email, password },
      })
      this.setSession(res.plainTextToken, res.user)
    },

    // Both /v1/auth/token and /v1/auth/register return the same
    // {plainTextToken, user} shape — one place to apply it and persist the
    // token, instead of each call site duplicating the localStorage write.
    setSession(token: string, user: User) {
      this.token = token
      this.user = user
      if (import.meta.client) {
        localStorage.setItem('ihona_token', token)
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
