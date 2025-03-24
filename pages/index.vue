<script setup lang="ts">
import { computed } from "vue";

const projectStore = useProjectStore();
const id = computed(() => projectStore.projectID);
</script>

<template>
  <p1></p1>
</template>
