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
            "Explore Dependency Graph of loaded ADPwn Modules.",
          icon: "i-lucide-house",
          to: "/modules",
        },
        {
          label: "Module Library",
          description:"See all available ADPwn Modules.",
          icon: "i-lucide-cloud-download",
          to: "/modules/list",
        },

        {
          label: "History",
          to: "/modules/history",
          description:"View the history of module executions.",
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
         description: "View network graph of the system assets.",
          to: "/network",
        },
        {
          label: "Asset Tree",
          icon: "i-lucide-file-text",
          description: "Display a overview of recent network changes.",
          to: "/network/list",
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
