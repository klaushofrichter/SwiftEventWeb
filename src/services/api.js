import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// In production (GitHub Pages), we use the direct API host
// In development, we use the proxy URL
const baseURL = import.meta.env.PROD 
  ? import.meta.env.VITE_SWIFT_SENSORS_API_HOST
  : import.meta.env.VITE_SWIFT_SENSORS_PROXY_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'X-API-Key': import.meta.env.VITE_SWIFT_SENSORS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include bearer token for all requests except sign-in
api.interceptors.request.use(
  (config) => {
    // Skip adding token for sign-in request
    if (config.url === '/v1/sign-in') {
      return config;
    }

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
      const response = await api.post('/v1/sign-in', {
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