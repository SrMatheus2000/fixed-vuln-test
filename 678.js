function moveModuleOnly (from, to, log, done) {
  var fromModules = path.join(from, 'node_modules')
  var tempFromModules = from + '.node_modules'
  var toModules = path.join(to, 'node_modules')
  var tempToModules = to + '.node_modules'

  log.silly('move', 'move existing destination node_modules away', toModules)

  move(toModules, tempToModules).then(removeDestination(done), removeDestination(done))

  function removeDestination (next) {
    return function (er) {
      log.silly('move', 'remove existing destination', to)
      if (er) {
        rimraf(to, iferr(next, makeDestination(next)))
      } else {
        rimraf(to, iferr(next, makeDestination(iferr(next, moveToModulesBack(next)))))
      }
    }
  }

  function moveToModulesBack (next) {
    return function () {
      log.silly('move', 'move existing destination node_modules back', toModules)
      move(tempToModules, toModules).then(next, done)
    }
  }

  function makeDestination (next) {
    return function () {
      log.silly('move', 'make sure destination parent exists', path.resolve(to, '..'))
      mkdirp(path.resolve(to, '..'), iferr(done, moveNodeModules(next)))
    }
  }

  function moveNodeModules (next) {
    return function () {
      log.silly('move', 'move source node_modules away', fromModules)
      move(fromModules, tempFromModules).then(doMove(moveNodeModulesBack(next)), doMove(next))
    }
  }

  function doMove (next) {
    return function () {
      log.silly('move', 'move module dir to final dest', from, to)
      move(from, to).then(next, done)
    }
  }

  function moveNodeModulesBack (next) {
    return function () {
      mkdirp(from, iferr(done, function () {
        log.silly('move', 'put source node_modules back', fromModules)
        move(tempFromModules, fromModules).then(next, done)
      }))
    }
  }
}