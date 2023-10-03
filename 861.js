function runNpmCommand(command, pkgName, version, callback) {
		require('child_process').execFile('npm', [command, pkgName + (command === 'install' ? '@' + version : '')], function (err, stdout) {
			if (err) {
				return callback(err);
			}

			winston.verbose('[plugins/' + command + '] ' + stdout);
			callback();
		 });
	}