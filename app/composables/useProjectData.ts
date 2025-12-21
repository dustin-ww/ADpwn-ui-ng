// composables/useProjectData.ts
import { computed } from 'vue';
import { useDomainStore } from "#imports";
import { useHostStore } from "#imports";
import { useServiceStore } from "#imports";
import type { ADDomain, ADHost, ADService } from '~/types';

export interface EnrichedADHost extends ADHost {
  services: ADService[];
  domain?: ADDomain;
}

export interface EnrichedADDomain extends ADDomain {
  hosts: EnrichedADHost[];
}

export const useProjectData = () => {
  const domainStore = useDomainStore();
  const hostStore = useHostStore();
  const serviceStore = useServiceStore();

  const fetchProjectHierarchy = async (
    projectUID: string,
    options?: {
      includeDomains?: boolean;
      includeHosts?: boolean;
      includeServices?: boolean;
      skipCache?: boolean;
    }
  ) => {
    const promises = [];
    const skipCache = true;

    if (options?.includeDomains) {
      promises.push(
        domainStore.fetchDomains(projectUID, {
          skipCache: skipCache,
        })
      );
    }

    if (options?.includeHosts) {
      promises.push(
        hostStore.fetchHosts(projectUID, {
          skipCache: skipCache,
        })
      );
    }

    await Promise.all(promises);

    if (options?.includeServices) {
      const hostUIDs = hostStore.hosts.map((host) => host.uid);
      await Promise.all(
        hostUIDs.map((hostUID) =>
          serviceStore.fetchServices(projectUID, hostUID, {
            skipCache: skipCache,
          })
        )
      );
    }
  };

  const enrichedDomains = computed<EnrichedADDomain[]>(() => {
    return domainStore.domains.map((domain) => {
      const hosts = hostStore.getHostsByDomain(domain.uid);
      return {
        ...domain,
        hosts: hosts.map((host) => ({
          ...host,
          services: serviceStore.getServicesByHost(host.uid),
        })),
      };
    });
  });

  const enrichedHosts = computed<EnrichedADHost[]>(() => {
    return hostStore.hosts.map((host) => ({
      ...host,
      domain: domainStore.getDomainByUID(host.belongsToDomain),
      services: serviceStore.getServicesByHost(host.uid),
    }));
  });

  const orphanedHosts = computed<EnrichedADHost[]>(() => {
    return hostStore.hosts
      .filter((host) => !host.belongsToDomain || host.belongsToDomain.length === 0)
      .map((host) => ({
        ...host,
        services: serviceStore.getServicesByHost(host.uid),
      }));
  });

  return {
    fetchProjectHierarchy,
    enrichedDomains,
    enrichedHosts,
    orphanedHosts,
  };
};