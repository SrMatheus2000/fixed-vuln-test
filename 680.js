function removeDir (pkg, log, next) {
  var modpath = path.join(path.dirname(pkg.path), '.' + path.basename(pkg.path) + '.MODULES')

  move(path.join(pkg.path, 'node_modules'), modpath).then(unbuildPackage, unbuildPackage)

  function unbuildPackage (moveEr) {
    rimraf(pkg.path, moveEr ? andRemoveEmptyParents(pkg.path) : moveModulesBack)
  }

  function andRemoveEmptyParents (path) {
    return function (er) {
      if (er) return next(er)
      removeEmptyParents(pkg.path)
    }
  }

  function moveModulesBack () {
    fs.readdir(modpath, makeTarget)
  }

  function makeTarget (readdirEr, files) {
    if (readdirEr) return cleanup()
    if (!files.length) return cleanup()
    mkdirp(path.join(pkg.path, 'node_modules'), function (mkdirEr) { moveModules(mkdirEr, files) })
  }

  function moveModules (mkdirEr, files) {
    if (mkdirEr) return next(mkdirEr)
    asyncMap(files, function (file, done) {
      var from = path.join(modpath, file)
      var to = path.join(pkg.path, 'node_modules', file)
      // we ignore errors here, because they can legitimately happen, for instance,
      // bundled modules will be in both node_modules folders
      move(from, to).then(andIgnoreErrors(done), andIgnoreErrors(done))
    }, cleanup)
  }

  function cleanup () {
    rimraf(modpath, afterCleanup)
  }

  function afterCleanup (rimrafEr) {
    if (rimrafEr) log.warn('remove', rimrafEr)
    removeEmptyParents(path.resolve(pkg.path, '..'))
  }

  function removeEmptyParents (pkgdir) {
    fs.rmdir(pkgdir, function (er) {
      // FIXME: Make sure windows does what we want here
      if (er && er.code !== 'ENOENT') return next()
      removeEmptyParents(path.resolve(pkgdir, '..'))
    })
  }
}