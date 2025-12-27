<script setup lang="ts">
const isCreateModalOpen = ref(false);

useHead({
  title: "Users • RedPaths",
});

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <SharedHeading heading="Manage Users" />
      <ModalCreateUser class="mr-10" />
    </div>
    <div class="ml-5">
      <ListUsers />
    </div>
  </div>
</template>
