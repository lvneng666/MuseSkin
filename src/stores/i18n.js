import { defineStore } from 'pinia';

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'cn', label: '中文', name: '简体中文' },
  { code: 'ja', label: 'JA', name: '日本語' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'es', label: 'ES', name: 'Español' },
];

const TRANSLATIONS = {
  'Home': { cn: '首页', ja: 'ホーム', fr: 'Accueil', de: 'Startseite', es: 'Inicio' },
  'Shop': { cn: '产品系列', ja: 'ショップ', fr: 'Boutique', de: 'Shop', es: 'Tienda' },
  'Account': { cn: '账户', ja: 'アカウント', fr: 'Compte', de: 'Konto', es: 'Cuenta' },
  'Bag': { cn: '购物袋', ja: 'バッグ', fr: 'Panier', de: 'Warenkorb', es: 'Bolsa' },
  'Add to bag': { cn: '加入购物袋', ja: 'カートに追加', fr: 'Ajouter au panier', de: 'In den Warenkorb', es: 'Añadir a la bolsa' },
  'Checkout': { cn: '结算', ja: 'チェックアウト', fr: 'Payer', de: 'Kasse', es: 'Pagar' },
  'Details': { cn: '查看详情', ja: '詳細を見る', fr: 'Détails', de: 'Details', es: 'Detalles' },
  'Legal': { cn: '法律', ja: '法的情報', fr: 'Mentions légales', de: 'Rechtliches', es: 'Legal' },
  'Terms of Service': { cn: '服务条款', ja: '利用規約', fr: 'Conditions d\'utilisation', de: 'Nutzungsbedingungen', es: 'Términos de servicio' },
  'Privacy Policy': { cn: '隐私政策', ja: 'プライバシーポリシー', fr: 'Politique de confidentialité', de: 'Datenschutz-Bestimmungen', es: 'Política de privacidad' },
  'All products': { cn: '全部产品', ja: 'すべての商品', fr: 'Tous les produits', de: 'Alle Produkte', es: 'Todos los productos' },
  'Face care': { cn: '面部护理', ja: 'フェイスケア', fr: 'Soins du visage', de: 'Gesichtspflege', es: 'Cuidado facial' },
  'Body care': { cn: '身体护理', ja: 'ボディケア', fr: 'Soins du corps', de: 'Körperpflege', es: 'Cuidado corporal' },
  'Daily protection': { cn: '日间防护', ja: 'デイリープロテクション', fr: 'Protection quotidienne', de: 'Täglicher Schutz', es: 'Protección diaria' },
  'Key ingredients': { cn: '核心成分', ja: '主な成分', fr: 'Ingrédients clés', de: 'Hauptinhaltsstoffe', es: 'Ingredientes clave' },
  'Best for': { cn: '适合肤质', ja: 'おすすめの肌質', fr: 'Recommandé pour', de: 'Empfohlen für', es: 'Recomendado para' },
  'How to use': { cn: '使用方法', ja: '使用方法', fr: 'Conseils d\'utilisation', de: 'Anwendung', es: 'Modo de uso' },
  'Added to bag': { cn: '已加入购物袋', ja: 'カートに追加されました', fr: 'Ajouté au panier', de: 'Zum Warenkorb hinzugefügt', es: 'Añadido a la bolsa' },
  'The Peaffee Collection': { cn: 'Peaffee 产品系列', ja: 'Peaffee コレクション', fr: 'La collection Peaffee', de: 'Die Peaffee Kollektion', es: 'La colección Peaffee' },
  'Daily care, ready to come home.': { cn: '让日常护理自然回到生活。', ja: '毎日のスキンケアを、あなたの日常に。', fr: 'Des soins quotidiens d\'exception.', de: 'Tägliche Pflege für Ihr Wohlbefinden.', es: 'Cuidado diario para tu piel.' },
  'Shop all products': { cn: '查看全部产品', ja: 'すべての商品を見る', fr: 'Découvrir tous les produits', de: 'Alle Produkte entdecken', es: 'Ver todos los productos' },
  'Find your everyday formulas': { cn: '找到你的日常护理', ja: '毎日のフォーミュラを見つける', fr: 'Trouvez vos formules quotidiennes', de: 'Finden Sie Ihre tägliche Pflege', es: 'Encuentra tus fórmulas diarias' },
  'The rituals you return to.': { cn: '值得反复使用的护理仪式。', ja: '毎日続けたくなるスキンケア儀式。', fr: 'Les rituels auxquels vous revenez.', de: 'Rituale für jeden Tag.', es: 'Rituales que querrás repetir.' },
  'Loading products…': { cn: '加载中…', ja: '商品を読み込み中…', fr: 'Chargement des produits…', de: 'Produkte werden geladen…', es: 'Cargando productos…' },
};

/** Multi-language store (Default: English). Components pick copy via t(en, cn). */
export const useI18n = defineStore('i18n', {
  state: () => ({
    lang: localStorage.getItem('peaffee-lang') || 'en',
  }),
  getters: {
    currentLangObj: (state) => LANGUAGES.find((l) => l.code === state.lang) || LANGUAGES[0],
  },
  actions: {
    setLang(lang) {
      if (LANGUAGES.some((l) => l.code === lang)) {
        this.lang = lang;
        localStorage.setItem('peaffee-lang', lang);
        document.documentElement.lang = lang === 'cn' ? 'zh-CN' : lang;
      }
    },
    t(en, cn) {
      if (this.lang === 'en') return en;
      if (this.lang === 'cn' && cn) return cn;
      
      const dictMatch = TRANSLATIONS[en];
      if (dictMatch && dictMatch[this.lang]) {
        return dictMatch[this.lang];
      }
      return this.lang === 'cn' ? (cn ?? en) : en;
    },
  },
});

