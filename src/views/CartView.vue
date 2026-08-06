<template>
  <div class="shop-page">
    <SiteHeader />

    <main>
      <div class="shop-container" style="max-width:860px;margin:56px auto 90px;padding:0 20px">
        <span class="shop-eyebrow">{{ i18n.t('Your bag', '你的购物袋') }}</span>
        <h1 style="font-family:var(--font-serif);font-size:clamp(40px,5vw,64px);font-weight:400;margin:10px 0 28px;line-height:.98">
          {{ i18n.t('A considered collection.', '把适合你的护理带回家。') }}
        </h1>

        <div v-if="!cart.entries.length" class="shop-empty-results" style="padding:70px 30px">
          <p style="margin-bottom:20px;font-size:15px">{{ i18n.t('Your bag is waiting for a ritual.', '购物袋还在等待一套护理仪式。') }}</p>
          <router-link to="/shop" class="shop-button shop-button-dark">{{ i18n.t('Explore products', '探索产品') }}</router-link>
        </div>

        <div v-else>
          <div v-for="e in cart.entries" :key="e.slug" class="cart-item">
            <img :src="productBySlug(e.slug)?.image_url" :alt="titleOf(productBySlug(e.slug))" width="90" height="90">
            <div class="cart-item-info">
              <div class="cart-item-title">{{ titleOf(productBySlug(e.slug)) }}</div>
              <div class="cart-item-price">{{ money((productBySlug(e.slug)?.price_cents || 0) * e.quantity) }}</div>
              <div class="bag-quantity">
                <button type="button" @click="decreaseItem(e)">−</button>
                <span>{{ e.quantity }}</span>
                <button type="button" @click="cart.setQuantity(e.slug, e.quantity + 1)">+</button>
              </div>
            </div>
            <button class="cart-remove" type="button" @click="removeItem(e)">
              {{ i18n.t('Remove', '移除') }}
            </button>
          </div>

          <div class="cart-footer">
            <div class="bag-total-row"><span>{{ i18n.t('Subtotal', '小计') }}</span><strong>{{ money(subtotal) }}</strong></div>
            <p class="bag-note">{{ i18n.t('Shipping and taxes are confirmed before your order is placed.', '配送与税费会在下单前确认。') }}</p>
            <router-link to="/checkout" class="shop-button shop-button-dark shop-button-full">{{ i18n.t('Checkout', '去结算') }}</router-link>
          </div>
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
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
const bySlug = computed(() => new Map(products.value.map((p) => [p.slug, p])));
function productBySlug(slug) { return bySlug.value.get(slug); }
const titleOf = (p) => (p ? (i18n.lang === 'cn' ? (p.title_cn || p.title_en) : (p.title_en || p.title_cn)) : '');
const money = (cents) => `$${(cents / 100).toFixed(2)} USD`;
const subtotal = computed(() =>
  cart.entries.reduce((sum, e) => sum + (productBySlug(e.slug)?.price_cents || 0) * e.quantity, 0)
);

function removeItem(entry) {
  cart.setQuantity(entry.slug, 0);
  ui.showToast(i18n.t('Removed from bag', '已从购物袋移除'));
}
function decreaseItem(entry) {
  const next = entry.quantity - 1;
  cart.setQuantity(entry.slug, next);
  if (next <= 0) {
    ui.showToast(i18n.t('Removed from bag', '已从购物袋移除'));
  }
}

onMounted(async () => {
  try {
    const data = await api.get('/products');
    products.value = data.products || [];
  } catch {
    products.value = [];
  }
});
</script>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid var(--shop-line);
}
.cart-item img {
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-title { font-family: var(--font-serif); font-size: 22px; }
.cart-item-price { color: var(--shop-ink); font-size: 13px; font-weight: 600; margin: 4px 0 8px; }
.cart-remove {
  border: 0;
  background: transparent;
  color: var(--shop-muted);
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.cart-remove:hover { color: var(--shop-green); }
.cart-footer { margin-top: 26px; max-width: 380px; }
</style>
