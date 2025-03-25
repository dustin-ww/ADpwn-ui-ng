<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import {
  projectUpdateSchema,
  type ProjectUpdateSchema,
} from "~/schemas/project";
const projectStore = useProjectStore();
const projectsApi = useProjectsApi();
const { data: project, refresh } = await useAsyncData("projects", () =>
  projectsApi.getProject(projectStore.projectID),
);

const isLoading = ref(false);

const projectUpdateState = reactive({
  name: "",
  description: "",
});
const validationSchema = projectUpdateSchema;
watch(
  () => project.value,
  (newProject) => {
    if (newProject) {
      projectUpdateState.name = newProject.data?.name || "";
      projectUpdateState.description = newProject.data?.description || "";
    }
  },
  { immediate: true },
);
const toast = useToast();

async function onSubmit(event: FormSubmitEvent<ProjectUpdateSchema>) {
  isLoading.value = true;

  try {
    const response = await projectsApi.updateProject(
      projectStore.projectID,
      event.data,
    );

    if (response.error) {
      toast.add({
        title: "Error",
        description: `Failed to update project: ${response.error.message}`,
        color: "error",
      });
      console.error("Update error:", response.error);
    } else {
      toast.add({
        title: "Success",
        description: "Project has been updated successfully.",
        color: "success",
      });
      await projectStore.fetchProjects();
      await refreshNuxtData("projects");
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: "An unexpected error occurred.",
      color: "error",
    });
    console.error("Unexpected error:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UForm
    :schema="validationSchema"
    :state="projectUpdateState"
    class="space-y-4 grid justify-items-center"
    @submit="onSubmit"
  >
    <UFormField label="UID" name="uid">
      <UInput class="w-full" disabled :placeholder="project?.data?.uid" />
    </UFormField>
    <UFormField label="Name" name="name">
      <UInput
        v-model="projectUpdateState.name"
        :placeholder="project?.data?.name"
      />
    </UFormField>
    <UFormField label="Description" name="description">
      <UTextarea
        v-model="projectUpdateState.description"
        :placeholder="project?.data?.description"
      />
    </UFormField>
    <UButton type="submit" :loading="isLoading"> Update </UButton>
  </UForm>
</template>
