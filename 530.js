function createPkcs12 (key, certificate, password, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options
    options = {}
  }

  var params = ['pkcs12', '-export']
  var delTempPWFiles = []

  if (options.cipher && options.clientKeyPassword) {
    // NOTICE: The password field is needed! self if it is empty.
    // create password file for the import "-passin"
    helper.createPasswordFile({ 'cipher': options.cipher, 'password': options.clientKeyPassword, 'passType': 'in' }, params, delTempPWFiles)
  }
  // NOTICE: The password field is needed! self if it is empty.
  // create password file for the password "-password"
  helper.createPasswordFile({ 'cipher': '', 'password': password, 'passType': 'word' }, params, delTempPWFiles)

  params.push('-in')
  params.push('--TMPFILE--')
  params.push('-inkey')
  params.push('--TMPFILE--')

  var tmpfiles = [certificate, key]

  if (options.certFiles) {
    tmpfiles.push(options.certFiles.join(''))

    params.push('-certfile')
    params.push('--TMPFILE--')
  }

  openssl.execBinary(params, tmpfiles, function (sslErr, pkcs12) {
    function done (err) {
      if (err) {
        return callback(err)
      }
      return callback(null, {
        pkcs12: pkcs12
      })
    }
    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr)
    })
  })
}