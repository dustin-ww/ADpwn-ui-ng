<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import * as vNG from 'v-network-graph'
import * as d3 from 'd3-force'
import { useProjectData } from '~/composables/useProjectData'
import type { ADDomain, ADHost, ADService } from '~/types'

// =======================
// Types
// =======================
interface Node extends vNG.Node {
  size: number
  color: string
  label?: boolean
  type: 'project' | 'domain' | 'host' | 'service'
  uid: string
  ip?: string
  port?: string
  icon?: string
  // Zusätzliche Infos für Popup
  dNSHostName?: string
  serviceName?: string
}

interface Edge extends vNG.Edge {
  width: number
  color: string
  dashed?: boolean
  type: 'project-domain' | 'domain-host' | 'host-service'
}

interface D3Node {
  id: string
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface D3Link {
  source: string | D3Node
  target: string | D3Node
}

interface EnrichedADHost extends ADHost {
  services?: ADService[]
}

interface EnrichedADDomain extends ADDomain {
  hosts?: EnrichedADHost[]
}

// =======================
// Constants
// =======================
const NODE_SIZE = 40
const FIT_CONTENT_MARGIN = 80
const PROJECT_NODE_ID = 'project-root'

const NODE_COLORS = {
  project: '#9c27b0',
  domain: '#4caf50',
  host: '#2196f3',
  service: '#ff9800',
  orphanedHost: '#f44336',
} as const

// Material Icons (Codepoints)
const NODE_ICONS: Record<Node['type'], string> = {
  project: '&#xe2c8', // workspaces
  domain: '&#xe2bd',  // cloud
  host: '&#xe30a',    // computer
  service: '&#xe8b8', // settings
}

// =======================
// Stores / Composables (Nuxt 4)
// =======================
const currentProjectStore = useCurrentProjectStore()
const projectUID = currentProjectStore.getUID
const projectName = currentProjectStore.getName

const { fetchProjectHierarchy, enrichedDomains, orphanedHosts } = useProjectData()

// =======================
// State
// =======================
const nodes = ref<Record<string, Node>>({})
const edges = ref<Record<string, Edge>>({})
const layouts = ref<{ nodes: Record<string, { x: number; y: number }> }>({
  nodes: {},
})

const loading = ref(true)
const error = ref<string | null>(null)

const graph = ref<vNG.VNetworkGraphInstance>()
const simulation = ref<d3.Simulation<D3Node, D3Link> | null>(null)

// Popup State
const selectedNode = ref<Node | null>(null)
const showPopup = ref(false)
const popupPosition = ref({ x: 0, y: 0 })

// =======================
// Computed
// =======================
const popupData = computed(() => {
  if (!selectedNode.value) return null

  const node = selectedNode.value
  const data: Array<{ label: string; value: string }> = [
    { label: 'Type', value: node.type.toUpperCase() },
    { label: 'UID', value: node.uid },
  ]

  if (node.type === 'project') {
    data.push({ label: 'Name', value: node.name })
  }

  if (node.type === 'domain') {
    data.push({ label: 'Domain', value: node.name })
    // Zähle Hosts in dieser Domain
    const hostCount = Object.values(edges.value).filter(
      e => e.source === node.uid && e.type === 'domain-host'
    ).length
    data.push({ label: 'Hosts', value: hostCount.toString() })
  }

  if (node.type === 'host') {
    if (node.ip) data.push({ label: 'IP', value: node.ip })
    if (node.dNSHostName) data.push({ label: 'DNS Name', value: node.dNSHostName })
    
    // Zähle Services für diesen Host
    const serviceCount = Object.values(edges.value).filter(
      e => e.source === node.uid && e.type === 'host-service'
    ).length
    data.push({ label: 'Services', value: serviceCount.toString() })
  }

  if (node.type === 'service') {
    if (node.serviceName) data.push({ label: 'Service', value: node.serviceName })
    if (node.port) data.push({ label: 'Port', value: node.port })
  }

  return data
})

// =======================
// Graph Builder
// =======================
const convertToGraphFormat = (
  domains: EnrichedADDomain[],
  orphanedHostsList: EnrichedADHost[],
  projectNameValue: string
) => {
  const graphNodes: Record<string, Node> = {}
  const graphEdges: Record<string, Edge> = {}
  const nodeLayouts: Record<string, { x: number; y: number }> = {}
  let edgeCounter = 0

  // ---------- Project ----------
  graphNodes[PROJECT_NODE_ID] = {
    name: projectNameValue,
    size: NODE_SIZE * 2,
    color: NODE_COLORS.project,
    label: true,
    type: 'project',
    uid: PROJECT_NODE_ID,
    icon: NODE_ICONS.project,
  }
  nodeLayouts[PROJECT_NODE_ID] = { x: 0, y: 0 }

  // ---------- Domains ----------
  domains.forEach(domain => {
    graphNodes[domain.uid] = {
      name: domain.name,
      size: NODE_SIZE * 1.5,
      color: NODE_COLORS.domain,
      label: true,
      type: 'domain',
      uid: domain.uid,
      icon: NODE_ICONS.domain,
    }
    nodeLayouts[domain.uid] = { x: 0, y: 0 }

    graphEdges[`e${edgeCounter++}`] = {
      source: PROJECT_NODE_ID,
      target: domain.uid,
      width: 4,
      color: '#7b1fa2',
      type: 'project-domain',
    }

    domain.hosts?.forEach(host => {
      const hostName = host.ip || host.dNSHostName || host.uid

      graphNodes[host.uid] = {
        name: hostName,
        size: NODE_SIZE,
        color: NODE_COLORS.host,
        label: true,
        type: 'host',
        uid: host.uid,
        ip: host.ip,
        dNSHostName: host.dNSHostName,
        icon: NODE_ICONS.host,
      }
      nodeLayouts[host.uid] = { x: 0, y: 0 }

      graphEdges[`e${edgeCounter++}`] = {
        source: domain.uid,
        target: host.uid,
        width: 3,
        color: '#aaaaaa',
        type: 'domain-host',
      }

      // Host → Services
      host.services?.forEach(service => {
        graphNodes[service.uid] = {
          name: `${service.name}:${service.port}`,
          size: NODE_SIZE * 0.7,
          color: NODE_COLORS.service,
          label: false,
          type: 'service',
          uid: service.uid,
          port: service.port,
          serviceName: service.name,
          icon: NODE_ICONS.service,
        }
        nodeLayouts[service.uid] = { x: 0, y: 0 }

        graphEdges[`e${edgeCounter++}`] = {
          source: host.uid,
          target: service.uid,
          width: 2,
          color: '#cccccc',
          type: 'host-service',
        }
      })
    })
  })

  // ---------- Orphaned Hosts ----------
  orphanedHostsList.forEach(host => {
    const hostName = host.ip || host.dNSHostName || host.uid

    graphNodes[host.uid] = {
      name: hostName,
      size: NODE_SIZE,
      color: NODE_COLORS.orphanedHost,
      label: true,
      type: 'host',
      uid: host.uid,
      ip: host.ip,
      dNSHostName: host.dNSHostName,
      icon: NODE_ICONS.host,
    }
    nodeLayouts[host.uid] = { x: 0, y: 0 }

    graphEdges[`e${edgeCounter++}`] = {
      source: PROJECT_NODE_ID,
      target: host.uid,
      width: 3,
      color: '#e91e63',
      dashed: true,
      type: 'project-domain',
    }

    // Host → Services
    host.services?.forEach(service => {
      graphNodes[service.uid] = {
        name: `${service.name}:${service.port}`,
        size: NODE_SIZE * 0.7,
        color: NODE_COLORS.service,
        label: false,
        type: 'service',
        uid: service.uid,
        port: service.port,
        serviceName: service.name,
        icon: NODE_ICONS.service,
      }
      nodeLayouts[service.uid] = { x: 0, y: 0 }

      graphEdges[`e${edgeCounter++}`] = {
        source: host.uid,
        target: service.uid,
        width: 2,
        color: '#cccccc',
        type: 'host-service',
      }
    })
  })

  return { nodes: graphNodes, edges: graphEdges, layouts: { nodes: nodeLayouts } }
}

// =======================
// D3 Force Layout
// =======================
const applyD3ForceLayout = () => {
  if (!Object.keys(nodes.value).length) return
  simulation.value?.stop()

  const d3Nodes: D3Node[] = Object.keys(nodes.value).map(id => ({
    id,
    x: Math.random() * 800,
    y: Math.random() * 600,
  }))

  const d3Links: D3Link[] = Object.values(edges.value).map(e => ({
    source: e.source,
    target: e.target,
  }))

  simulation.value = d3.forceSimulation(d3Nodes)
    .force('link', d3.forceLink(d3Links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(400, 300))
    .force(
      'collision',
      d3.forceCollide().radius(d => (nodes.value[d.id]?.size ?? NODE_SIZE) / 2 + 10)
    )
    .on('tick', () => {
      const nextLayouts = { nodes: {} as Record<string, { x: number; y: number }> }
      d3Nodes.forEach(n => {
        nextLayouts.nodes[n.id] = { x: n.x ?? 0, y: n.y ?? 0 }
      })
      layouts.value = nextLayouts
    })
}

// =======================
// Event Handlers
// =======================
const handleNodeClick = ({ node, event }: { node: string; event: MouseEvent }) => {
  selectedNode.value = nodes.value[node]
  showPopup.value = true
  
  // Position Popup relativ zum Klick
  popupPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }
}

const closePopup = () => {
  showPopup.value = false
  selectedNode.value = null
}

// =======================
// Lifecycle
// =======================
const loadGraphData = async () => {
  loading.value = true
  try {
    await fetchProjectHierarchy(projectUID, {
      includeDomains: true,
      includeHosts: true,
      includeServices: true,
      skipCache: true,
    })

    const g = convertToGraphFormat(
      enrichedDomains.value,
      orphanedHosts.value,
      projectName
    )

    nodes.value = g.nodes
    edges.value = g.edges
    layouts.value = g.layouts

    await nextTick()
    applyD3ForceLayout()
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load graph'
  } finally {
    loading.value = false
  }
}

onMounted(loadGraphData)
onUnmounted(() => simulation.value?.stop())

const eventHandlers: vNG.EventHandlers = {
  'node:click': handleNodeClick,
}

// =======================
// Config
// =======================
const configs = vNG.defineConfigs<Node, Edge>({
  view: {
    autoPanAndZoomOnLoad: 'fit-content',
    fitContentMargin: FIT_CONTENT_MARGIN,
    scalingObjects: true,
  },
  node: {
    normal: {
      type: 'circle',
      radius: n => n.size / 2,
      color: n => n.color,
    },
    label: {
      visible: n => !!n.label,
      color: '#ffffff',
      fontSize: 12,
    },
  },
  edge: {
    normal: {
      width: e => e.width,
      color: e => e.color,
      dasharray: e => (e.dashed ? '4' : '0'),
    },
  },
})
</script>

<template>
  <ClientOnly>
    <div class="w-full h-screen bg-gray-900 relative">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-gray-900 z-50"
      >
        <div class="text-white text-xl">Loading graph...</div>
      </div>

      <!-- Error State -->
      <div
        v-if="error"
        class="absolute inset-0 flex items-center justify-center bg-gray-900 z-50"
      >
        <div class="text-red-500 text-xl">{{ error }}</div>
      </div>

      <!-- Graph -->
      <v-network-graph
        ref="graph"
        class="w-full h-full"
        :nodes="nodes"
        :edges="edges"
        :layouts="layouts"
        :configs="configs"
        :event-handlers="eventHandlers"
      >
        <!-- Material Icons -->
        <defs>
          <component is="style">
            @font-face {
              font-family: 'Material Icons';
              font-style: normal;
              font-weight: 400;
              src: url(https://fonts.gstatic.com/s/materialicons/v97/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2)
                format('woff2');
            }
          </component>
        </defs>

        <!-- Custom Node mit Icon -->
        <template #override-node="{ nodeId, scale, config, ...slotProps }">
          <g>
            <circle
              :r="config.radius * scale"
              :fill="config.color"
              v-bind="slotProps"
              style="cursor: pointer"
            />
            <text
              v-if="nodes[nodeId]?.icon"
              font-family="Material Icons"
              :font-size="nodes[nodeId].size * 0.5 * scale"
              fill="#ffffff"
              text-anchor="middle"
              dominant-baseline="central"
              style="pointer-events: none; user-select: none"
              v-html="nodes[nodeId].icon"
            />
          </g>
        </template>
      </v-network-graph>

      <!-- Popup Modal -->
      <Transition name="fade">
        <div
          v-if="showPopup && selectedNode"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click="closePopup"
        >
          <div
            class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-700"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl"
                  :style="{ backgroundColor: selectedNode.color }"
                >
                  <span
                    class="material-icons"
                    v-html="selectedNode.icon"
                  />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">
                    {{ selectedNode.name }}
                  </h3>
                  <p class="text-sm text-gray-400 capitalize">
                    {{ selectedNode.type }}
                  </p>
                </div>
              </div>
              <button
                @click="closePopup"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="space-y-3">
              <div
                v-for="item in popupData"
                :key="item.label"
                class="flex justify-between items-center py-2 border-b border-gray-700"
              >
                <span class="text-gray-400 font-medium">{{ item.label }}:</span>
                <span class="text-white font-mono text-sm">{{ item.value }}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 flex justify-end">
              <button
                @click="closePopup"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>