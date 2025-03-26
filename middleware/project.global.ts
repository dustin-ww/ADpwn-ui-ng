import { useProjectStore } from "~/stores/project";

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const project = useProjectStore();

  const isProjectInStore = project.currentProject.id !== "";

  if (to.path === "/start") {
    return;
  }

  if (!isProjectInStore) {
    return navigateTo("/start");
  }
});