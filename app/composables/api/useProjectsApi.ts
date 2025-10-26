// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/api/useApiWrapper";
import type { LogQueryOptionsSchema } from "~/app/schemas/logQuery";
import type { ProjectUpdateSchema } from "~/app/schemas/project";
import type { TargetSchema } from "~/app/schemas/target";
import type { ADPwnProject, Target } from "~/app/types/adpwn/ADPwnProject";
import { API_ROUTES } from "#imports"; 

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
    getLogs(uid:string) {
      return api.get<string[]>(API_ROUTES.PROJECTS.LOGS.ALL(uid));
    },
    getLogsWithOptions(uid: string, optionData: LogQueryOptionsSchema) {
      return api.customRequest<string[]>(
        API_ROUTES.PROJECTS.LOGS.QUERY(uid),
        'POST',
        { data: optionData }
      )
    },
    getLogTypes(uid:string) {
      return api.get<string[]>(API_ROUTES.PROJECTS.LOGS.TYPES(uid));
    },
    getLogModuleKeys(uid:string) {
      return api.get<string[]>(API_ROUTES.PROJECTS.LOGS.MODULE_KEYS(uid));
    },
    // Get Project with UID
    getProject: (uid: string) =>
      api.get<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid)),

    // Get Project Targets with Project UID
    getTargets: (uid: string) =>
      api.get<Target[]>(API_ROUTES.PROJECTS.TARGETS.BASE(uid)),

    // Create Target for Project with given UID
    createTarget: (projectUid: string, targetData: TargetSchema) =>
      api.create<Target>(
        API_ROUTES.PROJECTS.TARGETS.BASE(projectUid),
        targetData,
      ),

    // Custom Request
    // searchProjects: (query: string) =>
    //   api.customRequest<ProjectSearchResult[]>(
    //     `${API_ROUTES.PROJECTS.BASE}/search`,
    //     'POST',
    //     { data: { query } }
    //   )
  };
};
