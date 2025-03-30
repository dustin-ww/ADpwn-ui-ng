<!-- components/SSEClient.vue -->
<script setup>
// Bei Komponenten-Mount
onMounted(() => {
  const eventSource = new EventSource("http://localhost:8082/sse");

  eventSource.onmessage = (event) => {
    console.log("Neues Event:", event.data);
  };

  eventSource.onerror = (error) => {
    console.error("SSE Fehler:", error);
    eventSource.close();
  };
});

// Bei Komponenten-Abbau
onUnmounted(() => {
  eventSource?.close();
});
</script>

<template>
  <div>SSE Events in der Browser-Konsole</div>
</template>
