function unique_name_158(args, on_success, on_failure) {
  // Build query
  var codecov_endpoint =
    args.options.url ||
    process.env.codecov_url ||
    process.env.CODECOV_URL ||
    'https://codecov.io'
  var query = {}
  var debug = []
  var yamlFile =
    args.options.yml ||
    process.env.codecov_yml ||
    process.env.CODECOV_YML ||
    'codecov.yml'

  console.log(
    '' +
      '  _____          _  \n' +
      ' / ____|        | |  \n' +
      '| |     ___   __| | ___  ___ _____   __  \n' +
      '| |    / _ \\ / _` |/ _ \\/ __/ _ \\ \\ / /  \n' +
      '| |___| (_) | (_| |  __/ (_| (_) \\ V /  \n' +
      ' \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/  \n' +
      '                                ' +
      version
  )

  if ((args.options.disable || '').split(',').indexOf('detect') === -1) {
    console.log('==> Detecting CI Provider')
    query = detectProvider()
  } else {
    debug.push('disabled detect')
  }

  query.yaml = [yamlFile, '.codecov.yml'].reduce(function(result, file) {
    return (
      result ||
      (fs.existsSync(path.resolve(process.cwd(), file))
        ? path.resolve(process.cwd(), file)
        : undefined)
    )
  }, undefined)

  if (args.options.build) {
    query.build = args.options.build
  }

  if (args.options.commit) {
    query.commit = args.options.commit
  }

  if (args.options.branch) {
    query.branch = args.options.branch
  }

  if (args.options.slug) {
    query.slug = args.options.slug
  }

  var flags =
    args.options.flags || process.env.codecov_flags || process.env.CODECOV_FLAGS
  if (flags) {
    query.flags = flags
  }

  var yamlToken
  try {
    var loadedYamlFile = jsYaml.safeLoad(fs.readFileSync(query.yaml, 'utf8'))
    yamlToken =
      loadedYamlFile && loadedYamlFile.codecov && loadedYamlFile.codecov.token
  } catch (e) {
    // silently fail
  }
  var token =
    args.options.token ||
    yamlToken ||
    process.env.codecov_token ||
    process.env.CODECOV_TOKEN
  if (token) {
    query.token = token
  }

  query.package = 'node-' + version

  console.log('==> Configuration: ')
  console.log('    Endpoint: ' + codecov_endpoint)
  // Don't output `query` directly as it contains the upload token
  console.log({
    commit: query.commit,
    branch: query.branch,
    package: query.package,
  })

  var upload = ''

  // Add specified env vars
  var env_found = false
  if (args.options.env || process.env.CODECOV_ENV || process.env.codecov_env) {
    var env = (
      args.options.env +
      ',' +
      (process.env.CODECOV_ENV || '') +
      ',' +
      (process.env.codecov_env || '')
    ).split(',')
    for (var i = env.length - 1; i >= 0; i--) {
      if (env[i]) {
        upload += env[i] + '=' + (process.env[env[i]] || '').toString() + '\n'
        env_found = true
      }
    }
    if (env_found) {
      upload += '<<<<<< ENV\n'
    }
  }

  // List git files
  var root = path.resolve(args.options.root || query.root || '.')
  console.log('==> Building file structure')
  try {
    upload +=
      execSync('git ls-files || hg locate', { cwd: root })
        .toString()
        .trim() + '\n<<<<<< network\n'
  } catch (err) {
    // not a git/hg dir, emulating git/hg ignore behavior
    upload +=
      walk
        .sync({ path: root, ignoreFiles: ['.gitignore', '.hgignore'] })
        .join('\n')
        .trim() + '\n<<<<<< network\n'
  }
  // Make gcov reports
  if ((args.options.disable || '').split(',').indexOf('gcov') === -1) {
    try {
      console.log('==> Generating gcov reports (skip via --disable=gcov)')
      var gcg = args.options['gcov-glob'] || ''
      if (gcg) {
        if (!isWindows) {
          gcg = gcg
            .split(' ')
            .map(function(p) {
              return "-not -path '" + p + "'"
            })
            .join(' ')
        } else {
          gcg = gcg
            .split(' ')
            .map(function(p) {
              return '^| findstr /i /v ' + p
            })
            .join(' ')
        }
      }
      var gcov
      if (!isWindows) {
        gcov =
          'find ' +
          (args.options['gcov-root'] || root) +
          " -type f -name '*.gcno' " +
          gcg +
          ' -exec ' +
          (validator.escape(args.options['gcov-exec']) || 'gcov') +
          ' ' +
          (validator.escape(args.options['gcov-args']) || '') +
          ' {} +'
      } else {
        // @TODO support for root
        // not straight forward due to nature of windows command dir
        gcov =
          'for /f "delims=" %g in (\'dir /a-d /b /s *.gcno ' +
          gcg +
          "') do " +
          (args.options['gcov-exec'] || 'gcov') +
          ' ' +
          (args.options['gcov-args'] || '') +
          ' %g'
      }
      debug.push(gcov)
      console.log('    $ ' + gcov)
      execSync(gcov)
    } catch (e) {
      console.log('    Failed to run gcov command.')
    }
  } else {
    debug.push('disabled gcov')
  }

  // Detect .bowerrc
  var bowerrc
  if (!isWindows) {
    bowerrc = execSync('test -f .bowerrc && cat .bowerrc || echo ""', {
      cwd: root,
    })
      .toString()
      .trim()
  } else {
    bowerrc = execSync('if exist .bowerrc type .bowerrc', { cwd: root })
      .toString()
      .trim()
  }
  if (bowerrc) {
    bowerrc = JSON.parse(bowerrc).directory
    if (bowerrc) {
      if (!isWindows) {
        more_patterns =
          " -not -path '*/" + bowerrc.toString().replace(/\/$/, '') + "/*'"
      } else {
        more_patterns =
          '| findstr /i /v \\' + bowerrc.toString().replace(/\/$/, '') + '\\'
      }
    }
  }

  var files = [],
    file = null
  if (args.options.pipe) {
    // Append piped reports
    upload += '# path=piped\n' + args.options.pipe.join('') + '\n<<<<<< EOF\n'
    console.log('==> Reading report from stdin')
  } else if (args.options.file) {
    // Append manually entered reports
    file = args.options.file
    console.log('==> Targeting specific file')
    try {
      upload +=
        '# path=' +
        file +
        '\n' +
        fs.readFileSync(file, 'utf8').toString() +
        '\n<<<<<< EOF\n'
      console.log('    + ' + file)
      files.push(file)
    } catch (e) {
      debug.push('failed: ' + file.split('/').pop())
      console.log('    X Failed to read file at ' + file)
    }
  } else if ((args.options.disable || '').split(',').indexOf('search') === -1) {
    console.log('==> Scanning for reports')
    var _files
    if (!isWindows) {
      _files = execSync('find ' + root + ' ' + patterns + more_patterns)
        .toString()
        .trim()
        .split('\n')
    } else {
      // @TODO support for a root directory
      // It's not straightforward due to the nature of the dir command
      _files = execSync('dir ' + patterns + more_patterns)
        .toString()
        .trim()
        .split('\r\n')
    }
    if (_files) {
      for (var i2 = _files.length - 1; i2 >= 0; i2--) {
        file = _files[i2]
        try {
          upload +=
            '# path=' +
            file +
            '\n' +
            fs.readFileSync(file, 'utf8').toString() +
            '\n<<<<<< EOF\n'
          console.log('    + ' + file)
          files.push(file)
        } catch (e) {
          debug.push('failed: ' + file.split('/').pop())
          console.log('    X Failed to read file at ' + file)
        }
      }
    }
  } else {
    debug.push('disabled search')
  }

  if (files) {
    // Upload to Codecov
    if (args.options.dump) {
      console.log('-------- DEBUG START --------')
      console.log(upload)
      console.log('-------- DEBUG END --------')
    } else {
      console.log('==> Uploading reports')
      var _upload
      if ((args.options.disable || '').split(',').indexOf('s3') === -1) {
        _upload = sendToCodecovV3
      } else {
        _upload = sendToCodecovV2
      }
      _upload(
        codecov_endpoint,
        query,
        upload,
        function() {
          // remove files after Uploading
          if (args.options.clear) {
            for (var i = files.length - 1; i >= 0; i--) {
              try {
                fs.unlinkSync(files[i])
              } catch (e) {}
            }
          }
          if (on_success) {
            on_success.apply(this, arguments)
          }
        },
        on_failure || function() {}
      )
    }
  }

  return {
    body: upload,
    files: files,
    query: query,
    debug: debug,
    url: codecov_endpoint,
  }
}