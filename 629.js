function unique_name_345(entry) {
    if (entry.type == 'Directory') return;

    // to avoid zip slip (writing outside of the destination), we resolve
    // the target path, and make sure it's nested in the intended
    // destination, or not extract it otherwise.
    var extractPath = path.join(opts.path, entry.path);
    if (extractPath.indexOf(opts.path) != 0) {
      return;
    }

    entry.pipe(Writer({
      path: extractPath
    }))
    .on('error',function(e) {
      self.emit('error',e);
    });
  }