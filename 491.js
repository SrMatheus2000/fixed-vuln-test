function unique_name_262 () {
      if (win32) return next() // skip links on win for now before it can be tested
      xfs.unlink(name, function () {
        var srcpath = path.join(cwd, path.join('/', header.linkname))

        xfs.link(srcpath, name, function (err) {
          if (err && err.code === 'EPERM' && opts.hardlinkAsFilesFallback) {
            stream = xfs.createReadStream(srcpath)
            return onfile()
          }

          stat(err)
        })
      })
    }