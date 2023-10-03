function deepExtend (a, b) {
  // TODO: add support for Arrays to deepExtend
  if (Array.isArray(b)) {
    throw new TypeError('Arrays are not supported by deepExtend')
  }

  for (const prop in b) {
    // We check against prop not being in Object.prototype or Function.prototype
    // to prevent polluting for example Object.__proto__.
    if (hasOwnProperty(b, prop) && !(prop in Object.prototype) && !(prop in Function.prototype)) {
      if (b[prop] && b[prop].constructor === Object) {
        if (a[prop] === undefined) {
          a[prop] = {}
        }
        if (a[prop] && a[prop].constructor === Object) {
          deepExtend(a[prop], b[prop])
        } else {
          a[prop] = b[prop]
        }
      } else if (Array.isArray(b[prop])) {
        throw new TypeError('Arrays are not supported by deepExtend')
      } else {
        a[prop] = b[prop]
      }
    }
  }
  return a
}