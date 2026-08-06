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
        <!-- Direct Mobile Shop Link (Visible on mobile header without opening menu) -->
        <router-link to="/shop" class="mobile-header-shop-btn">
          {{ i18n.t('Shop', '产品系列') }}
        </router-link>

        <!-- Multi-language Dropdown Selector -->
        <div class="lang-selector-dropdown" ref="langDropdownRef">
          <button class="shop-lang-button" type="button" @click.stop="langMenuOpen = !langMenuOpen" :aria-expanded="langMenuOpen">
            <span>{{ i18n.currentLangObj.label }}</span>
            <svg class="lang-arrow" :class="{ open: langMenuOpen }" width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <ul v-if="langMenuOpen" class="lang-dropdown-menu" @click.stop>
            <li v-for="item in LANGUAGES" :key="item.code">
              <button
                type="button"
                class="lang-dropdown-item"
                :class="{ active: i18n.lang === item.code }"
                @click="selectLang(item.code)"
              >
                <span class="lang-code-badge">{{ item.label }}</span>
                <span class="lang-name">{{ item.name }}</span>
              </button>
            </li>
          </ul>
        </div>

        <router-link to="/cart" class="bag-button" aria-label="Open shopping bag">
          <span>{{ i18n.t('Bag', '购物袋') }}</span>
          <span class="bag-count">{{ cart.count }}</span>
        </router-link>
        <button class="mobile-nav-toggle" type="button" :class="{ active: menuOpen }"
                aria-label="Toggle navigation menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <span class="bar"></span><span class="bar"></span><span class="bar"></span>
        </button>
      </div>
    </div>

    <!-- Mobile full-screen navigation drawer -->
    <div v-if="menuOpen" class="mobile-drawer active" @click="menuOpen = false">
      <nav class="mobile-nav" aria-label="Mobile navigation">
        <router-link to="/" class="mobile-link" @click="menuOpen = false">{{ i18n.t('Home', '首页') }}</router-link>
        <router-link to="/shop" class="mobile-link" @click="menuOpen = false">{{ i18n.t('Shop', '产品系列') }}</router-link>
        <router-link to="/account" class="mobile-link" @click="menuOpen = false">{{ i18n.t('Account', '账户') }}</router-link>
        <router-link v-if="auth.user?.role === 'admin'" to="/admin" class="mobile-link" @click="menuOpen = false">Admin</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import { useI18n, LANGUAGES } from '../../stores/i18n';

const i18n = useI18n();
const cart = useCartStore();
const auth = useAuthStore();
const menuOpen = ref(false);

const langMenuOpen = ref(false);
const langDropdownRef = ref(null);

function selectLang(code) {
  i18n.setLang(code);
  langMenuOpen.value = false;
}

function handleClickOutside(event) {
  if (langDropdownRef.value && !langDropdownRef.value.contains(event.target)) {
    langMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

