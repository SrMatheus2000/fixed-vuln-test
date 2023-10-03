function connectToWifi(config, ap, callback) {
  scan(config)()
    .then(function(networks) {
      var selectedAp = networks.find(function(network) {
        return network.ssid === ap.ssid;
      });

      if (selectedAp === undefined) {
        throw 'SSID not found';
      }

      fs.writeFileSync(
        'nodeWifiConnect.xml',
        win32WirelessProfileBuilder(selectedAp, ap.password)
      );
    })
    .then(function() {
      return execCommand('netsh', [
        'wlan',
        'add',
        'profile',
        'filename="nodeWifiConnect.xml"'
      ]);
    })
    .then(function() {
      var cmd = 'cmd';
      var params = [
        'wlan',
        'connect',
        'ssid="' + ap.ssid + '"',
        'name="' + ap.ssid + '"'
      ];
      if (config.iface) {
        params.push('interface="' + config.iface + '"');
      }
      return execCommand(cmd, params);
    })
    .then(function() {
      return execCommand('del ".\\nodeWifiConnect.xml"');
    })
    .then(function() {
      callback && callback();
    })
    .catch(function(err) {
      execFile(
        'netsh',
        ['wlan', 'delete', 'profile "' + ap.ssid + '"'],
        { env },
        function() {
          callback && callback(err);
        }
      );
    });
}