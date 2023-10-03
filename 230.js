(request, response) => {
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