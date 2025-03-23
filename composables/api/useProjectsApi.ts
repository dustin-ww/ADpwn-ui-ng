// composables/api/projects.ts
import { useApiClient } from '~/composables/api/apiWrapper'
import { API_ROUTES } from '~/constants/apiRoutes'

export const useProjectsApi = () => {
  const api = useApiClient()

  return {
    // Projekte laden
    getProjects: () => api.get<Project[]>(API_ROUTES.PROJECTS.OVERVIEWS),

    // Projekt erstellen
    createProject: (projectData: ProjectCreateDto) =>
      api.create<Project>(API_ROUTES.PROJECTS.BASE, projectData),

    // Projekt aktualisieren
    updateProject: (uid: string, updateData: ProjectUpdateDto) =>
      api.update<Project>(
        API_ROUTES.PROJECTS.DETAIL(uid),
        updateData,
        { headers: { 'Content-Type': 'application/merge-patch+json' } }
      ),

    // Custom Request Beispiel
    searchProjects: (query: string) =>
      api.customRequest<ProjectSearchResult[]>(
        `${API_ROUTES.PROJECTS.BASE}/search`,
        'POST',
        { data: { query } }
      )
  }
}