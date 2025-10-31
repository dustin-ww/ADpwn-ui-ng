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
          description: "Fully styled and customizable components for Nuxt.",
          icon: "i-lucide-house",
          to: "/project",
        },
        {
          label: "Targets",
          description: "Fully styled and customizable components for Nuxt.",
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
          description: "Fully styled and customizable components for Nuxt.",
          icon: "i-lucide-house",
          to: "/domains",
        },
        {
          label: "Hosts",
          description:
            "Learn how to install and configure Nuxt UI in your application.",
          icon: "i-lucide-cloud-download",
          to: "/hosts",
        },
        {
          label: "Services",
          icon: "i-lucide-smile",
          description:
            "You have nothing to do, @nuxt/icon will handle it automatically.",
        },
        {
          label: "Users",
          icon: "i-lucide-swatch-book",
          description:
            "Choose a primary and a neutral color from your Tailwind CSS theme.",
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
          description: "Define shortcuts for your application.",
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
          description: "Use NuxtLink with superpowers.",
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
