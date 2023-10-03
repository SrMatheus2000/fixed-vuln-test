function unique_name_144(repo, cb) {
	var self = this;
	var dir = this.checkoutDir(repo.organization, repo.name);
	repo.id = repo.commit + '.' + Date.now();
	var cmd = ['git', 'pull', 'file://' + path.resolve(self.repoDir, repo.organization, repo.name), encodeURIComponent(repo.branch)].join(' ');
	debug('Git.pull ' + dir + ': ' + cmd);
	child.exec(cmd, {
		cwd : dir
	}, function(err) {
		debug('Git.pull ' + dir + ' done: ' + err);
		if (err)
			return cb(err);
		cb(null);
	});
}