function unique_name_116 (fn, options) {
  assert(typeof fn === 'function')
  options = options || {}
  options.withCallback = true
  return createWrapper(fn, options)
}