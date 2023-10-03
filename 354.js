(req, res) => {

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
        }