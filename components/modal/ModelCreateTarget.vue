<template>
  <UModal :dismissible="false" title="Create Target">
    <UButton
      label="Create Target"
      color="success"
      variant="subtle"
      class="flex justify-center items-center mx-auto"
    />
    <template #body>
      <FormCreateTarget />
    </template>
  </UModal>
</template>
