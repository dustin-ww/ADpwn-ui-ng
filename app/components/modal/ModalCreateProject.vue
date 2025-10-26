<script setup lang="ts">
import { ref } from "vue";
const open = ref(false);

defineShortcuts({
  o: () => (open.value = !open.value),
});

const emit = defineEmits<{
  (e: "project-created"): void;
}>();

const handleSubmitSuccess = async () => {
  open.value = false;
  emit("project-created");
};
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" title="Create Project">
    <UButton
      label="Create Project"
      color="success"
      variant="subtle"
      @click="open = true"
    />
    <template #body>
      <FormCreateProject @submit-success="handleSubmitSuccess" />
    </template>
  </UModal>
</template>
