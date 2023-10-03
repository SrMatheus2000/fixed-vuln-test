function unique_name_353(req, pathname) {
    pathname = decodeURI(pathname);
    // jumping to parent directories is not allowed
    if (pathname.indexOf('../') >= 0 || pathname.indexOf('..\\') >= 0 || pathname.toLowerCase().indexOf('..%5c') >= 0) {
      return RSVP.resolve(null);
    }

    var result = {};
    var foundPath;
    var fullPathnames = publicPaths.map(function(p) {
      return pathjoin(cwd, p, pathname);
    });

    return multiStat(fullPathnames).then(function(stat) {
      foundPath = stat.path;
      result.modified = stat.mtime.getTime();
      result.size = stat.size;
      return _fetchEtag(stat.path, stat);
    }).then(function(etag) {
      result.etag = etag;
      result.stream = fs.createReadStream(foundPath);
      return result;
    }).catch(function(err) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR' || err.code === 'EISDIR') {
        return null;
      }
      return RSVP.reject(err);
    });
  }