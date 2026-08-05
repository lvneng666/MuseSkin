<template>
  <div class="shop-page">
    <SiteHeader />
    <main>
      <div class="shop-container legal-page">
        <span class="shop-eyebrow">{{ i18n.t('Legal', '法律') }}</span>
        <h1 class="legal-title">{{ i18n.t('Privacy Policy', '隐私政策') }}</h1>
        <p class="legal-updated">{{ i18n.t('Last updated: August 2026', '最近更新：2026年8月') }}</p>

        <section class="legal-section">
          <h2>{{ i18n.t('1. Information We Collect', '一、我们收集的信息') }}</h2>
          <p>{{ i18n.t('We collect the information you provide when creating an account, placing an order, or contacting us — such as your name, email address, shipping address, and order details.', '我们收集您在创建账户、下单或联系我们时提供的信息，例如姓名、电子邮箱、收货地址和订单详情。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('2. How We Use Your Information', '二、信息的使用') }}</h2>
          <p>{{ i18n.t('We use your information to process orders, provide customer support, send transactional emails (order updates, password resets), and improve our website. We do not sell your personal data.', '我们使用您的信息来处理订单、提供客户支持、发送交易邮件（订单通知、密码重置）并改进网站。我们不会出售您的个人数据。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('3. Payment & Third-Party Services', '三、支付与第三方服务') }}</h2>
          <p>{{ i18n.t('Payments are handled by our payment partners (such as PayPal), who process your payment details under their own privacy policies. If you sign in with Google, Google shares with us only the profile information needed to create your account (name and email).', '支付由我们的支付合作伙伴（如 PayPal）处理，您的支付信息按其隐私政策处理。如您使用 Google 登录，Google 仅与我们共享创建账户所需的资料（姓名和邮箱）。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('4. Cookies', '四、Cookie 使用') }}</h2>
          <p>{{ i18n.t('We use essential cookies to keep you signed in and to remember your shopping bag. We do not use advertising trackers that profile you across sites.', '我们使用必要的 Cookie 来保持登录状态和记住购物袋。我们不会使用跨站追踪您行为的广告追踪器。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('5. Data Security', '五、数据安全') }}</h2>
          <p>{{ i18n.t('Your account password is stored in encrypted form, and connections to our website are protected. We retain your data only as long as needed for the purposes described above.', '您的账户密码以加密形式存储，与网站的连接受到保护。我们仅在完成上述目的所需的时间内保留您的数据。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('6. Your Rights', '六、您的权利') }}</h2>
          <p>{{ i18n.t('You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may also stop using your account at any time.', '您可以随时联系我们，要求访问、更正或删除您的个人数据。您也可以随时停止使用您的账户。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('7. Contact', '七、联系我们') }}</h2>
          <p>{{ i18n.t('For any privacy questions, contact us at', '如有任何隐私相关疑问，请通过以下邮箱联系我们') }}
            <a :href="'mailto:' + SITE.email" class="legal-link">{{ SITE.email }}</a>.</p>
        </section>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import SiteHeader from '../components/site/SiteHeader.vue';
import SiteFooter from '../components/site/SiteFooter.vue';
import { useI18n } from '../stores/i18n';
import { SITE } from '../config/site';

const i18n = useI18n();
</script>

<style scoped>
.legal-page { max-width: 720px; margin: 48px auto; padding: 0 24px; }
.legal-title { font-family: var(--font-serif); font-size: 34px; font-weight: 400; margin: 8px 0 4px; }
.legal-updated { color: var(--shop-muted); font-size: 12px; margin-bottom: 28px; }
.legal-section { margin-bottom: 26px; }
.legal-section h2 { font-size: 15px; font-weight: 600; margin: 0 0 8px; letter-spacing: .04em; }
.legal-section p { font-size: 13px; line-height: 1.7; color: var(--shop-muted); margin: 0; }
.legal-link { color: #a08365; text-decoration: underline; }
</style>
