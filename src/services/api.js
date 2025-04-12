import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Check if we're in production (GitHub Pages)
const isProduction = window.location.hostname.includes('github.io');

// Create two axios instances: one for login (with proxy) and one for regular API calls
const loginApi = axios.create({
  baseURL: isProduction 
    ? 'https://cors-proxy.swiftsensors.workers.dev/proxy/api/client'
    : import.meta.env.VITE_SWIFT_SENSORS_PROXY_API_URL,
  headers: {
    'X-API-Key': import.meta.env.VITE_SWIFT_SENSORS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Regular API calls go directly to the API in production
const api = axios.create({
  baseURL: isProduction 
    ? 'https://api.swiftsensors.net/api/client'
    : import.meta.env.VITE_SWIFT_SENSORS_PROXY_API_URL,
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
      // Use loginApi for sign-in
      const response = await loginApi.post('/v1/sign-in', {
        "email": email,
        "password": password
      });
      console.log("sign-in:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const accountService = {
  getAccountInfo: async (accountId) => {
    console.log("getAccountInfo:", accountId);
    try {
      const response = await api.get(`/v1/accounts/${accountId}`);
      console.log("getAccountInfo:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const sensorService = {
  getSensors: async (accountId) => {
    console.log("getSensors:", accountId);
    try {
      const response = await api.get(`/v2/accounts/${accountId}/sensors/visible`);
      console.log("getSensors:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const notificationService = {
  getNotifications: async (accountId) => {
    try {
      console.log("API: Getting notifications for account:", accountId);
      const response = await api.get(`/v2/accounts/${accountId}/notifications`);
      console.log("API: Notifications response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: Error getting notifications:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },
  
  getNotificationDetails: async (accountId, notificationId) => {
    try {
      console.log("API: Getting notification details:", { accountId, notificationId });
      const response = await api.get(`/v2/accounts/${accountId}/notifications/${notificationId}`);
      console.log("API: Notification details response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: Error getting notification details:", error.response?.data || error);
      throw error.response?.data || error;
    }
  }
};

export const deviceService = {
  getDevices: async (accountId) => {
    console.log("getDevices:", accountId);
    try {
      const response = await api.get(`/v1/accounts/${accountId}/deviceAll?includeSubAccounts=false`);
      console.log("getDevices:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}; 