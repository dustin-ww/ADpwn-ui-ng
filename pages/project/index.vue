<script setup lang="ts">
import { useProjectsStore } from "~/stores/projects";

const route = useRoute();
const projectUid = route.params.projectUid as string;
const projectStore = useProjectsStore();
const toast = useToast();

// // Set current project from route
// projectStore.setProject(projectUid);

// const { refresh: refreshTargets, pending: targetsPending } = useAsyncData(
//   `targets-${projectUid}`,
//   async () => {
//     try {
//       await projectStore.fetchActualProjectTargets(true);
//       return null; // Data is stored in the store
//     } catch (error) {
//       if (error instanceof Error) {
//         toast.add({
//           title: "Error",
//           description: error.message,
//           color: "error",
//         });
//       }
//       return null;
//     }
//   },
//   { server: true }
// );

// // Use computed for reactive access to targets
// const targets = computed(() => projectStore.projectTargets);

// // Optional: Fetch project details if needed
// onMounted(async () => {
//   if (!projectStore.projectName) {
//     try {
//       await projectStore.fetchProjects();
//       const project = projectStore.projects.find(p => p.id === projectUid);
//       if (project) {
//         projectStore.setProject(project.id, project.name);
//       }
//     } catch (error) {
//       // Handle error
//     }
//   }
// });
</script>

<template>
  <div>
    <SharedHeading heading="Manage Project" />
    <div
      class="grid grid-cols-2 gap-x-10 justify-items-center w-full mx-auto px-4 text-center"
    >
      <div class="w-full bg-black border-solid rounded-lg">
        <h1 class="text-2xl mt-5">Configure Project</h1>
        <FormConfigureProject />
      </div>
      <div class="w-full bg-black border-solid rounded-lg">
        <h1 class="text-2xl mt-5">Configure Targets</h1>
        <div class="mb-10 mt-10">
          <ListTarget />
          <ModalModelCreateTarget class="w-1/2" />
        </div>
      </div>
    </div>
  </div>
</template>
