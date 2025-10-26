<script setup lang="ts"></script>

<template>
  <div class="flex flex-col h-screen">
    <div class="grid grid-cols-10 flex-shrink-0 h-full">
      <div
        class="col-span-1 flex flex-col justify-center items-center space-y-4 mt-4"
      >
        <NuxtLink to="/">
          <!-- <img
            class="w-1/12 min-w-[80px] max-w-[110px]"
            src="/ADPwnLogo.png"
            alt="Logo"
          /> -->
        </NuxtLink>
        <ProjectSelector />
        <NavigationSidebar />
        <div class="mt-auto">
          <StatusViewer />
        </div>
      </div>
      <div class="col-span-9 h-full">
        <NavigationNavbar />
        <main>
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
