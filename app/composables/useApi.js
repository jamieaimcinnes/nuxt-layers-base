import snakecaseKeys from 'snakecase-keys'

export const useApi = defaults => {
  const loading = ref(false)
  const time = ref(0)
  const attempt = ref(0)
  const request = reactive({ body: {}, query: {}, params: {}, headers: {} })
  const response = reactive({ data: [] })
  const requestedAt = ref(0)
  const responsedAt = ref(0)

  /* methods */
  const call = async (url, method) => {
    try {
      setRequestedAt()
      setAttempt()
      setLoading(true)

      const { body, query, headers } = request

      const api = await $fetch(formatUrl(url), {
        method,
        headers,
        query,
        body: method !== 'GET' ? body : undefined
      })

      setResponse(api)
    } catch (error) {
      console.error('api error:', error)
      setResponse({ error })
    } finally {
      setLoading(false)
      setResponsedAt()
    }
  }

  const get = url => call(url, 'GET')

  const post = url => call(url, 'POST')

  const put = url => call(url, 'PUT')

  const del = url => call(url, 'DEL')

  /* helpers */
  function is(check) {
    if (check === 'success') {
      return response.status === 'success'
    }
  }

  function formatUrl(url) {
    const { params } = request
    return url.replace(/:(\w+)/g, (match, key) => {
      if (params[key] !== undefined) {
        return params[key]
      } else {
        console.warn(`Missing value for URL parameter: ${key}`)
        return match
      }
    })
  }

  function setBody(body) {
    request.body = snakecaseKeys({ ...body }, { deep: true })
    return this
  }

  function appendBody(body) {
    setBody({ ...request.body, ...body })
    return this
  }

  function setHeaders(headers) {
    request.headers = headers
    return this
  }

  function setParams(params) {
    request.params = params
    return this
  }

  function setQuery(query) {
    request.query = snakecaseKeys({ ...query }, { deep: true })
    return this
  }

  function setLoading(value) {
    loading.value = value
    return this
  }

  function setAttempt(value) {
    if (value !== undefined) {
      attempt.value = value
    } else {
      attempt.value++
    }

    return this
  }

  function setRequestedAt() {
    requestedAt.value = new Date().getTime()
  }

  function setResponsedAt() {
    responsedAt.value = new Date().getTime()
    time.value = toValue(responsedAt.value) - toValue(requestedAt.value)
  }

  function setResponse({ data, error }) {
    if (error) {
      response.status = 'error'
      response.message = error.message
      response.data = []
      response.debug = error

      onError()
    } else {
      response.status = 'success'
      response.message = ''
      response.data = data
      response.debug = {}

      onSuccess()
    }
  }

  function onError() {}

  function onSuccess() {
    setAttempt(0)
  }

  return {
    loading,
    time,
    attempt,
    request,
    response,
    requestedAt,
    responsedAt,
    get,
    post,
    delete: del,
    put,
    is,
    setBody,
    setQuery,
    setHeaders,
    setParams
  }
}
