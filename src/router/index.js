import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  authStore.initialize();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }
  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/dashboard';
  }
});

export default router; 