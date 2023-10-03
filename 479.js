function unique_name_251 (current) {
  var self = this
  var props = self.props
  var stat = props.follow ? 'stat' : 'lstat'
  var who = self._proxy || self

  if (current) statCb(null, current)
  else fs[stat](self._path, statCb)

  function statCb (er, current) {
    if (self.filter && !self.filter.call(who, who, current)) {
      self._aborted = true
      self.emit('end')
      self.emit('close')
      return
    }

    // if it's not there, great.  We'll just create it.
    // if it is there, then we'll need to change whatever differs
    if (er || !current) {
      return create(self)
    }

    self._old = current
    var currentType = getType(current)

    // if it's a type change, then we need to clobber or error.
    // if it's not a type change, then let the impl take care of it.
    if (currentType !== self.type || self.type === 'File' && current.nlink > 1) {
      return rimraf(self._path, function (er) {
        if (er) return self.error(er)
        self._old = null
        create(self)
      })
    }

    // otherwise, just handle in the app-specific way
    // this creates a fs.WriteStream, or mkdir's, or whatever
    create(self)
  }
}