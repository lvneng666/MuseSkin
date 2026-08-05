<template>
  <div class="shop-page">
    <SiteHeader />
    <main>
      <div class="shop-container legal-page">
        <span class="shop-eyebrow">{{ i18n.t('Legal', '法律') }}</span>
        <h1 class="legal-title">{{ i18n.t('Terms of Service', '服务条款') }}</h1>
        <p class="legal-updated">{{ i18n.t('Last updated: August 2026', '最近更新：2026年8月') }}</p>

        <section class="legal-section">
          <h2>{{ i18n.t('1. Acceptance of Terms', '一、条款接受') }}</h2>
          <p>{{ i18n.t('By accessing or purchasing from Peaffee, you agree to be bound by these Terms of Service. If you do not agree, please do not use the website.', '访问或购买 Peaffee 产品即表示您同意本服务条款。如不同意，请勿使用本网站。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('2. Orders & Payment', '二、订单与支付') }}</h2>
          <p>{{ i18n.t('All orders are subject to acceptance and availability. Prices are shown in USD and may change without notice. Payment is processed by our payment partners at the time of purchase.', '所有订单以接受确认和库存情况为准。价格以美元显示，可能随时调整。支付由我们的支付合作伙伴在下单时处理。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('3. Shipping & Delivery', '三、配送与物流') }}</h2>
          <p>{{ i18n.t('We aim to dispatch orders within the time stated at checkout. Delivery times are estimates and depend on the destination and carrier. Please provide an accurate delivery address.', '我们将在结算时说明的时间内发货。配送时间仅为估算，取决于目的地和承运商。请提供准确的收货地址。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('4. Returns & Refunds', '四、退换与退款') }}</h2>
          <p>{{ i18n.t('Due to the nature of personal care products, opened items cannot be returned for hygiene reasons unless faulty. Please contact us within 14 days of delivery if there is a problem with your order.', '鉴于个护产品的特殊性，出于卫生原因，已开封商品除非存在质量问题，恕不退换。如订单存在问题，请在收货后 14 天内联系我们。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('5. Product Information', '五、产品信息') }}</h2>
          <p>{{ i18n.t('Product descriptions and claims are provided for general information and are not medical advice. Always patch test and consult a professional if you have sensitive skin or allergies.', '产品描述与功效说明仅供参考，不构成医疗建议。如有敏感肌肤或过敏史，请先进行皮肤测试并咨询专业人士。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('6. Limitation of Liability', '六、责任限制') }}</h2>
          <p>{{ i18n.t('To the maximum extent permitted by law, Peaffee shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or its products.', '在法律允许的最大范围内，Peaffee 不对因使用本网站或其产品而产生的任何间接、附带或后果性损害承担责任。') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ i18n.t('7. Contact', '七、联系我们') }}</h2>
          <p>{{ i18n.t('Questions about these Terms may be sent to', '有关本条款的疑问可发送至') }}
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
