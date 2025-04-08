<script setup lang="ts">
import { ref } from "vue";
const open = ref(false);

defineShortcuts({
  o: () => (open.value = !open.value),
});

const props = defineProps<{
  moduleKey: string;
}>();

const handleSubmitSuccess = async () => {
  open.value = false;
};
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" title="Module Options">
    <UButton label="Run Module" color="primary" @click="open = true" />
    <template #body>
      <FormModuleRunOptions :module-key="props.moduleKey" />
    </template>
  </UModal>
</template>
