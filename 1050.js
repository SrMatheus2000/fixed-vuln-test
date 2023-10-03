function unique_name_619 (request, next) {

    const response = request.response;

    Cors.headers(response);
    internals.content(response);
    internals.security(response);

    if (response.statusCode !== 304 &&
        (request.method === 'get' || request.method === 'head')) {

        if (response.headers.etag &&
            request.headers['if-none-match']) {

            // Strong verifier

            const ifNoneMatch = request.headers['if-none-match'].split(/\s*,\s*/);
            for (let i = 0; i < ifNoneMatch.length; ++i) {
                const etag = ifNoneMatch[i];
                if (etag === response.headers.etag) {
                    response.code(304);
                    break;
                }
                else if (response.settings.varyEtag) {
                    const etagBase = response.headers.etag.slice(0, -1);
                    if (etag === etagBase + '-gzip"' ||
                        etag === etagBase + '-deflate"') {

                        response.code(304);
                        break;
                    }
                }
            }
        }
        else {
            const ifModifiedSinceHeader = request.headers['if-modified-since'];
            const lastModifiedHeader = response.headers['last-modified'];

            if (ifModifiedSinceHeader &&
                lastModifiedHeader) {

                // Weak verifier

                const ifModifiedSince = internals.parseDate(ifModifiedSinceHeader);
                const lastModified = internals.parseDate(lastModifiedHeader);

                if (ifModifiedSince &&
                    lastModified &&
                    ifModifiedSince >= lastModified) {

                    response.code(304);
                }
            }
        }
    }

    internals.state(response, (err) => {

        if (err) {
            request._log(['state', 'response', 'error'], err);
            request._states = {};                                           // Clear broken state
            return next(err);
        }

        internals.cache(response);

        if (!response._isPayloadSupported()) {

            // Close unused file streams

            response._close();

            // Set empty stream

            response._payload = new internals.Empty();
            if (request.method !== 'head') {
                delete response.headers['content-length'];
            }

            return Auth.response(request, next);               // Must be last in case requires access to headers
        }

        response._marshal((err) => {

            if (err) {
                return next(Boom.wrap(err));
            }

            if (request.jsonp &&
                response._payload.jsonp) {

                response._header('content-type', 'text/javascript' + (response.settings.charset ? '; charset=' + response.settings.charset : ''));
                response._header('x-content-type-options', 'nosniff');
                response._payload.jsonp(request.jsonp);
            }

            if (response._payload.size &&
                typeof response._payload.size === 'function') {

                response._header('content-length', response._payload.size(), { override: false });
            }

            return Auth.response(request, next);               // Must be last in case requires access to headers
        });
    });
}