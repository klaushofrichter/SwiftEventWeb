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
        <h2 class="text-2xl font-bold text-gray-900">Metrics</h2>
        <div class="flex items-center space-x-4">
          <span v-if="lastUpdateTime" class="text-sm text-gray-500 text-right min-w-[150px]">
            Last update: {{ elapsedTime }}
          </span>
          <button
            @click="refreshSensors"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            :disabled="sensorsLoading"
            title="Refresh the metrics with the current measurements"
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
              <span class="text-2xl font-semibold text-gray-700">{{ formatSensorValue(sensor[6], sensor[3]) }}</span>
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
            <div v-if="sensorDetails[sensor[0]]?.eeCameraIds?.length" class="mt-2 pt-2 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">Associated Cameras:</p>
                <a 
                  :href="getEagleEyeHistoryUrl(sensorDetails[sensor[0]].eeCameraIds, sensor[4])"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="See the camera in the Eagle Eye Application"
                >
                  View with EEN
                </a>
              </div>
              <div class="mt-1 flex flex-wrap gap-2">
                <span 
                  v-for="cameraId in sensorDetails[sensor[0]].eeCameraIds" 
                  :key="cameraId"
                  @click="eagleEyeCameras ? handleCameraClick(cameraId, sensor[4]) : null"
                  class="px-2 py-1 text-xs rounded-full cursor-pointer"
                  :class="[
                    eagleEyeCameras 
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  ]"
                >
                  {{ eagleEyeCameras ? getCameraLabel(cameraId) : cameraId }}
                  <span v-if="!eagleEyeCameras" class="text-xs ml-1">(loading...)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Notification Settings</h2>
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
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold text-gray-900">{{ selectedNotification.name }}</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium text-gray-900">Description</h4>
                <p class="text-gray-600">{{ selectedNotification.description }}</p>
              </div>
              <div>
                <button
                  @click="testSelectedNotification"
                  :disabled="notificationTestLoading"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span v-if="notificationTestLoading" class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Test Alert...
                  </span>
                  <span v-else>Send Test Alert</span>
                </button>
              </div>
            </div>
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
        <p v-if="notificationTestError" class="mt-2 text-sm text-red-600">
          {{ notificationTestError }}
        </p>
      </div>
    </div>

    <!-- Eagle Eye Section -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Eagle Eye</h2>
      <div v-if="eagleEyeLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="eagleEyeError" class="text-red-500 text-center">
        {{ eagleEyeError }}
      </div>
      <div v-else class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center">
            <div class="flex-grow">
              <p class="text-sm text-gray-500">
                <span class="font-medium">Status: </span>
                <span :class="eagleEyeCreds?.success ? 'text-green-600' : 'text-red-600'">
                  {{ eagleEyeCreds?.success ? 'Connected' : 'Not Connected' }}
                </span>
              </p>
              <p v-if="eagleEyeCreds?.username" class="text-sm text-gray-500 mt-1">
                <span class="font-medium">Username: </span>
                {{ eagleEyeCreds.username }}
                <span 
                  class="ml-2 px-2 py-0.5 text-xs rounded-full"
                  :class="isCredentialValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ isCredentialValid ? 'valid' : 'unverified' }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Cameras Section -->
        <div v-if="isCredentialValid && eagleEyeCameras" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-3">Cameras</h3>
          <div v-if="eagleEyeCameras.length === 0" class="text-sm text-gray-500 text-center">
            No cameras found
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="camera in eagleEyeCameras" :key="camera.id" 
              @click="showCameraDetails(camera)"
              class="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <h4 class="font-medium text-gray-900">{{ camera.name }}</h4>
              <p class="text-sm text-gray-500 mt-1">ID: {{ camera.id }}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <a 
              :href="getEagleEyeHistoryUrl(eagleEyeCameras.slice(0, 4).map(cam => cam.id), Math.floor(Date.now() / 1000))"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Use the Eagle Eye Application for viewing the cameras"
            >
              {{ eagleEyeCameras.length <= 4 ? 'View all cameras with EEN' : 'View the first four cameras with EEN' }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera Details Modal -->
    <div
      v-if="selectedCamera"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      @click="closeCameraModal"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4"
        @click.stop
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold text-gray-900">{{ selectedCamera.name }}</h3>
          <button
            @click="closeCameraModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <p class="text-sm text-gray-600">
              <span class="font-medium">ID:</span> {{ selectedCamera.id }}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Time:</span> {{ formatDate(imageTimestamp) }}
            </p>
          </div>
          <div>
            <a 
              :href="getEagleEyeHistoryUrl([selectedCamera.id], imageTimestamp)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="See the camera in the Eagle Eye Application"
            >
              View with EEN
            </a>
          </div>
        </div>

        <!-- Camera Image Section -->
        <div class="mt-4">
          <div class="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
            <div v-if="cameraImageLoading" class="flex flex-col items-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p class="mt-2 text-sm text-gray-500">Loading image...</p>
            </div>
            <div v-else-if="cameraImageError" class="text-center">
              <p class="text-red-500">{{ cameraImageError }}</p>
              <button
                @click="showCameraDetails(selectedCamera)"
                class="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Try Again
              </button>
            </div>
            <img
              v-else-if="cameraImageBase64"
              :src="'data:image/png;base64,' + cameraImageBase64"
              :alt="selectedCamera.name"
              class="max-w-full max-h-[400px] w-auto h-auto object-contain"
            />
            <div v-else class="text-center text-gray-500">
              No image available
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Version Display -->
    <div class="mt-8 text-center">
      <p class="text-xs text-gray-400">
        Version {{ version }} ({{ lastCommit }})
        <span class="mx-1">·</span>
        <a href="https://github.com/klaushofrichter/SwiftEventWeb/blob/develop/README.md" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="text-indigo-600 hover:text-indigo-800">
          README
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { useDataStore } from '../stores/data';
import { useAuthStore } from '../stores/auth';
import { eagleEyeService, notificationService, sensorService } from '../services/api';
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
const notificationTestLoading = ref(false);
const notificationTestError = ref(null);
const lastUpdateTime = ref(null);
const elapsedTime = ref('');
let timer = null;

const devices = ref([]);
const notifications = ref([]);
const sensors = ref([]);
const sensorDetails = ref({});

const eagleEyeLoading = ref(false);
const eagleEyeError = ref(null);
const eagleEyeCreds = ref(null);
const eagleEyeTestResult = ref(null);
const eagleEyeCameras = ref(null);
const isCredentialValid = computed(() => {
  if (!eagleEyeCreds.value || !eagleEyeTestResult.value) return false;
  return eagleEyeTestResult.value.success && 
         eagleEyeTestResult.value.username === eagleEyeCreds.value.username;
});

const selectedCamera = ref(null);
const cameraImageLoading = ref(false);
const cameraImageError = ref(null);
const cameraImageBase64 = ref(null);
const imageTimestamp = ref(null);

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

const formatSensorValue = (value, unitId) => {
  if (unitId === 17) {
    return value === 1 ? 'Open' : 'Closed';
  }
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return value.toFixed(2);
  }
  return value;
};

const formatDateForEagleEye = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  // Convert to UTC string and format it
  const utcString = date.toISOString()
    .replace('T', ' ')     // Replace T with space
    .slice(0, -1)         // Remove the Z at the end
    + ' UTC';             // Add UTC identifier
  return utcString;
};

const getEagleEyeHistoryUrl = (cameraIds, timestamp) => {
  const formattedTime = formatDateForEagleEye(timestamp);
  const ids = cameraIds.join(',');
  return `https://webapp.eagleeyenetworks.com/#/history?ids=${ids}&time=${encodeURIComponent(formattedTime)}`;
};

const fetchData = async () => {
  // Reset all errors
  accountError.value = null;
  devicesError.value = null;
  sensorsError.value = null;
  notificationsError.value = null;
  eagleEyeError.value = null;

  // Set all loading states
  accountLoading.value = true;
  devicesLoading.value = true;
  sensorsLoading.value = true;
  notificationsLoading.value = true;
  eagleEyeLoading.value = true;

  // Run independent fetches in parallel
  await Promise.allSettled([
    // Account
    dataStore.fetchAccountInfo()
      .catch(err => { accountError.value = err.msg || 'Failed to fetch account information'; })
      .finally(() => { accountLoading.value = false; }),

    // Devices
    dataStore.fetchDevices()
      .then(() => { devices.value = dataStore.devices; })
      .catch(err => {
        devicesError.value = err.msg === 'Permission Denied'
          ? 'Your account may not be authorized to access this data'
          : err.msg || 'Failed to fetch devices';
      })
      .finally(() => { devicesLoading.value = false; }),

    // Sensors + details
    dataStore.fetchSensors()
      .then(async () => {
        sensors.value = dataStore.sensors;
        await Promise.all(sensors.value.map(sensor =>
          fetchSensorDetails(authStore.getAccountId, sensor[0])
        ));
        lastUpdateTime.value = Date.now();
        updateElapsedTime();
      })
      .catch(err => { sensorsError.value = err.msg || 'Failed to fetch sensors'; })
      .finally(() => { sensorsLoading.value = false; }),

    // Notifications
    dataStore.fetchNotifications()
      .then(() => { notifications.value = dataStore.notifications; })
      .catch(err => { notificationsError.value = err.msg || 'Failed to fetch notifications'; })
      .finally(() => { notificationsLoading.value = false; }),

    // Eagle Eye (creds -> test -> cameras is a sequential chain)
    (async () => {
      const accountId = authStore.getAccountId;
      const response = await eagleEyeService.creds(accountId);
      eagleEyeCreds.value = response;
      if (response.username) {
        const testResponse = await eagleEyeService.testCreds(accountId);
        eagleEyeTestResult.value = testResponse;
        if (testResponse.success) {
          await dataStore.fetchEagleEyeCameras();
          eagleEyeCameras.value = dataStore.eagleEyeCameras;
        }
      }
    })()
      .catch(err => { eagleEyeError.value = err.msg || 'Failed to fetch Eagle Eye credentials'; })
      .finally(() => { eagleEyeLoading.value = false; })
  ]);
};

let savedBodyOverflow = '';

const disableBodyScroll = () => {
  savedBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
};

const enableBodyScroll = () => {
  document.body.style.overflow = savedBodyOverflow;
};

const showNotificationDetails = async (notificationId) => {
  try {
    await dataStore.fetchNotificationDetails(notificationId);
    selectedNotification.value = dataStore.selectedNotification;
    disableBodyScroll();
  } catch (err) {
    notificationsError.value = err.msg || 'Failed to fetch notification details';
  }
};

const closeModal = () => {
  selectedNotification.value = null;
  dataStore.clearSelectedNotification();
  enableBodyScroll();
};

const updateElapsedTime = () => {
  if (!lastUpdateTime.value) {
    elapsedTime.value = '';
    return;
  }
  
  const now = Date.now();
  const diff = now - lastUpdateTime.value;
  const seconds = Math.floor(diff / 1000);
  
  let newText;
  if (seconds < 10) {
    newText = 'just now';
  } else if (seconds < 60) {
    const roundedSeconds = Math.round(seconds / 10) * 10;
    newText = `about ${roundedSeconds} seconds ago`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    newText = `about ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    const hours = Math.floor(seconds / 3600);
    newText = `about ${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (newText !== elapsedTime.value) {
    elapsedTime.value = newText;
  }
};

const fetchSensorDetails = async (accountId, sensorId) => {
  try {
    const details = await sensorService.getSensorDetails(accountId, sensorId);
    sensorDetails.value[sensorId] = details;
  } catch (err) {
    console.error(`Failed to fetch details for sensor ${sensorId}:`, err);
  }
};

const refreshSensors = async () => {
  sensorsError.value = null;
  sensorsLoading.value = true;
  // Hide the timer display while updating
  lastUpdateTime.value = null;
  try {
    // Fetch new data but keep current display
    await dataStore.fetchSensors();
    sensors.value = dataStore.sensors;
    
    // Fetch details for each sensor
    const fetchPromises = sensors.value.map(sensor => 
      fetchSensorDetails(authStore.getAccountId, sensor[0])
    );
    await Promise.all(fetchPromises);
    
    // Show the timer display again with new timestamp
    lastUpdateTime.value = Date.now();
    updateElapsedTime();
  } catch (err) {
    sensorsError.value = err.msg || 'Failed to fetch sensors';
  } finally {
    sensorsLoading.value = false;
  }
};

const showCameraDetails = async (camera, timestamp = null) => {
  selectedCamera.value = camera;
  cameraImageLoading.value = true;
  cameraImageError.value = null;
  cameraImageBase64.value = null;
  imageTimestamp.value = timestamp;
  disableBodyScroll();

  try {
    // Use provided timestamp or current time
    const currentTimestamp = timestamp || Math.floor(Date.now() / 1000);
    imageTimestamp.value = currentTimestamp;
    
    const base64Data = await eagleEyeService.getCameraImage(
      authStore.getAccountId,
      camera.id,
      currentTimestamp * 1000  // Convert to milliseconds
    );
    
    cameraImageBase64.value = base64Data;
  } catch (err) {
    cameraImageError.value = err.msg || 'Failed to fetch camera image';
  } finally {
    cameraImageLoading.value = false;
  }
};

const closeCameraModal = () => {
  selectedCamera.value = null;
  cameraImageError.value = null;
  cameraImageBase64.value = null;
  imageTimestamp.value = null;
  enableBodyScroll();
};

const testSelectedNotification = async () => {
  if (!selectedNotification.value) return;
  
  notificationTestLoading.value = true;
  notificationTestError.value = null;
  
  try {
    // The notification ID is in the first element of the array for list view
    // or in the id property for detail view
    const notificationId = selectedNotification.value.id || selectedNotification.value[0];
    
    await notificationService.testNotification(
      authStore.getAccountId,
      notificationId
    );
  } catch (err) {
    console.error("Test notification error", err);
    notificationTestError.value = err.msg || 'Failed to test notification';
  } finally {
    notificationTestLoading.value = false;
  }
};

const findCameraById = (cameraId) => {
  return eagleEyeCameras.value?.find(camera => camera.id === cameraId);
};

const getCameraLabel = (cameraId) => {
  const camera = findCameraById(cameraId);
  return camera?.name || cameraId;
};

const handleCameraClick = (cameraId, sensorTimestamp) => {
  const camera = findCameraById(cameraId);
  if (camera) {
    showCameraDetails(camera, sensorTimestamp);
  } else {
    console.warn(`Camera ${cameraId} not found in available cameras`);
  }
};

const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    if (selectedNotification.value) {
      closeModal();
    }
    if (selectedCamera.value) {
      closeCameraModal();
    }
  }
};

onMounted(() => {
  fetchData();
  // Start the timer to update elapsed time every second
  timer = setInterval(updateElapsedTime, 1000);
  // Add ESC key listener
  window.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  // Clean up the timer when component is unmounted
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  // Remove ESC key listener
  window.removeEventListener('keydown', handleEscKey);
  // Ensure body scroll is enabled when component is unmounted
  enableBodyScroll();
});
</script> 