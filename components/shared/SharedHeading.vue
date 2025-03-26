<script setup lang="ts">
const props = defineProps<{
  heading: string;
}>();
</script>
<template>
  <h1 class="text-2xl ml-5 mt-2 pb-5">{{ props.heading }}</h1>
</template>
