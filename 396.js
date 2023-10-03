(err, result) => {
			if (err) return cb(err);

			// If nothing is found, check in the alternative controller paths
			if (Object.keys(result).length === 0) {
				for (let i = 0; altControllerPaths[i] !== undefined; i++) {
					let stat;

					if (!fs.existsSync(altControllerPaths[i])) continue;

					stat = fs.statSync(altControllerPaths[i]);

					if (stat.isDirectory()) {
						const urlBase = path.join(altControllerPaths[i], req.urlBase);

						// Security check for relative paths above the alternative controller path
						if (!urlBase.startsWith(altControllerPaths[i])) {
							log.info(logPrefix + 'SECURITY! Intruder detection, path above the controller path is trying to be obtained, via: "' + req.urlBase + '"');
							break;
						}

						// Check if file exists without version no in the controllers path
						if (fs.existsSync(path.join(altControllerPaths[i], req.urlBase) + '.js')) {
							req.routed = {
								controllerFullPath: path.join(altControllerPaths[i], req.urlBase) + '.js',
								controllerPath: req.urlBase
							};
							this.routeCache[req.urlBase] = req.routed; // Add to cache
							break;
						}
					}
				}
			}

			if (!req.routed) {
				this.routeCache[req.urlBase] = result;
				req.routed = result;
			}

			cb();
		}