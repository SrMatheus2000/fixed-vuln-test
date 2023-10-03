function disconnect(config, callback) {
  var args = [];
  args.push('device');
  args.push('disconnect');

  if (config.iface) {
    args.push(config.iface);
  }

  execFile('nmcli', args, { env }, function(err) {
    callback && callback(err);
  });
}