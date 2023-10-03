function getCurrentConnections(config, callback) {
  var args = ['--getinfo'];

  execFile(macProvider, args, env, function(err, stdout) {
    if (err) {
      callback && callback(err);
    } else {
      callback && callback(null, parseAirport(stdout));
    }
  });
}