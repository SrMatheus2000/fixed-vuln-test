function unique_name_284 (pathIN, pathOUT, password, callback) {
  var params = [
    'pkcs12',
    '-in',
    pathIN,
    '-out',
    pathOUT,
    '-nodes'
  ]
  var delTempPWFiles = []
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