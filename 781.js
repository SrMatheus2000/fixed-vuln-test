function unique_name_427 (path) {
    path = String(path);
    var last = path.replace(/^.*[/\\]/, '').toLowerCase();
    var ext = last.replace(/^.*\./, '').toLowerCase();

    var hasPath = last.length < path.length;
    var hasDot = ext.length < last.length - 1;

    return (hasDot || !hasPath) && this._types[ext] || null;
  }