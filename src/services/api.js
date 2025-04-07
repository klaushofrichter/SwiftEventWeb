import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SWIFT_SENSORS_PROXY_API_URL,
  headers: {
    'X-API-Key': import.meta.env.VITE_SWIFT_SENSORS_API_KEY,
    'Content-Type': 'application/json'
  }
});

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/sign-in', {
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
    try {
      const response = await api.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const sensorService = {
  getSensors: async (accountId) => {
    try {
      const response = await api.get(`/accounts/${accountId}/sensors/visible`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export const notificationService = {
  getNotifications: async (accountId) => {
    try {
      const response = await api.get(`/accounts/${accountId}/notifications`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getNotificationDetails: async (accountId, notificationId) => {
    try {
      const response = await api.get(`/accounts/${accountId}/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}; 