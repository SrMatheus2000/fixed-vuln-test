function finishModule (bundler, child, stageTo, stageFrom) {
  // If we were the one's who bundled this module…
  if (child.fromBundle === bundler) {
    return mkdirp(path.dirname(stageTo)).then(() => {
      return move(stageFrom, stageTo)
    })
  } else {
    return stat(stageFrom).then(() => gentlyRm(stageFrom), () => {})
  }
}