// constants/apiRoutes.ts

/**
 * API Definition
 */

export const API_ROUTES = {
  PROJECTS: {
    BASE: "/projects/",
    OVERVIEWS: "/projects/overviews",
    DETAIL: (uid: string) => `/projects/${uid}`,
    TARGETS: {
      BASE: (projectUid: string) => `/projects/${projectUid}/targets`,
      DETAIL: (projectUid: string, targetId: string) =>
        `/projects/${projectUid}/targets/${targetId}`,
    },
    DOMAINS: {
      BASE: (projectUid: string) => `/projects/${projectUid}/domains`,
    },
  },
  ADPWN_MODULES: {
    BASE: "/adpwn/",
    GRAPH: "/adpwn/graph",
  },
  USERS: {
    BASE: "/users",
    CURRENT: "/users/me",
    DETAIL: (uid: string) => `/users/${uid}`,
  },
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
  },
};
