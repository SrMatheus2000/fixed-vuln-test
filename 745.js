function route (opts) {
    const _fastify = this

    if (Array.isArray(opts.method)) {
      for (var i = 0; i < opts.method.length; i++) {
        if (supportedMethods.indexOf(opts.method[i]) === -1) {
          throw new Error(`${opts.method[i]} method is not supported!`)
        }
      }
    } else {
      if (supportedMethods.indexOf(opts.method) === -1) {
        throw new Error(`${opts.method} method is not supported!`)
      }
    }

    if (!opts.handler) {
      throw new Error(`Missing handler function for ${opts.method}:${opts.url} route.`)
    }

    var jsonBodyLimit = _fastify._jsonBodyLimit
    if (opts.jsonBodyLimit !== undefined) {
      if (!Number.isInteger(opts.jsonBodyLimit)) {
        throw new TypeError(`'jsonBodyLimit' option must be an integer. Got: '${opts.jsonBodyLimit}'`)
      }
      jsonBodyLimit = opts.jsonBodyLimit
    }

    _fastify.after((notHandledErr, done) => {
      const path = opts.url || opts.path
      const prefix = _fastify._routePrefix
      const url = prefix + (path === '/' && prefix.length > 0 ? '' : path)

      const config = opts.config || {}
      config.url = url

      const context = new Context(
        opts.schema,
        opts.handler.bind(_fastify),
        _fastify._Reply,
        _fastify._Request,
        _fastify._contentTypeParser,
        config,
        _fastify._errorHandler,
        _fastify._middie,
        jsonBodyLimit,
        _fastify
      )

      try {
        buildSchema(context, opts.schemaCompiler || _fastify._schemaCompiler)
      } catch (error) {
        done(error)
        return
      }

      const onRequest = _fastify._hooks.onRequest
      const onResponse = _fastify._hooks.onResponse
      const onSend = _fastify._hooks.onSend
      const preHandler = _fastify._hooks.preHandler.concat(opts.beforeHandler || [])

      context.onRequest = onRequest.length ? fastIterator(onRequest, _fastify) : null
      context.onResponse = onResponse.length ? fastIterator(onResponse, _fastify) : null
      context.onSend = onSend.length ? fastIterator(onSend, _fastify) : null
      context.preHandler = preHandler.length ? fastIterator(preHandler, _fastify) : null

      if (map.has(url)) {
        if (map.get(url)[opts.method]) {
          return done(new Error(`${opts.method} already set for ${url}`))
        }

        if (Array.isArray(opts.method)) {
          for (i = 0; i < opts.method.length; i++) {
            map.get(url)[opts.method[i]] = context
          }
        } else {
          map.get(url)[opts.method] = context
        }
        router.on(opts.method, url, startHooks, context)
      } else {
        const node = {}
        if (Array.isArray(opts.method)) {
          for (i = 0; i < opts.method.length; i++) {
            node[opts.method[i]] = context
          }
        } else {
          node[opts.method] = context
        }
        map.set(url, node)
        router.on(opts.method, url, startHooks, context)
      }
      done(notHandledErr)
    })

    // chainable api
    return _fastify
  }