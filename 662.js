function unique_name_364 (cb) {
  this.setUser(function (er) {
    if (er) return cb(er)
    this.loadUid(function (er) {
      if (er) return cb(er)
      // Without prefix, nothing will ever work
      mkdirp(this.prefix, cb)
    }.bind(this))
  }.bind(this))
}