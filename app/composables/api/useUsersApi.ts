// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/utils/useApiWrapper";
import { API_ROUTES } from "#imports";

import type { ADUser } from "~/types/ad/ADUsers";

export const useUsersApi = () => {
  const api = useApiClient();

  return {

    createUser: (projectUid: string, userData: ADUser) =>
      api.create<ADUser>(
        API_ROUTES.PROJECTS.USERS.ROOT(projectUid),
        userData
      ),

    getUsersByProjectUID: (projectUid: string) =>
      api.get<ADUser[]>(API_ROUTES.PROJECTS.USERS.ROOT(projectUid)),

    // Update User
    updateUser: (uid: string, updateData: ADUser) =>
        api.update<ADUser>(
        API_ROUTES.PROJECTS.USERS.ROOT(uid),
        updateData,
        { headers: { "Content-Type": "application/merge-patch+json" } }
    ),
  };
};
