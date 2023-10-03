function unique_name_96 (filename) {
      this.setup(yaml.safeLoad(fs.readFileSync(filename).toString()))

      if (!config.application || !config.server) {
        error = 'Missing `application` or `server` config section.'
        return false
      }

      // Find any alien configuration options section
      var aliens = _.difference(Object.keys(config), Object.keys(this.defaults))
      if (aliens.length > 0) {
        error = 'Unrecognized section name(s) ' + aliens.join(',')
        return false
      }

      // Find any alien configuration options section name
      var keys = Object.keys(this.defaults)
      for (var i = 0; i < keys.length; i++) {
        if (typeof config[keys[i]] === 'undefined') {
          continue
        }
        aliens = _.difference(Object.keys(config[keys[i]]), Object.keys(this.defaults[keys[i]]))
        if (aliens.length > 0) {
          error =
            'Unrecognized configuration option(s) ' + aliens.join(',') + ' in section ' + keys[i]
          return false
        }
      }

      return true
    }