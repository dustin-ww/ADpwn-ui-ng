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
      alert(
        `Module: ${module.name}\nDescription: ${module.description}\nAuthor: ${module.author}`,
      );
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
}); // Ensure consistent structure

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
    graphData.value = data.data ?? { nodes: [], edges: [] }; // Ensure consistent structure

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
</script>

<template>
  <ClientOnly>
    <div class="graph-container h-full">
      <div v-if="loading" class="loading">Lade Modul-Vererbungsgraph...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <template v-else>
        <div class="control-panel">
          <button @click="updateLayout('LR')" class="control-button">
            Layout: Links nach Rechts
          </button>
          <button @click="updateLayout('TB')" class="control-button">
            Layout: Oben nach Unten
          </button>
        </div>
        <v-network-graph
          ref="graph"
          :nodes="nodes"
          :edges="edges"
          :layouts="layouts"
          :configs="configs"
          :event-handlers="eventHandlers"
        />
      </template>
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

.control-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  gap: 10px;
}

.control-button {
  background-color: #333;
  color: white;
  border: 1px solid #555;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.control-button:hover {
  background-color: #444;
}
</style>
