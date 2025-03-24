<script setup lang="ts">
definePageMeta({
  layout: false,
});

const projectStore = useProjectStore();

const loadProject = (id: string, name: string) => {
  projectStore.setProject(id, name);
  navigateTo("/");
};
</script>

<template>
  <div class="grid justify-items-center mt-5">
    <h1 class="text-2xl">Welcome to ADPwn</h1>
    <img
      class="w-1/12 min-w-[100px] max-w-[150px] mx-6 mt-4"
      src="/ADPwnLogo.png"
    />
    <ListProjects class="w-5/6">
      <template #row-actions="{ row }">
        <UButton @click="loadProject(row.original.id, row.original.name)">
          Load {{ row.original.name }}
        </UButton>
      </template>
    </ListProjects>
  </div>
</template>
