<script setup lang="ts">
const open = ref(false);
defineShortcuts({
  o: () => (open.value = !open.value),
});
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" title="Create Host">
    <UButton
      label="Create Host"
      color="success"
      variant="subtle"
      @click="open = true"
    />
    <template #body>
      <FormCreateHost />
    </template>
  </UModal>
</template>
