function unique_name_294 (options) {
    var self = this;

    options = options || {};
    options.path = options.path || process.cwd();
    options.filter = options.filter || null;
    options.follow = !!options.follow;
    options.strip = +options.strip || 0;
    options.restrict = options.restrict !== false;


    this.getFiles()
    .then(function (files) {
        var copies = [];
        if (options.restrict) {
          files = files.map(function (file) {
            var destination = path.join(options.path, file.path);
            // The destination path must not be outside options.path
            if (destination.indexOf(options.path) !== 0) {
              throw new Error('You cannot extract a file outside of the target path');
            }
            return file;
          });
        }
        if (options.filter) {
            files = files.filter(options.filter);
        }

        if (options.follow) {
            copies = files.filter(function (file) {
                return file.type === 'SymbolicLink';
            });
            files = files.filter(function (file) {
                return file.type !== 'SymbolicLink';
            });
        }

        if (options.strip) {
            files = files.map(function (file) {
                if (file.type !== 'Directory') {
                    // we don't use `path.sep` as we're using `/` in Windows too
                    var dir = file.parent.split('/');
                    var filename = file.filename;

                    if (options.strip > dir.length) {
                        throw new Error('You cannot strip more levels than there are directories');
                    } else {
                        dir = dir.slice(options.strip);
                    }

                    file.path = path.join(dir.join(path.sep), filename);
                    return file;
                }
            });
        }

        return self.extractFiles(files, options)
        .then(self.extractFiles.bind(self, copies, options));
    })
    .then(function (results) {
        self.emit('extract', results);
    })
    .fail(function (error) {
        self.emit('error', error);
    })
    .fin(self.closeFile.bind(self));

    return this;
}