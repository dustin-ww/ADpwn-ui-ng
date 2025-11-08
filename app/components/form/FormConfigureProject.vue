<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { projectUpdateSchema } from "~/schemas/project";
import { useCurrentProjectStore } from "~/stores/currentProject";

const currentProjectStore = useCurrentProjectStore();
const toast = useToast();
const isLoading = ref(false);

const isDeleteModalOpen = ref(false)

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
  <div class="h-full">
    <UForm
      :schema="projectUpdateSchema"
      :state="formState"
      class="grid justify-items-center w-full gap-y-12"
      @submit="handleSubmit"
    >
      <UFormField label="UID" name="uid" class="w-1/2">
        <UInput
          :model-value="currentProjectStore.uid"
          class="w-full"
          disabled
        />
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

      <div class="mt-auto w-full flex justify-center text-center">
        <UButton
          type="submit"
          :loading="isLoading"
          class="w-1/2 flex items-center justify-center"
          variant="solid"
          color="primary"
        >
          Update Project
        </UButton>
      </div>
    </UForm>
    <div class="mt-4 w-full flex justify-center text-center">
      <UModal title="Do you really want to delete this project?" v-model:open="isDeleteModalOpen">
         <UButton
          class="w-1/2 flex items-center justify-center"
          variant="outline"
          color="primary"
        >
          Delete Project 
        </UButton>

        <template #body>
          <p>
            This action cannot be undone. All associated data will be permanently
            deleted.
          </p>
          <div class="mt-4 flex justify-end gap-4">
            <UButton color="neutral" variant="outline" @click="isDeleteModalOpen = false">Cancel</UButton>
            <UButton variant="solid" color="error" @click="isDeleteModalOpen = false">Delete</UButton>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>
