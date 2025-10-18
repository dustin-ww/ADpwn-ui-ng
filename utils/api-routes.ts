// constants/apiRoutes.ts

/**
 * API Definition
 */

export const API_ROUTES = {
  SERVER: {
    HEALTH: "/server/health",
  },
  PROJECTS: {
    BASE: "/project/",
    OVERVIEWS: "/project/overviews",
    DETAIL: (uid: string) => `/project/${uid}`,
    TARGETS: {
      BASE: (projectUid: string) => `/project/${projectUid}/targets`,
      DETAIL: (projectUid: string, targetId: string) =>
        `/project/${projectUid}/targets/${targetId}`,
    },
    DOMAINS: {
      ALL: (projectUid: string) => `/project/${projectUid}/domains`,
    },
    LOGS: {
      ALL: (projectUid: string) => `/project/${projectUid}/logs`,
      TYPES: (projectUid: string) => `/project/${projectUid}/logs/types`,
      QUERY: (projectUid: string) => `/project/${projectUid}/logs/query`,
    }
  },
  ADPWN_MODULES: {
    BASE: "/adpwn/",
    RUNS: {
      BASE: "/adpwn/runs/",
    },
    MODULES: {
      BASE: "/adpwn/modules/",
      GRAPH: "/adpwn/modules/graph",
      ITEMS: {
        DETAIL: (moduleKey: string) => `/adpwn/modules/${moduleKey}`,
        LASTRUN: (moduleKey: string) =>
          `/adpwn/modules/${moduleKey}/lastrun`,
        RUN: (moduleKey: string) => `/adpwn/modules/${moduleKey}/run`,
        OPTIONS: (moduleKey: string) =>
          `/adpwn/modules/${moduleKey}/options`,
        VECTOR: {
          RUN: (moduleKey: string) =>
            `/adpwn/modules/${moduleKey}/vector/run`,
          OPTIONS: (moduleKey: string) =>
            `/adpwn/modules/${moduleKey}/vector/options`,
        }
      }
    },
  },
};
