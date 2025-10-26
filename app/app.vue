<template>
  <UApp>
    <!-- Health Check Overlay -->
    <div
      v-if="isChecking"
      class="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[9999] transition-opacity duration-300"
      :class="{ 'opacity-0': fadeOut }"
    >
      <!-- Loading State -->
      <div v-if="!showError" class="flex flex-col items-center">
        <svg class="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div class="text-lg text-white font-medium">Checking server connection...</div>
      </div>

      <!-- Error State -->
      <div v-else class="max-w-md mx-auto px-6 text-center">
        <div class="bg-red-500/10 border-2 border-red-500 rounded-lg p-8">
          <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 class="text-2xl font-bold text-white mb-2">{{ errorTitle }}</h2>
          <p class="text-gray-300 mb-6">{{ errorMessage }}</p>
          <button
            class="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            @click="retry"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>

    <!-- Main App Content -->
    <div :class="{ 'opacity-0 pointer-events-none': isChecking }">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<script setup>
import { useServerApi } from './composables/api/useServerApi';

const isChecking = ref(true);
const fadeOut = ref(false);
const showError = ref(false);
const errorTitle = ref('');
const errorMessage = ref('');

const checkHealth = async () => {
  const api = useServerApi();
  
  showError.value = false;
  fadeOut.value = false;
  
  try {
    // 10 seconds timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 10000);
    });

    const health = await Promise.race([
      api.getHealth(),
      timeoutPromise
    ]);

    console.log("Health check response:", health);

    if (health?.data?.message === "hello" && !health.error) {
      console.log("Server health check passed:", health.data.message);
      // Success - close overlay
      fadeOut.value = true;
      setTimeout(() => {
        isChecking.value = false;
      }, 300);
    } else {
      console.warn("Server seems to be offline or unhealthy");
      errorTitle.value = "Server Warning";
      errorMessage.value = "Backend server may be experiencing issues. The application may not work correctly.";
      showError.value = true;
    }
  } catch (error) {
    console.error("Failed server healthcheck:", error);

    if (error.message === 'TIMEOUT') {
      errorTitle.value = "Connection Timeout";
      errorMessage.value = "Server did not respond within 10 seconds. Please check your ADpwn server instance.";
    } else {
      errorTitle.value = "Server Offline";
      errorMessage.value = "Cannot connect to backend server. Please ensure the server is running.";
    }
    
    showError.value = true;
  }
}; 

const retry = () => {
  checkHealth();
};

onMounted(() => {
  checkHealth();
});
</script>