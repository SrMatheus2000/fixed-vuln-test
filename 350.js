(req, res) => {
                let parts = decodeURIComponent(req.url).split('/');
                parts = parts.splice(2);
                const transport = parts.shift();
                let filename = parts.join('/');
                const config = adapter.systemConfig;
                // detect file log
                if (config && config.log && config.log.transport) {
                    if (config.log.transport.hasOwnProperty(transport) && config.log.transport[transport].type === 'file') {
                        let logFolder;
                        if (config.log.transport[transport].filename) {
                            parts = config.log.transport[transport].filename.replace(/\\/g, '/').split('/');
                            parts.pop();
                            logFolder = path.normalize(parts.join('/'));
                        } else {
                            logFolder = path.join(process.cwd(), 'log');
                        }

                        if (logFolder[0] !== '/' && logFolder[0] !== '\\' && !logFolder.match(/^[a-zA-Z]:/)) {
                            logFolder = path.normalize(path.join(__dirname + '/../../../', logFolder));
                        }

                        filename = path.normalize(path.join(logFolder, filename));

                        if (filename.startsWith(logFolder) && fs.existsSync(filename)) {
                            const stat = fs.lstatSync(filename);
                            if (stat.size > 2 * 1024 * 1024) {
                                res.sendFile(filename);
                            } else {
                                res.send(decorateLogFile(filename));
                            }

                            return;
                        }
                    }
                }
                res.status(404).send('File ' + escapeHtml(filename) + ' not found');
            }