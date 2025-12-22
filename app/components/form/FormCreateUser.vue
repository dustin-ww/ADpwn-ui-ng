<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ADDomain } from "~/types/ad/ADDomain";
import type { ADUser } from "~/types/ad/ADUser";

const formState = reactive<ADUser>({
  uid: "",
  name: "",

  // Identity
  samAccountName: "",
  upn: "",
  sid: "",
  accountType: "user",

  // Credentials
  password: "",
  ntlmHash: "",
  credentialType: "plaintext",

  // Privileges
  isAdmin: false,
  isDomainAdmin: false,
  memberOf: [],

  // Kerberos
  spns: [],
  kerberoastable: false,
  asrepRoastable: false,

  // Delegation
  trustedForDelegation: false,
  unconstrainedDelegation: false,

  // Usage
  lastLogon: new Date(),
  workstations: [],

  // Risk
  riskScore: 0,
  riskReasons: [],

  // History
  discoveredAt: undefined,
  discoveredBy: "",
  lastSeenAt: undefined,
  lastSeenBy: "",

  belongsToDomain: [],
});

const isLoading = ref(false);
const toast = useToast();

const currentProjectStore = useCurrentProjectStore();
const domainStore = useDomainStore();
const userStore = useUserStore();

const domains = ref<ADDomain[]>([]);


const selectedDomain = ref<{ label: string; value: string } | null>(null);

onMounted(async () => {
  isLoading.value = true;

  const result = await domainStore.fetchDomains(
    currentProjectStore.uid,
    { skipCache: true }
  );

  domains.value = (result as { data?: ADDomain[] }).data ?? [];
  isLoading.value = false;
});

const domainOptions = computed(() =>
  domains.value.map((d) => ({
    label: d.name,
    value: d.uid,
  }))
);
async function onSubmit(_event: FormSubmitEvent<ADUser>) {
  try {
    isLoading.value = true;

    const domainUID = selectedDomain.value?.value;

    formState.belongsToDomain = domainUID ? [domainUID] : [];

    await userStore.createUser(
      currentProjectStore.uid,
      domainUID,
      formState
    );

    toast.add({
      title: "Success",
      description: "User created successfully",
      color: "success",
    });

    Object.assign(formState, {
      uid: "",
      name: "",
      samAccountName: "",
      upn: "",
      sid: "",
      accountType: "user",
      password: "",
      ntlmHash: "",
      credentialType: "plaintext",
      isAdmin: false,
      isDomainAdmin: false,
      memberOf: [],
      spns: [],
      kerberoastable: false,
      asrepRoastable: false,
      trustedForDelegation: false,
      unconstrainedDelegation: false,
      lastLogon: new Date(),
      workstations: [],
      riskScore: 0,
      riskReasons: [],
      belongsToDomain: [],
    });

    selectedDomain.value = null;
  } catch (err) {
    toast.add({
      title: "Error",
      description: "Failed to create user",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <UForm
    :state="formState"
    class="space-y-6"
    @submit="onSubmit"
  >
    <!-- Domain -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Domain</h3>

      <UBadge icon="i-lucide-info">
        The user will be created under the selected domain.
      </UBadge>

      <USelectMenu
        v-model="selectedDomain"
        placeholder="Select Domain"
        :items="domainOptions"
      />
    </div>

    <!-- Identity -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Identity</h3>

      <UFormField label="Name">
        <UInput v-model="formState.name" placeholder="John Doe" />
      </UFormField>

      <UFormField label="SAM Account Name">
        <UInput v-model="formState.samAccountName" placeholder="jdoe" />
      </UFormField>

      <UFormField label="User Principal Name (UPN)">
        <UInput v-model="formState.upn" placeholder="jdoe@example.com" />
      </UFormField>

      <UFormField label="SID">
        <UInput v-model="formState.sid" placeholder="S-1-5-21-..." />
      </UFormField>
    </div>

    <!-- Credentials -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Credentials</h3>

      <UFormField label="Credential Type">
        <USelect
          v-model="formState.credentialType"
          :items="['plaintext', 'ntlm', 'kerberos']"
        />
      </UFormField>

      <UFormField label="Password">
        <UInput v-model="formState.password" type="password" />
      </UFormField>

      <UFormField label="NTLM Hash">
        <UInput v-model="formState.ntlmHash" placeholder="aad3b435b51404ee..." />
      </UFormField>
    </div>

    <!-- Privileges -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Privileges</h3>

      <USwitch v-model="formState.isAdmin" label="Local Admin" />
      <USwitch v-model="formState.isDomainAdmin" label="Domain Admin" />
    </div>

    <!-- Kerberos -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Kerberos</h3>

      <USwitch v-model="formState.kerberoastable" label="Kerberoastable" />
      <USwitch v-model="formState.asrepRoastable" label="AS-REP Roastable" />

      <UFormField label="SPNs">
        <UInput
          v-model="formState.spns"
          placeholder="HTTP/web.example.com"
        />
      </UFormField>
    </div>

    <!-- Delegation -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Delegation</h3>

      <USwitch
        v-model="formState.trustedForDelegation"
        label="Trusted for Delegation"
      />
      <USwitch
        v-model="formState.unconstrainedDelegation"
        label="Unconstrained Delegation"
      />
    </div>

    <!-- Usage -->
    <div class="space-y-4 border-b pb-6">
      <h3 class="text-lg font-medium">Usage</h3>

      <UFormField label="Allowed Workstations">
        <UInput
          v-model="formState.workstations"
          placeholder="WS01, WS02"
        />
      </UFormField>
    </div>

    <UButton type="submit" class="mt-6" :loading="isLoading">
      Create User
    </UButton>
  </UForm>
</template>
