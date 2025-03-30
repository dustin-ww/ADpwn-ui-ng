<script lang="ts">
useHead({
  title: "ADPwn - Domain Management",
  meta: [{ name: "description", content: "Domain management dashboard" }],
});
</script>

<template>
  <div>
    <SharedHeading heading="Manage Domains" />
    <ListDomains
      :domains="domains"
      :loading="loading"
      @row-actions="onRowActions"
    />
  </div>
</template>
