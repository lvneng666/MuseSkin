<template>
  <div class="home-page">
    <SiteHeader />

    <!-- Hero slider -->
    <section class="slider-section">
      <div class="slider-container">
        <div class="slide-content-grid">
          <div class="slide-text-side">
            <div class="slider-tag-pill">
              <span class="pill-dot"></span>
              <span>{{ slides[index].pill }}</span>
            </div>
            <span class="slider-subtitle">{{ i18n.t('Botanical skincare for daily rituals', '为日常仪式而生的植物护肤') }}</span>
            <h1 class="slider-title">{{ slides[index].title }}</h1>
            <p class="slider-desc">{{ slides[index].desc }}</p>
            <div class="slider-actions">
              <router-link to="/shop" class="btn btn-primary">{{ i18n.t('Shop this ritual', '查看这套仪式') }}</router-link>
              <a href="#rituals" class="btn btn-secondary">{{ i18n.t('Find Your Ritual', '找到你的护肤仪式') }}</a>
            </div>
          </div>
          <div class="slide-image-side">
            <div class="slide-image-aura"></div>
            <div class="slide-image-frame">
              <img :src="slides[index].img" :alt="slides[index].title" class="slider-image" width="600" height="600" fetchpriority="high" decoding="async">
            </div>
          </div>
        </div>

        <div class="slider-tabs">
          <div v-for="(s, i) in slides" :key="i" class="slider-tab" :class="{ active: index === i }" @click="index = i">
            <div class="tab-header">
              <span class="tab-number">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="tab-label">{{ s.short }}</span>
            </div>
            <div class="tab-progress-line"><span class="tab-progress-fill"></span></div>
          </div>
        </div>
        <div class="slider-controls">
          <button class="slider-arrow" type="button" aria-label="Previous slide" @click="prev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div class="slider-progress-counter">
            <span class="counter-num">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="counter-divider">/</span>
            <span class="counter-total">03</span>
          </div>
          <button class="slider-arrow" type="button" aria-label="Next slide" @click="next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-bar-section">
      <div class="container">
        <div class="stats-bar">
          <div class="stat-item"><span class="stat-number">17+</span><span class="stat-label">{{ i18n.t('Years Formulation R&D', '载护肤品研发生产经验') }}</span></div>
          <div class="stat-item"><span class="stat-number">50+</span><span class="stat-label">{{ i18n.t('Proven Actives Formulas', '项临床验证活性配方储备') }}</span></div>
          <div class="stat-item"><span class="stat-number">20+</span><span class="stat-label">{{ i18n.t('Countries Exported', '个全球国家与地区出口') }}</span></div>
          <div class="stat-item"><span class="stat-number">ISO</span><span class="stat-label">{{ i18n.t('9001 & 14001 Certified', '与 14001 国际双重认证') }}</span></div>
        </div>
      </div>
    </section>

    <!-- Rituals / products -->
    <section class="rituals-section" id="rituals">
      <div class="container">
        <div class="section-header">
          <span class="section-subtitle">{{ i18n.t('The Peaffee Ritual', 'Peaffee 护理仪式') }}</span>
          <h2 class="section-title">{{ i18n.t('The rituals you return to.', '值得反复使用的日常护理。') }}</h2>
        </div>
        <div v-if="ritualProducts.length" class="rituals-grid">
          <div v-for="p in ritualProducts" :key="p.slug" class="ritual-card">
            <div class="ritual-image-wrapper">
              <img :src="p.image_url" :alt="titleOf(p)" class="ritual-image" width="300" height="300" loading="lazy" decoding="async">
              <span class="ritual-active-tag">{{ p.ritual_tag_en || p.tag_en }}</span>
            </div>
            <div class="ritual-info">
              <h3 class="ritual-title">{{ titleOf(p) }}</h3>
              <span class="ritual-price">{{ money(p.price_cents) }}</span>
              <p class="ritual-description">{{ ritualDesc(p) }}</p>
              <router-link :to="{ path: '/shop', query: { product: p.slug } }" class="ritual-cta-btn">
                {{ i18n.t('Shop Now', '立即查看') }}
              </router-link>
            </div>
          </div>
        </div>
        <div v-else-if="!products.length" class="section-header"><p>{{ i18n.t('Loading products…', '加载中…') }}</p></div>
        <div v-if="products.length" class="rituals-cta">
          <router-link to="/shop" class="btn btn-primary">{{ i18n.t('Explore the full collection', '浏览完整产品系列') }}</router-link>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="connect-section" id="contact">
      <div class="container">
        <div class="section-header">
          <span class="section-subtitle">{{ i18n.t('Peaffee Care', 'Peaffee 肌肤护理') }}</span>
          <h2 class="section-title">{{ i18n.t('Need help choosing your ritual?', '需要帮助选择护肤仪式吗？') }}</h2>
          <p class="section-desc">{{ i18n.t('Tell us what your skin needs and our care team will help you find a comfortable place to begin.', '告诉我们你的肌肤需求，Peaffee 护理团队会帮助你找到舒适的起点。') }}</p>
        </div>
        <form id="contact-form" class="contact-form" @submit.prevent="submitContact">
          <div class="form-row">
            <div class="form-field">
              <label>{{ i18n.t('Your name *', '你的姓名 *') }}</label>
              <input v-model="contact.name" type="text" required class="form-input">
            </div>
            <div class="form-field">
              <label>{{ i18n.t('Email address *', '电子邮箱 *') }}</label>
              <input v-model="contact.email" type="email" required class="form-input">
            </div>
          </div>
          <div class="form-field">
            <label>{{ i18n.t('What can we help with?', '你需要哪方面的帮助？') }}</label>
            <input v-model="contact.interest" type="text" class="form-input">
          </div>
          <div class="form-field">
            <label>{{ i18n.t('Tell us what your skin needs *', '告诉我们你的肌肤需求 *') }}</label>
            <textarea v-model="contact.message" rows="4" required class="form-textarea"></textarea>
          </div>
          <div v-if="contactError" class="form-error-msg visible">{{ contactError }}</div>
          <button class="btn btn-primary" type="submit" :disabled="sending">
            {{ sending ? i18n.t('Sending…', '发送中…') : i18n.t('Send a care question', '发送护理问题') }}
          </button>
          <div v-if="contactSuccess" class="form-feedback success-message">
            {{ i18n.t('Your message has been received. The Peaffee care team will be in touch soon.', '我们已经收到你的留言，Peaffee 护理团队会尽快联系你。') }}
          </div>
        </form>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import SiteHeader from '../components/site/SiteHeader.vue';
import SiteFooter from '../components/site/SiteFooter.vue';
import { useI18n } from '../stores/i18n';
import api from '../api/client';

const i18n = useI18n();
const index = ref(0);
const products = ref([]);
let timer = null;

const slides = computed(() => {
  const cn = i18n.lang === 'cn';
  return [
    { title: cn ? '活力精华液' : 'The Active Serum', short: cn ? '活力精华液' : 'Active Serum', pill: 'Multi-Molecular Hyaluronic Acid',
      desc: cn ? '高浓度植萃精华，富含多重玻尿酸与绿茶抗氧化因子，强力补水，令肌肤莹润充盈。' : 'A highly concentrated botanical elixir infused with multi-molecular hyaluronic acid and green tea antioxidants to deeply hydrate and plump the skin.',
      img: 'https://pub-43406c238a96463d95e2178d10ae1446.r2.dev/assets/hero.webp' },
    { title: cn ? '奢华面霜' : 'The Luxury Cream', short: cn ? '奢华面霜' : 'Luxury Cream', pill: 'Organic Ceramide Lipid Complex',
      desc: cn ? '如丝绒般细腻润泽的护肤面霜，富含神经酰胺和天然果脂，强化皮脂屏障。' : 'A decadent, whipped facial cream featuring ceramides and botanical oils that mimic the skin’s natural lipid barrier.',
      img: 'https://pub-43406c238a96463d95e2178d10ae1446.r2.dev/assets/cream.webp' },
    { title: cn ? '温和洁面乳' : 'The Gentle Cleanser', short: cn ? '温和洁面乳' : 'Gentle Cleanser', pill: 'Ultra-Gentle Amino Acid Care',
      desc: cn ? '极致温和且不起泡的洁面乳霜，安全洗去日常彩妆、防晒及脏污，同时细心守护皮脂层。' : 'An ultra-gentle, non-foaming cream cleanser that lifts away makeup, SPF, and impurities while respecting the moisture barrier.',
      img: 'https://pub-43406c238a96463d95e2178d10ae1446.r2.dev/assets/cleanser.webp' },
  ];
});

function next() { index.value = (index.value + 1) % 3; }
function prev() { index.value = (index.value + 2) % 3; }

const titleOf = (p) => (i18n.lang === 'cn' ? p.title_cn : p.title_en);
const ritualDesc = (p) => (i18n.lang === 'cn' ? (p.ritual_desc_cn || p.desc_cn) : (p.ritual_desc_en || p.desc_en));
const money = (cents) => `$${(cents / 100).toFixed(2)} USD`;

// Homepage showcases only the three hero ritual products; the full catalog lives on /shop.
const RITUAL_SLUGS = ['the-active-serum', 'the-luxury-cream', 'the-gentle-cleanser'];
const ritualProducts = computed(() =>
  RITUAL_SLUGS.map((slug) => products.value.find((p) => p.slug === slug)).filter(Boolean)
);

const contact = reactive({ name: '', email: '', interest: '', message: '' });
const contactError = ref('');
const contactSuccess = ref(false);
const sending = ref(false);

async function submitContact() {
  contactError.value = '';
  sending.value = true;
  try {
    await api.post('/inquiries', {
      name: contact.name, email: contact.email, interest: contact.interest, message: contact.message,
    });
    contactSuccess.value = true;
    contact.name = ''; contact.email = ''; contact.interest = ''; contact.message = '';
  } catch (e) {
    contactError.value = e.message;
  } finally {
    sending.value = false;
  }
}

onMounted(async () => {
  timer = setInterval(next, 5000);
  try {
    const data = await api.get('/products');
    products.value = data.products || [];
  } catch { products.value = []; }
});
onBeforeUnmount(() => clearInterval(timer));
</script>
