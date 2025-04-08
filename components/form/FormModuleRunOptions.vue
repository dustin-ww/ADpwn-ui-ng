<script setup lang="ts">
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import { ModuleOptionType } from "~/types/adpwn/ADPwnModuleOption";

const props = defineProps<{
  moduleKey: string;
}>();

const moduleStore = useADPwnModuleStore();
const module = ref<ADPwnModule>();

onMounted(async () => {
  module.value = await moduleStore.fetchSingleModule(props.moduleKey);
});
</script>
<template>
  <div v-if="module?.options.length != 0">
    <div v-for="option in module?.options || []" :key="option.key">
      <h1>Config for {{ option.key }}</h1>
      <UFormField
        v-if="option.type == ModuleOptionType.TextInput"
        :label="option.key"
        class="w-full"
      >
        <UInput placeholder="Enter your value..." />
      </UFormField>
      <UCheckbox
        v-if="option.type == ModuleOptionType.Checkbox"
        default-value
      />
    </div>
    <UButton label="Run Module" color="primary" class="mt-5" />
  </div>
</template>
