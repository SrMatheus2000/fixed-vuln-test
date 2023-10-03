function logRequest (method, res, startTime, opts) {
  const elapsedTime = Date.now() - startTime
  const attempt = res.headers.get('x-fetch-attempts')
  const attemptStr = attempt && attempt > 1 ? ` attempt #${attempt}` : ''
  const cacheStr = res.headers.get('x-local-cache') ? ' (from cache)' : ''

  let urlStr
  try {
    const url = new URL(res.url)
    urlStr = res.url.replace(url.password, '***')
  } catch {
    urlStr = res.url
  }

  opts.log.http(
    'fetch',
    `${method.toUpperCase()} ${res.status} ${urlStr} ${elapsedTime}ms${attemptStr}${cacheStr}`
  )
}