import snakecaseKeys from 'snakecase-keys'

export const useSupabase = entity => {
  const $supabase = useSupabaseClient()

  const loading = ref(false)
  const time = ref(0)
  const attempt = ref(0)
  const progress = ref(0)
  const request = reactive({})
  const response = reactive({})
  const requestedAt = ref(0)
  const responsedAt = ref(0)

  /* wrapper */
  const wrapper = async fn => {
    try {
      setRequestedAt()
      setAttempt()
      setLoading(true)

      const result = await fn()

      setResponse(result)
    } catch (error) {
      console.error('supabase error:', error)
      setResponse({ error })
    } finally {
      setLoading(false)
      setResponsedAt()
    }
  }

  /* auth */
  const login = () =>
    wrapper(async () => {
      const { body } = request
      return await $supabase.auth.signInWithPassword(body)
    })

  const register = () =>
    wrapper(async () => {
      const { body } = request
      return await $supabase.auth.signUp(body)
    })

  const logout = () =>
    wrapper(async () => {
      return await $supabase.auth.signOut()
    })

  const forgottenPassword = (options = {}) =>
    wrapper(async () => {
      const { email } = request.body
      return await $supabase.auth.resetPasswordForEmail(email, {
        ...options
      })
    })

  const changePassword = () =>
    wrapper(async () => {
      const { password } = request.body
      return await $supabase.auth.updateUser({ password })
    })

  const oAuth = (options = {}) =>
    wrapper(async () => {
      return await $supabase.auth.signInWithOAuth({
        // skipBrowserRedirect: true, - use if needed to open pop (data.url)
        ...options
      })
    })

  /* function */
  const invoke = name =>
    wrapper(async () => {
      const { body, query } = request
      return await $supabase.rpc(name, {
        ...query,
        ...body
      })
    })

  /* queries */
  const create = (options = {}) =>
    wrapper(async () => {
      const { body } = request
      const prepared = $supabase.from(entity)

      if (options.upsert) {
        return await prepared.upsert(body).select().single()
      } else {
        return await prepared.insert(body).select().single()
      }
    })

  const update = () =>
    wrapper(async () => {
      const { body } = request
      const prepared = $supabase.from(entity).update(body)

      addFilters(prepared, request.params)

      return await prepared.select()
    })

  const del = () =>
    wrapper(async () => {
      appendBody({ status: 'DELETED' })
      await update()
    })

  const find = (options = {}) =>
    wrapper(async () => {
      const prepared = $supabase.from(entity).select(`id,user:user_id(id)`)
      addFilters(prepared, request.query)
      addPagination(prepared, options)
      return await prepared
    })

  const get = () =>
    wrapper(async () => {
      const prepared = $supabase.from(entity).select('*').limit(1).single()

      addFilters(prepared, request.params)

      return await prepared
    })

  /* helpers */
  function is(check) {
    if (check === 'success') {
      return response.status === 'success'
    }
  }

  function setBody(body) {
    request.body = snakecaseKeys({ ...body }, { deep: true })
    return this
  }

  function appendBody(body) {
    setBody({ ...request.body, ...body })
    return this
  }

  function setParams(params) {
    request.params = snakecaseKeys({ ...params }, { deep: true })
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

  function addFilters(prepared, object = {}) {
    /*
    neq - not equal (!)
    .gt('id', 2) - greater than
    .gte - greater than or equal to
    .lt
    .lte
    .like('name', '%Alba%') - regex
    .ilike('name', '%alba%') - regex case insensitive
    .is('name', null) - boolean or null
    .in('name', ['Albania', 'Algeria'])
    .contains('tags', ['is:open', 'priority:low'])  - https://supabase.com/docs/reference/javascript/contains
    https://supabase.com/docs/reference/javascript/rangegt - there's more

    status: '!LIVE'
    quantity: '>12' '>=12' '<=12' etc
    title: '%aberdeen%'
    status: ['LIVE','DELETED'] - array
    */

    Object.keys(object).forEach(key => {
      prepared.eq(key, object[key])
    })
  }

  function addPagination(prepared, options = {}) {
    const { limit = 24, page = 1, orderBy } = options

    if (orderBy) {
      const orderByChunks = orderBy.split(':')
      prepared.order(snakeCase(orderByChunks[0]), { ascending: orderByChunks[1] === 'asc' })
    }

    const from = limit * (page - 1)
    const to = limit * page - 1
    prepared.range(from, to)
  }

  return {
    loading,
    attempt,
    time,
    progress,
    request,
    response,
    is,
    setBody,
    setParams,
    setQuery,
    setLoading,
    login,
    register,
    changePassword,
    forgottenPassword,
    logout,
    oAuth,
    invoke,
    create,
    update,
    find,
    get,
    delete: del
  }
}
