function username(cwd, verbose) {
  var repo = origin.sync(cwd);
  if (!repo && verbose) {
    console.error('  Can\'t calculate git-username, which probably means that\n  a git remote origin has not been defined.');
  }

  if (!repo) {
    return null;
  }

  var o = url.parse(repo);
  var path = o.path;

  if (path.length && path.charAt(0) === '/') {
    path = path.slice(1);
  } else {
    var match = /^git@[^:\s]+:(\S+)\//.exec(path);
    if (match && match[1]) {
      path = match[1];
    }
  }

  path = path.split('/')[0];
  return path;
}