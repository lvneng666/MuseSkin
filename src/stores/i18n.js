import { defineStore } from 'pinia';

/** Minimal EN/中文 language store. Components pick copy via t(en, cn). */
export const useI18n = defineStore('i18n', {
  state: () => ({
    lang: localStorage.getItem('peaffee-lang') || 'en',
  }),
  actions: {
    setLang(lang) {
      this.lang = lang;
      localStorage.setItem('peaffee-lang', lang);
      document.documentElement.lang = lang === 'cn' ? 'zh-CN' : 'en';
    },
    t(en, cn) {
      return this.lang === 'cn' ? (cn ?? en) : en;
    },
  },
});
