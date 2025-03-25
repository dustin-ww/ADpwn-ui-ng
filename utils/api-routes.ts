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
      LIST: (projectUid: string) => `/projects/${projectUid}/targets`,
      DETAIL: (projectUid: string, targetId: string) =>
        `/projects/${projectUid}/targets/${targetId}`,
    },
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
