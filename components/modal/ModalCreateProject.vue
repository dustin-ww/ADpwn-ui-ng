<script setup lang="ts">
import { ref } from "vue";
const open = ref(false);

defineShortcuts({
  o: () => (open.value = !open.value),
});

const emit = defineEmits<{
  (e: "project-created"): void;
}>();

const handleSubmitSuccess = () => {
  open.value = false;
  emit("project-created");
};
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" title="Create Project">
    <UButton label="Create Project" color="success" variant="subtle" />
    <template #body>
      <FormCreateProject :projects @submit-success="handleSubmitSuccess" />
    </template>
  </UModal>
</template>
