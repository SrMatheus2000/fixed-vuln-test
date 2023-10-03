function load_ (builtin, rc, cli, cb) {
  var defaults = configDefs.defaults
  var conf = new Conf(rc)

  conf.usingBuiltin = !!builtin
  conf.add(cli, 'cli')
  conf.addEnv()

  conf.loadPrefix(function (er) {
    if (er) return cb(er)

    // If you're doing `npm --userconfig=~/foo.npmrc` then you'd expect
    // that ~/.npmrc won't override the stuff in ~/foo.npmrc (or, indeed
    // be used at all).
    //
    // However, if the cwd is ~, then ~/.npmrc is the home for the project
    // config, and will override the userconfig.
    //
    // If you're not setting the userconfig explicitly, then it will be loaded
    // twice, which is harmless but excessive.  If you *are* setting the
    // userconfig explicitly then it will override your explicit intent, and
    // that IS harmful and unexpected.
    //
    // Solution: Do not load project config file that is the same as either
    // the default or resolved userconfig value.  npm will log a "verbose"
    // message about this when it happens, but it is a rare enough edge case
    // that we don't have to be super concerned about it.
    var projectConf = path.resolve(conf.localPrefix, '.npmrc')
    var defaultUserConfig = rc.get('userconfig')
    var resolvedUserConfig = conf.get('userconfig')
    if (!conf.get('global') &&
        projectConf !== defaultUserConfig &&
        projectConf !== resolvedUserConfig) {
      conf.addFile(projectConf, 'project')
      conf.once('load', afterPrefix)
    } else {
      conf.add({}, 'project')
      afterPrefix()
    }
  })

  function afterPrefix () {
    conf.addFile(conf.get('userconfig'), 'user')
    conf.once('error', cb)
    conf.once('load', afterUser)
  }

  function afterUser () {
    // globalconfig and globalignorefile defaults
    // need to respond to the 'prefix' setting up to this point.
    // Eg, `npm config get globalconfig --prefix ~/local` should
    // return `~/local/etc/npmrc`
    // annoying humans and their expectations!
    if (conf.get('prefix')) {
      var etc = path.resolve(conf.get('prefix'), 'etc')
      mkdirp(etc, function () {
        defaults.globalconfig = path.resolve(etc, 'npmrc')
        defaults.globalignorefile = path.resolve(etc, 'npmignore')
        afterUserContinuation()
      })
    } else {
      afterUserContinuation()
    }
  }

  function afterUserContinuation () {
    conf.addFile(conf.get('globalconfig'), 'global')

    // move the builtin into the conf stack now.
    conf.root = defaults
    conf.add(rc.shift(), 'builtin')
    conf.once('load', function () {
      conf.loadExtras(afterExtras)
    })
  }

  function afterExtras (er) {
    if (er) return cb(er)

    // warn about invalid bits.
    validate(conf)

    var cafile = conf.get('cafile')

    if (cafile) {
      return conf.loadCAFile(cafile, finalize)
    }

    finalize()
  }

  function finalize (er) {
    if (er) {
      return cb(er)
    }

    exports.loaded = conf
    cb(er, conf)
  }
}