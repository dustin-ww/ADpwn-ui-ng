<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { targetSchema, type TargetForm } from "~/schemas/target";
import { useCurrentProjectStore } from "~/stores/currentProjectStore";

const props = defineProps<{
  unknownTargetRange?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit-success"): void;
}>();

const targetCreateState = reactive<TargetForm>({
  ip: "",
  cidr: 32,
  note: "",
});

const isLoading = ref(false);
const toast = useToast();
const currentProjectStore = useCurrentProjectStore();

async function onSubmit(_event: FormSubmitEvent<typeof targetSchema>) {
  isLoading.value = true;
  try {
    await currentProjectStore.createTarget(targetCreateState);

    toast.add({
      title: "Success",
      description: "Target created successfully",
      color: "success",
    });

    Object.assign(targetCreateState, targetSchema.parse({})); // Reset mit Defaults
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
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <UFormField label="IP*" name="ip">
        <UInput v-model="targetCreateState.ip" placeholder="0.0.0.0" />
      </UFormField>

      <span
        v-if="props.unknownTargetRange"
        class="text-center text-lg font-bold mt-5"
      >/</span>

      <UFormField
        v-if="props.unknownTargetRange"
        label="CIDR Suffix*"
        name="cidr"
      >
        <UInput
          v-model.number="targetCreateState.cidr"
          placeholder="24"
          type="number"
          min="0"
          max="32"
        />
      </UFormField>
    </div>

    <UFormField label="Note" name="note">
      <UInput
        v-model="targetCreateState.note"
        placeholder="Suspected Domain Controller.."
      />
    </UFormField>

    <UButton type="submit" :loading="isLoading" class="mt-4">
      Create Target
    </UButton>
  </UForm>
</template>
