<script setup lang="ts">
import { NavigationNavbar } from '#components';

const navbarlinks = [
  [
    {
      label: "Scripts",
      icon: "i-heroicons-chart-bar",
      to: "/",
    },
    {
      label: "Collections",
      icon: "i-heroicons-command-line",
      to: "/collections",
    },
    {
      label: "Network",
      icon: "i-heroicons-command-line",
      to: "/network",
    },
  ],
  [
    {
      label: "Github",
      icon: "mdi:github",
      to: "https://github.com/dustin-ww/ADPwn-UI",
      target: "_blank",
    },
    {
      label: "More",
      icon: "mdi:unfold-more-vertical",
      to: "https://dw-security.com/",
      target: "_blank",
    },
  ],
];

const sidebarlinks = [
  {
    label: "Dashboard",
    icon: "material-symbols:dashboard",
    to: "/",
  },
  {
    label: "Project",
    icon: "material-symbols:assignment-add-outline",
    to: "/project",
  },
  {
    label: "Domains",
    icon: "material-symbols:assignment-add-outline",
    to: "/domains",
  },
  {
    label: "Hosts",
    icon: "material-symbols:host",
    to: "/hosts",
  },
  {
    label: "Services",
    icon: "material-symbols:tools-wrench-outline-sharp",
    to: "/services",
  },
  {
    label: "Users",
    icon: "material-symbols:supervisor-account",
    to: "/users",
  },
  { type: "divider" },
  {
    label: "Logs",
    icon: "material-symbols:book-2-outline-rounded",
    to: "/logs",
  },
  {
    label: "Loot",
    icon: "material-symbols:money-bag",
    to: "/loot",
  },
];
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Navbar -->
    <div class="grid grid-cols-10 flex-shrink-0">
      <div class="col-span-1">
        <ProjectSelector />
      </div>
      <div class="col-span-9">
        <NavigationNavbar/>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-10 flex-grow overflow-hidden">
      <div class="col-span-1 flex flex-col justify-between">
        <!-- Navigation oben -->
        <div class="overflow-y-auto">
          <NavigationSidebar/>
        </div>

        <!-- StatusViewer unten -->
        <div class="mt-auto">
          <StatusViewer />
        </div>
      </div>

      <div class="col-span-9 overflow-auto">
        <main class="h-full">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
