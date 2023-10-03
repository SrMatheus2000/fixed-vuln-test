function diskusage(path, cb) {
    execFile('df', ['-k', path], function(err, stdout) {
        if (err) {
            return cb(err);
        }

        try {
            cb(null, parse(stdout));
        } catch (e) {
            cb(e);
        }
    });
}