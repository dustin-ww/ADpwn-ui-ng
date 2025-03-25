<script setup lang="ts"></script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <div class="grid grid-cols-10 flex-shrink-0">
      <div
        class="col-span-1 flex flex-col justify-center items-center space-y-4 mt-4"
      >
        <NuxtLink to="/">
          <img
            class="w-1/12 min-w-[80px] max-w-[110px]"
            src="/ADPwnLogo.png"
            alt="Logo"
          />
        </NuxtLink>
        <ProjectSelector />
        <NavigationSidebar />
        <div class="mt-auto">
          <StatusViewer />
        </div>
      </div>
      <div class="col-span-9">
        <NavigationNavbar />
        <main class="h-full">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
