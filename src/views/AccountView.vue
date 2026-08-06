<template>
  <div class="shop-page">
    <SiteHeader />
    <main>
      <div class="shop-container" style="max-width:620px;margin:40px auto;padding:0 20px">
        <span class="shop-eyebrow">{{ i18n.t('Account', '账户') }}</span>
        <h1 style="font-family:var(--font-serif);font-size:40px;font-weight:400;margin:8px 0 20px">
          {{ i18n.t('Your Peaffee account.', '你的 Peaffee 账户。') }}
        </h1>

        <!-- Logged in -->
        <div v-if="auth.user">
          <p class="auth-welcome">{{ auth.user.full_name || auth.user.email }}</p>
          <h3 class="auth-subhead">{{ i18n.t('My orders', '我的订单') }}</h3>
          <div v-if="orders.length === 0" class="checkout-note">{{ i18n.t('No orders yet.', '暂无订单。') }}</div>
          <div v-for="o in orders" :key="o.order_no" class="order-summary">
            <div class="order-summary-head">
              <strong>{{ o.order_no }}</strong>
              <span :class="['auth-badge', `auth-badge-${o.order_status}`]">{{ o.order_status }}</span>
            </div>
            <div class="order-summary-meta">{{ o.payment_method }} · {{ money(o.total_cents) }} · {{ fmtDate(o.placed_at) }}</div>
          </div>
          <button class="shop-button shop-button-light shop-button-full" @click="logout" style="margin-top:14px">
            {{ i18n.t('Sign out', '退出登录') }}
          </button>
        </div>

        <!-- Not logged in -->
        <div v-else>
          <!-- Google Sign-In Section -->
          <div class="google-auth-container" style="margin-bottom: 20px; text-align: center;">
            <div id="google-btn-wrapper" style="display: flex; justify-content: center; min-height: 44px; align-items: center;"></div>
            <div v-if="googleError" class="checkout-error" style="margin-top: 10px; font-size: 13px;">{{ googleError }}</div>
            <div v-if="!googleClientId" class="checkout-note" style="font-size: 12px; margin-top: 8px; color: #888;">
              💡 {{ i18n.t('Google Sign-In ready (Add GOOGLE_CLIENT_ID in .env to activate)', '支持 Google 一键登录（在 .env 中配置 GOOGLE_CLIENT_ID 即可激活）') }}
            </div>
            <div class="auth-divider" style="display:flex; align-items:center; margin: 16px 0; color: #aaa; font-size: 12px;">
              <span style="flex:1; border-bottom:1px solid #eee"></span>
              <span style="padding:0 10px">{{ i18n.t('or continue with email', '或使用邮箱登录') }}</span>
              <span style="flex:1; border-bottom:1px solid #eee"></span>
            </div>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab" :class="{ active: tab === 'login' }" @click="tab = 'login'">{{ i18n.t('Sign in', '登录') }}</button>
            <button class="auth-tab" :class="{ active: tab === 'register' }" @click="tab = 'register'">{{ i18n.t('Create account', '注册') }}</button>
          </div>

          <template v-if="tab === 'login'">
            <form id="checkout-form" @submit.prevent="doLogin">
              <label><span>{{ i18n.t('Username or email', '用户名或邮箱') }}</span><input v-model="identifier" type="text" required></label>
              <label><span>{{ i18n.t('Password', '密码') }}</span><input v-model="password" type="password" required></label>
              <div v-if="error" class="checkout-error">{{ error }}</div>
              <button class="shop-button shop-button-dark shop-button-full" type="submit">{{ i18n.t('Sign in', '登录') }}</button>
            </form>

            <button type="button" class="forgot-toggle" @click="forgotOpen = !forgotOpen">
              {{ forgotOpen ? i18n.t('Cancel', '取消') : i18n.t('Forgot password?', '忘记密码？') }}
            </button>

            <form v-if="forgotOpen" id="checkout-form" class="forgot-form" @submit.prevent="doForgot">
              <label><span>{{ i18n.t('Email address', '电子邮箱') }}</span><input v-model="forgotEmail" type="email" required></label>
              <div v-if="forgotError" class="checkout-error">{{ forgotError }}</div>
              <div v-if="forgotSent" class="form-feedback success-message">{{ i18n.t('Reset link sent. Check your inbox.', '重置链接已发送，请查收邮件。') }}</div>
              <button class="shop-button shop-button-light shop-button-full" type="submit" :disabled="forgotSending">
                {{ forgotSending ? i18n.t('Sending…', '发送中…') : i18n.t('Send reset link', '发送重置链接') }}
              </button>
            </form>
          </template>

          <form v-else id="checkout-form" @submit.prevent="doRegister">
            <label><span>{{ i18n.t('Full name', '姓名') }}</span><input v-model="fullName" type="text" required></label>
            <label><span>{{ i18n.t('Username (optional)', '用户名（选填）') }}</span><input v-model="username" type="text" maxlength="50"></label>
            <label><span>{{ i18n.t('Email address', '电子邮箱') }}</span><input v-model="email" type="email" required></label>
            <label><span>{{ i18n.t('Password', '密码') }}</span><input v-model="password" type="password" required></label>
            <label><span>{{ i18n.t('Confirm password', '确认密码') }}</span><input v-model="confirmPassword" type="password" required></label>
            <label class="terms-row">
              <input v-model="agreeTerms" type="checkbox" class="terms-checkbox">
              <span class="terms-text">
                {{ i18n.t('I agree to the', '我已阅读并同意') }}
                <router-link to="/terms" class="terms-link">{{ i18n.t('Terms of Service', '《服务条款》') }}</router-link>
                {{ i18n.t('and', '和') }}
                <router-link to="/privacy" class="terms-link">{{ i18n.t('Privacy Policy', '《隐私政策》') }}</router-link>
              </span>
            </label>
            <div v-if="error" class="checkout-error">{{ error }}</div>
            <button class="shop-button shop-button-dark shop-button-full" type="submit">{{ i18n.t('Create account', '注册') }}</button>
          </form>

          <details class="auth-lookup">
            <summary>{{ i18n.t('Look up an order', '查询订单') }}</summary>
            <p class="checkout-note">{{ i18n.t('Already placed an order? Look it up with your email and order number.', '已下单？用邮箱和订单号查询。') }}</p>
            <form id="checkout-form" @submit.prevent="doLookup">
              <label><span>{{ i18n.t('Email address', '电子邮箱') }}</span><input v-model="lookupEmail" type="email" required></label>
              <label><span>{{ i18n.t('Order number', '订单号') }}</span><input v-model="lookupOrderNo" type="text" required placeholder="PF-…"></label>
              <button class="shop-button shop-button-dark shop-button-full" type="submit">{{ i18n.t('Look up an order', '查询订单') }}</button>
            </form>
            <div v-if="lookupError" class="checkout-error">{{ lookupError }}</div>
            <div v-if="lookupResult" class="order-summary">
              <div class="order-summary-head">
                <strong>{{ lookupResult.order_no }}</strong>
                <span class="auth-badge">{{ lookupResult.order_status }}</span>
              </div>
              <div class="order-summary-meta">{{ lookupResult.payment_method }} · {{ money(lookupResult.total_cents) }}</div>
            </div>
          </details>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import SiteHeader from '../components/site/SiteHeader.vue';
import SiteFooter from '../components/site/SiteFooter.vue';
import { useAuthStore } from '../stores/auth';
import { useI18n } from '../stores/i18n';
import api from '../api/client';

const i18n = useI18n();
const auth = useAuthStore();

const tab = ref('login');
const identifier = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreeTerms = ref(false);
const fullName = ref('');
const error = ref('');
const orders = ref([]);
const lookupEmail = ref('');
const lookupOrderNo = ref('');
const lookupResult = ref(null);
const lookupError = ref('');
const forgotOpen = ref(false);
const forgotEmail = ref('');
const forgotSent = ref(false);
const forgotError = ref('');
const forgotSending = ref(false);
const googleClientId = ref(null);

const googleError = ref('');

const money = (cents) => `$${(cents / 100).toFixed(2)} USD`;
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');

async function initGoogle() {
  try {
    const config = await api.get('/config');
    googleClientId.value = config.googleClientId;

    if (googleClientId.value) {
      if (!window.google?.accounts?.id) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = renderGoogleBtn;
        document.head.appendChild(script);
      } else {
        renderGoogleBtn();
      }
    }
  } catch (e) {
    console.error('Failed to load Google client ID config', e);
  }
}

function renderGoogleBtn() {
  if (!window.google?.accounts?.id || !googleClientId.value) return;

  window.google.accounts.id.initialize({
    client_id: googleClientId.value,
    callback: handleGoogleCallback,
    auto_select: false,
  });

  const wrapper = document.getElementById('google-btn-wrapper');
  if (wrapper) {
    window.google.accounts.id.renderButton(wrapper, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320,
    });
  }

  // 提示 One-Tap 快捷弹窗
  window.google.accounts.id.prompt();
}

async function handleGoogleCallback(response) {
  googleError.value = '';
  error.value = '';
  try {
    if (!response || !response.credential) {
      throw new Error('未获取到有效的 Google 凭证');
    }
    const user = await auth.googleLogin(response.credential);
    console.log('Google 登录成功:', user);
    await loadOrders();
    // 强制触发页面更新，展示已登录视图
    window.location.reload();
  } catch (e) {
    console.error('Google 登录异常:', e);
    googleError.value = e.message || 'Google 登录失败，请重试';
  }
}

async function doLogin() {
  error.value = '';
  try { await auth.login(identifier.value, password.value); await loadOrders(); }
  catch (e) { error.value = e.message; }
}
async function doRegister() {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = i18n.t('Passwords do not match', '两次输入的密码不一致');
    return;
  }
  if (!agreeTerms.value) {
    error.value = i18n.t('Please agree to the Terms of Service and Privacy Policy', '请先同意《服务条款》和《隐私政策》');
    return;
  }
  try {
    await auth.register({
      full_name: fullName.value,
      username: username.value || undefined,
      email: email.value,
      password: password.value,
    });
  } catch (e) { error.value = e.message; }
}
async function loadOrders() {
  try { const data = await api.get('/orders'); orders.value = data.orders || []; }
  catch { orders.value = []; }
}
async function logout() {
  await auth.logout();
  orders.value = [];
}
async function doLookup() {
  lookupResult.value = null;
  lookupError.value = '';
  try {
    const data = await api.get(`/orders/lookup?email=${encodeURIComponent(lookupEmail.value)}&order_no=${encodeURIComponent(lookupOrderNo.value)}`);
    lookupResult.value = data.order;
  } catch (e) {
    lookupError.value = e.message;
  }
}
async function doForgot() {
  forgotError.value = '';
  forgotSent.value = false;
  forgotSending.value = true;
  try {
    // Backend always returns ok (avoids account enumeration); reset link goes to the email.
    await api.post('/auth/forgot-password', { email: forgotEmail.value });
    forgotSent.value = true;
  } catch (e) {
    forgotError.value = e.message;
  } finally {
    forgotSending.value = false;
  }
}

onMounted(async () => {
  await initGoogle();
  if (auth.user) await loadOrders();
});
</script>

<style scoped>
#checkout-form label.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  text-transform: none;
  letter-spacing: 0;
}
#checkout-form input.terms-checkbox {
  width: auto;
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: var(--shop-green);
}
.terms-text {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.6;
  color: #555;
  text-transform: none;
}
.terms-link {
  color: #a08365;
  text-decoration: underline;
}
.forgot-toggle {
  display: inline-block;
  border: 0;
  background: transparent;
  color: #a08365;
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
  margin: 2px 0 16px;
  padding: 0;
}
.forgot-toggle:hover { color: var(--shop-green); }
.forgot-form { margin-top: 2px; }
</style>
