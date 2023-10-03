function unique_name_204(req, res, next) {
	var url = req.query.url,
		data = {
			url: validator.escape(url),
			title: meta.config.title,
			breadcrumbs: helpers.buildBreadcrumbs([{text: '[[notifications:outgoing_link]]'}])
		};

	if (url) {
		res.render('outgoing', data);
	} else {
		res.status(404).redirect(nconf.get('relative_path') + '/404');
	}
}