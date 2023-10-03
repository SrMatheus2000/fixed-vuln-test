function unique_name_419 (u) {
  var p = url.parse(u).pathname

  // Encoded dots are dots
  p = p.replace(/%2e/ig, '.')

  // encoded slashes are /
  p = p.replace(/%2f|%5c/ig, '/')

  // back slashes are slashes
  p = p.replace(/[\/\\]/g, '/')

  // Make sure it starts with a slash
  p = p.replace(/^\//, '/')
  if ((/[\/\\]\.\.([\/\\]|$)/).test(p)) {
    // traversal urls not ever even slightly allowed. clearly shenanigans
    // send a 403 on that noise, do not pass go, do not collect $200
    return 403
  }

  u = path.normalize(p).replace(/\\/g, '/')
  if (u.indexOf(this.url) !== 0) return false

  try {
    u = decodeURIComponent(u)
  }
  catch (e) {
    // if decodeURIComponent failed, we weren't given a valid URL to begin with.
    return false
  }

  // /a/b/c mounted on /path/to/z/d/x
  // /a/b/c/d --> /path/to/z/d/x/d
  u = u.substr(this.url.length)
  if (u.charAt(0) !== '/') u = '/' + u

  return u
}