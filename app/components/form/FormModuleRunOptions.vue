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
  creator: "admin",
  priority: "medium"
});

// NEU: SSE EventSource
const eventSource = ref<EventSource | null>(null);
const currentRunId = ref<string | null>(null);

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

// NEU: SSE Connection Setup
const setupSSEConnection = (runId: string) => {
  // Close existing connection if any
   if (eventSource.value) {
    eventSource.value.close();
  }

  // GEÄNDERT: Von /recommendation zu /sse
  const sseUrl = `http://localhost:8082/recommendation?runId=${runId}`;
  eventSource.value = new EventSource(sseUrl);

  eventSource.value.addEventListener('connected', (event) => {
    console.log('[SSE] Connected:', JSON.parse(event.data));
  });

  eventSource.value.addEventListener('log', (event) => {
    const logData = JSON.parse(event.data);
    console.log('[SSE] Log:', logData);
  });

eventSource.value.addEventListener('recommendation', (event) => {
  const moduleKey = event.data; // <-- KEIN JSON.parse

  console.log('[SSE] Recommendation received:', moduleKey);

  toast.add({
    title: "Recommendation Available",
    description: `Recommended next module: ${moduleKey}`,
    color: "info",
  });
});


  eventSource.value.addEventListener('heartbeat', (event) => {
    // Silent heartbeat
  });

  eventSource.value.addEventListener('module_complete', (event) => {
    const data = JSON.parse(event.data);
    console.log('[SSE] Module completed:', data);
  });

  eventSource.value.addEventListener('module_error', (event) => {
    const data = JSON.parse(event.data);
    console.error('[SSE] Module error:', data);
    toast.add({
      title: "Module Error",
      description: data.payload?.error || "An error occurred",
      color: "error",
    });
  });

  eventSource.value.onerror = (error) => {
    console.error('[SSE] Connection error:', error);
    eventSource.value?.close();
  };
};

// NEU: Cleanup SSE Connection
const closeSSEConnection = () => {
  if (eventSource.value) {
    eventSource.value.close();
    eventSource.value = null;
  }
};

const runModule = async () => {
  isLoading.value = true;
  
  try {
    const moduleParameters = buildModuleParameters();
    
    console.log("Module Parameters JSON:", JSON.stringify(moduleParameters, null, 2));
    
    const { data, error } = await moduleStore.runAttackVector(
      module.value?.key ?? "",
      moduleParameters 
    );

    console.log("Run Module Response:", data, error);

    if (error) {
      toast.add({
        title: "Error",
        description: error.message || "Module execution failed",
        color: "error",
      });
      return;
    }

    // NEU: Setup SSE Connection mit der runId aus der Response
    if (data?.runUid) {
      currentRunId.value = data.runUid;
      console.log
      setupSSEConnection(data.runUid);
      console.log('[SSE] Connected to runId:', data.runUid);
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
  
  if (module.value?.dependencyVector) {
    const copiedDependencyVector = [...module.value.dependencyVector];
    copiedDependencyVector.push({
      key: module.value.key,
      description: module.value.description || "No description available",
      attackId: "",
      executionMetric: "",
      name: "",
      version: "",
      author: "",
      moduleType: "",
      lootPath: "",
      options: [],
      dependencyVectorKeys: [],
      dependencyVector: [],
    });
    dependencyStepperItems.value = copiedDependencyVector.map((dependency) => ({
      title: dependency.key,
      description: dependency.description || "No description available",
      icon: dependency.icon || "i-lucide-box",
    }));
  }
});

// NEU: Cleanup beim Unmount
onUnmounted(() => {
  closeSSEConnection();
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
      v-if="module?.dependencyVector.length != 0"
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