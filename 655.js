function unique_name_360(error, stdout, stderr) {
        if (error || stderr || stdout === '' || stdout.indexOf( '/' ) === -1) {
          cp.execFile('where', [name], function (error, stdout, stderr) { //windows
            if (error || stderr || stdout === '' || stdout.indexOf('\\') === -1) {
              cp.exec('for %i in (' + name + '.exe) do @echo. %~$PATH:i', function (error, stdout, stderr) { //windows xp
                if (error || stderr || stdout === '' || stdout.indexOf('\\') === -1) {
                  return cb(new Error('Could not find ' + name + ' on your system'));
                }
                return cb(null, stdout);
              });
            } else {
              return cb(null, stdout);
            }
          });
        }
        else {
          return cb(null, stdout.split(' ')[1]);
        }
      }