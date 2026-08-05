import { defineStore } from 'pinia';

const KEY = 'peaffee-cart';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: (() => {
      try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
    })(),
  }),
  getters: {
    entries(state) {
      return Object.entries(state.items)
        .map(([slug, quantity]) => ({ slug, quantity: Number(quantity) }))
        .filter((e) => e.quantity > 0);
    },
    count(state) {
      return Object.values(state.items).reduce((sum, q) => sum + Number(q), 0);
    },
  },
  actions: {
    add(slug) {
      this.items[slug] = Number(this.items[slug] || 0) + 1;
      this.persist();
    },
    setQuantity(slug, qty) {
      if (qty <= 0) delete this.items[slug];
      else this.items[slug] = qty;
      this.persist();
    },
    clear() {
      this.items = {};
      this.persist();
    },
    persist() {
      localStorage.setItem(KEY, JSON.stringify(this.items));
    },
  },
});
