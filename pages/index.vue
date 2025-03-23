<script setup lang="ts">
import { computed } from "vue";

const projectStore = useProjectStore();
const id = computed(() => projectStore.projectID);
</script>

<template>
  <h1>/ {{ id }}</h1>
</template>
