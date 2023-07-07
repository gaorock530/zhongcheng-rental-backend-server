module.exports = async function requset(router, method = 'GET', data) {
  const route = url + router
  const headers = defaultHeaders
  // if not formdata, means data is json, must append header 'application/json'
  if (data instanceof FormData) delete headers['Content-Type']
  else headers['Content-Type'] = 'application/json'
  try {
    const res = await fetch(route, {
      method,
      headers,
      body: data,
      // credentials: 'include'
    })

    const json = await res.json()
    if (process.env.NODE_ENV === 'development' && json.error) console.log({ status: res.status, ...json })
    return { status: res.status, ...json }
  } catch (e) {
    console.log(e)
    throw Error('network error')
  }
}