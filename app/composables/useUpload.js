import tus from 'tus-js-client'
import axios from 'axios'

export const useUpload = (original, options = {}) => {
  /* options */
  // accept
  // maxSize

  /* supabase */
  const $supabase = useSupabaseClient()

  /* api */
  const status = ref('PENDING')
  const loading = ref(false)
  const time = ref(0)
  const attempt = ref(0)
  const progress = ref(0)
  const request = reactive({ body: {}, query: {}, params: {}, headers: {} })
  const response = reactive({ data: [] })
  const requestedAt = ref(0)
  const responsedAt = ref(0)

  /* file */
  let file = original

  const details = reactive({
    name: file.name,
    type: file.type,
    size: file.size,
    modifiedAt: new Date(file.lastModified),
    meta: {},
    width: 0,
    height: 0,
    previewUrl: null
  })

  /* functions */
  const storage = async (bucket, path, options = {}) => {
    const { data, error } = await $supabase.storage.from(bucket).upload(path, file, options)
  }

  const upload = async (url, options = {}) => {
    const response = await axios({
      url,
      method: 'POST',
      data: file,
      onUploadProgress: progressEvent => {
        progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
  }

  const resumableUpload = async (endpoint, options = {}) => {
    const api = new tus.Upload(file, {
      endpoint,
      // Retry delays will enable tus-js-client to automatically retry on errors
      retryDelays: [0, 3000, 5000, 10000, 20000],
      // Attach additional meta data about the file for the server
      metadata: {},
      // Callback for errors which cannot be fixed using retries
      onError: function (error) {
        console.log('Failed because: ' + error)
      },
      // Callback for reporting upload progress
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        progress.value = percentage
      },
      // Callback for once the upload is completed
      onSuccess: function () {
        console.log('Download %s from %s', upload.file.name, upload.url)
      }
    })

    api.start()
  }

  // presigned
  // cancel
  // base64

  /* helpers */
  function is(check) {
    if (check === 'image') {
      return details.type.includes('image')
    } else if (check === 'video') {
      return details.type.includes('video')
    } else if (check === 'media') {
      return details.type.includes('image') || details.type.includes('video')
    }
  }

  function setFile(value) {
    file = value
  }

  /*
  compress
  measure
  rename
  change type
  validate - size / type
  meta
  presigned?
  */

  return {
    status,
    loading,
    time,
    attempt,
    progress,
    request,
    response,
    requestedAt,
    responsedAt,
    details,
    is,
    storage,
    upload,
    setFile
  }
}
