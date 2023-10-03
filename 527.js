function createCSR (options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options
    options = undefined
  }

  options = options || {}

  // http://stackoverflow.com/questions/14089872/why-does-node-js-accept-ip-addresses-in-certificates-only-for-san-not-for-cn
  if (options.commonName && (net.isIPv4(options.commonName) || net.isIPv6(options.commonName))) {
    if (!options.altNames) {
      options.altNames = [options.commonName]
    } else if (options.altNames.indexOf(options.commonName) === -1) {
      options.altNames = options.altNames.concat([options.commonName])
    }
  }

  if (!options.clientKey) {
    createPrivateKey(options.keyBitsize || 2048, function (error, keyData) {
      if (error) {
        return callback(error)
      }
      options.clientKey = keyData.key
      createCSR(options, callback)
    })
    return
  }

  var params = ['req',
    '-new',
    '-' + (options.hash || 'sha256')
  ]

  if (options.csrConfigFile) {
    params.push('-config')
    params.push(options.csrConfigFile)
  } else {
    params.push('-subj')
    params.push(generateCSRSubject(options))
  }

  params.push('-key')
  params.push('--TMPFILE--')

  var tmpfiles = [options.clientKey]
  var config = null

  if (options.altNames && Array.isArray(options.altNames) && options.altNames.length) {
    params.push('-extensions')
    params.push('v3_req')
    params.push('-config')
    params.push('--TMPFILE--')
    var altNamesRep = []
    for (var i = 0; i < options.altNames.length; i++) {
      altNamesRep.push((net.isIP(options.altNames[i]) ? 'IP' : 'DNS') + '.' + (i + 1) + ' = ' + options.altNames[i])
    }

    tmpfiles.push(config = [
      '[req]',
      'req_extensions = v3_req',
      'distinguished_name = req_distinguished_name',
      '[v3_req]',
      'subjectAltName = @alt_names',
      '[alt_names]',
      altNamesRep.join('\n'),
      '[req_distinguished_name]',
      'commonName = Common Name',
      'commonName_max = 64'
    ].join('\n'))
  } else if (options.config) {
    config = options.config
  }

  var delTempPWFiles = []
  if (options.clientKeyPassword) {
    helper.createPasswordFile({ 'cipher': '', 'password': options.clientKeyPassword, 'passType': 'in' }, params, delTempPWFiles)
  }

  openssl.exec(params, 'CERTIFICATE REQUEST', tmpfiles, function (sslErr, data) {
    function done (err) {
      if (err) {
        return callback(err)
      }
      callback(null, {
        csr: data,
        config: config,
        clientKey: options.clientKey
      })
    }
    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr)
    })
  })
}