<template>
  <div class="shop-page">
    <SiteHeader />

    <main id="shop-main">
      <section class="shop-hero">
        <div class="shop-container shop-hero-grid">
          <div class="shop-hero-copy">
            <span class="shop-eyebrow">{{ i18n.t('The Peaffee Collection', 'Peaffee 产品系列') }}</span>
            <h1>{{ i18n.t('Daily care, ready to come home.', '让日常护理自然回到生活。') }}</h1>
            <p>{{ i18n.t('Botanical formulas with comfortable textures, purposeful actives, and a rhythm you can return to every day.', '舒适质地、有效成分与可以长期坚持的护肤节奏，组成 Peaffee 的日常护理。') }}</p>
            <a href="#collection" class="shop-button shop-button-dark">{{ i18n.t('Shop all products', '查看全部产品') }}</a>
          </div>
          <div class="shop-hero-visual">
            <div class="shop-hero-orbit"></div>
            <img src="https://pub-43406c238a96463d95e2178d10ae1446.r2.dev/assets/hero.webp" alt="Peaffee Active Serum" width="680" height="680">
          </div>
        </div>
      </section>

      <section class="shop-collection" id="collection">
        <div class="shop-container">
          <div class="shop-section-heading">
            <div>
              <span class="shop-eyebrow">{{ i18n.t('Find your everyday formulas', '找到你的日常护理') }}</span>
              <h2>{{ i18n.t('The rituals you return to.', '值得反复使用的护理仪式。') }}</h2>
            </div>
            <div class="shop-filters">
              <button v-for="f in filters" :key="f.key" type="button"
                      :class="['filter-button', { active: filter === f.key }]"
                      @click="filter = f.key">{{ f.label }}</button>
            </div>
          </div>

          <div v-if="!products.length" class="shop-empty-results">
            {{ i18n.t('Loading products…', '加载中…') }}
          </div>
          <div v-else class="shop-grid">
            <article v-for="p in visibleProducts" :key="p.slug" class="product-card">
              <div class="product-card-image">
                <button type="button" @click="openProduct(p)" :aria-label="titleOf(p)">
                  <img :src="p.image_url" :alt="titleOf(p)" loading="lazy" decoding="async" width="520" height="580">
                </button>
                <span class="product-tag">{{ tagOf(p) }}</span>
              </div>
              <div class="product-card-info">
                <span class="product-card-category">{{ categoryOf(p) }}</span>
                <div class="product-card-title-row">
                  <button class="product-card-title" type="button" @click="openProduct(p)">{{ titleOf(p) }}</button>
                  <span class="product-card-price">{{ money(p.price_cents) }}</span>
                </div>
                <p class="product-card-description">{{ gridDesc(p) }}</p>
                <div class="product-card-actions">
                  <button class="shop-button shop-button-dark" type="button" @click="addToBag(p)">
                    {{ i18n.t('Add to bag', '加入购物袋') }}
                  </button>
                  <button class="product-detail-link" type="button" @click="openProduct(p)">
                    {{ i18n.t('Details', '查看详情') }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />

    <!-- Product detail modal -->
    <div v-if="activeProduct" class="shop-modal open" role="dialog" aria-modal="true" @click.self="closeProduct">
      <div class="shop-modal-card product-modal-card">
        <button class="icon-button modal-close" type="button" aria-label="Close product details" @click="closeProduct">×</button>
        <div class="product-modal-body">
          <img class="product-modal-image" :src="activeProduct.image_url" :alt="titleOf(activeProduct)" width="540" height="600">
          <div class="product-modal-info">
            <span class="shop-eyebrow">{{ categoryOf(activeProduct) }}</span>
            <h2>{{ titleOf(activeProduct) }}</h2>
            <div class="product-modal-price">{{ money(activeProduct.price_cents) }}</div>
            <p class="product-modal-desc">{{ descOf(activeProduct) }}</p>
            <div class="product-facts">
              <div class="product-fact"><strong>{{ i18n.t('Key ingredients', '核心成分') }}</strong><span>{{ activeOf(activeProduct) }}</span></div>
              <div class="product-fact"><strong>{{ i18n.t('Best for', '适合肤质') }}</strong><span>{{ skinOf(activeProduct) }}</span></div>
              <div class="product-fact"><strong>{{ i18n.t('How to use', '使用方法') }}</strong><span>{{ usageOf(activeProduct) }}</span></div>
            </div>
            <button class="shop-button shop-button-dark shop-button-full" type="button" @click="addAndClose(activeProduct)">
              {{ i18n.t('Add to bag', '加入购物袋') }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from '../components/site/SiteHeader.vue';
import SiteFooter from '../components/site/SiteFooter.vue';
import { useCartStore } from '../stores/cart';
import { useI18n } from '../stores/i18n';
import { useUiStore } from '../stores/ui';
import api from '../api/client';

const i18n = useI18n();
const cart = useCartStore();
const ui = useUiStore();

const products = ref([]);
const filter = ref('all');
const route = useRoute();
watch(
  () => route.query.category,
  (v) => {
    filter.value = ['all', 'face', 'body', 'protection'].includes(v) ? v : 'all';
  },
  { immediate: true }
);
const activeProduct = ref(null);

const filters = computed(() => [
  { key: 'all', label: i18n.t('All products', '全部产品') },
  { key: 'face', label: i18n.t('Face care', '面部护理') },
  { key: 'body', label: i18n.t('Body care', '身体护理') },
  { key: 'protection', label: i18n.t('Daily protection', '日间防护') },
]);

const visibleProducts = computed(() =>
  filter.value === 'all' ? products.value : products.value.filter((p) => p.category === filter.value)
);

const bySlug = computed(() => new Map(products.value.map((p) => [p.slug, p])));
function productBySlug(slug) { return bySlug.value.get(slug); }

// Bilingual product text: prefer the active language, fall back to the other so a
// missing translation never renders blank.
const bi = (en, cn) => (i18n.lang === 'cn' ? (cn || en) : (en || cn));
const titleOf = (p) => (p ? bi(p.title_en, p.title_cn) : '');
const categoryOf = (p) => (p ? bi(p.category_en, p.category_cn) : '');
const tagOf = (p) => (p ? bi(p.tag_en, p.tag_cn) : '');
const descOf = (p) => (p ? bi(p.desc_en, p.desc_cn) : '');
const gridDesc = (p) => (i18n.lang === 'cn' ? (p.grid_desc_cn || p.desc_cn || p.grid_desc_en || p.desc_en) : (p.grid_desc_en || p.desc_en || p.grid_desc_cn || p.desc_cn));
const activeOf = (p) => (p ? bi(p.active_en, p.active_cn) : '');
const skinOf = (p) => (p ? bi(p.skin_en, p.skin_cn) : '');
const usageOf = (p) => (p ? bi(p.usage_en, p.usage_cn) : '');
const money = (cents) => `$${(cents / 100).toFixed(2)} USD`;

function openProduct(p) { activeProduct.value = p; }
function closeProduct() { activeProduct.value = null; }
function addToBag(p) {
  cart.add(p.slug);
  ui.showToast(i18n.t('Added to bag', '已加入购物袋'));
}
function addAndClose(p) {
  cart.add(p.slug);
  ui.showToast(i18n.t('Added to bag', '已加入购物袋'));
  closeProduct();
}

onMounted(async () => {
  try {
    const data = await api.get('/products');
    products.value = data.products || [];
  } catch (e) {
    products.value = [];
  }
});
</script>
