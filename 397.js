(req, res, cb) => {
		let readmeFile = false;

		// Use cache first
		if (this.routeCache[req.urlBase]) {
			const rc = this.routeCache[req.urlBase];

			if (rc.type === 'readme') {
				res.setHeader('Content-Type', 'text/markdown; charset=UTF-8');
				res.end(rc.data);

				return;
			} else {
				req.routed = this.routeCache[req.urlBase];

				return cb();
			}
		}

		// Clean cache if more than 1000 entries to avoid ddos or such
		if (Object.keys(this.routeCache).length > 1000) {
			this.routeCache = {};
		}

		// Check if url is matching a directory that contains a README.md

		// Request directly on root, existing README.md in root
		if (req.urlBase === '/' && lfs.getPathSync(path.join(options.routerOptions.basePath, '/README.md'))) {
			readmeFile = path.join(options.routerOptions.basePath, '/README.md');
		// README exists on exactly the version URL requested
		} else if (lfs.getPathSync(path.join(req.urlBase, '/README.md').substring(1))) {
			readmeFile = lfs.getPathSync(path.join(req.urlBase, '/README.md').substring(1));
		} else if (lfs.getPathSync(path.join('controllers/', req.urlBase, '/README.md'))) {
			readmeFile = lfs.getPathSync(path.join('controllers/', req.urlBase, '/README.md'));

		// Get readme directly from root, if it is missing in version folders
		// AND requested url is exactly a version-url
		} else if (semver.valid(req.url.split('/')[1] + '.0') && lfs.getPathSync('README.md') && req.urlBase === '/' + req.urlBase.split('/')[1] + '/') {
			readmeFile = lfs.getPathSync('README.md');

		// Get hard coded string if root or version-url is requested and README.md is missing
		// AND requested url is exactly a version-url
		} else if (req.urlBase === '/' || (semver.valid(req.url.split('/')[1] + '.0') && req.urlBase === '/' + req.url.split('/')[1] + '/')) {
			return res.end('API is up and running. This API contains no README.md');
		}

		// If a readme file is found, send this to the browser and end the request
		if (readmeFile) {
			res.setHeader('Content-Type', 'text/markdown; charset=UTF-8');

			return fs.readFile(readmeFile, (err, data) => {
				if (err) return cb(err);

				this.routeCache[req.urlBase] = {
					type: 'readme',
					data: data
				};
				res.end(data);
			});
		}

		this.router.resolve(req.urlBase, (err, result) => {
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
		});
	}