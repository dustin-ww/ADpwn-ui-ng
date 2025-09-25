<script setup lang="ts">
import type { StepperItem } from "@nuxt/ui";
import type { ADPwnModule } from "~/types/adpwn/ADPwnModule";
import type { ADPwnModuleOption} from "~/types/adpwn/ADPwnModuleOption";
import { ModuleOptionType } from "~/types/adpwn/ADPwnModuleOption";

const props = defineProps<{
  moduleKey: string;
}>();

const moduleStore = useADPwnModuleStore();
const module = ref<ADPwnModule>();
const dependencyStepperItems = ref<StepperItem[]>([]);
const toast = useToast();
const options = ref<ADPwnModuleOption[]>([]);

// Create a reactive object to store all option values
const optionValues = ref<Record<string, any>>({});

const emit = defineEmits<{
  (e: "submit-success"): void;
}>();

// Function to run the module with collected values
const runModule = async () => {
  try {
    const { error } = await moduleStore.runAttackVector(
      module.value?.key ?? ""
      //optionValues.value
    );

    if (error) {
      toast.add({
        title: "Error",
        description: error.message || "Domain creation failed",
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
    toast.add({
      title: "Error",
      description: "An unexpected error occurred: " + (error as Error).message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
  try {
    console.log("Running module with options:", optionValues.value);
    // Here you can send the values to your backend or process them
    // Example: await moduleStore.executeModule(module.value?.key, optionValues.value);
    
    // You could add a success notification here
  } catch (error) {
    console.error("Error running module:", error);
    // You could add an error notification here
  }
};

onMounted(async () => {
  module.value = await moduleStore.getModuleWithDependencies(props.moduleKey);
  options.value = await moduleStore.fetchAttackVectorOptions(props.moduleKey);
  console.log("module", module.value);
  console.log("options", options.value);
  
  // Initialize the option values with defaults
  if (options.value) {
    options.value.forEach(option => {
      // Set default values based on option type
      if (option.type === ModuleOptionType.Checkbox) {
        optionValues.value[option.key] = true; // Default checkbox to checked
      } else {
        optionValues.value[option.key] = option.default_value || ""; // Use default or empty string
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
      <h2 class="text-xl font-semibold text-gray-100">Module Options</h2>
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
      </div>
    </div>
    <div v-else class="space-y-6 p-6 bg-gray-800 rounded-lg shadow-md mt-5">
      <h2 class="text-xl font-semibold text-gray-100">No Options</h2>
      <p class="text-gray-300">This module has no options to configure.</p>
    </div>
    
    <!-- Run Button -->
    <UButton
      label="Run Module"
      color="primary"
      @click="runModule"
      class="mt-5 w-full py-3 text-lg font-medium text-gray-100 cursor-pointer"
    />
  </div>
</template>