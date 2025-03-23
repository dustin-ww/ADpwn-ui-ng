// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/api/useApiWrapper";
import type { ProjectUpdateSchema } from "~/schemas/project";
import type { ADPwnProject } from "~/types/adpwn/ADPwnProject";
import { API_ROUTES } from "~/utils/api-routes";

export const useProjectsApi = () => {
  const api = useApiClient();

  return {
    // Projekte laden
    getProjects: () => api.get<ADPwnProject[]>(API_ROUTES.PROJECTS.OVERVIEWS),
    // Projekt erstellen
    createProject: (projectData: ProjectUpdateSchema) =>
      api.create<ADPwnProject>(API_ROUTES.PROJECTS.BASE, projectData),
    // Projekt aktualisieren
    updateProject: (uid: string, updateData: ProjectUpdateSchema) =>
      api.update<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid), updateData, {
        headers: { "Content-Type": "application/merge-patch+json" },
      }),
      getProject: (uid: string) => 
        api.get<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid)),
    
    // Custom Request
    // searchProjects: (query: string) =>
    //   api.customRequest<ProjectSearchResult[]>(
    //     `${API_ROUTES.PROJECTS.BASE}/search`,
    //     'POST',
    //     { data: { query } }
    //   )
  };
};
