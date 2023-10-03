function onRequest (req, res) {
    // If a 'hostname' string is specified, deny requests with a 'Host'
    // header that does not match the origin of the torrent server to prevent
    // DNS rebinding attacks.
    if (opts.hostname && req.headers.host !== `${opts.hostname}:${server.address().port}`) {
      return req.destroy()
    }

    const pathname = new URL(req.url, 'http://example.com').pathname

    if (pathname === '/favicon.ico') {
      return serve404Page()
    }

    // Allow cross-origin requests (CORS)
    if (isOriginAllowed(req)) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    }

    // Prevent browser mime-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // Defense-in-depth: Set a strict Content Security Policy to mitigate XSS
    res.setHeader('Content-Security-Policy', "base-uri 'none'; default-src 'none'; frame-ancestors 'none'; object-src 'none';")

    // Allow CORS requests to specify arbitrary headers, e.g. 'Range',
    // by responding to the OPTIONS preflight request with the specified
    // origin and requested headers.
    if (req.method === 'OPTIONS') {
      if (isOriginAllowed(req)) return serveOptionsRequest()
      else return serveMethodNotAllowed()
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      if (torrent.ready) {
        handleRequest()
      } else {
        pendingReady.push(onReady)
        torrent.once('ready', onReady)
      }
      return
    }

    return serveMethodNotAllowed()

    function serveOptionsRequest () {
      res.statusCode = 204 // no content
      res.setHeader('Access-Control-Max-Age', '600')
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD')

      if (req.headers['access-control-request-headers']) {
        res.setHeader(
          'Access-Control-Allow-Headers',
          req.headers['access-control-request-headers']
        )
      }
      res.end()
    }

    function onReady () {
      arrayRemove(pendingReady, pendingReady.indexOf(onReady))
      handleRequest()
    }

    function handleRequest () {
      if (pathname === '/') {
        return serveIndexPage()
      }

      const index = Number(pathname.split('/')[1])
      if (Number.isNaN(index) || index >= torrent.files.length) {
        return serve404Page()
      }

      const file = torrent.files[index]
      serveFile(file)
    }

    function serveIndexPage () {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')

      const listHtml = torrent.files
        .map((file, i) => (
          `<li>
            <a
              download="${escapeHtml(file.name)}"
              href="/${escapeHtml(i)}/${escapeHtml(file.name)}"
            >
              ${escapeHtml(file.path)}
            </a>
            (${escapeHtml(file.length)} bytes)
          </li>`
        ))
        .join('<br>')

      const html = getPageHTML(
        `${escapeHtml(torrent.name)} - WebTorrent`,
        `
          <h1>${escapeHtml(torrent.name)}</h1>
          <ol>${listHtml}</ol>
        `
      )
      res.end(html)
    }

    function serve404Page () {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/html')

      const html = getPageHTML(
        '404 - Not Found',
        '<h1>404 - Not Found</h1>'
      )
      res.end(html)
    }

    function serveFile (file) {
      res.statusCode = 200
      res.setHeader('Content-Type', mime.getType(file.name) || 'application/octet-stream')

      // Support range-requests
      res.setHeader('Accept-Ranges', 'bytes')

      // Set name of file (for "Save Page As..." dialog)
      res.setHeader(
        'Content-Disposition',
        `inline; filename*=UTF-8''${encodeRFC5987(file.name)}`
      )

      // Support DLNA streaming
      res.setHeader('transferMode.dlna.org', 'Streaming')
      res.setHeader(
        'contentFeatures.dlna.org',
        'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000'
      )

      // `rangeParser` returns an array of ranges, or an error code (number) if
      // there was an error parsing the range.
      let range = rangeParser(file.length, req.headers.range || '')

      if (Array.isArray(range)) {
        res.statusCode = 206 // indicates that range-request was understood

        // no support for multi-range request, just use the first range
        range = range[0]

        res.setHeader(
          'Content-Range',
          `bytes ${range.start}-${range.end}/${file.length}`
        )
        res.setHeader('Content-Length', range.end - range.start + 1)
      } else {
        range = null
        res.setHeader('Content-Length', file.length)
      }

      if (req.method === 'HEAD') {
        return res.end()
      }

      pump(file.createReadStream(range), res)
    }

    function serveMethodNotAllowed () {
      res.statusCode = 405
      res.setHeader('Content-Type', 'text/html')
      const html = getPageHTML(
        '405 - Method Not Allowed',
        '<h1>405 - Method Not Allowed</h1>'
      )
      res.end(html)
    }
  }