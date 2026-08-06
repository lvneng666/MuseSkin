<template>
  <div class="admin-app">
    <header class="admin-topbar">
      <div class="admin-brand">Peaffee <span>Admin</span></div>
      <div class="admin-topbar-right">
        <span v-if="auth.user">{{ auth.user.full_name || auth.user.email }}</span>
        <router-link to="/" class="admin-link">← 返回网站</router-link>
        <button class="admin-btn admin-btn-ghost" @click="logout">退出登录</button>
      </div>
    </header>
    <nav class="admin-nav">
      <button :class="{ active: tab === 'dashboard' }" @click="go('dashboard')">仪表盘</button>
      <button :class="{ active: tab === 'products' }" @click="go('products')">商品</button>
      <button :class="{ active: tab === 'orders' }" @click="go('orders')">订单</button>
      <button :class="{ active: tab === 'inquiries' }" @click="go('inquiries')">询盘</button>
    </nav>
    <main class="admin-main">
      <div v-if="loading" class="admin-muted">加载中…</div>

      <!-- Dashboard -->
      <div v-else-if="tab === 'dashboard'">
        <h1 class="admin-title">仪表盘</h1>
        <div class="admin-stats">
          <div class="admin-stat"><div class="admin-stat-value">{{ stats.total_orders }}</div><div class="admin-stat-label">总订单</div></div>
          <div class="admin-stat"><div class="admin-stat-value">{{ money(stats.revenue_cents_paid) }}</div><div class="admin-stat-label">已收款</div></div>
          <div class="admin-stat"><div class="admin-stat-value">{{ stats.orders_today }}</div><div class="admin-stat-label">今日订单</div></div>
          <div class="admin-stat"><div class="admin-stat-value">{{ stats.pending_wu }}</div><div class="admin-stat-label">待确认西联</div></div>
          <div class="admin-stat"><div class="admin-stat-value">{{ stats.new_inquiries }}</div><div class="admin-stat-label">新询盘</div></div>
          <div class="admin-stat"><div class="admin-stat-value">{{ stats.low_stock_items }}</div><div class="admin-stat-label">低库存</div></div>
        </div>
      </div>

      <!-- Products -->
      <div v-else-if="tab === 'products'">
        <h1 class="admin-title">商品</h1>
        <button class="admin-btn" @click="openNewProduct">+ 新建商品</button>
        <table class="admin-table">
          <thead><tr><th></th><th>标题</th><th>分类</th><th>价格</th><th>库存</th><th>状态</th><th></th></tr></thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td><img class="admin-thumb" :src="p.image_url" :alt="p.title_en" loading="lazy"></td>
              <td><strong>{{ p.title_en }}</strong><div class="admin-muted">{{ p.title_cn }}</div></td>
              <td>{{ p.category }}</td>
              <td>{{ money(p.price_cents) }}</td>
              <td>{{ p.stock }}</td>
              <td>
                <button class="admin-btn admin-btn-small" :class="p.status === 'active' ? '' : 'admin-btn-ghost'"
                        @click="toggleStatus(p)">
                  {{ p.status === 'active' ? '下架' : '上架' }}
                </button>
              </td>
              <td><button class="admin-btn admin-btn-small" @click="openProductForm(p)">编辑</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Orders -->
      <div v-else-if="tab === 'orders'">
        <h1 class="admin-title">订单</h1>
        <div v-if="!selectedOrder" class="admin-filters">
          <button v-for="s in orderStatuses" :key="s" :class="['admin-chip', { active: orderFilter === s }]" @click="orderFilter = s; loadOrders()">{{ statusLabel(s) || '全部' }}</button>
        </div>
        <table v-if="!selectedOrder" class="admin-table">
          <thead><tr><th>订单</th><th>客户</th><th>金额</th><th>支付</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.order_no" class="admin-row" @click="openOrder(o.order_no)">
              <td>{{ o.order_no }}</td>
              <td>{{ o.customer_name }}</td>
              <td>{{ money(o.total_cents) }}</td>
              <td>{{ methodLabel(o.payment_method) }} · {{ statusLabel(o.payment_status) }}</td>
              <td><span class="admin-badge">{{ statusLabel(o.order_status) }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-else>
          <button class="admin-btn admin-btn-ghost" @click="selectedOrder = null">← 返回</button>
          <h2 class="admin-title">{{ selectedOrder.order_no }}</h2>
          <div class="admin-meta">
            <div><strong>客户</strong><br>{{ selectedOrder.customer_name }}<br>{{ selectedOrder.customer_email }}<br>{{ selectedOrder.country }}</div>
            <div><strong>地址</strong><br>{{ selectedOrder.shipping_address }}</div>
            <div><strong>支付</strong><br>{{ methodLabel(selectedOrder.payment_method) }} · <span class="admin-badge">{{ statusLabel(selectedOrder.payment_status) }}</span></div>
            <div><strong>订单</strong><br><span class="admin-badge">{{ statusLabel(selectedOrder.order_status) }}</span><br>{{ fmtDate(selectedOrder.placed_at) }}</div>
          </div>
          <div v-if="selectedOrder.wu_reference" class="admin-muted">西联单号: {{ selectedOrder.wu_reference }}</div>
          <div v-if="selectedOrder.wu_receipt_path" class="admin-muted">凭证已上传: {{ selectedOrder.wu_receipt_path }}</div>
          <div class="admin-actions">
            <button v-if="selectedOrder.payment_method==='western_union' && selectedOrder.payment_status==='awaiting_confirmation'" class="admin-btn" @click="markPaid(selectedOrder.order_no)">确认到账</button>
            <button v-if="selectedOrder.order_status==='confirmed'" class="admin-btn" @click="setStatus(selectedOrder.order_no,'shipped')">标记发货</button>
            <button v-if="selectedOrder.order_status==='shipped'" class="admin-btn" @click="setStatus(selectedOrder.order_no,'completed')">标记完成</button>
            <button v-if="selectedOrder.payment_status==='paid'" class="admin-btn admin-btn-danger" @click="refund(selectedOrder.order_no)">退款</button>
            <button v-if="!['completed','cancelled'].includes(selectedOrder.order_status)" class="admin-btn admin-btn-danger" @click="setStatus(selectedOrder.order_no,'cancelled')">取消</button>
          </div>
          <table class="admin-table"><tbody>
            <tr v-for="item in orderItems" :key="item.id">
              <td>{{ item.title_en }}</td><td>{{ item.unit_price_cents/100 }}</td><td>× {{ item.quantity }}</td><td>{{ money(item.line_total_cents) }}</td>
            </tr>
          </tbody></table>
        </div>
      </div>

      <!-- Inquiries -->
      <div v-else>
        <h1 class="admin-title">询盘</h1>
        <table class="admin-table">
          <thead><tr><th>状态</th><th>姓名</th><th>邮箱</th><th>主题</th><th>内容</th><th></th></tr></thead>
          <tbody>
            <tr v-for="i in inquiries" :key="i.id">
              <td><span class="admin-badge">{{ i.status }}</span></td>
              <td>{{ i.name }}</td><td>{{ i.email }}</td><td>{{ i.interest }}</td>
              <td>{{ i.message }}</td>
              <td><button class="admin-btn admin-btn-small" @click="toggleInquiry(i)">{{ i.status === 'new' ? '已处理' : '重新打开' }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Product form modal -->
      <div v-if="productFormOpen" class="admin-overlay" @click.self="closeProductForm">
        <div class="admin-modal">
          <div class="admin-modal-head">
            <h2 class="admin-title" style="margin:0">{{ editingProduct ? '编辑商品' : '新建商品' }}</h2>
            <button class="admin-btn admin-btn-ghost" @click="closeProductForm">×</button>
          </div>
          <div class="admin-modal-body">
            <div class="admin-lang-tabs">
              <button type="button" :class="{ active: lang === 'en' }" @click="lang = 'en'">EN</button>
              <button type="button" :class="{ active: lang === 'cn' }" @click="lang = 'cn'">中文</button>
              <span class="admin-lang-hint">中英文字段切换语言分别填写</span>
            </div>
            <div class="admin-img-preview" role="button" :title="productForm.image_url ? '点击修改图片' : '点击上传图片'"
                 @click="uploadImgInput.click()">
              <img :src="productForm.image_url || 'https://pub-43406c238a96463d95e2178d10ae1446.r2.dev/assets/hero.webp'"
                   :alt="productForm.title_en">
              <div class="admin-img-overlay">
                <span>{{ uploading ? '上传中…' : (productForm.image_url ? '点击修改图片' : '点击上传图片') }}</span>
              </div>
              <input ref="uploadImgInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="admin-upload-hidden" @change="uploadImage">
            </div>
            <div class="admin-form-grid">
              <label>Slug（网址标识）<input v-model="productForm.slug" class="admin-input" required></label>
              <label>Category
                <select v-model="productForm.category" class="admin-input">
                  <option>face</option><option>body</option><option>protection</option>
                </select>
              </label>
              <label>标题<input v-model="productForm[F('title_en')]" class="admin-input" required></label>
              <label>分类标签<input v-model="productForm[F('category_en')]" class="admin-input"></label>
              <label>价格（美元）<input v-model.number="productForm.price" class="admin-input" type="number" step="0.01" min="0"></label>
              <label>库存<input v-model.number="productForm.stock" class="admin-input" type="number" min="0"></label>
              <label>图片地址
                <input v-model="productForm.image_url" class="admin-input" placeholder="或手动粘贴图片 URL（可留空，点上方图片上传）">
              </label>
              <label>排序<input v-model.number="productForm.sort_order" class="admin-input" type="number"></label>
              <label class="admin-check"><input type="checkbox" v-model="productForm.featured"> Featured</label>
              <label>Status
                <select v-model="productForm.status" class="admin-input">
                  <option>active</option><option>inactive</option>
                </select>
              </label>
              <label>标签<input v-model="productForm[F('tag_en')]" class="admin-input"></label>
            </div>
            <div class="admin-form-grid">
              <label>描述<textarea v-model="productForm[F('desc_en')]" class="admin-input" rows="2"></textarea></label>
              <label>核心成分<input v-model="productForm[F('active_en')]" class="admin-input"></label>
              <label>适合肤质<input v-model="productForm[F('skin_en')]" class="admin-input"></label>
              <label>使用方法<input v-model="productForm[F('usage_en')]" class="admin-input"></label>
            </div>
            <div class="admin-form-grid">
              <label>卡片描述<textarea v-model="productForm[F('grid_desc_en')]" class="admin-input" rows="2"></textarea></label>
              <label>MOQ<input v-model="productForm[F('moq_en')]" class="admin-input"></label>
              <label>首页分类（空格分隔）<input v-model="productForm.ritual_categories" class="admin-input"></label>
              <label>首页标签<input v-model="productForm[F('ritual_tag_en')]" class="admin-input"></label>
              <label>首页卡片描述<textarea v-model="productForm[F('ritual_desc_en')]" class="admin-input" rows="2"></textarea></label>
            </div>
            <div v-if="productFormError" class="admin-error">{{ productFormError }}</div>
            <div class="admin-actions">
              <button class="admin-btn" @click="saveProduct" :disabled="saving">保存</button>
              <button class="admin-btn admin-btn-ghost" @click="closeProductForm">取消</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api/client';

const auth = useAuthStore();
const tab = ref('dashboard');
const loading = ref(true);
const stats = ref({});
const products = ref([]);
const orders = ref([]);
const orderFilter = ref('');
const selectedOrder = ref(null);
const orderItems = ref([]);
const inquiries = ref([]);
const orderStatuses = ['', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'];

// Product form modal
const productFormOpen = ref(false);
const editingProduct = ref(null);
const productForm = ref({});
const productFormError = ref('');
const saving = ref(false);

// Language tab for the bilingual product form: shows *_en or *_cn fields at a time.
const lang = ref('en');
const F = (enKey) => (lang.value === 'en' ? enKey : enKey.replace(/_en$/, '_cn'));

// Product image upload — posts the file to the backend, fills image_url with the returned path.
const uploading = ref(false);
const uploadImgInput = ref(null);
async function uploadImage(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = ''; // allow re-selecting the same file next time
  if (!file) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('image', file);
    const data = await api.post('/admin/products/upload-image', fd); // axios sets multipart boundary
    productForm.value.image_url = data.url;
  } catch (err) {
    productFormError.value = err.message;
  } finally {
    uploading.value = false;
  }
}

const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');
const statusLabels = {
  pending: '待付款', awaiting_confirmation: '待确认', confirmed: '已确认', paid: '已付款',
  shipped: '已发货', completed: '已完成', cancelled: '已取消', refunded: '已退款',
};
const statusLabel = (s) => statusLabels[s] || s;
const methodLabel = (m) => (m === 'paypal' ? 'PayPal' : '西联');

async function loadAll() {
  loading.value = true;
  try {
    const [statsData, productsData, ordersData, inquiriesData] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/products'),
      api.get('/admin/orders'),
      api.get('/admin/inquiries'),
    ]);
    stats.value = statsData;
    products.value = productsData.products || [];
    orders.value = ordersData.orders || [];
    inquiries.value = inquiriesData.inquiries || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
async function loadOrders() {
  const params = orderFilter.value ? `?order_status=${orderFilter.value}` : '';
  const data = await api.get(`/admin/orders${params}`);
  orders.value = data.orders || [];
}
function go(t) {
  tab.value = t;
  if (t === 'dashboard') loadAll();
  else if (t === 'products') loadProducts();
  else if (t === 'orders') loadOrders();
  else loadInquiries();
}
async function loadProducts() { const d = await api.get('/admin/products'); products.value = d.products || []; }
async function loadInquiries() { const d = await api.get('/admin/inquiries'); inquiries.value = d.inquiries || []; }

async function openOrder(orderNo) {
  const d = await api.get(`/admin/orders/${orderNo}`);
  selectedOrder.value = d.order;
  orderItems.value = d.items || [];
}
async function markPaid(orderNo) {
  await api.post(`/admin/orders/${orderNo}/mark-paid`);
  await openOrder(orderNo);
}
async function refund(orderNo) {
  if (!confirm('Refund this paid order?')) return;
  await api.post(`/admin/orders/${orderNo}/refund`);
  await openOrder(orderNo);
}
async function setStatus(orderNo, status) {
  await api.patch(`/admin/orders/${orderNo}/status`, { order_status: status });
  await openOrder(orderNo);
}
async function toggleInquiry(inquiry) {
  await api.patch(`/admin/inquiries/${inquiry.id}`, { status: inquiry.status === 'new' ? 'resolved' : 'new' });
  await loadInquiries();
}
function emptyForm() {
  return {
    slug: '', title_en: '', title_cn: '', category: 'face', category_en: '', category_cn: '',
    desc_en: '', desc_cn: '', grid_desc_en: '', grid_desc_cn: '',
    tag_en: '', tag_cn: '', active_en: '', active_cn: '',
    skin_en: '', skin_cn: '', usage_en: '', usage_cn: '',
    moq_en: 'Daily ritual', moq_cn: '日常护理', ritual_categories: '',
    ritual_desc_en: '', ritual_desc_cn: '', ritual_tag_en: '', ritual_tag_cn: '',
    price: 0, stock: 0, image_url: '', status: 'active', featured: false, sort_order: 0,
  };
}
function openNewProduct() {
  editingProduct.value = null;
  productForm.value = emptyForm();
  productFormError.value = '';
  lang.value = 'en';
  productFormOpen.value = true;
}
function openProductForm(p) {
  editingProduct.value = p;
  lang.value = (p.title_en && p.title_en.trim()) ? 'en' : 'cn';
  productForm.value = {
    slug: p.slug, title_en: p.title_en, title_cn: p.title_cn, category: p.category,
    category_en: p.category_en, category_cn: p.category_cn,
    desc_en: p.desc_en, desc_cn: p.desc_cn, grid_desc_en: p.grid_desc_en, grid_desc_cn: p.grid_desc_cn,
    tag_en: p.tag_en, tag_cn: p.tag_cn, active_en: p.active_en, active_cn: p.active_cn,
    skin_en: p.skin_en, skin_cn: p.skin_cn, usage_en: p.usage_en, usage_cn: p.usage_cn,
    moq_en: p.moq_en, moq_cn: p.moq_cn, ritual_categories: p.ritual_categories,
    ritual_desc_en: p.ritual_desc_en, ritual_desc_cn: p.ritual_desc_cn,
    ritual_tag_en: p.ritual_tag_en, ritual_tag_cn: p.ritual_tag_cn,
    price: p.price_cents / 100, stock: p.stock, image_url: p.image_url,
    status: p.status, featured: p.featured, sort_order: p.sort_order,
  };
  productFormError.value = '';
  productFormOpen.value = true;
}
function closeProductForm() {
  productFormOpen.value = false;
  productFormError.value = '';
}
async function saveProduct() {
  productFormError.value = '';
  saving.value = true;
  try {
    const f = productForm.value;
    const payload = { ...f, price_cents: Math.round((f.price || 0) * 100) };
    if (editingProduct.value) {
      await api.put(`/admin/products/${editingProduct.value.id}`, payload);
    } else {
      await api.post('/admin/products', payload);
    }
    closeProductForm();
    await loadProducts();
  } catch (e) {
    productFormError.value = e.message;
  } finally {
    saving.value = false;
  }
}
/** 上架/下架：发送完整商品（保留所有字段），只切换 status。 */
async function toggleStatus(p) {
  const payload = {
    slug: p.slug, title_en: p.title_en, title_cn: p.title_cn, category: p.category,
    category_en: p.category_en, category_cn: p.category_cn,
    desc_en: p.desc_en, desc_cn: p.desc_cn, grid_desc_en: p.grid_desc_en, grid_desc_cn: p.grid_desc_cn,
    tag_en: p.tag_en, tag_cn: p.tag_cn, active_en: p.active_en, active_cn: p.active_cn,
    skin_en: p.skin_en, skin_cn: p.skin_cn, usage_en: p.usage_en, usage_cn: p.usage_cn,
    moq_en: p.moq_en, moq_cn: p.moq_cn, ritual_categories: p.ritual_categories,
    ritual_desc_en: p.ritual_desc_en, ritual_desc_cn: p.ritual_desc_cn,
    ritual_tag_en: p.ritual_tag_en, ritual_tag_cn: p.ritual_tag_cn,
    price_cents: p.price_cents, stock: p.stock, image_url: p.image_url,
    status: p.status === 'active' ? 'inactive' : 'active',
    featured: p.featured, sort_order: p.sort_order,
  };
  try {
    await api.put(`/admin/products/${p.id}`, payload);
    await loadProducts();
  } catch (e) {
    alert(e.message);
  }
}

async function logout() { await auth.logout(); }

onMounted(loadAll);
</script>

<style scoped>
.admin-app { font-family: 'Inter', system-ui, sans-serif; background: #f7f5f2; min-height: 100vh; color: #1f1f1f; }
.admin-topbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #fff; border-bottom: 1px solid #e6e2dc; }
.admin-brand { font-weight: 700; } .admin-brand span { color: #a8835c; }
.admin-topbar-right { display: flex; align-items: center; gap: 14px; }
.admin-link { color: #a8835c; text-decoration: none; }
.admin-nav { display: flex; gap: 4px; padding: 8px 24px; background: #fff; border-bottom: 1px solid #e6e2dc; }
.admin-nav button { border: 0; background: transparent; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-weight: 500; color: #6b6b6b; }
.admin-nav button.active { background: #1f1f1f; color: #fff; }
.admin-main { max-width: 1100px; margin: 24px auto; padding: 0 24px 60px; }
.admin-title { font-size: 20px; margin: 0 0 16px; }
.admin-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 20px; }
.admin-stat { background: #fff; border: 1px solid #e6e2dc; border-radius: 10px; padding: 16px 18px; }
.admin-stat-value { font-size: 24px; font-weight: 700; }
.admin-stat-label { color: #6b6b6b; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
.admin-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e6e2dc; border-radius: 10px; margin-top: 14px; }
.admin-table th, .admin-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e6e2dc; }
.admin-table th { font-size: 12px; text-transform: uppercase; color: #6b6b6b; }
.admin-row { cursor: pointer; } .admin-row:hover td { background: #fcfbf9; }
.admin-btn { padding: 9px 16px; border: 1px solid transparent; border-radius: 8px; background: #1f1f1f; color: #fff; font-weight: 600; cursor: pointer; }
.admin-btn-ghost { background: transparent; color: #1f1f1f; border-color: #d8d2ca; }
.admin-btn-danger { background: #b23a3a; }
.admin-btn-small { padding: 5px 11px; font-size: 13px; }
.admin-badge { display: inline-block; padding: 2px 9px; border-radius: 99px; font-size: 12px; background: #ecebe8; color: #6b6b6b; }
.admin-badge.active, .admin-badge.new, .admin-badge.paid, .admin-badge.completed { background: #e4f2ea; color: #2f7d4f; }
.admin-badge.shipped, .admin-badge.confirmed { background: #e7eefb; color: #2f5596; }
.admin-badge.pending, .admin-badge.awaiting_confirmation { background: #fdf0dc; color: #9a6a1f; }
.admin-badge.cancelled, .admin-badge.refunded, .admin-badge.inactive { background: #fbe7e7; color: #b23a3a; }
.admin-muted { color: #6b6b6b; font-size: 13px; }
.admin-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 16px 0; }
.admin-actions { display: flex; gap: 8px; margin: 14px 0; flex-wrap: wrap; }
.admin-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.admin-chip { padding: 6px 13px; border-radius: 99px; border: 1px solid #d8d2ca; background: #fff; cursor: pointer; }
.admin-chip.active { background: #1f1f1f; color: #fff; border-color: #1f1f1f; }

/* Product form modal */
.admin-overlay {
  position: fixed; inset: 0; z-index: 100; background: rgba(28, 26, 23, 0.45);
  display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 40px 16px;
}
.admin-modal {
  width: min(860px, 100%); background: #fff; border-radius: 12px; box-shadow: 0 24px 60px rgba(0,0,0,.25);
}
.admin-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px; border-bottom: 1px solid #e6e2dc;
}
.admin-modal-body { padding: 20px 22px 26px; }
.admin-lang-tabs { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; }
.admin-lang-tabs button {
  padding: 6px 16px; border-radius: 8px; border: 1px solid #d8d2ca; background: #fff;
  cursor: pointer; font-size: 12px; font-weight: 600; color: #6b6b6b;
}
.admin-lang-tabs button.active { background: #1f1f1f; color: #fff; border-color: #1f1f1f; }
.admin-lang-hint { margin-left: 8px; font-size: 12px; color: #a0a0a0; }
.admin-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin-bottom: 14px; }
.admin-form-grid label { display: block; font-size: 12px; font-weight: 600; color: #6b6b6b; text-transform: uppercase; letter-spacing: .4px; }
.admin-input {
  display: block; width: 100%; margin-top: 5px; padding: 8px 10px; border: 1px solid #d8d2ca;
  border-radius: 8px; font: inherit; font-size: 13px; text-transform: none;
}
.admin-input:focus { outline: 2px solid #d9c4a7; border-color: #a8835c; }
.admin-check { display: flex; align-items: center; gap: 8px; margin-top: 22px; }
.admin-check input { width: auto; }
.admin-upload-hidden { display: none; }
.admin-img-preview { position: relative; display: inline-block; cursor: pointer; overflow: hidden; }
.admin-img-preview img { display: block; }
.admin-img-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, .45); color: #fff; font-size: 12px; font-weight: 600;
  border-radius: 10px; opacity: 0; transition: opacity .15s;
}
.admin-img-preview:hover .admin-img-overlay { opacity: 1; }
.admin-img-overlay span { text-align: center; padding: 0 8px; }
.admin-error { margin: 0 0 12px; padding: 9px 13px; border: 1px solid #d9b3b3; background: #fdf1f1; color: #b23a3a; font-size: 13px; border-radius: 8px; }
.admin-thumb { width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid #e6e2dc; }
.admin-img-preview { margin-bottom: 14px; }
.admin-img-preview img { width: 120px; height: 120px; object-fit: cover; border-radius: 10px; border: 1px solid #e6e2dc; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
</style>
