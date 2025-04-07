import { defineStore } from 'pinia';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    accountId: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getAccountId: (state) => state.accountId
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(email, password);
        this.user = response;
        this.token = response.access_token;
        this.accountId = response.account_id;
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('accountId', response.account_id);
      } catch (error) {
        this.error = error.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.accountId = null;
      localStorage.removeItem('token');
      localStorage.removeItem('accountId');
    },

    initialize() {
      const token = localStorage.getItem('token');
      const accountId = localStorage.getItem('accountId');
      if (token && accountId) {
        this.token = token;
        this.accountId = accountId;
      }
    }
  }
}); 