function makeParentPath (dir) {
    return mkdirp(path.dirname(dir))
  }