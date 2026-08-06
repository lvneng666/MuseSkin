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
  'Our Story': { cn: '品牌故事', ja: 'ブランドストーリー', fr: 'Notre histoire', de: 'Unsere Geschichte', es: 'Nuestra historia' },
  'Contact': { cn: '联系我们', ja: 'お問い合わせ', fr: 'Contact', de: 'Kontakt', es: 'Contacto' },
  'Shop by category': { cn: '按类目选购', ja: 'カテゴリから選ぶ', fr: 'Acheter par catégorie', de: 'Nach Kategorie stöbern', es: 'Comprar por categoría' },
  'Botanical skincare for the rituals you return to.': { cn: '为值得反复使用的日常仪式而生的植物护肤。', ja: '毎日続けたくなるスキンケアのために。', fr: 'Des soins botaniques pour vos rituels quotidiens.', de: 'Pflanzliche Pflege für Ihre täglichen Rituale.', es: 'Cuidado botánico para tus rituales diarios.' },
  'Our philosophy': { cn: '我们的理念', ja: '私たちの哲学', fr: 'Notre philosophie', de: 'Unsere Philosophie', es: 'Nuestra filosofía' },
  'Botanical-first': { cn: '植物为本', ja: '植物由来', fr: 'Le végétal d\'abord', de: 'Pflanzlich zuerst', es: 'Primero lo botánico' },
  'Small-batch': { cn: '小批量精制', ja: '小ロット製法', fr: 'Petits lots', de: 'Kleine Chargen', es: 'Pequeños lotes' },
  'Thoughtful care': { cn: '贴心护理', ja: '心を込めたケア', fr: 'Soins attentionnés', de: 'Aufmerksame Pflege', es: 'Cuidado atento' },
  'Begin your ritual.': { cn: '开启你的护理仪式。', ja: 'あなたの儀式を始めましょう。', fr: 'Commencez votre rituel.', de: 'Beginnen Sie Ihr Ritual.', es: 'Comienza tu ritual.' },
  'Shop the collection': { cn: '查看产品系列', ja: 'コレクションを見る', fr: 'Découvrir la collection', de: 'Kollektion entdecken', es: 'Ver la colección' },
  'The Peaffee Ritual': { cn: 'Peaffee 护理仪式', ja: 'Peaffee ケアの儀式', fr: 'Le rituel Peaffee', de: 'Das Peaffee-Ritual', es: 'El ritual Peaffee' },
  'Explore the full collection': { cn: '浏览完整产品系列', ja: 'コレクションをすべて見る', fr: 'Découvrir toute la collection', de: 'Die ganze Kollektion entdecken', es: 'Explorar toda la colección' },
  'Forgot password?': { cn: '忘记密码？', ja: 'パスワードをお忘れですか？', fr: 'Mot de passe oublié ?', de: 'Passwort vergessen?', es: '¿Olvidaste tu contraseña?' },
  'Cancel': { cn: '取消', ja: 'キャンセル', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar' },
  'Enter your email and we will send you a reset link.': { cn: '输入你的邮箱，我们会发送重置链接。', ja: 'メールアドレスを入力すると、再設定用リンクをお送りします。', fr: 'Saisissez votre e-mail, nous vous enverrons un lien de réinitialisation.', de: 'Geben Sie Ihre E-Mail-Adresse ein, wir senden Ihnen einen Link zum Zurücksetzen.', es: 'Introduce tu correo y te enviaremos un enlace para restablecerla.' },
  'Send reset link': { cn: '发送重置链接', ja: '再設定リンクを送信', fr: 'Envoyer le lien', de: 'Link senden', es: 'Enviar enlace' },
  'Reset link sent. Check your inbox.': { cn: '重置链接已发送，请查收邮件。', ja: '再設定リンクを送信しました。メールをご確認ください。', fr: 'Lien envoyé. Vérifiez votre boîte de réception.', de: 'Link gesendet. Prüfen Sie Ihren Posteingang.', es: 'Enlace enviado. Revisa tu bandeja de entrada.' },
  'Reset password': { cn: '重置密码', ja: 'パスワード再設定', fr: 'Réinitialiser le mot de passe', de: 'Passwort zurücksetzen', es: 'Restablecer contraseña' },
  'Choose a new password.': { cn: '设置一个新密码。', ja: '新しいパスワードを設定してください。', fr: 'Choisissez un nouveau mot de passe.', de: 'Wählen Sie ein neues Passwort.', es: 'Elige una nueva contraseña.' },
  'New password': { cn: '新密码', ja: '新しいパスワード', fr: 'Nouveau mot de passe', de: 'Neues Passwort', es: 'Nueva contraseña' },
  'Confirm password': { cn: '确认密码', ja: 'パスワード（確認）', fr: 'Confirmer le mot de passe', de: 'Passwort bestätigen', es: 'Confirmar contraseña' },
  'Set new password': { cn: '设置新密码', ja: 'パスワードを設定', fr: 'Définir le nouveau mot de passe', de: 'Neues Passwort festlegen', es: 'Establecer nueva contraseña' },
  'Password must be at least 8 characters': { cn: '密码至少 8 位', ja: 'パスワードは8文字以上で入力してください', fr: 'Le mot de passe doit contenir au moins 8 caractères', de: 'Das Passwort muss mindestens 8 Zeichen lang sein', es: 'La contraseña debe tener al menos 8 caracteres' },
  'Passwords do not match': { cn: '两次输入的密码不一致', ja: 'パスワードが一致しません', fr: 'Les mots de passe ne correspondent pas', de: 'Die Passwörter stimmen nicht überein', es: 'Las contraseñas no coinciden' },
  'Your password has been reset. You can now sign in.': { cn: '密码已重置，现在可以登录了。', ja: 'パスワードがリセットされました。ログインできます。', fr: 'Votre mot de passe a été réinitialisé. Vous pouvez vous connecter.', de: 'Ihr Passwort wurde zurückgesetzt. Sie können sich jetzt anmelden.', es: 'Tu contraseña se ha restablecido. Ya puedes iniciar sesión.' },
  'Go to sign in': { cn: '去登录', ja: 'ログインへ', fr: 'Se connecter', de: 'Zur Anmeldung', es: 'Ir a iniciar sesión' },
  'This link is missing a reset token. Use the link from the email we sent you.': { cn: '此链接缺少重置令牌，请使用邮件中的链接。', ja: 'このリンクには再設定トークンがありません。メール内のリンクをご利用ください。', fr: 'Ce lien est invalide. Utilisez le lien envoyé par e-mail.', de: 'Diesem Link fehlt ein Zurücksetzungs-Token. Nutzen Sie den Link aus unserer E-Mail.', es: 'A este enlace le falta un token. Usa el enlace del correo que te enviamos.' },
  'Saving…': { cn: '保存中…', ja: '保存中…', fr: 'Enregistrement…', de: 'Speichern…', es: 'Guardando…' },
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

