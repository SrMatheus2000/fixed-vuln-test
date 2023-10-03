function unique_name_399(problem_pattern, method) {
		if (typeof problem_pattern !== 'string' || !problem_pattern)
			return problem_pattern;

		var _s = _.parse_problem,
		/**
		 * gn: generate number
		 */
		gn = function(n, z) {
			/**
			 * z: can start with zero
			 */
			if (!z)
				n = n.replace(/\?/, function($0) {
					return 1 + Math.floor(Math.random() * 9);
				});
			return n.replace(/\?/g, function($0) {
				return Math.floor(Math.random() * 10);
			});
		}, gn2 = function(n) {
			return n.replace(
					/(\?*|0)\.(\?+)/g,
					function($0, $1, $2) {
						return ($1.indexOf('?') === -1 ? '0' : gn($1)) + '.'
								+ gn($2, 1);
					}).replace(/\?+/g, function($0) {
				return gn($0);
			});
		};

		if (false && !problem_pattern
		//
		.match(/^(((\?*|0)\.)?\?+|[+\-*\/]|\s){3,}$/))
			library_namespace.debug('No match: ' + problem_pattern);

		problem_pattern = problem_pattern.replace(/\[((\d\-\d|\d+)+)\]/g,
		//
		function($0, $1) {
			var n = $1.replace(/(\d)\-(\d)/g, function($0, $1, $2) {
				var i = Math.min($1, $2), n = '', M = Math.max($1, $2);
				for (; i < M; i++)
					n += i;
				return n;
			});
			return n.charAt(Math.floor(Math.random() * n.length));
		}).replace(/(\d)(\?+)/g, function($0, $1, $2) {
			return $1 + gn($2, 1);
		});

		problem_pattern = gn2(problem_pattern);

		// method === 1: 只是要取得亂數
		return method === 1 ? problem_pattern
		// method === 2: 取得整個數值的亂數
		: method === 2 ? problem_pattern.replace(/0+$|^0+/g, '') : _s
				.express(problem_pattern);
	}