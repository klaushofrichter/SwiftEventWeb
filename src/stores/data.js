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
    eagleEyeUsername: null,
    eagleEyeCameras: null
  }),

  actions: {
    async fetchAccountInfo() {
      const authStore = useAuthStore();
      if (!authStore.accountId) {
        throw new Error('No account ID available');
      }
      const response = await accountService.getAccountInfo(authStore.accountId);
      this.accountInfo = response;
    },

    async fetchSensors() {
      const authStore = useAuthStore();
      const response = await sensorService.getSensors(authStore.accountId);
      const accountKey = Object.keys(response)[0];

      if (response[accountKey] && Array.isArray(response[accountKey])) {
        this.sensors = response[accountKey];
      } else {
        this.sensors = [];
      }
    },

    async fetchNotifications() {
      const authStore = useAuthStore();
      const response = await notificationService.getNotifications(authStore.accountId);
      const accountKey = Object.keys(response)[0];

      if (response[accountKey] && Array.isArray(response[accountKey])) {
        this.notifications = response[accountKey];
      } else {
        this.notifications = [];
      }
    },

    async fetchNotificationDetails(notificationId) {
      const authStore = useAuthStore();
      const response = await notificationService.getNotificationDetails(authStore.accountId, notificationId);
      this.selectedNotification = response;
    },

    clearSelectedNotification() {
      this.selectedNotification = null;
    },

    async fetchDevices() {
      const authStore = useAuthStore();
      const response = await deviceService.getDevices(authStore.accountId);
      this.devices = Array.isArray(response) ? response : [];
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
        return;
      }
      const cameras = await eagleEyeService.getCameras(authStore.accountId, refresh);
      this.eagleEyeCameras = cameras;
    }
  }
});
