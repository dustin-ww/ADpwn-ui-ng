<script setup lang="ts">
const items = ref([
  [
    {
      label: "Active Directory",
      type: "label",
    },
    {
      label: "Config",
      icon: "i-lucide-book-open",
      active: true,
      defaultOpen: true,
      children: [
        {
          label: "Project",
          description: "Fully styled and customizable components for Nuxt.",
          icon: "i-lucide-house",
          to: "/project",
        },
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
    {
      label: "Logs",
      icon: "i-lucide-database",
      children: [
        {
          label: "See Logs",
          icon: "i-lucide-file-text",
          description: "Define shortcuts for your application.",
          to: "/composables/define-shortcuts",
        },
        {
          label: "Configure",
          icon: "i-lucide-file-text",
          description: "Display a modal/slideover within your application.",
          to: "/composables/use-overlay",
        },
      ],
    },
    {
      label: "Loot",
      icon: "i-lucide-box",
      to: "/components",
      children: [
        {
          label: "All",
          icon: "i-lucide-file-text",
          description: "Use NuxtLink with superpowers.",
          to: "/components/link",
        },
      ],
    },
    {
      label: "ADPwn",
      type: "label",
    },
  ],
  [
    {
      label: "Help",
      icon: "i-lucide-circle-help",
      disabled: true,
    },
  ],
]);
</script>

<template>
  <UNavigationMenu
    orientation="vertical"
    :items="items"
    class="data-[orientation=vertical]:w-48"
  />
</template>
