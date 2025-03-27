<script setup lang="ts">
import { computed } from "vue";
import { useCurrentProjectStore } from "~/stores/currentProject";

const currentProjectStore = useCurrentProjectStore();
const id = computed(() => currentProjectStore.getUID);
const name = computed(() => currentProjectStore.getName);
</script>

<template>
  <div class="text-center">
    <h1 class="text-5xl mt-20">Welcome to ADPwn</h1>
    <p class="mt-5">Current Loaded Project: {{ name }} ({{ id }})</p>
    <div class="grid grid-cols-3 gap-4 m-20">
      <UCard>
        <template #header>
          <h1>Enumerate</h1>
        </template>

        <Placeholder class="h-32" />

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
      <UCard>
        <template #header>
          <h1>Exploit</h1>
        </template>

        <Placeholder class="h-32" />

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
      <UCard>
        <template #header>
          <h1>Collect Loot</h1>
        </template>

        <Placeholder class="h-32" />

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
    </div>
    <div class="grid grid-cols-3 gap-4 m-20">
      <UCard>
        <template #header>
          <h1>ADPwnModules</h1>
        </template>

        <Placeholder class="h-32" />

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
      <UCard>
        <template #header>
          <h1>Network Graph</h1>
        </template>

        <Placeholder class="h-32" />

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
      <UCard>
        <template #header>
          <h1>Network Change History</h1>
        </template>

        <Placeholder class="h-32" />

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
    </div>
  </div>
</template>
