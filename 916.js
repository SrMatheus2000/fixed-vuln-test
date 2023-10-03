function unique_name_517(body, status) {
			// (session is saved automatically when responding)
			req.session.save(function (err) {
				if (err) {
					sails.log.error('Session could not be persisted:',err);
				}
				
				if (_.isFunction(socketIOCallback)) {
					socketIOCallback(body);
					return;
				}
				sails.log.error('Cannot call res.send(): invalid socket.io callback specified from client!');
			});
		}