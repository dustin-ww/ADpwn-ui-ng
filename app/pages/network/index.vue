<script setup lang="ts">
useHead({
  title: "Network Manager • ADPwn",
});
</script>

<template>
  <div class="size-full">
    <div class="flex items-center justify-between">
      <SharedHeading heading="Network Explorer" />
      <UButton>
       <NuxtLink to="/network/ratel">Ratel Debug Explorer</NuxtLink>
      </UButton>
    </div>
    <div class="size-full">
      <UCollapsible class="flex flex-col gap-2 min-w-80">
        <UButton
          class="group min-w-80"
          label="Advanced Search"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-chevron-down"
          :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
          }"
          block
        />

        <template #content>
          <div class="grid grid-cols-3 gap-4 items-center">
            <USelectMenu v-model="value" :items="items" placeholder="Select visible node types"/>
            <USwitch v-model="value" label="Show High Value Targets"/>
            <UButton color="success" variant="outline">Apply Filters</UButton>
          </div>
        </template>
      </UCollapsible>
      <GraphNetwork class="mt-1"/>
    </div>
  </div>
</template>
