<script setup lang="ts">
import type { ADPwnProject } from '~/types/adpwn/ADPwnProject';

useHead({
  title: 'ADPwn - Project Management',
  meta: [{ name: 'description', content: 'Project management dashboard' }]
})

definePageMeta({
  layout: false,
});

const projectStore = useProjectStore();

const loadProject = (id: string, name: string) => {
  projectStore.setProject(id, name);
  navigateTo("/");
};

const { 
  data: projects, 
  refresh: refreshProjects, 
  status: projectsStatus 
} = useAsyncData<ADPwnProject[]>(
  'projects',
  async () => {
    try {
      await projectStore.fetchProjects()
      return projectStore.projects
    } catch (error) {
      showError('Could not fetch projects')
      return []
    }
  },
  {
    server: true,
    immediate: !projectStore.hasProjects
  }
)

const handleSubmitSuccess = () => {
  refreshProjects();
};
</script>

<template>
  <div class="grid justify-items-center mt-5">
    <h1 class="text-2xl">Welcome to ADPwn</h1>
    <img
      class="w-1/12 min-w-[100px] max-w-[150px] mx-6 mt-4"
      src="/ADPwnLogo.png"
    >
    <ModalCreateProject class="mt-10" @project-created="handleSubmitSuccess"/>
    <ListProjects 
      :projects="projects || []" 
      :loading="projectsStatus === 'pending'"
      class="w-5/6"
    >
      <template #row-actions="{ row }">
        <UButton @click="loadProject(row.original.id, row.original.name)">
          Load {{ row.original.name }}
        </UButton>
      </template>
    </ListProjects>
  </div>
</template>