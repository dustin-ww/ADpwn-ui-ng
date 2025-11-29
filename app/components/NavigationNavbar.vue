<script setup lang="ts">
import { useCurrentProjectStore } from "~/stores/currentProjectStore";

const currentProjectStore = useCurrentProjectStore;

const items = ref([
  [
    {
      label: "ADPwnn Modules",
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
          to: "/modules/list",
        },
        {
          label: "Run Queue",
          icon: "i-lucide-smile",
          to: "/modules/queue",
          description:
            "You have nothing to do, @nuxt/icon will handle it automatically.",
        },

        {
          label: "History",
          to: "/modules/history",
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
          to: "/network",
        },
        {
          label: "Discovered Network Changes",
          icon: "i-lucide-file-text",
          description: "Display a modal/slideover within your application.",
          to: "/",
        },
      ],
    },
    {
      label: "Collections",
      icon: "i-lucide-box",
      children: [
        {
          label: "Collection List",
          icon: "i-lucide-file-text",
          description: "Use NuxtLink with superpowers.",
          to: "/collections",
        },
        {
          label: "Collection Manager",
          icon: "i-lucide-file-text",
          description: "Display a modal within your application.",
          to: "/",
        },
        {
          label: "History",
          icon: "i-lucide-file-text",
          description: "Display a list of links.",
          to: "/",
        },
      ],
    },
  ],
  [
    {
      label: "Current Project: " + currentProjectStore().name,
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
    class="data-[orientation=horizontal]:border-b border-(--ui-border) data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-48 z-50"
  />
</template>
