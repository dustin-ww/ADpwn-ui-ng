<script setup lang="ts"></script>

<template>
  <div>
    <SharedHeading heading="Manage Project" />
    <div
      class="grid grid-cols-2 gap-x-10 justify-items-center w-full max-w-4xl mx-auto px-4 text-center"
    >
      <div class="w-full bg-black border-solid rounded-lg">
        Configure Project
        <FormConfigureProject />
      </div>
      <div class="w-full bg-black border-solid rounded-lg">
        Configure Targets
        <ListTarget />
        <ModalModelCreateTarget />
      </div>
    </div>
  </div>
</template>
