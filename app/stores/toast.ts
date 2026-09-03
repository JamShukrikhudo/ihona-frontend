import { defineStore } from 'pinia'

// State lives here (not component-local) so a toast triggered right before
// a client-side navigation — login/register redirecting to the page they
// came from — survives the route change instead of the message and its
// timer being destroyed with the component that scheduled it.
export const useToastStore = defineStore('toast', {
  state: () => ({
    message: null as string | null,
    timer: null as ReturnType<typeof setTimeout> | null,
  }),

  actions: {
    show(message: string, duration = 2500) {
      if (this.timer) clearTimeout(this.timer)
      this.message = message
      if (import.meta.client) {
        this.timer = setTimeout(() => {
          this.message = null
        }, duration)
      }
    },
  },
})
