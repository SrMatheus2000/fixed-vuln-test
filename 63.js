function inetLatency(host, callback) {

  // fallback - if only callback is given
  if (util.isFunction(host) && !callback) {
    callback = host;
    host = '';
  }

  host = host || '8.8.8.8';
  let hostSanitized = '';
  const s = (util.isPrototypePolluted() ? '8.8.8.8' : util.sanitizeShellString(host, true)).trim();
  for (let i = 0; i <= 2000; i++) {
    if (!(s[i] === undefined)) {

      s[i].__proto__.toLowerCase = util.stringToLower;
      const sl = s[i].toLowerCase();
      if (sl && sl[0] && !sl[1]) {
        hostSanitized = hostSanitized + sl[0];
      }
    }
  }

  return new Promise((resolve) => {
    process.nextTick(() => {
      let cmd;
      if (_linux || _freebsd || _openbsd || _netbsd || _darwin) {
        if (_linux) {
          cmd = 'ping -c 2 -w 3 ' + hostSanitized + ' | grep rtt';
        }
        if (_freebsd || _openbsd || _netbsd) {
          cmd = 'ping -c 2 -t 3 ' + hostSanitized + ' | grep round-trip';
        }
        if (_darwin) {
          cmd = 'ping -c 2 -t 3 ' + hostSanitized + ' | grep avg';
        }

        exec(cmd, function (error, stdout) {
          let result = -1;
          if (!error) {
            const line = stdout.toString().split('=');
            if (line.length > 1) {
              const parts = line[1].split('/');
              if (parts.length > 1) {
                result = parseFloat(parts[1]);
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_sunos) {
        exec('ping -s -a ' + hostSanitized + ' 56 2 | grep avg', { timeout: 3000 }, function (error, stdout) {
          let result = -1;
          if (!error) {
            const line = stdout.toString().split('=');
            if (line.length > 1) {
              const parts = line[1].split('/');
              if (parts.length > 1) {
                result = parseFloat(parts[1].replace(',', '.'));
              }
            }
          }
          if (callback) { callback(result); }
          resolve(result);
        });
      }
      if (_windows) {
        let result = -1;
        try {
          exec('ping ' + hostSanitized + ' -n 1', util.execOptsWin, function (error, stdout) {
            if (!error) {
              let lines = stdout.toString().split('\r\n');
              lines.shift();
              lines.forEach(function (line) {
                if ((line.toLowerCase().match(/ms/g) || []).length === 3) {
                  let l = line.replace(/ +/g, ' ').split(' ');
                  if (l.length > 6) {
                    result = parseFloat(l[l.length - 1]);
                  }
                }
              });
            }
            if (callback) { callback(result); }
            resolve(result);
          });
        } catch (e) {
          if (callback) { callback(result); }
          resolve(result);
        }
      }
    });
  });
}