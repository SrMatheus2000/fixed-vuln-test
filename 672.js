function restoreOldNodeModules () {
    if (!movedDestAway) return
    return readdir(path.join(delpath, 'node_modules')).catch(() => []).then((modules) => {
      if (!modules.length) return
      return mkdirp(path.join(pkg.realpath, 'node_modules')).then(() => Bluebird.map(modules, (file) => {
        const from = path.join(delpath, 'node_modules', file)
        const to = path.join(pkg.realpath, 'node_modules', file)
        return move(from, to, moveOpts)
      }))
    })
  }