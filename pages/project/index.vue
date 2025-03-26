<script setup lang="ts"></script>

<template>
  <div>
    <SharedHeading heading="Manage Project" />
    <div
      class="grid grid-cols-2 gap-x-10 justify-items-center w-full mx-auto px-4 text-center"
    >
      <div class="w-full bg-black border-solid rounded-lg">
        <h1 class="text-2xl mt-5">Configure Project</h1>
        <FormConfigureProject />
      </div>
      <div class="w-full bg-black border-solid rounded-lg">
        <h1 class="text-2xl mt-5">Configure Targets</h1>
        <div class="mb-10 mt-10">
          <ListTarget />
          <ModalModelCreateTarget class="w-1/2" />
        </div>
      </div>
    </div>
  </div>
</template>
