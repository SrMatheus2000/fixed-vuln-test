function thenify(fn, options) {
  assert(typeof fn === 'function')
  return createWrapper(fn, options)
}