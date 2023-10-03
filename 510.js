function unique_name_276 (code) {
    if (typeof code !== 'string') {
      throw new TypeError('not a string')
    }
    let src = 'Object.constructor = function () {};\n'
    src += 'return ' + code + ';\n'

    return vm.runInContext(
      '(function () {"use strict"; ' + src + '})()',
      this._context,
      this._options
    )
  }