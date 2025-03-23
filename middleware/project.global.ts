export default defineNuxtRouteMiddleware((to, from) => {
    const project = useProjectStore()
    
    const currentProject = computed(() => project.project.id)
  
    const isProjectInStore = currentProject.value !== null && currentProject.value !== '' && currentProject.value !== undefined
    
    if (to.path === '/start') {
      return
    }
    
    if (isProjectInStore) {
      return
    }
  
    if (isProjectInStore && to.path === '/start') {
      return navigateTo("/")
    }
    
     
    if (to.path !== '/start') {
      return navigateTo('/start')
    }
  
  })