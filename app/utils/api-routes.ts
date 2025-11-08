/**
 * API Routes Definition
 */

const withId = (base: string) => (id: string) => `${base}/${id}`;
const withTwoIds = (base: string) => (id1: string, id2: string) => `${base}/${id1}/${id2}`;

export const API_ROUTES = {
  SERVER: {
    HEALTH: "/server/health",
  },

  PROJECTS: {
    ROOT: "/project",
    LIST: "/project/overviews",
    DETAIL: withId("/project"),

    TARGETS: {
      ROOT: (projectUid: string) => `/project/${projectUid}/targets`,
      DETAIL: (projectUid: string, targetId: string) =>
        `/project/${projectUid}/targets/${targetId}`,
    },

    // ENDPOINT WITHOUT DOMAIN
    HOSTS: {
      ROOT: (projectUid: string) => `/project/${projectUid}/hosts`,
    },

    DOMAINS: {
      LIST: (projectUid: string) => `/project/${projectUid}/domains`,
      // ENDPOINT WITH DOMAIN
      HOSTS: (projectUid: string, domainUid: string) =>
        `/project/${projectUid}/domains/${domainUid}/hosts`,
    },

    LOGS: {
      LIST: (projectUid: string) => `/project/${projectUid}/logs`,
      TYPES: (projectUid: string) => `/project/${projectUid}/logs/types`,
      MODULE_KEYS: (projectUid: string) => `/project/${projectUid}/logs/mkeys`,
      QUERY: (projectUid: string) => `/project/${projectUid}/logs/query`,
    },
  },

  ADPWN: {
    ROOT: "/adpwn",
    RUNS: "/adpwn/runs",

    MODULES: {
      ROOT: "/adpwn/modules",
      GRAPH: "/adpwn/modules/graph",

      DETAIL: (moduleKey: string) => `/adpwn/modules/${moduleKey}`,
      LASTRUN: (moduleKey: string) => `/adpwn/modules/${moduleKey}/lastrun`,
      RUN: (moduleKey: string) => `/adpwn/modules/${moduleKey}/run`,
      OPTIONS: (moduleKey: string) => `/adpwn/modules/${moduleKey}/options`,

      VECTOR: {
        RUN: (moduleKey: string) => `/adpwn/modules/${moduleKey}/vector/run`,
        OPTIONS: (moduleKey: string) => `/adpwn/modules/${moduleKey}/vector/options`,
      },
    },
  },
} as const;
