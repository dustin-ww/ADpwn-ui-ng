<script setup>
const isReady = ref(false)

onMounted(() => {
  const project = useCurrentProjectStore()
  
  watch(() => project.isHydrated, (hydrated) => {
    if (hydrated) {
      isReady.value = true
    }
  }, { immediate: true })
})

if (import.meta.server) {
  isReady.value = true
}
</script>

<template>
  <UApp>
    <NuxtLayout>
      <div v-if="!isReady" class="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Lädt...</p>
      </div>
    </div>
      <NuxtPage v-else />
    </NuxtLayout>
  </UApp>
</template>
