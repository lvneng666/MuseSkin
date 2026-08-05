<template>
  <footer class="shop-footer">
    <div class="shop-container shop-footer-inner">
      <div>
        <img src="https://pub-43406c238a96463d95e2178d10ae1446.r2.dev/assets/peaffee-logo.svg" alt="PEAFFEE" width="120" height="30">
        <p class="shop-footer-tagline">{{ i18n.t('Botanical skincare for a slower, more thoughtful daily ritual.', '植物护肤，让每天的护理更从容、更有意识。') }}</p>
      </div>
      <div class="shop-footer-links">
        <router-link to="/" class="footer-link">{{ i18n.t('Home', '首页') }}</router-link>
        <router-link to="/shop" class="footer-link">{{ i18n.t('Shop', '产品系列') }}</router-link>
        <router-link to="/terms" class="footer-link">{{ i18n.t('Terms', '服务条款') }}</router-link>
        <router-link to="/privacy" class="footer-link">{{ i18n.t('Privacy', '隐私政策') }}</router-link>
        <a :href="'mailto:' + SITE.email" class="footer-link">{{ SITE.email }}</a>
        <span>{{ SITE.copyright }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from '../../stores/i18n';
import { SITE } from '../../config/site';
const i18n = useI18n();
</script>
