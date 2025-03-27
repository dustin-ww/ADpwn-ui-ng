<script setup lang="ts">
const open = ref(false);

defineShortcuts({
  o: () => (open.value = !open.value),
});

const emit = defineEmits<{
  (e: "target-created"): void;
}>();

const handleSubmitSuccess = async () => {
  open.value = false;
  emit("target-created");
};
</script>

<template>
  <UModal :dismissible="false" title="Create Target">
    <UButton
      label="Create Target"
      color="success"
      variant="subtle"
      class="flex justify-center items-center mx-auto"
      @click="open = true"
    />
    <template #body>
      <FormCreateTarget @submit-success="handleSubmitSuccess" />
    </template>
  </UModal>
</template>
