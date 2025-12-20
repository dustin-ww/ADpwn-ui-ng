<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import { computed } from "vue";
import { useCurrentProjectStore } from "~/stores/currentProjectStore";

const currentProjectStore = useCurrentProjectStore();
const id = computed(() => currentProjectStore.getUID);
const name = computed(() => currentProjectStore.getName);

const items = ref<StepperItem[]>([
  {
    slot: "domain",
    title: "Targets",
    description: "Add Targets",
    icon: "i-lucide-house",
  },
  {
    slot: "host",
    title: "AD Configuration",
    description: "Add known AD Hosts, Users, Services and Domains",
    icon: "i-lucide-truck",
  },
  {
    slot: "users",
    title: "Run Module",
    description: "Run ADPwn Modules or Collections",
  },
  {
    slot: "services",
    title: "Analyze Results",
    description: "Like Network Graphs or Change Histories",
  },
  {
    slot: "services",
    title: "Collect Loot",
    description: "In well organized structures",
  },
]);
</script>

<template>
  <div class="text-center">
    <h1 class="text-5xl mt-20">Welcome to ADPwn</h1>
    <p class="mt-5">Current Loaded Project: {{ name }} ({{ id }})</p>

  </div>
</template>
