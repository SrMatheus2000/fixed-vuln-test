function launch (opts, cb) {
  opts = Object.assign({ poll: true, pollInterval: 3000 }, opts);
  execFile('start', ['microsoft-edge:' + opts.uri], (err, stdout, stderr) => {
    if (err) return cb(err);
    const ee = new EventEmitter();

    // fake returning a child_process object
    ee.kill = kill.bind(null, ee);

    // Polls for the external termination of Edge. Can't poll too often.
    if (opts.poll) {
      ee._poll = setInterval(() => {
        getEdgeTasks((err, edgeProcesses) => {
          ee.emit('poll');
          if (err) return ee.emit('error', err);
          if (edgeProcesses.length === 0) {
            clearInterval(ee._poll);
            ee.emit('exit', 0);
          }
        });
      }, opts.pollInterval);
    }

    return cb(null, ee);
  });
}