function unique_name_368 (cb) {
  validate('F', arguments)
  log.silly('install', 'readLocalPackageData')
  var self = this
  mkdirp(this.where, iferr(cb, function () {
    readPackageTree(self.where, iferr(cb, function (currentTree) {
      self.currentTree = currentTree
      self.currentTree.warnings = []
      if (currentTree.error && currentTree.error.code === 'EJSONPARSE') {
        return cb(currentTree.error)
      }
      if (!self.noPackageJsonOk && !currentTree.package) {
        log.error('install', "Couldn't read dependencies")
        var er = new Error("ENOENT, open '" + path.join(self.where, 'package.json') + "'")
        er.code = 'ENOPACKAGEJSON'
        er.errno = 34
        return cb(er)
      }
      if (!currentTree.package) currentTree.package = {}
      readShrinkwrap(currentTree, function (err) {
        if (err) {
          cb(err)
        } else {
          self.loadArgMetadata(cb)
        }
      })
    }))
  }))
}