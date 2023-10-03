function serialize (source, opts) {
  var out = ''
  var key
  var tmp
  var type
  var i

  opts = opts || {}
  if (!opts._visited) {
    opts._visited = []
  }
  if (!opts._refs) {
    opts.references = []
    opts._refs = new Ref(opts.references)
  }

  if (util.isNull(source)) {
    out += 'null'
  } else if (util.isArray(source)) {
    tmp = source.map(function (item) {
      return serialize(item, opts)
    })
    out += '[' + tmp.join(', ') + ']'
  } else if (util.isFunction(source)) {
    tmp = source.toString()
    // append function to es6 function within obj
    out += !/^\s*(function|\([^)]*\)\s*=>)/m.test(tmp) ? 'function ' + tmp : tmp
  } else if (util.isObject(source)) {
    if (util.isRegExp(source)) {
      out += 'new RegExp("' + source.source + '", "' + source.flags + '")'
    } else if (util.isDate(source)) {
      out += 'new Date("' + source.toJSON() + '")'
    } else if (util.isError(source)) {
      out += 'new Error(' + (source.message ? '"' + source.message + '"' : '') + ')'
    } else if (util.isBuffer(source)) {
      // check for buffer first otherwise tests fail on node@4.4
      // looks like buffers are accidentially detected as typed arrays
      out += "Buffer.from('" + source.toString('base64') + "', 'base64')"
    } else if ((type = util.isTypedArray(source))) {
      tmp = []
      for (i = 0; i < source.length; i++) {
        tmp.push(source[i])
      }
      out += 'new ' + type + '(' +
        '[' + tmp.join(', ') + ']' +
        ')'
    } else {
      tmp = []
      // copy properties if not circular
      if (!~opts._visited.indexOf(source)) {
        opts._visited.push(source)
        for (key in source) {
          if (source.hasOwnProperty(key)) {
            if (opts.reference && util.isObject(source[key])) {
              opts._refs.push(key)
              if (!opts._refs.hasReference(source[key])) {
                tmp.push(Ref.wrapkey(key) + ': ' + serialize(source[key], opts))
              }
              opts._refs.pop()
            } else {
              tmp.push(Ref.wrapkey(key) + ': ' + serialize(source[key], opts))
            }
          }
        }
        out += '{' + tmp.join(', ') + '}'
        opts._visited.pop()
      } else {
        if (opts.ignoreCircular) {
          out += '{/*[Circular]*/}'
        } else {
          throw new Error('can not convert circular structures.')
        }
      }
    }
  } else if (util.isString(source)) {
    out += '"' + (opts.unsafe ? util.unsafeString(source) : util.safeString(source)) + '"'
  } else {
    out += '' + source
  }
  return out
}