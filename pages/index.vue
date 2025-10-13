<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import { computed } from "vue";
import { useCurrentProjectStore } from "~/stores/currentProject";

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
    <div class="bg-red-900 m-10 p-5 rounded-md">
      <h2 class="mt-5 text-3xl">Getting Started</h2>
    </div>
    <h2 class="mt-5 text-3xl">Features</h2>
    <div class="grid grid-cols-3 gap-4 m-10">
      <UCard class="bg-red-900">
        <template #header>
          <h1>Loading custom modules</h1>
        </template>
        <p>
          Automate attack vectors with self-written and highly extensible
          modules
        </p>
      </UCard>
      <UCard class="bg-red-900">
        <template #header>
          <h1>Graph-based automation of attack vectors</h1>
        </template>

        todo
      </UCard>
      <UCard class="bg-red-900">
        <template #header>
          <h1>Configure reusable collections to automate enumeration</h1>
        </template>
        todo
      </UCard>
    </div>
    <div class="grid grid-cols-3 gap-4 m-10">
      <UCard class="bg-red-900">
        <template #header>
          <h1>Change History of configured AD</h1>
        </template>
        todo
      </UCard>
      <UCard class="bg-red-900">
        <template #header>
          <h1>Network Graph of AD</h1>
        </template>

        todo
      </UCard>
      <UCard class="bg-red-900">
        <template #header>
          <h1>Loot Explorer</h1>
        </template>

        todo
      </UCard>
    </div>
  </div>
</template>
