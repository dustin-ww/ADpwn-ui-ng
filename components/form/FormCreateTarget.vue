<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { useProjectsApi } from "~/composables/api/useProjectsApi";
import { targetSchema } from "~/schemas/target";

const targetCreateState = reactive({
  name: "",
  ip: "",
  cidr: "",
});

const toast = useToast();
const projectApi = useProjectsApi();
const projectStore = useProjectStore();
const isLoading = ref(false);
const emit = defineEmits<{
  (e: "submit-success"): void;
}>();

async function onSubmit(_event: FormSubmitEvent<typeof targetSchema>) {
  isLoading.value = true;

  try {
    const { error } = await projectApi.createTarget(projectStore.projectID, {
      ...targetCreateState,
      cidr: Number(targetCreateState.cidr),
    });

    if (error) {
      toast.add({
        title: "Error",
        description: error.message || "Target creation failed",
        color: "error",
      });
      return;
    }

    toast.add({
      title: "Success",
      description: "Target created successfully",
      color: "success",
    });

    targetCreateState.name = "";
    targetCreateState.ip = "";
    targetCreateState.cidr = "";

    emit("submit-success");
  } catch (error) {
    toast.add({
      title: "Error",
      description: "An unexpected error occurred: " + (error as Error).message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UForm
    :schema="targetSchema"
    :state="targetCreateState"
    class="space-y-4"
    @submit="onSubmit"
  >
    <!-- Grid für IP und CIDR -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <!-- IP Field -->
      <UFormField label="IP*" name="ip" class="flex flex-col">
        <UInput v-model="targetCreateState.ip" placeholder="0.0.0.0" />
      </UFormField>

      <!-- Separator -->
      <span class="text-center text-lg font-bold mt-5">/</span>

      <!-- CIDR Suffix Field -->
      <UFormField label="CIDR Suffix" name="cidr" class="flex flex-col">
        <UInput v-model.number="targetCreateState.cidr" placeholder="24" />
      </UFormField>
    </div>

    <!-- Letztes Input-Feld über die gesamte Breite -->
    <UFormField label="Note" name="note" class="w-full">
      <UInput
        v-model="targetCreateState.name"
        placeholder="Suspected Domain Controller.."
      />
    </UFormField>

    <!-- Submit Button -->
    <UButton type="submit"> Create </UButton>
  </UForm>
</template>
