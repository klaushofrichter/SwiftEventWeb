import { defineStore } from 'pinia';
import { sensorService, notificationService, deviceService, accountService, eagleEyeService } from '../services/api';
import { useAuthStore } from './auth';

export const useDataStore = defineStore('data', {
  state: () => ({
    sensors: [],
    devices: [],
    notifications: [],
    selectedNotification: null,
    accountInfo: null,
    loading: false,
    error: null,
    eagleEyeUsername: null,
    eagleEyeCameras: null
  }),

  getters: {
    getAccountInfo: (state) => state.accountInfo,
    getEagleEyeUsername: (state) => state.eagleEyeUsername,
    getEagleEyeCameras: (state) => state.eagleEyeCameras,
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
        const response = await accountService.getAccountInfo(authStore.accountId);
        this.accountInfo = response;
      } catch (error) {
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
        const accountKey = Object.keys(response)[0];
        
        if (response[accountKey] && Array.isArray(response[accountKey])) {
          this.sensors = response[accountKey];
        } else {
          this.sensors = [];
        }
      } catch (error) {
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
        const response = await notificationService.getNotifications(authStore.accountId);
        const accountKey = Object.keys(response)[0];
        
        if (response[accountKey] && Array.isArray(response[accountKey])) {
          this.notifications = response[accountKey];
        } else {
          this.notifications = [];
        }
      } catch (error) {
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
        const response = await notificationService.getNotificationDetails(authStore.accountId, notificationId);
        this.selectedNotification = response;
      } catch (error) {
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
        this.devices = Array.isArray(response) ? response : [];
      } catch (error) {
        this.error = error.message || 'Failed to fetch devices';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearEagleEyeUsername() {
      this.eagleEyeUsername = null;
    },

    clearEagleEyeCameras() {
      this.eagleEyeCameras = null;
    },

    async fetchEagleEyeCameras(refresh = false) {
      const authStore = useAuthStore();
      if (!authStore.accountId) {
        console.error('No account ID available');
        return;
      }

      try {
        this.loading = true;
        this.error = null;
        const cameras = await eagleEyeService.getCameras(authStore.accountId, refresh);
        this.eagleEyeCameras = cameras;
      } catch (error) {
        console.error('Error fetching Eagle Eye cameras:', error);
        this.error = error.message || 'Failed to fetch Eagle Eye cameras';
        this.eagleEyeCameras = null;
      } finally {
        this.loading = false;
      }
    }
  }
}); 