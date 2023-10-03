function unique_name_87 (obj, key, value) {
  var o = obj;
  var keys = Array.isArray(key) ? key : key.split('.');

  for (var x = 1; x < keys.length; ++x) {
    var currentKey = keys[x];
    var lastKey = keys[x - 1];
    if (typeof currentKey === 'number') {
      if (!o[lastKey]) {
        o[lastKey] = [];
      }
      o = o[lastKey];
    } else if (typeof currentKey === 'string') {
      if (!o[lastKey]) {
        o[lastKey] = {};
      }
      o = o[lastKey];
    } else {
      throw new Error('Oopsy, key arrays should only be strings and numbers:', keys);
    }
  }

  o[keys[keys.length - 1]] = value;
  return obj;
}