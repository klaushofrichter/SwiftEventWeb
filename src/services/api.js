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
    'Content-Type': 'application/json'
  }
});

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include bearer token and API key for all requests
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    config.headers['X-API-Key'] = authStore.getApiKey;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();
    
    // If we get a 403 and we haven't already tried to refresh the token
    if (error.response?.status === 403 && !originalRequest._retry && authStore.refreshToken) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        console.log("Access token expired, attempting to refresh");
        const tokenData = await authService.refreshToken(authStore.refreshToken);
        
        // Update the tokens in the store
        authStore.setToken(tokenData.accessToken);
        authStore.setRefreshToken(tokenData.refreshToken);
        
        // Update the auth header and retry the request
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout the user
        console.error("Token refresh failed:", refreshError);
        authStore.logout();
        // Redirect to login page or show a session expired message
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor for login API to include API key
loginApi.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    config.headers['X-API-Key'] = authStore.getApiKey;
    console.log("loginApi config", config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await loginApi.post('/api/client/v1/sign-in', {
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
      const response = await loginApi.post('/api/token/v2/refresh', refreshToken, {
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const accountService = {
  getAccountInfo: async (accountId) => {
    try {
      const response = await api.get(`/api/client/v1/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const sensorService = {
  getSensors: async (accountId) => {
    try {
      const response = await api.get(`/api/client/v2/accounts/${accountId}/sensors/visible`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSensorDetails: async (accountId, sensorId) => {
    try {
      const response = await api.get(`/api/client/v2/accounts/${accountId}/sensors/${sensorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const notificationService = {
  getNotifications: async (accountId) => {
    try {
      const response = await api.get(`/api/client/v2/accounts/${accountId}/notifications`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getNotificationDetails: async (accountId, notificationId) => {
    try {
      const response = await api.get(`/api/client/v2/accounts/${accountId}/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  testNotification: async (accountId, notificationId) => {
    try {
      const response = await api.post(`/api/client/v1/accounts/${accountId}/notifications/${notificationId}/test`);
      return; // No response body needed as per API spec
    } catch (error) {
      console.error("testNotification error", error);
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  }
};

export const deviceService = {
  getDevices: async (accountId) => {
    try {
      const response = await api.get(`/api/client/v1/accounts/${accountId}/deviceAll?includeSubAccounts=false`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const eagleEyeService = {
  creds: async (accountId) => {
    try {
      const response = await api.get(`/api/client/v1/accounts/${accountId}/eagleeye/creds`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  testCreds: async (accountId) => {
    try {
      const response = await api.post(`/api/client/v1/accounts/${accountId}/eagleeye/creds/test`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCameras: async (accountId, refresh = false) => {
    try {
      const response = await api.get(`/api/client/v1/accounts/${accountId}/eagleeye/cameras`, {
        params: { refresh }
      });
      return response.data || null; // Return null if no cameras available
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCameraImage: async (accountId, cameraId, timestamp, refresh = false) => {
    try {
      const response = await api.get(`/api/client/v1/accounts/${accountId}/eagleeye/cameras/${cameraId}/image/${timestamp}`, {
        responseType: 'arraybuffer'  // Get raw binary data
      });

      // Convert array buffer to base64
      const base64 = btoa(
        new Uint8Array(response.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      return base64;  // Return base64 string directly
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}; 