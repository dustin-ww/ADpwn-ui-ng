// composables/useProjectData.ts
import { computed } from 'vue';
import { useDomainStore } from "#imports";
import { useHostStore } from "#imports";
import { useServiceStore } from "#imports";

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

  // Convert to computed properties
  const enrichedDomains = computed(() => {
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

  const enrichedHosts = computed(() => {
    return hostStore.hosts.map((host) => ({
      ...host,
      domain: domainStore.getDomainByUID(host.belongsToDomain),
      services: serviceStore.getServicesByHost(host.uid),
    }));
  });

  const orphanedHosts = computed(() => {
    return hostStore.hosts
      .filter((host) => !host.belongsToDomain || host.belongsToDomain.length === 0)
      .map((host) => ({
        ...host,
        services: serviceStore.getServicesByHost(host.uid),
      }));
  });

  console.log("serviceStore:", serviceStore.services);

  return {
    fetchProjectHierarchy,
    enrichedDomains,
    enrichedHosts,
    orphanedHosts,
  };
};