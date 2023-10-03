function createHeaderGetter (str) {
  var name = str.toLowerCase()

  return function (req, res) {
    // set appropriate Vary header
    vary(res, str)

    // get header
    var header = req.headers[name]

    if (!header) {
      return undefined
    }

    // multiple headers get joined with comma by node.js core
    var index = header.indexOf(',')

    // return first value
    return index !== -1
      ? header.substr(0, index).trim()
      : header.trim()
  }
}