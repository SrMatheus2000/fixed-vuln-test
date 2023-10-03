function unique_name_484(postData, uid, callback) {
		if (!Array.isArray(postData) || !postData.length) {
			return callback(null, []);
		}
		var pids = postData.map(function(post) {
			return post && post.pid;
		});

		if (!Array.isArray(pids) || !pids.length) {
			return callback(null, []);
		}

		async.parallel({
			favourites: function(next) {
				favourites.getFavouritesByPostIDs(pids, uid, next);
			},
			voteData: function(next) {
				favourites.getVoteStatusByPostIDs(pids, uid, next);
			},
			userData: function(next) {
				var uids = [];

				for(var i=0; i<postData.length; ++i) {
					if (postData[i] && uids.indexOf(postData[i].uid) === -1) {
						uids.push(postData[i].uid);
					}
				}

				posts.getUserInfoForPosts(uids, uid, function(err, users) {
					if (err) {
						return next(err);
					}

					var userData = {};
					users.forEach(function(user, index) {
						userData[uids[index]] = user;
					});

					next(null, userData);
				});
			},
			editors: function(next) {
				var editors = [];
				for(var i=0; i<postData.length; ++i) {
					if (postData[i] && postData[i].editor && editors.indexOf(postData[i].editor) === -1) {
						editors.push(postData[i].editor);
					}
				}

				user.getMultipleUserFields(editors, ['uid', 'username', 'userslug'], function(err, editors) {
					if (err) {
						return next(err);
					}
					var editorData = {};
					editors.forEach(function(editor) {
						editorData[editor.uid] = editor;
					});
					next(null, editorData);
				});
			},
			privileges: function(next) {
				privileges.posts.get(pids, uid, next);
			}
		}, function(err, results) {
			if (err) {
				return callback(err);
			}

			postData.forEach(function(postObj, i) {
				if (postObj) {
					postObj.deleted = parseInt(postObj.deleted, 10) === 1;
					postObj.user = parseInt(postObj.uid, 10) ? results.userData[postObj.uid] : _.clone(results.userData[postObj.uid]);
					postObj.editor = postObj.editor ? results.editors[postObj.editor] : null;
					postObj.favourited = results.favourites[i];
					postObj.upvoted = results.voteData.upvotes[i];
					postObj.downvoted = results.voteData.downvotes[i];
					postObj.votes = postObj.votes || 0;
					postObj.display_moderator_tools = results.privileges[i].editable;
					postObj.display_move_tools = results.privileges[i].move && postObj.index !== 0;
					postObj.selfPost = parseInt(uid, 10) === parseInt(postObj.uid, 10);

					if(postObj.deleted && !results.privileges[i].view_deleted) {
						postObj.content = '[[topic:post_is_deleted]]';
					}

					// Username override for guests, if enabled
					if (parseInt(meta.config.allowGuestHandles, 10) === 1 && parseInt(postObj.uid, 10) === 0 && postObj.handle) {
						postObj.user.username = validator.escape(postObj.handle);
					}
				}
			});

			callback(null, postData);
		});
	}