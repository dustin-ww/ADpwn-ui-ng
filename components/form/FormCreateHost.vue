<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ADHost, adHostInputSchema } from "~/types/ad/ADHost";

const formState = reactive<ADHost>({
  ipAddress: "",
  distinguishedName: "",
  objectGUID: "",
  objectSid: "",
  sAMAccountName: "",
  dNSHostName: "",
  operatingSystem: "",
  operatingSystemVersion: "",
  lastLogonTimestamp: new Date(),
  whenCreated: new Date(),
  whenChanged: new Date(),
  userAccountControl: 0,
});

const isLoading = ref(false);
const toast = useToast();

async function onSubmit(_event: FormSubmitEvent<ADHost>) {
  toast.add({
    title: "Success",
    description: "Host created successfully",
    color: "success",
  });
  //   isLoading.value = true;

  //   try {
  //     const { error } = await currentProjectStore.createHost(formState);

  //     if (error) {
  //       toast.add({
  //         title: "Error",
  //         description: error.message || "Host creation failed",
  //         color: "error",
  //       });
  //       return;
  //     }

  //     toast.add({
  //       title: "Success",
  //       description: "Host created successfully",
  //       color: "success",
  //     });

  //     emit("submit-success");
  //   } catch (error) {
  //     toast.add({
  //       title: "Error",
  //       description: "An unexpected error occurred: " + (error as Error).message,
  //       color: "error",
  //     });
  //   } finally {
  //     isLoading.value = false;
  //   }
}

const operatingSystems = ref([
  "Windows Server 2022",
  "Windows Server 2019",
  "Windows Server 2016",
  "Windows Server 2012 R2",
  "Windows Server 2012",
  "Windows 11",
  "Windows 10",
  "Windows 8.1",
  "Windows 7",
]);

const uacOptions = ref([
  { label: "Enabled Account (512)", value: 512 },
  { label: "Disabled Account (514)", value: 514 },
  { label: "Workstation Trust Account (4096)", value: 4096 },
  { label: "Server Trust Account (8192)", value: 8192 },
]);

const date = ref(null);
</script>

<template>
  <UForm
    :schema="adHostInputSchema"
    :state="formState"
    class="space-y-6"
    @submit="onSubmit"
  >
    <!-- General Section -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Host Connection</h3>
      <UBadge icon="i-lucide-message-circle-warning"
        >Please enter one of the following connection details.
      </UBadge>
      <UFormField label="IP Address" name="ip">
        <UInput v-model="formState.ipAddress" placeholder="0.0.0.0" />
      </UFormField>

      <UFormField label="DNS Host Name" name="dNSHostName">
        <UInput
          v-model="formState.dNSHostName"
          placeholder="ws01.example.com"
        />
      </UFormField>
    </div>
    <!-- Identity Section -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Host Identity</h3>

      <UFormField label="Distinguished Name" name="distinguishedName">
        <UInput
          v-model="formState.distinguishedName"
          placeholder="CN=WS01,OU=Workstations,DC=example,DC=com"
        />
      </UFormField>

      <UFormField label="Object GUID" name="objectGUID">
        <UInput
          v-model="formState.objectGUID"
          placeholder="00000000-0000-0000-0000-000000000000"
        />
      </UFormField>

      <UFormField label="Object SID" name="objectSid">
        <UInput v-model="formState.objectSid" placeholder="S-1-5-21-..." />
      </UFormField>
    </div>

    <!-- Naming Section -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Naming</h3>

      <UFormField label="SAM Account Name" name="sAMAccountName">
        <UInput v-model="formState.sAMAccountName" placeholder="WS01$" />
      </UFormField>
    </div>

    <!-- System Information -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">System Information</h3>

      <UFormField label="Operating System" name="operatingSystem">
        <USelect
          v-model="formState.operatingSystem"
          :items="operatingSystems"
          placeholder="Select operating system"
        />
      </UFormField>

      <UFormField
        label="Operating System Version"
        name="operatingSystemVersion"
      >
        <UInput
          v-model="formState.operatingSystemVersion"
          placeholder="10.0 (19044)"
        />
      </UFormField>

      <UFormField label="User Account Control" name="userAccountControl">
        <USelect
          v-model="formState.userAccountControl"
          :items="uacOptions"
          option-attribute="label"
          value-attribute="value"
          placeholder="Select account control flags"
        />
      </UFormField>
    </div>

    <!-- Timestamps -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Timestamps</h3>

      <UFormField label="Last Logon Timestamp" name="lastLogonTimestamp">
        <VueDatePicker
          v-model="formState.lastLogonTimestamp"
          placeholder="Start Typing ..."
          text-input
          dark
        />
      </UFormField>

      <UFormField label="When Created" name="whenCreated">
        <VueDatePicker
          v-model="formState.whenCreated"
          placeholder="Start Typing ..."
          text-input
          dark
        />
      </UFormField>

      <UFormField label="When Changed" name="whenChanged">
        <VueDatePicker
          v-model="formState.whenChanged"
          placeholder="Start Typing ..."
          text-input
          dark
        />
      </UFormField>
    </div>

    <UButton type="submit" class="mt-6" :loading="isLoading">
      Create Host
    </UButton>
  </UForm>
</template>
