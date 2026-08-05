import { defineStore } from 'pinia';
import api from '../api/client';

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null }),
  actions: {
    setAuth(token, user) {
      if (token) localStorage.setItem('peaffee-token', token);
      this.user = user;
    },
    async login(identifier, password) {
      const data = await api.post('/auth/login', { identifier, password });
      this.setAuth(data.token, data.user);
      return data.user;
    },
    async googleLogin(credential) {
      const data = await api.post('/auth/google', { credential });
      this.setAuth(data.token, data.user);
      return data.user;
    },
    async register(payload) {
      const data = await api.post('/auth/register', payload);
      this.setAuth(data.token, data.user);
      return data.user;
    },
    async refresh() {
      try {
        const data = await api.get('/auth/me');
        this.user = data.user;
      } catch {
        this.user = null;
      }
    },
    async logout() {
      try { await api.post('/auth/logout'); } catch { /* stateless */ }
      localStorage.removeItem('peaffee-token');
      this.user = null;
    },
  },
});
