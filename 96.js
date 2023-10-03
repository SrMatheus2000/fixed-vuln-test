function unique_name_45(params, callback) {
		var app = params.router,
			middleware = params.middleware,
			controllers = params.controllers;
			
		fs.readFile(path.resolve(__dirname, './public/templates/comments/comments.tpl'), function (err, data) {
			Comments.template = data.toString();
		});

		app.get('/comments/get/:id/:pagination?', middleware.applyCSRF, Comments.getCommentData);
		app.post('/comments/reply', middleware.applyCSRF, Comments.replyToComment);
		app.post('/comments/publish', middleware.applyCSRF, Comments.publishArticle);

		app.get('/admin/blog-comments', middleware.admin.buildHeader, renderAdmin);
		app.get('/api/admin/blog-comments', renderAdmin);

		callback();
	}