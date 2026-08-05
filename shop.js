const CHECKOUT_EMAIL = 'concierge@peaffee.com';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(path, { method = 'GET', body } = {}) {
  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || 'Request failed');
  return data;
}

let products = [];

/* Products are loaded from the store API at runtime — the database is the
 * single source of truth. price stays in dollars for the render code below;
 * the API sends cents. */
function apiToClient(p) {
  return {
    slug: p.slug,
    image: p.image_url,
    category: p.category,
    categoryEn: p.category_en,
    categoryCn: p.category_cn,
    price: p.price_cents / 100,
    titleEn: p.title_en,
    titleCn: p.title_cn,
    tagEn: p.tag_en,
    tagCn: p.tag_cn,
    descEn: p.grid_desc_en || p.desc_en,
    descCn: p.grid_desc_cn || p.desc_cn,
    activeEn: p.active_en,
    activeCn: p.active_cn,
    skinEn: p.skin_en,
    skinCn: p.skin_cn,
    usageEn: p.usage_en,
    usageCn: p.usage_cn,
  };
}

async function loadProducts() {
  const data = await api('/api/products');
  products = (data.products || []).map(apiToClient);
  return products;
}

const copy = {
    en: {
        skip: 'Skip to shop', 'back-home': 'Brand story', 'nav-collection': 'Collection', 'nav-care': 'Care notes', bag: 'Bag',
        'hero-eyebrow': 'The Peaffee Collection', 'hero-title': 'Daily care, ready to come home.', 'hero-text': 'Botanical formulas with comfortable textures, purposeful actives, and a rhythm you can return to every day.', 'hero-cta': 'Shop all products',
        'collection-eyebrow': 'Find your everyday formulas', 'collection-title': 'The rituals you return to.', 'collection-text': 'Start with one essential or build a complete rhythm around what your skin needs most.', 'filter-all': 'All products', 'filter-face': 'Face care', 'filter-body': 'Body care', 'filter-protection': 'Daily protection',
        'care-1-title': 'Made for consistency', 'care-1-text': 'Simple formulas make it easier to keep the ritual going.', 'care-2-title': 'Clear ingredient notes', 'care-2-text': 'Know what each formula does, how it feels, and when to use it.', 'care-3-title': 'Help when you need it', 'care-3-text': 'Not sure where to start? ', 'care-3-link': 'Ask the Peaffee care team.',
        'footer-text': 'Botanical skincare for a slower, more thoughtful daily ritual.', 'footer-contact': 'Contact', 'your-bag': 'Your bag', 'bag-title': 'A considered collection.', 'bag-empty': 'Your bag is waiting for a ritual.', 'bag-start': 'Explore products', subtotal: 'Subtotal', 'bag-note': 'Shipping and taxes are confirmed before your order is placed.', checkout: 'Checkout',
        'add-to-bag': 'Add to bag', 'view-details': 'Details', 'no-results': 'No products match this filter yet.', 'item': 'item', items: 'items', remove: 'Remove', 'modal-category': 'Category', 'modal-active': 'Key ingredients', 'modal-skin': 'Best for', 'modal-usage': 'How to use',
        'checkout-eyebrow': 'Order details', 'checkout-title': 'Complete your ritual.', 'form-name': 'Full name', 'form-email': 'Email address', 'form-country': 'Country or region', 'form-address': 'Shipping address', 'place-order': 'Place order', 'checkout-note': 'Your order is created instantly and you pay securely online.', 'success-title': 'Thank you.', 'success-text': 'Your order has been placed.', currency: 'USD',
        'payment-method': 'Payment method', 'pm-paypal': 'PayPal / Credit card', 'pm-paypal-note': 'Pay by card — no PayPal account needed.', 'pm-wu': 'Western Union / Bank transfer', 'pm-wu-note': 'Manual transfer — our team confirms receipt.',
        'placing-order': 'Placing order…', 'paypal-not-configured': 'Online payment is not configured yet. Please choose Western Union or contact us.', 'paypal-processing': 'Complete payment with PayPal below.', 'paypal-load-error': 'Could not load PayPal. Please try again or choose Western Union.',
        'wu-amount': 'Amount', 'wu-beneficiary': 'Beneficiary', 'wu-bank': 'Bank', 'wu-account': 'Account', 'wu-ref': 'Transfer reference (memo)', 'wu-reference-label': 'Transfer reference / MTCN', 'wu-proof-label': 'Payment receipt (optional)', 'wu-submit': 'I have sent the payment',
        'order-no': 'Order number', 'success-text-pp': 'Your payment was successful. A confirmation email is on its way.', 'success-text-wu': 'Your order is being reviewed. We will email you once your transfer is confirmed.',
        'account': 'Account', 'sign-in': 'Sign in', 'create-account': 'Create account', 'password': 'Password', 'my-orders': 'My orders', 'no-orders': 'No orders yet.', 'sign-out': 'Sign out', 'order-lookup': 'Look up an order', 'guest-lookup': 'Already placed an order? Look it up with your email and order number.', 'auth-eyebrow': 'Account', 'auth-title': 'Your Peaffee account.'
    },
    cn: {
        skip: '跳转到商城内容', 'back-home': '品牌故事', 'nav-collection': '产品系列', 'nav-care': '护理说明', bag: '购物袋',
        'hero-eyebrow': 'Peaffee 产品系列', 'hero-title': '让日常护理自然回到生活。', 'hero-text': '舒适质地、有效成分与可以长期坚持的护肤节奏，组成 Peaffee 的日常护理。', 'hero-cta': '查看全部产品',
        'collection-eyebrow': '找到你的日常护理', 'collection-title': '值得反复使用的护理仪式。', 'collection-text': '从一款基础单品开始，也可以围绕肌肤最需要的方向建立完整护理。', 'filter-all': '全部产品', 'filter-face': '面部护理', 'filter-body': '身体护理', 'filter-protection': '日间防护',
        'care-1-title': '适合长期坚持', 'care-1-text': '简单的配方，更容易融入每天的护理节奏。', 'care-2-title': '清晰的成分说明', 'care-2-text': '了解每款产品的作用、肤感与使用时机。', 'care-3-title': '需要时随时咨询', 'care-3-text': '不知道从哪里开始？', 'care-3-link': '询问 Peaffee 护理团队。',
        'footer-text': '让护肤回到更从容、更有意识的日常节奏。', 'footer-contact': '联系我们', 'your-bag': '你的购物袋', 'bag-title': '把适合你的护理带回家。', 'bag-empty': '购物袋还在等待一套护理仪式。', 'bag-start': '探索产品', subtotal: '小计', 'bag-note': '配送与税费会在下单前确认。', checkout: '去结算',
        'add-to-bag': '加入购物袋', 'view-details': '查看详情', 'no-results': '暂时没有符合筛选条件的产品。', 'item': '件', items: '件', remove: '移除', 'modal-category': '护理分类', 'modal-active': '核心成分', 'modal-skin': '适合肤质', 'modal-usage': '使用方法',
        'checkout-eyebrow': '订单信息', 'checkout-title': '完成你的护理仪式。', 'form-name': '姓名', 'form-email': '电子邮箱', 'form-country': '国家或地区', 'form-address': '收货地址', 'place-order': '提交订单', 'checkout-note': '订单即时创建，并可在线上安全支付。', 'success-title': '谢谢你。', 'success-text': '订单已成功提交。', currency: 'USD',
        'payment-method': '支付方式', 'pm-paypal': 'PayPal / 信用卡', 'pm-paypal-note': '直接用银行卡支付，无需 PayPal 账户。', 'pm-wu': '西联汇款 / 银行转账', 'pm-wu-note': '线下转账，由我们团队人工确认到账。',
        'placing-order': '正在提交订单…', 'paypal-not-configured': '在线支付尚未配置，请选择西联汇款或联系我们。', 'paypal-processing': '请通过下方 PayPal 完成付款。', 'paypal-load-error': 'PayPal 加载失败，请重试或选择西联汇款。',
        'wu-amount': '金额', 'wu-beneficiary': '收款人', 'wu-bank': '银行', 'wu-account': '账号', 'wu-ref': '转账备注（请填写订单号）', 'wu-reference-label': '转账单号 / MTCN', 'wu-proof-label': '付款凭证（选填）', 'wu-submit': '我已转账',
        'order-no': '订单号', 'success-text-pp': '付款成功，确认邮件已发送。', 'success-text-wu': '订单已收到，我们确认到账后会邮件通知你。',
        'account': '账户', 'sign-in': '登录', 'create-account': '注册', 'password': '密码', 'my-orders': '我的订单', 'no-orders': '暂无订单。', 'sign-out': '退出登录', 'order-lookup': '查询订单', 'guest-lookup': '已下单？用邮箱和订单号查询。', 'auth-eyebrow': '账户', 'auth-title': '你的 Peaffee 账户。'
    }
};

const state = {
    lang: new URLSearchParams(window.location.search).get('lang') === 'cn' ? 'cn' : 'en',
    filter: 'all',
    cart: {}
};

let currentOrder = null;

try {
    const savedCart = JSON.parse(localStorage.getItem('peaffee-cart') || '{}');
    if (savedCart && typeof savedCart === 'object') state.cart = savedCart;
} catch (error) {
    state.cart = {};
}

const $ = (selector) => document.querySelector(selector);
const productBySlug = (slug) => products.find((product) => product.slug === slug);
const titleOf = (product) => state.lang === 'cn' ? product.titleCn : product.titleEn;
const descriptionOf = (product) => state.lang === 'cn' ? product.descCn : product.descEn;
const categoryOf = (product) => state.lang === 'cn' ? product.categoryCn : product.categoryEn;
const tagOf = (product) => state.lang === 'cn' ? product.tagCn : product.tagEn;
const money = (value) => `$${value.toFixed(2)} ${copy[state.lang].currency}`;

function saveCart() {
    localStorage.setItem('peaffee-cart', JSON.stringify(state.cart));
}

function applyLanguage() {
    const dictionary = copy[state.lang];
    document.documentElement.lang = state.lang === 'cn' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;
        if (dictionary[key] !== undefined) element.textContent = dictionary[key];
    });
    $('#lang-toggle').textContent = state.lang === 'cn' ? 'EN' : '中文';
    renderProducts();
    renderCart();
    refreshAuth();
    const openProductSlug = new URLSearchParams(window.location.search).get('product');
    if ($('#product-modal').classList.contains('open') && openProductSlug) renderProductModal(openProductSlug);
}

function renderProducts() {
    const grid = $('#product-grid');
    const visibleProducts = state.filter === 'all' ? products : products.filter((product) => product.category === state.filter);
    if (!visibleProducts.length) {
        grid.innerHTML = `<div class="shop-empty-results">${copy[state.lang]['no-results']}</div>`;
        return;
    }
    grid.innerHTML = visibleProducts.map((product) => `
        <article class="product-card">
            <div class="product-card-image">
                <button type="button" data-view-product="${product.slug}" aria-label="${titleOf(product)}">
                    <img src="${product.image}" alt="${titleOf(product)}" loading="lazy" decoding="async" width="520" height="580">
                </button>
                <span class="product-tag">${tagOf(product)}</span>
            </div>
            <div class="product-card-info">
                <span class="product-card-category">${categoryOf(product)}</span>
                <div class="product-card-title-row">
                    <button class="product-card-title" type="button" data-view-product="${product.slug}">${titleOf(product)}</button>
                    <span class="product-card-price">${money(product.price)}</span>
                </div>
                <p class="product-card-description">${descriptionOf(product)}</p>
                <div class="product-card-actions">
                    <button class="shop-button shop-button-dark" type="button" data-add-product="${product.slug}">${copy[state.lang]['add-to-bag']}</button>
                    <button class="product-detail-link" type="button" data-view-product="${product.slug}">${copy[state.lang]['view-details']}</button>
                </div>
            </div>
        </article>
    `).join('');
}

function cartEntries() {
    return Object.entries(state.cart).map(([slug, quantity]) => ({ product: productBySlug(slug), quantity: Number(quantity) })).filter((item) => item.product && item.quantity > 0);
}

function cartCount() {
    return cartEntries().reduce((total, item) => total + item.quantity, 0);
}

function cartSubtotal() {
    return cartEntries().reduce((total, item) => total + item.product.price * item.quantity, 0);
}

function renderCart() {
    const entries = cartEntries();
    const items = $('#bag-items');
    const empty = $('#bag-empty');
    const footer = $('#bag-footer');
    $('#bag-count').textContent = cartCount();
    $('#bag-subtotal').textContent = money(cartSubtotal());
    items.hidden = entries.length === 0;
    empty.hidden = entries.length !== 0;
    footer.hidden = entries.length === 0;
    items.innerHTML = entries.map(({ product, quantity }) => `
        <div class="bag-item">
            <img src="${product.image}" alt="${titleOf(product)}" width="70" height="70">
            <div>
                <div class="bag-item-title">${titleOf(product)}</div>
                <div class="bag-item-price">${money(product.price)}</div>
                <div class="bag-quantity">
                    <button type="button" data-cart-action="decrease" data-cart-product="${product.slug}" aria-label="Decrease quantity">−</button>
                    <span>${quantity}</span>
                    <button type="button" data-cart-action="increase" data-cart-product="${product.slug}" aria-label="Increase quantity">+</button>
                </div>
            </div>
            <button class="bag-remove" type="button" data-cart-action="remove" data-cart-product="${product.slug}">${copy[state.lang].remove}</button>
        </div>
    `).join('');
}

function addToBag(slug) {
    state.cart[slug] = Number(state.cart[slug] || 0) + 1;
    saveCart();
    renderCart();
    openBag();
}

function changeQuantity(slug, action) {
    const current = Number(state.cart[slug] || 0);
    if (action === 'increase') state.cart[slug] = current + 1;
    if (action === 'decrease') state.cart[slug] = current - 1;
    if (action === 'remove' || state.cart[slug] <= 0) delete state.cart[slug];
    saveCart();
    renderCart();
}

function openBag() {
    $('#bag-drawer').classList.add('open');
    $('#bag-drawer').setAttribute('aria-hidden', 'false');
    $('#bag-backdrop').hidden = false;
    document.body.classList.add('shop-drawer-open');
}

function closeBag() {
    $('#bag-drawer').classList.remove('open');
    $('#bag-drawer').setAttribute('aria-hidden', 'true');
    $('#bag-backdrop').hidden = true;
    document.body.classList.remove('shop-drawer-open');
}

function openModal(id) {
    const modal = $(`#${id}`);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('shop-drawer-open');
}

function closeModal(id) {
    const modal = $(`#${id}`);
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('shop-drawer-open');
    if (id === 'product-modal') {
        const url = new URL(window.location.href);
        url.searchParams.delete('product');
        history.replaceState({}, '', url);
    }
}

function renderProductModal(slug) {
    const product = productBySlug(slug);
    if (!product) return;
    $('#product-modal-body').innerHTML = `
        <div class="product-modal-body">
            <img class="product-modal-image" src="${product.image}" alt="${titleOf(product)}" width="540" height="600">
            <div class="product-modal-info">
                <span class="shop-eyebrow">${categoryOf(product)}</span>
                <h2 id="product-modal-title">${titleOf(product)}</h2>
                <div class="product-modal-price">${money(product.price)}</div>
                <p class="product-modal-desc">${descriptionOf(product)}</p>
                <div class="product-facts">
                    <div class="product-fact"><strong>${copy[state.lang]['modal-active']}</strong><span>${state.lang === 'cn' ? product.activeCn : product.activeEn}</span></div>
                    <div class="product-fact"><strong>${copy[state.lang]['modal-skin']}</strong><span>${state.lang === 'cn' ? product.skinCn : product.skinEn}</span></div>
                    <div class="product-fact"><strong>${copy[state.lang]['modal-usage']}</strong><span>${state.lang === 'cn' ? product.usageCn : product.usageEn}</span></div>
                </div>
                <button class="shop-button shop-button-dark shop-button-full" type="button" data-modal-add="${product.slug}">${copy[state.lang]['add-to-bag']}</button>
            </div>
        </div>
    `;
}

function openProduct(slug) {
    if (!productBySlug(slug)) return;
    const url = new URL(window.location.href);
    url.searchParams.set('product', slug);
    history.pushState({}, '', url);
    renderProductModal(slug);
    openModal('product-modal');
}

function renderCheckoutSummary() {
    const entries = cartEntries();
    $('#checkout-summary').innerHTML = `${entries.map(({ product, quantity }) => `<div class="checkout-summary-row"><span>${titleOf(product)} × ${quantity}</span><strong>${money(product.price * quantity)}</strong></div>`).join('')}<div class="checkout-summary-total"><span>${copy[state.lang].subtotal}</span><strong>${money(cartSubtotal())}</strong></div>`;
}

function openCheckout() {
    if (!cartCount()) return;
    closeBag();
    $('#checkout-form').hidden = false;
    $('#checkout-form').reset();
    $('#checkout-success').hidden = true;
    $('#payment-step').hidden = true;
    const extra = $('#checkout-success-extra');
    if (extra) extra.textContent = '';
    hideCheckoutError();
    const paypalRadio = document.querySelector('#checkout-form input[name="payment_method"][value="paypal"]');
    if (paypalRadio) paypalRadio.checked = true;
    renderCheckoutSummary();
    openModal('checkout-modal');
}

async function handleOrderSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const data = new FormData(form);
    const paymentMethod = (form.querySelector('input[name="payment_method"]:checked') || {}).value || 'paypal';

    hideCheckoutError();
    submitBtn.disabled = true;
    submitBtn.textContent = copy[state.lang]['placing-order'] || 'Placing order…';
    try {
        const order = await api('/api/orders', {
            method: 'POST',
            body: {
                payment_method: paymentMethod,
                customer: {
                    name: data.get('name'),
                    email: data.get('email'),
                    country: data.get('country'),
                    address: data.get('address'),
                },
                items: cartEntries().map(({ product, quantity }) => ({ slug: product.slug, quantity })),
            },
        });
        currentOrder = order;
        form.hidden = true;
        renderPaymentStep(order);
    } catch (err) {
        showCheckoutError(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function renderPaymentStep(order) {
    const step = $('#payment-step');
    step.hidden = false;
    $('#paypal-step').hidden = order.payment_method !== 'paypal';
    $('#wu-step').hidden = order.payment_method !== 'western_union';
    if (order.payment_method === 'paypal') {
        mountPayPal(order);
    } else {
        renderWuInstructions(order);
    }
}

function mountPayPal(order) {
    if (!order.paypal_client_id) {
        $('#paypal-status').textContent = copy[state.lang]['paypal-not-configured'];
        return;
    }
    $('#paypal-status').textContent = copy[state.lang]['paypal-processing'];
    loadPayPalSdk(order.paypal_client_id)
        .then(() => {
            window.paypal.Buttons({
                style: { layout: 'vertical' },
                createOrder: async () => {
                    const res = await api('/api/payments/paypal/create-order', { method: 'POST', body: { order_id: order.id } });
                    return res.paypal_order_id;
                },
                onApprove: async (data) => {
                    try {
                        await api('/api/payments/paypal/capture', { method: 'POST', body: { order_no: order.order_no, paypal_order_id: data.orderID } });
                        showCheckoutSuccess(order, false);
                    } catch (err) {
                        showCheckoutError(err.message);
                    }
                },
                onError: (err) => showCheckoutError((err && err.message) || 'PayPal error'),
            }).render('#paypal-button-container');
        })
        .catch(() => {
            $('#paypal-status').textContent = copy[state.lang]['paypal-load-error'];
        });
}

function loadPayPalSdk(clientId) {
    return new Promise((resolve, reject) => {
        if (window.paypal) return resolve();
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('PayPal SDK failed to load'));
        document.head.appendChild(script);
    });
}

function renderWuInstructions(order) {
    const ins = order.wu_instructions || {};
    $('#wu-instructions').innerHTML = `
        <div class="wu-instructions-box">
            <p><strong>${copy[state.lang]['wu-amount']}</strong> ${ins.amount || ''} ${ins.currency || ''}</p>
            <p><strong>${copy[state.lang]['wu-beneficiary']}</strong> ${esc(ins.beneficiary || '')}</p>
            ${ins.bank ? `<p><strong>${copy[state.lang]['wu-bank']}</strong> ${esc(ins.bank)}</p>` : ''}
            ${ins.account ? `<p><strong>${copy[state.lang]['wu-account']}</strong> ${esc(ins.account)}</p>` : ''}
            ${ins.swift ? `<p><strong>SWIFT/BIC</strong> ${esc(ins.swift)}</p>` : ''}
            <p><strong>${copy[state.lang]['wu-ref']}</strong> ${esc(order.order_no)}</p>
        </div>`;
}

function showCheckoutSuccess(order, isWu) {
    clearCartAfterOrder();
    $('#payment-step').hidden = true;
    $('#checkout-success').hidden = false;
    $('#success-order-no').textContent = `${copy[state.lang]['order-no']}: ${order.order_no}`;
    $('#checkout-success-extra').textContent = isWu ? copy[state.lang]['success-text-wu'] : copy[state.lang]['success-text-pp'];
}

function clearCartAfterOrder() {
    state.cart = {};
    saveCart();
    renderCart();
}

function showCheckoutError(message) {
    const el = $('#checkout-error');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
}

function hideCheckoutError() {
    const el = $('#checkout-error');
    if (el) el.hidden = true;
}

$('#product-grid').addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-product]');
    if (addButton) {
        addToBag(addButton.dataset.addProduct);
        return;
    }
    const viewButton = event.target.closest('[data-view-product]');
    if (viewButton) openProduct(viewButton.dataset.viewProduct);
});

document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
        state.filter = button.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
        renderProducts();
    });
});

$('#bag-toggle').addEventListener('click', openBag);
$('#bag-close').addEventListener('click', closeBag);
$('#bag-backdrop').addEventListener('click', closeBag);
$('#bag-start').addEventListener('click', closeBag);
$('#checkout-open').addEventListener('click', openCheckout);
$('#checkout-form').addEventListener('submit', handleOrderSubmit);

$('#wu-receipt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentOrder) return;
    const fd = new FormData(e.currentTarget);
    fd.append('email', currentOrder.customer_email || '');
    try {
        const res = await fetch(`/api/orders/${currentOrder.order_no}/wu-receipt`, { method: 'POST', body: fd, credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data && data.error) || 'Upload failed');
        showCheckoutSuccess(currentOrder, true);
    } catch (err) {
        showCheckoutError(err.message);
    }
});

document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => closeModal(button.dataset.closeModal));
});

document.querySelectorAll('.shop-modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal.id);
    });
});

$('#product-modal').addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-modal-add]');
    if (addButton) {
        addToBag(addButton.dataset.modalAdd);
        closeModal('product-modal');
    }
});

$('#bag-items').addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (button) changeQuantity(button.dataset.cartProduct, button.dataset.cartAction);
});

$('#lang-toggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'cn' : 'en';
    const url = new URL(window.location.href);
    url.searchParams.set('lang', state.lang);
    history.replaceState({}, '', url);
    applyLanguage();
});

window.addEventListener('popstate', () => {
    const slug = new URLSearchParams(window.location.search).get('product');
    if (slug) {
        renderProductModal(slug);
        openModal('product-modal');
    } else {
        closeModal('product-modal');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if ($('#checkout-modal').classList.contains('open')) closeModal('checkout-modal');
    else if ($('#product-modal').classList.contains('open')) closeModal('product-modal');
    else closeBag();
});

/* ---- Account (login / register / my orders) ---- */

let currentUser = null;
const moneyCents = (cents) => money(cents / 100);
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');

async function refreshAuth() {
    try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        currentUser = res.ok ? (await res.json()).user : null;
    } catch {
        currentUser = null;
    }
    const btn = $('#account-toggle');
    if (btn) btn.textContent = currentUser ? (currentUser.full_name || currentUser.email) : copy[state.lang]['sign-in'];
}

function openAuthModal() {
    renderAuthBody();
    openModal('auth-modal');
}

function renderAuthBody() {
    const body = $('#auth-body');
    if (!body) return;
    if (currentUser) {
        body.innerHTML = `
            <p class="auth-welcome">${esc(currentUser.full_name || currentUser.email)}</p>
            <h3 class="auth-subhead">${copy[state.lang]['my-orders']}</h3>
            <div id="my-orders"></div>
            <button class="shop-button shop-button-light shop-button-full" id="logout-btn" type="button">${copy[state.lang]['sign-out']}</button>`;
        renderMyOrders();
        $('#logout-btn').addEventListener('click', async () => {
            try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
            currentUser = null;
            refreshAuth();
            renderAuthBody();
        });
        return;
    }
    body.innerHTML = `
        <div class="auth-tabs">
            <button class="auth-tab active" data-auth-tab="login">${copy[state.lang]['sign-in']}</button>
            <button class="auth-tab" data-auth-tab="register">${copy[state.lang]['create-account']}</button>
        </div>
        <div id="auth-pane"></div>
        <details class="auth-lookup">
            <summary>${copy[state.lang]['order-lookup']}</summary>
            <p class="checkout-note">${copy[state.lang]['guest-lookup']}</p>
            <form id="order-lookup-form">
                <label><span>${copy[state.lang]['form-email']}</span><input name="email" type="email" required></label>
                <label><span>${copy[state.lang]['order-no']}</span><input name="order_no" type="text" required placeholder="PF-…"></label>
                <button class="shop-button shop-button-dark shop-button-full" type="submit">${copy[state.lang]['order-lookup']}</button>
            </form>
            <div id="order-lookup-result"></div>
        </details>`;
    renderAuthPane('login');
    document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-auth-tab]').forEach((b) => b.classList.toggle('active', b === btn));
            renderAuthPane(btn.dataset.authTab);
        });
    });
    $('#order-lookup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const result = $('#order-lookup-result');
        try {
            const res = await fetch(`/api/orders/lookup?email=${encodeURIComponent(d.get('email'))}&order_no=${encodeURIComponent(d.get('order_no'))}`, { credentials: 'same-origin' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Order not found');
            result.innerHTML = renderOrderSummary(data.order, data.items);
        } catch (err) {
            result.innerHTML = `<div class="checkout-error">${esc(err.message)}</div>`;
        }
    });
}

function renderAuthPane(tab) {
    const pane = $('#auth-pane');
    if (!pane) return;
    if (tab === 'register') {
        pane.innerHTML = `
            <form class="auth-form" id="register-form">
                <label><span>${copy[state.lang]['form-name']}</span><input name="full_name" type="text" required></label>
                <label><span>${copy[state.lang]['form-email']}</span><input name="email" type="email" required></label>
                <label><span>${copy[state.lang]['password']}</span><input name="password" type="password" minlength="8" required></label>
                <button class="shop-button shop-button-dark shop-button-full" type="submit">${copy[state.lang]['create-account']}</button>
            </form>`;
        $('#register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            try {
                const data = await api('/api/auth/register', { method: 'POST', body: { full_name: d.get('full_name'), email: d.get('email'), password: d.get('password') } });
                currentUser = data.user;
                refreshAuth();
                renderAuthBody();
            } catch (err) {
                showAuthError(err.message);
            }
        });
    } else {
        pane.innerHTML = `
            <form class="auth-form" id="login-form">
                <label><span>${copy[state.lang]['form-email']}</span><input name="email" type="email" required></label>
                <label><span>${copy[state.lang]['password']}</span><input name="password" type="password" required></label>
                <button class="shop-button shop-button-dark shop-button-full" type="submit">${copy[state.lang]['sign-in']}</button>
            </form>`;
        $('#login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            try {
                const data = await api('/api/auth/login', { method: 'POST', body: { email: d.get('email'), password: d.get('password') } });
                currentUser = data.user;
                refreshAuth();
                renderAuthBody();
            } catch (err) {
                showAuthError(err.message);
            }
        });
    }
}

function showAuthError(message) {
    const pane = $('#auth-pane');
    if (!pane) return;
    let el = pane.querySelector('.auth-error');
    if (!el) {
        el = document.createElement('div');
        el.className = 'auth-error';
        pane.prepend(el);
    }
    el.textContent = message;
}

async function renderMyOrders() {
    const container = $('#my-orders');
    if (!container) return;
    try {
        const data = await api('/api/orders');
        const orders = data.orders || [];
        container.innerHTML = orders.length === 0
            ? `<p class="checkout-note">${copy[state.lang]['no-orders']}</p>`
            : orders.map((o) => renderOrderSummary(o)).join('');
    } catch (err) {
        container.innerHTML = `<div class="checkout-error">${esc(err.message)}</div>`;
    }
}

function renderOrderSummary(order, items) {
    return `<div class="order-summary">
        <div class="order-summary-head">
            <strong>${esc(order.order_no)}</strong>
            <span class="auth-badge auth-badge-${esc(order.order_status)}">${esc(order.order_status)}</span>
        </div>
        <div class="order-summary-meta">${esc(order.payment_method)} · ${moneyCents(order.total_cents)} · ${fmtDate(order.placed_at)}</div>
        ${items ? `<div class="muted">${items.map((i) => `${esc(i.title_en)} × ${i.quantity}`).join(', ')}</div>` : ''}
    </div>`;
}

$('#account-toggle').addEventListener('click', openAuthModal);

(async () => {
    try {
        await loadProducts();
    } catch (err) {
        console.warn('Could not load products from the store API:', err);
    }
    applyLanguage();
    renderCart();
    const initialProduct = new URLSearchParams(window.location.search).get('product');
    if (initialProduct && productBySlug(initialProduct)) {
        renderProductModal(initialProduct);
        openModal('product-modal');
    }
})();