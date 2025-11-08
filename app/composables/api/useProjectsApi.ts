// composables/api/useProjectsApi.ts
import { useApiClient } from "~/composables/utils/useApiWrapper";
import type { LogQueryOptionsSchema } from "~/app/schemas/logQuery";
import type { ProjectUpdateSchema } from "~/app/schemas/project";
import type { TargetSchema } from "~/app/schemas/target";
import type { ADPwnProject, Target } from "~/app/types/adpwn/ADPwnProject";
import { API_ROUTES } from "#imports"; 

export const useProjectsApi = () => {
  const api = useApiClient();

  return {
    // Load All Projects
    getProjects: () => api.get<ADPwnProject[]>(API_ROUTES.PROJECTS.LIST),

    // Create Project
    createProject: (projectData: ProjectUpdateSchema) =>
      api.create<ADPwnProject>(API_ROUTES.PROJECTS.ROOT, projectData),

    // Update Project
    updateProject: (uid: string, updateData: ProjectUpdateSchema) =>
      api.update<ADPwnProject>(
        API_ROUTES.PROJECTS.DETAIL(uid),
        updateData,
        { headers: { "Content-Type": "application/merge-patch+json" } }
      ),

    // Get Project Logs
    getLogs: (uid: string) =>
      api.get<string[]>(API_ROUTES.PROJECTS.LOGS.LIST(uid)),

    getLogsWithOptions: (uid: string, optionData: LogQueryOptionsSchema) =>
      api.customRequest<string[]>(
        API_ROUTES.PROJECTS.LOGS.QUERY(uid),
        'POST',
        { data: optionData }
      ),

    getLogTypes: (uid: string) =>
      api.get<string[]>(API_ROUTES.PROJECTS.LOGS.TYPES(uid)),

    getLogModuleKeys: (uid: string) =>
      api.get<string[]>(API_ROUTES.PROJECTS.LOGS.MODULE_KEYS(uid)),

    // Get Project with UID
    getProject: (uid: string) =>
      api.get<ADPwnProject>(API_ROUTES.PROJECTS.DETAIL(uid)),

    // Get Project Targets with Project UID
    getTargets: (uid: string) =>
      api.get<Target[]>(API_ROUTES.PROJECTS.TARGETS.ROOT(uid)),

    // Create Target for Project with given UID
    createTarget: (projectUid: string, targetData: TargetSchema) =>
      api.create<Target>(
        API_ROUTES.PROJECTS.TARGETS.ROOT(projectUid),
        targetData
      ),

    // Optionally: searchProjects if implemented later
    // searchProjects: (query: string) =>
    //   api.customRequest<ProjectSearchResult[]>(
    //     `${API_ROUTES.PROJECTS.ROOT}/search`,
    //     'POST',
    //     { data: { query } }
    //   ),
  };
};

