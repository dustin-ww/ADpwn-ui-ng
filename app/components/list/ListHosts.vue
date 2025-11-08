<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { ADHost } from "~/types/ad/ADHost";

const currentProjectStore = useCurrentProjectStore();
const domainStore = useDomainStore();

const hosts = ref<ADHost[]>([]);
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
  hosts.value = await domainStore.fetchDomainsWithHosts(
    currentProjectStore.uid,
    { skipCache: true }
  );
  console.log("Hosts:", hosts.value);
  isLoading.value = false;
});

const tableData = computed(() =>
  hosts.value.map((host) => ({
    uid: host.uid,
    ip: host.ip,
    domainName: host.belongsToDomainName ?? "-",
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