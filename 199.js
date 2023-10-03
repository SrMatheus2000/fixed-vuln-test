function getBranches(config, privkey, done) {
  if (config.auth.type === 'ssh') {
    gitane().run({
      cmd: `git ls-remote -h ${gitUrl(config)[0]}`,
      baseDir: '/',
      privKey: config.auth.privkey || privkey,
      detached: true
    }, function (err, stdout, stderr, exitCode) {
      if (err || exitCode !== 0) {
        return done(err || new Error(stderr));
      }

      processBranches(stdout, done);
    });
  } else {
    execFile('git', ['ls-remote', '-h', httpUrl(config)[0]], function (err, stdout) {
      if (err) return done(err);
      processBranches(stdout, done);
    });
  }
}