function parse_URI(URI, options) {
	if (!URI
	// 不能用 instanceof String!
	|| typeof URI !== 'string')
		return;
	var href = URI, matched = href
			.match(/^([\w\d\-]{2,}:)?(\/\/)?(\/[A-Z]:|[^\/#?&\s:]+)([^\s:]*)$/i), tmp, path;
	if (!matched)
		return;

	library_namespace.debug('parse [' + URI + ']: ' + matched.join('<br />\n'),
			2);

	URI = library_namespace.is_WWW() ? {
		// protocol包含最後的':',search包含'?',hash包含'#'.
		// file|telnet|ftp|https
		protocol : location.protocol,
		hostname : location.hostname,
		port : location.port,
		host : location.host,
		// local file @ IE: C:\xx\xx\ff, others: /C:/xx/xx/ff
		pathname : location.pathname
	} : library_namespace.null_Object();
	URI.URI = href;

	tmp = matched[1] || options && options.protocol;
	if (tmp)
		URI.protocol = tmp;
	URI._protocol = URI.protocol.slice(0, -1);
	library_namespace.debug('protocol [' + URI._protocol + ']', 2);

	/**
	 * ** filename 可能歸至m[4]!<br />
	 * 判斷準則:<br />
	 * gsh.sdf.df#dhfjk filename|hostname<br />
	 * gsh.sdf.df/dhfjk hostname<br />
	 * gsh.sdf.df?dhfjk filename<br />
	 * gsh.sdf.df filename<br />
	 */
	href = matched[3];
	path = matched[4];
	if (href && !/^\/[A-Z]:$/i.test(href)
			&& (path.charAt(0) === '/' || /[@:]/.test(href))) {
		// 處理 username:password
		if (matched = href.match(/^([^@]*)@(.+)$/)) {
			tmp = matched[1].match(/^([^:]+)(:(.*))?$/);
			if (!tmp)
				return;
			URI.username = tmp[1];
			if (tmp[3])
				URI.password = tmp[3];
			href = matched[2];
		}

		// 處理 host
		if (matched = href.match(/^([^\/#?&\s:]+)(:(\d{1,5}))?$/)) {
			// host=hostname:port
			URI.host = URI.hostname = matched[1];
			if (matched[3])
				URI.port = parseInt(matched[3], 10);
			else if (tmp = {
				http : 80,
				ftp : 21
			}[URI._protocol])
				URI.host += ':' + (URI.port = tmp);
		} else
			return;

	} else {
		// test URI.protocol === 'file:'
		path = href + path;
		href = '';
	}
	if (!href)
		library_namespace.warn('將 [' + path + '] 當作 pathname!');
	library_namespace.debug('local file: [' + location.pathname + ']', 2);

	// NG: /^([^%]+|%[a-f\d]{2})+$/
	// prevent catastrophic backtracking. e.g., '.'.repeat(300)+'%'
	// Thanks for James Davis
	if (!/^(?:[^%]|%[a-f\d]{2})+$/i.test(path))
		library_namespace.warn('encoding error: [' + path + ']');

	library_namespace.debug('parse path: [' + path + ']', 2);
	if (path
			&& (matched = path
					.match(/^((.*\/)?([^\/#?]*))?(\?([^#]*))?(#(.*))?$/))) {
		// pathname={path}filename
		library_namespace.debug('pathname: [' + matched + ']', 2);
		// .path 會隨不同 OS 之 local file 表示法作變動!
		URI.path = /^\/[A-Z]:/i.test(URI.pathname = matched[1]) ? matched[2]
				.slice(1).replace(/\//g, '\\') : matched[2];
		URI.filename = matched[3];
		URI.search = matched[4];
		URI._search = parse_URI.parse_search(matched[5]);
		URI.hash = matched[6];
		URI._hash = matched[7];
	} else {
		if (!href)
			return;
		URI.path = URI.pathname.replace(/[^\/]+$/, '');
	}
	library_namespace.debug('path: [' + URI.path + ']', 2);

	// href=protocol:(//)?username:password@hostname:port/path/filename?search#hash
	URI.href = (URI.protocol ? URI.protocol + '//' : '')
			+ (URI.username ? URI.username
					+ (URI.password ? ':' + URI.password : '') + '@' : '')
			+ URI.host + URI.pathname + (URI.search || '') + (URI.hash || '');

	library_namespace.debug('href: [' + URI.href + ']', 2);
	return URI;
}