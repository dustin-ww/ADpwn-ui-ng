<script setup lang="ts">
const items = ref(['Backlog', 'Todo', 'In Progress', 'Done'])
</script>
<template>
  <div>
    <div class="grid grid-cols-2">
      <SharedHeading heading="Module Dependency Graph" />
      <span class="justify-self-end">Click on Node to Run Module</span>
    </div>
    <USelectMenu placeholder="Select targer module" v-model="value" :items="items" />
    <GraphADPwnModuleDependencies class="w-full h-full" />
  </div>
</template>
