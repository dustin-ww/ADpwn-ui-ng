<script setup lang="ts">
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import { useADPwnModuleStore } from "~/stores/adpwnModules";

useHead({
  title: "Module List • ADPwn",
});

const moduleStore = useADPwnModuleStore();
const toast = useToast();

const {
  data: modules,
  refresh: _,
  status: modulesStatus,
} = useAsyncData<ADPwnModule[]>(
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
    } catch (error) {
      toast.add({
        title: "Error",
        description: (error as Error).message,
        color: "error",
      });
      return [];
    }
  },
  {
    server: true,
    immediate: true,
    default: () => [],
  },
);

console.log("modules", modules.value);
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <ListADPwnModules
      :modules="modules || []"
      :loading="modulesStatus === 'pending'"
    >
      <template #row-actions="{ row }">
        <ModalRunModule :module-key="row.original.key" />
      </template>
    </ListADPwnModules>
  </div>
</template>
