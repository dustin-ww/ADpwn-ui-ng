<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import * as vNG from 'v-network-graph';
import * as d3 from 'd3-force';
import { useProjectData } from '~/composables/useProjectData';
import type { ADDomain, ADHost, ADService } from '~/types';

// Types
interface Node extends vNG.Node {
  size: number;
  color: string;
  label?: boolean;
  type: 'project' | 'domain' | 'host' | 'service';
  uid: string;
  ip?: string;
  port?: string;
}

interface Edge extends vNG.Edge {
  width: number;
  color: string;
  dashed?: boolean;
  type: 'project-domain' | 'domain-host' | 'host-service';
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

// Extended types
interface EnrichedADHost extends ADHost {
  services?: ADService[];
}

interface EnrichedADDomain extends ADDomain {
  hosts?: EnrichedADHost[];
}

// Constants
const NODE_SIZE = 40;
const FIT_CONTENT_MARGIN = 80;
const PROJECT_NODE_ID = 'project-root';

const NODE_COLORS = {
  project: '#9c27b0',
  domain: '#4caf50',
  host: '#2196f3',
  service: '#ff9800',
  orphanedHost: '#f44336',
} as const;

// Route
const route = useRoute();
const currentProjectStore = useCurrentProjectStore();
const projectUID = currentProjectStore.getUID;
const projectName = currentProjectStore.getName;

// Composables
const { fetchProjectHierarchy, enrichedDomains, orphanedHosts } = useProjectData();

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

// Modal State
const isModalOpen = ref(false);
const selectedNode = ref<Node | null>(null);

// Computed
const isClient = computed(() => typeof window !== 'undefined');

// Helper Functions
const convertToGraphFormat = (
  domains: EnrichedADDomain[],
  orphanedHostsList: EnrichedADHost[],
  projectNameValue: string
) => {
  const graphNodes: Record<string, Node> = {};
  const graphEdges: Record<string, Edge> = {};
  const nodeLayouts: Record<string, { x: number; y: number }> = {};
  let edgeCounter = 0;

  // Create central Project node
  graphNodes[PROJECT_NODE_ID] = {
    name: projectNameValue,
    size: NODE_SIZE * 2,
    color: NODE_COLORS.project,
    label: true,
    type: 'project',
    uid: PROJECT_NODE_ID,
  };
  nodeLayouts[PROJECT_NODE_ID] = { x: 0, y: 0 };

  // Process Domains
  domains.forEach((domain) => {
    graphNodes[domain.uid] = {
      name: domain.name,
      size: NODE_SIZE * 1.5,
      color: NODE_COLORS.domain,
      label: true,
      type: 'domain',
      uid: domain.uid,
    };
    nodeLayouts[domain.uid] = { x: 0, y: 0 };

    // Add edge from Project to Domain
    graphEdges[`edge${edgeCounter++}`] = {
      source: PROJECT_NODE_ID,
      target: domain.uid,
      width: 4,
      color: '#7b1fa2',
      dashed: false,
      type: 'project-domain',
    };

    domain.hosts?.forEach((host) => {
      const hostName = host.ip || host.dNSHostName || host.sAMAccountName || host.uid;
      
      graphNodes[host.uid] = {
        name: hostName,
        size: NODE_SIZE,
        color: NODE_COLORS.host,
        label: true,
        type: 'host',
        uid: host.uid,
        ip: host.ip,
      };
      nodeLayouts[host.uid] = { x: 0, y: 0 };

      graphEdges[`edge${edgeCounter++}`] = {
        source: domain.uid,
        target: host.uid,
        width: 3,
        color: '#aaaaaa',
        dashed: false,
        type: 'domain-host',
      };

      host.services?.forEach((service) => {
        const serviceId = service.uid;

        graphNodes[serviceId] = {
          name: `${service.name}:${service.port}`,
          size: NODE_SIZE * 0.7,
          color: NODE_COLORS.service,
          label: true,
          type: 'service',
          uid: service.uid,
          port: service.port,
        };
        nodeLayouts[serviceId] = { x: 0, y: 0 };

        graphEdges[`edge${edgeCounter++}`] = {
          source: host.uid,
          target: serviceId,
          width: 2,
          color: '#cccccc',
          dashed: false,
          type: 'host-service',
        };
      });
    });
  });

  // Process Orphaned Hosts - connect directly to Project node
  orphanedHostsList.forEach((host) => {
    const hostName = host.ip || host.dNSHostName || host.sAMAccountName || host.uid;
    
    graphNodes[host.uid] = {
      name: hostName,
      size: NODE_SIZE,
      color: NODE_COLORS.orphanedHost,
      label: true,
      type: 'host',
      uid: host.uid,
      ip: host.ip,
    };
    nodeLayouts[host.uid] = { x: 0, y: 0 };

    // Connect orphaned hosts directly to Project node
    graphEdges[`edge${edgeCounter++}`] = {
      source: PROJECT_NODE_ID,
      target: host.uid,
      width: 3,
      color: '#e91e63',
      dashed: true,
      type: 'project-domain', // Reuse type for simplicity
    };

    host.services?.forEach((service) => {
      const serviceId = service.uid;

      graphNodes[serviceId] = {
        name: `${service.name}:${service.port}`,
        size: NODE_SIZE * 0.7,
        color: NODE_COLORS.service,
        label: true,
        type: 'service',
        uid: service.uid,
        port: service.port,
      };
      nodeLayouts[serviceId] = { x: 0, y: 0 };

      graphEdges[`edge${edgeCounter++}`] = {
        source: host.uid,
        target: serviceId,
        width: 2,
        color: '#cccccc',
        dashed: false,
        type: 'host-service',
      };
    });
  });

  return {
    nodes: graphNodes,
    edges: graphEdges,
    layouts: { nodes: nodeLayouts },
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
      .distance(d => {
        // Different distances based on edge type
        const edge = edgeArray.find(e => 
          (e.source === (d.source as D3Node).id && e.target === (d.target as D3Node).id) ||
          (e.source === d.source && e.target === d.target)
        );
        
        // Project to Domain: longer distance
        if (edge?.type === 'project-domain') return 20;
        // Domain to Host: medium distance
        if (edge?.type === 'domain-host') return 20;
        // Host to Service: shorter distance
        return 100;
      })
      .strength(0.5)
    )
    .force('charge', d3.forceManyBody<D3Node>()
      .strength(d => {
        const node = nodes.value[d.id];
        // Project node has strongest repulsion (center)
        if (node?.type === 'project') return -800;
        // Domains have strong repulsion
        if (node?.type === 'domain') return -500;
        // Regular nodes
        return -200;
      })
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
  selectedNode.value = null;
};

const handleNodeClick = ({ node }: { node: string }): void => {
  const nodeData = nodes.value[node];
  if (nodeData) {
    selectedNode.value = nodeData;
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

    await fetchProjectHierarchy(projectUID, {
      includeDomains: true,
      includeHosts: true,
      includeServices: true,
      skipCache: true,
    });

    const formattedGraph = convertToGraphFormat(
      enrichedDomains.value,
      orphanedHosts.value,
      projectName
    );
    
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
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error loading graph data:', err);
  } finally {
    loading.value = false;
  }
};

// Event Handlers
const eventHandlers: vNG.EventHandlers = {
  'node:click': handleNodeClick,
};

// Configs
const configs = vNG.defineConfigs<Node, Edge>({
  view: {
    autoPanAndZoomOnLoad: 'fit-content',
    fitContentMargin: FIT_CONTENT_MARGIN,
    scalingObjects: true,
    minZoomLevel: 0.1,
    maxZoomLevel: 16,
  },
  node: {
    normal: {
      type: 'circle',
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
      direction: 'center',
      color: '#ffffff',
      fontSize: (node) => node.type === 'project' ? 14 : 12,
      fontFamily: 'Arial, sans-serif',
      fontWeight: (node) => node.type === 'project' ? 'bold' : 'normal',
    },
    focusring: {
      color: '#ffffff',
    },
  },
  edge: {
    normal: {
      width: (edge) => edge.width,
      color: (edge) => edge.color,
      dasharray: (edge) => (edge.dashed ? '4' : '0'),
    },
    hover: {
      width: (edge) => edge.width + 1,
    },
    margin: 4,
    marker: {
      source: { type: 'none' },
      target: { type: 'arrow' },
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
    <div class="relative w-full h-screen bg-gray-900 cursor-default">
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
        Loading Network Topology...
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
                    {{ selectedNode?.name }}
                  </h3>
                  <span
                    v-if="selectedNode?.type"
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-sm font-medium text-white',
                      selectedNode.type === 'project' ? 'bg-purple-500' :
                      selectedNode.type === 'domain' ? 'bg-green-500' : 
                      selectedNode.type === 'host' ? 'bg-blue-500' : 'bg-orange-500'
                    ]"
                  >
                    {{ selectedNode.type === 'project' ? 'Project' :
                       selectedNode.type === 'domain' ? 'Domain' : 
                       selectedNode.type === 'host' ? 'Host' : 'Service' }}
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
              <div class="p-6 space-y-4">
                <div v-if="selectedNode?.ip">
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    IP Address
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400 font-mono">
                    {{ selectedNode.ip }}
                  </p>
                </div>

                <div v-if="selectedNode?.port">
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Port
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400 font-mono">
                    {{ selectedNode.port }}
                  </p>
                </div>

                <div v-if="selectedNode?.uid && selectedNode.type !== 'project'">
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    UID
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400 font-mono text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    {{ selectedNode.uid }}
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