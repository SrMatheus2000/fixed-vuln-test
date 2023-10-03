function unique_name_118 (key, cb) {
    let isPrivate = false
    let unbox
    let meta = false
    if (typeof key === 'object') {
      isPrivate = key.private === true
      unbox = key.unbox
      meta = key.meta
      key = key.id
    }

    if (ref.isMsg(key)) {
      return db.keys.get(key, function (err, data) {
        if (err) return cb(err)

        if (!isPrivate) {
          if (meta) cb(null, { key, value: u.originalValue(data.value), timestamp: data.timestamp })
          else cb(null, u.originalValue(data.value))
        }
        else {
          const result = db._unbox(data, unbox)

          if (meta) cb(null, { key, value: result.value, timestamp: result.timestamp })
          else cb(null, result.value)
        }
      })
    } else if (ref.isMsgLink(key)) {
      var link = ref.parseLink(key)
      return db.get({
        id: link.link,
        private: true,
        unbox: link.query.unbox.replace(/\s/g, '+'),
        meta: link.query.meta
      }, cb)
    } else if (Number.isInteger(key)) {
      _get(key, cb) // seq
    } else {
      throw new Error('ssb-db.get: key *must* be a ssb message id or a flume offset')
    }
  }