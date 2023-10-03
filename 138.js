function inetChecksite(url, callback) {

  return new Promise((resolve) => {
    process.nextTick(() => {

      let urlSanitized = util.sanitizeShellString(url).toLowerCase();
      urlSanitized = urlSanitized.replace(/ /g, '');
      urlSanitized = urlSanitized.replace(/\$/g, '');
      urlSanitized = urlSanitized.replace(/\(/g, '');
      urlSanitized = urlSanitized.replace(/\)/g, '');
      urlSanitized = urlSanitized.replace(/{/g, '');
      urlSanitized = urlSanitized.replace(/}/g, '');
      let result = {
        url: urlSanitized,
        ok: false,
        status: 404,
        ms: -1
      };
      if (urlSanitized) {
        let t = Date.now();
        if (_linux || _freebsd || _openbsd || _netbsd || _darwin || _sunos) {
          let args = ' -I --connect-timeout 5 -m 5 ' + urlSanitized + ' 2>/dev/null | head -n 1 | cut -d " " -f2';
          let cmd = 'curl';
          exec(cmd + args, function (error, stdout) {
            let statusCode = parseInt(stdout.toString());
            result.status = statusCode || 404;
            result.ok = !error && (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);
            result.ms = (result.ok ? Date.now() - t : -1);
            if (callback) { callback(result); }
            resolve(result);
          });
        }
        if (_windows) {   // if this is stable, this can be used for all OS types
          const http = (urlSanitized.startsWith('https:') ? require('https') : require('http'));
          try {
            http.get(urlSanitized, (res) => {
              const statusCode = res.statusCode;

              result.status = statusCode || 404;
              result.ok = (statusCode === 200 || statusCode === 301 || statusCode === 302 || statusCode === 304);

              if (statusCode !== 200) {
                res.resume();
                result.ms = (result.ok ? Date.now() - t : -1);
                if (callback) { callback(result); }
                resolve(result);
              } else {
                res.on('data', () => { });
                res.on('end', () => {
                  result.ms = (result.ok ? Date.now() - t : -1);
                  if (callback) { callback(result); }
                  resolve(result);
                });
              }
            }).on('error', () => {
              if (callback) { callback(result); }
              resolve(result);
            });
          } catch (err) {
            if (callback) { callback(result); }
            resolve(result);
          }
        }
      } else {
        if (callback) { callback(result); }
        resolve(result);
      }
    });
  });
}