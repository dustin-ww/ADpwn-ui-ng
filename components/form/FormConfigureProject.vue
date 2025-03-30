<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { projectUpdateSchema } from "~/schemas/project";
import { useCurrentProjectStore } from "~/stores/currentProject";

const currentProjectStore = useCurrentProjectStore();
const toast = useToast();
const isLoading = ref(false);

const formState = reactive({
  name: currentProjectStore.name,
  description: currentProjectStore.description || "",
});

const handleSubmit = async (_: FormSubmitEvent<typeof formState>) => {
  try {
    isLoading.value = true;

    await currentProjectStore.updateProject({
      name: formState.name,
      description: formState.description,
    });

    toast.add({
      title: "Project updated",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    toast.add({
      title: "Error while updating project",
      description:
        error instanceof Error ? error.message : "Unbekannter Fehler",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <UForm
    :schema="projectUpdateSchema"
    :state="formState"
    class="space-y-4 grid justify-items-center w-full h-full pb-10"
    @submit="handleSubmit"
  >
    <UFormField label="UID" name="uid" class="w-1/2">
      <UInput :model-value="currentProjectStore.uid" class="w-full" disabled />
    </UFormField>

    <UFormField label="Name" name="name" class="w-1/2">
      <UInput v-model="formState.name" class="w-full" placeholder="Name" />
    </UFormField>

    <UFormField label="Description" name="description" class="w-1/2">
      <UTextarea
        v-model="formState.description"
        class="w-full"
        placeholder="This is a cool description..."
        :rows="5"
      />
    </UFormField>

    <UButton
      type="submit"
      :loading="isLoading"
      class="w-1/2 min-h-10"
      variant="solid"
      color="primary"
    >
      Projekt aktualisieren
    </UButton>
  </UForm>
</template>
