<script setup lang="ts">
import { useCurrentProjectStore } from "~/stores/currentProject";
import type { FormSubmitEvent } from "@nuxt/ui";
import { targetSchema } from "~/schemas/target";

const targetCreateState = reactive({
  name: "",
  ip: "",
  cidr: "",
});

const toast = useToast();
const currentProjectStore = useCurrentProjectStore();
const isLoading = ref(false);
const emit = defineEmits<{
  (e: "submit-success"): void;
}>();

async function onSubmit(_event: FormSubmitEvent<typeof targetSchema>) {
  isLoading.value = true;

  try {
    await currentProjectStore.createTarget({
      ...targetCreateState,
      cidr: Number(targetCreateState.cidr),
    });

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
    <!-- IP/CIDR Input Group -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <UFormField label="IP*" name="ip" class="flex flex-col">
        <UInput
          v-model="targetCreateState.ip"
          placeholder="0.0.0.0"
          data-testid="ip-input"
        />
      </UFormField>

      <span class="text-center text-lg font-bold mt-5">/</span>

      <UFormField label="CIDR Suffix" name="cidr" class="flex flex-col">
        <UInput
          v-model.number="targetCreateState.cidr"
          placeholder="24"
          type="number"
          min="0"
          max="32"
          data-testid="cidr-input"
        />
      </UFormField>
    </div>

    <!-- Name Input -->
    <UFormField label="Note" name="note" class="w-full">
      <UInput
        v-model="targetCreateState.name"
        placeholder="Suspected Domain Controller.."
        data-testid="name-input"
      />
    </UFormField>

    <!-- Submit Button -->
    <UButton
      type="submit"
      :loading="isLoading"
      class="mt-4"
      data-testid="submit-button"
    >
      Create Target
    </UButton>
  </UForm>
</template>
