function unique_name_295(options) {
    var request = options.request || defaultRequest; //overridable for tests
    var proxyAllDomains = options.proxyAllDomains;
    var proxyDomains = options.proxyableDomains || [];
    var proxyAuth = options.proxyAuth || {};
    var proxyPostSizeLimit = options.proxyPostSizeLimit || '102400';
    
    // If you change this, also change the same list in serverconfig.json.example.
    // This page is helpful: https://en.wikipedia.org/wiki/Reserved_IP_addresses
    var blacklistedAddresses = options.blacklistedAddresses || [
        // loopback addresses
        '127.0.0.0/8',
        '::1/128',
        // link local addresses
        '169.254.0.0/16',
        'fe80::/10',
        // private network addresses
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
        'fc00::/7',
        // other
        '0.0.0.0/8',
        '100.64.0.0/10',
        '192.0.0.0/24',
        '192.0.2.0/24',
        '198.18.0.0/15',
        '192.88.99.0/24',
        '198.51.100.0/24',
        '203.0.113.0/24',
        '224.0.0.0/4',
        '240.0.0.0/4',
        '255.255.255.255/32',
        '::/128',
        '2001:db8::/32',
        'ff00::/8'
    ];

    //Non CORS hosts and domains we proxy to
    function proxyAllowedHost(host) {
        // Exclude hosts that are really IP addresses and are in our blacklist.
        if (rangeCheck.inRange(host, blacklistedAddresses)) {
            return false;
        }

        if (proxyAllDomains) {
            return true;
        }

        host = host.toLowerCase();
        //check that host is from one of these domains
        for (var i = 0; i < proxyDomains.length; i++) {
            if (host.indexOf(proxyDomains[i], host.length - proxyDomains[i].length) !== -1) {
                return true;
            }
        }
        return false;
    }

    function doProxy(req, res, next, retryWithoutAuth, callback) {
        var remoteUrlString = req.url.substring(1);

        if (!remoteUrlString || remoteUrlString.length === 0) {
            return res.status(400).send('No url specified.');
        }

        // Does the proxy URL include a max age?
        var maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS;
        if (remoteUrlString[0] === '_') {
            var slashIndex = remoteUrlString.indexOf('/');
            if (slashIndex < 0) {
                return res.status(400).send('No url specified.');
            }

            var maxAgeString = remoteUrlString.substring(1, slashIndex);
            remoteUrlString = remoteUrlString.substring(slashIndex + 1);

            if (remoteUrlString.length === 0) {
                return res.status(400).send('No url specified.');
            }

            // Interpret the max age as a duration in Varnish notation.
            // https://www.varnish-cache.org/docs/trunk/reference/vcl.html#durations
            var parsedMaxAge = DURATION_REGEX.exec(maxAgeString);
            if (!parsedMaxAge || parsedMaxAge.length < 3) {
                return res.status(400).send('Invalid duration.');
            }

            var value = parseFloat(parsedMaxAge[1]);
            if (value !== value) {
                return res.status(400).send('Invalid duration.');
            }

            var unitConversion = DURATION_UNITS[parsedMaxAge[2]];
            if (!unitConversion) {
                return res.status(400).send('Invalid duration unit ' + parsedMaxAge[2]);
            }

            maxAgeSeconds = value * unitConversion;
        }

        // Add http:// if no protocol is specified.
        var protocolMatch = PROTOCOL_REGEX.exec(remoteUrlString);
        if (!protocolMatch || protocolMatch.length < 1) {
            remoteUrlString = 'http://' + remoteUrlString;
        } else {
            var matchedPart = protocolMatch[0];

            // If the protocol portion of the URL only has a single slash after it, the extra slash was probably stripped off by someone
            // along the way (NGINX will do this).  Add it back.
            if (remoteUrlString[matchedPart.length] !== '/') {
                remoteUrlString = matchedPart + '/' + remoteUrlString.substring(matchedPart.length);
            }
        }

        var remoteUrl = url.parse(remoteUrlString);

        // Copy the query string
        remoteUrl.search = url.parse(req.url).search;

        if (!remoteUrl.protocol) {
            remoteUrl.protocol = 'http:';
        }

        var proxy;
        if (options.upstreamProxy && !((options.bypassUpstreamProxyHosts || {})[remoteUrl.host])) {
            proxy = options.upstreamProxy;
        }

        // Are we allowed to proxy for this host?
        if (!proxyAllowedHost(remoteUrl.host)) {
            res.status(403).send('Host is not in list of allowed hosts: ' + remoteUrl.host);
            return;
        }

        // encoding : null means "body" passed to the callback will be raw bytes

        var proxiedRequest;
        req.on('close', function() {
            if (proxiedRequest) {
                proxiedRequest.abort();
            }
        });

        var filteredReqHeaders = filterHeaders(req.headers);
        if (filteredReqHeaders['x-forwarded-for']) {
            filteredReqHeaders['x-forwarded-for'] = filteredReqHeaders['x-forwarded-for'] + ', ' + req.connection.remoteAddress;
        } else {
            filteredReqHeaders['x-forwarded-for'] = req.connection.remoteAddress;
        }

        // Remove the Authorization header if we used it to authenticate the request to terriajs-server.
        if (options.basicAuthentication && options.basicAuthentication.username && options.basicAuthentication.password) {
            delete filteredReqHeaders['authorization'];
        }

        if (!retryWithoutAuth) {
            var authRequired = proxyAuth[remoteUrl.host];
            if (authRequired) {
                if (authRequired.authorization) {
                    // http basic auth.
                    if (!filteredReqHeaders['authorization']) {
                        filteredReqHeaders['authorization'] = authRequired.authorization;
                    }
                }
                if (authRequired.headers) {
                    // a mechanism to pass arbitrary headers.
                    authRequired.headers.forEach(function(header) {
                        filteredReqHeaders[header.name] = header.value;
                    });
                }
            }
        }

        proxiedRequest = callback(remoteUrl, filteredReqHeaders, proxy, maxAgeSeconds);
    }

    function buildReqHandler(httpVerb) {
        function handler(req, res, next) {
            return doProxy(req, res, next, req.retryWithoutAuth, function(remoteUrl, filteredRequestHeaders, proxy, maxAgeSeconds) {
                try {
                    var proxiedRequest = request({
                        method: httpVerb,
                        url: url.format(remoteUrl),
                        headers: filteredRequestHeaders,
                        encoding: null,
                        proxy: proxy,
                        body: req.body,
                        followRedirect: function(response) {
                            var location = response.headers.location;
                            if (location && location.length > 0) {
                                var parsed = url.parse(location);
                                if (proxyAllowedHost(parsed.host)) {
                                    // redirect is ok
                                    return true;
                                }
                            }
                            // redirect is forbidden
                            return false;
                        }
                    }).on('socket', function(socket) {
                        socket.once('lookup', function(err, address, family, host) {
                            if (rangeCheck.inRange(address, blacklistedAddresses)) {
                                res.status(403).send('IP address is not allowed: ' + address);
                                res.end();
                                proxiedRequest.abort();
                            }
                        });
                    }).on('error', function(err) {
                        console.error(err);

                        // Ideally we would return an error to the client, but if headers have already been sent,
                        // attempting to set a status code here will fail. So in that case, we'll just end the response,
                        // for lack of a better option.
                        if (res.headersSent) {
                            res.end();
                        } else {
                            res.status(500).send('Proxy error');
                        }
                    }).on('response', function(response) {
                        if (!req.retryWithoutAuth && response.statusCode === 403 && proxyAuth[remoteUrl.host]) {
                            // We automatically added an authentication header to this request (e.g. from proxyauth.json),
                            // but got back a 403, indicating our credentials didn't authorize access to this resource.
                            // Try again without credentials in order to give the user the opportunity to supply
                            // their own.
                            req.retryWithoutAuth = true;
                            return handler(req, res, next);
                        }

                        res.status(response.statusCode);
                        res.header(processHeaders(response.headers, maxAgeSeconds));
                        response.on('data', function(chunk) {
                            res.write(chunk);
                        });
                        response.on('end', function() {
                            res.end();
                        });
                    });
                } catch (e) {
                    console.error(e.stack);
                    res.status(500).send('Proxy error');
                }

                return proxiedRequest;
            });
        }

        return handler;
    }

    var router = express.Router();
    router.get('/*', buildReqHandler('GET'));
    router.post('/*', bodyParser.raw({type: function() { return true;}, limit: proxyPostSizeLimit}), buildReqHandler('POST'));

    return router;
}