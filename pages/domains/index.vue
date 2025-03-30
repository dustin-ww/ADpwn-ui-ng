<script lang="ts">
import { ModalCreateDomain } from '#components';
import Modal from '@nuxt/ui/runtime/components/Modal.vue';



</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <SharedHeading heading="Manage Domains" />
      <ModalCreateDomain class="mr-10"/>
    </div>
    <ListDomains/>
  </div>
</template>
