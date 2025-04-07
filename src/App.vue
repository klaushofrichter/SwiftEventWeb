<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-800">SwiftSensors Dashboard</h1>
            </div>
          </div>
          <div class="flex items-center">
            <button
              v-if="isAuthenticated"
              @click="handleLogout"
              class="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
