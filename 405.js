function deleteConnection(config, ap, callback) {
  var args = [];
  args.push('connection');
  args.push('delete');
  args.push('id');

  args.push(ap.ssid);

  execFile('nmcli', args, env, function(err) {
    callback && callback(err);
  });
}