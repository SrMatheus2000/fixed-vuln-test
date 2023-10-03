function unique_name_314 (path, o) {
  var parts = typeof path === 'string' ?
    path.split('.') :
    path;

  if (!Array.isArray(parts)) {
    throw new TypeError('Invalid `path`. Must be either string or array');
  }

  var len = parts.length;
  var cur = o;
  for (var i = 0; i < len; ++i) {
    if (cur == null || typeof cur !== 'object' || !(parts[i] in cur)) {
      return false;
    }
    // Disallow any updates to __proto__ or special properties.
    if (ignoreProperties.indexOf(parts[i]) !== -1) {
      return false;
    }
    if (i === len - 1) {
      delete cur[parts[i]];
      return true;
    }
    cur = cur instanceof Map ? cur.get(parts[i]) : cur[parts[i]];
  }

  return true;
}