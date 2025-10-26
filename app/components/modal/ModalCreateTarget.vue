<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "target-created"): void;
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value),
});

function handleSubmitSuccess() {
  emit("update:open", false); 
  emit("target-created"); 
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Create Target
      </h3>
    </template>
    <template #body>
      <div class="flex items-center justify-between">
        <UButton 
          color="gray" 
          variant="ghost" 
          icon="i-heroicons-x-mark-20-solid" 
          class="-my-1" 
          @click="isOpen = false" 
        />
      </div>

      <FormCreateTarget
        :unknown-target-range="true"
        @submit-success="handleSubmitSuccess"
      />
    </template>
  </UModal>
</template>