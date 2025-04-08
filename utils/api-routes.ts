// constants/apiRoutes.ts

/**
 * API Definition
 */

export const API_ROUTES = {
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
      BASE: (projectUid: string) => `/project/${projectUid}/domains`,
    },
  },
  ADPWN_MODULES: {
    BASE: "/adpwn/",
    MODULES: {
      BASE: "/adpwn/modules/",
      GRAPH: "/adpwn/modules/graph",
      ITEMS: {
        DETAIL: (moduleKey: string) => `/adpwn/modules/items/${moduleKey}`,
        LASTRUN: (moduleKey: string) =>
          `/adpwn/modules/items/${moduleKey}/lastrun`,
        RUN: (moduleKey: string) => `/adpwn/modules/items/${moduleKey}/run`,
        VECTOR(moduleKey: string) {
          return `/adpwn/modules/items/${moduleKey}/vector`;
        },
      },
    },
  },
};
