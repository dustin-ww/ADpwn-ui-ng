<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import type { ADPwnModuleOption} from "~/types/adpwn/ADPwnModuleOption";
import { ModuleOptionType } from "~/types/adpwn/ADPwnModuleOption";

interface Input<T = unknown> {
  type: string;
  value: T;
}

const props = defineProps<{
  moduleKey: string;
}>();

const moduleStore = useADPwnModuleStore();
const module = ref<ADPwnModule>();
const dependencyStepperItems = ref<StepperItem[]>([]);
const currentProjectStore = useCurrentProjectStore();
const toast = useToast();
const options = ref<ADPwnModuleOption[]>([]);
const isLoading = ref(false);

const optionValues = ref<Record<string, any>>({});

const metadata = ref<Record<string, string>>({
  creator: "admin", // Default values
  priority: "medium"
});

const emit = defineEmits<{
  (e: "submit-success"): void;
}>();

// Function to map ModuleOptionType to string type
const mapOptionTypeToString = (type: ModuleOptionType): string => {
  switch (type) {
    case ModuleOptionType.TextInput:
      return "textInput";
    case ModuleOptionType.Checkbox:
      return "checkbox";
    case ModuleOptionType.TargetInput:
      return "targetInput";
    default:
      return "textInput";
  }
};

// Function to build ADPwnModuleParameters from current option values
const buildModuleParameters = (): ADPwnModuleParameters => {
  const inputs: Record<string, Input<any>> = {};
  
  if (options.value) {
    options.value.forEach(option => {
      inputs[option.key] = {
        type: mapOptionTypeToString(option.type),
        value: optionValues.value[option.key]
      };
    });
  }
  
  return {
    project_uid: currentProjectStore.getUID,
    metadata: metadata.value,
    inputs: inputs
  };
};

const runModule = async () => {
  isLoading.value = true;
  
  try {
    const moduleParameters = buildModuleParameters();
    
    console.log("Module Parameters JSON:", JSON.stringify(moduleParameters, null, 2));
    
    const { error } = await moduleStore.runAttackVector(
      module.value?.key ?? "",
      moduleParameters 
    );

    if (error) {
      toast.add({
        title: "Error",
        description: error.message || "Module execution failed",
        color: "error",
      });
      return;
    }

    toast.add({
      title: "Success",
      description: "Module execution started successfully",
      color: "success",
    });

    emit("submit-success");
  } catch (error) {
    console.error("Error running module:", error);
    toast.add({
      title: "Error",
      description: "An unexpected error occurred: " + (error as Error).message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  module.value = await moduleStore.getModuleWithDependencies(props.moduleKey);
  options.value = await moduleStore.fetchAttackVectorOptions(props.moduleKey);
  console.log("module", module.value);
  console.log("options", options.value);
  
  if (options.value) {
    options.value.forEach(option => {
      if (option.type === ModuleOptionType.Checkbox) {
        optionValues.value[option.key] = true; 
      } else if (option.type === ModuleOptionType.TargetInput) {
        optionValues.value[option.key] = []; 
      } else {
        optionValues.value[option.key] = option.default_value || "";
      }
    });
  }
  
  if (module.value?.dependency_vector) {
    const copiedDependencyVector = [...module.value.dependency_vector];
    copiedDependencyVector.push({
      key: module.value.key,
      description: module.value.description || "No description available",
      attack_id: "",
      execution_metric: "",
      name: "",
      version: "",
      author: "",
      module_type: "",
      loot_path: "",
      options: [],
      dependency_vector_keys: [],
      dependency_vector: [],
    });
    dependencyStepperItems.value = copiedDependencyVector.map((dependency) => ({
      title: dependency.key,
      description: dependency.description || "No description available",
      icon: dependency.icon || "i-lucide-box",
    }));
  }
});
</script>

<template>
  <div>
    <!-- Metadata Section -->
    <div class="space-y-6 p-6 bg-gray-800 rounded-lg shadow-md mb-5">
      <h2 class="text-xl font-semibold text-gray-100">Module Metadata</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Creator" class="w-full">
          <UInput
            v-model="metadata.creator"
            placeholder="Enter creator name..."
            class="w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md"
          />
        </UFormField>
        <UFormField label="Priority" class="w-full">
          <USelect
            v-model="metadata.priority"
            :options="[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' }
            ]"
            class="w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md"
          />
        </UFormField>
      </div>
    </div>

    <!-- Module Dependencies -->
    <div
      v-if="module?.dependency_vector.length != 0"
      class="space-y-6 p-6 bg-gray-800 rounded-lg shadow-md"
    >
      <h2 class="text-xl font-semibold text-gray-100">Module Dependencies</h2>
      <UStepper :items="dependencyStepperItems" class="w-full text-gray-100">
        <template #title="{ item }">
          <h3
            v-if="item.title === module?.key"
            class="text-lg font-medium text-blue-400"
          >
            {{ item.title }}
          </h3>
        </template>
      </UStepper>
      <UBadge class="text-black font-bold">
        > These modules are also queued as dependencies and executed
        automatically.</UBadge>
    </div>
    <div v-else class="space-y-6 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-100">No Dependencies</h2>
      <p class="text-gray-300">This module has no dependencies to display.</p>
    </div>
    
    <!-- Module Options -->
    <div
      v-if="options && options.length > 0"
      class="space-y-6 p-6 bg-gray-800 rounded-lg shadow-md mt-5"
    >
      <h2 class="text-xl font-semibold text-gray-100">Module Inputs</h2>
      <div
        v-for="option in options"
        :key="option.key"
        class="space-y-4"
      >
        <h3 class="text-lg font-medium text-gray-300">{{ option.label }}</h3>
        
        <!-- Text input -->
        <UFormField
          v-if="option.type == ModuleOptionType.TextInput"
          class="w-full"
        >
          <UInput
            v-model="optionValues[option.key]"
            :placeholder="option.placeholder || 'Enter a value...'"
            class="w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md"
          />
        </UFormField>
        
        <!-- Checkbox input -->
        <div
          v-if="option.type == ModuleOptionType.Checkbox"
          class="flex items-center space-x-2"
        >
          <UCheckbox
            v-model="optionValues[option.key]"
            class="text-gray-100 border-gray-600 bg-gray-700"
          />
          <label class="text-gray-300">{{ option.label }}</label>
        </div>

        <div
          v-if="option.type == ModuleOptionType.TargetInput"
          class="space-y-2"
        >
          <UTextarea
            v-model="optionValues[option.key]"
            :placeholder="option.placeholder || 'Enter target data as JSON...'"
            class="w-full border-gray-600 bg-gray-700 text-gray-100 rounded-md"
            rows="4"
          />
          <p class="text-xs text-gray-400">
            Enter target data as JSON array (e.g., [{"uid":"0x1","name":"Server 1","ip_range":"192.168.1.1-10"}])
          </p>
        </div>
      </div>
    </div>
    <div v-else class="space-y-6 p-6 bg-gray-800 rounded-lg shadow-md mt-5">
      <h2 class="text-xl font-semibold text-gray-100">No Inputs</h2>
      <p class="text-gray-300">This module has no inputs to configure.</p>
    </div>
    
    <!-- Run Button -->
    <UButton
      :label="isLoading ? 'Running...' : 'Run Module'"
      :loading="isLoading"
      :disabled="isLoading"
      color="primary"
      class="mt-5 w-full py-3 text-lg font-medium text-gray-100 cursor-pointer"
      @click="runModule"
    />
  </div>
</template>