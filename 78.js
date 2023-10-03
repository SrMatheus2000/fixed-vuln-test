function unique_name_36(type, writer) {

	var self = this;

	!self.builder.length && self.minify();

	if (!type || !SUPPORTEDIMAGES[type])
		type = self.outputType;

	F.stats.performance.open++;
	var cmd = spawn(CMD_CONVERT[self.cmdarg], self.arg(self.filename ? wrap(self.filename) : '-', (type ? type + ':' : '') + '-'), SPAWN_OPT);
	if (self.currentStream) {
		if (self.currentStream instanceof Buffer)
			cmd.stdin.end(self.currentStream);
		else
			self.currentStream.pipe(cmd.stdin);
	}

	writer && writer(cmd.stdin);
	var middleware = middlewares[type];
	return middleware ? cmd.stdout.pipe(middleware()) : cmd.stdout;
}