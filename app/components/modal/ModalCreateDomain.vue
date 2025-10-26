<script setup lang="ts">
const open = ref(false);
defineShortcuts({
  o: () => (open.value = !open.value),
});
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" title="Create Domain">
    <UButton
      label="Create Domain"
      color="success"
      variant="subtle"
      @click="open = true"
    />
    <template #body>
      <FormCreateDomain />
    </template>
  </UModal>
</template>
