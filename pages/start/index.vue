<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>

<template>
  <div>
    <h1>Welcome to ADPwn</h1>
    <img class="justify-self-center w-1/12 min-w-[100px] max-w-[150px] mx-6 mt-4" src="/ADPwnLogo.png">
    <ProjectList>
      <template #row-actions="{ row }">
        <UButton>
          Load {{ row.original.name }}
        </UButton>
      </template>
    </ProjectList>
  </div>
</template>
