<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import * as vNG from "v-network-graph";
import * as d3 from "d3-force";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";
import { useADPwnModuleApi } from "~/composables/api/useADwnModuleApi";

// Types
interface Node extends vNG.Node {
  size: number;
  color: string;
  label?: boolean;
  moduleType?: string;
}

interface Edge extends vNG.Edge {
  width: number;
  color: string;
  dashed?: boolean;
}

interface D3Node {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link {
  source: string | D3Node;
  target: string | D3Node;
}

// Constants
const NODE_SIZE = 40;
const FIT_CONTENT_MARGIN = 80;

const MODULE_TYPE_COLORS = {
  AttackModule: "#ff5252",
  EnumerationModule: "#4caf50",
  EXPLOIT: "#ff9800",
  POST_EXPLOIT: "#2196f3",
  default: "#9c27b0",
} as const;

const MODULE_TYPE_LABELS = {
  AttackModule: "Attack Module",
  EnumerationModule: "Enumeration Module",
  EXPLOIT: "Exploit",
  POST_EXPLOIT: "Post-Exploit",
} as const;

const MODULE_TYPE_BG_COLORS = {
  AttackModule: "bg-red-500",
  EnumerationModule: "bg-green-500",
  EXPLOIT: "bg-orange-500",
  POST_EXPLOIT: "bg-blue-500",
  default: "bg-purple-500",
} as const;

// Composables
const { getGraph } = useADPwnModuleApi();

// State
const nodes = ref<Record<string, Node>>({});
const edges = ref<Record<string, Edge>>({});
const layouts = ref<{ nodes: Record<string, { x: number; y: number }> }>({
  nodes: {},
});
const loading = ref(true);
const error = ref<string | null>(null);
const graph = ref<vNG.VNetworkGraphInstance>();
const simulation = ref<d3.Simulation<D3Node, D3Link> | null>(null);
const graphData = ref<ADPwnInheritanceGraph>({
  nodes: [],
  edges: [],
});

// Modal State
const isModalOpen = ref(false);
const selectedModule = ref<any>(null);

// Computed
const isClient = computed(() => typeof window !== "undefined");

// Helper Functions
const getNodeColor = (moduleType: string): string => {
  return MODULE_TYPE_COLORS[moduleType as keyof typeof MODULE_TYPE_COLORS] ?? MODULE_TYPE_COLORS.default;
};

const getModuleTypeLabel = (type: string): string => {
  return MODULE_TYPE_LABELS[type as keyof typeof MODULE_TYPE_LABELS] ?? type;
};

const getModuleTypeColor = (type: string): string => {
  return MODULE_TYPE_BG_COLORS[type as keyof typeof MODULE_TYPE_BG_COLORS] ?? MODULE_TYPE_BG_COLORS.default;
};

const convertToGraphFormat = (graphDataInput: ADPwnInheritanceGraph) => {
  const graphNodes: Record<string, Node> = {};
  const graphEdges: Record<string, Edge> = {};
  const nodeLayouts: Record<string, { x: number; y: number }> = {};

  graphDataInput.nodes.forEach((module) => {
    const nodeId = module.key;
    graphNodes[nodeId] = {
      name: module.name,
      size: NODE_SIZE,
      color: getNodeColor(module.moduleType),
      label: true,
      moduleType: module.moduleType,
    };
    nodeLayouts[nodeId] = { x: 0, y: 0 };
  });

  graphDataInput.edges.forEach((edge, index) => {
    const edgeId = `edge${index}`;
    graphEdges[edgeId] = {
      source: edge.previousModule,
      target: edge.nextModule,
      width: 3,
      color: "#aaaaaa",
      dashed: false,
    };
  });

  return {
    nodes: graphNodes,
    edges: graphEdges,
    layouts: {
      nodes: nodeLayouts,
    },
  };
};

const applyD3ForceLayout = (): void => {
  const nodeArray = Object.keys(nodes.value);
  const edgeArray = Object.values(edges.value);

  if (nodeArray.length === 0) return;

  // Stop existing simulation
  if (simulation.value) {
    simulation.value.stop();
  }

  // Create D3 nodes
  const d3Nodes: D3Node[] = nodeArray.map(nodeId => ({
    id: nodeId,
    x: layouts.value.nodes[nodeId]?.x || Math.random() * 800,
    y: layouts.value.nodes[nodeId]?.y || Math.random() * 600,
  }));

  // Create D3 links
  const d3Links: D3Link[] = edgeArray.map(edge => ({
    source: edge.source,
    target: edge.target,
  }));

  // Create force simulation
  simulation.value = d3.forceSimulation<D3Node>(d3Nodes)
    .force('link', d3.forceLink<D3Node, D3Link>(d3Links)
      .id(d => d.id)
      .distance(150)
      .strength(0.5)
    )
    .force('charge', d3.forceManyBody<D3Node>()
      .strength(-300)
    )
    .force('center', d3.forceCenter<D3Node>(400, 300))
    .force('collision', d3.forceCollide<D3Node>()
      .radius(d => {
        const node = nodes.value[d.id];
        return (node?.size || NODE_SIZE) / 2 + 10;
      })
    )
    .alphaDecay(0.02)
    .velocityDecay(0.3);

  // Update positions on each tick
  simulation.value.on('tick', () => {
    const newLayouts = { nodes: { ...layouts.value.nodes } };
    
    d3Nodes.forEach(d3Node => {
      newLayouts.nodes[d3Node.id] = {
        x: d3Node.x || 0,
        y: d3Node.y || 0,
      };
    });
    
    layouts.value = newLayouts;
  });

  // Stop simulation after it settles
  simulation.value.on('end', () => {
    console.log('D3 Force simulation ended');
  });
};

const closeModal = (): void => {
  isModalOpen.value = false;
  selectedModule.value = null;
};

const handleNodeClick = ({ node }: { node: string }): void => {
  const moduleKey = node;
  const module = graphData.value.nodes.find((n) => n.key === moduleKey);
  if (module) {
    selectedModule.value = module;
    isModalOpen.value = true;
  }
};

const fitGraphToView = async (): Promise<void> => {
  await nextTick();
  setTimeout(() => {
    graph.value?.fitToContents();
  }, 200);
};

const loadGraphData = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;

    const data = await getGraph();
    graphData.value = data.data ?? { nodes: [], edges: [] };

    const formattedGraph = convertToGraphFormat(graphData.value);
    nodes.value = formattedGraph.nodes;
    edges.value = formattedGraph.edges;
    layouts.value = formattedGraph.layouts;

    // Apply D3 force layout
    await nextTick();
    applyD3ForceLayout();

    // Fit to view after simulation settles
    setTimeout(async () => {
      await fitGraphToView();
    }, 1000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "An unknown error occurred";
    console.error("Error loading graph data:", err);
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const eventHandlers: vNG.EventHandlers = {
  "node:click": handleNodeClick,
};

// Configs
const configs = vNG.defineConfigs<Node, Edge>({
  view: {
    autoPanAndZoomOnLoad: "fit-content",
    fitContentMargin: FIT_CONTENT_MARGIN,
    scalingObjects: true,
    minZoomLevel: 0.1,
    maxZoomLevel: 16,
  },
  node: {
    normal: {
      type: "circle",
      radius: (node) => node.size / 2,
      color: (node) => node.color,
    },
    hover: {
      radius: (node) => node.size / 2 + 5,
      color: (node) => node.color,
    },
    selectable: true,
    label: {
      visible: (node) => !!node.label,
      direction: "center",
      color: "#ffffff",
      fontSize: 12,
      fontFamily: "Arial, sans-serif",
    },
    focusring: {
      color: "#ffffff",
    },
  },
  edge: {
    normal: {
      width: (edge) => edge.width,
      color: (edge) => edge.color,
      dasharray: (edge) => (edge.dashed ? "4" : "0"),
    },
    hover: {
      width: (edge) => edge.width + 1,
    },
    margin: 4,
    marker: {
      source: { type: "none" },
      target: { type: "arrow" },
    },
  },
});

// Lifecycle
onMounted(async () => {
  await loadGraphData();
});

// Cleanup
onUnmounted(() => {
  if (simulation.value) {
    simulation.value.stop();
  }
});
</script>

<template>
  <ClientOnly>
    <div class="relative w-full h-screen bg-gray-900">
      <!-- Control Panel -->
      <div v-if="!loading && !error" class="absolute top-5 left-5 z-10">
        <button 
          @click="fitGraphToView"
          class="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Fit to View
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-lg text-center">
        Loading Module Inheritance Graph...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-lg text-center">
        {{ error }}
      </div>

      <!-- Graph -->
      <template v-else>
        <v-network-graph
          ref="graph"
          class="w-full h-full"
          :nodes="nodes"
          :edges="edges"
          :layouts="layouts"
          :configs="configs"
          :event-handlers="eventHandlers"
        />
      </template>

      <!-- Modal -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        leave-active-class="transition-opacity duration-300 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

          <!-- Modal Content -->
          <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            leave-active-class="transition-transform duration-300 ease-in"
            enter-from-class="scale-90"
            leave-to-class="scale-90"
          >
            <div
              v-if="isModalOpen"
              class="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
              @click.stop
            >
              <!-- Header -->
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex-1">
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {{ selectedModule?.name }}
                  </h3>
                  <span
                    v-if="selectedModule?.moduleType"
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-sm font-medium text-white',
                      getModuleTypeColor(selectedModule.moduleType)
                    ]"
                  >
                    {{ getModuleTypeLabel(selectedModule.moduleType) }}
                  </span>
                </div>
                <button
                  type="button"
                  @click="closeModal"
                  class="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label="Close modal"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="p-6 space-y-6">
                <div>
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Description
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {{ selectedModule?.description || "No description available" }}
                  </p>
                </div>

                <div>
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Author
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ selectedModule?.author || "Unknown" }}
                  </p>
                </div>

                <div v-if="selectedModule?.key">
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Module Key
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400 font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    {{ selectedModule.key }}
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>

    <!-- Fallback -->
    <template #fallback>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-lg text-center">
        Loading Graph Component...
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
</style>