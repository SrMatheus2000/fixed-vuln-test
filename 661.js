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