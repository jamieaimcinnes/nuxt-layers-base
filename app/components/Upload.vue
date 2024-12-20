<template>
  <div class="p-2 m-2 space-y-1 border">
    <div>Name: {{ uploadApi.details.name }}</div>
    <div>Type: {{ uploadApi.details.type }}</div>
    <div>Size: {{ uploadApi.details.size }}</div>
    <div>Last modified: {{ uploadApi.details.modifiedAt }}</div>
    <div>Progress: {{ uploadApi.progress }}</div>
    <button @click="uploadApi.upload('/api/files/test')">Upload</button>
  </div>
</template>

<script setup>
/* props */
const $props = defineProps({
  file: { type: Object }
})

/* api */
const uploadApi = useUpload($props.file)
</script>
