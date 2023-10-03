function trailingSlash () {
    var args = Array.prototype.slice.call(arguments)
    var done = middleware ? args.slice(-1)[0] : next

    var req = args[0]
    var res = args[1]
    var url = u.parse(req.url)
    var length = url.pathname.length
    var hasSlash = url.pathname.charAt(length - 1) === '/'

    if (hasSlash === slash) {
      if (middleware) {
        return done()
      }
      return next.apply(null, args)
    }

    if (slash) {
      url.pathname = url.pathname + '/'
    } else {
      url.pathname = url.pathname.slice(0, -1)
    }

    res.statusCode = status
    res.setHeader('Location', escapeLeadingSlashes(u.format(url)))
    res.end()
  }