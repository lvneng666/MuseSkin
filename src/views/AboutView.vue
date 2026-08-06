<template>
  <div class="shop-page">
    <SiteHeader />
    <main>
      <section class="about-hero">
        <div class="shop-container">
          <span class="shop-eyebrow">Peaffee</span>
          <h1 class="about-title">{{ i18n.t('Botanical skincare for the rituals you return to.', '为值得反复使用的日常仪式而生的植物护肤。') }}</h1>
          <p class="about-lead">{{ i18n.t('Peaffee began with a simple belief: skincare should feel like a ritual, not a routine. We grow what we can, source what we cannot, and let the botanicals speak for themselves.', 'Peaffee 始于一个朴素的信念：护肤应当是一种仪式，而非一项流程。我们能种的就自己种，种不了的就精心挑选，让植物本身说话。') }}</p>
        </div>
      </section>

      <section class="about-section about-narrow">
        <div class="shop-container">
          <h2>{{ i18n.t('Our philosophy', '我们的理念') }}</h2>
          <p>{{ i18n.t('Every formula is built around a single intention — skin that feels calm, hydrated, and alive. We keep our ingredient lists short, our batches small, and our standards uncompromising.', '每一支配方都围绕一个纯粹的目的——让肌肤感到平静、水润、有生命力。我们把成分表做短，把批次做小，把标准做到不妥协。') }}</p>
          <p>{{ i18n.t('From our care team to our packaging, we try to treat every step the way we treat skin: gently, deliberately, and with the long view.', '从护理团队到产品包装，我们努力以对待肌肤的方式来对待每一个环节：温柔、专注、着眼长远。') }}</p>
        </div>
      </section>

      <section class="about-section about-values">
        <div class="shop-container">
          <div class="about-values-grid">
            <div class="about-value">
              <h3>{{ i18n.t('Botanical-first', '植物为本') }}</h3>
              <p>{{ i18n.t('Skin care rooted in plants — extracted gently, blended honestly, never over-formulated.', '以植物为核心的护肤——温和萃取、坦诚配比、拒绝过度添加。') }}</p>
            </div>
            <div class="about-value">
              <h3>{{ i18n.t('Small-batch', '小批量精制') }}</h3>
              <p>{{ i18n.t('Made in small batches so every jar leaves our studio at the peak of freshness.', '小批量制作，确保每一瓶都带着最新鲜的状态离开我们的工作室。') }}</p>
            </div>
            <div class="about-value">
              <h3>{{ i18n.t('Thoughtful care', '贴心护理') }}</h3>
              <p>{{ i18n.t('A real human care team helps you find your ritual — because skin is personal.', '真人护理团队帮你找到属于自己的仪式——因为肌肤是私人的。') }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about-cta">
        <div class="shop-container">
          <h2>{{ i18n.t('Begin your ritual.', '开启你的护理仪式。') }}</h2>
          <router-link to="/shop" class="shop-button shop-button-dark">{{ i18n.t('Shop the collection', '查看产品系列') }}</router-link>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import SiteHeader from '../components/site/SiteHeader.vue';
import SiteFooter from '../components/site/SiteFooter.vue';
import { useI18n } from '../stores/i18n';

const i18n = useI18n();
</script>

<style scoped>
.about-hero {
    padding: 120px 0 72px;
    text-align: center;
    background: linear-gradient(to bottom, var(--shop-sand), transparent);
}
.about-title {
    font-family: var(--font-serif);
    font-size: 52px;
    font-weight: 400;
    line-height: 1.15;
    max-width: 760px;
    margin: 16px auto 0;
}
.about-lead {
    margin: 26px auto 0;
    max-width: 560px;
    font-size: 15px;
    line-height: 1.85;
    color: var(--shop-muted);
}
.about-narrow { max-width: 680px; }
.about-section { padding: 76px 0; }
.about-section h2 {
    font-family: var(--font-serif);
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 22px;
}
.about-section p {
    font-size: 14px;
    line-height: 1.9;
    color: var(--shop-muted);
    margin: 0 0 16px;
}
.about-values { background: var(--shop-sand); }
.about-values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
}
.about-value h3 {
    font-family: var(--font-serif);
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 10px;
}
.about-value p {
    font-size: 13px;
    line-height: 1.7;
    color: var(--shop-muted);
    margin: 0;
}
.about-cta {
    text-align: center;
    padding: 96px 0 110px;
}
.about-cta h2 {
    font-family: var(--font-serif);
    font-size: 38px;
    font-weight: 400;
    margin: 0 0 28px;
}
@media (max-width: 700px) {
    .about-hero { padding: 84px 0 56px; }
    .about-title { font-size: 38px; }
    .about-section { padding: 56px 0; }
    .about-values-grid { grid-template-columns: 1fr; gap: 40px; }
    .about-cta { padding: 72px 0 90px; }
}
</style>
