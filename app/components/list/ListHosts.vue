<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

const currentProjectStore = useCurrentProjectStore();
const { fetchDomainsWithHosts, enrichedHosts } = useDomainHostData();

const isLoading = ref(true);

// Table columns definition
const columns: TableColumn[] = [
  {
    accessorKey: "uid",
    header: "UID",
  },
  {
    accessorKey: "ip",
    header: "IP Address",
  },
  {
    accessorKey: "domainName",
    header: "Domain",
  },
];

// Fetch domains with hosts on component mount
onMounted(async () => {
  isLoading.value = true;
  await fetchDomainsWithHosts(currentProjectStore.uid);
  isLoading.value = false;
});

// Computed table data from enriched hosts
const tableData = computed(() =>
  enrichedHosts.value.map((host) => ({
    uid: host.uid,
    ip: host.ip,
    domainName: host.domain?.name ?? "-",
  }))
);
</script>

<template>
  <div>
    <UTable 
      :data="tableData" 
      :columns="columns"
      :loading="isLoading"
      class="flex-1" 
    />
  </div>
</template>