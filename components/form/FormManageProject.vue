<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useProjectsApi } from '~/composables/api/useProjectsApi'
import { projectUpdateSchema, type ProjectUpdateSchema } from '~/schemas/project'
const projectStore = useProjectStore()
const projectsApi = useProjectsApi()
const { data: project, refresh } = await useAsyncData('projects', () =>
  projectsApi.getProject(projectStore.project.id)
)

const isLoading = ref(false)

const projectUpdateState = reactive({
  name: '',
  description: ''
})
const validationSchema = projectUpdateSchema
watch(() => project.value, (newProject) => {
  if (newProject) {
    projectUpdateState.name = newProject.data?.name || ''
    projectUpdateState.description = newProject.data?.description || ''
  }
}, { immediate: true })
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<ProjectUpdateSchema>) {

  isLoading.value = true

  try {
    const response = await projectsApi.updateProject(
      projectStore.project.id, 
      event.data 
    )
    
    if (response.error) {
      // Bei einem Fehler zeigen wir eine Fehlermeldung an
      toast.add({ 
        title: 'Error', 
        description: `Failed to update project: ${response.error.message}`, 
        color: 'error' 
      })
      console.error('Update error:', response.error)
    } else {
      // Bei Erfolg zeigen wir eine Erfolgsmeldung an
      toast.add({ 
        title: 'Success', 
        description: 'Project has been updated successfully.', 
        color: 'success' 
      })
      
      // Projekt-Daten neu laden
      await refreshNuxtData()
      await refresh()
    }
  } catch (error) {
    // Bei unerwarteten Fehlern
    toast.add({ 
      title: 'Error', 
      description: 'An unexpected error occurred.', 
      color: 'red' 
    })
    console.error('Unexpected error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UForm :schema="validationSchema" :state="projectUpdateState" class="space-y-4" @submit="onSubmit">
    <UFormField label="UID" name="uid" >
      <UInput disabled :placeholder="project?.data?.uid"/>
    </UFormField>
    <UFormField label="Name" name="name">
      <UInput v-model="projectUpdateState.name" :placeholder="project?.data?.name"/>
    </UFormField>
    <UFormField label="Description" name="description">
      <UInput v-model="projectUpdateState.description" :placeholder="project?.data?.description" />
    </UFormField>
    <UButton type="submit" :loading="isLoading">
      Update
    </UButton>
  </UForm>
</template>