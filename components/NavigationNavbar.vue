<script setup lang="ts">
const projectStore = useProjectStore();

const items = ref([
  [
    {
      label: "ADPwn Modules",
      icon: "i-lucide-book-open",
      active: true,
      defaultOpen: true,
      children: [
        {
          label: "Graph",
          description:
            "See Graph with Dependencies between loaded ADPwn Modules.",
          icon: "i-lucide-house",
          to: "/modules",
        },
        {
          label: "Module List",
          description:
            "Learn how to install and configure Nuxt UI in your application.",
          icon: "i-lucide-cloud-download",
        },
        {
          label: "Run Queue",
          icon: "i-lucide-smile",
          description:
            "You have nothing to do, @nuxt/icon will handle it automatically.",
        },
        {
          label: "Logs",
          icon: "i-lucide-swatch-book",
          description:
            "Choose a primary and a neutral color from your Tailwind CSS theme.",
        },
        {
          label: "Recommendations",
          description:
            "See Graph with Dependencies between loaded ADPwn Modules.",
          icon: "i-lucide-house",
        },
      ],
    },
    {
      label: "Network",
      icon: "i-lucide-database",
      children: [
        {
          label: "Network Graph",
          icon: "i-lucide-file-text",
          description: "Define shortcuts for your application.",
          to: "/composables/define-shortcuts",
        },
        {
          label: "Discovered Network Changes",
          icon: "i-lucide-file-text",
          description: "Display a modal/slideover within your application.",
          to: "/composables/use-overlay",
        },
      ],
    },
    {
      label: "Collections",
      icon: "i-lucide-box",
      to: "/components",
      children: [
        {
          label: "Collection List",
          icon: "i-lucide-file-text",
          description: "Use NuxtLink with superpowers.",
          to: "/components/link",
        },
        {
          label: "Collection Manager",
          icon: "i-lucide-file-text",
          description: "Display a modal within your application.",
          to: "/components/modal",
        },
        {
          label: "History",
          icon: "i-lucide-file-text",
          description: "Display a list of links.",
          to: "/components/navigation-menu",
        },
      ],
    },
  ],
  [
    {
      label: "Current Project: " + projectStore.projectName,
    },
    {
      label: "GitHub",
      icon: "i-simple-icons-github",
      to: "https://github.com/dustin-ww",
      target: "_blank",
    },
  ],
]);
</script>

<template>
  <UNavigationMenu
    highlight
    highlight-color="primary"
    orientation="horizontal"
    :items="items"
    class="data-[orientation=horizontal]:border-b border-(--ui-border) data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-48"
  />
</template>
