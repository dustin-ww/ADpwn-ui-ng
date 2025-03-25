<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import { projectCreateSchema } from "~/schemas/project";

const projectCreateState = reactive({
  name: "",
  description: "",
});

const projectApi = useProjectsApi();
const toast = useToast();
const isLoading = ref(false);
const emit = defineEmits<{
  (e: "submit-success"): void;
}>();

async function onSubmit(_event: FormSubmitEvent<typeof projectCreateSchema>) {
  isLoading.value = true;

  try {
    const { error } = await projectApi.createProject(projectCreateState);
    
    if (error) {
      toast.add({
        title: "Error",
        description: error.message || "Project creation failed",
        color: "error",
      });
      return;
    }

    toast.add({
      title: "Success",
      description: "Project created successfully",
      color: "success",
    });

    projectCreateState.name = "";
    projectCreateState.description = "";
    
    emit("submit-success");
  } catch (e) {
    toast.add({
      title: "Error",
      description: "An unexpected error occurred",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UForm
    :schema="projectCreateSchema"
    :state="projectCreateState"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField label="Name" name="name">
      <UInput v-model="projectCreateState.name" />
    </UFormField>

    <UFormField label="Description" name="description">
      <UTextarea v-model="projectCreateState.description" />
    </UFormField>

    <UButton :loading="isLoading" type="submit" class="mt-4">
      Create Project
    </UButton>
  </UForm>
</template>