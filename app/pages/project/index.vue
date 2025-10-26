<script setup lang="ts">
useHead({
  title: "Project • ADPwn",
});

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
    <div class="w-full border-solid rounded-lg p-10">
      <FormConfigureProject />
    </div>
  </div>
</template>
