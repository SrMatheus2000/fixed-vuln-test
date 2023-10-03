function readPkcs12 (bufferOrPath, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options
    options = {}
  }

  options.p12Password = options.p12Password || ''

  var tmpfiles = []
  var delTempPWFiles = []
  var args = ['pkcs12', '-in', bufferOrPath]

  helper.createPasswordFile({ 'cipher': '', 'password': options.p12Password, 'passType': 'in' }, args, delTempPWFiles)

  if (Buffer.isBuffer(bufferOrPath)) {
    tmpfiles = [bufferOrPath]
    args[2] = '--TMPFILE--'
  }

  if (options.clientKeyPassword) {
    helper.createPasswordFile({ 'cipher': '', 'password': options.clientKeyPassword, 'passType': 'out' }, args, delTempPWFiles)
  } else {
    args.push('-nodes')
  }

  openssl.execBinary(args, tmpfiles, function (sslErr, stdout) {
    function done (err) {
      var keybundle = {}

      if (err && err.message.indexOf('No such file or directory') !== -1) {
        err.code = 'ENOENT'
      }

      if (!err) {
        var certs = readFromString(stdout, CERT_START, CERT_END)
        keybundle.cert = certs.shift()
        keybundle.ca = certs
        keybundle.key = readFromString(stdout, KEY_START, KEY_END).pop()

        if (keybundle.key) {
        // convert to RSA key
          return openssl.exec(['rsa', '-in', '--TMPFILE--'], 'RSA PRIVATE KEY', [keybundle.key], function (err, key) {
            keybundle.key = key

            return callback(err, keybundle)
          })
        }

        if (options.clientKeyPassword) {
          keybundle.key = readFromString(stdout, ENCRYPTED_KEY_START, ENCRYPTED_KEY_END).pop()
        } else {
          keybundle.key = readFromString(stdout, RSA_KEY_START, RSA_KEY_END).pop()
        }
      }

      return callback(err, keybundle)
    }
    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr)
    })
  })
}