(env, key) => {
      if (key === 'AEGIR_GHTOKEN') {
        return env
      } else {
        env[key] = process.env[key]
        return env
      }
    }