<script setup lang="ts">
import type { ADService } from "~/types/ad/ADService";

defineProps<{
  service: ADService;
  expandedServiceData?: {
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
        {{ service.description || "n. a." }}
        </div>
        <h3 class="text-lg font-semibold mb-2 text-red-800 mt-5">
        Exploration Details
        </h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Discovered at:</strong> {{ service.discoveredAt }}
          </div>
          <div>
            <strong>Discovered by:</strong> {{ service.discoveredBy }}
          </div>
          <div>
            <strong>Last seen at:</strong> {{ service.lastSeenAt }}
          </div>
          <div>
            <strong>Last seen by:</strong> {{ service.lastSeenBy }}
          </div>
        </div>
        <h3 class="text-lg font-semibold mb-2 mt-8">
          Service Details
        </h3>
         <div class="mt-6">
            <h3 class="text-md font-semibold mb-2">SPNs</h3>
            <table class="w-full text-sm">
                <tbody>
                <tr v-if="!service.spns">
                    <td class="p-2">No SPNs known.</td>
                </tr>
                <tr v-for="(spn, index) in service.spns" :key="index" class="hover:bg-gray-50">
                    <td class="p-2">{{ spn }}</td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm mt-5">
            <div><strong>UID:</strong> {{ service.uid }}</div>
            <div><strong>Account Name:</strong> {{ service.accountName }}</div>
            <div><strong>Password Last Set:</strong> {{ service.passwordLastSet }}</div>
            <div><strong>Unconstrained Delegation:</strong> {{ service.unconstrainedDelegation }}</div>
            <div><strong>Is Legacy:</strong> {{ service.isLegacy }}</div>
            <div><strong>Trusted for Delegation:</strong> {{ service.trustedForDelegation }}</div>
            <div><strong>Account can be delegated:</strong> {{ service.accountCanBeDelegated }}</div>
        </div>

        <div class="mt-6">
        <h3 class="text-md font-semibold mb-2">Constrained Delegations</h3>
        <table class="w-full text-sm">
            <tbody>
                <tr v-if="!service.constrainedDelegation">
                    <td class="p-2">No constrained delegations known.</td>
                </tr>
            <tr v-for="(cd, index) in service.constrainedDelegation" :key="index" class="hover:bg-gray-50">
                <td class="p-2">{{ cd }}</td>
            </tr>
            </tbody>
        </table>
        </div>
        <div class="flex gap-4 mt-4">
          <UButton color="neutral" variant="outline">
            Edit Service
          </UButton>
          <UButton variant="outline">
            Delete Service
          </UButton>
        </div> 
    </div> 
</template>
