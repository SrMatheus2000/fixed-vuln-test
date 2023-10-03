function client(opts) {
	if(this instanceof client === false) { return new client(opts); }

	this.opts = _.get(opts, {});
	this.opts.channels = this.opts.channels || [];
	this.opts.connection = this.opts.connection || {};
	this.opts.identity = this.opts.identity || {};
	this.opts.options = this.opts.options || {};

	this.clientId = _.get(this.opts.options.clientId, null);

	this.maxReconnectAttempts = _.get(this.opts.connection.maxReconnectAttempts, Infinity);
	this.maxReconnectInterval = _.get(this.opts.connection.maxReconnectInterval, 30000);
	this.reconnect = _.get(this.opts.connection.reconnect, false);
	this.reconnectDecay = _.get(this.opts.connection.reconnectDecay, 1.5);
	this.reconnectInterval = _.get(this.opts.connection.reconnectInterval, 1000);

	this.reconnecting = false;
	this.reconnections = 0;
	this.reconnectTimer = this.reconnectInterval;

	this.secure = _.get(
		this.opts.connection.secure,
		!this.opts.connection.server && !this.opts.connection.port
	);

	// Raw data and object for emote-sets..
	this.emotes = "";
	this.emotesets = {};

	this.channels = [];
	this.currentLatency = 0;
	this.globaluserstate = {};
	this.lastJoined = "";
	this.latency = new Date();
	this.moderators = {};
	this.pingLoop = null;
	this.pingTimeout = null;
	this.reason = "";
	this.username = "";
	this.userstate = {};
	this.wasCloseCalled = false;
	this.ws = null;

	// Create the logger..
	var level = "error";
	if(this.opts.options.debug) { level = "info"; }
	this.log = this.opts.logger || logger;

	try { logger.setLevel(level); } catch(e) {};

	// Format the channel names..
	this.opts.channels.forEach(function(part, index, theArray) {
		theArray[index] = _.channel(part);
	});

	eventEmitter.call(this);
	this.setMaxListeners(0);
}