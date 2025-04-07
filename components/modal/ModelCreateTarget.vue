<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

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
const items = [
  {
    label: 'Unknown Target Range',
    icon: 'i-lucide-user',
    slot: 'uknownTargetRange' as const
  },
  {
    label: 'Known Target',
    icon: 'i-lucide-lock',
    slot: 'knownTarget' as const
  }
] satisfies TabsItem[]
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
      <UTabs :items="items" variant="link" class="gap-4 w-full" :ui="{ trigger: 'flex-1' }">
      <template #uknownTargetRange="{ item }">
        <FormCreateTarget :unknown-target-range="true" @submit-success="handleSubmitSuccess" />
      </template>
      <template #knownTarget="{ item }">
        <FormCreateTarget :unknown-target-range="false" @submit-success="handleSubmitSuccess" />
      </template>
    </UTabs>
    </template>
  </UModal>
</template>
