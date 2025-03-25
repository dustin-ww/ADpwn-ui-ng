<script setup lang="ts">
import { computed } from "vue";

const projectStore = useProjectStore();
const id = computed(() => projectStore.projectID);
const name = computed(() => projectStore.projectName);
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
  </div>
</template>
