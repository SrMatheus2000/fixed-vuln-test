function unique_name_367 (cb) {
  validate('F', arguments)
  log.silly('install', 'readGlobalPackageData')
  var self = this
  this.loadArgMetadata(iferr(cb, function () {
    mkdirp(self.where, iferr(cb, function () {
      var pkgs = {}
      self.args.forEach(function (pkg) {
        pkgs[pkg.name] = true
      })
      readPackageTree(self.where, function (ctx, kid) { return ctx.parent || pkgs[kid] }, iferr(cb, function (currentTree) {
        self.currentTree = currentTree
        return cb()
      }))
    }))
  }))
}