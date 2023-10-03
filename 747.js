function handleRequest (req, res, params, context) {
  var method = req.method
  var request = new context.Request(params, req, urlUtil.parse(req.url, true).query, req.headers, req.log)
  var reply = new context.Reply(res, context, request)

  if (method === 'GET' || method === 'HEAD') {
    return handler(reply)
  }

  var contentType = req.headers['content-type']

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    // application/json content type
    if (contentType && contentType.indexOf('application/json') > -1) {
      return jsonBody(request, reply, context._jsonBodyLimit)
    }

    // custom parser for a given content type
    if (context.contentTypeParser.fastHasHeader(contentType)) {
      return context.contentTypeParser.run(contentType, handler, request, reply)
    }

    reply.code(415).send(new Error('Unsupported Media Type: ' + contentType))
    return
  }

  if (method === 'OPTIONS' || method === 'DELETE') {
    if (!contentType) {
      return handler(reply)
    }

    // application/json content type
    if (contentType.indexOf('application/json') > -1) {
      return jsonBody(request, reply, context._jsonBodyLimit)
    }
    // custom parser for a given content type
    if (context.contentTypeParser.fastHasHeader(contentType)) {
      return context.contentTypeParser.run(contentType, handler, request, reply)
    }

    reply.code(415).send(new Error('Unsupported Media Type: ' + contentType))
    return
  }

  reply.code(405).send(new Error('Method Not Allowed: ' + method))
  return
}