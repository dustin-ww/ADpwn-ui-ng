import { useCurrentProjectStore } from "~/stores/currentProjectStore";

export default defineNuxtRouteMiddleware((to) => {
 
  const project = useCurrentProjectStore();

  const isProjectInStore = project.uid !== "";

  if (to.path === "/start") {
    return;
  }

  if (!isProjectInStore) {
    return navigateTo("/start");
  } 
});
