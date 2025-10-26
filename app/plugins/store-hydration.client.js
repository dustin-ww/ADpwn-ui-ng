export default defineNuxtPlugin(async () => {
  const project = useCurrentProjectStore()
  await project.hydrate()
})
