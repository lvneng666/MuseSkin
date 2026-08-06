<template>
  <div class="shop-page">
    <SiteHeader />

    <main>
      <div class="shop-container" style="max-width:620px;margin:40px auto;padding:0 20px">
        <!-- Unconfigured-payment notice -->
        <div v-if="!paypalConfigured && !order" class="checkout-error" style="margin-bottom:16px">
          {{ i18n.t('Online payment is being set up. You can still place an order and we will confirm it by email.',
                    '在线支付正在配置中。你仍可下单，我们会通过邮件与你确认。') }}
        </div>

        <!-- Order form -->
        <div v-if="!order && !success">
          <span class="shop-eyebrow">{{ i18n.t('Order details', '订单信息') }}</span>
          <h1 style="font-family:var(--font-serif);font-size:40px;font-weight:400;margin:8px 0 20px">
            {{ i18n.t('Complete your ritual.', '完成你的护理仪式。') }}
          </h1>
          <div class="checkout-summary" id="checkout-summary">
            <div v-for="e in cart.entries" :key="e.slug" class="checkout-summary-row">
              <span>{{ titleOf(productBySlug(e.slug)) }} × {{ e.quantity }}</span>
              <strong>{{ money((productBySlug(e.slug)?.price_cents || 0) * e.quantity) }}</strong>
            </div>
            <div class="checkout-summary-total">
              <span>{{ i18n.t('Subtotal', '小计') }}</span>
              <strong>{{ money(subtotal) }}</strong>
            </div>
          </div>

          <form id="checkout-form" @submit.prevent="placeOrder">
            <div class="checkout-form-grid">
              <label><span>{{ i18n.t('Full name', '姓名') }}</span><input v-model="form.name" type="text" required></label>
              <label><span>{{ i18n.t('Email address', '电子邮箱') }}</span><input v-model="form.email" type="email" required></label>
            </div>
            <label><span>{{ i18n.t('Country or region', '国家或地区') }}</span><input v-model="form.country" type="text" required></label>
            <label><span>{{ i18n.t('Shipping address', '收货地址') }}</span><textarea v-model="form.address" rows="3" required></textarea></label>

            <div class="payment-method" style="margin-bottom:16px">
              <span class="payment-method-body">
                <strong>{{ i18n.t('PayPal / Credit card', 'PayPal / 信用卡') }}</strong>
                <small>{{ i18n.t('Pay securely by card — no PayPal account needed.', '安全在线支付，直接用银行卡，无需 PayPal 账户。') }}</small>
              </span>
            </div>

            <div v-if="error" class="checkout-error">{{ error }}</div>
            <button class="shop-button shop-button-dark shop-button-full" type="submit" :disabled="placing">
              {{ placing ? i18n.t('Placing order…', '正在提交订单…') : i18n.t('Place order', '提交订单') }}
            </button>
          </form>
        </div>

        <!-- Payment step -->
        <div v-else-if="order && !success">
          <span class="shop-eyebrow">{{ i18n.t('Payment', '支付') }}</span>
          <h1 style="font-family:var(--font-serif);font-size:34px;font-weight:400;margin:8px 0 16px">
            {{ i18n.t('Complete your payment.', '完成付款。') }}
          </h1>
          <p class="checkout-note">{{ i18n.t('Order number', '订单号') }}: <strong>{{ order.order_no }}</strong></p>
          <div class="checkout-summary">
            <div class="checkout-summary-row"><span>{{ i18n.t('Subtotal', '小计') }}</span><strong>{{ money(order.items_subtotal_cents) }}</strong></div>
            <div class="checkout-summary-row"><span>{{ i18n.t('Shipping', '运费') }}</span><strong>{{ money(order.shipping_cents) }}</strong></div>
            <div class="checkout-summary-total"><span>{{ i18n.t('Total', '合计') }}</span><strong>{{ money(order.total_cents) }}</strong></div>
          </div>

          <p v-if="paypalError" class="checkout-error">{{ paypalError }}</p>
          <div v-if="order.paypal_client_id" id="paypal-button-container"></div>
          <div v-else class="checkout-success" style="padding:0">
            <p>{{ i18n.t('Online payment is being set up. We will email you at ', '在线支付正在配置中，我们会通过邮件 ' ) }}{{ form.email || order.customer_email }}{{ i18n.t(' to confirm your order.', ' 与你确认订单。') }}</p>
            <p class="spam-note">{{ i18n.t('Didn\'t see the email? Check your spam or junk folder.', '没收到邮件？请检查垃圾邮件或广告邮件文件夹。') }}</p>
            <button class="shop-button shop-button-dark shop-button-full" @click="finishSuccess(order, i18n.t('Your order has been placed. We will email you to confirm.', '订单已提交，我们会邮件与你确认。'))">
              {{ i18n.t('I understand', '我知道了') }}
            </button>
          </div>
        </div>

        <!-- Success -->
        <div v-else class="checkout-success">
          <h3>{{ i18n.t('Thank you.', '谢谢你。') }}</h3>
          <p class="success-order-no">{{ i18n.t('Order number', '订单号') }}: {{ order?.order_no }}</p>
          <p>{{ successMessage }}</p>
          <p class="spam-note">{{ i18n.t('Didn\'t see the email? Check your spam or junk folder.', '没收到邮件？请检查垃圾邮件或广告邮件文件夹。') }}</p>
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
import api from '../api/client';

const i18n = useI18n();
const cart = useCartStore();

const products = ref([]);
const bySlug = computed(() => new Map(products.value.map((p) => [p.slug, p])));
function productBySlug(slug) { return bySlug.value.get(slug); }
const titleOf = (p) => (p ? (i18n.lang === 'cn' ? p.title_cn : p.title_en) : '');
const money = (cents) => `$${(cents / 100).toFixed(2)} USD`;
const subtotal = computed(() =>
  cart.entries.reduce((sum, e) => sum + (productBySlug(e.slug)?.price_cents || 0) * e.quantity, 0)
);

const form = ref({ name: '', email: '', country: '', address: '' });
const order = ref(null);
const success = ref(false);
const successMessage = ref('');
const error = ref('');
const placing = ref(false);
const paypalError = ref('');
const paypalConfigured = ref(true);

async function placeOrder() {
  error.value = '';
  placing.value = true;
  try {
    const data = await api.post('/orders', {
      payment_method: 'paypal',
      customer: { ...form.value },
      items: cart.entries,
    });
    order.value = data;
    if (data.paypal_client_id) {
      mountPayPal(data);
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    placing.value = false;
  }
}

function loadPayPalSdk(clientId) {
  return new Promise((resolve, reject) => {
    if (window.paypal) return resolve();
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('PayPal SDK failed to load'));
    document.head.appendChild(s);
  });
}

async function mountPayPal(orderData) {
  try {
    await loadPayPalSdk(orderData.paypal_client_id);
    window.paypal.Buttons({
      style: { layout: 'vertical' },
      createOrder: async () => {
        const r = await api.post('/payments/paypal/create-order', { order_id: orderData.id });
        return r.paypal_order_id;
      },
      onApprove: async (data) => {
        try {
          await api.post('/payments/paypal/capture', { order_no: orderData.order_no, paypal_order_id: data.orderID });
          finishSuccess(orderData, i18n.t('Your payment was successful. A confirmation email is on its way.', '付款成功，确认邮件已发送。'));
        } catch (e) {
          paypalError.value = e.message;
        }
      },
      onError: (e) => { paypalError.value = (e && e.message) || 'PayPal error'; },
    }).render('#paypal-button-container');
  } catch (e) {
    paypalError.value = e.message;
  }
}

function finishSuccess(orderData, message) {
  cart.clear();
  success.value = true;
  successMessage.value = message;
}

onMounted(async () => {
  try {
    const [productsData, config] = await Promise.all([
      api.get('/products'),
      api.get('/config'),
    ]);
    products.value = productsData.products || [];
    paypalConfigured.value = !!config.paypalClientId;
  } catch {
    products.value = [];
  }
});
</script>
