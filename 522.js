function unique_name_282 (error, code) {
    if (error) {
      callback(error)
    } else {
      var params = [
        'pkcs12',
        '-export',
        '-in',
        tmpfile,
        '-inkey',
        pathBundleIN.key,
        '-out',
        pathOUT
      ]
      if (pathBundleIN.ca) {
        if (!Array.isArray(pathBundleIN.ca)) {
          pathBundleIN.ca = [ pathBundleIN.ca ]
        }
        pathBundleIN.ca.forEach(function (ca) {
          params.push('-certfile')
          params.push(ca)
        })
      }
      var delTempPWFiles = [tmpfile]
      helper.createPasswordFile({ 'cipher': '', 'password': password, 'passType': 'in' }, params, delTempPWFiles)
      helper.createPasswordFile({ 'cipher': '', 'password': password, 'passType': 'out' }, params, delTempPWFiles)
      openssl.spawnWrapper(params, false, function (error, code) {
        function done (error) {
          if (error) {
            callback(error)
          } else {
            callback(null, code === 0)
          }
        }
        helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
          done(error || fsErr)
        })
      })
    }
  }