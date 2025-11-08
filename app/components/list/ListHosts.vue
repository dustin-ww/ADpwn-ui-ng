<script setup lang="ts">

import type { ADDomain } from "~/types/ad/ADDomain";
import type { ADHost } from "~/types/ad/ADHost";

const currentProjectStore = useCurrentProjectStore();
const domainStore = useDomainStore();

const hosts = ref<ADHost[]>([]);
// Fetch domains on component mount
onMounted(async () => {
  hosts.value = await domainStore.fetchDomainsWithHosts(currentProjectStore.uid, { skipCache: true });

console.log("Hosts:", hosts.value);
});

const tableData = computed(() =>
  hosts.value
    .flatMap(h => h.data ?? [])
    .map(host => ({
      uid: host.uid,
      ip: host.ip,
    }))
);



</script>

<template>
 <div>
  <UTable :data="tableData" class="flex-1" />
  </div>
</template>
