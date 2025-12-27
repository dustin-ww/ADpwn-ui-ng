<script setup lang="ts">
import type { ADUser } from "~/types/ad/ADUsers";

defineProps<{
  user: ADUser;
}>();
</script>

<template>
  <div class="p-4">
    <!-- Description -->
    <h3 class="text-md font-semibold mb-2 mt-5">
      Description
    </h3>
    <div>
      {{ user.description || "n. a." }}
    </div>

    <!-- Exploration Details -->
    <h3 class="text-lg font-semibold mb-2 text-red-800 mt-5">
      Exploration Details
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>Discovered at:</strong> {{ user.discoveredAt || "n. a." }}</div>
      <div><strong>Discovered by:</strong> {{ user.discoveredBy || "n. a." }}</div>
      <div><strong>Last seen at:</strong> {{ user.lastSeenAt || "n. a." }}</div>
      <div><strong>Last seen by:</strong> {{ user.lastSeenBy || "n. a." }}</div>
    </div>

    <!-- Identity Details -->
    <h3 class="text-lg font-semibold mb-2 mt-8">
      Identity Details
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>UID:</strong> {{ user.uid }}</div>
      <div><strong>Name:</strong> {{ user.name }}</div>
      <div><strong>SAM Account Name:</strong> {{ user.samAccountName }}</div>
      <div><strong>UPN:</strong> {{ user.upn }}</div>
      <div><strong>SID:</strong> {{ user.sid }}</div>
      <div><strong>Account Type:</strong> {{ user.accountType }}</div>
      <div><strong>Belongs to Domain:</strong> {{ user.belongsToDomain?.join(", ") || "n. a." }}</div>
    </div>

    <!-- Credentials -->
    <h3 class="text-md font-semibold mb-2 mt-8">
      Credentials
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>Password:</strong> {{ user.password || "n. a." }}</div>
      <div><strong>NTLM Hash:</strong> {{ user.ntlmHash || "n. a." }}</div>
      <div><strong>Credential Type:</strong> {{ user.credentialType }}</div>
    </div>

    <!-- Privileges -->
    <h3 class="text-md font-semibold mb-2 mt-8">
      Privileges
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>Is Admin:</strong> {{ user.isAdmin }}</div>
      <div><strong>Is Domain Admin:</strong> {{ user.isDomainAdmin }}</div>
     <div><strong>Member of:</strong> {{ user.memberOf?.join(", ") || "n. a." }}</div>
    </div>

    <!-- Kerberos -->
    <h3 class="text-md font-semibold mb-2 mt-8">
      Kerberos
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>SPNs:</strong> {{ user.spns?.length ? user.spns.join(", ") : "None" }}</div>
      <div><strong>Kerberoastable:</strong> {{ user.kerberoastable }}</div>
      <div><strong>AS-REP Roastable:</strong> {{ user.asrepRoastable }}</div>
    </div>

    <!-- Delegation -->
    <h3 class="text-md font-semibold mb-2 mt-8">
      Delegation
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>Trusted for Delegation:</strong> {{ user.trustedForDelegation }}</div>
      <div><strong>Unconstrained Delegation:</strong> {{ user.unconstrainedDelegation }}</div>
    </div>

    <!-- Usage -->
    <h3 class="text-md font-semibold mb-2 mt-8">
      Usage
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>Last Logon:</strong> {{ user.lastLogon || "n. a." }}</div>
      <div><strong>Workstations:</strong> {{ user.workstations?.join(", ") || "n. a." }}</div>
    </div>

    <!-- Risk -->
    <h3 class="text-md font-semibold mb-2 mt-8">
      Risk
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>Risk Score:</strong> {{ user.riskScore }}</div>
      <div><strong>Risk Reasons:</strong> {{ user.riskReasons?.join(", ") || "n. a." }}</div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 mt-6">
      <UButton color="neutral" variant="outline">
        Edit User
      </UButton>
      <UButton variant="outline">
        Delete User
      </UButton>
    </div>
  </div>
</template>
