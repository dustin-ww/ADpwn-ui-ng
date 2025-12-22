<script setup lang="ts">
const open = ref(false);
defineShortcuts({
  o: () => (open.value = !open.value),
});
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" title="Create User">
    <UButton
      label="Create User"
      color="success"
      variant="subtle"
      @click="open = true"
    />
    <template #body>
      <FormCreateUser />
    </template>
  </UModal>
</template>
