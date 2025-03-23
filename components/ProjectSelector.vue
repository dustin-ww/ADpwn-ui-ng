<script setup lang="ts">
const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.project.name)
</script>

<template>
  <div class="flex justify-evenly place-content-center mt-3">
    <NuxtLink to="/start" class="ml-2">
        <UBadge class="mr-2" color="primary" label="Current Project" variant="outline"/>
        <UBadge color="primary" :label="currentProject" />
    </NuxtLink>
  </div>
</template>