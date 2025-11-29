<script setup lang="ts">
useHead({
  title: "Services • ADPwn",
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <SharedHeading heading="Manage Services" />
      <ModalCreateDomain class="mr-10" />
    </div>
    <ListDomains />
  </div>
</template>
