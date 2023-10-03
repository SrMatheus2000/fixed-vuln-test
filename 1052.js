function unique_name_620 (entry) {
    // if there's a "strip" argument, then strip off that many
    // path components.
    if (opts.strip) {
      var p = entry.path.split("/").slice(opts.strip).join("/")
      entry.path = entry.props.path = p
      if (entry.linkpath) {
        var lp = entry.linkpath.split("/").slice(opts.strip).join("/")
        entry.linkpath = entry.props.linkpath = lp
      }
    }

    if (entry.type === "Link") {
      entry.linkpath = entry.props.linkpath = path.join(
        opts.path, path.join("/", entry.props.linkpath)
      )
    }

    if (entry.props && entry.props.linkpath) {
      var linkpath = entry.props.linkpath
      // normalize paths that point outside the extraction root
      if (path.resolve(opts.path, linkpath).indexOf(opts.path) !== 0) {
        entry.props.linkpath = path.join(opts.path, path.join("/", linkpath))
      }
    }
  }