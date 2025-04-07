<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Devices</h2>
      <div v-if="devicesLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="devicesError" class="text-red-500 text-center">
        {{ devicesError }}
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="device in devices" :key="device.id" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900">{{ device.name }}</h3>
          <p class="text-sm text-gray-500">Manufacturer: {{ device.manufacturer }}</p>
          <p class="text-sm text-gray-500">Model: {{ device.model }}</p>
          <p class="text-sm text-gray-700 mt-2">Last Seen: {{ formatDate(device.lastContactTime) }}</p>
          <p class="text-sm text-gray-700">Battery: {{ device.batteryLevel }}%</p>
          <p class="text-sm text-gray-700">Signal: {{ device.signalStrength }} dBm</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Sensors</h2>
      <div v-if="sensorsLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="sensorsError" class="text-red-500 text-center">
        {{ sensorsError }}
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="sensor in sensors" :key="sensor[0]" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900">{{ sensor[1] }}</h3>
          <p class="text-sm text-gray-500">{{ sensor[2] }}</p>
          <p class="text-sm text-gray-700 mt-2">Value: {{ sensor[6] }} {{ getUnit(sensor[3]) }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Notifications</h2>
        <button
          @click="refreshNotifications"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Refresh
        </button>
      </div>
      <div v-if="notificationsLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="notificationsError" class="text-red-500 text-center">
        {{ notificationsError }}
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification[0]"
          @click="showNotificationDetails(notification[0])"
          class="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100"
        >
          <h3 class="font-medium text-gray-900">{{ notification[1] }}</h3>
          <p class="text-sm text-gray-500">Status: {{ notification[4] ? 'Enabled' : 'Disabled' }}</p>
        </div>
      </div>
    </div>

    <!-- Notification Details Modal -->
    <div
      v-if="selectedNotification"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
        @click.stop
      >
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ selectedNotification.name }}</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">Description</h4>
            <p class="text-gray-600">{{ selectedNotification.description }}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">Notification Settings</h4>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p class="text-sm text-gray-600">Email: {{ selectedNotification.notifyViaEmail ? 'Enabled' : 'Disabled' }}</p>
                <p class="text-sm text-gray-600">SMS: {{ selectedNotification.notifyViaSms ? 'Enabled' : 'Disabled' }}</p>
                <p class="text-sm text-gray-600">Phone: {{ selectedNotification.notifyViaPhone ? 'Enabled' : 'Disabled' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status: {{ selectedNotification.isEnabled ? 'Active' : 'Inactive' }}</p>
                <p class="text-sm text-gray-600">Delay: {{ selectedNotification.delay }} minutes</p>
                <p class="text-sm text-gray-600">No Spam: {{ selectedNotification.noSpam }} minutes</p>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useDataStore } from '../stores/data';

const dataStore = useDataStore();
const devicesLoading = ref(false);
const sensorsLoading = ref(false);
const notificationsLoading = ref(false);
const devicesError = ref(null);
const sensorsError = ref(null);
const notificationsError = ref(null);
const selectedNotification = ref(null);

const sensors = ref([]);
const notifications = ref([]);
const devices = ref([]);

const getUnit = (unitId) => {
  const units = {
    1: '°C',
    4: '%',
    // Add more unit mappings as needed
  };
  return units[unitId] || '';
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Never';
  return new Date(timestamp * 1000).toLocaleString();
};

const fetchData = async () => {
  // Reset all errors
  devicesError.value = null;
  sensorsError.value = null;
  notificationsError.value = null;
  
  // Fetch devices
  devicesLoading.value = true;
  try {
    await dataStore.fetchDevices();
    devices.value = dataStore.devices;
    console.log("Dashboard devices:", devices.value);
  } catch (err) {
    devicesError.value = err.message || 'Failed to fetch devices';
  } finally {
    devicesLoading.value = false;
  }

  // Fetch sensors
  sensorsLoading.value = true;
  try {
    await dataStore.fetchSensors();
    sensors.value = dataStore.sensors;
  } catch (err) {
    sensorsError.value = err.message || 'Failed to fetch sensors';
  } finally {
    sensorsLoading.value = false;
  }

  // Fetch notifications
  notificationsLoading.value = true;
  try {
    await dataStore.fetchNotifications();
    notifications.value = dataStore.notifications;
  } catch (err) {
    notificationsError.value = err.message || 'Failed to fetch notifications';
  } finally {
    notificationsLoading.value = false;
  }
};

const refreshNotifications = async () => {
  notificationsLoading.value = true;
  notificationsError.value = null;
  try {
    await dataStore.fetchNotifications();
    notifications.value = dataStore.notifications;
  } catch (err) {
    notificationsError.value = err.message || 'Failed to refresh notifications';
  } finally {
    notificationsLoading.value = false;
  }
};

const showNotificationDetails = async (notificationId) => {
  try {
    await dataStore.fetchNotificationDetails(notificationId);
    selectedNotification.value = dataStore.selectedNotification;
  } catch (err) {
    notificationsError.value = err.message || 'Failed to fetch notification details';
  }
};

const closeModal = () => {
  selectedNotification.value = null;
  dataStore.clearSelectedNotification();
};

onMounted(() => {
  fetchData();
});
</script> 