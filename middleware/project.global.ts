import { useCurrentProjectStore } from "~/stores/currentProject";

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const project = useCurrentProjectStore();

  const isProjectInStore = project.id !== "";

  if (to.path === "/start") {
    return;
  }

  if (!isProjectInStore) {
    return navigateTo("/start");
  }
});
