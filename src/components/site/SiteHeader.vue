<template>
  <header class="shop-header">
    <div class="shop-container shop-header-inner">
      <router-link class="shop-brand" to="/" aria-label="Peaffee home">
        <img src="https://pub-43406c238a96463d95e2178d10ae1446.r2.dev/assets/peaffee-logo.svg" alt="PEAFFEE" width="148" height="36">
      </router-link>
      <nav class="shop-nav" aria-label="Site navigation">
        <router-link to="/" class="nav-link">{{ i18n.t('Home', '首页') }}</router-link>
        <router-link to="/shop" class="nav-link">{{ i18n.t('Shop', '产品系列') }}</router-link>
        <router-link to="/account" class="nav-link">{{ i18n.t('Account', '账户') }}</router-link>
        <router-link v-if="auth.user?.role === 'admin'" to="/admin" class="nav-link">Admin</router-link>
      </nav>
      <div class="shop-header-actions">
        <button class="shop-lang-button" type="button" @click="toggleLang">
          {{ i18n.lang === 'en' ? '中文' : 'EN' }}
        </button>
        <router-link to="/cart" class="bag-button" aria-label="Open shopping bag">
          <span>{{ i18n.t('Bag', '购物袋') }}</span>
          <span class="bag-count">{{ cart.count }}</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import { useI18n } from '../../stores/i18n';

const i18n = useI18n();
const cart = useCartStore();
const auth = useAuthStore();

function toggleLang() {
  i18n.setLang(i18n.lang === 'en' ? 'cn' : 'en');
}
</script>
