<script setup lang="ts">
const items = ref([
  [
    {
      label: "Settings",
      type: "label",
      icon: "i-lucide-settings",
      slot: "adpwnlabel",
      defaultOpen: true,
      active: true,
      children: [
        {
          label: "Project",
          icon: "i-lucide-house",
          to: "/project",
        },
        {
          label: "Targets",
          icon: "i-lucide-house",
          to: "/targets",
        },
      ],
    },

    {
      label: "Active Directory",
      type: "label",
      slot: "adlabel",
      defaultOpen: true,
      icon: "i-lucide-database",
      children: [
        {
          label: "Domains",
          icon: "i-lucide-house",
          to: "/domains",
          badge: '3',
        },
        {
          label: "Hosts",
          icon: "i-lucide-cloud-download",
          to: "/hosts",
          badge: '5',
        },
        {
          label: "Services",
          icon: "i-lucide-smile",
          to: "/services",
          badge: '12',
        },
        {
          label: "Users",
          icon: "i-lucide-swatch-book",
          badge: '15',
          to: "/users",
        },
      ],
    },
  ],
  [
    {
      label: "Logs",
      icon: "i-lucide-file-text",
      to: "/events",
    },
    {
      label: "Loot",
      icon: "i-lucide-box",
      to: "/",
    },
  ],
]);
</script>

<template>
  <UNavigationMenu
    highlight
    highlight-color="primary"
    orientation="vertical"
    :items="items"
    class="data-[orientation=vertical]:w-48"
  >
    <template #adpwnlabel-label="{ item }">
      <div class="text-xs">
        {{ item.label }}
      </div>
    </template>
    <template #adlabel-label="{ item }">
      <div class="text-xs">
        {{ item.label }}
      </div>
    </template>
  </UNavigationMenu>
</template>
