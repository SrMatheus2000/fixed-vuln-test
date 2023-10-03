function unique_name_687(req, res) {

	req.options = res.options = {};
	res.req = req;
	req.res = res;

	if (F._length_wait)
		return F.response503(req, res);
	else if (!req.host) // HTTP 1.0 without host
		return res.throw400();

	var headers = req.headers;
	req.$protocol = ((req.connection && req.connection.encrypted) || ((headers['x-forwarded-proto'] || ['x-forwarded-protocol']) === 'https')) ? 'https' : 'http';

	var beg = 0;

	// Removes directory browsing
	for (var i = 0; i < req.url.length; i++) {
		if (req.url[i] === '.' && req.url[i + 1] === '/')
			beg = i + 1;
		else if (req.url[i] === '?')
			break;
	}

	if (beg)
		req.url = req.url.substring(beg);

	req.uri = framework_internal.parseURI(req);

	F.stats.request.request++;
	F.$events.request && EMIT('request', req, res);

	if (F._request_check_redirect) {
		var redirect = F.routes.redirects[req.$protocol + '://' + req.host];
		if (redirect) {
			F.stats.response.forward++;
			res.options.url = redirect.url + (redirect.path ? req.url : '');
			res.options.permanent = redirect.permanent;
			res.$redirect();
			return;
		}
	}

	req.path = framework_internal.routeSplit(req.uri.pathname);
	req.processing = 0;
	req.isAuthorized = true;
	req.xhr = headers['x-requested-with'] === 'XMLHttpRequest';
	res.success = false;
	req.user = req.session = null;
	req.isStaticFile = CONF.allow_static_files && U.isStaticFile(req.uri.pathname);

	if (req.isStaticFile)
		req.extension = U.getExtension(req.uri.pathname);
	else if (F.onLocale)
		req.$language = F.onLocale(req, res, req.isStaticFile);

	F.reqstats(true, true);

	if (F._length_request_middleware)
		async_middleware(0, req, res, F.routes.request, requestcontinue_middleware);
	else
		F.$requestcontinue(req, res, headers);
}