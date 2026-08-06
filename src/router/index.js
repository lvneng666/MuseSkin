import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/shop', name: 'shop', component: () => import('../views/ShopView.vue') },
  { path: '/cart', name: 'cart', component: () => import('../views/CartView.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('../views/CheckoutView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/account', name: 'account', component: () => import('../views/AccountView.vue') },
  { path: '/terms', name: 'terms', component: () => import('../views/TermsView.vue') },
  { path: '/privacy', name: 'privacy', component: () => import('../views/PrivacyView.vue') },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { admin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Admin routes require a logged-in admin.
router.beforeEach(async (to) => {
  if (to.meta.admin) {
    const auth = useAuthStore();
    if (!auth.user) {
      await auth.refresh();
    }
    if (!auth.user || auth.user.role !== 'admin') {
      return { name: 'home' };
    }
  }
  return true;
});

export default router;
