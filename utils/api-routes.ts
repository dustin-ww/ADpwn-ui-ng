// constants/apiRoutes.ts

/**
 * Zentrale Definition aller API-Endpunkte
 * - Verhindert Duplikation von Strings im Code
 * - Macht Änderungen an API-Pfaden einfacher zu verwalten
 * - Bietet eine Übersicht aller verfügbaren Endpunkte
 */

export const API_ROUTES = {
  PROJECTS: {
    BASE: "/projects",
    OVERVIEWS: "/projects/overviews",
    DETAIL: (uid: string) => `/projects/${uid}`,
    TARGETS: {
      LIST: (projectUid: string) => `/projects/${projectUid}/targets`,
      DETAIL: (projectUid: string, targetId: string) =>
        `/projects/${projectUid}/targets/${targetId}`,
    },
  },
  // Hier kannst du weitere API-Bereiche hinzufügen
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
  // Weitere Routen je nach Bedarf deiner Anwendung
};
