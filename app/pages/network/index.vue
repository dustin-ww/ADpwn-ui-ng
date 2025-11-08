<script setup lang="ts">
useHead({
  title: "Network Manager • ADPwn",
});
</script>

<template>
  <div class="size-full">
    <div class="flex items-center justify-between mb-4">
      <SharedHeading heading="Network Explorer" />
      <UButton>
       <NuxtLink to="/network/ratel">Ratel Explorer</NuxtLink>
      </UButton>
    </div>
    <div class="size-full">
      <GraphNetwork />
    </div>
  </div>
</template>
