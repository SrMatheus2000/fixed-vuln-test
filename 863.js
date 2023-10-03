function unique_name_480(data, callback) {
		var tid = data.tid,
			uid = data.uid,
			content = data.content,
			postData;

		async.waterfall([
			function(next) {
				async.parallel({
					exists: async.apply(Topics.exists, tid),
					locked: async.apply(Topics.isLocked, tid),
					canReply: async.apply(privileges.topics.can, 'topics:reply', tid, uid),
					isAdmin: async.apply(user.isAdministrator, uid)
				}, next);
			},
			function(results, next) {
				if (!results.exists) {
					return next(new Error('[[error:no-topic]]'));
				}
				if (results.locked && !results.isAdmin) {
					return next(new Error('[[error:topic-locked]]'));
				}
				if (!results.canReply) {
					return next(new Error('[[error:no-privileges]]'));
				}

				if (!guestHandleValid(data)) {
					return next(new Error('[[error:guest-handle-invalid]]'));
				}

				user.isReadyToPost(uid, next);
			},
			function(next) {
				plugins.fireHook('filter:topic.reply', data, next);
			},
			function(filteredData, next) {
				content = filteredData.content || data.content;
				if (content) {
					content = content.trim();
				}

				checkContentLength(content, next);
			},
			function(next) {
				posts.create({uid: uid, tid: tid, handle: data.handle, content: content, toPid: data.toPid, ip: data.req ? data.req.ip : null}, next);
			},
			function(data, next) {
				postData = data;
				Topics.markAsUnreadForAll(tid, next);
			},
			function(next) {
				Topics.markAsRead([tid], uid, next);
			},
			function(next) {
				async.parallel({
					userInfo: function(next) {
						posts.getUserInfoForPosts([postData.uid], uid, next);
					},
					topicInfo: function(next) {
						Topics.getTopicFields(tid, ['tid', 'title', 'slug', 'cid', 'postcount'], next);
					},
					settings: function(next) {
						user.getSettings(uid, next);
					},
					postIndex: function(next) {
						posts.getPidIndex(postData.pid, uid, next);
					},
					content: function(next) {
						postTools.parsePost(postData, next);
					}
				}, next);
			},
			function(results, next) {
				postData.user = results.userInfo[0];
				postData.topic = results.topicInfo;

				// Username override for guests, if enabled
				if (parseInt(meta.config.allowGuestHandles, 10) === 1 && parseInt(postData.uid, 10) === 0 && data.handle) {
					postData.user.username = validator.escape(data.handle);
				}

				if (results.settings.followTopicsOnReply) {
					Topics.follow(postData.tid, uid);
				}
				postData.index = results.postIndex - 1;
				postData.favourited = false;
				postData.votes = 0;
				postData.display_moderator_tools = true;
				postData.display_move_tools = true;
				postData.selfPost = false;
				postData.relativeTime = utils.toISOString(postData.timestamp);

				if (parseInt(uid, 10)) {
					Topics.notifyFollowers(postData, uid);
				}

				if (postData.index > 0) {
					plugins.fireHook('action:topic.reply', postData);
				}

				postData.topic.title = validator.escape(postData.topic.title);
				next(null, postData);
			}
		], callback);
	}