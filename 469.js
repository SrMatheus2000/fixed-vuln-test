function unique_name_245 (req) {
	if (req.body && req.body[exports.TOKEN_KEY]) {
		return req.body[exports.TOKEN_KEY];
	} else if (req.query && req.query[exports.TOKEN_KEY]) {
		return req.query[exports.TOKEN_KEY];
	} else if (req.headers && req.headers[exports.XSRF_HEADER_KEY]) {
		return req.headers[exports.XSRF_HEADER_KEY];
	} else if (req.headers && req.headers[exports.CSRF_HEADER_KEY]) {
		return req.headers[exports.CSRF_HEADER_KEY];
	}
	// JM: If you think we should be checking the req.cookie here you don't understand CSRF.
	// On pages loaded from this app (on the same origin) JS will have access to the cookie and should add the CSRF value as one of the headers above.
	// Other pages, like those created by an attacker, can still create requests to this app (to which the browser will add cookie information) but,
	// since the calling page itself can't access the cookie, it will be unable to add the CSRF header, body or query param to the request.
	// The fact that we *don't* check the CSRF value that comes in with the cookie is what makes this CSRF implementation work.
	// See.. https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-header_token
	return '';
}