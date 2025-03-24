<script setup lang="ts">
const props = defineProps<{
  heading: string;
}>();
</script>
<template>
  <h1 class="text-2xl ml-2">{{ props.heading }}</h1>
</template>
