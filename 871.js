function unique_name_488(user) {

			if (req.query.from && req.query.from.match(/^(?!http|\/\/|javascript).+/)) {
				res.redirect(req.query.from);
			} else if ('string' == typeof keystone.get('signin redirect')) {
				res.redirect(keystone.get('signin redirect'));
			} else if ('function' == typeof keystone.get('signin redirect')) {
				keystone.get('signin redirect')(user, req, res);
			} else {
				res.redirect('/keystone');
			}

		}