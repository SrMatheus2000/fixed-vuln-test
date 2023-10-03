function checkCertificate (certificate, passphrase, callback) {
  var params
  var delTempPWFiles = []

  if (!callback && typeof passphrase === 'function') {
    callback = passphrase
    passphrase = undefined
  }
  certificate = (certificate || '').toString()

  if (certificate.match(/BEGIN(\sNEW)? CERTIFICATE REQUEST/)) {
    params = ['req', '-text', '-noout', '-verify', '-in', '--TMPFILE--']
  } else if (certificate.match(/BEGIN RSA PRIVATE KEY/) || certificate.match(/BEGIN PRIVATE KEY/)) {
    params = ['rsa', '-noout', '-check', '-in', '--TMPFILE--']
  } else {
    params = ['x509', '-text', '-noout', '-in', '--TMPFILE--']
  }
  if (passphrase) {
    helper.createPasswordFile({ 'cipher': '', 'password': passphrase, 'passType': 'in' }, params, delTempPWFiles)
  }

  openssl.spawnWrapper(params, certificate, function (sslErr, code, stdout, stderr) {
    function done (err) {
      if (err && err.toString().trim() !== 'verify OK') {
        return callback(err)
      }
      var result
      switch (params[0]) {
        case 'rsa':
          result = /^Rsa key ok$/i.test(stdout.trim())
          break
        default:
          result = /Signature Algorithm/im.test(stdout)
          break
      }

      callback(null, result)
    }
    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr || stderr)
    })
  })
}