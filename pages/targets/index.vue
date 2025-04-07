<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

useHead({
  title: "Targets • ADPwn",
});
const items = ref<TabsItem[]>([
  {
    label: "Known Targets",
    icon: "i-lucide-user",
    content: "This is the account content.",
    slot: "knownTargets",
  },
  {
    label: "Uknown Target Ranges",
    icon: "i-lucide-lock",
    content: "This is the password content.",
    slot: "unknownTargetRanges",
  },
]);
</script>

<template>
  <div>
    <SharedHeading heading="Manage Targets" />
    <div class="mb-10 mt-10">
      <UTabs :content="false" :items="items" class="w-full" />
      <ListTarget />
      <ModalModelCreateTarget class="w-1/2" />
    </div>
  </div>
</template>
