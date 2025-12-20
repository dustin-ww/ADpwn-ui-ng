// composables/useDomainHostData.ts
export const useDomainHostData = () => {
  const domainStore = useDomainStore();
  const hostStore = useHostStore();

  const fetchDomainsWithHosts = async (
    projectUID: string, 
    options?: { skipCache?: boolean }
  ) => {
    await Promise.all([
      domainStore.fetchDomains(projectUID, options),
      hostStore.fetchHosts(projectUID, options),
    ]);
  };

  const enrichedHosts = computed(() => {
    return hostStore.hosts.map(host => ({
      ...host,
      domain: domainStore.getDomainByUID(host.belongsToDomain),
    }));
  });

  const domainsWithHosts = computed(() => {
    return domainStore.domains.map(domain => ({
      ...domain,
      hosts: hostStore.getHostsByDomain(domain.uid),
    }));
  });

 const domainWithHosts = (domainUID: string) =>
  computed(() => {
    const domain = domainStore.getDomainByUID(domainUID);
    if (!domain) return null;

    return {
      ...domain,
      hosts: hostStore.getHostsByDomain(domain.uid),
    };
  });

  const orphanedHosts = computed(() => {
    return hostStore.hosts.filter(host => !host.belongsToDomain);
  });

  return {
    fetchDomainsWithHosts,
    domainWithHosts,
    enrichedHosts,
    domainsWithHosts,
    orphanedHosts,
  };
};