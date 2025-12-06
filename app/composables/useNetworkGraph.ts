// composables/useNetworkGraph.ts
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import type { ADDomain } from '~/types/ad/ADDomain';
import type { ADHost } from '~/types/ad/ADHost';
import type { ADService } from '~/types/ad/ADService';

interface GraphNode {
  name: string;
  type: 'domain' | 'host' | 'service';
  uid: string;
  ip?: string;
  port?: string;
  color?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'domain-host' | 'host-service';
}

interface NetworkGraphData {
  nodes: Record<string, GraphNode>;
  edges: Record<string, GraphEdge>;
}

// Erweiterte Typen für die hierarchischen Daten
interface EnrichedADHost extends ADHost {
  services?: ADService[];
}

interface EnrichedADDomain extends ADDomain {
  hosts?: EnrichedADHost[];
}

export const useNetworkGraph = () => {
  /**
   * Transformiert hierarchische Domain-Daten in ein v-network-graph Format
   */
  const transformToGraphData = (
    domains: EnrichedADDomain[],
    orphanedHosts: EnrichedADHost[] = []
  ): NetworkGraphData => {
    const nodes: Record<string, GraphNode> = {};
    const edges: Record<string, GraphEdge> = {};
    let edgeCounter = 0;

    // 1. Verarbeite Domains mit ihren Hosts
    domains.forEach((domain) => {
      // Füge Domain-Node hinzu
      nodes[domain.uid] = {
        name: domain.name,
        type: 'domain',
        uid: domain.uid,
        color: '#4caf50', // Grün für Domains
      };

      // Verarbeite Hosts in der Domain
      domain.hosts?.forEach((host) => {
        // Füge Host-Node hinzu
        const hostName = host.ip || host.dNSHostName || host.sAMAccountName || host.uid;
        nodes[host.uid] = {
          name: hostName,
          type: 'host',
          uid: host.uid,
          ip: host.ip,
          color: '#2196f3', // Blau für Hosts
        };

        // Füge Edge zwischen Domain und Host hinzu
        edges[`edge${edgeCounter++}`] = {
          source: domain.uid,
          target: host.uid,
          type: 'domain-host',
        };

        // Verarbeite Services des Hosts
        host.services?.forEach((service) => {
          const serviceId = service.uid;
          
          // Füge Service-Node hinzu
          nodes[serviceId] = {
            name: `${service.name}:${service.port}`,
            type: 'service',
            uid: service.uid,
            port: service.port,
            color: '#ff9800', // Orange für Services
          };

          // Füge Edge zwischen Host und Service hinzu
          edges[`edge${edgeCounter++}`] = {
            source: host.uid,
            target: serviceId,
            type: 'host-service',
          };
        });
      });
    });

    // 2. Verarbeite verwaiste Hosts (ohne Domain)
    orphanedHosts.forEach((host) => {
      const hostName = host.ip || host.dNSHostName || host.sAMAccountName || host.uid;
      nodes[host.uid] = {
        name: hostName,
        type: 'host',
        uid: host.uid,
        ip: host.ip,
        color: '#f44336', // Rot für verwaiste Hosts
      };

      // Verarbeite Services der verwaisten Hosts
      host.services?.forEach((service) => {
        const serviceId = service.uid;
        
        nodes[serviceId] = {
          name: `${service.name}:${service.port}`,
          type: 'service',
          uid: service.uid,
          port: service.port,
          color: '#ff9800',
        };

        edges[`edge${edgeCounter++}`] = {
          source: host.uid,
          target: serviceId,
          type: 'host-service',
        };
      });
    });

    return { nodes, edges };
  };

  /**
   * Erstellt computed Graph-Daten aus enrichedDomains und orphanedHosts
   */
  const createGraphComputed = (
    enrichedDomains: ComputedRef<EnrichedADDomain[]>,
    orphanedHosts: ComputedRef<EnrichedADHost[]>
  ) => {
    return computed(() => 
      transformToGraphData(enrichedDomains.value, orphanedHosts.value)
    );
  };

  return {
    transformToGraphData,
    createGraphComputed,
  };
};