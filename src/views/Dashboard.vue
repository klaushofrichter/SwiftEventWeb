<template>
  <div class="space-y-6">
    <!-- Account Information Section -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Account Information</h2>
      <div v-if="accountLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="accountError" class="text-red-500 text-center">
        {{ accountError }}
      </div>
      <div v-else class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-medium text-gray-900">{{ accountInfo?.accountName }}</h3>
        <div class="mt-2 space-y-1">
          <p class="text-sm text-gray-500">Created: {{ formatDate(accountInfo?.creationTime) }}</p>
          <p class="text-sm text-gray-500">Time Zone: {{ accountInfo?.timeZone?.timeZoneId }} ({{ accountInfo?.timeZone?.offsetDisplay }})</p>
          <p class="text-sm text-gray-500">Email: {{ authStore.getUserEmail }}</p>
        </div>
      </div>
    </div>

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
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Sensors</h2>
        <div class="flex items-center space-x-4">
          <span v-if="lastUpdateTime" class="text-sm text-gray-500">
            Last update: {{ elapsedTime }}
          </span>
          <button
            @click="refreshSensors"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            :disabled="sensorsLoading"
          >
            <span v-if="sensorsLoading" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating
            </span>
            <span v-else>Update</span>
          </button>
        </div>
      </div>
      <div v-if="sensorsError" class="text-red-500 text-center">
        {{ sensorsError }}
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div v-for="sensor in sensors" :key="sensor[0]" 
          class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">{{ sensor[1] }}</h3>
              <p class="text-sm text-gray-500">{{ sensor[2] }}</p>
            </div>
            <span 
              class="px-2 py-1 text-xs rounded-full"
              :class="sensor[9] ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
            >
              {{ sensor[9] ? 'Alert' : 'Normal' }}
            </span>
          </div>
          <div class="mt-4">
            <div class="flex items-baseline">
              <span class="text-2xl font-semibold text-gray-700">{{ formatSensorValue(sensor[6]) }}</span>
              <span class="ml-1 text-gray-500">{{ getUnit(sensor[3]) }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Updated: {{ formatDate(sensor[4]) }}</p>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-200">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Interval:</span>
              <span class="text-gray-700">{{ sensor[5] }}s</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-gray-500">Status:</span>
              <span class="text-gray-700">{{ sensor[7] === 1 ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Notifications</h2>
      </div>
      <div v-if="notificationsLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="notificationsError" class="text-red-500 text-center">
        {{ notificationsError }}
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="notification in notifications"
          :key="notification[0]"
          @click="showNotificationDetails(notification[0])"
          class="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">{{ notification[1] }}</h3>
              <p class="text-sm text-gray-500 mt-1">ID: {{ notification[0] }}</p>
            </div>
            <span 
              class="px-2 py-1 text-xs rounded-full"
              :class="notification[4] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ notification[4] ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
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

    <!-- Version Display -->
    <div class="mt-8 text-center">
      <p class="text-xs text-gray-400">Version {{ version }} ({{ lastCommit }})</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';
import packageJson from '../../package.json';

const version = packageJson.version;
const lastCommit = packageJson["last-commit"];

const dataStore = useDataStore();
const authStore = useAuthStore();

const accountLoading = ref(false);
const accountError = ref(null);
const accountInfo = computed(() => dataStore.accountInfo);
const devicesLoading = ref(false);
const sensorsLoading = ref(false);
const notificationsLoading = ref(false);
const devicesError = ref(null);
const sensorsError = ref(null);
const notificationsError = ref(null);
const selectedNotification = ref(null);
const lastUpdateTime = ref(null);
const elapsedTime = ref('');
let timer = null;

const devices = ref([]);
const notifications = ref([]);
const sensors = ref([]);

const getUnit = (unitId) => {
  const units = {
    1: '°C',  // Dew Point
    2: '°C',  // Temperature
    4: '%',   // Humidity
    17: '',   // Door
  };
  return units[unitId] || '';
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Never';
  return new Date(timestamp * 1000).toLocaleString();
};

const formatSensorValue = (value) => {
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return value.toFixed(2);
  }
  // For door sensors
  if (value === 0 || value === 1) {
    return value === 1 ? 'Open' : 'Closed';
  }
  return value;
};

const fetchData = async () => {
  // Reset all errors
  accountError.value = null;
  devicesError.value = null;
  sensorsError.value = null;
  notificationsError.value = null;
  
  // Fetch account information
  accountLoading.value = true;
  try {
    await dataStore.fetchAccountInfo();
  } catch (err) {
    accountError.value = err.msg || 'Failed to fetch account information';
  } finally {
    accountLoading.value = false;
  }

  // Fetch devices
  devicesLoading.value = true;
  try {
    await dataStore.fetchDevices();
    devices.value = dataStore.devices;
  } catch (err) {
    if(err.msg === 'Permission Denied') {
      devicesError.value = 'Your account may not be authorized to access this data';
    } else {
      devicesError.value = err.msg || 'Failed to fetch devices';
    }
  } finally {
    devicesLoading.value = false;
  }

  // Fetch sensors
  sensorsLoading.value = true;
  try {
    await dataStore.fetchSensors();
    sensors.value = dataStore.sensors;
    // Set lastUpdateTime when sensors are first loaded
    lastUpdateTime.value = Date.now();
    updateElapsedTime();
  } catch (err) {
    sensorsError.value = err.msg || 'Failed to fetch sensors';
  } finally {
    sensorsLoading.value = false;
  }

  // Fetch notifications
  notificationsLoading.value = true;
  try {
    await dataStore.fetchNotifications();
    notifications.value = dataStore.notifications;
  } catch (err) {
    notificationsError.value = err.msg || 'Failed to fetch notifications';
  } finally {
    notificationsLoading.value = false;
  }
};

const showNotificationDetails = async (notificationId) => {
  try {
    await dataStore.fetchNotificationDetails(notificationId);
    selectedNotification.value = dataStore.selectedNotification;
  } catch (err) {
    notificationsError.value = err.msg || 'Failed to fetch notification details';
  }
};

const closeModal = () => {
  selectedNotification.value = null;
  dataStore.clearSelectedNotification();
};

const updateElapsedTime = () => {
  if (!lastUpdateTime.value) {
    elapsedTime.value = '';
    return;
  }
  
  const now = Date.now();
  const diff = now - lastUpdateTime.value;
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 10) {
    elapsedTime.value = 'just now';
  } else if (seconds < 60) {
    // Round to nearest 10 seconds
    const roundedSeconds = Math.round(seconds / 10) * 10;
    elapsedTime.value = `about ${roundedSeconds} seconds ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    elapsedTime.value = `about ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    const hours = Math.floor(seconds / 3600);
    elapsedTime.value = `about ${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
};

const refreshSensors = async () => {
  sensorsError.value = null;
  sensorsLoading.value = true;
  // Hide the timer display while updating
  lastUpdateTime.value = null;
  try {
    // Fetch new data but keep current display
    const newSensors = await dataStore.fetchSensors();
    // Only update display after successful fetch
    sensors.value = dataStore.sensors;
    // Show the timer display again with new timestamp
    lastUpdateTime.value = Date.now();
    updateElapsedTime();
  } catch (err) {
    sensorsError.value = err.msg || 'Failed to fetch sensors';
  } finally {
    sensorsLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
  // Start the timer to update elapsed time every second
  timer = setInterval(updateElapsedTime, 1000);
});

onUnmounted(() => {
  // Clean up the timer when component is unmounted
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script> 