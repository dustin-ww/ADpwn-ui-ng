<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import * as vNG from "v-network-graph";
import type { ADPwnInheritanceGraph } from "~/types/adpwn/ADPwnModuleGraph";
import { useADPwnModuleApi } from "~/composables/api/useADwnModuleApi";

let dagre: any = null;

const isClient = typeof window !== "undefined";

interface Node extends vNG.Node {
  size: number;
  color: string;
  label?: boolean;
}

interface Edge extends vNG.Edge {
  width: number;
  color: string;
  dashed?: boolean;
}

const nodes = ref<Record<string, Node>>({});
const edges = ref<Record<string, Edge>>({});
const layouts = ref<{ nodes: Record<string, { x: number; y: number }> }>({
  nodes: {},
});
const loading = ref(true);
const error = ref<string | null>(null);
const graph = ref<vNG.VNetworkGraphInstance>();
const nodeSize = 40;

// Modal State
const isModalOpen = ref(false);
const selectedModule = ref<any>(null);

const convertToGraphFormat = (graph: ADPwnInheritanceGraph) => {
  const graphNodes: Record<string, Node> = {};
  const graphEdges: Record<string, Edge> = {};
  const nodeLayouts: Record<string, { x: number; y: number }> = {};

  const getNodeColor = (moduleType: string) => {
    switch (moduleType) {
      case "AttackModule":
        return "#ff5252";
      case "EnumerationModule":
        return "#4caf50";
      case "EXPLOIT":
        return "#ff9800";
      case "POST_EXPLOIT":
        return "#2196f3";
      default:
        return "#9c27b0";
    }
  };

  graph.nodes.forEach((module) => {
    const nodeId = module.key;
    graphNodes[nodeId] = {
      name: module.name,
      size: nodeSize,
      color: getNodeColor(module.module_type),
      label: true,
    };
    nodeLayouts[nodeId] = { x: 0, y: 0 };
  });

  graph.edges.forEach((edge, index) => {
    const edgeId = `edge${index}`;
    graphEdges[edgeId] = {
      source: edge.previous_module,
      target: edge.next_module,
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

const eventHandlers: vNG.EventHandlers = {
  "node:click": ({ node }) => {
    const moduleKey = node as string;
    const module = graphData.value?.nodes.find((n) => n.key === moduleKey);
    if (module) {
      selectedModule.value = module;
      isModalOpen.value = true;
    }
  },
};

const configs = reactive(
  vNG.defineConfigs<Node, Edge>({
    view: {
      autoPanAndZoomOnLoad: "fit-content",
      onBeforeInitialDisplay: () => {
        if (isClient && dagre) {
          layout("TB");
        }
      },
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
  }),
);

const graphData = ref<ADPwnInheritanceGraph | null>({
  nodes: [],
  edges: [],
});

const { getGraph } = useADPwnModuleApi();

function layout(direction: "TB" | "LR") {
  if (
    !dagre ||
    Object.keys(nodes.value).length <= 1 ||
    Object.keys(edges.value).length === 0
  ) {
    return;
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSize * 2,
    edgesep: nodeSize,
    ranksep: nodeSize * 2,
  });
  g.setDefaultEdgeLabel(() => ({}));

  Object.entries(nodes.value).forEach(([nodeId, node]) => {
    g.setNode(nodeId, { label: node.name, width: nodeSize, height: nodeSize });
  });

  Object.values(edges.value).forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const newLayouts = { nodes: { ...layouts.value.nodes } };
  g.nodes().forEach((nodeId: string) => {
    const x = g.node(nodeId).x;
    const y = g.node(nodeId).y;
    newLayouts.nodes[nodeId] = { x, y };
  });

  layouts.value = newLayouts;
}

function updateLayout(direction: "TB" | "LR") {
  if (!dagre) return;
  graph.value?.transitionWhile(() => {
    layout(direction);
  });
}

onMounted(async () => {
  if (isClient) {
    try {
      dagre = await import("dagre").then((m) => m.default || m);
    } catch (e) {
      console.error("Error loading dagre library:", e);
    }
  }

  try {
    loading.value = true;
    const data = await getGraph();
    graphData.value = data.data ?? { nodes: [], edges: [] };

    const formattedGraph = convertToGraphFormat(graphData.value);
    nodes.value = formattedGraph.nodes;
    edges.value = formattedGraph.edges;
    layouts.value = formattedGraph.layouts;

    if (dagre) {
      layout("TB");
    }

    loading.value = false;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "An unknown error occurred";
    loading.value = false;
  }
});

const getModuleTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    AttackModule: "Attack Modul",
    EnumerationModule: "Enumeration Modul",
    EXPLOIT: "Exploit",
    POST_EXPLOIT: "Post-Exploit",
  };
  return labels[type] || type;
};

const getModuleTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    AttackModule: "bg-red-500",
    EnumerationModule: "bg-green-500",
    EXPLOIT: "bg-orange-500",
    POST_EXPLOIT: "bg-blue-500",
  };
  return colors[type] || "bg-purple-500";
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>

<template>
  <ClientOnly>
    <div class="graph-container h-full">
      <div v-if="loading" class="loading">Lade Modul-Vererbungsgraph...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
        <v-network-graph
          ref="graph"
          :nodes="nodes"
          :edges="edges"
          :layouts="layouts"
          :configs="configs"
          :event-handlers="eventHandlers"
        />
      </template>

      <!-- Custom Modal mit Tailwind -->
      <Transition name="modal">
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

          <!-- Modal Content -->
          <div
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
                  :class="[
                    'inline-block px-3 py-1 rounded-full text-sm font-medium text-white',
                    getModuleTypeColor(selectedModule?.module_type)
                  ]"
                >
                  {{ getModuleTypeLabel(selectedModule?.module_type) }}
                </span>
              </div>
              <button
                @click="closeModal"
                class="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                  Beschreibung
                </h4>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ selectedModule?.description || "Keine Beschreibung verfügbar" }}
                </p>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Autor
                </h4>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ selectedModule?.author || "Unbekannt" }}
                </p>
              </div>

              <div v-if="selectedModule?.key">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Modul-Key
                </h4>
                <p class="text-gray-600 dark:text-gray-400 font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  {{ selectedModule.key }}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                @click="closeModal"
                class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <template #fallback>
      <div class="loading-fallback">Lade Graph-Komponente...</div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 100vh;
  background-color: #1e1e1e;
  position: relative;
}

.loading,
.error,
.loading-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 18px;
}

.error {
  color: #ff5252;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>