<template>
  <input />
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
  modelValue: { type: null, default: '' }
})

/* composables */
const $slots = useSlots()

/* api */
const templateApi = useSupabase('messages')

/* data */
const helpers = $ref({})

/* computed */
const value = $computed({
  get() {
    return $props.modelValue
  },
  set(value) {
    $emit('update:modelValue', value)
  }
})

/* methods */
const getTemplate = async () => {
  templateApi.setQuery({}).get()
}

/* lifecycle */
onMounted(() => {})
</script>
