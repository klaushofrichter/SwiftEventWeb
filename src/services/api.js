import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Check if we're in production (GitHub Pages)
const isProduction = window.location.hostname === import.meta.env.VITE_SWIFT_SENSORS_PROD_APP_DOMAIN;

// Base URL for all API calls
const baseURL = isProduction 
  ? import.meta.env.VITE_SWIFT_SENSORS_PROD_PROXY_API_URL
  : import.meta.env.VITE_SWIFT_SENSORS_PROXY_API_URL;

// Create two axios instances: one for login and one for authenticated requests
const loginApi = axios.create({
  baseURL,
  headers: {
    'X-API-Key': import.meta.env.VITE_SWIFT_SENSORS_API_KEY,
    'Content-Type': 'application/json'
  }
});

const api = axios.create({
  baseURL,
  headers: {
    'X-API-Key': import.meta.env.VITE_SWIFT_SENSORS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include bearer token for all requests
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await loginApi.post('/v1/sign-in', {
        "email": email,
        "password": password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const authStore = useAuthStore();
      const response = await loginApi.post('/refresh', refreshToken, {
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      console.log("refreshToken response", response);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const accountService = {
  getAccountInfo: async (accountId) => {
    try {
      const response = await api.get(`/v1/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const sensorService = {
  getSensors: async (accountId) => {
    try {
      const response = await api.get(`/v2/accounts/${accountId}/sensors/visible`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const notificationService = {
  getNotifications: async (accountId) => {
    try {
      const response = await api.get(`/v2/accounts/${accountId}/notifications`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getNotificationDetails: async (accountId, notificationId) => {
    try {
      const response = await api.get(`/v2/accounts/${accountId}/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const deviceService = {
  getDevices: async (accountId) => {
    try {
      const response = await api.get(`/v1/accounts/${accountId}/deviceAll?includeSubAccounts=false`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}; 