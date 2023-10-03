function unique_name_117 (err, data) {
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
      }