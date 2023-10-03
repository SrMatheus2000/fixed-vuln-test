function checkPkcs12 (bufferOrPath, passphrase, callback) {
  if (!callback && typeof passphrase === 'function') {
    callback = passphrase
    passphrase = ''
  }

  var tmpfiles = []
  var delTempPWFiles = []
  var args = ['pkcs12', '-info', '-in', bufferOrPath, '-noout', '-maciter', '-nodes']

  helper.createPasswordFile({ 'cipher': '', 'password': passphrase, 'passType': 'in' }, args, delTempPWFiles)

  if (Buffer.isBuffer(bufferOrPath)) {
    tmpfiles = [bufferOrPath]
    args[3] = '--TMPFILE--'
  }

  openssl.spawnWrapper(args, tmpfiles, function (sslErr, code, stdout, stderr) {
    function done (err) {
      if (err) {
        return callback(err)
      }
      callback(null, (/MAC verified OK/im.test(stderr) || (!(/MAC verified OK/im.test(stderr)) && !(/Mac verify error/im.test(stderr)))))
    }
    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr)
    })
  })
}