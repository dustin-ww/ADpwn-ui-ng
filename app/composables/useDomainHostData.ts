// composables/useDomainHostData.ts
export const useDomainHostData = () => {
  const domainStore = useDomainStore();
  const hostStore = useHostStore();

  const fetchDomainsWithHosts = async (
    projectUID: string, 
    options?: { skipCache?: boolean }
  ) => {
    // Beide parallel laden für bessere Performance
    await Promise.all([
      domainStore.fetchDomains(projectUID, options),
      hostStore.fetchHosts(projectUID, options),
    ]);
  };

  // Enriched Hosts: Hosts mit Domain-Informationen
  const enrichedHosts = computed(() => {
    return hostStore.hosts.map(host => ({
      ...host,
      domain: domainStore.getDomainByUID(host.belongsToDomain),
    }));
  });

  // Domains mit ihren Hosts
  const domainsWithHosts = computed(() => {
    return domainStore.domains.map(domain => ({
      ...domain,
      hosts: hostStore.getHostsByDomain(domain.uid),
    }));
  });

  // Hosts ohne Domain (Orphans)
  const orphanedHosts = computed(() => {
    return hostStore.hosts.filter(host => !host.belongsToDomain);
  });

  return {
    fetchDomainsWithHosts,
    enrichedHosts,
    domainsWithHosts,
    orphanedHosts,
  };
};