<script setup lang="ts">
import type { ADHost } from "~/types/ad/ADHost";

defineProps<{
  host: ADHost;
  expandedHostData?: {
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
        {{ host.description || "n. a." }}
        </div>
        <h3 class="text-lg font-semibold mb-2 text-red-800 mt-5">
        Exploration Details
        </h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Discovered at:</strong> {{ host.discoveredAt }}
          </div>
          <div>
            <strong>Discovered by:</strong> {{ host.discoveredBy }}
          </div>
          <div>
            <strong>Last seen at:</strong> {{ host.lastSeenAt }}
          </div>
          <div>
            <strong>Last seen by:</strong> {{ host.lastSeenBy }}
          </div>
        </div>
        <h3 class="text-lg font-semibold mb-2 mt-8">
          Host Details
        </h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div><strong>UID:</strong> {{ host.uid }}</div>
          <div><strong>Hostname:</strong> {{ host.hostname }}</div>
          <div><strong>IP Address:</strong> {{ host.ipAddress }}</div>
          <div><strong>Operating System:</strong> {{ host.operatingSystem }}</div>
          <div><strong>Operating System Version:</strong> {{ host.operatingSystemVersion }}</div>
          <div><strong>Last Logon Time:</strong> {{ host.lastLogonTimestamp }}</div>
          <div><strong>Object GUID:</strong> {{ host.objectGUID }}</div>
          <div><strong>Object SID:</strong> {{ host.objectSid }}</div>
          <div><strong>DNS Hostname:</strong> {{ host.dNSHostName }}</div>
          <div><strong>User Account Control:</strong> {{ host.userAccountControl}}</div>
        </div>
        <div class="flex gap-4 mt-4">
          <UButton color="neutral" variant="outline">
            Edit Host
          </UButton>
          <UButton variant="outline">
            Delete Host
          </UButton>
        </div> 
    </div> 
</template>
