function unique_name_155(path, opts, cb) {
  if (!cb) {
    cb = opts;
    opts = {};
  }

  if(/;|&|`|\$|\(|\)|\|\||\||!|>|<|\?|\${/g.test(JSON.stringify(path))) {
    console.log('Input Validation failed, Suspicious Characters found');
  } else {
    var cmd = module.exports.cmd(path, opts);
    opts.timeout = opts.timeout || 5000;
    exec(cmd, opts, function(e, stdout, stderr) {
      if (e) { return cb(e); }
    if (stderr) { return cb(new Error(stderr)); }

      return cb(null, module.exports.parse(path, stdout, opts));
  });
}
}