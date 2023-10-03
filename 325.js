function unique_name_164(req, res, headers) {

	if (!req || !res || res.headersSent || res.success)
		return;

	var tmp;

	// Validates if this request is the file (static file)
	if (req.isStaticFile) {

		tmp = F.temporary.shortcache[req.uri.pathname];

		if (!tmp) {
			// Stops path travelsation outside of "public" directory
			// A potential security issue
			for (var i = 0; i < req.uri.pathname.length - 1; i++) {
				var c = req.uri.pathname[i];
				var n = req.uri.pathname[i + 1];
				if ((c === '.' && (n === '/' || n === '%')) || (c === '%' && n === '2' && TRAVELCHARS[req.uri.pathname[i + 2]])) {
					F.temporary.shortcache[req.uri.pathname] = 2;
					req.$total_status(404);
					return;
				}
			}
			F.temporary.shortcache[req.uri.pathname] = 1;
		} else if (tmp === 2) {
			req.$total_status(404);
			return;
		}

		F.stats.request.file++;

		if (F._length_files)
			req.$total_file();
		else
			res.continue();

		return;
	}

	if (!PERF[req.method]) {
		req.$total_status(404);
		return;
	}

	if (req.uri.search) {
		tmp = F.temporary.shortcache[req.uri.search];

		if (!tmp) {
			tmp = 1;
			for (var i = 1; i < req.uri.search.length - 2; i++) {
				if (req.uri.search[i] === '%' && req.uri.search[i + 1] === '0' && req.uri.search[i + 2] === '0') {
					tmp = 2;
					break;
				}
			}
			F.temporary.shortcache[req.uri.search] = tmp;
		}

		if (tmp === 2) {
			req.$total_status(404);
			return;
		}
	}

	F.stats.request.web++;
	req.body = EMPTYOBJECT;
	req.files = EMPTYARRAY;
	req.buffer_exceeded = false;
	req.buffer_has = false;
	req.$flags = req.method[0] + req.method[1];

	var flags = [req.method.toLowerCase()];
	var multipart;

	if (F._request_check_mobile && req.mobile) {
		req.$flags += 'a';
		F.stats.request.mobile++;
	} else
		F.stats.request.desktop++;

	req.$protocol[5] && (req.$flags += req.$protocol[5]);
	req.$type = 0;
	flags.push(req.$protocol);

	var method = req.method;
	var first = method[0];

	if (first === 'P' || first === 'D') {
		multipart = req.headers['content-type'] || '';
		req.buffer_data = Buffer.alloc(0);
		var index = multipart.indexOf(';', 6);
		var tmp = multipart;
		if (index !== -1)
			tmp = tmp.substring(0, index);

		switch (tmp.substring(tmp.length - 4)) {
			case 'json':
				req.$flags += 'b';
				flags.push('json');
				req.$type = 1;
				multipart = '';
				break;
			case 'oded':
				req.$type = 3;
				multipart = '';
				break;
			case 'data':
				req.$flags += 'c';
				req.$upload = true;
				flags.push('upload');
				break;
			case '/xml':
				req.$flags += 'd';
				flags.push('xml');
				req.$type = 2;
				multipart = '';
				break;
			default:
				if (multipart) {
					// 'undefined' DATA
					multipart = '';
					flags.push('raw');
				} else {
					req.$type = 3;
					multipart = '';
				}
				break;
		}
	}

	if (headers.accept === 'text/event-stream') {
		req.$flags += 'g';
		flags.push('sse');
	}

	if (DEBUG) {
		req.$flags += 'h';
		flags.push('debug');
	}

	if (req.xhr) {
		F.stats.request.xhr++;
		req.$flags += 'i';
		flags.push('xhr');
	}

	if (F._request_check_robot && req.robot)
		req.$flags += 'j';

	if (F._request_check_referer) {
		var referer = headers['referer'];
		if (referer && referer.indexOf(headers['host']) !== -1) {
			req.$flags += 'k';
			flags.push('referer');
		}
	}

	req.flags = flags;

	F.$events['request-begin'] && EMIT('request-begin', req, res);
	F.$events.request_begin && EMIT('request_begin', req, res);

	var isCORS = (F._length_cors || F.routes.corsall) && req.headers.origin != null;

	switch (first) {
		case 'G':
			F.stats.request.get++;
			if (isCORS)
				F.$cors(req, res, cors_callback0);
			else
				req.$total_end();
			return;

		case 'O':
			F.stats.request.options++;
			if (isCORS)
				F.$cors(req, res, cors_callback0);
			else
				req.$total_end();
			return;

		case 'H':
			F.stats.request.head++;
			if (isCORS)
				F.$cors(req, res, cors_callback0);
			else
				req.$total_end();
			return;

		case 'D':
			F.stats.request['delete']++;
			if (isCORS)
				F.$cors(req, res, cors_callback1);
			else
				req.$total_urlencoded();
			return;

		case 'P':
			if (F._request_check_POST) {
				if (multipart) {
					if (isCORS)
						F.$cors(req, res, cors_callback_multipart, multipart);
					else
						req.$total_multipart(multipart);
				} else {
					if (method === 'PUT')
						F.stats.request.put++;
					else if (method === 'PATCH')
						F.stats.request.patch++;
					else
						F.stats.request.post++;
					if (isCORS)
						F.$cors(req, res, cors_callback1);
					else
						req.$total_urlencoded();
				}
				return;
			}
			break;
	}

	req.$total_status(404);
}