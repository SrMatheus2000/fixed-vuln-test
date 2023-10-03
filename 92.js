function set  (object, path, val, obj) {
  return !/__proto__/.test(path) && ((path = path.split ? path.split('.') : path.slice(0)).slice(0, -1).reduce(function (obj, p) {
    return obj[p] = obj[p] || {};
  }, obj = object)[path.pop()] = val), object;
}