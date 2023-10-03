function createPrivateKey (keyBitsize, options, callback) {
  if (!callback && !options && typeof keyBitsize === 'function') {
    callback = keyBitsize
    keyBitsize = undefined
    options = {}
  } else if (!callback && keyBitsize && typeof options === 'function') {
    callback = options
    options = {}
  }

  keyBitsize = Number(keyBitsize) || 2048

  var params = ['genrsa']
  var delTempPWFiles = []

  if (options && options.cipher && (Number(helper.ciphers.indexOf(options.cipher)) !== -1) && options.password) {
    helper.createPasswordFile({ 'cipher': options.cipher, 'password': options.password, 'passType': 'out' }, params, delTempPWFiles)
  }

  params.push(keyBitsize)

  openssl.exec(params, 'RSA PRIVATE KEY', function (sslErr, key) {
    function done (err) {
      if (err) {
        return callback(err)
      }
      callback(null, {
        key: key
      })
    }
    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr)
    })
  })
}