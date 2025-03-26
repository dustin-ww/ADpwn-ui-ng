<script setup lang="ts">
import type { ADPwnProject } from "~/types/adpwn/ADPwnProject";

const moduleStore = useADPwnModuleStore();
const toast = useToast();

const {
  data: modules,
  refresh: freshModules,
  status: modulesStatus,
} = useAsyncData<ADPwnProject[]>(
  "projects",
  async () => {
    try {
      await useADPwnModuleStore().fetchModules();
      return Array.isArray(moduleStore.modules)
        ? moduleStore.modules.map((module) => ({
            ...module,
            uid: module.uid || "",
          }))
        : [];
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      return [];
    }
  },
  {
    server: true,
    immediate: true,
    default: () => [],
  },
);
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <ListADPwnModules
      :modules="modules || []"
      :loading="modulesStatus === 'pending'"
    >
      <template #row-actions="{ row }">
        <UButton class="w-full text-center justify-self-center cursor-pointer">
          Run
        </UButton>
      </template>
    </ListADPwnModules>
  </div>
</template>
