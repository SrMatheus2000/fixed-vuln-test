function deleteConnection(config, ap, callback) {
  var iface = 'en0';
  var args = ['-removepreferredwirelessnetwork'];

  if (config.iface) {
    iface = config.iface.toString();
  }

  args.push(iface);
  args.push(ap.ssid);

  execFile('networksetup', args, env, function(err, resp) {
    if (
      resp &&
      resp.indexOf('was not found in the preferred networks list') >= 0
    ) {
      callback && callback(resp);
    } else {
      callback && callback(err);
    }
  });
}