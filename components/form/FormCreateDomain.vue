<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ADDomain, adDomainSchema} from "~/types/ad/ADDomain";


const formState = reactive<ADDomain>({
  // General
  uid: "",
  name: "",
  dnsName: "",
  netBiosName: "",
  domainGuid: "",
  domainSid: "",

  // Infrastructure
  description: "",
  status: "new",
  type: "aws",
  region: "",
  vpcId: "",
  subnetIds: [],
  securityGroupIds: [],

  // Network
  dnsIpAddresses: [],
  ldapIpAddresses: [],
  domainControllerIpAddresses: [],

  // AD Policies
  securityPolicies: {
    minPwdLength: 8,
    pwdHistoryLength: 3,
    lockoutThreshold: 5,
  },

  // Trust Relationships
  trustRelationships: [],

  // Metadata
  tags: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: "system",
  updatedBy: "system",

  // Statusflags
  isDefault: false,
  isActiveDirectoryManagedDomain: true,

  // Functional Levels
  domainFunctionLevel: "Windows2016",
});


const currentProjectStore = useCurrentProjectStore();
const isLoading = ref(false);
const toast = useToast();
const emit = defineEmits<{
  (e: "submit-success"): void;
}>();

async function onSubmit(_event: FormSubmitEvent<ADDomain>) {
  try {
    const { error } = await currentProjectStore.createDomain(formState);

    if (error) {
      toast.add({
        title: "Error",
        description: error.message || "Domain creation failed",
        color: "error",
      });
      return;
    }

    toast.add({
      title: "Success",
      description: "Domain created successfully",
      color: "success",
    });

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
    :schema="adDomainSchema"
    :state="formState"
    class="space-y-6"
    @submit="onSubmit"
  >
    <!-- General Section -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">General Settings</h3>
      <UFormField label="Domain Name" name="name">
        <UInput v-model="formState.name" placeholder="example.com" />
      </UFormField>

      <UFormField label="DNS Name" name="dnsName">
        <UInput v-model="formState.dnsName" placeholder="dns.example.com" />
      </UFormField>

      <UFormField label="NetBIOS Name" name="netBiosName">
        <UInput v-model="formState.netBiosName" placeholder="EXAMPLE" />
      </UFormField>
    </div>

    <!-- Infrastructure Section -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Infrastructure</h3>

      <UFormField label="Region" name="region">
        <USelect
          v-model="formState.region"
          :options="['us-east-1', 'us-west-2', 'eu-central-1']"
        />
      </UFormField>

      <UFormField label="VPC ID" name="vpcId">
        <UInput v-model="formState.vpcId" placeholder="vpc-123456" />
      </UFormField>

      <UFormField label="Subnets" name="subnetIds">
        <USelectMenu
          v-model="formState.subnetIds"
          multiple
          :options="availableSubnets"
          placeholder="Select subnets"
        />
      </UFormField>
    </div>

    <!-- Network Section -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Network Configuration</h3>

      <UFormField label="DNS IP Addresses" name="dnsIpAddresses">
        <USelectMenu
          v-model="formState.dnsIpAddresses"
          multiple
          creatable
          placeholder="Add IP addresses"
        >
          <template #option-create="{ search }">
            Add <strong>{{ search }}</strong> as new IP
          </template>
        </USelectMenu>
      </UFormField>

      <UFormField label="LDAP IP Addresses" name="ldapIpAddresses">
        <UInput
          v-model="formState.ldapIpAddresses"
          type="text"
          placeholder="Comma-separated IPs"
        />
      </UFormField>
    </div>

    <!-- Security Policies -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Security Policies</h3>

      <UFormField
        label="Minimum Password Length"
        name="securityPolicies.minPwdLength"
      >
        <UInput
          v-model="formState.securityPolicies.minPwdLength"
          type="number"
          min="8"
          max="24"
        />
      </UFormField>

      <UFormField
        label="Lockout Threshold"
        name="securityPolicies.lockoutThreshold"
      >
        <USelect
          v-model="formState.securityPolicies.lockoutThreshold"
          :options="[3, 5, 10]"
        />
      </UFormField>
    </div>

    <!-- Trust Relationships -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Trust Relationships</h3>

      <div
        v-for="(relationship, index) in formState.trustRelationships"
        :key="index"
        class="space-y-4 border p-4 rounded"
      >
        <UFormField
          :label="`Trusted Domain ${index + 1}`"
          :name="`trustRelationships.${index}.trustedDomain`"
        >
          <UInput v-model="relationship.trustedDomain" />
        </UFormField>

        <UFormField
          :label="`Direction ${index + 1}`"
          :name="`trustRelationships.${index}.direction`"
        >
          <USelect
            v-model="relationship.direction"
            :options="directionOptions"
          />
        </UFormField>

        <UButton
          icon="i-heroicons-trash-20-solid"
          color="red"
          variant="ghost"
          @click="removeRelationship(index)"
        />
      </div>

      <UButton
        icon="i-heroicons-plus-20-solid"
        variant="outline"
        @click="addRelationship"
      >
        Add Trust Relationship
      </UButton>
    </div>

    <UButton type="submit" class="mt-6"> Create Domain </UButton>
  </UForm>
</template>
