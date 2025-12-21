<script setup lang="ts">
import type { ADDomain } from "~/types/ad/ADDomain";

defineProps<{
  domain: ADDomain;
  expandedDomainData?: {
    hosts: Array<{
      uid: string;
      hostname: string;
      ip: string;
    }>;
  } | null;
}>();
</script>

<template>
  <div class="p-4">
    <h3 class="text-md font-semibold mb-2 mt-5">
      Description
    </h3>
    <div>
      {{ domain.description || "n. a." }}
    </div>

    <h3 class="text-lg font-semibold mb-2 text-red-800 mt-5">
      Exploration Details
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div>
        <strong>Discovered at:</strong> {{ domain.discoveredAt }}
      </div>
      <div>
        <strong>Discovered by:</strong> {{ domain.discoveredBy }}
      </div>
      <div>
        <strong>Last seen at:</strong> {{ domain.lastSeenAt }}
      </div>
      <div>
        <strong>Last seen by:</strong> {{ domain.lastSeenBy }}
      </div>
    </div>

    <h3 class="text-lg font-semibold mb-2 mt-8">
      Domain Details
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><strong>UID:</strong> {{ domain.uid }}</div>
      <div><strong>Name:</strong> {{ domain.name }}</div>
      <div><strong>DNS Name:</strong> {{ domain.dnsName }}</div>
      <div><strong>NetBIOS Name:</strong> {{ domain.netbiosName }}</div>
      <div><strong>Domain GUID:</strong> {{ domain.domainGuid }}</div>
      <div><strong>Domain SUID:</strong> {{ domain.domainSuid }}</div>
      <div><strong>Status:</strong> {{ domain.status }}</div>
      <div><strong>Type:</strong> {{ domain.type }}</div>
      <div><strong>Region:</strong> {{ domain.region }}</div>
    </div>

    <h3 class="text-lg font-semibold mb-2 mt-8">
      Security Policies
    </h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div>
        <strong>Min Password Length:</strong>
        {{ domain.SecurityPolicies?.minPasswordLength ?? "n. a." }}
      </div>
      <div>
        <strong>Password History Length:</strong>
        {{ domain.SecurityPolicies?.passwordHistoryLength ?? "n. a." }}
      </div>
      <div>
        <strong>Lockout Threshold:</strong>
        {{ domain.SecurityPolicies?.lockoutThreshold ?? "n. a." }}
      </div>
      <div>
        <strong>Lockout Duration:</strong>
        {{ domain.SecurityPolicies?.lockoutDuration ?? "n. a." }}
      </div>
    </div>

    <details class="mt-4">
      <summary class="cursor-pointer font-semibold">Full JSON</summary>
      <pre class="text-xs mt-2 p-2 rounded overflow-x-auto">
{{ domain }}
      </pre>
    </details>

    <h1 class="text-lg mt-8 mb-2">Hosts</h1>

    <template v-if="expandedDomainData">
      <ul
        v-if="expandedDomainData.hosts.length > 0"
        class="space-y-1 text-sm"
      >
        <li
          v-for="host in expandedDomainData.hosts"
          :key="host.uid"
          class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
        >
          <span class="font-mono">{{ host.hostname }}</span>
          <span class="text-gray-500 ml-2">({{ host.ip }})</span>
          <NuxtLink
            :to="`/hosts/${host.uid}`"
            class="text-blue-500 hover:underline ml-4"
          >
            View Details
          </NuxtLink>
        </li>
      </ul>

      <div
        v-else
        class="text-gray-500 text-sm"
      >
        No hosts assigned to this domain
      </div>
    </template>
    <div class="flex gap-4 mt-4">
          <UButton color="neutral" variant="outline">
            Edit Domain
          </UButton>
          <UButton variant="outline">
            Delete Domain
          </UButton>
        </div> 
  </div>
</template>
