<script setup lang="ts">
useHead({
  title: "ADDomains • ADPwn",
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <SharedHeading heading="Manage Domains" />
      <ModalCreateDomain class="mr-10" />
    </div>
    <ListDomains />
  </div>
</template>
