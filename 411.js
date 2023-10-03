function unique_name_205() {
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
    }