<script setup lang="ts">
const isCreateModalOpen = ref(false);

useHead({
  title: "Targets • ADPwn",
});

function refetchTargets() {
  console.log("refetch targets");
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <SharedHeading heading="Manage Targets" />
      <UButton
        label="Create Target"
        color="success"
        variant="subtle"
        class="mr-10"
        @click="isCreateModalOpen = true"
      />
    </div>

    <ListTarget />

    <ModalCreateTarget
      v-model:open="isCreateModalOpen"
      @target-created="refetchTargets"
    />
  </div>
</template>
