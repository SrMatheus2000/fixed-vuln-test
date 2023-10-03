function unique_name_518(socketReq, fn, socket) {
	// Parse request as JSON
	try {
		socketReq = JSON.parse(socketReq);
	} catch(e) {
		var msg = "Invalid socket request! The following JSON could not be parsed :: "+socketReq;
		if (_.isFunction(fn)) return fn(msg);
		else return sails.log.error(msg);
	}

	if (!socketReq.url) {
		var msg = "No url provided in request: "+socketReq;
		if (_.isFunction(fn)) return fn(msg);
		else return sails.log.error(msg);
	}


	// Parse url for entity and action using routing table if possible
	var entityAction = Router.fetchRoute(socketReq.url,getVerb(socketReq));

	// If url is in routes table, explicitly define mapped route to entityAction
	var handlerFn;
	if(entityAction && _.isObject(entityAction)) {
		socketReq = _.extend(socketReq, entityAction);
		handlerFn = Router.handleRequest(entityAction);
	} else {
		handlerFn = Router.handleRequest();
	}

	// Retrieve session data from store
	// var sessionKey = 'sess:'+socket.handshake.sessionID; // redis seems to need this?
	var sessionKey = socket.handshake.sessionID;
	sails.log.verbose("sessionKey specified:",sessionKey);
	sails.config.session.store.get(sessionKey, function (err, sessionData) {
		if (err) return expressContext.res.send('Error retrieving session: ' + err, 500);
		if (!_.isObject(sessionData)) {
			return expressContext.res.send('Error retrieving session: ' + err, 500);
		}
		
		// Simulate Express/Connect request context
		var expressContext = exports.interpret(socketReq, fn, socket);

		// Add method to trigger a save() of the session data
		function SocketIOSession () {
			this.save = function (cb) {
				sails.config.session.store.set(sessionKey, expressContext.req.session, function (err) {
					if (err) {
						sails.log.error('Error encountered saving session:');
						sails.log.error(err);
					}
					if (cb) cb(err);
				});
			};
		};

		// Instantiate SocketIOSession
		expressContext.req.session = new SocketIOSession();

		// Provide access to session data in req.session
		_.extend(expressContext.req.session, sessionData);

		// Call handler action using the simulated express context
		handlerFn(expressContext.req, expressContext.res, function () {

			// Call next middleware
			_.isFunction(expressContext.next) && expressContext.next();
		});
	});
}