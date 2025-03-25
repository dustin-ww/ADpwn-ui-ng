// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/api/useApiWrapper";
import type { ProjectUpdateSchema } from "~/schemas/project";
import type { ADPwnProject, Target } from "~/types/adpwn/ADPwnProject";
import { API_ROUTES } from "~/utils/api-routes";

export const useProjectsApi = () => {
  const api = useApiClient();

  return {
    // Load All Projects
    getProjects: () => api.get<ADPwnProject[]>(API_ROUTES.PROJECTS.OVERVIEWS),
    // Create Project
    createProject: (projectData: ProjectUpdateSchema) =>
      api.create<ADPwnProject>(API_ROUTES.PROJECTS.BASE, projectData),
    // Update Project
    updateProject: (uid: string, updateData: ProjectUpdateSchema) =>
      api.update<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid), updateData, {
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
    // Get Project with UID
    getProject: (uid: string) =>
      api.get<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid)),

    // Get Project Targets with Project UID
    getTargets: (uid: string) =>
      api.get<Target[]>(API_ROUTES.PROJECTS.TARGETS.LIST(uid)),

    // Custom Request
    // searchProjects: (query: string) =>
    //   api.customRequest<ProjectSearchResult[]>(
    //     `${API_ROUTES.PROJECTS.BASE}/search`,
    //     'POST',
    //     { data: { query } }
    //   )
  };
};
