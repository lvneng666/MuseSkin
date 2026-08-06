<template>
  <div class="shop-page">
    <SiteHeader />
    <main>
      <div class="shop-container" style="max-width:620px;margin:40px auto;padding:0 20px">
        <span class="shop-eyebrow">{{ i18n.t('Reset password', '重置密码') }}</span>
        <h1 style="font-family:var(--font-serif);font-size:40px;font-weight:400;margin:8px 0 20px">
          {{ i18n.t('Choose a new password.', '设置一个新密码。') }}
        </h1>

        <!-- Success -->
        <div v-if="success" class="checkout-success">
          <p style="margin-bottom:20px">{{ i18n.t('Your password has been reset. You can now sign in.', '密码已重置，现在可以登录了。') }}</p>
          <router-link to="/account" class="shop-button shop-button-dark shop-button-full">
            {{ i18n.t('Go to sign in', '去登录') }}
          </router-link>
        </div>

        <!-- Invalid / missing token -->
        <template v-else-if="!token">
          <p class="checkout-note">{{ i18n.t('This link is missing a reset token. Use the link from the email we sent you.', '此链接缺少重置令牌，请使用邮件中的链接。') }}</p>
          <router-link to="/account" class="shop-button shop-button-light">{{ i18n.t('Go to sign in', '去登录') }}</router-link>
        </template>

        <!-- New password form -->
        <form v-else id="checkout-form" @submit.prevent="doReset">
          <label><span>{{ i18n.t('New password', '新密码') }}</span><input v-model="password" type="password" required minlength="8" autocomplete="new-password"></label>
          <label><span>{{ i18n.t('Confirm password', '确认密码') }}</span><input v-model="confirmPassword" type="password" required autocomplete="new-password"></label>
          <div v-if="error" class="checkout-error">{{ error }}</div>
          <button class="shop-button shop-button-dark shop-button-full" type="submit" :disabled="resetting">
            {{ resetting ? i18n.t('Saving…', '保存中…') : i18n.t('Set new password', '设置新密码') }}
          </button>
        </form>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from '../components/site/SiteHeader.vue';
import SiteFooter from '../components/site/SiteFooter.vue';
import { useI18n } from '../stores/i18n';
import api from '../api/client';

const i18n = useI18n();
const route = useRoute();

const token = ref(typeof route.query.token === 'string' ? route.query.token : '');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const resetting = ref(false);
const success = ref(false);

async function doReset() {
  error.value = '';
  if (password.value.length < 8) {
    error.value = i18n.t('Password must be at least 8 characters', '密码至少 8 位');
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = i18n.t('Passwords do not match', '两次输入的密码不一致');
    return;
  }
  resetting.value = true;
  try {
    await api.post('/auth/reset-password', { token: token.value, password: password.value });
    success.value = true;
  } catch (e) {
    error.value = e.message;
  } finally {
    resetting.value = false;
  }
}
</script>
