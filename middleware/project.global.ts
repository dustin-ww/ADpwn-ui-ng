import { useProjectStore } from "~/stores/project";

export default defineNuxtRouteMiddleware((to) => {
  // Führe die Middleware nur auf dem Client aus
  if (import.meta.server) return;

  const project = useProjectStore();

  // Überprüfe, ob ein Projekt im Store vorhanden ist
  const isProjectInStore = project.currentProject.id !== "";

  // Wenn der Benutzer auf "/start" ist, keine Umleitung durchführen
  if (to.path === "/start") {
    return;
  }

  // Wenn kein Projekt im Store ist, auf "/start" umleiten
  if (!isProjectInStore) {
    return navigateTo("/start");
  }
});
