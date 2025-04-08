import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_SWIFT_SENSORS_PROXY_API_URL,
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