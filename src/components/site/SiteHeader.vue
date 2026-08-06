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
          <span class="bag-text">{{ i18n.t('Bag', '购物袋') }}</span>
          <span class="bag-count">{{ cart.count }}</span>
        </router-link>
        <button ref="toggleBtnRef" class="mobile-nav-toggle" type="button" :class="{ active: menuOpen }"
                :aria-label="i18n.t('Toggle navigation menu', '切换导航菜单')" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <span class="bar"></span><span class="bar"></span><span class="bar"></span>
        </button>
      </div>
    </div>

    <!-- Mobile full-screen navigation drawer -->
    <transition name="drawer">
      <div v-if="menuOpen" ref="drawerRef" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1" @click="closeMenu">
        <nav class="mobile-nav" aria-label="Mobile navigation">
          <router-link to="/" class="mobile-link" @click="closeMenu">{{ i18n.t('Home', '首页') }}</router-link>
          <router-link to="/shop" class="mobile-link" @click="closeMenu">{{ i18n.t('Shop', '产品系列') }}</router-link>
          <router-link to="/account" class="mobile-link" @click="closeMenu">{{ i18n.t('Account', '账户') }}</router-link>
          <router-link v-if="auth.user?.role === 'admin'" to="/admin" class="mobile-link" @click="closeMenu">Admin</router-link>

          <div class="mobile-cat-block">
            <p class="mobile-cat-title">{{ i18n.t('Shop by category', '按类目选购') }}</p>
            <div class="mobile-cat-links">
              <router-link
                v-for="c in categories"
                :key="c.key"
                :to="{ path: '/shop', query: c.key === 'all' ? {} : { category: c.key } }"
                class="mobile-cat-link"
                @click="closeMenu"
              >{{ c.label }}</router-link>
            </div>
          </div>

          <div class="mobile-auth">
            <template v-if="auth.user">
              <span class="mobile-auth-email">{{ auth.user.email }}</span>
              <button type="button" class="mobile-auth-btn" @click="logout">{{ i18n.t('Sign out', '退出登录') }}</button>
            </template>
            <router-link v-else to="/account" class="mobile-auth-btn" @click="closeMenu">{{ i18n.t('Sign in', '登录') }}</router-link>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import { useI18n, LANGUAGES } from '../../stores/i18n';

const i18n = useI18n();
const cart = useCartStore();
const auth = useAuthStore();
const router = useRouter();

const menuOpen = ref(false);
const langMenuOpen = ref(false);
const langDropdownRef = ref(null);
const toggleBtnRef = ref(null);
const drawerRef = ref(null);

const categories = computed(() => [
  { key: 'all', label: i18n.t('All products', '全部产品') },
  { key: 'face', label: i18n.t('Face care', '面部护理') },
  { key: 'body', label: i18n.t('Body care', '身体护理') },
  { key: 'protection', label: i18n.t('Daily protection', '日间防护') },
]);

function selectLang(code) {
  i18n.setLang(code);
  langMenuOpen.value = false;
}

function closeMenu() {
  menuOpen.value = false;
}

function onKeydown(e) {
  if (e.key === 'Escape' && menuOpen.value) closeMenu();
}

async function logout() {
  await auth.logout();
  closeMenu();
}

// Lock body scroll while the drawer is open, and move focus into it.
watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    nextTick(() => drawerRef.value?.focus());
  } else {
    toggleBtnRef.value?.focus();
  }
});

function handleClickOutside(event) {
  if (langDropdownRef.value && !langDropdownRef.value.contains(event.target)) {
    langMenuOpen.value = false;
  }
}

// Close the drawer if navigation happens outside a drawer link (e.g. logo tap).
const removeAfterEach = router.afterEach(() => {
  if (menuOpen.value) menuOpen.value = false;
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', onKeydown);
  removeAfterEach();
  document.body.style.overflow = '';
});
</script>

