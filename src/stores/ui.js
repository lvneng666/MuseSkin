import { defineStore } from 'pinia';

/** Lightweight UI state — currently just a global toast message. */
export const useUiStore = defineStore('ui', {
  state: () => ({ toast: null, toastTimer: null }),
  actions: {
    showToast(message) {
      this.toast = message;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast = null;
      }, 2400);
    },
  },
});
