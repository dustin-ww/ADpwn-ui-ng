export default defineNuxtPlugin(() => {
  const project = useCurrentProjectStore();
  project.hydrate();
});