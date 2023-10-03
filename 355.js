function initWebServer(settings) {

    let server = {
        app:       null,
        server:    null,
        io:        null,
        settings:  settings
    };
    adapter.subscribeForeignObjects('system.config');

    settings.ttl = parseInt(settings.ttl, 10) || 3600;
    if (!settings.whiteListEnabled && settings.whiteListSettings) delete settings.whiteListSettings;

    settings.defaultUser = settings.defaultUser || 'system.user.admin';
    if (!settings.defaultUser.startsWith('system.user.')) {
        settings.defaultUser = 'system.user.' + settings.defaultUser;
    }

    if (settings.port) {
        if (settings.secure && !settings.certificates) {
            return null;
        }
        server.app = express();

        server.app.disable('x-powered-by');
        // enable use of i-frames together with HTTPS
        // todo find the admin port and bind and use it here "ALLOW-FROM ipbind:port"
        // try to add "Content-Security-Policy: frame-ancestors 'self' example.com *.example.net ;"
        /*
        server.app.get('/*', (req, res, next) => {
            res.header('X-Frame-Options' , 'SAMEORIGIN');
            next(); // http://expressjs.com/guide.html#passing-route control
        });
        */

        if (settings.auth) {
            initAuth(server, settings);

            let autoLogonOrRedirectToLogin = (req, res, next, redirect) => {
                if (!settings.whiteListSettings) {
                    if (/\.css(\?.*)?$/.test(req.originalUrl)) {
                        return res.status(200).send('');
                    } else
					if (/\.js(\?.*)?$/.test(req.originalUrl)) {
						// return always valid js file for js, because if cache is active it leads to errors
                        const parts = req.originalUrl.split('/');
                        parts.shift();
                        const ref = parts.join('/');
						// if request for web/lib, ignore it, because no redirect information
						if (parts[0] === 'lib') {
						    return res.status(200).send('');
                        } else {
                            return res.status(200).send('document.location="/login/index.html?href=" + encodeURI(location.href.replace(location.origin, ""));');
                        }
					} else {
						return res.redirect(redirect);
					}
				}
                let remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                let whiteListIp = server.io.getWhiteListIpForAddress(remoteIp, settings.whiteListSettings);
				adapter.log.silly('whiteListIp ' + whiteListIp);
                if (!whiteListIp || settings.whiteListSettings[whiteListIp].user === 'auth') {
                    if (/\.css(\?.*)?$/.test(req.originalUrl)) {
                        return res.status(200).send('');
                    } else if (/\.js(\?.*)?$/.test(req.originalUrl)) {
						// return always valid js file for js, because if cache is active it leads to errors
						let parts = req.originalUrl.split('/');
                        parts.shift();
                        const ref = parts.join('/');
						if (parts[0] === 'lib') {
						    return res.status(200).send('');
                        } else {
                            return res.status(200).send('document.location="/login/index.html?href=" + encodeURI(location.href.replace(location.origin, ""));');
                        }
					} else {
						return res.redirect(redirect);
					}
				}
                req.logIn(settings.whiteListSettings[whiteListIp].user, err => next(err));
            };

            server.app.post('/login', (req, res, next) => {
                let redirect = '../';
                let parts;
                req.body = req.body || {};
                const origin = req.body.origin || '?href=%2F';
                if (origin) {
                    parts = origin.split('=');
                    if (parts.length > 1 && parts[1]) {
                        redirect = decodeURIComponent(parts[1]);
                        // if some invalid characters in redirect
                        if (redirect.match(/[^-_a-zA-Z0-9&%?./]/)) {
                            redirect = '../';
                        }
                    }
                }

                req.body.password = (req.body.password || '').toString();
                req.body.username = (req.body.username || '').toString();
                req.body.stayLoggedIn = req.body.stayloggedin === 'true' || req.body.stayloggedin === true || req.body.stayloggedin === 'on';

                if (req.body.username && settings.addUserName && redirect.indexOf('?') === -1) {
                    parts = redirect.split('#');
                    parts[0] += '?' + req.body.username;
                    redirect = parts.join('#');
                }

                passport.authenticate('local', (err, user, info) => {
                    if (err) {
                        adapter.log.warn('Cannot login user: ' + err);
                        return res.redirect('/login/index.html' + origin + (origin ? '&error' : '?error'));
                    }
                    if (!user) {
                        return res.redirect('/login/index.html' + origin + (origin ? '&error' : '?error'));
                    }
                    req.logIn(user, err => {
                        if (err) {
                            adapter.log.warn('Cannot login user: ' + err);
                            return res.redirect('/login/index.html' + origin + (origin ? '&error' : '?error'));
                        }
                        if (req.body.stayLoggedIn) {
                            req.session.cookie.maxAge = settings.ttl > ONE_MONTH_SEC ? settings.ttl * 1000 : ONE_MONTH_SEC * 1000;
                        } else {
                            req.session.cookie.maxAge = settings.ttl * 1000;
                        }
                        return res.redirect(redirect);
                    });
                })(req, res, next);
            });

            server.app.get('/logout', (req, res) => {
                req.logout();
                res.redirect('/login/index.html');
            });

            // route middleware to make sure a user is logged in
            server.app.use((req, res, next) => {
                // return favicon always
                if (req.originalUrl.startsWith('/login/favicon.ico')) {
                    res.set('Content-Type', 'image/x-icon');
                    return res.send(fs.readFileSync(__dirname + '/www/login/favicon.ico'));
                }
				// if cache.manifest got back not 200 it makes an error
                if (req.isAuthenticated() ||
                    /web\.\d+\/login-bg\.png(\?.*)?$/.test(req.originalUrl) ||
                    /cache\.manifest(\?.*)?$/.test(req.originalUrl) ||
                    /^\/login\//.test(req.originalUrl) ||
                    /\.ico(\?.*)?$/.test(req.originalUrl)
                ) {
                    return next();
                } else {
                    autoLogonOrRedirectToLogin(req, res, next, '/login/index.html?href=' + encodeURIComponent(req.originalUrl));
                }
            });
        } else {
            server.app.get('/login', (req, res) => res.redirect('/'));
            server.app.get('/logout', (req, res) => res.redirect('/'));

            if (settings.whiteListEnabled) {
                initAuth(server, settings);
                server.app.use((req, res, next) => {
                    let remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                    let whiteListIp = server.io.getWhiteListIpForAddress(remoteIp, settings.whiteListSettings);
                    adapter.log.silly('whiteListIp ' + whiteListIp);
                    if (whiteListIp) {
                       req.logIn(settings.whiteListSettings[whiteListIp].user, err =>
                           next(err));
                    } else {
                        req.logIn(settings.defaultUser.substr(12), err => // cut "system.user."
                            next(err));
                    }
                });
            }
        }

        // Init read from states
        server.app.get('/state/*', (req, res) => {
            try {
                const fileName = req.url.split('/', 3)[2].split('?', 2);
                adapter.getForeignObject(fileName[0], (err, obj) => {
                    let contentType = 'text/plain';
                    if (obj && obj.common.type === 'file')  {
                        contentType = mime.lookup(fileName[0]);
                    }
                    adapter.getBinaryState(fileName[0], {user: req.user ? 'system.user.' + req.user : settings.defaultUser}, (err, obj) => {
                        if (!err && obj !== null && obj !== undefined) {
                            if (obj && typeof obj === 'object' && obj.val !== undefined && obj.ack !== undefined) {
                                res.set('Content-Type', 'application/json');
                            } else {
                                res.set('Content-Type', contentType || 'text/plain');
                            }
                            res.status(200).send(obj);
                        } else {
                            res.status(404).send('404 Not found. File ' + escapeHtml(fileName[0]) + ' not found');
                        }
                    });
                });
            } catch (e) {
                res.status(500).send('500. Error' + e);
            }
        });

        server.app.get('*/_socket/info.js', (req, res) => {
            res.set('Content-Type', 'application/javascript');
            res.status(200).send(getInfoJs(settings));
        });

        // Enable CORS
        if (settings.socketio) {
            server.app.use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');

                // intercept OPTIONS method
                if ('OPTIONS' === req.method) {
                    res.status(200).send(200);
                } else {
                    next();
                }
            });
        }

        let appOptions = {};
        if (settings.cache) appOptions.maxAge = 30758400000;

        server.server = LE.createServer(server.app, settings, settings.certificates, settings.leConfig, adapter.log);
        server.server.__server = server;
    } else {
        adapter.log.error('port missing');
        adapter.terminate ? adapter.terminate(1): process.exit(1);
    }

    if (server.server) {
        settings.port = parseInt(settings.port, 10);
        adapter.getPort(settings.port, port => {
            port = parseInt(port, 10);
            if (port !== settings.port && !settings.findNextPort) {
                adapter.log.error('port ' + settings.port + ' already in use');
                adapter.terminate ? adapter.terminate(1): process.exit(1);
            }
            server.server.listen(port, (!settings.bind || settings.bind === '0.0.0.0') ? undefined : settings.bind || undefined);
            adapter.log.info('http' + (settings.secure ? 's' : '') + ' server listening on port ' + port);
        });
    }

    // Activate integrated socket
    if (ownSocket) {
        let IOSocket = require(utils.appName + '.socketio/lib/socket.js');
        let socketSettings = JSON.parse(JSON.stringify(settings));
        // Authentication checked by server itself
        socketSettings.auth             = settings.auth;
        socketSettings.secret           = secret;
        socketSettings.store            = store;
        socketSettings.ttl              = settings.ttl || 3600;
        socketSettings.forceWebSockets  = settings.forceWebSockets || false;
        server.io = new IOSocket(server.server, socketSettings, adapter);
    }

    // activate extensions
    for (let e in extensions) {
        if (!extensions.hasOwnProperty(e)) continue;
        try {
            // for debug purposes try to load file in current directory "/lib/file.js" (elsewise node.js cannot debug it)
            let parts = extensions[e].path.split('/');
            parts.shift();
            let extAPI;
            if (fs.existsSync(__dirname + '/' + parts.join('/'))) {
                extAPI = require(__dirname + '/' + parts.join('/'));
            } else {
                extAPI = require(utils.appName + '.' + extensions[e].path);
            }

            extensions[e].obj = new extAPI(server.server, {secure: settings.secure, port: settings.port}, adapter, extensions[e].config, server.app);
            adapter.log.info('Connect extension "' + extensions[e].path + '"');
        } catch (err) {
            adapter.log.error('Cannot start extension "' + e + '": ' + err);
        }
    }

    // Activate integrated simple API
    if (settings.simpleapi) {
        try {
            let SimpleAPI = require(utils.appName + '.simple-api/lib/simpleapi.js');

            server.api = new SimpleAPI(server.server, {secure: settings.secure, port: settings.port}, adapter);
        } catch (e) {
            adapter.log.error('Cannot find simple api module! ' + e);
        }
    }

    if (server.app) {
        // deliver web files from objectDB
        server.app.use('/', (req, res) => {

            let url = decodeURI(req.url);
            // remove all ../
            // important: Linux does not normalize "\" but fs.readFile accepts it as '/'
            url = path.normalize(url.replace(/\\/g, '/')).replace(/\\/g, '/');
            // remove '////' at start and let only one
            if (url[0] === '/' && url[1] === '/') {
                let i = 2;
                while (url[i] === '/') i++;
                url = url.substring(i - 1);
            }
            if ((url[0] === '.' && url[1] === '.') || (url[0] === '/' && url[1] === '.' && url[2] === '.')) {
                return res.status(404).send('Not found');
            }

            if (server.api && server.api.checkRequest(url)) {
                return server.api.restApi(req, res);
            }

            if (url === '/' || url === '/index.html') {
                return getListOfAllAdapters((err, data) => {
                    if (err) {
                        res.status(500).send('500. Error' + escapeHtml(typeof err !== 'string' ? JSON.stringify(err) : err));
                    } else {
                        res
                            .set('Content-Type', 'text/html')
                            .status(200)
                            .send(data);
                    }
                });
            }

            // add index.html
            url = url.replace(/\/($|\?|#)/, '/index.html$1');

            if (url.match(/^\/adapter\//)) {
                // add .admin to adapter name
                url = url.replace(/^\/adapter\/([a-zA-Z0-9-_]+)\//, '/$1.admin/');
            }

            if (url.match(/^\/lib\//)) {
                url = '/' + adapter.name + url;
            }
            if (url.match(/^\/admin\//)) {
                url = '/' + adapter.name + url;
            }
            url = url.split('/');
            // Skip first /
            url.shift();
            // Get ID
            let id = url.shift();
            let versionPrefix = url[0];
            url = url.join('/');
            let pos = url.indexOf('?');
            let noFileCache;
            if (pos !== -1) {
                url = url.substring(0, pos);
                // disable file cache if request like /vis/files/picture.png?noCache
                noFileCache = true;
            }

            // exception. Remove it in couple of months. BF 2019_11_07
            if (!webByVersion[id] && id === 'material') {
                webByVersion.material = '0.12.1';
            }

            // get adapter name
            if (webByVersion[id]) {
                if (!versionPrefix || !versionPrefix.match(/^\d+\.\d+.\d+$/)) {
                    // redirect to version
                    res.set('location', '/' + id + '/' + webByVersion[id] + '/' + url);
                    return res.status(301).send();
                }
            }

            if (settings.cache && cache[id + '/' + url] && !noFileCache) {
                res.contentType(cache[id + '/' + url].mimeType);
                res.status(200).send(cache[id + '/' + url].buffer);
            } else {
                if (id === 'login' && url === 'index.html') {
                    loginPage = loginPage || prepareLoginTemplate();
                    let buffer = loginPage;

                    if (buffer === null || buffer === undefined) {
                        res.contentType('text/html');
                        res.status(200).send('File ' + escapeHtml(url) + ' not found', 404);
                    } else {
                        // Store file in cache
                        if (settings.cache) {
                            cache[id + '/' + url] = {buffer: buffer.toString(), mimeType: 'text/html'};
                        }
                        res.contentType('text/html');
                        res.status(200).send(buffer.toString());
                    }
                } else {
                    // special solution for socket.io
                    if (socketIoFile !== false && (url.startsWith('socket.io.js') || url.match(/\/socket\.io\.js(\?.*)?$/))) {
                        if (socketIoFile) {
                            res.contentType('text/javascript');
                            return res.status(200).send(socketIoFile);
                        } else {
                            try {
                                const dir = require.resolve('socket.io-client');
                                const fileDir = path.join(path.dirname(dir), '../dist/');
                                if (fs.existsSync(fileDir + 'socket.io.min.js')) {
                                    socketIoFile = fs.readFileSync(fileDir + 'socket.io.min.js');
                                } else {
                                    socketIoFile = fs.readFileSync(fileDir + 'socket.io.js');
                                }
                            } catch (e) {
                                try {
                                    socketIoFile = fs.readFileSync(__dirname + '/www/lib/js/socket.io.js');
                                } catch (e) {
                                    adapter.log.error('Cannot read socket.io.js: ' + e);
                                    socketIoFile = false;
                                }
                            }
                            if (socketIoFile) {
                                res.contentType('text/javascript');
                                return res.status(200).send(socketIoFile);
                            }
                        }
                    }

                    adapter.readFile(id, webByVersion[id] && versionPrefix ? url.substring(versionPrefix.length + 1) : url, {user: req.user ? 'system.user.' + req.user : settings.defaultUser, noFileCache: noFileCache}, (err, buffer, mimeType) => {
                        if (buffer === null || buffer === undefined || err) {
                            res.contentType('text/html');
                            res.status(404).send('File ' + escapeHtml(url) + ' not found: ' + escapeHtml(typeof err !== 'string' ? JSON.stringify(err) : err));
                        } else {
                            mimeType = mimeType || mime.lookup(url) || 'text/javascript';

                            // Store file in cache
                            if (settings.cache) {
                                cache[id + '/' + url] = {buffer, mimeType};
                            }

                            res.contentType(mimeType);
                            res.status(200).send(buffer);
                        }
                    });
                }
            }
        });
    }

    if (server.server) {
        return server;
    } else {
        return null;
    }
}