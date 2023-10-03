function serve (options = { contentBase: '' }) {
  if (Array.isArray(options) || typeof options === 'string') {
    options = { contentBase: options }
  }
  options.contentBase = Array.isArray(options.contentBase) ? options.contentBase : [options.contentBase]
  options.host = options.host || 'localhost'
  options.port = options.port || 10001
  options.headers = options.headers || {}
  options.https = options.https || false
  options.openPage = options.openPage || ''
  mime.default_type = 'text/plain'

  const requestListener = (request, response) => {
    // Remove querystring
    const unsafePath = decodeURI(request.url.split('?')[0])

    // Don't allow path traversal
    const urlPath = normalize(unsafePath)

    Object.keys(options.headers).forEach((key) => {
      response.setHeader(key, options.headers[key])
    })

    readFileFromContentBase(options.contentBase, urlPath, function (error, content, filePath) {
      if (!error) {
        return found(response, filePath, content)
      }
      if (error.code !== 'ENOENT') {
        response.writeHead(500)
        response.end('500 Internal Server Error' +
          '\n\n' + filePath +
          '\n\n' + Object.values(error).join('\n') +
          '\n\n(rollup-plugin-serve)', 'utf-8')
        return
      }
      if (options.historyApiFallback) {
        var fallbackPath = typeof options.historyApiFallback === 'string' ? options.historyApiFallback : '/index.html'
        readFileFromContentBase(options.contentBase, fallbackPath, function (error, content, filePath) {
          if (error) {
            notFound(response, filePath)
          } else {
            found(response, filePath, content)
          }
        })
      } else {
        notFound(response, filePath)
      }
    })
  }

  // release previous server instance if rollup is reloading configuration in watch mode
  if (server) {
    server.close()
  }

  // If HTTPS options are available, create an HTTPS server
  if (options.https) {
    server = createHttpsServer(options.https, requestListener).listen(options.port, options.host)
  } else {
    server = createServer(requestListener).listen(options.port, options.host)
  }

  closeServerOnTermination(server)

  var running = options.verbose === false

  return {
    name: 'serve',
    generateBundle () {
      if (!running) {
        running = true

        // Log which url to visit
        const url = (options.https ? 'https' : 'http') + '://' + options.host + ':' + options.port
        options.contentBase.forEach(base => {
          console.log(green(url) + ' -> ' + resolve(base))
        })

        // Open browser
        if (options.open) {
          opener(url + options.openPage)
        }
      }
    }
  }
}