function createCertificate (options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options
    options = undefined
  }

  options = options || {}

  if (!options.csr) {
    createCSR(options, function (error, keyData) {
      if (error) {
        return callback(error)
      }
      options.csr = keyData.csr
      options.config = keyData.config
      options.clientKey = keyData.clientKey
      createCertificate(options, callback)
    })
    return
  }

  if (!options.serviceKey) {
    if (options.selfSigned) {
      options.serviceKey = options.clientKey
    } else {
      createPrivateKey(options.keyBitsize || 2048, function (error, keyData) {
        if (error) {
          return callback(error)
        }
        options.serviceKey = keyData.key
        createCertificate(options, callback)
      })
      return
    }
  }

  var params = ['x509',
    '-req',
    '-' + (options.hash || 'sha256'),
    '-days',
    Number(options.days) || '365',
    '-in',
    '--TMPFILE--'
  ]
  var tmpfiles = [options.csr]
  var delTempPWFiles = []

  if (options.serviceCertificate) {
    params.push('-CA')
    params.push('--TMPFILE--')
    params.push('-CAkey')
    params.push('--TMPFILE--')
    if (options.serial) {
      params.push('-set_serial')
      if (helper.isNumber(options.serial)) {
        // set the serial to the max lenth of 20 octets ()
        // A certificate serial number is not decimal conforming. That is the
        // bytes in a serial number do not necessarily map to a printable ASCII
        // character.
        // eg: 0x00 is a valid serial number and can not be represented in a
        // human readable format (atleast one that can be directly mapped to
        // the ACSII table).
        params.push('0x' + ('0000000000000000000000000000000000000000' + options.serial.toString(16)).slice(-40))
      } else {
        if (helper.isHex(options.serial)) {
          if (options.serial.startsWith('0x')) {
            options.serial = options.serial.substring(2, options.serial.length)
          }
          params.push('0x' + ('0000000000000000000000000000000000000000' + options.serial).slice(-40))
        } else {
          params.push('0x' + ('0000000000000000000000000000000000000000' + helper.toHex(options.serial)).slice(-40))
        }
      }
    } else {
      params.push('-CAcreateserial')
      if (options.serialFile) {
        params.push('-CAserial')
        params.push(options.serialFile + '.srl')
      }
    }
    if (options.serviceKeyPassword) {
      helper.createPasswordFile({ 'cipher': '', 'password': options.serviceKeyPassword, 'passType': 'in' }, params, delTempPWFiles)
    }
    tmpfiles.push(options.serviceCertificate)
    tmpfiles.push(options.serviceKey)
  } else {
    params.push('-signkey')
    params.push('--TMPFILE--')
    if (options.serviceKeyPassword) {
      helper.createPasswordFile({ 'cipher': '', 'password': options.serviceKeyPassword, 'passType': 'in' }, params, delTempPWFiles)
    }
    tmpfiles.push(options.serviceKey)
  }

  if (options.config) {
    params.push('-extensions')
    params.push('v3_req')
    params.push('-extfile')
    params.push('--TMPFILE--')
    tmpfiles.push(options.config)
  } else if (options.extFile) {
    params.push('-extfile')
    params.push(options.extFile)
  }

  if (options.clientKeyPassword) {
    helper.createPasswordFile({ 'cipher': '', 'password': options.clientKeyPassword, 'passType': 'in' }, params, delTempPWFiles)
  }

  openssl.exec(params, 'CERTIFICATE', tmpfiles, function (sslErr, data) {
    function done (err) {
      if (err) {
        return callback(err)
      }
      var response = {
        csr: options.csr,
        clientKey: options.clientKey,
        certificate: data,
        serviceKey: options.serviceKey
      }
      return callback(null, response)
    }

    helper.deleteTempFiles(delTempPWFiles, function (fsErr) {
      done(sslErr || fsErr)
    })
  })
}