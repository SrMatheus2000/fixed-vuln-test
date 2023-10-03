function unique_name_482(postObj, i) {
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
			}