// stores/project.ts
import { defineStore } from 'pinia'

interface Project {
  id: string | null
  name: string
}

export const useProjectStore = defineStore('project', {
  state: (): { project: Project } => ({
    project: {
      id: null,
      name: ''
    }
  }),
  actions: {
    setProject(id: string, name: string) {
      this.project.id = id
      this.project.name = name
    },
    clearProject() {
      this.project.id = null
      this.project.name = ''
    }
  },
  // Persist-Konfiguration gemäß der aktuellen API des Plugins
  persist: {
    strategies: [
      {
        key: 'project',
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        paths: ['project']
      }
    ]
  }
})
