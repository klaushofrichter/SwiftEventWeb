import { defineStore } from 'pinia';
import { sensorService, notificationService, deviceService, accountService } from '../services/api';
import { useAuthStore } from './auth';

export const useDataStore = defineStore('data', {
  state: () => ({
    sensors: [],
    devices: [],
    notifications: [],
    selectedNotification: null,
    accountInfo: null,
    loading: false,
    error: null
  }),

  getters: {
    getAccountInfo: (state) => state.accountInfo,
  },

  actions: {
    async fetchAccountInfo() {
      const authStore = useAuthStore();
      if (!authStore.accountId) {
        throw new Error('No account ID available');
      }
      
      this.loading = true;
      this.error = null;
      try {
        console.log("Fetching account info for accountId:", authStore.accountId);
        const response = await accountService.getAccountInfo(authStore.accountId);
        console.log("Account info response:", response);
        this.accountInfo = response;
      } catch (error) {
        console.error("Error fetching account info:", error);
        this.error = error.message || 'Failed to fetch account information';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchSensors() {
      const authStore = useAuthStore();
      this.loading = true;
      this.error = null;
      try {
        const response = await sensorService.getSensors(authStore.accountId);
        console.log("Raw sensors response:", response);
        
        // Get the first key from the response object (which should be the accountId)
        const accountKey = Object.keys(response)[0];
        console.log("Found account key:", accountKey);
        
        if (response[accountKey] && Array.isArray(response[accountKey])) {
          this.sensors = response[accountKey];
          console.log("Successfully stored sensors:", this.sensors);
        } else {
          console.warn("Invalid sensor data format:", response);
          this.sensors = [];
        }
      } catch (error) {
        console.error("Error fetching sensors:", error);
        this.error = error.message || 'Failed to fetch sensors';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchNotifications() {
      const authStore = useAuthStore();
      this.loading = true;
      this.error = null;
      try {
        console.log("Fetching notifications for account:", authStore.accountId);
        const response = await notificationService.getNotifications(authStore.accountId);
        console.log("Raw notifications response:", response);
        
        // Get the first key from the response object (which should be the accountId)
        const accountKey = Object.keys(response)[0];
        console.log("Found account key:", accountKey);
        
        if (response[accountKey] && Array.isArray(response[accountKey])) {
          this.notifications = response[accountKey];
          console.log("Successfully stored notifications:", this.notifications);
        } else {
          console.warn("Invalid notification data format:", response);
          this.notifications = [];
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        this.error = error.message || 'Failed to fetch notifications';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchNotificationDetails(notificationId) {
      const authStore = useAuthStore();
      this.loading = true;
      this.error = null;
      try {
        console.log("Fetching notification details for ID:", notificationId);
        const response = await notificationService.getNotificationDetails(authStore.accountId, notificationId);
        console.log("Notification details response:", response);
        this.selectedNotification = response;
      } catch (error) {
        console.error("Error fetching notification details:", error);
        this.error = error.message || 'Failed to fetch notification details';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearSelectedNotification() {
      this.selectedNotification = null;
    },

    async fetchDevices() {
      const authStore = useAuthStore();
      this.loading = true;
      this.error = null;
      try {
        const response = await deviceService.getDevices(authStore.accountId);
        console.log("Devices response:", response);
        this.devices = Array.isArray(response) ? response : [];
        console.log("Stored devices:", this.devices);
      } catch (error) {
        this.error = error.message || 'Failed to fetch devices';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 