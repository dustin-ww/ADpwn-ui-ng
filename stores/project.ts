// stores/project.ts
// This is a storage to save project id and name in a persistent user storage
import { defineStore } from "pinia";

interface Project {
  id: string;
  name: string;
}

export const useProjectStore = defineStore("project", {
  state: (): { project: Project } => ({
    project: {
      id: "",
      name: "",
    },
  }),
  getters: {
    projectID: (state) => state.project.id,
    projectName: (state) => state.project.name,
  },
  actions: {
    setProject(id: string, name: string) {
      (this.project.id = id), (this.project.name = name);
    },
    clearProject() {
      this.project.id = "";
      this.project.name = "";
    },
  },
  persist: true,
});
