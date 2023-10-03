function getModulus (certificate, password, hash, callback) {
  if (!callback && !hash && typeof password === 'function') {
    callback = password
    password = undefined
    hash = false
  } else if (!callback && hash && typeof hash === 'function') {
    callback = hash
    hash = false
    // password will be falsy if not provided
  }
  // adding hash function to params, is not supported by openssl.
  // process piping would be the right way (... | openssl md5)
  // No idea how this can be achieved in easy with the current build in methods
  // of pem.
  if (hash && hash !== 'md5') {
    hash = false
  }

  certificate = (Buffer.isBuffer(certificate) && certificate.toString()) || certificate

  var type = ''
  if (certificate.match(/BEGIN(\sNEW)? CERTIFICATE REQUEST/)) {
    type = 'req'
  } else if (certificate.match(/BEGIN RSA PRIVATE KEY/) || certificate.match(/BEGIN PRIVATE KEY/)) {
    type = 'rsa'
  } else {
    type = 'x509'
  }
  var params = [
    type,
    '-noout',
    '-modulus',
    '-in',
    '--TMPFILE--'
  ]
  var delTempPWFiles = []
  if (password) {
    helper.createPasswordFile({ 'cipher': '', 'password': password, 'passType': 'in' }, params, delTempPWFiles)
  }

  openssl.spawnWrapper(params, certificate, function (sslErr, code, stdout, stderr) {
    function done (err) {
      if (err) {
        return callback(err)
      }
      var match = stdout.match(/Modulus=([0-9a-fA-F]+)$/m)
      if (match) {
        return callback(null, {
          modulus: hash ? require(hash)(match[1]) : match[1]
        })
      } else {
        return callback(new Error('No modulus'))
      }
    }
    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr || stderr)
    })
  })
}