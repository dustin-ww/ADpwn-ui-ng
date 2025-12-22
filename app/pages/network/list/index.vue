<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Project Data Test</h1>
    
    <div class="mb-6 space-x-2">
      <button 
        @click="loadData"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Load All Data
      </button>
    </div>

    <div v-if="loading" class="text-blue-600">Loading...</div>
    <div v-if="error" class="text-red-600 mb-4">Error: {{ error }}</div>

    <div v-if="!loading && enrichedDomains.length > 0" class="space-y-4">
      <h2 class="text-xl font-semibold">Enriched Domains ({{ enrichedDomains.length }})</h2>
      
      <div 
        v-for="domain in enrichedDomains" 
        :key="domain.uid"
        class="border p-4 rounded"
      >
        <h3 class="font-bold">{{ domain.name || domain.uid }}</h3>
        <div class="ml-4 mt-2">
          <p class="text-sm text-gray-600">Hosts: {{ domain.hosts.length }}</p>
          <div 
            v-for="host in domain.hosts" 
            :key="host.uid"
            class="ml-4 mt-2 border-l-2 pl-2"
          >
            <p class="font-semibold">{{ host.name || host.uid }}</p>
            <p class="text-xs text-gray-500">Services: {{ host.services.length }}</p>
            <ul class="ml-4 text-sm">
              <li v-for="service in host.services" :key="service.uid">
                • {{ service.name || service.uid }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <h2 class="text-xl font-semibold mt-8">Orphaned Hosts ({{ orphanedHosts.length }})</h2>
      <div 
        v-for="host in orphanedHosts" 
        :key="host.uid"
        class="border p-4 rounded bg-yellow-50"
      >
        <p class="font-semibold">{{ host.name || host.uid }}</p>
        <p class="text-xs text-gray-500">Services: {{ host.services.length }}</p>
      </div>
    </div>

    <pre v-if="!loading && enrichedDomains.length > 0" class="mt-8 p-4 bg-gray-100 rounded text-xs overflow-auto">
{{ JSON.stringify({ enrichedDomains, orphanedHosts }, null, 2) }}
    </pre>
  </div>
</template>

<script lang="ts" setup>
const projectUID = useCurrentProjectStore().getUID 

const { 
  fetchProjectHierarchy, 
  enrichedDomains, 
  orphanedHosts 
} = useProjectData();

const loading = ref(false);
const error = ref('');

const loadData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await fetchProjectHierarchy(projectUID, {
      includeDomains: true,
      includeHosts: true,
      includeServices: true,
      skipCache: true,
    });
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
</style>