/* Peaffee admin panel — single-page app with hash routing.
 * All data comes from the admin API; the server enforces the admin role. */

const $ = (sel) => document.querySelector(sel);

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const money = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

async function api(path, { method = 'GET', body } = {}) {
  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (res.status === 401) {
    currentUser = null;
    updateShell();
    location.hash = '#/login';
    const err = new Error('Not authenticated');
    err.unauthorized = true;
    throw err;
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

function errorBox(message) {
  return `<div class="error-box">${esc(message)}</div>`;
}

/* ---------------- Auth ---------------- */

let currentUser = null;

async function refreshAuth() {
  try {
    const data = await fetch('/api/auth/me', { credentials: 'same-origin' });
    currentUser = data.ok ? (await data.json()).user : null;
  } catch {
    currentUser = null;
  }
  updateShell();
}

function updateShell() {
  const authed = !!currentUser;
  $('#nav').hidden = !authed;
  $('#logout-btn').hidden = !authed;
  $('#admin-name').hidden = !authed;
  if (authed) $('#admin-name').textContent = `${currentUser.full_name || currentUser.email}`;
}

$('#logout-btn').addEventListener('click', async () => {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  currentUser = null;
  updateShell();
  location.hash = '#/login';
});

/* ---------------- Router ---------------- */

const views = {
  dashboard: renderDashboard,
  products: renderProducts,
  product: renderProductForm,
  orders: renderOrders,
  order: renderOrderDetail,
  inquiries: renderInquiries,
};

function parseHash() {
  const raw = (location.hash || '#/dashboard').replace(/^#\/?/, '');
  const [name, ...rest] = raw.split('/');
  return { name: name || 'dashboard', param: rest.join('/') };
}

async function handleRoute() {
  const { name, param } = parseHash();
  if (!currentUser) { renderLogin(); return; }
  if (currentUser.role !== 'admin') {
    $('#view').innerHTML = `<div class="card">${errorBox('Admin access required.')}</div>`;
    return;
  }
  const view = views[name];
  try {
    if (view) await view(param);
    else await renderDashboard();
  } catch (err) {
    if (err.unauthorized) return;
    $('#view').innerHTML = `<div class="card">${errorBox(err.message)}</div>`;
  }
}

/* ---------------- Login ---------------- */

function renderLogin() {
  $('#view').innerHTML = `
    <div class="login-wrap">
      <div class="card">
        <h1>Sign in</h1>
        <form id="login-form">
          <label>Email</label>
          <input type="email" id="login-email" required autocomplete="username">
          <div style="height:12px"></div>
          <label>Password</label>
          <input type="password" id="login-password" required autocomplete="current-password">
          <div style="height:18px"></div>
          <button class="btn" style="width:100%" type="submit">Sign in</button>
        </form>
      </div>
    </div>`;
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { email: $('#login-email').value.trim(), password: $('#login-password').value },
      });
      currentUser = data.user;
      updateShell();
      location.hash = '#/dashboard';
    } catch (err) {
      const card = $('#login-form').closest('.card');
      if (card.querySelector('.error-box')) card.querySelector('.error-box').remove();
      card.insertAdjacentHTML('beforeend', errorBox(err.message));
    }
  });
}

/* ---------------- Dashboard ---------------- */

async function renderDashboard() {
  const [stats, orders] = await Promise.all([
    api('/api/admin/stats'),
    api('/api/admin/orders'),
  ]);
  const rows = (orders.orders || []).slice(0, 5);
  $('#view').innerHTML = `
    <div class="page-head"><h1>Dashboard</h1></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${stats.total_orders ?? 0}</div><div class="stat-label">Total orders</div></div>
      <div class="stat-card"><div class="stat-value">${money(stats.revenue_cents_paid ?? 0)}</div><div class="stat-label">Revenue (paid)</div></div>
      <div class="stat-card"><div class="stat-value">${stats.orders_today ?? 0}</div><div class="stat-label">Orders today</div></div>
      <div class="stat-card"><div class="stat-value">${stats.pending_wu ?? 0}</div><div class="stat-label">Western Union awaiting</div></div>
      <div class="stat-card"><div class="stat-value">${stats.new_inquiries ?? 0}</div><div class="stat-label">New inquiries</div></div>
      <div class="stat-card"><div class="stat-value">${stats.low_stock_items ?? 0}</div><div class="stat-label">Low stock items</div></div>
    </div>
    <div class="card" style="margin-top:20px">
      <h2 style="font-size:16px;margin-top:0">Recent orders</h2>
      ${rows.length === 0 ? '<p class="muted">No orders yet.</p>' : `
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead>
        <tbody>
          ${rows.map((o) => `
            <tr data-href="#/order/${esc(o.order_no)}" style="cursor:pointer">
              <td>${esc(o.order_no)}</td><td>${esc(o.customer_name)}</td>
              <td>${money(o.total_cents)}</td>
              <td><span class="badge badge-${esc(o.payment_status)}">${esc(o.payment_status)}</span></td>
              <td><span class="badge badge-${esc(o.order_status)}">${esc(o.order_status)}</span></td>
              <td>${fmtDate(o.placed_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>`}
    </div>`;
  bindRowClicks();
}

/* ---------------- Products ---------------- */

async function renderProducts() {
  const { products } = await api('/api/admin/products');
  $('#view').innerHTML = `
    <div class="page-head"><h1>Products</h1><a class="btn" href="#/product/new">+ New product</a></div>
    <div class="card">
      <table>
        <thead><tr><th>Sort</th><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Featured</th><th></th></tr></thead>
        <tbody>
          ${products.map((p) => `
            <tr>
              <td>${p.sort_order}</td>
              <td><strong>${esc(p.title_en)}</strong><div class="muted">${esc(p.title_cn)}</div></td>
              <td>${esc(p.category)}</td>
              <td>${money(p.price_cents)}</td>
              <td>${p.stock}</td>
              <td><span class="badge badge-${esc(p.status)}">${esc(p.status)}</span></td>
              <td>${p.featured ? '✓' : ''}</td>
              <td><a class="btn btn-small btn-ghost" href="#/product/${p.id}">Edit</a></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

const productFields = [
  { key: 'slug', label: 'Slug (url)', type: 'text', span: 'half', required: true },
  { key: 'category', label: 'Category', type: 'select', options: ['face', 'body', 'protection'], span: 'half', required: true },
  { key: 'title_en', label: 'Title · EN', type: 'text', span: 'half', required: true },
  { key: 'title_cn', label: 'Title · CN', type: 'text', span: 'half', required: true },
  { key: 'category_en', label: 'Category label · EN', type: 'text', span: 'half', required: true },
  { key: 'category_cn', label: 'Category label · CN', type: 'text', span: 'half', required: true },
  { key: 'tag_en', label: 'Tag · EN', type: 'text', span: 'half', required: true },
  { key: 'tag_cn', label: 'Tag · CN', type: 'text', span: 'half', required: true },
  { key: 'price', label: 'Price (USD)', type: 'money', span: 'half', required: true },
  { key: 'stock', label: 'Stock', type: 'number', span: 'half', required: true },
  { key: 'image_url', label: 'Image URL', type: 'text', span: 'half', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], span: 'half', required: true },
  { key: 'featured', label: 'Featured', type: 'checkbox', span: 'half' },
  { key: 'sort_order', label: 'Sort order', type: 'number', span: 'half' },
  { key: 'desc_en', label: 'Description · EN (modal)', type: 'textarea', span: 'full', required: true },
  { key: 'desc_cn', label: 'Description · CN (modal)', type: 'textarea', span: 'full', required: true },
  { key: 'grid_desc_en', label: 'Grid description · EN', type: 'textarea', span: 'half' },
  { key: 'grid_desc_cn', label: 'Grid description · CN', type: 'textarea', span: 'half' },
  { key: 'active_en', label: 'Key ingredients · EN', type: 'text', span: 'full', required: true },
  { key: 'active_cn', label: 'Key ingredients · CN', type: 'text', span: 'full', required: true },
  { key: 'skin_en', label: 'Best for · EN', type: 'textarea', span: 'half', required: true },
  { key: 'skin_cn', label: 'Best for · CN', type: 'textarea', span: 'half', required: true },
  { key: 'usage_en', label: 'How to use · EN', type: 'textarea', span: 'half', required: true },
  { key: 'usage_cn', label: 'How to use · CN', type: 'textarea', span: 'half', required: true },
  { key: 'moq_en', label: 'MOQ · EN', type: 'text', span: 'half' },
  { key: 'moq_cn', label: 'MOQ · CN', type: 'text', span: 'half' },
  { key: 'ritual_categories', label: 'Ritual categories (space-separated: hydrate repair protect body)', type: 'text', span: 'full' },
  { key: 'ritual_desc_en', label: 'Ritual card desc · EN', type: 'textarea', span: 'half' },
  { key: 'ritual_desc_cn', label: 'Ritual card desc · CN', type: 'textarea', span: 'half' },
  { key: 'ritual_tag_en', label: 'Ritual tag · EN', type: 'text', span: 'half' },
  { key: 'ritual_tag_cn', label: 'Ritual tag · CN (optional)', type: 'text', span: 'half' },
];

function fieldHtml(field, value) {
  const required = field.required ? ' required' : '';
  const common = `name="${field.key}" ${required}`;
  if (field.type === 'select') {
    return `<select ${common}>${field.options
      .map((o) => `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`)
      .join('')}</select>`;
  }
  if (field.type === 'checkbox') {
    return `<input type="checkbox" name="${field.key}" ${value ? 'checked' : ''}>`;
  }
  if (field.type === 'textarea') {
    return `<textarea ${common} rows="2">${esc(value ?? '')}</textarea>`;
  }
  if (field.type === 'money') {
    const dollars = value != null ? (Number(value) / 100).toFixed(2) : '';
    return `<input type="number" name="${field.key}" step="0.01" min="0" ${required} value="${dollars}">`;
  }
  return `<input type="${field.type}" ${common} value="${esc(value ?? '')}">`;
}

async function renderProductForm(id) {
  let product = null;
  if (id && id !== 'new') {
    const data = await api(`/api/admin/products`);
    product = (data.products || []).find((p) => String(p.id) === String(id));
    if (!product) {
      $('#view').innerHTML = `<div class="card">${errorBox('Product not found')}</div>`;
      return;
    }
  }
  const isNew = !product;

  $('#view').innerHTML = `
    <div class="page-head"><h1>${isNew ? 'New product' : `Edit — ${esc(product.title_en)}`}</h1>
      <a class="btn btn-ghost" href="#/products">← Back</a></div>
    <form id="product-form" class="card">
      <div class="grid">
        ${productFields.map((f) => `
          <div class="${f.span === 'full' ? 'full' : ''}" data-field="${f.key}">
            <label>${f.label}</label>
            ${fieldHtml(f, product ? product[f.key] : f.defaultValue)}
          </div>`).join('')}
      </div>
      <div class="form-actions">
        <button class="btn" type="submit">${isNew ? 'Create product' : 'Save changes'}</button>
        <a class="btn btn-ghost" href="#/products">Cancel</a>
        ${!isNew ? `<button class="btn btn-danger btn-small" type="button" id="delete-product">Deactivate</button>` : ''}
      </div>
    </form>`;

  $('#product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = {};
    for (const f of productFields) {
      const input = form.querySelector(`[name="${f.key}"]`);
      if (!input) continue;
      if (f.type === 'checkbox') payload[f.key] = input.checked;
      else if (f.type === 'money') payload.price_cents = Math.round(Number(input.value) * 100);
      else if (f.type === 'number') payload[f.key] = Number(input.value) || 0;
      else payload[f.key] = input.value.trim();
    }
    try {
      if (isNew) {
        await api('/api/admin/products', { method: 'POST', body: payload });
        toast('Product created');
      } else {
        await api(`/api/admin/products/${product.id}`, { method: 'PUT', body: payload });
        toast('Product saved');
      }
      location.hash = '#/products';
    } catch (err) {
      toast(err.message);
    }
  });

  const delBtn = $('#delete-product');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Deactivate ${product.title_en}? It will disappear from the public store.`)) return;
      try {
        await api(`/api/admin/products/${product.id}`, { method: 'DELETE' });
        toast('Product deactivated');
        location.hash = '#/products';
      } catch (err) {
        toast(err.message);
      }
    });
  }
}

/* ---------------- Orders ---------------- */

async function renderOrders() {
  const params = new URLSearchParams(location.hash);
  const currentStatus = params.get('order_status') || '';
  const currentPayment = params.get('payment_status') || '';

  const q = new URLSearchParams();
  if (currentStatus) q.set('order_status', currentStatus);
  if (currentPayment) q.set('payment_status', currentPayment);
  const { orders } = await api(`/api/admin/orders${q.toString() ? `?${q}` : ''}`);

  const statusChips = ['', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'];
  const paymentChips = ['', 'pending', 'awaiting_confirmation', 'paid', 'refunded', 'cancelled'];

  $('#view').innerHTML = `
    <div class="page-head"><h1>Orders</h1></div>
    <div class="filters">
      ${statusChips.map((s) => `<button class="filter-chip ${currentStatus === s ? 'active' : ''}" data-order-status="${s}">${s || 'all status'}</button>`).join('')}
    </div>
    <div class="filters">
      ${paymentChips.map((s) => `<button class="filter-chip ${currentPayment === s ? 'active' : ''}" data-payment-status="${s}">${s || 'all payment'}</button>`).join('')}
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead>
        <tbody>
          ${orders.length === 0 ? '<tr><td colspan="6" class="muted">No orders.</td></tr>' :
          orders.map((o) => `
            <tr data-href="#/order/${esc(o.order_no)}" style="cursor:pointer">
              <td>${esc(o.order_no)}</td>
              <td>${esc(o.customer_name)}<div class="muted">${esc(o.customer_email)}</div></td>
              <td>${money(o.total_cents)}</td>
              <td>${esc(o.payment_method)} · <span class="badge badge-${esc(o.payment_status)}">${esc(o.payment_status)}</span></td>
              <td><span class="badge badge-${esc(o.order_status)}">${esc(o.order_status)}</span></td>
              <td>${fmtDate(o.placed_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.querySelectorAll('[data-order-status]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const u = new URLSearchParams(location.hash.split('?')[1] || '');
      if (btn.dataset.orderStatus) u.set('order_status', btn.dataset.orderStatus); else u.delete('order_status');
      location.hash = `#/orders?${u}`;
    }));
  document.querySelectorAll('[data-payment-status]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const u = new URLSearchParams(location.hash.split('?')[1] || '');
      if (btn.dataset.paymentStatus) u.set('payment_status', btn.dataset.paymentStatus); else u.delete('payment_status');
      location.hash = `#/orders?${u}`;
    }));
  bindRowClicks();
}

async function renderOrderDetail(orderNo) {
  const { order, items } = await api(`/api/admin/orders/${encodeURIComponent(orderNo)}`);
  const isWU = order.payment_method === 'western_union';
  const actions = [];
  if (isWU && order.payment_status === 'awaiting_confirmation') actions.push({ label: 'Mark paid', method: 'mark-paid', cls: '' });
  if (order.order_status === 'confirmed') actions.push({ label: 'Mark shipped', method: 'shipped', cls: '' });
  if (order.order_status === 'shipped') actions.push({ label: 'Mark completed', method: 'completed', cls: '' });
  if (!['completed', 'cancelled'].includes(order.order_status)) actions.push({ label: 'Cancel', method: 'cancelled', cls: 'btn-danger' });

  $('#view').innerHTML = `
    <div class="page-head"><h1>${esc(order.order_no)}</h1><a class="btn btn-ghost" href="#/orders">← Back</a></div>
    <div class="card">
      <div class="order-detail-meta">
        <div><strong>Customer</strong><br>${esc(order.customer_name)}<br>${esc(order.customer_email)}<br>${esc(order.country)}</div>
        <div><strong>Shipping address</strong><br>${esc(order.shipping_address)}</div>
        <div><strong>Payment</strong><br>${esc(order.payment_method)}<br><span class="badge badge-${esc(order.payment_status)}">${esc(order.payment_status)}</span></div>
        <div><strong>Order status</strong><br><span class="badge badge-${esc(order.order_status)}">${esc(order.order_status)}</span></div>
        <div><strong>Placed</strong><br>${fmtDate(order.placed_at)}${order.paid_at ? `<br>Paid: ${fmtDate(order.paid_at)}` : ''}${order.shipped_at ? `<br>Shipped: ${fmtDate(order.shipped_at)}` : ''}</div>
      </div>
      ${order.paypal_capture_id ? `<div class="muted">PayPal capture: ${esc(order.paypal_capture_id)}</div>` : ''}
      ${order.wu_reference ? `<div class="muted">Western Union reference: ${esc(order.wu_reference)}</div>` : ''}
      ${order.wu_receipt_path ? `<div class="muted">Receipt:</div><img class="receipt-img" src="/api/admin/receipts/${esc(order.wu_receipt_path.split('/').pop())}" alt="Western Union receipt">` : ''}
      <div class="row-actions" style="margin-top:14px">
        ${actions.map((a) => `<button class="btn btn-small ${a.cls}" data-order-action="${a.method}">${a.label}</button>`).join('')}
      </div>
    </div>
    <div class="card">
      <h2 style="font-size:16px;margin-top:0">Items</h2>
      <table>
        <thead><tr><th>Product</th><th>Unit price</th><th>Qty</th><th>Line total</th></tr></thead>
        <tbody>
          ${items.map((i) => `
            <tr>
              <td>${esc(i.title_en)}<div class="muted">${esc(i.slug)}</div></td>
              <td>${money(i.unit_price_cents)}</td>
              <td>${i.quantity}</td>
              <td>${money(i.line_total_cents)}</td>
            </tr>`).join('')}
          <tr><td colspan="3" style="text-align:right"><strong>Subtotal</strong></td><td>${money(order.items_subtotal_cents)}</td></tr>
          <tr><td colspan="3" style="text-align:right"><strong>Shipping</strong></td><td>${money(order.shipping_cents)}</td></tr>
          <tr><td colspan="3" style="text-align:right"><strong>Total</strong></td><td><strong>${money(order.total_cents)}</strong></td></tr>
        </tbody>
      </table>
    </div>`;

  document.querySelectorAll('[data-order-action]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const action = btn.dataset.orderAction;
      if (action === 'cancelled' && !confirm('Cancel this order?')) return;
      try {
        if (action === 'mark-paid') await api(`/api/admin/orders/${encodeURIComponent(orderNo)}/mark-paid`, { method: 'POST' });
        else await api(`/api/admin/orders/${encodeURIComponent(orderNo)}/status`, { method: 'PATCH', body: { order_status: action } });
        toast(`Order ${action.replace('-', ' ')}`);
        renderOrderDetail(orderNo);
      } catch (err) {
        toast(err.message);
      }
    }));
}

/* ---------------- Inquiries ---------------- */

async function renderInquiries() {
  const { inquiries } = await api('/api/admin/inquiries');
  $('#view').innerHTML = `
    <div class="page-head"><h1>Inquiries</h1></div>
    <div class="card">
      <table>
        <thead><tr><th>Status</th><th>Name</th><th>Email</th><th>Interest</th><th>Message</th><th>Received</th></tr></thead>
        <tbody>
          ${inquiries.length === 0 ? '<tr><td colspan="6" class="muted">No inquiries yet.</td></tr>' :
          inquiries.map((inq) => `
            <tr>
              <td><span class="badge badge-${esc(inq.status)}">${esc(inq.status)}</span></td>
              <td>${esc(inq.name)}</td>
              <td>${esc(inq.email)}</td>
              <td>${esc(inq.interest || '—')}</td>
              <td style="max-width:360px">${esc(inq.message)}</td>
              <td>${fmtDate(inq.created_at)}<br>
                <button class="btn btn-small btn-ghost" data-inquiry-toggle="${inq.id}" data-status="${inq.status === 'new' ? 'resolved' : 'new'}">
                  ${inq.status === 'new' ? 'Mark resolved' : 'Reopen'}
                </button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.querySelectorAll('[data-inquiry-toggle]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await api(`/api/admin/inquiries/${btn.dataset.inquiryToggle}`, { method: 'PATCH', body: { status: btn.dataset.status } });
        renderInquiries();
      } catch (err) {
        toast(err.message);
      }
    }));
}

/* ---------------- Bootstrap ---------------- */

function bindRowClicks() {
  document.querySelectorAll('tr[data-href]').forEach((tr) => {
    tr.addEventListener('click', () => { location.hash = tr.dataset.href; });
  });
}

document.querySelectorAll('[data-nav]').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('[data-nav]').forEach((l) => l.classList.toggle('active', l === link));
  });
});

window.addEventListener('hashchange', handleRoute);

(async () => {
  await refreshAuth();
  handleRoute();
})();
