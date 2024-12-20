<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between">
      <label>{{ label }}</label>
      <span>Optional</span>
    </div>

    <div class="">
      <slot />
    </div>
  </div>
</template>

<script setup>
/* import */
import { faPlus } from '@fortawesome/pro-regular-svg-icons'

/* options */
defineOptions({})

/* emit */
const $emit = defineEmits([])

/* props */
const $props = defineProps({
  label: { type: String }
})

/* composables */
const $slots = useSlots()

/* api */
const templateApi = useSupabase('messages')

/* data */
const helpers = $ref({})

/* computed */
const template = $computed(() => {
  return templateApi.response.data
})

/* methods */
const getTemplate = async () => {
  templateApi.setQuery({}).get()
}

/* lifecycle */
onMounted(() => {})
</script>
