function jsonBody (request, reply, limit) {
  const contentLength = Number.parseInt(request.headers['content-length'], 10)
  if (contentLength > limit) {
    reply.code(413).send(new Error('Request body is too large'))
    return
  }

  const req = request.req
  const chunks = []
  var receivedLength = 0

  req.on('data', onData)
  req.on('end', onEnd)
  req.on('error', onEnd)

  function removeHandlers () {
    req.removeListener('data', onData)
    req.removeListener('end', onEnd)
    req.removeListener('error', onEnd)
  }

  function onData (chunk) {
    receivedLength += chunk.length

    if (receivedLength > limit) {
      removeHandlers()
      reply.code(413).send(new Error('Request body is too large'))
      return
    }

    chunks.push(chunk)
  }

  function onEnd (err) {
    removeHandlers()

    if (err !== undefined) {
      reply.code(400).send(err)
      return
    }

    if (!Number.isNaN(contentLength) && receivedLength !== contentLength) {
      reply.code(400).send(new Error('Request body size did not match Content-Length'))
      return
    }

    if (receivedLength === 0) { // Body is invalid JSON
      reply.code(422).send(new Error('Unexpected end of JSON input'))
      return
    }

    const body = chunks.length === 1
      ? chunks[0].toString()
      : chunks.join('')
    try {
      request.body = JSON.parse(body)
    } catch (err) {
      reply.code(422).send(err)
      return
    }
    handler(reply)
  }
}