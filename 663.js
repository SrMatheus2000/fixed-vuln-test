function unique_name_365 (where, cb) {
  var target = this.sources[where]
  if (!target || !(target.path || target.source) || !target.data) {
    var er
    if (where !== 'builtin') er = new Error('bad save target: ' + where)
    if (cb) {
      process.nextTick(cb.bind(null, er))
      return this
    }
    return this.emit('error', er)
  }

  if (target.source) {
    var pref = target.prefix || ''
    Object.keys(target.data).forEach(function (k) {
      target.source[pref + k] = target.data[k]
    })
    if (cb) process.nextTick(cb)
    return this
  }

  var data = ini.stringify(target.data)

  var then = function then (er) {
    if (er) return done(er)

    fs.chmod(target.path, mode, done)
  }

  var done = function done (er) {
    if (er) {
      if (cb) return cb(er)
      else return this.emit('error', er)
    }
    this._saving --
    if (this._saving === 0) {
      if (cb) cb()
      this.emit('save')
    }
  }

  then = then.bind(this)
  done = done.bind(this)
  this._saving ++

  var mode = where === 'user' ? '0600' : '0666'
  if (!data.trim()) {
    fs.unlink(target.path, function () {
      // ignore the possible error (e.g. the file doesn't exist)
      done(null)
    })
  } else {
    mkdirp(path.dirname(target.path), function (er) {
      if (er) return then(er)
      fs.writeFile(target.path, data, 'utf8', function (er) {
        if (er) return then(er)
        if (where === 'user' && myUid && myGid) {
          fs.chown(target.path, +myUid, +myGid, then)
        } else {
          then()
        }
      })
    })
  }

  return this
}