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
      icon: "i-lucide-settings",
      children: [
        {
          label: "Domains",
          icon: "i-lucide-house",
          to: "/domains",
        },
        {
          label: "Hosts",
          icon: "i-lucide-cloud-download",
          to: "/hosts",
        },
        {
          label: "Services",
          icon: "i-lucide-smile",
         
          to: "/services",
        },
        {
          label: "Users",
          icon: "i-lucide-swatch-book",
        
          to: "/users",
        },
      ],
    },
  ],
  [
    {
      label: "Logs",
      icon: "i-lucide-database",
      children: [
        {
          label: "See Logs",
          icon: "i-lucide-file-text",
          to: "/events",
        },
      ],
    },
    {
      label: "Loot",
      icon: "i-lucide-box",
      to: "/",
      children: [
        {
          label: "All",
          icon: "i-lucide-file-text",
          to: "/",
        },
      ],
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
