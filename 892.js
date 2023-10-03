function find(req, res, callback) {
    var candidates = [];
    var ct = req.headers['content-type'] || DEF_CT;
    var cacheKey = req.method + req.url + req.version() + ct;
    var cacheVal;
    var neg;
    var params;
    var r;
    var reverse;
    var routes = this.routes[req.method] || [];
    var typed;
    var versioned;
    var maxV;

    if ((cacheVal = this.cache.get(cacheKey))) {
        res.methods = cacheVal.methods.slice();
        callback(null, cacheVal, shallowCopy(cacheVal.params));
        return;
    }

    for (var i = 0; i < routes.length; i++) {
        try {
            params = matchURL(routes[i].path, req);
        } catch (e) {
            this.log.trace({err: e}, 'error parsing URL');
            callback(new BadRequestError(e.message));
            return;
        }

        if (params === false) {
            continue;
        }

        reverse = this.reverse[routes[i].path.source];

        if (routes[i].types.length && req.isUpload()) {
            candidates.push({
                p: params,
                r: routes[i]
            });
            typed = true;
            continue;
        }

        // GH-283: we want to find the latest version for a given route,
        // not the first one.  However, if neither the client nor
        // server specified any version, we're done, because neither
        // cared
        if (routes[i].versions.length === 0 && req.version() === '*') {
            r = routes[i];
            break;
        }

        if (routes[i].versions.length > 0) {
            candidates.push({
                p: params,
                r: routes[i]
            });
            versioned = true;
        }
    }

    if (!r) {
        // If upload and typed
        if (typed) {
            var _t = ct.split(/\s*,\s*/);
            candidates = candidates.filter(function (c) {
                neg = new Negotiator({
                    headers: {
                        accept: c.r.types.join(', ')
                    }
                });
                var tmp = neg.preferredMediaType(_t);
                return (tmp && tmp.length);
            });

            // Pick the first one in case not versioned
            if (candidates.length) {
                r = candidates[0].r;
                params = candidates[0].p;
            }
        }

        if (versioned) {
            candidates.forEach(function (c) {
                var k = c.r.versions;
                var v = semver.maxSatisfying(k, req.version());

                if (v) {
                    if (!r || semver.gt(v, maxV)) {
                        r = c.r;
                        params = c.p;
                        maxV = v;
                    }
                }
            });
        }
    }

    // In order, we check if the route exists, in which case, we're good.
    // Otherwise we look to see if ver was set to false; that would tell us
    // we indeed did find a matching route (method+url), but the version
    // field didn't line up, so we return bad version.  If no route and no
    // version, we now need to go walk the reverse map and look at whether
    // we should return 405 or 404.  If it was an OPTIONS request, we need
    // to handle this having been a preflight request.
    if (params && r) {
        cacheVal = {
            methods: reverse,
            name: r.name,
            params: params,
            spec: r.spec
        };

        if (versioned) {
            req._matchedVersion = maxV;
        }

        this.cache.set(cacheKey, cacheVal);
        res.methods = reverse.slice();
        callback(null, cacheVal, shallowCopy(params));
        return;
    }

    if (typed) {
        callback(new UnsupportedMediaTypeError(ct));
        return;
    }

    if (versioned) {
        callback(new InvalidVersionError('%s is not supported by %s %s',
            req.version() || '?',
            req.method,
            req.path()));
        return;
    }

    //Checks if header is in cors.ALLOWED_HEADERS
    function inAllowedHeaders(header) {
        header = header.toLowerCase();
        return (cors.ALLOW_HEADERS.indexOf(header) !== -1);
    }

    // This is a very generic preflight handler - it does
    // not handle requiring authentication, nor does it do
    // any special checking for extra user headers. The
    // user will need to defined their own .opts handler to
    // do that
    function preflight(methods) {
        var headers = req.headers['access-control-request-headers'];
        var method = req.headers['access-control-request-method'];
        var origin = req.headers.origin;

        if (req.method !== 'OPTIONS' || !origin || !method ||
            methods.indexOf(method) === -1) {
            return (false);
        }

        // Last, check request-headers
        var ok = !headers || headers.split(/\s*,\s*/).every(inAllowedHeaders);

        if (!ok) {
            return (false);
        }

        // Verify the incoming origin against the whitelist. Pass the origin
        // through if there is a match.
        if (cors.matchOrigin(req, cors.origins)) {
            res.setHeader('Access-Control-Allow-Origin', origin);

            if (cors.credentials) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Access-Control-Allow-Methods',
            methods.join(', '));
        res.setHeader('Access-Control-Allow-Headers',
            cors.ALLOW_HEADERS.join(', '));
        res.setHeader('Access-Control-Max-Age', 3600);

        return (true);
    }

    // Check for 405 instead of 404
    var j;
    var urls = Object.keys(this.reverse);

    for (j = 0; j < urls.length; j++) {
        if (matchURL(new RegExp(urls[j]), req)) {
            res.methods = this.reverse[urls[j]].slice();
            res.setHeader('Allow', res.methods.join(', '));

            if (preflight(res.methods)) {
                callback(null, {name: 'preflight'});
                return;
            }
            var err = new MethodNotAllowedError('%s is not allowed',
                req.method);
            callback(err);
            return;
        }
    }

    // clean up the url in case of potential xss
    // https://github.com/restify/node-restify/issues/1018
    var cleanedUrl = url.parse(req.url).pathname;
    callback(new ResourceNotFoundError(
        '%s does not exist', cleanedUrl
    ));
}