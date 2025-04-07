import { defineStore } from 'pinia';
import { sensorService, notificationService, deviceService } from '../services/api';
import { useAuthStore } from './auth';

export const useDataStore = defineStore('data', {
  state: () => ({
    sensors: [],
    devices: [],
    notifications: [],
    selectedNotification: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchSensors() {
      const authStore = useAuthStore();
      this.loading = true;
      this.error = null;
      try {
        const response = await sensorService.getSensors(authStore.accountId);
        this.sensors = response;
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
        this.notifications = response;
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