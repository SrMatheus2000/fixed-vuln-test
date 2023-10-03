function andLogAndFinish (spec, tracker, done) {
  validate('SOF|SZF|OOF|OZF', [spec, tracker, done])
  return (er, pkg) => {
    if (er) {
      er.message = replaceInfo(er.message)
      var spc = replaceInfo(String(spec))
      log.silly('fetchPackageMetaData', 'error for ' + spc, er.message)
      if (tracker) tracker.finish()
    }
    return done(er, pkg)
  }
}