<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { targetSchema } from "~/schemas/target";

const targetCreateState = reactive({
  ip: "",
  cidr: "",
  name: "",
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<typeof targetSchema>) {
  toast.add({
    title: "Success",
    description: "The form has been submitted.",
    color: "success",
  });
  console.log(event.data);
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
