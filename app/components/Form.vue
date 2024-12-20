<template>
  <form @submit.prevent="onSubmit()"><slot :errors="errors" :loading="isLoading" /></form>
</template>

<script setup>
/* import */
import { faPlus } from '@fortawesome/pro-regular-svg-icons'

/* options */
defineOptions({})

/* emit */
const $emit = defineEmits(['valid'])

/* props */
const $props = defineProps({
  api: { type: Object, default: {} },
  body: { type: Object },
  validation: { type: Object }
})

/* composables */
const $slots = useSlots()

/* api */
const templateApi = useSupabase('messages')

/* data */
const errors = $ref({})

/* computed */
const isLoading = $computed(() => {
  const { api } = $props
  return toValue(api.loading) === true
})

/* methods */
const onSubmit = async () => {
  try {
    const { validation } = $props

    clearErrors()

    const body = await validation.validateSync($props.body, {
      abortEarly: false,
      stripUnknown: true
    })

    $emit('valid', body)
  } catch (error) {
    setErrors(error?.inner)
  }
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = undefined
  })
}

const setErrors = issues => {
  issues.forEach(issue => {
    errors[issue.path] = issue.message
  })
}

/* lifecycle */
onMounted(() => {})
</script>
