import { defineStore } from 'pinia';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    accountId: null,
    tokenExpiresAt: null,
    refreshTimer: null,
    email: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getAccountId: (state) => state.accountId,
    isTokenExpired: (state) => {
      if (!state.tokenExpiresAt) return true;
      return Date.now() >= state.tokenExpiresAt;
    },
    getUserEmail: (state) => state.email
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(email, password);
        this.user = response;
        this.token = response.access_token;
        this.refreshToken = response.refresh_token;
        this.accountId = response.account_id;
        this.email = email;
        
        // Calculate token expiration time
        const expiresIn = response.expires_in; // seconds until expiration
        this.tokenExpiresAt = Date.now() + (expiresIn * 1000); // convert to milliseconds
        
        // Store in localStorage
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('accountId', response.account_id);
        localStorage.setItem('tokenExpiresAt', this.tokenExpiresAt.toString());
        localStorage.setItem('email', email);

        // Start refresh timer
        this.startRefreshTimer();
      } catch (error) {
        this.error = error.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        console.warn('No refresh token available');
        this.logout();
        return;
      }

      try {
        //console.log('Refreshing access token');
        const response = await authService.refreshToken(this.refreshToken);
        this.token = response.access_token;
        this.refreshToken = response.refresh_token;
        this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);

        // Update localStorage
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('tokenExpiresAt', this.tokenExpiresAt.toString());
        //console.log('Access token refreshed successfully');

        // Restart refresh timer
        this.startRefreshTimer();
      } catch (error) {
        console.error('Token refresh failed:', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          }
        });
        this.logout();
      }
    },

    startRefreshTimer() {

      // Clear any existing timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }

      // Calculate time until refresh (1 hour before expiration)
      const timeUntilRefresh = this.tokenExpiresAt - Date.now() - (60 * 60 * 1000); // 1 hour in milliseconds
      //const timeUntilRefresh = (1 * 60 * 1000); // 1 minute for testing in milliseconds
      //console.log('Time until refresh:', timeUntilRefresh);

      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshAccessToken();
        }, timeUntilRefresh);
      } else {
        // If less than 1 hour until expiration, refresh immediately
        this.refreshAccessToken();
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.accountId = null;
      this.tokenExpiresAt = null;
      this.email = null;
      
      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accountId');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('email');
    },

    initialize() {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const accountId = localStorage.getItem('accountId');
      const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
      const email = localStorage.getItem('email');
      
      if (token && refreshToken && accountId && tokenExpiresAt) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.accountId = accountId;
        this.tokenExpiresAt = parseInt(tokenExpiresAt);
        this.email = email;
        
        // If token is expired, try to refresh it
        if (this.isTokenExpired) {
          this.refreshAccessToken();
        } else {
          // Start refresh timer
          this.startRefreshTimer();
        }
      }
    }
  }
}); 