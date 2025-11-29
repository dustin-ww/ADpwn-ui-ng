<script setup lang="ts">
import { useCurrentProjectStore } from "~/stores/currentProjectStore";
import { useProjectsStore } from "~/stores/projectStore";

useHead({
  title: "ADPwn - Project Management",
  meta: [{ name: "description", content: "Project management dashboard" }],
});

definePageMeta({
  layout: false,
});

const projectsStore = useProjectsStore();
const currentProjectStore = useCurrentProjectStore();
const toast = useToast();

onMounted(async () => {
  if (!projectsStore.list.length) {
    await projectsStore.fetchProjects(true);
  }
});

const projects = computed(() => projectsStore.list);
const isLoading = computed(() => projectsStore.loading);

const loadProject = async (projectId: string, projectName: string) => {
  console.log("Loading project:", projectId, projectName);
  try {
    await currentProjectStore.initialize(projectId, projectName);
    navigateTo("/");
  } catch (error) {
    toast.add({
      title: "Error loading project",
      description: error instanceof Error ? error.message : "Unknown error",
      color: "error",
    });
  }
};

const handleSubmitSuccess = async () => {
  try {
    await projectsStore.fetchProjects(true);
    toast.add({
      title: "Project created",
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Error refreshing projects",
      description: error instanceof Error ? error.message : "Unknown error",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="grid justify-items-center mt-5">
    <h1 class="text-2xl">Welcome to ADPwn</h1>
    <!-- <img
      class="w-1/12 min-w-[100px] max-w-[150px] mx-6 mt-4"
      src="/ADPwnLogo.png"
    /> -->
    <ModalCreateProject class="mt-10" @project-created="handleSubmitSuccess" />

    <ListProjects :projects="projects" :loading="isLoading" class="w-5/6">
      <template #row-actions="{ row }">
        <UButton
          :disabled="currentProjectStore.loading"
          :loading="currentProjectStore.loading"
          @click="loadProject(row.original.id, row.original.name)"
        >
          Load {{ row.original.name }}
        </UButton>
      </template>

      <!-- <template #error v-if="projectsStore.error">
        <p>{{} }}</p> :error="projectsStore.error" />
      </template> -->
    </ListProjects>
  </div>
</template>
